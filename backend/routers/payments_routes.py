"""TallSkill India — money-in is disabled.

The former Stripe wallet top-up endpoints are kept as explicit 410 responses so
old clients get a clear answer and nothing can create a payment session.
Historical `payment_transactions` documents are left untouched.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from tallskill_config import MONEY_IN_DISABLED_DETAIL

payments_router = APIRouter(prefix='/api', tags=['payments'])


def _money_in_disabled():
    raise HTTPException(status_code=410, detail=MONEY_IN_DISABLED_DETAIL)


@payments_router.post('/payments/wallet-topup/checkout')
async def create_topup_checkout():
    _money_in_disabled()


@payments_router.post('/payments/wallet-topup/custom')
async def create_custom_topup():
    _money_in_disabled()


@payments_router.get('/payments/status/{session_id}')
async def get_status(session_id: str):
    _money_in_disabled()


@payments_router.post('/stripe/webhook')
async def stripe_webhook():
    _money_in_disabled()
