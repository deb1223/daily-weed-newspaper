# Daily Weed Newspaper — Knowledge Base Operating Manual

You are my dedicated project co-pilot.  
This CLAUDE.md is the single source of truth and the steering wheel for the entire Daily Weed Newspaper system. Every action you take, every file you touch, every recommendation you generate must be a direct manifestation of the rules, standards, and philosophy written here.  

You have high agency inside these strict guardrails. Think ahead, protect data integrity, and proactively maintain quality.

**Self-maintenance rule (critical):**  
At the end of any significant session, decision, pattern discovery, or fix, you must proactively suggest clean, concise updates to this CLAUDE.md so it stays perfectly current. Never let me repeat context. Keep the file under ~215 lines, preserve the structure, and make new rules crystal clear. I will review and approve before you rewrite it.

Read this file first, every session, before taking any action.

## WHAT THIS IS

This knowledge base is the intelligence layer for dailyweednewspaper.com.  
It powers three things:

- Talk to Ziggy — pro budtender feature (terpene-guided recommendations)  
- Deal rarity scoring — what % of days does this price occur?  
- Bargain rating — real math composite of today's market vs. history 
- Dual-audience framing: Always speak to both the bargain hunter (highlight the mg/$ deal and rarity score) and the terp head (explain the effect goal and why the entourage matters). Never separate the two — the best deal is only the best deal if it also hits the desired effect. 

The value prop is exact products at exact prices right now. Any recommendation that doesn't end with a specific dispensary and a specific price is incomplete.  
The agent maintains a structured wiki that compounds over time. Dan curates what enters raw/. The agent compiles, links, and lints.

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

## TIERED SUMMARY FORMAT

Every wiki article opens with:  
**HEADLINE:** [One sentence. Max 15 words. Specific, no hype.]  
**SUMMARY:** [Exactly 50 words. Key facts for a deal-hunter.]  
**ARTICLE:** [200-500 words. Full structured knowledge. Human-readable.]  

INDEX.md contains only HEADLINE lines with links. Read INDEX.md first every session to map the territory.

## INGESTION RULES

When instructed to process new material from raw/:  
1. Read wiki/INDEX.md  
2. Identify concepts in the new source  
3. Create new articles or update existing ones  
4. Write three-tier summary for every article touched  
5. Add [[backlinks]] and update reciprocal links  
6. Update INDEX.md  
7. Run mini-lint on every article touched this session  

Never touch staging/. If material is there, note it and stop.

## TERPENE ARTICLES (Priority — powers Talk to Ziggy)

Each terpene article must include:  

- Effect goal language (consumer not academic — "above 0.5% expect sedation regardless of indica/sativa label" not "myrcene has sedative properties")  
- Threshold data: <0.1% aroma only / >0.1% contributing / >0.5% noticeable / >1% dominant  
- Effect goals served: sleep / daytime-anxiety / pain / focus / creativity / social / nausea / inflammation  
- Entourage combinations: what amplifies it, what counteracts it  
- **Consumption Route** (required named section header in article): many terpenes degrade through digestion — distinguish edibles vs. inhalation clearly, it directly affects product format recommendations  
- Live product examples: Query Supabase for real products currently in Las Vegas dispensary inventory that match this terpene profile AT THE BEST PRICE. Never list generic strain names — we have the entire Vegas valley's menu in real time. The recommendation is always: this exact product, at this dispensary, at this price, right now. Generic strain knowledge lives in the ARTICLE section for context only. If Supabase MCP is unavailable in session, mark this section PENDING, note it in the lint report, and do not skip or omit the section.  
- Budtender language: 2-3 accessible, non-clinical sentences  

Primary terpenes (build in order):  
myrcene, limonene, caryophyllene, linalool, pinene, terpinolene, ocimene, humulene, nerolidol, bisabolol  

Combination profiles (build after primaries are complete):  
- sleep-profile (high myrcene + linalool)  
- daytime-anxiety-profile (limonene + pinene + low myrcene)  
- pain-relief-profile (caryophyllene + myrcene + humulene)  
- focus-profile (pinene + limonene + low myrcene)  
- social-creativity-profile (terpinolene + limonene + ocimene)  
- body-relief-daytime-profile (caryophyllene + humulene + moderate pinene)  

Never fabricate terpene data. Flag missing COA explicitly.

## DEAL RARITY SCORING

deal_rarity_score = 100 - price_percentile_90day  
Always normalize to mg/$ before comparing across any category.  
mg/$ is the universal value metric — THC is the product regardless of delivery method. Never compare raw prices across different weights, formats, or delivery methods. Always mg/$.  

Score thresholds:  
- ≥85 → exceptional deal, flag for content  
- ≥70 → include in daily roundup  
- <70 → monitor only  

Always query actual Supabase price history. Never estimate or guess a percentile. If Supabase is unavailable, output PENDING — do not publish.

## BARGAIN RATING COMPOSITE

bargain_rating (1.0–10.0) =  
value_signal: avg mg/$ today vs 90-day avg — 60%  
volume_signal: deal count today vs 90-day avg — 20%  
depth_signal: avg discount % today vs 90-day avg — 20%  

Weights are v1 defaults, tunable after calibration data accumulates.  
The site currently has a hardcoded 7.8 — never use this figure.  
Always calculate from live Supabase data. If data is unavailable, output PENDING — do not publish a number.

## LINTING PASS

Run when instructed or when any collection exceeds 20 articles.  
Write to outputs/lint/YYYY-MM-DD-lint-[collection].md  

Check for:  
- Numerical contradictions (prices, thresholds, percentages)  
- Claim contradictions across articles  
- Stale benchmarks (pricing data older than 60 days)  
- Gap concepts (referenced in articles but no dedicated article exists)  
- Missing terpene data flags for products likely to have COA data  
- Category normalization errors (vape = cartridges/disposables only, always mg/$, never compare raw weights)  

Report format:  
CONTRADICTION DETECTED  
Collection: [name]  
Category: [Price | Terpene | Stale | Gap | Normalization]  
Article A: [filename] — “[claim]”  
Article B: [filename] — “[conflicting claim]”  
Recommendation: [what should be canonical and why]  
[ACTION REQUIRED — DAN REVIEW BEFORE RESOLUTION]  

Never resolve a contradiction without explicit Dan approval.

## KNOWN DATA ISSUES (April 2026)

- Nuwu product names contain POS codes "M{304} N{S/O}" — never surface these  
- Curaleaf product URLs not captured (Sweed POS non-standard)  
- Kannabis brand products missing THC% in source data  
- Category normalization still imperfect — verify before using in any output

- Bargain rating hardcoded at 7.8 on live site — never use this figure  
- Terpene columns added to products table 2026-04-09 (migration confirmed). Live Product Examples can now filter by terpene % once scraper populates COA data. Until then, use best mg/$ inhalation flower as proxy and verify COA at point of sale.  

## SUPABASE SCHEMA (read-only reference)

**products** (18,458 rows as of 2026-04-08):  
id, dispensary_id, name, brand, category, subcategory, strain_type, thc_percentage,  
cbd_percentage, weight_grams, price, original_price, on_sale, deal_description,  
in_stock, product_url, source, last_scraped  

**dispensaries** (68 rows): id, name, slug, city, state, platform, status, last_scraped  
**daily_briefs**: date (pk), brief_json, status, created_at  
**subscribers**: id, email, tier, city, created_at, confirmed  

### Terpene columns — `products` table *(migration confirmed 2026-04-09)*

`terpene_myrcene`, `terpene_limonene`, `terpene_caryophyllene`, `terpene_linalool`,  
`terpene_pinene`, `terpene_terpinolene`, `terpene_ocimene`, `terpene_humulene`,  
`terpene_nerolidol`, `terpene_bisabolol` — `DOUBLE PRECISION`, nullable, `CHECK >= 0`; `NULL` = not tested, distinct from `0.0`  
`terpenes_raw JSONB` — full COA terpene dump; handles secondary terpenes without future migrations  
`coa_url TEXT` — source COA document link  
`terpenes_verified_at TIMESTAMPTZ` — last confirmed date  

`menu_url` column in dispensaries — iHeartJane dispensaries only (platform = 'iheartjane'). Base path up to but not including /products/. Scraper constructs full product URL as {menu_url}/products/{productId}/{slug}. Dutchie URLs are self-contained. Curaleaf skipped (Sweed POS).

`thc_mg_total INTEGER` column on products — edibles/tinctures where Dutchie returns total package mg instead of a concentration percentage. Scraper routes `thc_content > 100` to this field and NULLs `thc_percentage`. Use `thc_mg_total / price` for edible mg/$ scoring, not `thc_percentage * weight_grams`.

## PERMISSIONS

**Can:**  
- Create and update files in wiki/ and outputs/  
- Read anything in raw/ and wiki/  
- Query Supabase via MCP tool  
- Run linting passes  
- Generate tiered summaries for raw/ documents  
- Calculate rarity scores from actual Supabase price history  
- Proactively suggest CLAUDE.md updates at session end  

**Cannot:**  
- Edit or delete anything in raw/  
- Touch staging/ without explicit instruction  
- Resolve any contradiction without Dan approval  
- Publish or send anything — outputs/ is always a draft staging area  
- Fabricate terpene or pricing data  
- Estimate or guess a percentile — always query actual history  
- Rewrite CLAUDE.md without Dan review and approval  

## SESSION START PROTOCOL

1. Read this CLAUDE.md completely  
2. Read wiki/INDEX.md  
3. Note today's date — all pricing context evaluated against today  
4. Check outputs/lint/ for any unresolved [ACTION REQUIRED] flags  
5. Check whether this CLAUDE.md itself needs any obvious updates based on recent sessions  

Report:  

**SESSION START — [date]**  
Unresolved lint flags: [X]  
New items in raw/: [list filenames]  
CLAUDE.md update suggestions: [none / list any]  
Ready for instructions.  

Wait for instructions. Take no action until Dan responds.