
## Real company logos (added in this update)

`components/shared/Logo.tsx` now fetches real brand logos via [logo.dev](https://logo.dev)'s
image CDN, keyed by each entity's domain — replacing plain letter-avatars everywhere
(company cards, investor cards, product rows, detail-page headers, hero floating cards).

**To activate real logos:**
1. Get a free publishable token at https://logo.dev (no card required, ~30 seconds).
2. In `client/.env.local`, add: `NEXT_PUBLIC_LOGO_DEV_TOKEN=your_token_here`
3. Restart `npm run dev`.

**Until you add a token** (or for any logo that fails to load), every spot automatically
and silently falls back to the original letter-avatar treatment — nothing breaks, no
broken-image icons, the UI just looks exactly like it did before for that one logo.

