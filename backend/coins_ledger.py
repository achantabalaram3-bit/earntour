"""TallSkill Coins — separate, append-only ledger (Free World retries / early unlocks).

Coins are NOT tokens: tokens (db.wallets) are Challenge World entry units, coins
(db.coin_wallets + db.coin_ledger) are gameplay utility. Neither can be bought.
"""
from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

_indexes_ready = False


async def ensure_coin_indexes(db):
    global _indexes_ready
    if _indexes_ready:
        return
    await db.coin_wallets.create_index('user_id', unique=True)
    await db.coin_ledger.create_index('tx_id', unique=True)
    await db.coin_ledger.create_index([('user_id', 1), ('created_at', -1)])
    _indexes_ready = True


async def get_coin_wallet(db, user_id: str) -> dict:
    await ensure_coin_indexes(db)
    await db.coin_wallets.update_one(
        {'user_id': user_id},
        {'$setOnInsert': {'user_id': user_id, 'balance': 0, 'created_at': datetime.now(timezone.utc)}},
        upsert=True,
    )
    w = await db.coin_wallets.find_one({'user_id': user_id}, {'_id': 0})
    w['coins'] = int(w.get('balance') or 0)
    return w


async def apply_coin_tx_idempotent(
    db, user_id: str, kind: str, amount: float, note: str = '', ref_order_id: Optional[str] = None,
) -> dict:
    """Same contract as wallet_routes._apply_tx_idempotent, against the coin ledger."""
    if not ref_order_id:
        raise ValueError('ref_order_id is required for idempotent coin transactions')
    await get_coin_wallet(db, user_id)
    delta = int(round(float(amount)))
    tx_id = 'ctx_' + hashlib.sha256(f'{user_id}|{kind}|{ref_order_id}'.encode()).hexdigest()[:24]
    now = datetime.now(timezone.utc)
    entry = {'tx_id': tx_id, 'user_id': user_id, 'kind': kind, 'amount': delta, 'note': note,
             'ref_order_id': ref_order_id, 'status': 'pending', 'created_at': now}
    try:
        await db.coin_ledger.insert_one(dict(entry))
    except DuplicateKeyError:
        existing = await db.coin_ledger.find_one({'tx_id': tx_id}, {'_id': 0})
        if existing and existing.get('status') == 'applied':
            w = await get_coin_wallet(db, user_id)
            return {'balance': w['balance'], 'tx': existing, 'idempotent_replay': True}
        await db.coin_ledger.delete_one({'tx_id': tx_id, 'status': 'pending'})
        await db.coin_ledger.insert_one(dict(entry))

    flt = {'user_id': user_id}
    if delta < 0:
        flt['balance'] = {'$gte': -delta}
    w = await db.coin_wallets.find_one_and_update(flt, {'$inc': {'balance': delta}}, return_document=True)
    if not w:
        await db.coin_ledger.delete_one({'tx_id': tx_id})
        raise HTTPException(status_code=400, detail='Insufficient coin balance')
    await db.coin_ledger.update_one({'tx_id': tx_id}, {'$set': {'status': 'applied', 'balance_after': w['balance']}})
    tx = await db.coin_ledger.find_one({'tx_id': tx_id}, {'_id': 0})
    return {'balance': w['balance'], 'tx': tx, 'idempotent_replay': False}
