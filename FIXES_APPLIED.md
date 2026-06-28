# Fixes Applied to the Original Repo

This documents every change made to the original `KaushtubhKumar/Graph-one` repo,
and why. Organized backend-first, then frontend.

## Backend (`server/`)

### Critical — server didn't actually run

1. **`src/app.ts` was the unmerged integration patch, not the real app.**
   The original `companies.routes.ts`, `investors.routes.ts`, and
   `fundingRounds.routes.ts` routers were commented out / never imported, so
   `GET /api/companies`, `/api/investors`, and `/api/funding-rounds` all 404'd.
   The global error handler was also never wired in.
   **Fix:** rewrote `app.ts` to import and mount every router — core entity
   routers, extended sub-routes (trending, graph, funding timeline), founders/
   products/news, search/feed, and stats — in the correct order (extended
   routes like `/companies/trending` must be mounted *before* the generic
   `/companies/:idOrSlug` catch-all, or Express matches the catch-all first and
   treats "trending" as a slug).

2. **`express-rate-limit` was imported in `middleware/rateLimiter.ts` but never
   declared as a dependency in `package.json`.** This would crash on a clean
   `npm install` + run.
   **Fix:** added `"express-rate-limit": "^7.4.1"` to `package.json`.

3. **`seed-extensions` script existed on disk but wasn't registered in
   `package.json`**, so founders/products/news seed data had no documented way
   to run via npm.
   **Fix:** added `"seed-extensions": "ts-node-dev --transpile-only -r dotenv/config src/seeds/seed-extensions.ts"` to scripts.

4. **Two competing routers both mounted at `/api/stats`** (`stats.routes.ts`
   and a separate `stats.ts`), with different shapes and one missing caching.
   **Fix:** deleted the duplicate `stats.ts`; merged its caching layer and full
   entity counts (founders, products, news) into the canonical
   `stats.controller.ts` used by `stats.routes.ts`.

### Security — write endpoints had no auth

5. **The original companies/investors/funding-rounds write routes
   (`POST`/`PATCH`/`DELETE`) had no `apiKeyAuth` middleware**, even though the
   newer founders/products/news routers did, and the spec requires
   `X-API-Key` on all writes.
   **Fix:** added `apiKeyAuth` to all write routes in `companies.routes.ts`,
   `investors.routes.ts`, and `fundingRounds.routes.ts`.

6. **`apiKeyAuth` read `process.env.API_KEY` directly** instead of going
   through the centralized `utils/env.ts` config, and `env.ts` didn't expose
   `API_KEY` or read `CLIENT_URL` (which the README told users to set, but the
   code never read).
   **Fix:** added `API_KEY` and `CORS_ORIGIN` (falling back from `CLIENT_URL`)
   to `env.ts`; updated `apiKeyAuth.ts` to import from there.

### Correctness — schema mismatches that would throw at runtime

7. **Several newer route files referenced a singular `companies.category`
   column that does not exist** — the real schema only has `categories`
   (a `text[]` array), confirmed against `supabase/migrations/0001_init.sql`.
   This would throw a Supabase query error at runtime, not just a type error.
   **Fixed in:** `routes/search.ts`, `routes/feed.ts`, `routes/founders.ts`,
   `routes/products.ts`, `routes/investorsExtended.ts` — all changed to select
   `categories` instead of `category` wherever the table is `companies`.
   (Note: `products.category` and `news_articles.tag` *are* real singular
   columns and were left alone.)

8. **The competitor-matching query in `companiesExtended.ts` used
   `.eq('categories', company.categories)`** — comparing an array column to an
   array value with `.eq` does an exact-match comparison, not an overlap
   check, so it would silently return zero competitors for almost every real
   company (any two companies with categories in a different order, or one
   extra tag, wouldn't match).
   **Fix:** changed to `.overlaps('categories', company.categories ?? [])`,
   which correctly finds companies sharing at least one category tag.

## Frontend (`client/`)

### Critical — every page used mock data only, never called the API

9. **`lib/api.ts` (a proper live-fetch-with-mock-fallback adapter) existed but
   was never imported by any page or component.** Every page imported
   directly from `lib/mockData.ts`, so the "Data:" requirement in the task
   spec — and the whole point of having a backend — wasn't being exercised at
   all.
   **Fix:** rewired all 4 required pages (`/companies`, `/companies/[slug]`,
   `/investors`, `/investors/[slug]`) plus `/products` and the `Navbar` search
   to fetch through `lib/api.ts`, with `useState`/`useEffect` and loading
   states (these are client components, so this is the safe pattern — no
   restructuring into server components, which would have been a much larger,
   riskier change).

10. **Extended `lib/api.ts`** with mappers and fetchers it didn't have yet:
    `getFounders`, `getFoundersByCompanySlug`, `getProducts`,
    `getProductsByCompanySlug`, `getNews`, `getNewsByCompanySlug`,
    `getCategoriesFromCompanies`, `getInvestorInvestments`, and a proper
    `mapFundingRound` (the previous `getFundingRounds` returned the raw API
    shape un-mapped, so field names like `amount_usd` wouldn't have matched
    what the UI expected, `amount`).

### Correctness — hardcoded fallback bug

11. **The company detail page silently fell back to OpenAI's data for *any*
    unmatched slug** (`companies.find(c => c.slug === slug) || companies.find(c => c.slug === "openai")!`),
    and the investor profile page did the same with Sequoia Capital. This
    means visiting `/companies/some-typo` or any company not in the mock list
    would show OpenAI's profile instead of an error — actively misleading.
    **Fix:** both pages now show a proper "not found" state with a link back
    to the listing page when the slug doesn't match a real entity.

12. **Several sections on the company/investor detail pages were hardcoded to
    OpenAI/Sequoia-specific content regardless of which company was being
    viewed** — the Timeline (hardcoded "ChatGPT Launched 2022" etc.), the
    Investors section (hardcoded "Y Combinator, Sam Altman..."), the Products
    grid (hardcoded ChatGPT/Sora/Codex), the News section (showed *all* mock
    news regardless of the `related_companies` filter doing nothing), and the
    "Recent Investments" cards on the investor page (hardcoded Harvey/Luma/
    Mistral). None of these would ever change no matter which company or
    investor you viewed.
    **Fix:** all of these now derive from the actually-fetched data for that
    specific company/investor (real funding rounds, real founders, real
    products, real news filtered by `related_companies`), with an honest empty
    state ("No … on record yet") when that entity genuinely has none — rather
    than silently showing unrelated placeholder content.

13. Two sections — **ownership/cap-table percentages** on the company page and
    **portfolio sector $ concentration** on the investor page — are left as
    clearly-commented illustrative placeholders, because the database schema
    has no columns for either (no cap-table data, and `sector_focus` is a tag
    list, not a dollar-weighted breakdown). This is called out explicitly in
    both the page source comments and in `client/README.md`, rather than
    silently shipping fake-looking-real numbers.

### Documentation

14. Both `README.md` files were stale in opposite directions: the root README
    described founders/news/search as **not yet built** when they actually
    existed in the codebase (just unwired); the client README described the
    frontend as **mock-data-only by design** and listed founders/products/news/
    search as still needing backend work, when after the fixes above they're
    fully available. Both READMEs are rewritten to describe the actual current
    state, including an explicit, justified note on the Next.js 14→16 version
    deviation from the original spec.

## What I'd build next (2 more days)

- Convert the 4 required pages from client-side `useEffect` fetching to Next.js
  server components with proper streaming/suspense boundaries — better for
  LCP/performance scoring, and removes the loading-flash on first paint.
- Add the `/api/companies/:slug/graph` ecosystem-graph endpoint to an actual
  visual graph on the company detail page (the backend supports it; no UI
  consumes it yet).
- Add automated tests (Jest/Vitest) for the trending-score formula and the
  `apiKeyAuth` middleware — both are pure, easily-testable logic that
  currently has zero test coverage.
- Real cursor-based pagination on the frontend listing pages (the backend
  supports offset/cursor pagination on `/companies`, `/products`, `/news`;
  the frontend currently fetches one page and doesn't expose "load more").
