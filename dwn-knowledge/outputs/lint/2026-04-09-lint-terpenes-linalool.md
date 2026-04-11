# Lint Report — Terpenes Collection
**Date:** 2026-04-09
**Articles reviewed:** terpenes/linalool.md
**Session sources:** russo-taming-thc-2011.pdf, Analgesic_Potential_of_Terpenes_Derived_from_Canna.pdf, Cannabis_sativa_terpenes_are_cannabimimetic_and_se.pdf + live Supabase query

---

## Issues Found

### 1. DATA GAP — Cannabis-Specific % Thresholds
**Category:** Terpene — Threshold data
**Article:** terpenes/linalool.md

Same as myrcene, limonene, and caryophyllene: thresholds (<0.1% / >0.1% / >0.5% / >1%) are DWN standard framework, not directly established from literature at cannabis COA percentage. Article correctly notes this.

---

### 2. DATA GAP — Terpene Columns Not Yet Populated
**Category:** Gap + Data Quality
**Article:** terpenes/linalool.md

`terpene_linalool` column confirmed to exist (migrated 2026-04-09) but not yet populated by scraper. Live product examples are proxy only — Gelato and Wedding Cake genetics selected for historically linalool-forward lineage. Future Supabase query template documented in article.

---

### 3. DATA QUALITY FLAG — `strain_type` Null Coverage
**Category:** Data Quality
**Article:** terpenes/linalool.md

`strain_type` column is largely null across the products table — indica filtering returned zero results during this session. Workaround: genetics-based name filtering (Gelato, Wedding Cake). This is consistent with the same issue flagged in caryophyllene lint. Root cause: scraper is not populating `strain_type` reliably.

**No Dan action required at this time** — `strain_type` filtering will be superseded by terpene column data once the scraper is updated. Note for scraper audit: when COA data is unavailable, strain_type should be populated from product categorization if possible.

---

### 4. SEX-SPECIFIC PHARMACOLOGY — Talk to Ziggy Note
**Category:** Informational
**Article:** terpenes/linalool.md

LaVigne et al. (2021) documents sex-specific linalool pharmacology: males show CB1-mediated hypolocomotion (rimonabant-reversible), females show A2a-mediated hypolocomotion (istradefylline-reversible). Additive THC effects are greater and earlier in males; delayed and reduced in females.

**This is the only terpene in the DWN dataset with documented sex-specific pharmacology.** When Talk to Ziggy gathers biological sex context from the user, linalool recommendations should account for this: males — stronger additive CB1 potentiation with THC; females — less predictable CB1 enhancement.

No article action required. Flagged for Talk to Ziggy recommendation logic consideration.

---

### 5. NUWU EXCLUSION — Applied Correctly
**Category:** Data Quality
**Article:** terpenes/linalool.md

Linalool live product query returned products with Nuwu POS codes (`M{S/O}`, `M{304}`). These were correctly excluded per CLAUDE.md rule. The four published products are all from The Dispensary locations with clean product data.

---

### 6. CROSS-ARTICLE CONSISTENCY CHECK
**Category:** Claim consistency
**Articles:** linalool.md ↔ myrcene.md ↔ limonene.md ↔ caryophyllene.md

- myrcene.md Entourage: "Linalool — GABA pathways combine with myrcene's central sedation for the sleep-profile stack" — consistent with linalool.md sleep-profile framing ✅
- linalool.md Entourage: "Myrcene (>0.5%) — Sleep-profile — Myrcene sedates the body; linalool quiets the mind" ✅ Consistent, reciprocal
- limonene.md Entourage: "Linalool — GABAergic depth + serotonergic lift" ✅ Consistent with linalool's GABA mechanism
- caryophyllene.md Entourage: "Linalool (not listed as partner)" — linalool does not appear as a caryophyllene partner, which is correct (different effect goals — sedation vs. non-sedating pain). ✅ No consistency issue
- Effect goal framing: linalool "Not served: focus, social, creativity, daytime-anxiety (linalool's anxiolytic brings sedation with it)" — consistent with limonene article positioning limonene as the daytime-anxiety tool ✅

No contradictions across all four articles.

---

### 7. GAP CONCEPTS — Referenced but No Articles Yet
**New backlinks from linalool.md:**
- [[sleep-profile]] (combination profile — also backlinked from myrcene.md)
- [[pinene]] (primary terpene — next in CLAUDE.md order)

**Still pending from prior articles:**
- [[daytime-anxiety-profile]], [[focus-profile]], [[social-creativity-profile]], [[pain-relief-profile]], [[body-relief-daytime-profile]] (combination profiles)
- [[pinene]], [[terpinolene]], [[ocimene]], [[humulene]], [[nerolidol]], [[bisabolol]] (remaining primary terpenes)

All expected per build order. Next primary terpene: **pinene**.

---

## Summary

| Check | Status |
|---|---|
| Numerical contradictions | None found |
| Claim contradictions within article | None |
| Cross-article consistency (myrcene ↔ limonene ↔ caryophyllene ↔ linalool) | ✅ All consistent |
| Stale benchmarks | N/A — no pricing history yet |
| Gap concepts | 11 referenced articles not yet written (expected) |
| Missing terpene data flags | ✅ Threshold DWN-framework caveat present; future query documented |
| Category normalization errors | None |
| Live products | ✅ Proxy products (Gelato/Wedding Cake genetics); schema note + future query documented |
| Data quality issues | ⚠️ strain_type null coverage (ongoing, deferred to scraper audit) |
| Sex-specific pharmacology note | ✅ Documented in article; flagged for Talk to Ziggy logic |
| Nuwu POS code exclusion | ✅ Applied correctly |

**0 items require Dan action.**

Carry-forward from prior sessions:
- ⚠️ **[ACTION REQUIRED — DAN]** Blueberry Muffin .5g scraper decimal error (concentrate weight_grams=5 instead of 0.5) — from caryophyllene session, deferred until after terpene articles complete
