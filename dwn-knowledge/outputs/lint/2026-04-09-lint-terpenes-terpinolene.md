# Lint Report — Terpenes Collection
**Date:** 2026-04-09
**Articles reviewed:** terpenes/terpinolene.md
**Session sources:** russo-taming-thc-2011.pdf, Analgesic_Potential_of_Terpenes_Derived_from_Canna.pdf, Cannabis_sativa_terpenes_are_cannabimimetic_and_se.pdf + live Supabase query

---

## Issues Found

### 1. [ACTION REQUIRED — DAN] CRITICAL SOURCE GAP — Terpinolene Not in Primary Source Papers
**Category:** Source Quality
**Article:** terpenes/terpinolene.md

**Finding:** Terpinolene is absent from all three primary DWN terpene source papers:
- **Russo (2011):** Table 2 (Cannabis Terpenoid Activity Table) covers Limonene, α-Pinene, β-Myrcene, Linalool, β-Caryophyllene, Caryophyllene Oxide, Nerolidol, Phytol. Terpinolene is not listed. The abstract lists "limonene, myrcene, α-pinene, linalool, β-caryophyllene, caryophyllene oxide, nerolidol and phytol" as the featured terpenes — no terpinolene.
- **Liktor-Busa et al. (2021):** Covers "Terpinene and Terpineol" (pages 107–108) — a structurally related but pharmacologically distinct compound. Terpinolene is not a named section and does not appear as a primary study subject.
- **LaVigne et al. (2021):** Study design tested α-Humulene, β-Pinene, Linalool, Geraniol, β-Caryophyllene. Terpinolene not included.

**Impact:** The terpinolene pharmacology section relies on broader scientific literature (sedation data, antioxidant data, anti-proliferative data) — not the three rigorous, well-curated DWN source papers. The article discloses this prominently with a warning banner.

**Recommendation:** Add at least one dedicated terpinolene source to raw/terpenes/. Candidate papers:
- A dedicated terpinolene pharmacology review
- McPartland & Russo (2001) "Cannabis and Cannabis Extracts: Greater Than the Sum of Their Parts?" *J Cannabis Ther* 1(3–4): 103–132 — may cover terpinolene
- Booth, JK & Bohlmann, J. (2019). "Terpenes in Cannabis sativa – From plant genome to humans." *Plant Science* 284: 67–72 — dedicated cannabis terpene chemistry review including terpinolene
- Fischedick JT et al. (2010). "Metabolic fingerprinting of Cannabis sativa L., cannabinoids and terpenoids for chemotaxonomic and drug standardization purposes." *Phytochemistry* 71: 2058–2073 — terpinolene chemovar classification

---

### 2. NUANCE FLAG — Sativa Paradox Documentation
**Category:** Terpene — Pharmacology
**Article:** terpenes/terpinolene.md

The article documents terpinolene's sedative properties in animal models alongside its association with "sativa" cultivars. This apparent paradox is correctly framed with multiple reconciling explanations (co-occurring limonene/ocimene, THC dominance, subthreshold terpinolene concentrations, expectation effects).

This is the most important consumer education point in the terpinolene article. When Talk to Ziggy is built, the response to "I want an energizing sativa" should trigger a COA-based terpene conversation — not a label-based one. Terpinolene above 0.5% with high limonene and ocimene is the correct target; the sativa label is a proxy at best.

No article action required — correctly handled.

---

### 3. DATA GAP — Terpene Columns Not Yet Populated
**Category:** Gap + Data Quality
**Article:** terpenes/terpinolene.md

`terpene_terpinolene` column confirmed to exist (migrated 2026-04-09) but not yet populated. Future Supabase query template documented in article.

---

### 4. DATA GAP — Cannabis-Specific % Thresholds
**Category:** Terpene — Threshold data
**Article:** terpenes/terpinolene.md

Standard DWN framework thresholds — not established from literature at cannabis COA percentages. Article correctly notes this, and further notes that threshold data is especially uncertain given the source gap for terpinolene.

---

### 5. CROSS-ARTICLE CONSISTENCY CHECK
**Category:** Claim consistency
**Articles:** terpinolene.md ↔ linalool.md ↔ myrcene.md ↔ limonene.md ↔ pinene.md

- linalool.md: "Terpinolene and high pinene reduce sedative effect" — consistent; terpinolene.md recommends pinene as a counterpart that shifts away from "social floaty" toward "cognitive active" ✅
- myrcene.md: No direct terpinolene reference — ✅ Expected
- limonene.md: No direct terpinolene reference — ✅ Expected (though limonene is a primary social-creativity profile co-terpene; cross-reference is in entourage table)
- pinene.md: "Terpinolene also tends to reduce the sedation-opposing clarity pinene provides" — this is consistent with terpinolene.md's framing that high pinene + terpinolene produces more cognitive vs. social effect ✅

No contradictions.

---

### 6. PRODUCT QUERY NOTE — Limited Inventory for Named Terpinolene Genetics
**Category:** Recommendation Quality
**Article:** terpenes/terpinolene.md

Las Vegas inventory shows limited specifically terpinolene-named genetics. Best available:
- Ghost Train Haze (confirmed terpinolene-dominant genetics)
- Jack Herer (confirmed terpinolene-dominant genetics, but low mg/$ — 21.3)
- Pineapple Breeze / Pineapple Fanta (Pineapple-derived, likely terpinolene but not as firmly established as the Haze lineage)

Super Lemon Haze (appeared in this and the pinene query) has been noted but not featured — it's a pinene + limonene profile as much as terpinolene. Including it in both articles would create redundancy.

---

### 7. GAP CONCEPTS — Referenced but No Articles Yet
**New backlinks from terpinolene.md:**
- [[social-creativity-profile]] (combination profile — now backlinked from terpinolene.md)
- [[ocimene]] (primary terpene — 7th in CLAUDE.md order)

**Still pending from prior articles:**
- [[sleep-profile]], [[daytime-anxiety-profile]], [[focus-profile]], [[pain-relief-profile]], [[body-relief-daytime-profile]] (combination profiles)
- [[ocimene]], [[humulene]], [[nerolidol]], [[bisabolol]] (remaining primary terpenes)

All expected per build order. Next primary terpene: **ocimene**.

---

## Summary

| Check | Status |
|---|---|
| Numerical contradictions | None found |
| Claim contradictions within article | None — sativa paradox explicitly acknowledged |
| Cross-article consistency (all 6 terpenes) | ✅ All consistent |
| Stale benchmarks | N/A — no pricing history yet |
| Gap concepts | 9 referenced articles not yet written (expected) |
| Missing terpene data flags | ✅ Threshold caveats present; future query documented |
| Source quality | ⚠️ **[ACTION REQUIRED — DAN]** Terpinolene not in primary sources; pharmacology draws on broader literature; additional raw material needed |
| Category normalization errors | None |
| Live products | ✅ Ghost Train Haze, Jack Herer, Pineapple genetics as proxies; future query documented |

**2 items require Dan action:**
- **[CRITICAL — SOURCE GAP]** Add terpinolene-specific source paper(s) to raw/terpenes/ (candidates listed above in Issue #1)
- **[CARRY-FORWARD]** Blueberry Muffin .5g scraper decimal error — from caryophyllene session, deferred until after terpene articles complete
