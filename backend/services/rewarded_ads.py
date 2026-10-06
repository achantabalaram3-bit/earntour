"""Rewarded-ad interface for future TallSkill Coin earning. No provider is integrated yet."""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional, Protocol

from pydantic import BaseModel, Field

RewardSource = Literal["rewarded_ad", "gameplay_reward", "promotional_reward"]


class RewardedAdClaim(BaseModel):
    """Client-reported ad completion. Never trusted until verified server-side (SSV)."""
    provider: str
    ad_unit_id: str
    placement: str
    client_reward_token: str
    platform: Literal["android", "web"] = "android"


class VerifiedAdReward(BaseModel):
    provider: str
    transaction_id: str
    user_id: str
    placement: str
    coins: int = Field(ge=0)
    verified_at: datetime


class CoinLedgerEntry(BaseModel):
    """Shape for the future `coin_ledger` collection (append-only, unique on source_ref)."""
    entry_id: str
    user_id: str
    source: RewardSource
    source_ref: str
    coins: int
    created_at: datetime
    note: Optional[str] = None


class RewardedAdProvider(Protocol):
    name: str

    async def verify(self, user_id: str, claim: RewardedAdClaim) -> Optional[VerifiedAdReward]:
        ...


_PROVIDERS: dict[str, RewardedAdProvider] = {}


def register_provider(provider: RewardedAdProvider) -> None:
    _PROVIDERS[provider.name] = provider


def get_provider(name: str) -> Optional[RewardedAdProvider]:
    return _PROVIDERS.get(name)
