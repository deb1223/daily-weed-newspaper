# Daily Weed Newspaper — Build Status & Roadmap

## Current Status (as of April 25, 2026)
Site is LIVE at dailyweednewspaper.com — Stripe live mode, Auth gating Pro features end-to-end.
Newspaper expanded to **4 pages**. Lucky 7 replaces Top 10 on Page 1. Page 2 fully rebuilt per design handoff.

---

## Done ✅

### Session 1 (April 1)
- Next.js 15 app created at /Users/beecherfam/daily-weed-newspaper
- Deployed to Vercel (vegasplanpro team)
- Custom domain dailyweednewspaper.com connected
- Supabase connection working (force-dynamic, server component)
- Live data: 3,617 products, 16 dispensaries, 1,350 on sale
- Homepage: 3-page newspaper with Framer Motion page flip (expanded to 4 pages in Session 5)
- Page 1: masthead, ticker, stats row, 3-col layout, Top 5 Steals, category winners
- Page 2: Big Mike's Tea, Recharts avg price by category, Ziggy's Deeper Cuts (rebuilt in Session 5)
- Page 3: Tourist Terry's Strip Guide, Ziggy's Final Rating, pro upsell
- /prices: search + filter table, Compare Prices modal (free: top 3 + blur + upsell)
- Keyboard ← → navigation on newspaper pages
- Pagination at 50 rows on /prices
- GitHub repo: github.com/deb1223/daily-weed-newspaper
- Top 5 Steals: brand+category+dispensary dedup rule
- Color swap: forest green #2d6a4f as primary accent everywhere except ticker

### Session 2 (April 2)
- Size/weight column added to /prices table
- Conditional size filter dropdown (appears after category selected)
- mg/$ column — THC value score (sortable, Pro-gated sort)
- Category column removed (redundant with filter dropdown)
- "View Menu →" link in compare modal with PRO badge
- Category Winners on homepage — per-gram normalization
- Dead rows filtered from table: must have size OR THC% (accessories exempt)
- Tagline hidden on mobile (≤768px)
- Entire /prices mini-masthead tappable as single home link
- Page 3 mobile fix: collapses to single column same as Page 2
- Search, sort, size filter all reactive (no Search button click required)
- Dynamic edition number (days since April 1 2026)
- Full project docs suite: CONTEXT, BRAND, VOICE, ROADMAP,
  NEXT_PROMPT, GLOVE_SYSTEM, AUDIT, SESSION_HANDOFF

### Session 3 (April 3)
- LLM daily brief pipeline — Anthropic API (claude-sonnet-4-6, no extended thinking)
  - Cron at 0 15 * * * UTC (8am Las Vegas time)
  - Saves as status: 'draft' — never auto-publishes
  - Notification email to dan@vegasplanpro.com with full draft content
  - Admin review page at /admin/brief?secret=CRON_SECRET
  - One-click publish button → /api/publish-brief
  - Homepage reads from daily_briefs WHERE status = 'published', falls back to hardcoded
- daily_briefs Supabase table created (date pk, brief_json, status, created_at)
- subscribers Supabase table created (email, tier, city, created_at, confirmed)
- Email capture wired to Resend on homepage, page 3, and /prices modal
  - Welcome email: Ziggy-voiced, newspaper aesthetic HTML
  - Notification to dan@vegasplanpro.com on each signup
- Resend domain verified (dailyweednewspaper.com) — emails sending
- Ziggy's Hot Take banner on /prices
  - Pulls highest-discount product (>=15% off)
  - Rotates from 10 Ziggy one-liners
  - "See all deals →" activates sale-only filter
- Product-level URLs captured in scraper and stored in products table
  - Dutchie: dutchie.com/dispensary/{slug}/product/{id}
  - iHeartJane: iheartjane.com/embed/stores/{storeId}/products/{objectID}
  - Curaleaf: skipped (Sweed POS, non-standard URLs)
  - Compare modal shows "View Product →" linking directly to product page
  - "View Menu →" fallback when no product URL exists
- Stale/out-of-stock product cleanup on every scraper run
  - deleteStaleProducts() helper removes products no longer in dispensary menu
  - Runs after every dispensary scrape (Dutchie, Jane, Curaleaf)
  - Logs Removed N stale products per dispensary
- Hourly scraper cron added to vercel.json (0 * * * *)
  - /api/scrape endpoint — validates CRON_SECRET, spawns scraper
  - Masthead updated to "Updated hourly"
- Fixed product count: removed client-side filter silently dropping ~2,400 products
- Weight extraction fallback for Dutchie (measurements.netWeight.values[0])
- THC extraction fallback for Dutchie (THCContent.range[0])
- 3,426 clean live products across 16 dispensaries

### Session 5 (April 25)
- **4-page newspaper** — site expanded from 3 pages to 4; nav dots, keyboard nav, and corner curl all updated
- **Lucky 7 replaces Top 10** on Page 1 verdict cards — 7 categories, 7 colors, same data on Page 1 and Page 2
  - Categories: Cheapest Eighth, 1g Cart, 100mg Edible, 1g Live Resin, Single Pre-Roll, Infused Pre-Roll, 1g Disposable
  - `infused_preroll` is a new compute-winners category (infused/liquid diamond/live resin/kief pre-rolls)
  - Removed: best_value_flower, shake, rso, tinctures
- **compute-winners** chained to end of scrape script — winners always computed on fresh data, no separate cron
- **Page 2 — The Sheet** fully rebuilt per design handoff:
  - § Lucky 7 Market Averages — proportional bar chart, live avg prices from DB, 7-color category palette
  - § Big Mike's Local Tea — 3-column editorial, dropcaps, justified body, column rules
  - § Lucky 7 Price History — Day-1 SVG chart (ghost trails, one dot per category, TODAY guide, "⤳ LINES BUILD HERE")
  - Folio strip (PG. 2 · The Sheet), double-rule section dividers, page tail
- **Lucky7Averages** data type + `getLucky7Averages()` query added to data.ts (parallel fetch in getAllPageData)
- **`--cat-*` palette** added to globals.css (7 newspaper-native colors, all readable on newsprint)
- **Bottom CTA** replaced old pricing-tier upsell section with newspaper-style Morning Edition signup card
  - Stamp badge, Playfair + UnifrakturMaguntia headline, triple-rule form, receipt box, proof line
  - POSTs to /api/subscribe tier=free; button flips to "✓ In" without replacing form
- **/prices redirect** → /#sheet (The Sheet embedded inline on Page 1)
- **getDailyWinners two-query fix** — bypasses missing FK on daily_winners.product_id (PostgREST PGRST200 workaround)
- **daily_stats table** created and chained to scraper (pending: confirm migration applied)
- **evergreen_specials table** created and seeded (pending: confirm migration applied)

### Session 4 (April 19-20)
- Stripe live mode fully operational
  - Fixed critical env var misconfiguration: STRIPE_SECRET_KEY had webhook secret pasted in wrong field
  - Fixed STRIPE_WEBHOOK_SECRET (stale value from old account)
  - Fixed STRIPE_PRICE_MONTHLY/YEARLY trailing \n in env vars
  - Added missing SUPABASE_KEY to Vercel (required for webhook service role writes)
  - Upgraded Vercel CLI from 41.4.1 to 51.8.0 (was blocking deployment)
  - Switched to live mode: sk_live_ key, live price IDs, live webhook endpoint
  - Created Pro Monthly product in Stripe live mode ($9/month, tax-inclusive)
  - Product image uploaded (aged newsprint aesthetic, "Daily Weed Newspaper / Pro Member")
  - Webhook registered at https://www.dailyweednewspaper.com/api/webhook/stripe
    listening for: checkout.session.completed, customer.subscription.deleted, customer.subscription.updated
  - End-to-end payment flow verified with real debit card — Stripe → webhook → Supabase tier: 'pro' ✓
- Supabase Auth + Pro gate fully built
  - Installed @supabase/ssr (correct package for Next.js 15 App Router)
  - Updated src/lib/supabase.ts to createBrowserClient
  - Created src/lib/supabase-server.ts (createServerClient for server components)
  - Created middleware.ts — refreshes session cookies on every request, no routes blocked
  - Verified useUser.ts hook — returns { user, tier, loading }, no changes needed
  - RLS enabled on subscribers table:
    - Users can only read their own row (auth.email() = email)
    - Service role bypasses RLS (webhook writes unaffected)
  - Supabase Auth configured:
    - Site URL: https://www.dailyweednewspaper.com (was localhost:3000)
    - Redirect URLs: https://www.dailyweednewspaper.com/** (was empty)
    - Email confirmations: enabled
  - Pro gates wired to real auth session:
    - Compare modal: free users see 3 results + blur + upsell, Pro sees all
    - View Product links: Pro only (free users see dispensary name, no link)
    - mg/$ sort: Pro only (free users see inline upgrade prompt)
  - Auth UI added to /prices mini-masthead: "Log in for Pro →" / "Pro ✓ · sign out"
  - Pro welcome email gains "Access your Pro features →" CTA linking to /login?next=/prices
  - /login page verified: OTP flow, ?next= redirect, Ziggy error messages all working
- Favicon live (DWN graphic in browser tab) ✅

---

## Known Issues 🐛
- **Price truncation bug** — scraper drops decimals ($22.50 shows as $22, $4.50 shows as $4).
  Integer parse instead of float. Same root cause as missing weight on 0.5g carts.
  Fix both together — find every parseInt in scraper parsers and replace with parseFloat.
- Login entry point too obscure — needs more prominent placement beyond mini-masthead link
- OG image missing — blank on social share (critical before X marketing push)
- Ziggy intro on homepage still third-person Wikipedia voice — needs rewrite
- "Market Pulse" section has hardcoded/made-up stats — remove or make data-driven
- "$$9" double dollar sign bug in pricing tiers
- Nuwu product names contain raw POS codes e.g. "M{304} N{S/O}" — needs cleaning
- Curaleaf product URLs not captured (Sweed POS, non-standard)
- Some Kannabis brand products have no THC% — missing from Dutchie source data
- 3-month gift item: Toker Poker lighter sleeve (Sean Dietrich design, box of 25 @ $150 = $6 each + $4.50 shipping). Buy first box when approaching 25 three-month subscribers.

---

## Next Build Priority

### Immediate (bugs)
- [ ] Fix price truncation bug — parseFloat everywhere in scraper (fixes decimals + 0.5g weight)
- [ ] Login UX — make entry point more prominent/obvious on homepage and /prices
- [ ] OG image for social sharing (critical before X marketing)

### Immediate (polish)
- [ ] Rewrite Ziggy intro voice (first person)
- [ ] Fix/remove Market Pulse section
- [ ] Fix "$$9" double dollar sign bug
- [ ] Clean Nuwu product names (strip M{xxx} N{xxx} codes)

### V1.2 — This Week
- [ ] X/Twitter daily post automation (top 3 deals, 8am, human review before publish)
- [ ] Price alerts (Pro feature)
- [ ] Weekly email digest for light users
- [ ] CSV export (Pro feature)

### V2 — The Hand
- [ ] Ziggy anime hand SVG
- [ ] 6 skin tone variants
- [ ] Glove system (420 Leaf, Las Vegas, Ziggy, Gold Pro)
- [ ] "Share the Love, Get a Glove" referral mechanic
- [ ] Ziggy's Drip loyalty system (points, tiers, merch)
- [ ] Glove merch print-on-demand

### V3 — City Expansion
- [ ] Denver → LA → Phoenix → Seattle → Chicago → Detroit
- [ ] City selector on homepage
- [ ] Same Ziggy voice, local pricing data
- [ ] Free users: Las Vegas only. Pro: all cities.

### Marketing (when ready)
- [ ] X/Twitter daily post — top 3 free deals
- [ ] QR code water bottle labels for Strip distribution
- [ ] Dispensary staff free Pro accounts (budtender advocacy)
- [ ] Reddit: r/vegaslocals, r/LasVegas

---

## Key Technical Decisions (don't relitigate)
- Model: claude-sonnet-4-6 (no extended thinking — unnecessary for creative writing)
- Draft/publish workflow: never auto-publish, always human review
- Scraper runtime: npx tsx scripts/scrape-dispensaries.ts (not ts-node)
- CRON_SECRET used for both cron auth and admin page access
- Stale product deletion: by UUID after name-match, not by in_stock flag
- Product URLs: only Dutchie and iHeartJane — Curaleaf/Sweed skipped
- Auth: @supabase/ssr (not auth-helpers-nextjs — deprecated)
- Auth method: magic link / email OTP only — no passwords
- Pro gate: reads tier from subscribers table via useUser hook — not from Stripe directly
- Stripe: monthly only ($9/month) — no annual plan for first 6 months minimum
- Pricing: tax-inclusive — $9 flat, no tack-on at checkout
- Yearly price ID in Vercel: stale/unused — safe to ignore

---

## Financial Model
| Milestone | Subscribers | MRR |
|-----------|-------------|-----|
| LV launch | 100 | $900 |
| LV mature | 500 | $4,500 |
| + Denver | 800 | $7,200 |
| + Phoenix | 1,100 | $9,900 |
| + LA | 1,500 | $13,500 |
| Goal | 2,223 | $20,007 |

Target: April 2027. 12 months from launch.
