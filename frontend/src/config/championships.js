// Free World championship presentation (India theme). Progression logic uses numbers only;
// names are display metadata and can be changed here without touching game logic.
import data from './championships.json';

export const CHAMPIONSHIP_NAMES_STATUS = data.status;
export const CHAMPIONSHIP_NAMES = data.names;

export const championshipName = (n) => CHAMPIONSHIP_NAMES[Math.round(Number(n) || 1) - 1] || '';

export const championshipLabel = (n) => {
  const name = championshipName(n);
  return name ? `Championship ${n} — ${name}` : `Championship ${n}`;
};
