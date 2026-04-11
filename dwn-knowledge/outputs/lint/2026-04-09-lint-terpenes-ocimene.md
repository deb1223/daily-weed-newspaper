# Lint Report — Terpenes Collection
**Date:** 2026-04-09
**Articles reviewed:** terpenes/ocimene.md
**Session sources:** russo-taming-thc-2011.pdf, Analgesic_Potential_of_Terpenes_Derived_from_Canna.pdf, Cannabis_sativa_terpenes_are_cannabimimetic_and_se.pdf + live Supabase query

---

## Issues Found

### 1. [ACTION REQUIRED — DAN] CRITICAL SOURCE GAP — Ocimene Not in Primary Source Papers
**Category:** Source Quality
**Article:** terpenes/ocimene.md

**Finding:** Ocimene is absent from pharmacological coverage in all three primary DWN terpene source papers:
- **Russo (2011):** Ocimene does not appear in Table 2, is not mentioned in the abstract terpene list, and has no body-text pharmacology section.
- **Liktor-Busa et al. (2021):** Ocimene appears in **Figure 1** as a labeled acyclic monoterpene structure — confirming its identity as a common cannabis terpene — but has no dedicated pharmacology section in Table 1 or body text. This is the only coverage it receives across the three papers.
- **LaVigne et al. (2021):** Ocimene not included in study design (tested: α-Humulene, β-Pinene, Linalool, Geraniol, β-Caryophyllene).

**Impact:** Pharmacology section draws entirely on broader literature (antifungal EO studies, anti-inflammatory mechanism proposals, emerging antiviral evidence). No citations from the three rigorous DWN source papers. Article discloses this prominently.

**Status:** This is the second consecutive terpene (after terpinolene) with a critical source gap. Both terpinolene and ocimene need additional raw material.

**Recommended additions to raw/terpenes/:**
- **Booth, JK & Bohlmann, J. (2019).** "Terpenes in Cannabis sativa — From plant genome to humans." *Plant Science* 284: 67–72. — covers terpinolene AND ocimene in cannabis chemotype context; one paper would address both source gaps simultaneously.
- Any dedicated ocimene pharmacology review (limited but emerging post-2020 literature)
- **Mudge, SL et al. (2019).** "Chemotypic characterisation of Cannabis sativa reveals differences in terpene and cannabinoid content." *Cannabis and Cannabinoid Research* 4(2): 59–67. — covers chemovar distribution of ocimene

---

### 2. CRITICAL PRACTICAL NOTE — Volatility Flag
**Category:** Recommendation Quality
**Article:** terpenes/ocimene.md

Ocimene's extremely low boiling point (~65°C) is the most practically important characteristic for consumer recommendations. The article documents this clearly:
- Live resin / fresh frozen = best ocimene preservation
- Cured flower = significant ocimene loss during drying/curing
- Pre-rolls = effectively zero ocimene delivery
- Combustion = essentially all destroyed

**Talk to Ziggy implication:** When a patient specifies wanting the social-creativity terpene profile and ocimene specifically, the product format recommendation should default to live resin or fresh frozen, not standard dried flower. This is a format-switching recommendation — unusual among terpenes.

---

### 3. DATA GAP — Terpene Columns Not Yet Populated
**Category:** Gap + Data Quality
**Article:** terpenes/ocimene.md

`terpene_ocimene` column confirmed to exist (migrated 2026-04-09) but not yet populated. Future Supabase query documented in article, with added note to query live resin category when populated.

**Additional scraper note:** COA values for ocimene in cured flower will systematically underestimate original terpene content due to pre-analysis volatility loss. The scraper should capture `terpenes_verified_at` timestamps carefully — ocimene COA data degrades in meaning more quickly than for less volatile terpenes (e.g., caryophyllene).

---

### 4. DATA GAP — Cannabis-Specific % Thresholds
**Category:** Terpene — Threshold data
**Article:** terpenes/ocimene.md

Standard DWN framework thresholds — not established from literature. Article correctly caveats.

---

### 5. CROSS-ARTICLE CONSISTENCY CHECK
**Category:** Claim consistency
**Articles:** ocimene.md ↔ terpinolene.md ↔ limonene.md ↔ myrcene.md

- terpinolene.md: "social-creativity profile = terpinolene + limonene + ocimene" ✅ Consistent with ocimene.md entourage table
- limonene.md: Ocimene not directly cross-referenced — ✅ Expected (limonene article predates ocimene; when social-creativity profile article is written, reciprocal backlinks will be added)
- myrcene.md: "high myrcene counteracts ocimene social profile" — direction is consistent ✅
- linalool.md: No direct ocimene reference — ✅ Correct; different profiles

No contradictions.

---

### 6. PRODUCT QUALITY NOTE — Papaya Genetics Reliability
**Category:** Recommendation Quality
**Article:** terpenes/ocimene.md

Papaya genetics in inventory include both sativa-labeled (Kynd Poochie's Papaya S) and indica-labeled (Dope Dope Papaya I, VVG Dolce de Papaya I) variants. Only the sativa-labeled Papaya was included in the article recommendation table — indica Papaya strains trend toward myrcene/linalool, not ocimene. This exclusion was correct.

Strawberry Cough (included as reference strain) is infused flower at 2g/$25 — low mg/$ but the most definitive ocimene cultivar reference in current inventory.

---

### 7. GAP CONCEPTS — Referenced but No Articles Yet
**New backlinks from ocimene.md:**
- [[social-creativity-profile]] (combination profile — now backlinked from terpinolene.md and ocimene.md)
- [[humulene]] (primary terpene — 8th in CLAUDE.md order, next after ocimene)

**Still pending from prior articles:**
- [[sleep-profile]], [[daytime-anxiety-profile]], [[focus-profile]], [[pain-relief-profile]], [[body-relief-daytime-profile]] (combination profiles)
- [[humulene]], [[nerolidol]], [[bisabolol]] (remaining primary terpenes)

All expected per build order. Next primary terpene: **humulene**.

---

## Summary

| Check | Status |
|---|---|
| Numerical contradictions | None found |
| Claim contradictions within article | None |
| Cross-article consistency (all 7 terpenes) | ✅ All consistent |
| Stale benchmarks | N/A — no pricing history yet |
| Gap concepts | 8 referenced articles not yet written (expected) |
| Missing terpene data flags | ✅ Threshold caveats present; future query documented |
| Source quality | ⚠️ **[ACTION REQUIRED — DAN]** Ocimene not in primary sources — second consecutive source gap |
| Volatility warning | ✅ Live resin recommendation documented; COA interpretation caveat noted |
| Category normalization | None |
| Live products | ✅ Sativa Papaya, Strawberry Guava, Rainbow Sherbet, Strawberry Cough reference strain |

**3 items require Dan action (cumulative):**
- **[CRITICAL — SOURCE GAP × 2]** Add terpene source paper(s) covering both terpinolene and ocimene — Booth & Bohlmann (2019) *Plant Science* recommended as single paper addressing both
- **[CARRY-FORWARD]** Blueberry Muffin .5g scraper decimal error — from caryophyllene session
