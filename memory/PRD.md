# TallSkill India — PRD

## Original problem
Clone `achantabalaram3-bit/earntour` (React/CRACO + FastAPI + MongoDB), run, harden, and convert to **TallSkill**: India-focused, no money-in. Keep Free World (100 championships/1,000 levels) and Paid World renamed **Challenge World** (token entry). Tokens (Challenge entry) and Coins (Free World retries/unlocks) are earned via future verified rewarded ads, never bought, no INR value, separate ledgers. GBP→INR (Indian grouping), Prize(n)=1000+((n−1)×500) (total ₹25,75,000), Indian championship names in central config, PWA, Android readiness, DB/env isolation from Prize League, audit doc, commit to main. No deploy.

## Implemented (2026-10-06)
- Rebrand EarnTour→TallSkill, new logo/icons/OG/manifest; analytics env-driven
- Money-in endpoints 410 (Stripe checkout/custom/status/webhook, mock wallet top-up); Stripe removed from runtime
- Challenge World kept (route /paid-leagues), token entry via orders/checkout
- Coin ledger (coin_wallets/coin_ledger) for Free World retries/unlocks; /api/coins/*
- Rewarded-ad architecture: provider protocol, ad_reward_events unique idempotency, caps/velocity flags, claim/callback endpoints return 503 until provider configured
- INR utilities, Asia/Kolkata timezone env, +91 phone normalisation
- Central prize formula (backend+frontend); fixed live vs settlement prize mismatch
- 100 proposed Indian championship names (config/championships.json)
- Isolation: DB_NAME required + legacy names blocked, unauth DB probe removed, CORS env-driven, committed admin password/KYC files removed
- Legal pages: "Requires Indian legal review" banner; operator = pending incorporation
- TALLSKILL_INDIA_AUDIT.md, README

## Backlog
- P0: rotate leaked admin password, purge git history (KYC/password); Indian legal review; choose ad provider + SSV verify
- P1: INR prize ledger + IFSC/UPI cash-out; Android wrapper (Capacitor/TWA) + package ID approval; admin review UI for reward_flags; device/multi-account signals
- P2: rename internal gbp/pence fields; retire postal-entry module; re-baseline legacy tests
