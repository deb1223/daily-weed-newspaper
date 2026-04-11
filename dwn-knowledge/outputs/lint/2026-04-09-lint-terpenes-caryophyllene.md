# Lint Report — Terpenes Collection
**Date:** 2026-04-09
**Articles reviewed:** terpenes/caryophyllene.md
**Session sources:** russo-taming-thc-2011.pdf, Analgesic_Potential_of_Terpenes_Derived_from_Canna.pdf, Cannabis_sativa_terpenes_are_cannabimimetic_and_se.pdf + live Supabase query

---

## Issues Found

### 1. NUANCE FLAG — CB2 Agonism Controversy (not a contradiction between our articles, but active in literature)
**Category:** Terpene — Pharmacology
**Article:** terpenes/caryophyllene.md

**Claim A (Gertsch et al., 2008, cited Russo 2011 + Liktor-Busa 2021):** BCP is a selective full agonist at CB2 at 100 nM — the first dietary cannabinoid.

**Claim B (Santiago et al., 2019; Finlay et al., 2020, cited Liktor-Busa 2021):** No CB2 activity detected measuring K⁺ channel hyperpolarization.

**Claim C (structural study, cited Liktor-Busa 2021):** Trans-β-caryophyllene may be a *negative allosteric CB2 modulator* rather than orthosteric agonist.

**Assessment:** Active scientific debate, not a DWN article contradiction. The downstream pharmacology (anti-inflammatory, analgesic, anxiolytic effects reversed by CB2 antagonists) is consistently replicated across independent labs regardless of binding mode debate. Article explicitly flags this controversy with proper caveats. No Dan action required — correctly handled.

**Recommendation:** Monitor literature for resolution. If a consensus emerges that BCP is allosteric rather than orthosteric, update the Pharmacology section wording from "agonist" to "allosteric modulator" — but the practical consumer guidance is unchanged either way.

---

### 2. DATA GAP — Cannabis-Specific % Thresholds
**Category:** Terpene — Threshold data
**Article:** terpenes/caryophyllene.md

Same as myrcene and limonene: thresholds (<0.1% / >0.1% / >0.5% / >1%) are DWN standard framework, not directly established from literature at cannabis COA percentage. Article correctly notes this.

---

### 3. LIVE PRODUCT EXAMPLES — Proxy only + DATA QUALITY FLAG
**Category:** Gap + Data Quality
**Article:** terpenes/caryophyllene.md

Terpene columns populated 2026-04-09 but not yet scraped. Products shown are best-value concentrates and indica/hybrid flower as proxy.

**[ACTION REQUIRED — DAN REVIEW]**
**Data quality issue detected in Supabase:** Product "Blueberry Muffin .5g" (Lab brand, Beyond Hello Sahara Ave, iHeartJane) shows `weight_grams = 5` but the product name contains ".5g" — this appears to be a scraper decimal point error (0.5g entered as 5g). Inflates calculated mg/$ from ~19 to ~190. The product was excluded from the article.

**Recommendation:** Audit the scraper's weight parsing logic for concentrate products. Concentrates frequently have weights like 0.5g, 1g, 2g — confirm the parser is not dropping decimal points. Check iHeartJane source data to verify correct weight for this product specifically.

---

### 4. CATEGORY NORMALIZATION FLAG — Concentrate weights
**Category:** Normalization
**Article:** terpenes/caryophyllene.md

City Trees concentrates appear as 3.5g format (shatter, wax) at $45 — unusual size for a concentrate unit. Could be correct (some NV dispensaries sell bulk concentrate "teenth" packs = 3.5g = 1/8oz equivalent), or could be another weight normalization error. Noted in article with a "verify at pickup" flag. No action required in the wiki — monitor when terpene columns are populated and price history allows cross-checking.

---

### 5. CROSS-ARTICLE CONSISTENCY CHECK
**Category:** Claim consistency
**Articles:** caryophyllene.md ↔ myrcene.md ↔ limonene.md

- myrcene.md: "Caryophyllene — Anti-inflammatory via different pathways (PGE-2 vs CB2); additive for pain/inflammation goals" ✅ Consistent
- limonene.md: "Caryophyllene — CB2 + A2A = distinct anti-inflammatory pathways" ✅ Consistent
- caryophyllene.md effect goals: "Not served: sleep, focus, social" ✅ Consistent with myrcene/limonene framing of caryophyllene as pain/inflammation, not CNS-modulating
- Pain scope: caryophyllene covers inflammatory AND neuropathic; limonene covers inflammatory and mechanical only ✅ Consistent, correctly differentiated

No contradictions across all three articles.

---

### 6. GAP CONCEPTS — Referenced but No Articles Yet
**New backlinks from caryophyllene.md:**
- [[pain-relief-profile]] (combination profile — also backlinked from myrcene.md)
- [[body-relief-daytime-profile]] (combination profile)
- [[humulene]] (primary terpene — next after linalool and pinene in CLAUDE.md order)

**Still pending from prior articles:**
- [[sleep-profile]], [[daytime-anxiety-profile]], [[focus-profile]], [[social-creativity-profile]] (combination profiles)
- [[linalool]], [[pinene]] (primary terpenes — next in CLAUDE.md order)

All expected per build order.

---

## Summary

| Check | Status |
|---|---|
| Numerical contradictions | None found |
| Claim contradictions within article | None — CB2 controversy explicitly flagged and caveatted |
| Cross-article consistency (myrcene ↔ limonene ↔ caryophyllene) | ✅ All consistent |
| Stale benchmarks | N/A — no pricing history yet |
| Gap concepts | 10 referenced articles not yet written (expected) |
| Missing terpene data flags | ✅ Threshold DWN-framework caveat present; future query documented |
| Category normalization errors | ⚠️ City Trees 3.5g concentrate weight flagged for verification |
| Live products | ✅ Populated as proxy; concentrates correctly prioritized; future filter query documented |
| Data quality issue | ⚠️ **[ACTION REQUIRED — DAN]** Blueberry Muffin weight_grams decimal error — scraper audit recommended |

**1 item requires Dan action:**
- Scraper weight parsing audit for concentrate products (0.5g → 5g decimal error detected)
