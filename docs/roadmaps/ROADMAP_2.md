# Daily Weed Newspaper — Build Status & Roadmap

## Current Status (as of April 3, 2026)
Site is LIVE at dailyweednewspaper.com

---

## Done ✅

### Session 1 (April 1)
- Next.js 15 app created at /Users/beecherfam/daily-weed-newspaper
- Deployed to Vercel (vegasplanpro team)
- Custom domain dailyweednewspaper.com connected
- Supabase connection working (force-dynamic, server component)
- Live data: 3,617 products, 16 dispensaries, 1,350 on sale
- Homepage: 3-page newspaper with Framer Motion page flip
- Page 1: masthead, ticker, stats row, 3-col layout, Top 5 Steals, category winners
- Page 2: Big Mike's Tea, Recharts avg price by category, Ziggy's Deeper Cuts
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

---

## Known Issues 🐛
- No favicon
- No OG image for social sharing (critical before X marketing)
- Ziggy intro on homepage still third-person Wikipedia voice — needs rewrite
- "Market Pulse" section has hardcoded/made-up stats — remove or make data-driven
- Auth/Stripe not built — Pro gate is visual only
- "$$9" double dollar sign bug in pricing tiers
- Nuwu product names contain raw POS codes e.g. "M{304} N{S/O}" — needs cleaning
- Curaleaf product URLs not captured (Sweed POS, non-standard)
- Some Kannabis brand products have no THC% — missing from Dutchie source data
- SCRAPER_PATH env var may need setting in Vercel for /api/scrape to find script

---

## Next Build Priority

### Immediate
- [ ] Stripe + Supabase Auth (Pro tier — gate is visual only right now)
- [ ] Favicon — "DWN" in forest green
- [ ] OG image for social sharing (critical before X marketing)
- [ ] Clean Nuwu product names (strip M{xxx} N{xxx} codes)
- [ ] Rewrite Ziggy intro voice (first person)
- [ ] Fix/remove Market Pulse section
- [ ] Fix "$$9" double dollar sign bug

### V1.2 — This Week
- [ ] Price alerts
- [ ] X/Twitter daily post automation (top 3 deals)
- [ ] Weekly email digest for light users

### V2 — The Hand
- [ ] Ziggy anime hand SVG
- [ ] 6 skin tone variants
- [ ] Glove system (420 Leaf, Las Vegas, Ziggy, Gold Pro)
- [ ] "Share the Love, Get a Glove" referral mechanic
- [ ] Glove merch print-on-demand

### V3 — City Expansion
- [ ] Denver → Phoenix → LA → Seattle → Chicago → Detroit
- [ ] City selector on homepage
- [ ] Same Ziggy voice, local pricing data

### Marketing (when ready)
- [ ] X/Twitter daily post — top 3 free deals
- [ ] QR code water bottle labels for Strip distribution
- [ ] Weekly email digest for light users
- [ ] Dispensary staff free Pro accounts (budtender advocacy)

---

## Key Technical Decisions (don't relitigate)
- Model: claude-sonnet-4-6 (no extended thinking — unnecessary for creative writing)
- Draft/publish workflow: never auto-publish, always human review
- Scraper runtime: npx tsx scripts/scrape-dispensaries.ts (not ts-node)
- Scraper lives in vegas-itinerary-pro repo
- CRON_SECRET used for both cron auth and admin page access
- Stale product deletion: by UUID after name-match, not by in_stock flag
- Product URLs: only Dutchie and iHeartJane — Curaleaf/Sweed skipped

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
