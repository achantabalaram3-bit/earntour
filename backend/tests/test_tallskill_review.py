"""TallSkill India conversion review tests.

Covers:
- Money-in endpoints disabled (410) anonymous AND with admin bearer
- /api/orders/checkout rejects price>0 contests with 403 + 'free to play'
- Coins policy flags & inr_value
- Public championship prize schedule (100 rows, totals)
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
ADMIN_EMAIL = "admin@tallskill.dev"
ADMIN_PASSWORD = "Ts-MFZo4Q4b8VHpslmP"


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


# ---------- Orders checkout price>0 blocked ----------

def test_orders_checkout_price_gt0_blocked(admin_headers, mongo_db):
    cid = f"TEST_tcon_{uuid.uuid4().hex[:8]}"
    doc = {
        "contest_id": cid,
        "title": "TEST paid contest",
        "status": "live",
        "price": 1.0,
        "entry_mode": "random_tickets",
        "tickets_total": 10,
        "tickets_sold": 0,
    }
    mongo_db.contests.insert_one(doc)
    try:
        body = {"items": [{"contest_id": cid, "qty": 1, "skill_answer": "42"}]}
        r = requests.post(f"{API}/orders/checkout", json=body, headers=admin_headers, timeout=20)
        assert r.status_code == 403, f"expected 403 got {r.status_code} {r.text[:300]}"
        detail = (r.json().get("detail") or "").lower()
        assert "free to play" in detail or "tallskill is free" in detail, f"detail missing marker: {detail}"
    finally:
        mongo_db.contests.delete_one({"contest_id": cid})


# ---------- Coin policy ----------

def test_coin_policy_flags_false():
    r = requests.get(f"{API}/coins/policy", timeout=20)
    assert r.status_code == 200
    p = r.json()
    for k in ("purchasable", "sellable", "transferable", "withdrawable", "cash_exchangeable"):
        assert p[k] is False, f"{k} should be False, got {p[k]}"
    assert p["inr_value"] is None


# ---------- Public prize schedule ----------

def test_public_prize_schedule():
    r = requests.get(f"{API}/public/tallskill/championship-prizes", timeout=20)
    assert r.status_code == 200
    d = r.json()
    assert d["currency"] == "INR"
    assert d["total"] == 2575000
    sched = d["schedule"]
    assert len(sched) == 100
    # verify rows for n=1, 2, 100
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
        assert amt == 1000 + (n - 1) * 500, f"stage {n} amount {amt} != {1000 + (n-1)*500}"
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
