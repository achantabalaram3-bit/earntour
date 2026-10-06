import { formatINR } from './currency';

// `gbp` name retained for import compatibility; it now formats INR.
export const inr = (n) => formatINR(n);
export const gbp = inr;

const unit = (one, many) => (n) => {
  const v = Math.round(Number(n) || 0);
  return `${v.toLocaleString('en-IN')} ${v === 1 ? one : many}`;
};

/** TallSkill Tokens (Challenge World entry). No INR value. tokens(5) → "5 tokens" */
export const tokens = unit('token', 'tokens');

/** TallSkill Coins (Free World retries/unlocks). No INR value. coins(1) → "1 coin" */
export const coins = unit('coin', 'coins');

/** Compact coin count (no unit label) — for tight UI spots like the header. */
export const tokenCount = (n) => Math.round(Number(n) || 0);

export const percent = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));

export function countdown(iso) {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { days, hours, mins, secs, total: diff };
}
