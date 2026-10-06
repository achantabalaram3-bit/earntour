# TallSkill India — Conversion Audit (Phase 1 + World/Token Economy Update)

Repository: `achantabalaram3-bit/earntour` · branch `main`. Baseline: `9816730`.
No Prize League system (`gamezoo12/gamezoo`, its deployment, database or Stripe account) was touched, connected to or deployed.
Nothing was deployed. All work ran against an isolated local MongoDB (`DB_NAME=test_database`).

## 1. Product model

| World | Status | Entry | Notes |
|---|---|---|---|
| **Challenge World** (was Paid World / Paid Leagues) | Kept | **TallSkill Tokens** (earned, never bought) | Internal route `/paid-leagues`, `/competitions`, `/cart`, `orders/checkout` unchanged |
| **Free World** | Kept | Free; **TallSkill Coins** for optional retries / early unlocks | 100 championships × 10 levels = 1,000 levels, SKIP/catch-up, leaderboard untouched |

## 2. Money-in removed (frontend AND backend)

| Endpoint | Now |
|---|---|
| `POST /api/payments/wallet-topup/checkout` | 410 |
| `POST /api/payments/wallet-topup/custom` | 410 |
| `GET /api/payments/status/{id}` | 410 |
| `POST /api/stripe/webhook` | 410 |
| `POST /api/wallet/topup` (was an **open mock top-up crediting any amount**) | 410 |
| `GET /api/admin/payments/stripe-mode` | removed |

Frontend: top-up panel, Stripe checkout redirect/polling, `paymentsAPI`, "Buy tokens" CTAs removed. Cart now says tokens are earned. `backend/setup_stripe.py` deleted. `stripe` is no longer imported anywhere (it was never in `requirements.txt`).

**Stripe code remaining & why:** none executable. Remaining mentions: historical field names (`stripe_session_id`, `payment_transactions` collection, admin read-only `PaymentsPage` / `OrdersPage` for legacy history), referral code docstrings (`record_verified_topup` is now never called → referral bonus qualification is dormant), `scripts/purge_demo.py`, legal text (review banner), tests.

## 3. Token architecture (Challenge World)
- Store: existing `wallets` / `wallet_tx` (preserved, not rebuilt). `_apply_tx_idempotent` used for credits.
- Source changed from Stripe top-up → **verified rewarded-ad reward** (`kind='ad_reward'`) or approved platform rewards (admin adjust, referral/signup bonus, prizes).
- Policy: `GET /api/rewards/token-policy` (not purchasable/sellable/transferable/withdrawable/convertible, `inr_value: null`).
- `POST /api/orders/checkout` debits tokens (contest `price` = token cost). Error copy: "Not enough tokens… Earn tokens to enter."

## 4. Coin architecture (Free World utility)
- New separate ledger: `backend/coins_ledger.py` → collections `coin_wallets` (unique `user_id`) and append-only `coin_ledger` (unique deterministic `tx_id` from `user|kind|ref`, idempotent replay, balance guard).
- Free World **token retry** and **early unlock** now debit coins (`world_routes.py`, 2 call sites + reservation replay balance read). Champion prize credit stays on the prize path.
- APIs: `GET /api/coins/me`, `GET /api/coins/transactions`, `GET /api/coins/policy`. Frontend world reads `coinsAPI.me()`; labels now "RETRY WITH COINS", "EARLY UNLOCK WITH COINS".
- **Migration note:** any legacy users' token balances are NOT converted to coins.

## 5. Rewarded-ad architecture (no provider integrated)
```
Ad provider SSV callback → /api/rewards/ad-callback/{provider} → provider.verify() → VerifiedAdReward
→ ad_reward_events (unique provider+transaction_id) → caps/velocity checks → token (wallet) or coin ledger credit
```
- `services/rewarded_ads.py`: `RewardedAdClaim`, `VerifiedAdReward`, `RewardedAdProvider` protocol, registry (empty).
- `services/ad_rewards.py`: `credit_verified_reward()` — unique event ID, user, provider, reward type, amount, timestamps, verification/credit status, duplicate → no credit (verified locally: second identical event returns `duplicate_event`).
- Abuse controls: daily cap (`AD_REWARD_DAILY_CAP`, default 20), velocity flag (`AD_REWARD_VELOCITY_MAX` in `AD_REWARD_VELOCITY_WINDOW_MIN`), `reward_flags` collection for **human review only** (no auto-ban). Still needed: device/IP fingerprint + multi-account linking, per-device caps, admin review UI.
- `POST /api/rewards/rewarded-ad/claim` never trusts the client — returns 503 until a provider is registered.
- Frontend: `lib/rewardedAds.js` provider interface + `nativeBridgeProvider()` for a future Android bridge (`window.TallSkillNative.rewardedAds`). `FEATURES.rewardedAds=false`.
- **Required to go live:** choose provider (e.g. Google AdMob rewarded with SSV on Android; Google Ad Manager rewarded / H5 Games Ads on web), implement `verify()` incl. signature check of SSV callback, register provider, enable flag.

## 6. Currency (GBP → INR)
- Central utilities: `frontend/src/lib/currency.js` (`formatINR`, `formatINRMinor`, `formatIndianNumber`, `en-IN`), `lib/format.js` (`gbp` name kept as alias → INR), backend `tallskill_config.py` (`CURRENCY_CODE='INR'`).
- `£`→`₹`, `en-GB`→`en-IN`, `toLocaleString()`→`toLocaleString('en-IN')` across non-legal frontend; backend world/cashout/winnings/settings currency `INR`; notification copy uses `₹`.
- "1 token = £1" statements removed (tokens/coins have no INR value).
- **No stored values were converted.** Migration needed only if legacy data is ever imported: `world_champion_prizes` (old £ stage amounts), `prize_amount_snapshot`/`prize_currency_snapshot`, contests `prize_amount`, `winnings_*` (pence), promotions `*_gbp` fields, referral `qualifying_topup_gbp` settings.
- Field names containing `gbp`/`pence` retained for API compatibility (needs future rename migration).
- Something Special challenge reward constant `50000` (minor units) now displays as ₹500 — **business review required**.

## 7. Championship prize configuration
- Authoritative: `backend/tallskill_config.py::championship_prize(n) = 1000 + ((n - 1) * 500)`; mirrored in `frontend/src/config/tallskill.js::championshipPrize`.
- C1 ₹1,000 · C2 ₹1,500 · C3 ₹2,000 · C100 ₹50,500 · total **₹25,75,000** (unit-tested).
- Rank split (pending approval): 1st 50% · 2nd 20% · 3rd 15% · 4th 10% · 5th 5% → base ₹500/200/150/100/50 × championship multiplier.
- **Bug fixed:** live leaderboard used `1 + (stage-1)×0.5` while final settlement used `× stage`; both now use the same function.
- Status `pending_business_legal_approval`. Aggregate total is NOT shown publicly (header/ticker show "FREE TO PLAY").
- Seed (`POST /api/admin/world/seed`) writes stage amounts from the formula, currency INR.

## 8. Proposed championship names (review required)
Config: `frontend/src/config/championships.json` (`status: proposed_pending_review`), helper `config/championships.js`. Progression uses numbers only.

1 Udaan · 2 Josh · 3 Lakshya · 4 Tejas · 5 Vijay · 6 Shakti · 7 Pragati · 8 Maharathi · 9 Aarambh · 10 Safar · 11 Kadam · 12 Raftaar · 13 Himmat · 14 Sahas · 15 Dhyan · 16 Ekagra · 17 Gyan · 18 Buddhi · 19 Chetna · 20 Prerna · 21 Sankalp · 22 Utsah · 23 Umang · 24 Sitara · 25 Akash · 26 Prakash · 27 Roshni · 28 Kiran · 29 Jyoti · 30 Chingari · 31 Toofan · 32 Lehar · 33 Sagar · 34 Parvat · 35 Shikhar · 36 Unnati · 37 Vikas · 38 Nirmaan · 39 Kaushal · 40 Pratibha · 41 Nipun · 42 Pravin · 43 Chatur · 44 Tez · 45 Gati · 46 Vega · 47 Chaal · 48 Daud · 49 Uchhal · 50 Sangram · 51 Ekta · 52 Dhairya · 53 Sthir · 54 Nishana · 55 Disha · 56 Marg · 57 Pathik · 58 Yatra · 59 Manzil · 60 Kshitij · 61 Savera · 62 Ujala · 63 Uday · 64 Utthan · 65 Abhyudaya · 66 Samarth · 67 Saksham · 68 Shreshth · 69 Uttam · 70 Param · 71 Pratap · 72 Gaurav · 73 Garima · 74 Kirti · 75 Yash · 76 Saphal · 77 Siddhi · 78 Vijeta · 79 Jayant · 80 Ajay · 81 Abhay · 82 Nirbhay · 83 Veer · 84 Dheer · 85 Prakhar · 86 Pravah · 87 Sanchar · 88 Shaurya · 89 Parakram · 90 Vikram · 91 Mahaan · 92 Yoddha · 93 Senani · 94 Samrat · 95 Shiromani · 96 Ratna · 97 Heera · 98 Amar · 99 Mahima · 100 Mahavijay

Reviewer notes: several are also common personal names (Kiran, Jyoti, Vikas, Gaurav, Ajay, Vikram…); "Shakti" has religious connotations for some audiences; "Sangram"/"Yoddha" are martial. Displayed on world map castle popups and the header ("CHAMPIONSHIP 1 · UDAAN").

## 9. Fairness
No difficulty, scoring, RNG or leaderboard logic was changed. Tokens/coins only gate access/retries.

## 10. Brand
EarnTour → TallSkill in all user-facing copy (65 files), new TS monogram logo, favicon, PWA icons (192/512/maskable/apple-touch 180), OG images. Old Prize League/EarnTour assets removed from `public/` (incl. `og-image.png` with "£P" mark and `og-free-world.png` with UK flag, and `world-selector/*.webp` with old name). World selector rebranded with both worlds. Avatar initials PL→TS.

**Retained intentionally (internal compatibility):** component/file names (`PrizeLeagueLogo.jsx`, `PrizeLeagueWorld.jsx`), CSS classes (`earntour-*`, `pl-*`, `pl2d-*`), test IDs (`prizeleague-logo`), localStorage keys (`gz_token`, `prizeleague_cart`), CSS/code comments, public-ID prefix `PL…`, route `/paid-leagues`.

## 11. Legal / company
- Default operator in `lib/brand.js` and backend `company_routes.DEFAULT_COMPANY` changed from PRIZE LEAGUE LTD to **"TallSkill legal entity pending incorporation"** (env-overridable `REACT_APP_LEGAL_OPERATOR_NAME` / `LEGAL_OPERATOR_NAME`). No company number, CIN, GST, PAN or address invented.
- Every legal page shows a **"Requires Indian legal review"** banner. Legal text itself (`pages/legal/content/*.js`, `backend/legal_docs_seed.py`) is unchanged and still names PRIZE LEAGUE LTD, company 17338919, London address, UK law, £ thresholds, Stripe, deposits, postal entry, UK sanctions — **must be replaced by Indian counsel**. Seeded DB legal docs mirror this.
- Legacy mailboxes (`prizeleagueadmin@gmail.com`, `*@prizeleague.co.uk`) remain only inside legal text and `legal_routes.py` header; UI contact uses Support Centre / env `REACT_APP_SUPPORT_EMAIL`.
- Regulatory characterisation (skill gaming, prizes, state restrictions, TDS on winnings, KYC) needs Indian legal advice — eligibility copy marked "pending legal review".

## 12. Remaining UK assumptions
- Cash-out bank form uses UK fields (sort code, IBAN, BACS) — needs IFSC/UPI redesign (cash-out is disabled by default flag).
- Prize winnings are still stored as "withdrawable tokens" in the token wallet (1:1) — must move to a separate INR prize ledger before any payout launch.
- Free postal entry module, Postal Entries admin, `/free-entry` page (UK competition-law concept) still exist; UI links removed from footer/login.
- Age gate 18+ retained; KYC form defaults country India.
- Free World season start label `15 Sep 2026 00:00 IST` (date carried over; business to confirm).
- Phone: default normalisation now +91 (10-digit 6–9 mobiles); placeholders +91.
- Timezone: `WORLD_TIMEZONE` env, default `Asia/Kolkata` (backend schedule + world engine + admin UI).

## 13. Security / isolation fixes
- **Committed plaintext super-admin password and email** (`seed.py`, ~25 test files, `test_result.md`) removed → env vars. ⚠️ **Rotate that password everywhere it was used (incl. Prize League production) — it remains in git history.**
- **Committed KYC documents** (`backend/uploads/kyc/*` — passport, proof of address) removed from the tree. ⚠️ They remain in git history of a public repo: purge history (git filter-repo/BFG), notify the data subject per data-protection obligations.
- Legacy `backend/uploads/*` contest images, `test_reports/*`, `deployer-agent-docs/*` (Prize League RCA) removed; `backend/uploads/` now git-ignored.
- `DB_NAME` now required (no `gamezoo` fallback) and **hard-blocked** for `gamezoo, prize_league, prizeleague, prize-league, contest-arena-16` (+ `FORBIDDEN_DB_NAMES`).
- Removed unauthenticated `/api/diagnostics/find-authorized-db` (probed Prize League DB names); `/api/diagnostics/db` now admin-only.
- CORS: `prizeleague.co.uk` removed; origins from `CORS_ORIGINS` / `CORS_ORIGIN_REGEX`.
- `STRIPE_MODE` no longer influences prod detection; `ENVIRONMENT` only.
- Analytics: Prize League GA4 measurement ID and PostHog project key removed from `index.html`; now opt-in via env.
- No secrets (Stripe/Twilio/AWS/Mongo SRV keys) were found committed.

## 14. Required environment variables (new TallSkill deployment)
Backend: `MONGO_URL` (new cluster/user) · `DB_NAME` (new, e.g. `tallskill_prod`) · `JWT_SECRET` · `ENVIRONMENT=production` · `CORS_ORIGINS` · `WORLD_TIMEZONE=Asia/Kolkata` · `INSTANT_WIN_KEY` · `SKILL_CHALLENGE_KEY` · `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` (+ Verify service SID per `otp_verify.py`) · `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` · `R2_BUCKET` / `R2_ENDPOINT` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_PUBLIC_URL` · `EMERGENT_LLM_KEY` (Meera admin assistant) · `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` (seed only) · optional `LEGAL_OPERATOR_NAME`, `SUPPORT_EMAIL`, `GENERAL_EMAIL`, `SITE_URL`, `FORBIDDEN_DB_NAMES`, `AD_REWARD_DAILY_CAP`, `AD_REWARD_VELOCITY_MAX`, `AD_REWARD_VELOCITY_WINDOW_MIN`. Never set `TEST_OTP_BYPASS_CODE` in production.
Frontend: `REACT_APP_BACKEND_URL` · `REACT_APP_SITE_URL` · optional `REACT_APP_GA4_MEASUREMENT_ID`, `REACT_APP_POSTHOG_KEY`, `REACT_APP_POSTHOG_HOST`, `REACT_APP_SUPPORT_EMAIL`, `REACT_APP_GENERAL_EMAIL`, `REACT_APP_LEGAL_OPERATOR_NAME`, `REACT_APP_WORLD_TIMEZONE`.
Remove from any copied env: all `STRIPE_*`.

## 15. PWA / Android
- Manifest: name/short_name TallSkill, `display: standalone`, `lang en-IN`, theme/background `#21133d`, icons any+maskable; service worker is network-only (no stale data). Install prompt says "Install TallSkill".
- **Recommendation:** ship Android as a **Trusted Web Activity (Bubblewrap)** for the fastest path, or **Capacitor** if native rewarded ads are required (recommended, since AdMob rewarded ads need a native SDK). Same React build, same FastAPI accounts/progress/tokens/coins.
- Prepared: `lib/platform.js` (`window.TallSkillNative` bridge detection), `lib/rewardedAds.js`.
- **Package ID needs approval** — proposal only: `in.tallskill.app` (not used anywhere).
- Needed: Digital Asset Links (`/.well-known/assetlinks.json`) for TWA, Play Console account, privacy policy URL, Play real-money/skill-gaming policy review for India.

## 16. Validation results
- Frontend production build: **pass** (only pre-existing react-hooks warnings); SEO prerender pass.
- Backend: `compileall` pass; server boots; `tests/test_tallskill_india.py` 5/5 + testing-agent `test_tallskill_review.py` 26/26 pass.
- Verified: all money-in endpoints 410 (anon + auth); fake `adWatched=true` claim → 503, no credit; duplicate ad event → no second credit; coin ledger idempotent + insufficient guard; tokens and coins independent; checkout with 0 tokens → 402; Free World seed → 100 stages ₹1,000…₹50,500, total ₹25,75,000; world state/level/attempts/access endpoints OK; Challenge World routes render; UI E2E (desktop + 390px) pass.
- Inherited legacy tests in `backend/tests/` largely depend on Prize League data/URLs and were not re-baselined.

## 17. Manual actions still required
1. Rotate leaked admin password; purge git history of KYC files + password; consider making the repo private.
2. Create isolated TallSkill MongoDB + all env vars above; seed with `python seed.py` and `POST /api/admin/world/seed`.
3. Indian legal review: all legal documents, eligibility, prize & TDS handling, operator entity, contact mailboxes.
4. Approve championship names, rank split, prize schedule, Something Special ₹500, season start date.
5. Choose rewarded-ad provider; implement SSV verification; enable `FEATURES.rewardedAds`.
6. Redesign prize payout (INR prize ledger, IFSC/UPI) before enabling cash-out.
7. Approve Android package ID and wrapper approach.
8. Configure TallSkill's own analytics IDs and `REACT_APP_SITE_URL`.
9. Push: this environment has no GitHub write credentials — see commit notes in the final report.
