@AGENTS.md
# Daily Weed Newspaper — Knowledge Base Operating Manual
# Read this file first, every session, before taking any action.

---

## WHAT THIS IS

This knowledge base is the intelligence layer for dailyweednewspaper.com.
It powers three things:
1. Talk to Ziggy — pro budtender feature (terpene-guided recommendations)
2. Deal rarity scoring — what % of days does this price occur?
3. Bargain rating — real math composite of today's market vs. history

The value prop is exact products at exact prices right now, not generic
guidance. Any recommendation that doesn't end with a specific dispensary
and a specific price is incomplete.

The agent maintains a structured wiki that compounds over time.
Dan curates what enters raw/. The agent compiles, links, and lints.

---

## DIRECTORY STRUCTURE

/dwn-knowledge/
├── CLAUDE.md
├── raw/                  ← Source material. APPEND ONLY. Never edit.
│   ├── dispensaries/
│   ├── products/
│   ├── terpenes/
│   └── market/
├── staging/              ← Unreviewed. NEVER process without instruction.
├── wiki/
│   ├── INDEX.md          ← One headline per article. Agent's map.
│   ├── dispensaries/
│   ├── products/
│   ├── terpenes/
│   └── market/
└── outputs/
    ├── lint/
    └── budtender/

---

## TIERED SUMMARY FORMAT

Every wiki article opens with these three sections:

HEADLINE: [One sentence. Max 15 words. Specific, no hype.]
SUMMARY: [Exactly 50 words. Key facts for a deal-hunter.]
ARTICLE: [200-500 words. Full structured knowledge. Human-readable.]

INDEX.md contains only HEADLINE lines with links.
The agent reads INDEX.md first every session to map the territory.

---

## INGESTION RULES

When instructed to process new material from raw/:

1. Read wiki/INDEX.md
2. Identify concepts in the new source
3. Create new articles or update existing ones
4. Write three-tier summary for every article touched
5. Add [[backlinks]] to related articles
6. Update articles that should now link back to new content
7. Update INDEX.md
8. Run mini-lint on every article touched this session

Never touch staging/. If material is there, note it and stop.

---

## TERPENE ARTICLES

Priority collection — powers the Talk to Ziggy budtender feature.

Each terpene article must include:

- **Effect goal language:** Written for consumers, not academics.
  "Above 0.5% in a COA expect sedation regardless of indica/sativa label"
  not "myrcene has sedative properties"

- **Threshold data:** <0.1% aroma only / >0.1% contributing /
  >0.5% noticeable / >1% dominant

- **Effect goals served:** sleep / daytime-anxiety / pain / focus /
  creativity / social / nausea / inflammation

- **Entourage combinations:** what amplifies it, what counteracts it

- **Consumption note:** many terpenes degrade through digestion —
  note this clearly per terpene, it affects product recommendations

- **Live product examples:** Query Supabase for real products currently
  in Las Vegas dispensary inventory that match this terpene profile
  AT THE BEST PRICE. Never list generic strain names — we have the
  entire Vegas valley's menu in real time. The recommendation is always:
  this exact product, at this dispensary, at this price, right now.
  Generic strain knowledge lives in the ARTICLE section for context only.

- **Budtender language:** 2-3 sentences, accessible, non-clinical.
  How you'd explain this terpene to someone at a dispensary counter.

Primary terpenes (build in order):
myrcene, limonene, caryophyllene, linalool, pinene,
terpinolene, ocimene, humulene, nerolidol, bisabolol

Combination profiles to build after primary terpenes are complete:
- sleep-profile (high myrcene + linalool)
- daytime-anxiety-profile (limonene + pinene + low myrcene)
- pain-relief-profile (caryophyllene + myrcene + humulene)
- focus-profile (pinene + limonene + low myrcene)
- social-creativity-profile (terpinolene + limonene + ocimene)
- body-relief-daytime-profile (caryophyllene + humulene + moderate pinene)

Never fabricate terpene data. If a product has no COA data, say so
explicitly and flag it for the scraper enhancement queue.

---

## DEAL RARITY SCORING

deal_rarity_score = 100 - price_percentile_90day

Always normalize to mg/$ before comparing across any category.
mg/$ is the universal value metric — THC is the product regardless
of delivery method. It works across flower, edibles, vapes, and
concentrates simultaneously and produces content anyone understands.
Never compare raw prices across different weights, formats, or
delivery methods. Always mg/$.

Score thresholds:
- ≥85 → exceptional deal, flag for content
- ≥70 → include in daily roundup
- <70 → monitor only

Always query actual Supabase price history.
Never estimate or guess a percentile.
If Supabase is unavailable, output PENDING — do not publish.

---

## BARGAIN RATING COMPOSITE

bargain_rating (1.0–10.0) =
  value_signal:  avg mg/$ today vs 90-day avg        — 60%
  volume_signal: deal count today vs 90-day avg       — 20%
  depth_signal:  avg discount % today vs 90-day avg   — 20%

Weights are v1 defaults, tunable after calibration data accumulates.
The site currently has a hardcoded 7.8 — never use this figure.
Always calculate from live Supabase data.
If data is unavailable, output PENDING — do not publish a number.

---

## LINTING PASS

Run when instructed or when any collection exceeds 20 articles.
Write to outputs/lint/YYYY-MM-DD-lint-[collection].md

Check for:
- Numerical contradictions (prices, thresholds, percentages)
- Claim contradictions across articles
- Stale benchmarks (pricing data older than 60 days)
- Gap concepts (referenced in articles but no dedicated article exists)
- Missing terpene data flags for products likely to have COA data
- Category normalization errors (vape = cartridges/disposables only,
  always mg/$, never compare raw weights)

Report format:

CONTRADICTION DETECTED
Collection: [name]
Category: [Price | Terpene | Stale | Gap | Normalization]
Article A: [filename] — "[claim]"
Article B: [filename] — "[conflicting claim]"
Recommendation: [what should be canonical and why]
[ACTION REQUIRED — DAN REVIEW BEFORE RESOLUTION]

Never resolve a contradiction without explicit Dan approval.

---

## KNOWN DATA ISSUES (April 2026)

- Nuwu product names contain POS codes "M{304} N{S/O}" — never surface these
- Curaleaf product URLs not captured (Sweed POS non-standard)
- Kannabis brand products missing THC% in source data
- Category normalization still imperfect — verify before using in any output
- Bargain rating hardcoded at 7.8 on live site — never use this figure

---

## SUPABASE SCHEMA (read-only reference)

dispensary_products:
  id, name, brand, category, price, original_price, on_sale
  thc_percentage, weight_grams, dispensary_id
  product_url, last_scraped

dispensaries:
  id, name, city

daily_briefs:
  date (pk), brief_json, status, created_at

subscribers:
  email, tier, city, created_at, confirmed, referral_count

---

## PERMISSIONS

Can:
- Create and update files in wiki/ and outputs/
- Read anything in raw/ and wiki/
- Query Supabase via MCP tool
- Run linting passes
- Generate tiered summaries for raw/ documents
- Calculate rarity scores from actual Supabase price history

Cannot:
- Edit or delete anything in raw/
- Touch staging/ without explicit instruction
- Resolve any contradiction without Dan approval
- Publish or send anything — outputs/ is always a draft staging area
- Fabricate terpene or pricing data
- Estimate or guess a percentile — always query actual history

---

## SESSION START PROTOCOL

1. Read this file completely
2. Read wiki/INDEX.md
3. Note today's date — all pricing context evaluated against today
4. Check outputs/lint/ for any unresolved [ACTION REQUIRED] flags
5. Report:

SESSION START — [date]
Unresolved lint flags: [X]
New items in raw/: [list filenames]
Ready for instructions.

Wait for instructions. Take no action until Dan responds.