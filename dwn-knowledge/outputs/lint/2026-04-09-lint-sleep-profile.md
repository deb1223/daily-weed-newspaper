# Lint Report — Sleep Profile
**Date:** 2026-04-09
**Articles reviewed:** sleep-profile.md
**Session sources:** All 10 primary terpene articles; no new PDFs consulted (synthesis article)

---

## Issues Found

### 1. [ACTION REQUIRED — DAN] PENDING — Live Product Section Requires Supabase
**Category:** Data Gap
**Article:** sleep-profile.md

Supabase MCP token expired at the start of this combination-profile session. Live product section is marked PENDING per CLAUDE.md protocol. Terpene columns are not yet populated in any case — but a proxy-genetics query could be run once MCP is re-authorized.

**When to resolve:** Re-authorize Supabase MCP and run:
```sql
-- Proxy (terpene columns not yet populated):
SELECT p.name, d.name, p.thc_percentage, p.weight_grams, p.price,
  ROUND(CAST((p.weight_grams * 1000 * (p.thc_percentage / 100)) / p.price AS numeric), 1) AS mg_per_dollar,
  p.on_sale, p.product_url
FROM products p JOIN dispensaries d ON p.dispensary_id = d.id
WHERE p.in_stock = true
  AND p.category ILIKE '%flower%'
  AND (p.name ILIKE '%Bubba Kush%' OR p.name ILIKE '%Purple%'
    OR p.name ILIKE '%Granddaddy%' OR p.name ILIKE '%Northern Lights%'
    OR p.name ILIKE '%Afghani%' OR p.name ILIKE '%Hindu Kush%'
    OR p.name ILIKE '%Blueberry%' OR p.name ILIKE '%Do-Si-Do%'
    OR p.name ILIKE '%Lavender%')
  AND p.name NOT ILIKE '%M{%' AND p.name NOT ILIKE '%N{%'
ORDER BY mg_per_dollar DESC LIMIT 8;
```
Replace with terpene-column query once `terpene_myrcene` and `terpene_linalool` are populated.

---

### 2. CLAIM CONSISTENCY — Linalool Sex Difference Applied Correctly
**Category:** Claim consistency
**Article:** sleep-profile.md

Cannabinoid section notes: "males show greater potentiation with earlier onset; females show delayed and reduced additive effects." This is consistent with the linalool.md documentation of LaVigne (2021) sex-specific pharmacology. The article handles this by noting it as a "start low" caution rather than a sex-specific dosing recommendation — appropriate given that Talk to Ziggy does not currently collect sex/biological context from users.

---

### 3. CROSS-ARTICLE CONSISTENCY CHECK
**Category:** Claim consistency
**Articles:** sleep-profile.md ↔ myrcene.md ↔ linalool.md ↔ nerolidol.md ↔ caryophyllene.md

- myrcene.md: ">0.5% expect sedation regardless of label" — ✅ sleep-profile uses >0.5% threshold
- myrcene.md: "opioid-pathway (naloxone-sensitive)" — ✅ Consistent
- myrcene.md: "THC potentiation via BBB" — ✅ Documented in cannabinoid section
- linalool.md: "GABA/glutamate modulation" — ✅ Consistent
- linalool.md: "Sex differences — CB1 males, A2a females" — ✅ Noted appropriately
- linalool.md: "unique inhalation olfactory pathway" — ✅ Documented in consumption route section
- nerolidol.md: "CBN synergy — unique in Russo Table 2" — ✅ Documented in cannabinoid section
- caryophyllene.md: CB2 pain relief — ✅ Noted as optional fourth terpene for pain-disrupted sleep
- pinene.md: "counteracts THC sedation" — ✅ Correctly listed in avoid table

No contradictions.

---

### 4. NOTE — High CBD Guidance
**Category:** Recommendation Quality
**Article:** sleep-profile.md

Article correctly distinguishes low CBD (10–15 mg, potentially useful as anti-anxiety buffer) from high CBD (>50 mg, activating). This is consistent with DWN's dual-audience framing and prevents incorrect "CBD sleep product" recommendations. The guidance is nuanced rather than a blanket CBD exclusion.

---

### 5. NOTE — Structure Difference from Primary Terpene Articles
**Category:** Format
**Article:** sleep-profile.md

Combination profile articles have a different structure than primary terpene articles (no standalone Threshold Data, Pharmacology, or Budtender Language sections in the same format — instead: Terpene Targets table, What Must Be Avoided, Cannabinoid Recommendations, Consumption Route, SQL query, Live Products, consumer language). This is intentional and appropriate for a synthesis/integration article. The three-tier summary format (HEADLINE + SUMMARY + ARTICLE) is preserved per CLAUDE.md requirements.

---

## Summary

| Check | Status |
|---|---|
| Numerical contradictions | None found |
| Claim contradictions with primary terpene articles | None |
| Cross-article consistency | ✅ All consistent |
| Live products | ⚠️ **PENDING — Supabase MCP token expired** |
| Supabase query documented | ✅ Both terpene-column query and proxy query included |
| Three-tier format preserved | ✅ |
| Mechanism accuracy | ✅ All mechanisms trace to primary terpene articles |
| Cannabinoid guidance | ✅ THC synergy, CBN pairing, CBD caveat all documented |
| Consumption route | ✅ Inhalation preferred with mechanism rationale (Tashiro olfactory pathway) |

**1 item requires Dan action:**
- **[ACTION REQUIRED — DAN]** Re-authorize Supabase MCP and run live product query for sleep-profile genetics proxy. Update article with real products and prices.

**Cumulative carry-forward:**
- **[CARRY-FORWARD — ACTION REQUIRED — DAN]** Blueberry Muffin .5g scraper decimal error — still pending.
