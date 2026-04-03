# Daily Weed Newspaper — Build Status & Roadmap

## Current Status (as of April 2, 2026)
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
  - Flower: 1g / 3.5g / 7g / 14g / 28g
  - Pre-Rolls: 0.5g / 1g / multi-pack
  - Vape: 0.3g / 0.5g / 1g / 2g
  - Concentrates: 0.5g / 1g / 2g
  - Edibles: 5mg / 10mg / 25mg / 50mg / 100mg / 200mg+
  - Label changes to "Dose" for edibles/tinctures
- mg/$ column — THC value score (THE STAR FEATURE)
  - Formula: (thc% / 100 * weight_grams * 1000) / price for flower/vape/concentrates/pre-rolls
  - Formula: extracted_mg / price for edibles
  - Sortable column (Pro-gated sort, values visible to all)
  - Free users see tooltip on sort: "Sort by value score is a Pro feature"
- Category column removed (redundant with filter dropdown)
- "View Menu →" link in compare modal with PRO badge
  - Dutchie → dutchie.com/dispensary/{slug}/menu
  - iHeartJane → iheartjane.com/dispensaries/{slug}
  - Fallback → Google search
- Category Winners on homepage — per-gram normalization
  - Flower ($/g): lowest price/gram, weight ≤ 14g
  - Pre-Rolls ($/g): lowest price/gram, weight ≤ 5g
  - Vape ($/g): lowest price/gram, weight ≤ 2g
  - Concentrates ($/g): lowest price/gram, weight ≤ 3g
  - Edibles (100mg): cheapest 100mg product only
- Dead rows filtered from table: must have size OR THC% (accessories exempt)
- Tagline hidden on mobile (≤768px)
- Entire /prices mini-masthead tappable as single home link
- Page 3 mobile fix: collapses to single column same as Page 2
- Search, sort, size filter all reactive (no Search button click required)
- "Daily Weed Newspaper" on /prices links home with hover effect
- Dynamic edition number (days since April 1 2026)
- Full project docs suite: CONTEXT, BRAND, VOICE, ROADMAP,
  NEXT_PROMPT, GLOVE_SYSTEM, AUDIT, SESSION_HANDOFF

---

## Known Issues 🐛
- Product-level URLs not in database (View Menu → dispensary menu, not specific product)
- Data last scraped March 29 — verify cron job running on Vercel
- "$$9" double dollar sign bug in pricing tiers
- No favicon
- No OG image for social sharing (critical before X marketing)
- Ziggy intro on homepage still third-person Wikipedia voice — needs rewrite
- "Market Pulse" section has hardcoded/made-up stats — remove or make data-driven
- Auth/Stripe not built — Pro gate is visual only

---

## Next Build Priority

### Immediate (next session)
- [ ] Favicon — "DWN" in forest green
- [ ] OG image for social sharing
- [ ] Email capture → Resend (see NEXT_PROMPT.md)
- [ ] Verify scraper cron job — data is stale since March 29

### V1.2 — This Week
- [ ] LLM daily brief (Anthropic API + Vercel Cron 8am)
- [ ] daily_briefs Supabase table
- [ ] Homepage reads from daily_briefs, falls back to hardcoded
- [ ] Price alerts
- [ ] Stripe + Supabase Auth (Pro tier)
- [ ] Product-level URLs scraped and stored
- [ ] Rewrite Ziggy intro voice (first person)
- [ ] Fix/remove Market Pulse section

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

### Marketing (after email capture works)
- [ ] X/Twitter daily post — top 3 free deals
- [ ] QR code water bottle labels for Strip distribution
- [ ] Weekly email digest for light users

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
