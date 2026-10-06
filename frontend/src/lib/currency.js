// TallSkill India — centralized currency formatting (INR, Indian digit grouping).
export const CURRENCY = { code: 'INR', symbol: '₹', locale: 'en-IN' };

const cache = {};
function formatter(decimals) {
  if (!cache[decimals]) {
    cache[decimals] = new Intl.NumberFormat(CURRENCY.locale, {
      style: 'currency',
      currency: CURRENCY.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return cache[decimals];
}

/** ₹1,000 · ₹1,00,000 · ₹10,00,000. Shows paise only when the value has them (or decimals is forced). */
export function formatINR(value, { decimals } = {}) {
  const n = Number(value) || 0;
  const d = decimals ?? (Number.isInteger(n) ? 0 : 2);
  return formatter(d).format(n);
}

/** Amounts stored in minor units (paise / legacy "pence" fields). */
export const formatINRMinor = (minor, opts) => formatINR((Number(minor) || 0) / 100, opts);

/** Plain Indian-grouped number without the symbol: 1,00,000 */
export const formatIndianNumber = (value) => (Number(value) || 0).toLocaleString(CURRENCY.locale);
