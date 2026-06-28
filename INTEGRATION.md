# GraphOne Backend — Gap Closure Guide

## New dependencies to install

```bash
npm install express-rate-limit
```

(Everything else — zod, @supabase/supabase-js, express, dotenv — is already in your package.json.)

Add this script to `package.json`:

```json
"seed-extensions": "ts-node src/seeds/seed-extensions.ts"
```

---

## Integration steps (in order)

### 1. Run the new SQL migration

Open Supabase SQL Editor and run:

```
supabase/migrations/0002_founders_products_news.sql
```

This adds `founders`, `products`, `news_articles` tables and the missing
`valuation`, `growth_score`, `last_scraped_at`, `data_confidence_score` columns
to `companies`, plus `avg_check_size` and `fund_number` to `investors`.

### 2. Seed the extension data

```bash
npm run seed          # existing seed (companies + investors + rounds)
npm run seed-extensions  # NEW: founders + products + 100 news articles
```

### 3. Wire routes into your app

In your existing `src/app.ts` or `src/index.ts`:

```ts
// Add rate limiter globally (must come before routes)
import { rateLimiter } from './middleware/rateLimiter';
app.use(rateLimiter);

// Mount NEW extended company/investor sub-routes BEFORE your existing routers
// so /trending, /:slug/funding, /most-active etc. match first
import companiesExtendedRouter from './routes/companiesExtended';
import investorsExtendedRouter from './routes/investorsExtended';
app.use('/api/companies', companiesExtendedRouter);
app.use('/api/investors', investorsExtendedRouter);

// Your existing routers come after
app.use('/api/companies', companiesRouter);
app.use('/api/investors', investorsRouter);
app.use('/api/funding-rounds', fundingRoundsRouter);

// New entity routers
import foundersRouter from './routes/founders';
import productsRouter from './routes/products';
import newsRouter from './routes/news';
import searchRouter from './routes/search';
import feedRouter from './routes/feed';
import statsRouter from './routes/stats';

app.use('/api/founders', foundersRouter);
app.use('/api/products', productsRouter);
app.use('/api/news', newsRouter);
app.use('/api/search', searchRouter);
app.use('/api/feed', feedRouter);
app.use('/api/stats', statsRouter);
```

### 4. Add env var for API key auth

In `.env`:

```
API_KEY=your-secret-key-here
```

Write operations (POST/PATCH/DELETE) on companies, investors, founders,
products, news now require `X-API-Key: your-secret-key-here`.

---

## Trending Score Formula

```
trending_score = recency_score + funding_score + employee_score + confidence_score

recency_score    (max 40): decays linearly over 180 days from last funding date
funding_score    (max 25): log10(total_funding_usd / 1M), capped at log=5
employee_score   (max 20): log10(employee_count + 1), capped at log=4
confidence_score (max 15): data_confidence_score (0–1) × 15

Maximum: 100 points
```

Computed live in `GET /api/companies/trending` and cached for 5 minutes.

---

## Full endpoint inventory (post-integration)

| Endpoint | Status |
|---|---|
| GET /api/companies | ✅ existing |
| POST /api/companies | ✅ existing |
| PATCH /api/companies/:id | ✅ existing |
| DELETE /api/companies/:id | ✅ existing |
| GET /api/companies/:slug | ✅ existing |
| **GET /api/companies/trending** | ✅ NEW |
| **GET /api/companies/:slug/funding** | ✅ NEW |
| **GET /api/companies/:slug/products** | ✅ NEW |
| **GET /api/companies/:slug/graph** | ✅ NEW |
| GET /api/investors | ✅ existing |
| GET /api/investors/:slug | ✅ existing |
| **GET /api/investors/most-active** | ✅ NEW |
| **GET /api/investors/:slug/investments** | ✅ NEW |
| **GET /api/investors/:slug/co-investors** | ✅ NEW |
| **GET /api/founders** | ✅ NEW |
| **GET /api/founders/:slug** | ✅ NEW |
| **POST/PATCH/DELETE /api/founders** | ✅ NEW |
| **GET /api/products** | ✅ NEW |
| **GET /api/products/:slug** | ✅ NEW |
| **GET /api/news** | ✅ NEW |
| **GET /api/news/trending** | ✅ NEW |
| **GET /api/search?q=** | ✅ NEW |
| **GET /api/feed** | ✅ NEW |
| GET /api/stats | ✅ extended (now cached, counts all entities) |
| GET /api/funding-rounds | ✅ existing |

## What I'd build next (with 2 more days)

- **Real-time ingestion pipeline**: A cron-driven Python scraper that pulls from Crunchbase/PitchBook
  APIs and populates `news_articles` and updates `last_scraped_at` on companies automatically.
- **Investor deal graph**: A proper graph DB (Neo4j or Supabase RLS + recursive CTE) to power
  multi-hop queries — "who are Sequoia's portfolio companies' co-investors' other bets?"
- **WebSocket feed**: Replace the REST `/feed` with a WebSocket that pushes new articles and funding
  rounds to connected clients in real time.
- **Semantic search**: Replace `ILIKE` in `/search` with pgvector embeddings so "AI coding tools"
  returns Cursor, GitHub Copilot, and Replit even if none contain those exact words.
- **Auth + multi-tenancy**: Replace the single API key with JWT + Supabase Auth so different teams
  can have scoped access (read-only vs. write vs. admin).
