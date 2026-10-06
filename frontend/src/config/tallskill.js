// TallSkill India — single source of truth for product rules on the frontend.
// Mirrors backend/tallskill_config.py. Values are a configured schedule pending launch approval.
export const FEATURES = {
  moneyIn: false,
  paidLeagues: false,
  rewardedAds: false,
};

export const MONEY_IN_DISABLED_MESSAGE =
  'TallSkill is free to play. Deposits, top-ups, coin purchases and paid entry are not available.';

export const WORLD_TIMEZONE = process.env.REACT_APP_WORLD_TIMEZONE || 'Asia/Kolkata';
export const WORLD_TIMEZONE_LABEL = WORLD_TIMEZONE === 'Asia/Kolkata' ? 'India Standard Time' : WORLD_TIMEZONE;

export const CHAMPIONSHIP_COUNT = 100;
export const CHAMPIONSHIP_BASE_PRIZE = 1000;
export const CHAMPIONSHIP_PRIZE_STEP = 500;
export const CHAMPIONSHIP_RANK_SHARES = { 1: 0.5, 2: 0.2, 3: 0.15, 4: 0.1, 5: 0.05 };
export const PRIZE_SCHEDULE_STATUS = 'pending_business_legal_approval';

/** Prize(n) = ₹1,000 + ((n − 1) × ₹500) */
export function championshipPrize(n) {
  const c = Math.min(Math.max(1, Math.round(Number(n) || 1)), CHAMPIONSHIP_COUNT);
  return CHAMPIONSHIP_BASE_PRIZE + (c - 1) * CHAMPIONSHIP_PRIZE_STEP;
}

export const championshipMultiplier = (n) => championshipPrize(n) / CHAMPIONSHIP_BASE_PRIZE;

export const rankBasePrize = (rank) => Math.round(CHAMPIONSHIP_BASE_PRIZE * (CHAMPIONSHIP_RANK_SHARES[rank] || 0));

export const CHAMPIONSHIP_SCHEDULE_TOTAL = Array.from(
  { length: CHAMPIONSHIP_COUNT },
  (_, i) => championshipPrize(i + 1),
).reduce((a, b) => a + b, 0);

export const COIN_POLICY = {
  name: 'TallSkill Coins',
  purchasable: false,
  sellable: false,
  transferable: false,
  withdrawable: false,
  cashExchangeable: false,
  inrValue: null,
};
