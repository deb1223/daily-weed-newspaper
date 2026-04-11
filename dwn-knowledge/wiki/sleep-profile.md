**HEADLINE:** Sleep profile is myrcene plus linalool — opioid-pathway body sedation stacked on GABA-mediated mind quieting.

**SUMMARY:** The sleep profile requires two confirmed sedation mechanisms working in parallel: myrcene above 0.5% (opioid-pathway body sedation, muscle relaxation, THC potentiation) and linalool above 0.5% (GABA/glutamate mind-quieting, CB1 allosteric cannabimimetic). Nerolidol is the optional third pillar — its CBN synergy per Russo (2011) makes it the pairing terpene for CBN-enhanced sleep formats.

**ARTICLE:**

> **Build note:** This is a combination profile article synthesizing pharmacology documented in [[myrcene]], [[linalool]], and [[nerolidol]]. All mechanism citations reference those primary terpene articles and their sources. No new pharmacology is introduced here — this is an applied integration document for Talk to Ziggy recommendations.

## What This Profile Is

The sleep profile is the simplest and most pharmacologically defensible of the six DWN combination profiles. It combines two terpenes with:
- Distinct, non-redundant sedation mechanisms
- Strong support from the primary DWN source literature (Russo 2011, Liktor-Busa 2021, LaVigne 2021)
- Documented synergy with the relevant cannabinoids (THC, CBN, CBD)

**The core stack:** myrcene >0.5% + linalool >0.5%. When both are above threshold simultaneously, you have:
1. Body sedation via opioid-pathway myrcene (muscle relaxation, analgesic, THC potentiation)
2. Mind sedation via GABA/glutamate linalool (anxiety reduction, CB1 allosteric cannabimimetic, unique olfactory pain pathway)

These two mechanisms do not overlap. They are additive, not redundant — the combination produces deeper, more complete sedation than either terpene alone. This is the strongest mechanistic case for a terpene entourage effect in the entire DWN collection.

## Terpene Targets

| Terpene | Threshold | Mechanism | Source |
|---|---|---|---|
| β-Myrcene | **>0.5%** (required) | Opioid-pathway sedation (naloxone-sensitive); muscle relaxation; THC blood-brain barrier potentiation; hypnotic at higher doses | Russo (2011), Liktor-Busa (2021) |
| Linalool | **>0.5%** (required) | GABA/glutamate modulation; CB1 allosteric cannabimimetic (rimonabant-reversible tetrad); inhalation olfactory-hypothalamic pain pathway | Russo (2011), Liktor-Busa (2021), LaVigne (2021) |
| Nerolidol | **>0.1%** (supporting) | Sedative (Russo 2011); unique CBN synergy — only terpene in Russo Table 2 with CBN listed as synergistic cannabinoid | Russo (2011) |
| β-Caryophyllene | **>0.3%** (optional) | CB2-mediated pain relief — if sleep disruption is pain-driven, caryophyllene addresses the underlying cause rather than just promoting sedation | Russo (2011), LaVigne (2021), Liktor-Busa (2021) |

**The optional fourth:** For a patient whose sleep is disrupted by pain, add caryophyllene >0.3% to the query. The CB2 anti-inflammatory mechanism addresses why they can't sleep, while myrcene + linalool promotes the sleep state itself.

## What Must Be Avoided

| Terpene | Why to Avoid |
|---|---|
| Terpinolene >0.5% | Energizing Haze profile; directly opposes sedation axis |
| Limonene >0.3% | Serotonergic uplift partially counteracts linalool sedation |
| α-Pinene >0.3% | Counteracts THC memory impairment AND sedation; the memory-protective mechanism works against sleep onset |
| High CBD | Activating at most doses; CBD's anti-anxiety properties are more useful for daytime anxiety than for sleep induction |

**What not to confuse:** High CBD products marketed as "sleep" products often rely on consumer association rather than terpene pharmacology. A high-CBD product with low myrcene and low linalool is not a sleep-profile product by DWN terpene criteria, regardless of labeling.

## Cannabinoid Recommendations

**THC (primary):** Myrcene's sedative effect specifically involves THC potentiation — Russo (2011) proposes myrcene may lower blood-brain barrier resistance, allowing THC to hit faster and harder. For sleep, this synergy is desirable. Higher THC (>20%) with high myrcene is a defensible sleep recommendation. Caveat: high THC in tolerance-naive patients may cause anxiety that counteracts sleep. Start low, titrate up.

**CBN (when available):** Russo (2011) Table 2 identifies CBN as synergistic with nerolidol for sedation — the only explicit CBN–terpene pairing in the primary DWN literature. If a patient has access to CBN tincture, capsule, or CBN-infused flower, pairing it with nerolidol-forward genetics (Gelato, Wedding Cake) maximizes the pharmacological sleep stack. This is the most evidence-backed cross-product recommendation in the DWN collection for sleep goals.

**CBD (cautious):** Low CBD (10–15 mg) may assist with sleep-onset anxiety without fully counteracting THC sedation. High CBD (>50 mg) is more activating and should be avoided in products specifically chosen for sleep.

## Consumption Route for Sleep Goals

**Inhalation (vaporization — preferred):** Both myrcene and linalool are active via inhalation. Linalool specifically has a documented olfactory-hypothalamic antinociceptive pathway (Tashiro 2016) that is only activated through inhalation — oral administration cannot replicate it. Low-temperature vaporization (175–185°C) preserves both terpenes. 30–60 minutes before intended sleep onset.

**Oral / Edibles:** Myrcene has poor oral bioavailability (rapid liver metabolism, short half-life of ~34 min in rats per Liktor-Busa). Linalool's oral bioavailability is better but the unique inhalation pathway is lost. For patients who cannot or will not inhale, edibles with high myrcene + linalool genetics are a second-best option — the GABA mechanism from linalool will still be active orally, but the full synergistic profile is reduced. Onset 60–120 minutes with edibles.

**Pre-rolls / Combustion:** Functional but suboptimal — terpene degradation from combustion reduces the effective terpene delivery. Caryophyllene and myrcene (sesquiterpene and monoterpene respectively) survive better than the more volatile fractions; linalool is reasonably stable. Pre-rolls are not recommended when specific terpene profile optimization is the goal, but will deliver meaningful myrcene + linalool from a well-chosen cultivar.

## Supabase Query (once terpene columns populated)

```sql
-- Sleep profile: core two-terpene stack
WHERE terpene_myrcene > 0.5
  AND terpene_linalool > 0.3
  AND in_stock = true
  AND category ILIKE '%flower%'

-- With pain component (for pain-disrupted sleep):
  AND terpene_caryophyllene > 0.3

-- Avoid energizing terpenes:
  AND (terpene_terpinolene < 0.2 OR terpene_terpinolene IS NULL)
  AND (terpene_pinene < 0.2 OR terpene_pinene IS NULL)

-- Nerolidol-CBN pairing (if patient has CBN product):
  AND terpene_nerolidol > 0.1
```

## Live Product Examples

*Queried 2026-04-09.*

> **⚠️ PENDING — Supabase MCP unavailable at time of writing.** Terpene columns are not yet populated in any case (migration 2026-04-09; scraper not yet providing COA data). When `terpene_myrcene` and `terpene_linalool` are populated, use the query above. Until then, the genetics-proxy approach: look for heavy indica-labeled flower from OG Kush lineage, Bubba Kush, Purple cultivars, and high-myrcene certified chemovars. The following proxy query framework applies at publication:
>
> **Proxy genetics:** Afghan Kush, Hindu Kush, Bubba Kush, Purple Kush, Granddaddy Purple, Northern Lights, Blueberry, Do-Si-Dos, any cultivar with "Lavender," "Purple," or "Kush" that also shows indica label. Linalool is most common in lavender-adjacent genetics and purple strains.

*This section will be updated with live Supabase product data when terpene columns are populated and MCP is available.*

## Budtender Language

"The sleep combination is myrcene and linalool — they work two different ways. Myrcene is the body side: it sedates through the same system as opioids, relaxes muscles, and actually amplifies THC's effect so it hits harder and heavier. Linalool is the mind side: it works like a mild GABA agent — same system as sleep medications, but natural and at much lower intensity. Together you get both body and mind quieted through different paths. That's why the combination is stronger than either one alone. Pull the COA and look for both above 0.5%. And if they have access to a CBN product, that stacks even better with the nerolidol you'll sometimes see alongside myrcene and linalool in heavy indicas."

## Contraindications and Cautions

- **Daytime use:** High myrcene + linalool is not appropriate for daytime consumption. Any patient asking about this profile should be explicitly informed this is an evening/nighttime stack.
- **Anxiety-prone patients:** High THC + high myrcene can paradoxically increase anxiety in some patients before sedation kicks in. Recommend starting with lower THC doses when first using this profile. CBD at 10–15 mg as a buffer is reasonable.
- **Driving:** Self-evident — never recommend this profile for anyone driving or operating equipment.

## Sources

All pharmacology cited in this article is documented in the primary terpene articles. Key source-to-mechanism mapping:
- Myrcene opioid sedation: Russo (2011) Table 2; do Vale et al. (2002); Rao et al. (1990) — documented in [[myrcene]]
- Linalool GABA mechanism: Nunes et al. (2010); Leal-Cardoso et al. (2010) — documented in [[linalool]]
- Linalool CB1 cannabimimetic: LaVigne et al. (2021) — documented in [[linalool]]
- Linalool olfactory-hypothalamic pathway: Tashiro et al. (2016) — documented in [[linalool]]
- Nerolidol CBN synergy: Russo (2011) Table 2 — documented in [[nerolidol]]
- Myrcene THC potentiation: Russo (2011) — documented in [[myrcene]]

## Backlinks

[[myrcene]] | [[linalool]] | [[nerolidol]] | [[caryophyllene]] | [[bisabolol]]
