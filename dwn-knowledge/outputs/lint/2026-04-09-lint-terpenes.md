# Lint Report — Terpenes Collection
**Date:** 2026-04-09
**Articles reviewed:** terpenes/limonene.md
**Session sources:** russo-taming-thc-2011.pdf, Analgesic_Potential_of_Terpenes_Derived_from_Canna.pdf, Cannabis_sativa_terpenes_are_cannabimimetic_and_se.pdf + live Supabase query

---

## Issues Found

### 1. NUANCE FLAG — Sedation vs. Uplift (not a contradiction)
**Category:** Terpene — CNS effects
**Article:** terpenes/limonene.md

**Claim A (do Vale et al., 2002, cited in Liktor-Busa 2021):** Limonene is "highly sedative," impacts Rotarod performance, and increases barbiturate-induced sleeping time in rodents.

**Claim B (Komori 1995, Komiya 2006, Fukumoto 2008, Russo 2011):** Limonene produces mood elevation, antidepressant effects, anxiety reduction, and 5-HT/DA activation in human and animal inhalation studies.

**Assessment:** Not a contradiction — different dose levels and routes. The sedation finding (do Vale 2002) is a high-dose oral rodent result. Human inhalation evidence consistently shows uplift. Article explicitly addresses this distinction. No Dan approval required — nuance flagged in article, not a canonical contradiction.

---

### 2. DATA GAP — Cannabis-Specific % Thresholds
**Category:** Terpene — Threshold data
**Article:** terpenes/limonene.md

Same as myrcene: threshold data (<0.1% / >0.1% / >0.5% / >1%) is applied from DWN standard framework. Source papers do not establish thresholds by cannabis COA percentage. Article correctly notes this.

**Recommendation:** Validate against real terpene COA data once `terpene_limonene` column is populated via scraper.

---

### 3. LIVE PRODUCT EXAMPLES — Proxy only (terpene columns unpopulated)
**Category:** Gap — partial
**Article:** terpenes/limonene.md

Terpene columns exist in `products` table as of 2026-04-09 migration but are not yet populated by the scraper. Article shows best-value sativa/hybrid inhalation flower as proxy. Future Supabase filter documented inline for when data is available.

**No action required** — correctly handled in article. Not flagged [ACTION REQUIRED] since the schema gap is resolved; data population is a scraper task.

---

### 4. CLAIM — Analgesic limitations must not be overstated
**Category:** Terpene — Pharmacology
**Article:** terpenes/limonene.md

Limonene is documented as effective for **inflammatory and mechanical pain** but ineffective for **thermal pain (hot-plate)**. Article correctly separates these. Risk: future writers or combination profile articles may cite "limonene = analgesic" without the specificity. Flag for combination profile articles (pain-relief-profile, daytime-anxiety-profile) when built.

**Recommendation:** When writing pain-relief-profile, do not include limonene as a primary pain terpene — use caryophyllene + myrcene + humulene per CLAUDE.md spec. Limonene is secondary/anti-inflammatory only.

---

### 5. GAP CONCEPTS — Referenced but No Articles Yet
The following concepts are [[backlinked]] in limonene.md but have no dedicated articles:
- [[daytime-anxiety-profile]] (combination profile)
- [[focus-profile]] (combination profile)
- [[social-creativity-profile]] (combination profile)
- [[pinene]]
- [[linalool]]
- [[caryophyllene]]

Also backlinked in myrcene.md:
- [[sleep-profile]] (combination profile)
- [[pain-relief-profile]] (combination profile)

All expected — articles will be built per CLAUDE.md primary terpene order: caryophyllene next.

---

### 6. CROSS-ARTICLE CHECK — Myrcene vs. Limonene framing
**Category:** Claim consistency
**Articles:** terpenes/myrcene.md + terpenes/limonene.md

myrcene.md: "α-Pinene counteracts somewhat — pinene is a bronchodilator and cognition enhancer; high pinene cuts into myrcene's sedation."
limonene.md: "High myrcene (>0.5%) mostly counteracted — myrcene's sedation dominates; limonene's uplift is reduced."

**Assessment:** Consistent and complementary. Both articles correctly describe myrcene and limonene as opposing terpenes in the sedation/uplift axis. No contradiction.

---

## Summary

| Check | Status |
|---|---|
| Numerical contradictions | None found |
| Claim contradictions across articles | None — sedation/uplift nuance is dose/route dependent, correctly caveatted |
| Cross-article consistency (myrcene ↔ limonene) | ✅ Consistent — opposing terpene framing aligned |
| Stale benchmarks | N/A — no pricing history yet |
| Gap concepts | 9 referenced articles not yet written (expected per build order) |
| Missing terpene data flags | ✅ Threshold DWN-framework caveat present; future query documented |
| Category normalization errors | N/A — terpene article |
| Live products | ✅ Populated as proxy; future filter query documented inline |
| Terpene column data population | Scraper task — not an agent action item |

**0 items require Dan action.** Article is complete and internally consistent. Ready for use as a daytime-anxiety reference once COA data is populated.
