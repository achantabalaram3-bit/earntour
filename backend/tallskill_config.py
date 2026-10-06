"""TallSkill India — single source of truth for currency, prize schedule and coin rules."""
from __future__ import annotations

CURRENCY_CODE = "INR"
CURRENCY_SYMBOL = "₹"
CURRENCY_LOCALE = "en-IN"

# Money-in is permanently disabled for TallSkill India (no deposits, no paid entry).
MONEY_IN_ENABLED = False
MONEY_IN_DISABLED_DETAIL = (
    "TallSkill is free to play. Deposits, top-ups, coin purchases and paid entry are not available."
)

# Championship prize schedule: Prize(n) = 1000 + ((n - 1) * 500) INR.
CHAMPIONSHIP_COUNT = 100
CHAMPIONSHIP_BASE_PRIZE_INR = 1000
CHAMPIONSHIP_PRIZE_STEP_INR = 500

# Share of each championship prize per final rank (sums to 1.0). Pending business approval.
CHAMPIONSHIP_RANK_SHARES = {1: 0.50, 2: 0.20, 3: 0.15, 4: 0.10, 5: 0.05}

# Configured schedule only — NOT a published/promised prize fund until launch approval.
PRIZE_SCHEDULE_STATUS = "pending_business_legal_approval"


def championship_prize(n: int) -> int:
    if n < 1 or n > CHAMPIONSHIP_COUNT:
        raise ValueError(f"Championship must be 1..{CHAMPIONSHIP_COUNT}")
    return CHAMPIONSHIP_BASE_PRIZE_INR + ((n - 1) * CHAMPIONSHIP_PRIZE_STEP_INR)


def championship_multiplier(n: int) -> float:
    return championship_prize(n) / CHAMPIONSHIP_BASE_PRIZE_INR


def championship_rank_base_prizes() -> dict[int, int]:
    return {rank: int(round(CHAMPIONSHIP_BASE_PRIZE_INR * share)) for rank, share in CHAMPIONSHIP_RANK_SHARES.items()}


def championship_schedule() -> list[dict]:
    return [{"championship": n, "prize": championship_prize(n), "currency": CURRENCY_CODE} for n in range(1, CHAMPIONSHIP_COUNT + 1)]


def championship_schedule_total() -> int:
    return sum(championship_prize(n) for n in range(1, CHAMPIONSHIP_COUNT + 1))


# TallSkill Coins — in-app, non-monetary units.
COIN_POLICY = {
    "name": "TallSkill Coins",
    "purchasable": False,
    "sellable": False,
    "transferable": False,
    "withdrawable": False,
    "cash_exchangeable": False,
    "inr_value": None,
    "earn_sources": ["rewarded_ad", "gameplay_reward", "promotional_reward"],
    "rewarded_ads_status": "not_integrated",
}
