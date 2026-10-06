"""TallSkill Tokens & Coins — balances, policy, prize schedule and rewarded-ad callback."""
from fastapi import APIRouter, HTTPException, Request

from auth import get_current_user
from coins_ledger import get_coin_wallet
from deps import get_db
from services.ad_rewards import credit_verified_reward
from services.rewarded_ads import RewardedAdClaim, get_provider
from tallskill_config import (
    COIN_POLICY, CURRENCY_CODE, CURRENCY_SYMBOL, PRIZE_SCHEDULE_STATUS, TOKEN_POLICY,
    championship_rank_base_prizes, championship_schedule, championship_schedule_total,
)

router = APIRouter(prefix='/api/coins', tags=['coins'])
rewards_router = APIRouter(prefix='/api/rewards', tags=['rewards'])
config_router = APIRouter(prefix='/api/public/tallskill', tags=['tallskill'])


@router.get('/policy')
async def coin_policy():
    return COIN_POLICY


@router.get('/me')
async def my_coins(request: Request):
    user = await get_current_user(request)
    return await get_coin_wallet(get_db(), user['user_id'])


@router.get('/transactions')
async def my_coin_txs(request: Request, limit: int = 50):
    user = await get_current_user(request)
    limit = max(1, min(limit, 200))
    docs = await get_db().coin_ledger.find({'user_id': user['user_id'], 'status': 'applied'}, {'_id': 0}).sort('created_at', -1).to_list(limit)
    return {'transactions': docs}


@rewards_router.get('/token-policy')
async def token_policy():
    return TOKEN_POLICY


@rewards_router.post('/rewarded-ad/claim')
async def rewarded_ad_claim(claim: RewardedAdClaim, request: Request):
    """Client hint after an ad. Never credits by itself; only a configured provider's verification can."""
    user = await get_current_user(request)
    provider = get_provider(claim.provider)
    if not provider:
        raise HTTPException(status_code=503, detail='No rewarded-ad provider is configured yet.')
    reward = await provider.verify(user['user_id'], claim)
    if not reward:
        raise HTTPException(status_code=400, detail='Ad reward could not be verified.')
    return await credit_verified_reward(get_db(), reward)


@rewards_router.api_route('/ad-callback/{provider_name}', methods=['GET', 'POST'])
async def rewarded_ad_server_callback(provider_name: str):
    """Server-to-server verification (SSV) endpoint. Wired to a provider once one is selected."""
    if not get_provider(provider_name):
        raise HTTPException(status_code=503, detail='No rewarded-ad provider is configured yet.')
    raise HTTPException(status_code=501, detail='Provider callback verification not implemented yet.')


@config_router.get('/championship-prizes')
async def championship_prizes():
    return {
        'currency': CURRENCY_CODE,
        'symbol': CURRENCY_SYMBOL,
        'status': PRIZE_SCHEDULE_STATUS,
        'rank_base_prizes': championship_rank_base_prizes(),
        'total': championship_schedule_total(),
        'schedule': championship_schedule(),
    }
