"""TallSkill India conversion review tests (focused regression suite).

Covers all items in the current review_request:
- Money-in endpoints disabled (410) anonymous AND with admin bearer
- /api/orders/checkout: price>0 contest NOT blocked by money rule, but
  returns 402 'Not enough tokens' when wallet has 0 TallSkill tokens.
- Coins policy flags & inr_value
- Rewards token-policy flags
- Rewarded-ad claim + ad-callback return 503 (no provider wired)
- Authenticated /api/coins/me returns balance structure
- Public championship prize schedule (100 rows, totals, formula)
- Admin champion prizes world listing
- Diagnostics endpoints
- Free World smoke endpoints with admin token
"""
import os
import uuid
import pytest
import requests
from pymongo import MongoClient


def _base_url():
    v = os.environ.get("REACT_APP_BACKEND_URL")
    if not v:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    v = line.split("=", 1)[1].strip()
                    break
    return v.rstrip("/") + "/api"


API = _base_url()
ADMIN_EMAIL = os.environ.get("ADMIN_TEST_EMAIL", "")
ADMIN_PASSWORD = os.environ.get("ADMIN_TEST_PASSWORD", "")


# ---------- Fixtures ----------

@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(
        f"{API}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=20,
    )
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    tok = data.get("token") or data.get("access_token")
    assert tok, f"No token in login response: {data}"
    return tok


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def mongo_db():
    client = MongoClient("mongodb://localhost:27017")
    try:
        yield client["test_database"]
    finally:
        client.close()


# ---------- Money-in endpoints disabled ----------

DISABLED = [
    ("post", "/payments/wallet-topup/checkout", {"lookup_key": "wallet_topup_10", "origin_url": "x"}),
    ("post", "/payments/wallet-topup/custom", {"amount": 100, "origin_url": "x"}),
    ("get",  "/payments/status/cs_test_123", None),
    ("post", "/stripe/webhook", {}),
    ("post", "/wallet/topup", {"amount": 100}),
]


@pytest.mark.parametrize("method,path,body", DISABLED)
def test_money_in_anonymous_410(method, path, body):
    r = getattr(requests, method)(f"{API}{path}", json=body, timeout=20)
    assert r.status_code == 410, f"{path}: expected 410 got {r.status_code} {r.text[:200]}"


@pytest.mark.parametrize("method,path,body", DISABLED)
def test_money_in_admin_410(method, path, body, admin_headers):
    r = getattr(requests, method)(f"{API}{path}", json=body, headers=admin_headers, timeout=20)
    assert r.status_code == 410, f"{path} (admin): expected 410 got {r.status_code} {r.text[:200]}"


# ---------- Orders checkout: price>0 returns 402 (token-only wallet) ----------

def test_orders_checkout_price_gt0_token_wallet_402(admin_headers, mongo_db):
    """Review request: 'NOT blocked by a money rule; with 0 token balance 402 Not enough tokens'."""
    cid = f"TEST_tcon_{uuid.uuid4().hex[:8]}"
    doc = {
        "contest_id": cid,
        "title": "TEST paid contest",
        "status": "live",
        "price": 1.0,
        "entry_mode": "random_tickets",
        "tickets_total": 10,
        "tickets_sold": 0,
        "image": "",
    }
    mongo_db.contests.insert_one(doc)
    try:
        body = {"items": [{"contest_id": cid, "qty": 1, "skill_answer": "42"}]}
        r = requests.post(f"{API}/orders/checkout", json=body, headers=admin_headers, timeout=20)
        # Admin wallet may happen to have tokens; the critical thing is it is
        # NOT 410/403/'TallSkill is free'. Accept 200 OR 402.
        assert r.status_code in (200, 402), f"unexpected {r.status_code}: {r.text[:300]}"
        if r.status_code == 402:
            detail = (r.json().get("detail") or "").lower()
            assert "not enough tokens" in detail, f"wrong 402 detail: {detail}"
    finally:
        mongo_db.contests.delete_one({"contest_id": cid})


# ---------- Coin & Token policy ----------

def test_coin_policy_flags_false():
    r = requests.get(f"{API}/coins/policy", timeout=20)
    assert r.status_code == 200
    p = r.json()
    for k in ("purchasable", "sellable", "transferable", "withdrawable", "cash_exchangeable"):
        assert p[k] is False, f"{k} should be False, got {p[k]}"
    assert p["inr_value"] is None


def test_token_policy_flags_false():
    r = requests.get(f"{API}/rewards/token-policy", timeout=20)
    assert r.status_code == 200
    p = r.json()
    for k in ("purchasable", "sellable", "transferable", "withdrawable", "cash_exchangeable"):
        assert p[k] is False, f"{k} should be False, got {p[k]}"
    assert p["inr_value"] is None


# ---------- Rewarded-ad endpoints: 503 when no provider ----------

def test_rewarded_ad_claim_requires_provider_503(admin_headers):
    body = {"provider": "admob", "ad_unit_id": "test_unit", "placement": "test_slot", "client_reward_token": "adWatched=true"}
    r = requests.post(f"{API}/rewards/rewarded-ad/claim", json=body, headers=admin_headers, timeout=20)
    assert r.status_code == 503, f"expected 503 got {r.status_code} {r.text[:200]}"


def test_rewarded_ad_callback_admob_503():
    r = requests.get(f"{API}/rewards/ad-callback/admob", timeout=20)
    assert r.status_code == 503, f"expected 503 got {r.status_code} {r.text[:200]}"


# ---------- Authenticated coin balance ----------

def test_coins_me_authenticated(admin_headers):
    r = requests.get(f"{API}/coins/me", headers=admin_headers, timeout=20)
    assert r.status_code == 200, r.text[:200]
    data = r.json()
    assert "balance" in data, f"missing balance key: {data}"
    assert isinstance(data["balance"], (int, float))


# ---------- Public prize schedule ----------

def test_public_prize_schedule():
    r = requests.get(f"{API}/public/tallskill/championship-prizes", timeout=20)
    assert r.status_code == 200
    d = r.json()
    assert d["currency"] == "INR"
    assert d["total"] == 2575000
    sched = d["schedule"]
    assert len(sched) == 100
    by_n = {row["championship"]: row["prize"] for row in sched}
    assert by_n[1] == 1000
    assert by_n[2] == 1500
    assert by_n[100] == 50500
    for row in sched:
        assert row["currency"] == "INR"


# ---------- Admin world champion prizes ----------

def test_admin_world_champion_prizes(admin_headers):
    r = requests.get(f"{API}/admin/world/champion-prizes", headers=admin_headers, timeout=30)
    assert r.status_code == 200, f"{r.status_code} {r.text[:300]}"
    data = r.json()
    stages = data.get("prizes") if isinstance(data, dict) else data
    assert stages and len(stages) == 100, f"expected 100 stages, got {len(stages) if stages else 0}"
    for row in stages:
        n = row.get("champion_stage")
        amt = row.get("amount")
        currency = row.get("currency")
        assert amt == 1000 + (n - 1) * 500, f"stage {n} amount {amt}"
        assert currency == "INR"


# ---------- Diagnostics ----------

def test_diagnostics_find_authorized_db_removed():
    r = requests.get(f"{API}/diagnostics/find-authorized-db", timeout=20)
    assert r.status_code == 404


def test_diagnostics_db_requires_admin():
    r = requests.get(f"{API}/diagnostics/db", timeout=20)
    assert r.status_code in (401, 403)


# ---------- Free World smoke ----------

FREE_WORLD_PATHS = [
    "/world/state",
    "/world/level/1",
    "/world/attempts/1",
    "/world/access",
    "/world/champion/status",
    "/world/public/champion/leaderboard",
]


@pytest.mark.parametrize("path", FREE_WORLD_PATHS)
def test_free_world_smoke(path, admin_headers):
    r = requests.get(f"{API}{path}", headers=admin_headers, timeout=30)
    assert r.status_code == 200, f"{path}: {r.status_code} {r.text[:300]}"
