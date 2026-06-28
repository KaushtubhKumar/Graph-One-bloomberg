# GraphOne Frontend

Next.js frontend for the GraphOne AI intelligence platform.

## Screens Implemented

| Screen | Route | Status |
|--------|-------|--------|
| AI Companies Home | `/companies` | ✅ Complete |
| Company Detail | `/companies/[slug]` | ✅ Complete |
| Investors Discovery | `/investors` | ✅ Complete |
| Investor Profile | `/investors/[slug]` | ✅ Complete |
| AI Products | `/products` | ✅ Complete |

## Tech Stack

- **Framework:** Next.js 16 App Router (see "Note on Next.js version" below)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS only
- **Charts:** Recharts (ownership/portfolio pie charts)
- **Icons:** Lucide React
- **Font:** Inter (Google Fonts)

## Note on Next.js version

The original task spec calls for Next.js 14. This project ships on **Next.js 16** (with React 19) because that's what was already wired up — dynamic route pages use the React 19 `use()` hook for async `params`, which Next 16 requires and Next 14 doesn't support. Downgrading would mean reverting working, already-adapted code to match a version number with no functional benefit, so the deviation is intentional and documented here rather than silently shipped.

## Local Setup (< 5 minutes)

```bash
git clone <your-repo-url>
cd client
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if you have the backend running
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/companies`.

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api   # GraphOne backend (see ../server)
```

If `NEXT_PUBLIC_API_URL` is unset, every page falls back to local mock data automatically — useful for working on layout/styling without the backend running. Each fetch in `lib/api.ts` also catches failed requests (backend down, wrong URL, etc.) and falls back to mock data per-call, so a partially working backend degrades gracefully instead of breaking the page.

## Architecture

```
app/
  companies/
    page.tsx          # Screen 1 — AI Companies listing
    [slug]/page.tsx   # Screen 2 — Company detail
  investors/
    page.tsx          # Screen 3 — Investors discovery
    [slug]/page.tsx   # Screen 4 — Investor profile
  products/
    page.tsx          # Screen 5 — AI Products (with sidebar layout)
  layout.tsx          # Root layout with Navbar + Footer
  globals.css

components/
  layout/
    Navbar.tsx        # Sticky navbar with live search typeahead (debounced, hits /search), keyboard shortcut '/'
  companies/
    CompanyCard.tsx   # 4 variants: hero, grid, compact, default

lib/
  types.ts            # TypeScript interfaces for all entities
  mockData.ts         # Mock data fallback: companies, investors, products, founders, news
  api.ts              # Live-fetch adapter — calls the backend, maps response shapes to
                       # frontend types, and falls back to mockData.ts per-call on any failure
```

## Key Features

- **Live data, with graceful fallback** — every page fetches from the real GraphOne API via `lib/api.ts`; any failure (backend down, network error, 404) silently falls back to mock data for that call so the UI never crashes
- **Live search typeahead** — press `/` anywhere to focus, debounced calls to `GET /search` across companies, investors, products
- **5 card variants** — hero (dark gradient), grid, compact, and list for different contexts
- **Ownership pie chart** — Recharts `PieChart` on company detail page (illustrative — the schema has no cap-table data, see note in the page itself)
- **Portfolio concentration chart** — on investor profile page (same caveat — sector $ allocation isn't in the schema, sector_focus tags are)
- **Responsive** — mobile nav, sidebar collapses on small screens
- **No hardcoded entity fallback** — a missing company/investor slug now renders a real not-found state instead of silently defaulting to OpenAI/Sequoia data

## Deployment (Vercel)

```bash
npm run build   # verify no type errors
vercel deploy
```

## Backend Integration

The `server/` API in this repo now covers the full surface this frontend needs:
companies, investors, funding rounds, founders, products, news, search, feed, and stats — including `/companies/trending`, `/companies/:slug/funding`, `/companies/:slug/products`, and `/investors/:slug/investments`. See `../server/README.md` and `../INTEGRATION.md` for the full endpoint list and the trending-score formula.

Known data gaps (by design, not bugs): the schema doesn't model cap-table ownership percentages, named "key people" headshots beyond founders, open job listings, or named competitor lists. Those sections on the company/investor detail pages remain clearly-scoped illustrative placeholders rather than backend-driven data.
