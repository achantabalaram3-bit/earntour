"""TallSkill Coins — public policy + prize schedule (read-only)."""
from fastapi import APIRouter, HTTPException

from tallskill_config import (
    COIN_POLICY, CURRENCY_CODE, CURRENCY_SYMBOL, PRIZE_SCHEDULE_STATUS,
    championship_rank_base_prizes, championship_schedule, championship_schedule_total,
)

router = APIRouter(prefix='/api/coins', tags=['coins'])
config_router = APIRouter(prefix='/api/public/tallskill', tags=['tallskill'])


@router.get('/policy')
async def coin_policy():
    return COIN_POLICY


@router.post('/rewarded-ad/claim')
async def rewarded_ad_claim():
    raise HTTPException(status_code=501, detail='Rewarded ads are not integrated yet.')


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
