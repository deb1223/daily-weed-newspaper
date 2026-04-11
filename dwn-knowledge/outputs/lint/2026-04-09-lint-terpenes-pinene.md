# Lint Report — Terpenes Collection
**Date:** 2026-04-09
**Articles reviewed:** terpenes/pinene.md
**Session sources:** russo-taming-thc-2011.pdf, Analgesic_Potential_of_Terpenes_Derived_from_Canna.pdf, Cannabis_sativa_terpenes_are_cannabimimetic_and_se.pdf + live Supabase query

---

## Issues Found

### 1. DATA GAP — Cannabis-Specific % Thresholds
**Category:** Terpene — Threshold data
**Article:** terpenes/pinene.md

Same as all prior terpene articles: thresholds (<0.1% / >0.1% / >0.5% / >1%) are DWN standard framework, not directly established from literature at cannabis COA percentages. Article correctly notes this.

---

### 2. DATA GAP — Terpene Columns Not Yet Populated
**Category:** Gap + Data Quality
**Article:** terpenes/pinene.md

`terpene_pinene` column confirmed to exist (migrated 2026-04-09) but not yet populated by scraper. Live product examples are proxy only — Headband, Haze, Trainwreck, and Ghost Train Haze genetics selected for reliably pinene-forward lineage. Future Supabase query template documented in article.

---

### 3. NUANCE FLAG — α-Pinene vs β-Pinene Distinction
**Category:** Terpene — Pharmacology
**Article:** terpenes/pinene.md

The DWN `terpene_pinene` column is a combined field. The Supabase migration stored these as a single column. In practice:
- Most COAs report α-Pinene and β-Pinene separately
- The pharmacological distinction matters: α-Pinene = AChE inhibitor + bronchodilatory; β-Pinene = CB1 allosteric cannabimimetic
- The article frames both isomers together under one headline but correctly distinguishes their mechanisms

**Recommendation for scraper design:** When COA terpene data is parsed, capture α-Pinene and β-Pinene separately. The current `terpene_pinene` column may need to be split into `terpene_alpha_pinene` and `terpene_beta_pinene` when COA ingestion is built. The combined column is acceptable for the current proxy/threshold phase. Flag for schema review at scraper build time.

**No Dan action required now** — defer to scraper design phase.

---

### 4. METHODOLOGY NOTE — CB1 Assay Conflict (Consistent with Prior Articles)
**Category:** Terpene — Pharmacology
**Article:** terpenes/pinene.md

Santiago et al. (2019, cited Liktor-Busa 2021): no CB1/CB2 activation by potassium channel hyperpolarization.
LaVigne et al. (2021): β-Pinene induces rimonabant-reversible tetrad behaviors; CB1-CHO ERK activation.

Assessment: Same orthosteric vs. allosteric assay methodology conflict as seen in linalool. Resolution: allosteric CB1 binding (confirmed by little-to-no displacement of CP55,940 in competition assay). Article explicitly flags this with proper caveats. Correctly handled — no Dan action required.

---

### 5. PRODUCT QUERY NOTE — OG Kush Exclusion
**Category:** Recommendation Quality
**Article:** terpenes/pinene.md

Green | OG Kush POPCORN 28g returned at 72.0 mg/$ (top of query) — highest value product in the pinene-lineage search. Excluded from the article's recommended table with an explicit budtender note explaining that OG Kush genetics skew linalool/caryophyllene rather than pinene. Correct decision — maintaining recommendation precision over raw mg/$ ranking.

---

### 6. CROSS-ARTICLE CONSISTENCY CHECK
**Category:** Claim consistency
**Articles:** pinene.md ↔ myrcene.md ↔ limonene.md ↔ caryophyllene.md ↔ linalool.md

- linalool.md: "Terpinolene and high pinene reduce sedative effect" ✅ Consistent with pinene.md framing pinene as sedation-opposing
- limonene.md Entourage: "Pinene — Focus-profile together" ✅ Consistent with pinene.md's primary entourage recommendation
- caryophyllene.md: "Moderate α-Pinene — Body-relief daytime profile" ✅ Consistent with pinene.md's caryophyllene entourage entry
- myrcene.md: No direct pinene mention — ✅ Expected; myrcene and pinene are functionally opposing (sedation vs. alertness axis)
- linalool.md Tashiro inhalation note: "β-myrcene and β-pinene were *ineffective* via this inhalation route" ✅ Correctly cross-referenced in pinene.md Consumption Route section

No contradictions across all five articles.

---

### 7. SCHEMA CONSIDERATION — Single vs. Split Column
**Category:** Schema
**Article:** terpenes/pinene.md

The current `terpene_pinene` column combines both isomers. This is acceptable for the threshold-based proxy phase. However, most commercial COA reports (Steep Hill, SC Labs, ProVerde) list α-Pinene and β-Pinene as separate values. When the scraper is built to parse COA data, consider whether to split the column or sum the isomers.

**Recommendation:** Sum α + β pinene into `terpene_pinene` for query purposes (combined pharmacological contribution is additive for most consumer goals). Document this in the scraper design. No migration change needed now.

---

### 8. GAP CONCEPTS — Referenced but No Articles Yet
**New backlinks from pinene.md:**
- [[focus-profile]] (combination profile — also backlinked from limonene.md)
- [[terpinolene]] (primary terpene — 6th in CLAUDE.md order)

**Still pending from prior articles:**
- [[daytime-anxiety-profile]], [[sleep-profile]], [[pain-relief-profile]], [[body-relief-daytime-profile]], [[social-creativity-profile]] (combination profiles)
- [[terpinolene]], [[ocimene]], [[humulene]], [[nerolidol]], [[bisabolol]] (remaining primary terpenes)

All expected per build order. Next primary terpene: **terpinolene**.

---

## Summary

| Check | Status |
|---|---|
| Numerical contradictions | None found |
| Claim contradictions within article | None — CB1 assay conflict explicitly flagged and resolved |
| Cross-article consistency (all 5 terpenes) | ✅ All consistent |
| Stale benchmarks | N/A — no pricing history yet |
| Gap concepts | 10 referenced articles not yet written (expected) |
| Missing terpene data flags | ✅ Threshold DWN-framework caveat present; future query documented |
| α/β distinction handling | ✅ Both isomers covered; column split flagged for scraper design phase |
| Category normalization errors | None |
| Live products | ✅ Proxy products (Haze/Trainwreck/Headband genetics); OG Kush correctly excluded with explanation |
| Data quality issues | None new — prior Blueberry Muffin decimal error carry-forward |

**0 items require Dan action.**

Carry-forward from prior sessions:
- ⚠️ **[ACTION REQUIRED — DAN]** Blueberry Muffin .5g scraper decimal error (concentrate weight_grams=5 instead of 0.5) — from caryophyllene session, deferred until after terpene articles complete
- Schema consideration: split `terpene_pinene` into α/β at scraper design time (no immediate action needed)
