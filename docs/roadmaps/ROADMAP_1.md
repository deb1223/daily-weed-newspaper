# Daily Weed Newspaper — Build Status & Roadmap

## Current Status (as of April 1, 2026)
Site is LIVE at dailyweednewspaper.com

### Done ✅
- Next.js 15 app created at /Users/beecherfam/daily-weed-newspaper
- Deployed to Vercel (vegasplanpro team)
- Custom domain dailyweednewspaper.com connected
- Supabase connection working (force-dynamic, server component)
- Live data loading: 3,617 products, 16 dispensaries, 1,350 on sale
- Homepage: 3-page newspaper with Framer Motion page flip
- Page 1: masthead, ticker, stats row, 3-col layout, Top 5 Steals, category winners
- Page 2: Big Mike's Tea, Recharts avg price by category, Ziggy's Deeper Cuts
- Page 3: Tourist Terry's Strip Guide, Ziggy's Final Rating, pro upsell
- /prices: search + filter table, Compare Prices modal (free: top 3 + blur + upsell)
- Keyboard ← → navigation on newspaper pages
- Pagination at 50 rows on /prices
- GitHub repo: github.com/deb1223/daily-weed-newspaper

### Known Issues 🐛
- Top 5 Steals: all 5 currently from Planet 13 — need max-2-per-dispensary rule
- Accent color: still some #c8390a instances outside ticker (need full green swap)
- Edition number: hardcoded #001 (needs dynamic days-since-launch calc)
- Ticker copy: hardcoded, not pulling real deal data dynamically

### In Progress 🔄
- Color swap: all accent → #2d6a4f forest green (except ticker)

## Next Build Priority (pinned prompt — ready to send)
See NEXT_PROMPT.md

## Roadmap

### V1.1 — This Week
- [ ] Fix top 5 dedup (max 2 per dispensary)
- [ ] Full color swap to forest green
- [ ] Dynamic edition number
- [ ] Dynamic ticker with real deal data
- [ ] Ziggy's Pick of the Moment banner on /prices
- [ ] Email capture wired to Resend
- [ ] Welcome email (Ziggy-voiced, newspaper aesthetic)
- [ ] Subscriber notification to danieledwardbeecher@gmail.com

### V1.2 — Next Week  
- [ ] LLM daily brief generation (Anthropic API + Vercel Cron at 8am)
- [ ] daily_briefs Supabase table
- [ ] Homepage reads from daily_briefs, falls back to hardcoded
- [ ] Price alerts (user sets alert for product/category/price threshold)
- [ ] Stripe integration (Pro tier paywall)
- [ ] Auth (Supabase Auth — email magic link)

### V2 — The Hand
- [ ] Ziggy anime hand SVG (commission illustrator or generate with AI)
- [ ] 6 skin tone variants
- [ ] Glove system: 420 Leaf, Las Vegas, Ziggy, Gold Pro
- [ ] "Share the Love, Get a Glove" referral mechanic
- [ ] Glove unlock tracks via Supabase (referral count per user)
- [ ] Glove merch (print-on-demand, SVG → products)

### V3 — City Expansion
- [ ] Denver scraper (same architecture as LV)
- [ ] City selector on homepage
- [ ] Same Ziggy voice, local pricing data
- [ ] Pro sub covers all cities
- [ ] Repeat for Phoenix, LA, Seattle, Chicago, Detroit

### Long-term
- [ ] X/Twitter bot: daily free top 3 post (drives top-of-funnel)
- [ ] Weekly email digest for light users
- [ ] MCP endpoint for Pro users' own AI agents
- [ ] CSV export
- [ ] "Digital Magazine" archive (SEO + portfolio)
- [ ] Historical price tracking (know the trends)
- [ ] National brand play

## Marketing Plan
**Top of funnel:** Daily X post — top 3 deals free, link to full report
**Conversion:** Free scrolling table → Pro upgrade prompt
**Retention:** Daily 8am email, Ziggy's voice keeps them subscribed
**Viral:** "Share the Love, Get a Glove" referral program
**Guerrilla:** QR code water bottle labels for Strip distribution (from VPP playbook)

## Financial Model
| Milestone | Subscribers | MRR |
|-----------|-------------|-----|
| LV launch | 100 | $900 |
| LV mature | 500 | $4,500 |
| + Denver | 800 | $7,200 |
| + Phoenix | 1,100 | $9,900 |
| + LA | 1,500 | $13,500 |
| Goal | 2,223 | $20,000 |

Target: April 2027. 12 months from launch.
