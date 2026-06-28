# GraphOne — Setup Guide (Fixed Build)

This is the GraphOne monorepo with the backend wiring bugs fixed and the frontend
connected to the real API. Follow these steps in order — backend first, then frontend.

What was fixed, in detail, is in `FIXES_APPLIED.md`. This file is just "what do I run."

---

## 0. Prerequisites

- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) account (for the database)

---

## 1. Backend setup (`server/`)

### 1.1 Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project (free tier is fine).
2. Wait for it to finish provisioning (~2 minutes).
3. Go to **Settings → API** in the Supabase dashboard. Copy:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **service_role key** (NOT the `anon` key — the server needs the service role
     key because it intentionally bypasses Row Level Security)

### 1.2 Run the database migrations

1. In the Supabase dashboard, go to **SQL Editor**.
2. Open `server/supabase/migrations/0001_init.sql` from this repo, copy its
   entire contents, paste into the SQL Editor, and click **Run**.
3. Repeat for `server/supabase/migrations/0002_founders_products_news.sql`.
4. You should now see tables for `companies`, `investors`, `funding_rounds`,
   `round_participants`, `founders`, `products`, and `news_articles` under
   **Table Editor**.

### 1.3 Install dependencies and configure environment

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Leave `API_KEY` as the default (`graphone-dev-key`) for local dev, or set your own —
this is the value you'll send in the `X-API-Key` header for any POST/PATCH/DELETE call.

### 1.4 Seed the database

Run both seed scripts, in this order:

```bash
npm run seed              # companies, investors, funding rounds (50+ companies, 20+ investors)
npm run seed-extensions   # founders, products, news articles
```

You should see console output confirming rows inserted. If either fails with a
connection error, double-check `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` in `.env`.

### 1.5 Start the server

```bash
npm run dev
```

You should see:

```
GraphOne API listening on http://localhost:4000
   Health check: http://localhost:4000/health
   Environment:  development
```

### 1.6 Verify it's working

In a new terminal:

```bash
curl http://localhost:4000/health
# {"status":"ok"}

curl http://localhost:4000/api/companies
# {"data":[...]}  <- should return real seeded companies, not an error

curl http://localhost:4000/api/companies/trending
# {"data":[...]}  <- top 10 by trending score

curl -X POST http://localhost:4000/api/companies -H "Content-Type: application/json" -d '{"name":"Test"}'
# {"error":{"code":"UNAUTHORIZED",...}}  <- correctly rejected, no X-API-Key header

curl -X POST http://localhost:4000/api/companies \
  -H "Content-Type: application/json" \
  -H "X-API-Key: graphone-dev-key" \
  -d '{"name":"Test Co","slug":"test-co","categories":["AI Infra"]}'
# should succeed (or return a validation error naming the missing required field —
# check server/src/types/company.schema.ts for the exact required fields)
```

If `curl http://localhost:4000/api/companies` returns an error instead of data, the
most common cause is the seed step didn't run, or `.env` has the wrong Supabase
project URL/key.

**Keep this server running** — the frontend needs it for live data in step 2.

---

## 2. Frontend setup (`client/`)

Open a **new terminal** (leave the backend running in the other one).

```bash
cd client
npm install
cp .env.example .env.local
```

`.env.local` should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

This must include the `/api` path prefix, and must point at whatever port your
backend is actually running on (default `4000`).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/companies`.

### 2.1 Verify it's working

- `/companies` should show real seeded companies (not the same fixed mock list every time — refresh and check names match what you saw in `curl http://localhost:4000/api/companies`)
- Click into any company → `/companies/[slug]` should load that company's real funding rounds, founders, and products (sections show "No … on record yet" if that company genuinely has none, rather than crashing or showing OpenAI's data for every company)
- `/investors` and clicking into an investor profile should behave the same way
- `/products` should show real seeded products
- Press `/` anywhere on the page → the search bar should focus; typing 2+ characters should show live results from the backend (open browser dev tools → Network tab to confirm it's hitting `localhost:4000/api/search`, not just filtering a local array)

### 2.2 Running without the backend (optional)

If you want to preview just the frontend without setting up Supabase: skip step 1
entirely, skip `.env.local` (or leave `NEXT_PUBLIC_API_URL` unset), and run
`npm run dev` in `client/`. Every page automatically falls back to bundled mock
data (`lib/mockData.ts`) when the API call fails or there's no URL configured.
This is useful for pure UI/styling work but you won't be testing real integration.

---

## 3. Building for production / deployment

### Backend

```bash
cd server
npm run build   # compiles TypeScript to dist/
npm start        # runs dist/server.js
```

Deploy to Railway, Render, or Vercel (serverless functions) — set the same three
env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `API_KEY`) plus `CORS_ORIGIN`
set to your deployed frontend's URL.

### Frontend

```bash
cd client
npm run build   # verified to complete cleanly with no type errors
```

Deploy to Vercel. Set `NEXT_PUBLIC_API_URL` in the Vercel project's environment
variables to point at your deployed backend (e.g. `https://your-api.up.railway.app/api`).

---

## 4. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `GET /api/companies` returns a 404 | You're running an old/unpatched `app.ts` — confirm you're using the version from this zip, not a previously cloned copy |
| `GET /api/companies` returns a 500 / "fetch failed" | Wrong `SUPABASE_URL` or the project isn't done provisioning yet |
| `GET /api/companies` returns `{"data":[]}` (empty) | Migrations ran but seed scripts didn't — re-run step 1.4 |
| Frontend shows mock data instead of real seeded data | `NEXT_PUBLIC_API_URL` is unset/wrong in `client/.env.local`, or the backend isn't running — check the browser Network tab for failed requests to `localhost:4000` |
| `POST`/`PATCH`/`DELETE` returns 401 | Expected without `X-API-Key` header — this is correct, not a bug |
| `npm install` in `server/` complains about `express-rate-limit` | Shouldn't happen with this zip (the dependency was added to `package.json`) — if it does, run `npm install express-rate-limit` manually |
