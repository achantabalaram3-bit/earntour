// TallSkill — public static content used for pages that do not require
// live server data (nav labels, FAQs, category filters, "how it works" copy).
//
// PRODUCTION LAUNCH STATE: every runtime array (contests, winners, stats,
// admin/production tables) is EMPTY. Real content is populated once contests,
// winners and users start flowing through the platform.

export const IMAGES = {};

// Hero rotator falls back to live contests from the API — this array is kept
// empty so no stale marketing claims appear pre-launch.
export const HERO_SLIDES = [];

// Homepage stats bar is currently NOT rendered on the launch home page. Left
// empty so any accidental import shows a blank strip instead of fake numbers.
export const SITE_STATS = [];

// Real contests come from /api/contests. No local fallbacks — an empty state
// is the correct pre-launch experience.
export const COMPETITIONS = [];

// Populated as real winners come in.
export const WINNERS = [];
export const STORIES = [];
export const REVIEWS = [];

export const HOW_IT_WORKS = [
  { step: 1, title: 'Pick a contest', desc: 'Browse live skill contests and pick one you fancy.' },
  { step: 2, title: 'Solve the skill puzzle', desc: 'Answer a genuine skill question — math, trivia, or word puzzle.' },
  { step: 3, title: 'Buy your ticket', desc: 'Pay the entry fee per ticket via card, Apple Pay or Google Pay.' },
  { step: 4, title: 'Winner confirmed', desc: 'The result is verified according to the competition rules and the winner is contacted after verification.' },
];

export const FAQ_ITEMS = [
  { q: 'Is TallSkill gambling?', a: 'TallSkill is a free-to-play skill championship platform. There are no deposits and no paid entry; results depend on skill. [Regulatory characterisation pending Indian legal review.]' },
  { q: 'How do I enter a contest?', a: 'Open Free World, play the daily skill levels and progress to the Championship challenge. Entry is free.' },
  { q: 'When are the draws?', a: 'Every competition displays its published closing and result information on the competition page.' },
  { q: 'Do I need to pay to play?', a: 'No. TallSkill has no deposits, no paid entry and TallSkill Coins cannot be bought.' },
  { q: 'How do winners get paid?', a: 'Cash and physical prizes are fulfilled after winner verification in accordance with the competition rules.' },
  { q: 'What happens if I answer wrong?', a: 'Incorrect answers are excluded from eligibility, so please double-check before submitting. TallSkill competitions include genuine skill requirements.' },
  { q: 'Who can enter?', a: 'You must be 18+ and meet TallSkill\u2019s eligibility requirements (pending Indian legal review). Verification may be required before payout.' },
  { q: 'How do I contact support?', a: 'Use the Support Centre in My Account — we typically reply within one business day.' },
];

export const NAV_LINKS = [
  { label: 'Contests', href: '/competitions' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Winners', href: '/winners' },
  { label: 'Results', href: '/draw-results' },
  { label: 'How it Works', href: '/#how-it-works' },
  { label: 'FAQs', href: '/faq' },
];

export const CATEGORIES = [
  { slug: 'all', label: 'All Contests' },
  { slug: 'jackpot', label: 'Jackpot' },
  { slug: 'instant-wins', label: 'Instant Wins' },
  { slug: 'prize-draws', label: 'Prize Draws' },
  { slug: 'new-games', label: 'New Games' },
];

// Admin dashboards fetch real data from /api/admin/* — these are empty
// fallbacks so any un-migrated import renders a clean empty state.
export const ADMIN_USERS = [];
export const ADMIN_ORDERS = [];
export const REVENUE_SERIES = [];
export const PRODUCTION_TASKS = [];
export const PRIZE_INVENTORY = [];
