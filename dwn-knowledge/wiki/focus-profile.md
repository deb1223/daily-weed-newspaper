**HEADLINE:** Focus profile is pinene plus limonene — acetylcholinesterase-driven memory clarity stacked with serotonergic alertness, no sedation.

**SUMMARY:** The focus profile is pinene above 0.2% combined with limonene above 0.3%, both with low myrcene below 0.2%. Pinene is the only cannabis compound that directly counteracts THC-induced memory impairment via acetylcholinesterase inhibition. Limonene adds serotonergic alertness. The combination produces cognitive clarity, focus, and mood stability — the daytime work stack.

**ARTICLE:**

> **Build note:** This is a combination profile article synthesizing pharmacology documented in [[pinene]], [[limonene]], and [[myrcene]]. All mechanism citations reference those primary terpene articles and their sources. No new pharmacology is introduced here — this is an applied integration document for Talk to Ziggy recommendations.

## What This Profile Is

The focus profile is the most cognitively targeted of the six DWN profiles. It exists because pinene has a documented mechanism that no other cannabis terpene shares: direct acetylcholinesterase inhibition — the same mechanism as pharmaceuticals used to treat dementia and memory impairment.

**The core stack:** pinene >0.2% + limonene >0.3% + myrcene <0.2%.

The mechanism sequence:
1. **THC creates short-term memory impairment** — this is well-documented; CB1 agonism at the hippocampus disrupts encoding of new information
2. **Pinene blocks the enzyme that breaks down acetylcholine** — acetylcholinesterase inhibition preserves cholinergic signaling, which counteracts the CB1-mediated memory suppression
3. **Limonene adds serotonergic mood stabilization** — 5-HT1A activation delivers anxiolytic effect without sedation, supporting the calm-alert state required for productive focus
4. **Low myrcene ensures no sedation axis** — without myrcene, THC's blood-brain barrier potentiation is reduced; the experience is lighter and more functionally controllable

**How focus differs from daytime-anxiety:** Both profiles use limonene and pinene. In the daytime-anxiety profile, limonene is primary — the goal is mood stabilization and social ease. In the focus profile, pinene is primary — the goal is cognitive output and memory protection. Practically: when the consumer says "I want to take the edge off and be social," you're in daytime-anxiety territory. When they say "I want to work, create, or study without losing my train of thought," you're in focus territory.

## Terpene Targets

| Terpene | Threshold | Mechanism | Source |
|---|---|---|---|
| α-Pinene | **>0.2%** (required) | Acetylcholinesterase inhibition; directly reverses THC short-term memory impairment; bronchodilatory (improved inhalation efficiency) | Russo (2011), Perry et al. (2000) |
| Limonene | **>0.3%** (required) | 5-HT1A serotonergic mood lift and anxiolytic effect; prevents anxiety-driven focus disruption | Russo (2011), Liktor-Busa (2021) |
| β-Myrcene | **<0.2%** (suppress) | Above threshold: sedation, THC potentiation — both counterproductive for focus; strict low-myrcene requirement distinguishes this from pain/sleep profiles | Russo (2011) |
| Linalool | **<0.2%** (suppress) | GABA sedation — contradicts cognitive alertness goal | Russo (2011), LaVigne (2021) |

**Optional modifier:** β-Caryophyllene >0.1% is compatible here — its CB2 peripheral action doesn't cross the blood-brain barrier for psychoactive effects. If present at low levels, it can provide mild anti-inflammatory benefit without interfering with focus.

**Pinene threshold note:** The 0.2% floor is stricter than pinene's general contributing threshold (0.1%). For focus applications, 0.1% pinene contributes to aroma but may not deliver reliable acetylcholinesterase inhibition. 0.2%+ is the defensible functional threshold for the memory-protection mechanism.

## What Must Be Avoided

| Terpene | Why to Avoid |
|---|---|
| β-Myrcene >0.2% | Sedating; potentiates THC — the combination creates the "foggy" experience this profile is specifically built to prevent |
| Linalool >0.2% | GABA sedation directly opposes cognitive alertness |
| Terpinolene >0.5% | Can produce anxious, scattered energy in some consumers — counterproductive for sustained focus |
| Nerolidol >0.1% | Sedative sesquiterpene; adds drowsiness |

## Cannabinoid Recommendations

**THC (moderate — strictly calibrated):** Pinene's acetylcholinesterase inhibition counteracts THC memory impairment, but it does not counteract all THC effects. High THC (>25%) will still deliver significant psychoactivity that may impair sustained task performance despite pinene. This profile works best at 15–22% THC — enough for mood benefit, low enough to keep executive function intact.

**CBD (useful buffer):** 10–20 mg CBD can smooth the THC onset and reduce the probability of anxiety derailing focus. CBD's allosteric THC modulation (negative allosteric modulator at CB1) softens the peak, which is beneficial when cognitive performance is the goal.

**CBG (emerging):** CBG has been noted for potential focus-supporting properties in preliminary research. No definitive terpene interaction documented in primary DWN sources. Flag for future tracking.

## Consumption Route

**Inhalation (strongly preferred):** Pinene's acetylcholinesterase inhibition requires active absorption. Low-temperature vaporization (170–185°C) preserves both α-pinene and limonene — both are monoterpenes with boiling points in this range. Onset within 5–10 minutes, duration 1–2 hours. Appropriate for creative sessions, focused work blocks, studying.

**Oral / Edibles:** Pinene's oral bioavailability and acetylcholinesterase activity through the digestive route is not well-characterized in the primary DWN source literature. Limonene has documented oral absorption. Oral consumption for the focus profile is not recommended when cognitive precision is the goal — onset delay and uncertain pinene delivery make it unreliable. If oral is required, verify COA shows very high pinene (>0.5%) to offset bioavailability uncertainty.

**Pre-rolls / Combustion:** Monoterpenes degrade through combustion. Pinene and limonene are both highly volatile. Combustion significantly reduces effective terpene delivery for this profile. Not recommended for focus applications.

## Supabase Query (once terpene columns populated)

```sql
-- Focus profile: pinene-dominant, limonene supporting, myrcene suppressed
WHERE terpene_pinene > 0.2
  AND terpene_limonene > 0.3
  AND (terpene_myrcene < 0.2 OR terpene_myrcene IS NULL)
  AND (terpene_linalool < 0.2 OR terpene_linalool IS NULL)
  AND in_stock = true
  AND category ILIKE '%flower%'
ORDER BY (thc_percentage / 100.0 * weight_grams * 1000 / price) DESC
```

## Live Product Examples

*Queried 2026-04-09.*

> **⚠️ PENDING — Terpene columns not yet populated by scraper (migration confirmed 2026-04-09).** Use the query above once COA data flows in. Until then, proxy by genetics:
>
> **Proxy genetics (pinene + limonene dominant, low myrcene):** Jack Herer, Trainwreck, Blue Dream (low-myrcene phenotypes), Strawberry Cough, Sour Diesel (some phenotypes), AK-47, Harlequin. Jack Herer is the canonical pinene-dominant strain in cannabis genetics — look for it by name or lineage. Avoid Kush, OG, Bubba, and any explicitly indica-labeled product — high myrcene probability.
>
> **Best current mg/$ proxy candidates (verify COA at point of sale):**
> - **Lemon Bars Shake** — CORE Cannabis @ Greenlight Downtown Las Vegas — 20.82% THC, 14g, $35 → **83.3 mg/$**. Citrus genetics suggest limonene forward; if pinene is present in the COA, this hits the focus profile. Request the full terpene panel. [Product link](https://dutchie.com/dispensary/greenlight-downtown-las-vegas/product/69a119b810109ca758ced7d7)
> - **Super Jet Fuel Shake** — Prime Cannabis @ Greenlight Downtown Las Vegas — 23.48% THC, 14g, $35 (on sale) → **93.9 mg/$**. Jet Fuel / G6 genetics are sativa-leaning; confirm terpene panel for pinene and limonene presence. [Product link](https://dutchie.com/dispensary/greenlight-downtown-las-vegas/product/693b67f82eee8a8760409d38)

*This section will be updated with live terpene-filtered Supabase data when COA columns are populated.*

## Budtender Language

"Pinene is the only thing in cannabis that actually reverses the memory fog from THC — and I mean that literally, it's the same type of enzyme inhibition as some Alzheimer's medications, just much milder. So if someone wants to stay sharp and focused while they're high, pinene above 0.2% is the non-negotiable. Then you add limonene for the mood piece — that's your serotonin lift, keeps anxiety from derailing focus. Keep myrcene low. Jack Herer genetics are your best starting point, but whatever they pick, pull the COA and look for pinene over 0.2% and limonene over 0.3%. If myrcene is high, it's the wrong product regardless of the label."

## Contraindications and Cautions

- **Not for everyone:** Cannabis and cognitive tasks are a sensitive combination. Tolerance-naive consumers should establish their baseline response before using this profile for focused work — pinene helps, but it doesn't eliminate all THC cognitive effects at high doses.
- **Bronchodilation note:** Pinene is a bronchodilator. Consumers with asthma may find vaporized pinene-forward products improve inhalation efficiency and comfort — a secondary benefit of this profile.
- **Driving:** Functional daytime profile does not mean driving-appropriate. Never recommend for operating vehicles.

## Sources

All pharmacology cited here is documented in the primary terpene articles:
- Pinene acetylcholinesterase inhibition / THC memory reversal: Russo (2011); Perry et al. (2000) — documented in [[pinene]]
- Pinene bronchodilation: Russo (2011) — documented in [[pinene]]
- Limonene serotonergic / anxiolytic: Russo (2011); Liktor-Busa (2021) — documented in [[limonene]]
- Myrcene THC potentiation and sedation: Russo (2011); Liktor-Busa (2021) — documented in [[myrcene]]

## Backlinks

[[pinene]] | [[limonene]] | [[myrcene]] | [[linalool]] | [[daytime-anxiety-profile]]
