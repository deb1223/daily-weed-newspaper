# Lint Report — Terpenes Collection
**Date:** 2026-04-08 (updated after Supabase MCP session)
**Articles reviewed:** terpenes/myrcene.md
**Session sources:** russo-taming-thc-2011.pdf, Analgesic_Potential_of_Terpenes_Derived_from_Canna.pdf, Cannabis_sativa_terpenes_are_cannabimimetic_and_se.pdf + live Supabase query (18,458 products)

---

## Issues Found

### 1. POTENTIAL CONTRADICTION DETECTED
**Category:** Terpene — Inhalation efficacy
**Article:** terpenes/myrcene.md

**Claim A (Russo 2011, citing Buchbauer et al. 1993):** Myrcene is sedative on inhalation in mice.

**Claim B (Liktor-Busa 2021, citing Tashiro et al. 2016):** "b-myrcene and b-pinene were ineffective via inhalation" — this was specifically in the context of antinociception (pain relief), not sedation.

**Assessment:** These claims are NOT a contradiction — they describe different outcome measures (sedation vs. analgesia via inhalation). The article currently handles this correctly by noting inhalation is the best route for sedation while flagging that the pain-relief pathway may behave differently. No contradiction, nuance flag only.

**Recommendation:** Add a clarifying note in the Consumption section distinguishing sedation-via-inhalation (supported) vs. analgesia-via-inhalation (equivocal). Currently partially addressed. No Dan approval required — no contradiction.

---

### 2. DATA GAP — Human TRPV1
**Category:** Terpene — Pharmacology
**Article:** terpenes/myrcene.md

The TRPV1 activation finding (Jansen et al. 2019) was on rat TRPV1 and was not replicated in human TRPV1 (Heblinski et al. 2020). Article correctly flags this. No action needed — properly caveatted.

---

### 3. DATA GAP — Cannabis-Specific % Thresholds
**Category:** Terpene — Threshold data
**Article:** terpenes/myrcene.md

None of the three source papers establish effect thresholds by cannabis flower percentage (e.g., >0.5% = sedation). The threshold data in the article is applied from the DWN standard framework, not directly from the literature.

**Recommendation:** When COA-linked product data becomes available via Supabase terpene columns, validate that myrcene % correlates with reported sedation outcomes. Flag for calibration.

---

### 4. LIVE PRODUCT EXAMPLES — RESOLVED (with schema gap caveat)
**Category:** Gap → Partially resolved
**Article:** terpenes/myrcene.md

Supabase MCP connected 2026-04-08. Live products section populated with best-value inhalation flower from Las Vegas inventory. Products confirmed in stock.

**Remaining issue — SCHEMA GAP:**

> **[ACTION REQUIRED — DAN REVIEW]**
> The `products` table has no terpene/COA columns (`terpene_myrcene`, `terpene_limonene`, etc.). Myrcene % cannot be filtered from the database. The live products section shows best mg/$ inhalation flower — correct format for myrcene's consumption route — but cannot confirm actual myrcene content for any listed product.
>
> **Recommendation:** Add float columns for primary terpenes to the `products` table and populate via scraper where COA data is available. This is the single highest-leverage schema change to unlock Talk to Ziggy product recommendations across all terpene articles.
>
> Until then: all Live Product Examples sections for terpene articles must carry the schema gap warning. Budtenders must verify COA at point of sale.

---

### 5. CONSUMPTION NOTE — ORAL EDIBLES
**Category:** Terpene — Critical consumer guidance
**Article:** terpenes/myrcene.md

Article correctly warns that myrcene degrades through first-pass liver metabolism in edibles. Consistent with CLAUDE.md requirement. No action needed.

---

### 6. GAP CONCEPTS — Referenced but No Articles Yet
The following concepts are [[backlinked]] in myrcene.md but have no dedicated articles yet:
- [[sleep-profile]] (combination profile)
- [[pain-relief-profile]] (combination profile)
- [[linalool]]
- [[caryophyllene]]
- [[limonene]]
- [[pinene]]

These will be created as primary terpene articles are built out per CLAUDE.md order.

---

## Summary

| Check | Status |
|---|---|
| Numerical contradictions | None found |
| Claim contradictions across articles | 1 apparent, resolved as non-contradiction (inhalation sedation vs. analgesia) |
| Stale benchmarks | N/A — no pricing data yet |
| Gap concepts | 6 referenced articles not yet written (expected) |
| Missing terpene data flags | TRPV1 human evidence gap — flagged in article |
| Category normalization errors | N/A — terpene article, no product categories |
| Live products | ✅ Populated — top 4 best-value LV inhalation flower, queried live |
| Terpene column schema gap | ⚠️ **[ACTION REQUIRED — DAN]** — products table has no terpene columns; COA filtering blocked |

**1 item requires Dan action before article is fully production-ready:**
- Add terpene columns to `products` table to enable myrcene-specific filtering
