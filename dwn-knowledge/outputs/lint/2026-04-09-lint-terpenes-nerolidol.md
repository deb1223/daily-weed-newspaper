# Lint Report — Terpenes Collection
**Date:** 2026-04-09
**Articles reviewed:** terpenes/nerolidol.md
**Session sources:** russo-taming-thc-2011.pdf, Analgesic_Potential_of_Terpenes_Derived_from_Canna.pdf, Cannabis_sativa_terpenes_are_cannabimimetic_and_se.pdf, 1-s2.0-S0168945219301190-main.pdf + live Supabase query

---

## Issues Found

### 1. SOURCE GAP — LaVigne (2021) Did Not Test Nerolidol
**Category:** Source Quality
**Article:** terpenes/nerolidol.md

**Finding:** Nerolidol was not included in LaVigne et al. (2021). No CB1/CB2 receptor binding, cannabimimetic tetrad, or ERK signaling data from the primary DWN cannabimimetic source. Article clearly discloses this.

**Impact:** Moderate. Nerolidol has good coverage from Russo (2011) Table 2 and Liktor-Busa (2021) Section B.4 + pharmacokinetics. The sedative and anti-inflammatory evidence is well-sourced. The missing piece is specifically cannabimimetic receptor characterization — the type of data that was provided for humulene and β-pinene by LaVigne. Article handles this by flagging the gap clearly rather than speculating.

**Recommendation:** No additional paper required at this time. If a paper covering nerolidol's CB1/CB2 pharmacology surfaces, add to raw/terpenes/ and update the article.

---

### 2. CRITICAL NUANCE — Non-Enzymatic Origin of Nerolidol in Cannabis
**Category:** Terpene — Source / Data Quality
**Article:** terpenes/nerolidol.md

**Finding:** Booth & Bohlmann (2019) Figure 2 identifies 14 characterized sesquiterpene CsTPS products (S1–S14). Nerolidol is not among them. Bisabolol and β-caryophyllene are listed; nerolidol is not. Booth & Bohlmann explicitly note that "other terpene derivatives detected in cannabis may arise non-enzymatically due to oxidation or due to thermal- or UV-induced rearrangements during processing or storage." Nerolidol is chemically related to listed Figure 2 products (E)-β-farnesol (S2) and (E)-β-farnesene (S3) — plausible non-enzymatic precursors.

**Impact:** Meaningful for COA interpretation. Unlike β-caryophyllene or α-humulene (confirmed direct CsTPS products), nerolidol values in cured flower COAs may partly reflect processing conditions rather than plant genetics. This could produce batch-to-batch variability even within the same cultivar. The article documents this with a COA interpretation note — this is the inverse of ocimene (heat destroys ocimene; certain processing conditions may generate nerolidol via oxidation).

**Talk to Ziggy implication:** `terpene_nerolidol` column data, once populated, should be interpreted with this variability in mind. A low nerolidol COA reading doesn't necessarily mean poor genetics for nerolidol; it may reflect processing. Conversely, a high reading might reflect unusual processing rather than genetics.

**Status:** Documented in article. No further action required — this is a caveat, not a contradiction.

---

### 3. NOTABLE FINDING — CBN Synergy (Unique Among DWN Terpenes)
**Category:** Terpene — Pharmacology
**Article:** terpenes/nerolidol.md

Russo (2011) Table 2 specifically lists THC **and CBN** as synergistic cannabinoids for nerolidol's sedative properties. This is the only terpene in Table 2 with CBN listed as a synergistic partner. Every other terpene in Table 2 lists THC (or CBD, or "?") — not CBN specifically.

**Talk to Ziggy implication:** For sleep-focused patients who ask about CBN products, nerolidol is the terpene to recommend alongside the CBN format. This creates a concrete cross-product recommendation: nerolidol-forward genetics (Gelato, Wedding Cake) + CBN tincture/CBN-infused product = most pharmacologically defensible sleep stack from the DWN primary sources.

---

### 4. DATA GAP — Terpene Column Not Yet Populated
**Category:** Gap + Data Quality
**Article:** terpenes/nerolidol.md

`terpene_nerolidol` column exists (migrated 2026-04-09) but not yet populated. Future query documented. Additional caveat noted: non-enzymatic processing variability may affect reliability of values once populated (see Issue #2 above).

---

### 5. DATA GAP — Cannabis-Specific % Thresholds
**Category:** Terpene — Threshold data
**Article:** terpenes/nerolidol.md

Standard DWN framework thresholds applied. Neither Russo nor Liktor-Busa establishes these at cannabis COA percentage levels. Article correctly caveats.

---

### 6. CROSS-ARTICLE CONSISTENCY CHECK
**Category:** Claim consistency
**Articles:** nerolidol.md ↔ myrcene.md ↔ linalool.md ↔ caryophyllene.md

- **myrcene.md**: Sedating via opioid pathway; sleep profile — ✅ Consistent with nerolidol as secondary sleep-stack member
- **linalool.md**: GABA-mediated sedation; sleep profile co-terpene — ✅ Consistent; nerolidol backlinks linalool
- **caryophyllene.md**: CB2 anti-inflammatory; pain relief — ✅ Consistent with nerolidol's anti-inflammatory as a secondary/additive contribution
- **humulene.md**: A2a-mediated body relief, co-occurs with BCP — ✅ Nerolidol and humulene are in different effect profiles; no conflict
- Russo Table 1 (cannabidivarin entry): Lists "Nerolidol, myrcene" as synergistic terpenoids for sedative activity of cannabidivarin — ✅ Consistent with nerolidol's sedation documentation

No contradictions.

---

### 7. PRODUCT NOTE — Gelato Genetics as Nerolidol Proxy
**Category:** Recommendation Quality
**Article:** terpenes/nerolidol.md

Nerolidol does not have a "signature strain" the way terpinolene has Ghost Train Haze or myrcene has most heavy indicas. Gelato genetics are a reasonable proxy — published terpene profiles of Gelato cultivars have shown nerolidol as a secondary terpene. Wedding Cake (Gelato × Triangle Kush) similarly. However, the genetic + processing variability documented in Issue #2 above means COA verification matters more here than for any other terpene in the DWN collection.

The four products selected (VVG Gelato 33, VVG Gelato Runtz, STIIIZY Black Cherry Gelato, Kushberry Wedding Cake) are all on sale and represent strong mg/$ value. No single-use proxy warning is needed in the article beyond the existing COA verification note.

---

### 8. GAP CONCEPTS — Referenced but No Articles Yet
**New backlinks from nerolidol.md:**
- [[sleep-profile]] (combination profile — now backlinked from nerolidol.md, myrcene.md, linalool.md)
- [[bisabolol]] (primary terpene — 10th and final in CLAUDE.md order, next after nerolidol)

**Still pending from prior articles:**
- [[sleep-profile]], [[daytime-anxiety-profile]], [[focus-profile]], [[pain-relief-profile]], [[body-relief-daytime-profile]], [[social-creativity-profile]] (combination profiles)
- [[bisabolol]] (final primary terpene)

All expected per build order. Next primary terpene: **bisabolol** — then 6 combination profiles.

---

## Summary

| Check | Status |
|---|---|
| Numerical contradictions | None found |
| Claim contradictions within article | None |
| Cross-article consistency (all 9 terpenes) | ✅ All consistent |
| Stale benchmarks | N/A — no pricing history yet |
| Gap concepts | 7 referenced articles not yet written (expected) |
| Missing terpene data flags | ✅ Threshold caveats present; future query documented; processing variability caveat noted |
| Source quality | ✅ Good — Russo Table 2 (4 activities); Liktor-Busa Section B.4 + PK section. LaVigne gap disclosed. Booth & Bohlmann non-enzymatic origin nuance documented. |
| CBN synergy flag | ✅ Unique among DWN terpenes; product pairing implications noted |
| Non-enzymatic origin nuance | ✅ Documented — COA variability caution included |
| Live products | ✅ Gelato 33, Gelato Runtz, Black Cherry Gelato, Wedding Cake — all on sale |

**0 items require Dan action.**

**Cumulative carry-forward items (from prior sessions):**
- **[CARRY-FORWARD — ACTION REQUIRED — DAN]** Blueberry Muffin .5g scraper decimal error — weight_grams=5 instead of 0.5; deferred until after terpene articles complete
