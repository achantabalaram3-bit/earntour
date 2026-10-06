"""Verified rewarded-ad crediting: provider callback → verification → reward ledger → token/coin credit.

No provider is configured yet, so no reward can be credited. Nothing here trusts a
client-side "ad watched" flag; only a registered provider's server-side verification
can produce a VerifiedAdReward.
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

from pymongo.errors import DuplicateKeyError

from coins_ledger import apply_coin_tx_idempotent
from services.rewarded_ads import VerifiedAdReward

DAILY_REWARD_CAP = int(os.environ.get('AD_REWARD_DAILY_CAP', '20'))
VELOCITY_WINDOW_MIN = int(os.environ.get('AD_REWARD_VELOCITY_WINDOW_MIN', '10'))
VELOCITY_MAX_IN_WINDOW = int(os.environ.get('AD_REWARD_VELOCITY_MAX', '5'))

_indexes_ready = False


async def ensure_reward_indexes(db):
    global _indexes_ready
    if _indexes_ready:
        return
    # (provider, transaction_id) is the replay/duplicate guard.
    await db.ad_reward_events.create_index([('provider', 1), ('transaction_id', 1)], unique=True)
    await db.ad_reward_events.create_index([('user_id', 1), ('verified_at', -1)])
    await db.reward_flags.create_index([('user_id', 1), ('created_at', -1)])
    _indexes_ready = True


async def _flag(db, user_id: str, reason: str, meta: dict):
    # Flags are for human review only; never auto-ban on a single signal.
    await db.reward_flags.insert_one({'user_id': user_id, 'reason': reason, 'meta': meta,
                                      'status': 'open', 'created_at': datetime.now(timezone.utc)})


async def credit_verified_reward(db, reward: VerifiedAdReward, reward_type: str = 'token') -> dict:
    """Record a provider-verified ad event exactly once and credit `reward.coins` units."""
    from routers.wallet_routes import _apply_tx_idempotent

    await ensure_reward_indexes(db)
    now = datetime.now(timezone.utc)
    event = {
        'event_id': f'{reward.provider}:{reward.transaction_id}',
        'provider': reward.provider,
        'transaction_id': reward.transaction_id,
        'user_id': reward.user_id,
        'placement': reward.placement,
        'reward_type': reward_type,
        'amount': reward.coins,
        'verification_status': 'verified',
        'credit_status': 'pending',
        'verified_at': reward.verified_at,
        'received_at': now,
    }
    try:
        await db.ad_reward_events.insert_one(dict(event))
    except DuplicateKeyError:
        return {'credited': False, 'reason': 'duplicate_event', 'event_id': event['event_id']}

    day_count = await db.ad_reward_events.count_documents(
        {'user_id': reward.user_id, 'credit_status': 'credited', 'received_at': {'$gte': now - timedelta(days=1)}})
    if day_count >= DAILY_REWARD_CAP:
        await db.ad_reward_events.update_one({'event_id': event['event_id']}, {'$set': {'credit_status': 'capped'}})
        await _flag(db, reward.user_id, 'daily_cap_reached', {'count': day_count})
        return {'credited': False, 'reason': 'daily_cap', 'event_id': event['event_id']}

    burst = await db.ad_reward_events.count_documents(
        {'user_id': reward.user_id, 'received_at': {'$gte': now - timedelta(minutes=VELOCITY_WINDOW_MIN)}})
    if burst > VELOCITY_MAX_IN_WINDOW:
        await _flag(db, reward.user_id, 'reward_velocity', {'events_in_window': burst, 'window_min': VELOCITY_WINDOW_MIN})

    ref = f"ad_reward:{event['event_id']}"
    if reward_type == 'coin':
        await apply_coin_tx_idempotent(db, reward.user_id, 'ad_reward', reward.coins, note='Rewarded ad', ref_order_id=ref)
    else:
        await _apply_tx_idempotent(db, reward.user_id, 'ad_reward', float(reward.coins), note='Rewarded ad', ref_order_id=ref)
    await db.ad_reward_events.update_one({'event_id': event['event_id']}, {'$set': {'credit_status': 'credited'}})
    return {'credited': True, 'event_id': event['event_id']}
