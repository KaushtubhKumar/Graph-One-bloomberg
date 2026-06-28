# GraphOne

AI intelligence platform tracking the company/investor/funding-round graph. Monorepo with a Node.js/TypeScript/Express API (`server`) and a Next.js frontend (`client`).

**Scope of v1:** Companies, Investors, and Funding Rounds — the core entity graph. Founders and News are intentionally deferred to a follow-up pass (see "What's not in v1" below).

Data is hand-curated seed data for now. A crawler/ingestion pipeline is planned as phase 2.

---

## Project structure

```
graph-one/
├── client/          # Next.js frontend
├── server/          # Express API + Supabase
│   ├── src/
│   └── supabase/migrations/
├── package.json     # root scripts only (concurrently)
├── .gitignore
└── README.md
```

`client` and `server` are independent apps with their own `package.json`, `node_modules`, and `.env`. They don't import each other — the client talks to the server purely over HTTP.

---

## 1. Prerequisites

- Node.js 18+ (built and tested on Node 22)
- A Supabase project (free tier is fine) — [supabase.com](https://supabase.com)

## 2. Setup

From the **repo root**:

```powershell
npm install
```

This installs `concurrently`, used to run both apps with one command.

### Server setup

```powershell
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and fill in your Supabase project's URL and **service role** key (Project Settings → API in the Supabase dashboard), plus the client's URL for CORS:

```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLIENT_URL=http://localhost:3000
PORT=4000
```

> ⚠️ The service role key bypasses Row Level Security. It must only ever live in `server/.env` — never ship it to the frontend/browser bundle.

### Client setup

```powershell
cd client
npm install
cp .env.example .env.local
```

Edit `client/.env.local` to point at the server:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 3. Create the database schema

Open the Supabase SQL Editor for your project and run the contents of:

```
server/supabase/migrations/0001_init.sql
```

This creates the `companies`, `investors`, `funding_rounds`, and `round_participants` tables, their indexes, the `updated_at` triggers, and read-only RLS policies.

## 4. Seed the database

From `server/`, sanity-check the seed data first (pure offline check, no DB calls):

```powershell
npm run validate-seed
```

Then actually seed Supabase:

```powershell
npm run seed
```

This upserts ~47 companies, ~21 investors, and ~46 funding rounds (with lead + participant investors wired up), and recalculates each company's `total_funding_usd` / `last_funding_at` and each investor's `portfolio_count`. Safe to re-run — companies/investors are upserted by slug, and funding rounds for seeded companies are cleared and re-inserted each time so you never get duplicates.

## 5. Run the app

**Option A — both at once, from the repo root:**

```powershell
npm run dev
```

This uses `concurrently` to start the server and client together, with `[SERVER]`/`[CLIENT]` prefixed, color-coded log output.

**Option B — separately, in two terminals:**

```powershell
# Terminal 1
cd server
npm run dev      # ts-node-dev, auto-reload

# Terminal 2
cd client
npm run dev
```

- API: `http://localhost:4000` (health check: `GET /health`)
- Frontend: `http://localhost:3000`

---

## How the client and server connect

They're two separate processes — there's no shared import or build step. The client makes plain HTTP requests to the API using `NEXT_PUBLIC_API_URL`. The server allows those cross-origin requests via CORS, configured with `CLIENT_URL` in `server/.env`. In production, you'd point `NEXT_PUBLIC_API_URL` at your deployed API URL and `CLIENT_URL` at your deployed frontend URL.

---

## API Reference

All list endpoints return `{ data: [...], pagination: {...} }`.
All single-item endpoints return `{ data: {...} }`.
All errors return `{ error: { message, code, details? } }`.

### Companies — `/api/companies`

| Method | Path         | Notes                                                                                                       |
| ------ | ------------ | ----------------------------------------------------------------------------------------------------------- |
| GET    | `/`          | List, paginated. Query: `page`, `page_size`, `search`, `stage`, `category`, `country`, `is_unicorn`, `sort` |
| GET    | `/:idOrSlug` | Single company, with funding rounds (+ lead investor, participants) expanded                                |
| POST   | `/`          | Create. Body validated against `createCompanySchema`                                                        |
| PATCH  | `/:id`       | Partial update                                                                                               |
| DELETE | `/:id`       | Delete (cascades funding rounds via FK)                                                                     |

`sort` options: `name_asc`, `name_desc`, `founded_desc`, `founded_asc`, `funding_desc`, `funding_asc`, `recent_funding` (default).

### Investors — `/api/investors`

| Method | Path         | Notes                                                                                          |
| ------ | ------------ | ---------------------------------------------------------------------------------------------- |
| GET    | `/`          | List, paginated. Query: `page`, `page_size`, `search`, `type`, `focus_area`, `country`, `sort` |
| GET    | `/:idOrSlug` | Single investor, with `led_rounds` and `participated_rounds` expanded                          |
| POST   | `/`          | Create                                                                                         |
| PATCH  | `/:id`       | Partial update                                                                                 |
| DELETE | `/:id`       | Delete                                                                                         |

`sort` options: `name_asc`, `name_desc`, `portfolio_desc` (default), `aum_desc`.

### Funding Rounds — `/api/funding-rounds`

| Method | Path   | Notes                                                                                                                                                                                                 |
| ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`    | List, paginated. Query: `page`, `page_size`, `company_id`, `investor_id` (lead OR participant), `round_type`, `from_date`, `to_date`, `sort`                                                          |
| GET    | `/:id` | Single round, with company + lead investor + all participants expanded                                                                                                                                |
| POST   | `/`    | Create. Body includes `participant_investor_ids: string[]`; the lead investor is auto-added as a participant. Recalculates the company's funding totals and each affected investor's portfolio count. |
| PATCH  | `/:id` | Partial update. If `participant_investor_ids` is provided, the participant list is fully replaced.                                                                                                    |
| DELETE | `/:id` | Delete. Recalculates affected company/investor denormalized fields.                                                                                                                                   |

`sort` options: `date_desc` (default), `date_asc`, `amount_desc`, `amount_asc`.

### Stats — `/api/stats`

| Method | Path        | Notes                                                                                                                                   |
| ------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/overview` | `total_companies`, `total_investors`, `total_founders`, `total_products`, `total_news_articles`, `total_funding_rounds`, `total_funding_usd`, `recent_rounds` (last 10) — cached 10 min |

### Founders — `/api/founders`

| Method | Path         | Notes                                                  |
| ------ | ------------ | ------------------------------------------------------- |
| GET    | `/`          | List, with linked company expanded                      |
| GET    | `/:slug`     | Single founder, with linked company expanded            |
| POST   | `/`          | Create. Requires `X-API-Key`                             |
| PATCH  | `/:id`       | Partial update. Requires `X-API-Key`                      |
| DELETE | `/:id`       | Delete. Requires `X-API-Key`                              |

### Products — `/api/products`

| Method | Path         | Notes                                                          |
| ------ | ------------ | ---------------------------------------------------------------- |
| GET    | `/`          | List, paginated. Query: `page`, `page_size`, `category`, `sort` (`popular`/`newest`), `search` |
| GET    | `/:slug`     | Single product, with linked company expanded                     |
| POST   | `/`          | Create. Requires `X-API-Key`                                       |
| PATCH  | `/:id`       | Partial update. Requires `X-API-Key`                                |
| DELETE | `/:id`       | Delete. Requires `X-API-Key`                                        |

### News — `/api/news`

| Method | Path         | Notes                                          |
| ------ | ------------ | ------------------------------------------------- |
| GET    | `/`          | Paginated, filter by `tag`                        |
| GET    | `/trending`  | Most read in the last 24h                          |
| POST   | `/`          | Create. Requires `X-API-Key`                        |
| PATCH  | `/:id`       | Partial update. Requires `X-API-Key`                  |
| DELETE | `/:id`       | Delete. Requires `X-API-Key`                          |

### Extended company/investor sub-routes

| Method | Path                                  | Notes                                                              |
| ------ | -------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/api/companies/trending`              | Top 10 by computed trending score (cached 5 min) — see formula below |
| GET    | `/api/companies/:slug/funding`         | Funding rounds timeline for one company                              |
| GET    | `/api/companies/:slug/products`        | A company's products                                                  |
| GET    | `/api/companies/:slug/graph`           | 1-hop ecosystem graph: investors, products, competitors (cached 15 min) |
| GET    | `/api/investors/most-active`           | Ranked by deal count, last 90 days                                     |
| GET    | `/api/investors/:slug/investments`     | Paginated investment history (led + participated)                       |
| GET    | `/api/investors/:slug/co-investors`    | Most frequent syndication partners                                      |

### Search & Feed

| Method | Path           | Notes                                                                  |
| ------ | --------------- | ------------------------------------------------------------------------ |
| GET    | `/api/search`    | `?q=` — cross-entity search across companies, investors, founders, products |
| GET    | `/api/feed`      | Paginated, ranked activity feed (news + funding rounds + new companies), cached 2 min |

### Trending Score Formula

```
trending_score = recency_score + funding_score + employee_score + confidence_score

recency_score    (max 40): decays linearly over 180 days from last funding date
funding_score    (max 25): log10(total_funding_usd / 1M), capped at log=5
employee_score   (max 20): log10(employee_count + 1), capped at log=4
confidence_score (max 15): data_confidence_score (0–1) × 15

Maximum: 100 points
```

Computed live in `GET /api/companies/trending`, cached for 5 minutes. See `server/src/services/trendingScore.ts`.

---

## Example requests

```bash
# List unicorn companies in the LLM category, sorted by funding
curl "http://localhost:4000/api/companies?category=LLM&is_unicorn=true&sort=funding_desc"

# Get a company by slug, with its funding history
curl "http://localhost:4000/api/companies/anthropic"

# Get all rounds Sequoia Capital has been involved in (as lead or participant)
curl "http://localhost:4000/api/funding-rounds?investor_id=<sequoia-uuid>"

# Create a funding round
curl -X POST http://localhost:4000/api/funding-rounds \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "<company-uuid>",
    "round_type": "series_a",
    "amount_usd": 50000000,
    "announced_date": "2026-01-15",
    "lead_investor_id": "<investor-uuid>",
    "participant_investor_ids": ["<investor-uuid-2>"]
  }'
```

---

## Architecture notes

- **Why a Node API instead of hitting Supabase directly from the frontend?** Centralizing reads/writes here lets us enforce validation (Zod schemas), keep complex multi-table writes (funding round + participants + denormalized counters) atomic-ish and consistent, and avoid ever shipping the service role key to a browser. RLS policies are in place as a backstop, not the primary access control.
- **Denormalized fields** (`companies.total_funding_usd`, `companies.last_funding_at`, `investors.portfolio_count`) are recalculated from source tables on every write that could affect them, rather than trusted as input. This trades a bit of write-time cost for read-time correctness, which matters more for a dashboard product.
- **Validation** happens at the edge (Zod, in `server/src/types/*.schema.ts`) before any DB call, so malformed input never reaches Supabase.
- **CORS** is scoped to `CLIENT_URL` only — not wildcarded — since the service role key's blast radius means the API shouldn't casually accept requests from arbitrary origins.

## What's not in v1 (planned next)

- Real crawler/data pipeline (current data is hand-seeded)
- Auth (currently a single shared `X-API-Key` for all write operations — fine for a prototype, not for production multi-tenant use)

> **Note:** Founders, News, search, feed, and the trending-score formula described in `INTEGRATION.md` are now fully wired into `server/src/app.ts` and live at the routes listed above — that file used to describe a pending integration; it's now applied.

---

## Scripts reference

| Location | Command              | What it does                          |
| -------- | -------------------- | -------------------------------------- |
| root     | `npm run dev`         | Starts server + client together        |
| server   | `npm run dev`         | Starts API with auto-reload             |
| server   | `npm run build`       | Compiles TypeScript                     |
| server   | `npm start`           | Runs compiled, production-style         |
| server   | `npm run validate-seed` | Offline check of seed data            |
| server   | `npm run seed`        | Seeds Supabase with companies/investors/rounds |
| client   | `npm run dev`         | Starts Next.js dev server               |