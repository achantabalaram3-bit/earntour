"""TallSkill India: money-in endpoints must be unreachable and the prize schedule authoritative."""
import os

import requests

from tallskill_config import championship_prize, championship_schedule_total


def _base():
    v = os.environ.get("REACT_APP_BACKEND_URL")
    if not v:
        for line in open("/app/frontend/.env"):
            if line.startswith("REACT_APP_BACKEND_URL="):
                v = line.split("=", 1)[1].strip()
    return v.rstrip("/") + "/api"


API = _base()
DISABLED = [
    ("post", "/payments/wallet-topup/checkout", {"lookup_key": "wallet_topup_10", "origin_url": "x"}),
    ("post", "/payments/wallet-topup/custom", {"amount": 100, "origin_url": "x"}),
    ("get", "/payments/status/cs_test_123", None),
    ("post", "/stripe/webhook", {}),
    ("post", "/wallet/topup", {"amount": 100}),
]


def test_prize_formula():
    assert championship_prize(1) == 1000
    assert championship_prize(2) == 1500
    assert championship_prize(3) == 2000
    assert championship_prize(100) == 50500
    assert championship_schedule_total() == 2575000


def test_money_in_endpoints_gone_anonymous():
    for method, path, body in DISABLED:
        r = getattr(requests, method)(API + path, json=body, timeout=20)
        assert r.status_code == 410, (path, r.status_code, r.text)


def test_coin_policy():
    r = requests.get(API + "/coins/policy", timeout=20)
    assert r.status_code == 200
    p = r.json()
    for k in ("purchasable", "sellable", "transferable", "withdrawable", "cash_exchangeable"):
        assert p[k] is False
    assert p["inr_value"] is None


def test_public_prize_schedule():
    r = requests.get(API + "/public/tallskill/championship-prizes", timeout=20)
    d = r.json()
    assert d["currency"] == "INR" and d["total"] == 2575000 and len(d["schedule"]) == 100


def test_unauthenticated_db_probe_removed():
    assert requests.get(API + "/diagnostics/find-authorized-db", timeout=20).status_code == 404
    assert requests.get(API + "/diagnostics/db", timeout=20).status_code in (401, 403)
