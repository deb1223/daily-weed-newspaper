# Lint Report — Terpenes Collection
**Date:** 2026-04-09
**Articles reviewed:** terpenes/humulene.md
**Session sources:** russo-taming-thc-2011.pdf, Analgesic_Potential_of_Terpenes_Derived_from_Canna.pdf, Cannabis_sativa_terpenes_are_cannabimimetic_and_se.pdf, 1-s2.0-S0168945219301190-main.pdf + live Supabase query

---

## Issues Found

### 1. SOURCE GAP — Russo (2011) Table 2 Does Not Cover α-Humulene
**Category:** Source Quality
**Article:** terpenes/humulene.md

**Finding:** α-Humulene does not appear in Russo (2011) Table 2 (Cannabis Terpenoid Activity Table). The eight featured terpenoids are: Limonene, α-Pinene, β-Myrcene, Linalool, β-Caryophyllene, Caryophyllene Oxide, Nerolidol, Phytol. Humulene is absent.

**Impact:** Low. Unlike the terpinolene and ocimene source gaps, humulene has robust primary DWN source coverage in LaVigne et al. (2021) — where it is one of only five directly tested terpenes — and a dedicated section in Liktor-Busa et al. (2021, Section B.3). The Russo gap is a minor incompleteness, not a pharmacology void. Article discloses this clearly.

**Recommendation:** No additional paper required. Russo source gap is noted but does not impair article quality given LaVigne and Liktor-Busa coverage.

---

### 2. TECHNICAL NOTE — A2a-Dominant Catalepsy (Novel Mechanism)
**Category:** Terpene — Pharmacology
**Article:** terpenes/humulene.md

α-Humulene is the only one of the five LaVigne-tested terpenes where istradefyllene (A2a antagonist) completely blocked catalepsy, while rimonabant only partially blocked it. This makes the A2a adenosine receptor the dominant mediator of α-humulene's cataleptic behavior — a pharmacological distinction from the other tested terpenes and from β-caryophyllene's purely CB2-mediated mechanism.

**Talk to Ziggy implication:** For a patient asking about pain relief or body effects, humulene's multi-receptor mechanism (CB1 partial + CB2 + A2a) means the body-relief profile is mechanistically different from caryophyllene's CB2-only action. The combination is complementary, not redundant. This distinction does not require consumer-facing explanation but should inform product recommendations: when COA shows both humulene and caryophyllene present above threshold, the dual-mechanism coverage is genuinely additive.

---

### 3. DATA GAP — Terpene Column Not Yet Populated
**Category:** Gap + Data Quality
**Article:** terpenes/humulene.md

`terpene_humulene` column exists (migrated 2026-04-09) but not yet populated by scraper. Future Supabase query documented in article.

**Additional note:** Unlike ocimene, humulene is a sesquiterpene with substantially better stability through drying and curing. When the scraper does populate `terpene_humulene`, those COA values will be more reliable than values for volatile monoterpenes like ocimene or terpinolene. This is an important calibration point: not all terpene columns will have the same COA-to-reality reliability gap.

---

### 4. DATA GAP — Cannabis-Specific % Thresholds
**Category:** Terpene — Threshold data
**Article:** terpenes/humulene.md

Standard DWN framework thresholds applied. LaVigne et al. used 200 mg/kg i.p. in mice — not directly translatable to cannabis COA percentage thresholds. Article correctly caveats this.

---

### 5. CROSS-ARTICLE CONSISTENCY CHECK
**Category:** Claim consistency
**Articles:** humulene.md ↔ caryophyllene.md ↔ myrcene.md ↔ pinene.md

- **caryophyllene.md**: CB2 agonist (100 nM selective), anti-inflammatory, pain relief — ✅ Consistent with humulene.md's framing of BCP + humulene as complementary mechanisms (CB2 vs. CB1/A2a)
- **myrcene.md**: Opioid-pathway analgesia; sedating above 0.5% — ✅ humulene.md warns that high myrcene shifts body-relief toward sedation; consistent
- **pinene.md**: Focus, memory, daytime clarity — ✅ humulene.md uses pinene as the body-relief-daytime modifier; consistent with pinene.md's daytime-clarity role
- **ocimene.md** / **terpinolene.md**: Social-creativity profile — humulene explicitly not in that profile; no cross-reference needed ✅

No contradictions.

---

### 6. PRODUCT NOTE — Kynd Headband Appears in Two Articles
**Category:** Recommendation Quality
**Articles:** terpenes/humulene.md ↔ terpenes/pinene.md

Kynd Headband (H) Flower 14g at The Dispensary Eastern appears in both the pinene and humulene product tables. This is not an error — Headband genetics carry pinene, humulene, and caryophyllene simultaneously, making it a legitimate multi-terpene recommendation for different effect goals. The budtender note in humulene.md acknowledges this explicitly. No action required.

---

### 7. GAP CONCEPTS — Referenced but No Articles Yet
**New backlinks from humulene.md:**
- [[pain-relief-profile]] (combination profile — now backlinked from humulene.md and caryophyllene.md)
- [[body-relief-daytime-profile]] (combination profile — now backlinked for the first time)
- [[nerolidol]] (primary terpene — 9th in CLAUDE.md order, next after humulene)

**Still pending from prior articles:**
- [[sleep-profile]], [[daytime-anxiety-profile]], [[focus-profile]], [[pain-relief-profile]], [[body-relief-daytime-profile]], [[social-creativity-profile]] (combination profiles)
- [[nerolidol]], [[bisabolol]] (remaining primary terpenes)

All expected per build order. Next primary terpene: **nerolidol**.

---

## Summary

| Check | Status |
|---|---|
| Numerical contradictions | None found |
| Claim contradictions within article | None |
| Cross-article consistency (all 8 terpenes) | ✅ All consistent |
| Stale benchmarks | N/A — no pricing history yet |
| Gap concepts | 8 referenced articles not yet written (expected) |
| Missing terpene data flags | ✅ Threshold caveats present; future query documented; COA stability advantage noted |
| Source quality | ✅ Strong — LaVigne 2021 directly tested; Liktor-Busa Section B.3; Booth & Bohlmann confirms co-occurrence. Russo gap only, noted and disclosed. |
| Unique mechanism flag | ✅ A2a-dominant catalepsy noted — distinguishes humulene from other tested terpenes |
| Live products | ✅ OG Kush, Headband lineage genetics queried; 4 on-sale products surfaced |

**0 items require Dan action.**

**Cumulative carry-forward items (from prior sessions):**
- **[CARRY-FORWARD — ACTION REQUIRED — DAN]** Blueberry Muffin .5g scraper decimal error — weight_grams=5 instead of 0.5; deferred until after terpene articles complete
