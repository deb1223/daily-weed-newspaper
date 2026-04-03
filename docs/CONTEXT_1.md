# Daily Weed Newspaper — Master Context

## What It Is
dailyweednewspaper.com — a Las Vegas cannabis price intelligence newspaper.
Funny first, entertaining second, helpful third. Not a SaaS product. A newspaper.

## The Pitch
"The only cannabis publication that actually gives a damn about your wallet."

## Business Model
- Free tier: scrolling filterable price table (3,617 products, 16 dispensaries)
- Pro tier: $9/month or $99/year
  - Daily Ziggy report emailed at 8am
  - Interactive price comparison dashboard
  - Personal price alerts
  - Full CSV export
  - MCP access for their own AI agents
  - All future cities included

## Revenue Goal
$20k/month by April 2027. ~2,223 subscribers at $9/mo.
Phase 1: 100 LV subscribers ($900/mo). Then city-by-city expansion.

## City Expansion Plan
Las Vegas (live) → Denver → Phoenix → Los Angeles → Seattle → Chicago → Detroit
Same Ziggy voice everywhere. Local pricing data per city. Pro sub covers all cities.

## Tech Stack
- Next.js 15 App Router (at /Users/beecherfam/daily-weed-newspaper)
- Supabase (same project as vegasplanpro.com)
- Vercel (deployed at dailyweednewspaper.com)
- Resend (email delivery)
- Anthropic API claude-sonnet-4-20250514 (daily brief generation)
- Framer Motion (page flip animation)
- Recharts (price trend chart on page 2)

## Supabase Tables
- `dispensary_products` — main data (3,617 products)
  - id, name, brand, category, price, original_price, on_sale, thc_percentage
  - weight_grams, dispensary_id, source, last_scraped, created_at, updated_at
  - joined to `dispensaries` via dispensary_id
- `dispensaries` — 16 Las Vegas dispensaries
  - id, name, city
- `daily_briefs` — LLM-generated daily content (TO BUILD)
  - date (pk), brief_json, created_at
- `subscribers` — email list (TO BUILD)
  - email, tier, city, created_at, confirmed

## Environment Variables (Vercel + .env.local)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- ANTHROPIC_API_KEY (for daily brief generation)
- RESEND_API_KEY (for email)
- CRON_SECRET (secures the cron endpoint)

## GitHub
- Repo: github.com/deb1223/daily-weed-newspaper
- Vercel team: vegasplanpro
- Auto-deploy: not yet wired (deploy manually with `npx vercel --prod`)

## Owner
Dan Beecher — founder, editor in chief
- Poker dealer at The Venetian (part-time, multi-day stretches for project work)
- Also runs vegasplanpro.com (MCP server infrastructure, activity database)
- Goal: $100k saved by April 2027 for Sandpoint/Selle Valley Idaho land purchase
- Workflow: Claude for architecture/strategy → prompt → Claude Code for execution
