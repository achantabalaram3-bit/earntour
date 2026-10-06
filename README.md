# TallSkill

India-focused skill-gaming web app / PWA (Android next). Two worlds: **Free World** (100 championships, 1,000 levels) and **Challenge World** (token-entry skill competitions). No deposits: tokens and coins are earned, never bought.

Stack: React 19 (CRACO, Tailwind, shadcn/ui) · FastAPI · MongoDB (Motor).

## Setup
```bash
# backend
cd backend && pip install -r requirements.txt
# create backend/.env with: MONGO_URL, DB_NAME (dedicated TallSkill DB), JWT_SECRET, CORS_ORIGINS, ...
python seed.py          # needs ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD
uvicorn server:app --host 0.0.0.0 --port 8001

# frontend
cd frontend && yarn install
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
yarn start              # or: yarn build
```
After first login as super admin, seed Free World holders: `POST /api/admin/world/seed`.

Tests: `cd backend && pytest tests/test_tallskill_india.py -n0`.

Full environment variable list, architecture and outstanding manual actions: see `TALLSKILL_INDIA_AUDIT.md`.
