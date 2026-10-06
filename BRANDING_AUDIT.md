# EarnTour codebase and branding audit

Repository: achantabalaram3-bit/earntour, main. Baseline: 0cbdc7622858addda772692838f9ef807cbfbcfc.

## Architecture and scope

React 19 / React Router frontend, built with CRA + CRACO, with build-time SEO prerendering. FastAPI backend, MongoDB via Motor, Stripe payments, phone authentication and a separate Free World engine. This audit focused on branding and compatibility; it is not a full security or business-rule review.

Only this repository is changed. No live database, Stripe catalog, deployment, or other repository was modified.

## Changes

- EarnTour product copy across navigation, authentication, account, admin, Free World, legal templates, help text, referral sharing, and payment/product display names.
- New code-authored ET monogram, logo, favicon, PWA icons and social card; existing asset files retained for compatibility but no longer used as the main brand.
- Replaced the image-based world selector (which embedded the old name in three bitmaps) with accessible responsive cards. Destinations remain `/paid-leagues` and `/world`.
- Updated the frontend-only cryptogram brand phrase to `EARNTOUR WIN`; answer checking still derives from the same selected phrase. No scoring algorithm changed.
- Deployment-aware frontend links and SEO. `REACT_APP_SITE_URL` supplies the production origin; browser metadata falls back to the current origin. Without the variable, build output has relative metadata and an empty sitemap rather than sending crawlers to Prize League. Configure this variable before public launch.

## Compatibility retained

API routes, request/response keys, collection names, database selection, public-ID prefixes, storage namespaces, localStorage keys, component/file names, CSS classes and test IDs are retained. Stripe price/lookup/metadata identifiers are retained. Registered company name PRIZE LEAGUE LTD, company number, addresses and existing contact emails are retained; a product rename does not establish a new legal entity or mailbox.

## Follow-up findings before launch

1. **Database isolation:** `backend/deps.py` uses `MONGO_URL` and `DB_NAME`; `backend/server.py` also contains legacy database discovery/bootstrap logic. Use a separate EarnTour database and inspect bootstrap behavior before starting against production infrastructure. Source branding edits do not migrate data.
2. **Stored content:** existing settings, legal documents, banners, notifications and uploaded images can override source defaults or retain old branding. Legal seeding deliberately skips existing documents. Review EarnTour's own data through admin/versioned publishing; do not run a blind global database replacement.
3. **Domain/backend:** set `REACT_APP_SITE_URL` and `REACT_APP_BACKEND_URL` for EarnTour. The backend CORS allowlist still contains the original production domain plus local/Emergent hosts. An EarnTour custom domain needs an explicit CORS update once known.
4. **Analytics:** `frontend/public/index.html` retains inherited GA4 and PostHog identifiers. Review ownership and configure separate tracking before launch.
5. **Company/contact details:** backend company defaults and legal seed headers still identify the original company website, and existing email addresses remain throughout support/legal copy. Confirm the operator and working EarnTour contacts before changing them; no new domain or mailbox was invented.
6. **Payments:** existing Stripe products will keep their stored names; the catalog helper returns existing products unchanged. Its tax-settings helper contains a placeholder address (`1 Prize League Way`). Do not run the helper for a live account without reviewing those settings. No Stripe operation was performed.
7. **Legal copy:** inherited templates have inconsistent incorporation-status wording. Product-name edits preserve that existing wording; review before publishing. Database-published versions are untouched.
8. **Reproducibility:** no dependency lockfile is tracked. A fresh npm install with legacy peer dependency handling initially produced an AJV version conflict. Local verification installed AJV 8 without saving dependency changes. The project declares Yarn 1 and resolutions; establish a tested lockfile separately.

## Validation

- Changed Python files parse; AST comparison confirms all non-string structure is unchanged.
- Changed JavaScript/JSX files parse with Babel.
- Manifest JSON and git whitespace checks pass.
- Production build passed (existing React hook dependency warnings), after the local-only AJV workaround described above.
- SEO prerender checks passed with and without a configured production origin.
- Browser smoke tests could not run: Chromium was absent and its download failed. Responsive layout and navigation are not browser-verified.
- No production API, database or payment tests were run.
