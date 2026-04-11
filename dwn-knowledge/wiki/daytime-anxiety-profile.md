**HEADLINE:** Daytime-anxiety profile is limonene plus pinene — citrus uplift stacked with pine clarity, no sedation.

**SUMMARY:** The daytime-anxiety profile targets anxiolytic relief without sedation. Limonene above 0.3% drives serotonergic mood elevation via 5-HT1A activity. Pinene above 0.1% delivers acetylcholinesterase inhibition and directly counteracts THC-induced memory fog. Low myrcene keeps the profile daytime-safe. This is the core stack for social anxiety, work stress, and functional daytime use.

**ARTICLE:**

> **Build note:** This is a combination profile article synthesizing pharmacology documented in [[limonene]], [[pinene]], and [[myrcene]]. All mechanism citations reference those primary terpene articles and their sources. No new pharmacology is introduced here — this is an applied integration document for Talk to Ziggy recommendations.

## What This Profile Is

The daytime-anxiety profile solves a specific problem: the cannabis consumer who needs anxiolytic relief but cannot afford sedation. This eliminates myrcene-dominant products (the most common recommendation for anxiety) and points instead to the limonene-pinene axis.

**The core stack:** limonene >0.3% + pinene >0.1% + myrcene <0.3%.

What makes this combination work:
1. **Mood lift without drowsiness** — limonene's 5-HT1A serotonergic activity elevates mood through the same receptor pathway as many anxiolytics, without opioid-pathway sedation
2. **Cognitive protection** — pinene directly inhibits acetylcholinesterase, the enzyme that breaks down acetylcholine; this preserves working memory and counteracts the most common daytime complaint about THC ("I can't think straight")
3. **Functional ceiling** — with myrcene suppressed, THC blood-brain barrier potentiation is reduced, keeping the experience lighter and more controllable

This is meaningfully different from the focus profile. The daytime-anxiety profile prioritizes mood stabilization and social ease. The focus profile prioritizes cognitive output. Both use limonene and pinene but with different thresholds and intent.

## Terpene Targets

| Terpene | Threshold | Mechanism | Source |
|---|---|---|---|
| Limonene | **>0.3%** (required) | 5-HT1A serotonergic mood elevation; anxiolytic in elevated plus-maze models; Russo (2011) "antidepressant" and "anxiolytic" designations | Russo (2011), Liktor-Busa (2021) |
| α-Pinene | **>0.1%** (required) | Acetylcholinesterase inhibition → memory/focus preservation; direct THC short-term memory impairment reversal | Russo (2011), Perry et al. (2000) |
| β-Myrcene | **<0.3%** (suppress) | Above threshold: opioid-pathway sedation, THC potentiation — both unwanted for daytime use | Russo (2011) |
| Linalool | **<0.3%** (suppress) | GABA-mediated sedation — counteracts the alertness goal | Russo (2011), LaVigne (2021) |

**Optional add:** β-Caryophyllene >0.1% is neutral-to-positive here. Its CB2 activity provides mild anti-inflammatory support without sedation — a legitimate bonus if it appears in the COA without displacing the primary stack.

## What Must Be Avoided

| Terpene | Why to Avoid |
|---|---|
| β-Myrcene >0.3% | Sedating; potentiates THC; eliminates daytime functionality |
| Linalool >0.3% | GABA sedation counters the alertness goal |
| Terpinolene >0.5% | Can produce jitteriness and paradoxical anxiety in sensitive consumers |

**Label trap:** Many products marketed for "daytime anxiety" are sativa-labeled high-myrcene genetics. Myrcene is the most abundant cannabis terpene regardless of indica/sativa designation. Always pull the COA — the label is not the chemistry.

## Cannabinoid Recommendations

**THC (moderate):** Limonene's anxiolytic effect is THC-dose-sensitive. High THC (>25%) can produce anxiety in tolerance-naive consumers even with a limonene-forward terpene profile, because THC's CB1 agonism at high doses can paradoxically amplify anxiety. Moderate THC (15–22%) is the target range for this profile. With pinene present, memory impairment is reduced, so the experience is cleaner even at moderate doses.

**CBD (supportive):** Low CBD (10–20 mg) pairs well here — CBD's allosteric THC modulation rounds off edges without blunting the limonene mood lift. Avoid high CBD (>50 mg) which can become activating in a way that competes with relaxed focus.

**CBG:** Emerging evidence for anxiolytic properties; no definitive terpene interaction documented in primary DWN sources. Flag for future research.

## Consumption Route

**Inhalation (preferred):** Both limonene and pinene are active via inhalation. Limonene's high volatility (boiling point ~176°C) means low-temperature vaporization is critical — combustion degrades it. Vaporize at 170–180°C. Onset is rapid, duration 1–3 hours — appropriate for situational anxiety (social events, work presentations, medical appointments).

**Oral / Edibles:** Limonene has documented oral bioavailability (plasma levels confirmed in Russo and Liktor-Busa primary articles). Pinene's oral activity is less characterized. Edibles with limonene-forward genetics will retain the serotonergic effect but lose the rapid-onset advantage. Onset 60–120 minutes — too slow for situational use, appropriate for general daytime supplementation.

**Pre-rolls / Combustion:** Limonene degrades significantly through combustion. The serotonergic signal will be present but muted. Not recommended for optimized daytime-anxiety profile delivery; choose vaporization.

## Supabase Query (once terpene columns populated)

```sql
-- Daytime anxiety: limonene-forward, pinene supporting, myrcene suppressed
WHERE terpene_limonene > 0.3
  AND terpene_pinene > 0.1
  AND (terpene_myrcene < 0.3 OR terpene_myrcene IS NULL)
  AND (terpene_linalool < 0.3 OR terpene_linalool IS NULL)
  AND in_stock = true
  AND category ILIKE '%flower%'
ORDER BY (thc_percentage / 100.0 * weight_grams * 1000 / price) DESC
```

## Live Product Examples

*Queried 2026-04-09.*

> **⚠️ PENDING — Terpene columns not yet populated by scraper (migration confirmed 2026-04-09).** Use the query above once COA data flows in. Until then, proxy by genetics:
>
> **Proxy genetics (limonene + pinene dominant):** Lemon Haze, Super Lemon Haze, Jack Herer, Durban Poison, Green Crack, Strawberry Cough, Amnesia Haze, Cinderella 99. Look for sativa-leaning flower with "Lemon," "Haze," or "Jack" in the name. Avoid anything with "Kush," "OG," "Bubba," "Purple," or "Glue" — those are myrcene-dominant genetics.
>
> **Best current mg/$ proxy candidates (verify COA at point of sale):**
> - **Lemon Bars Shake** — CORE Cannabis @ Greenlight Downtown Las Vegas — 20.82% THC, 14g, $35 → **83.3 mg/$**. "Lemon" in the name suggests limonene genetics; shake format means COA should exist — ask to see it. [Product link](https://dutchie.com/dispensary/greenlight-downtown-las-vegas/product/69a119b810109ca758ced7d7)

*This section will be updated with live terpene-filtered Supabase data when COA columns are populated.*

## Budtender Language

"For daytime anxiety, we're looking for limonene and pinene — not myrcene, which is what most of the 'indica' shelf is dominated by. Limonene is the citrus terpene — it lifts mood through serotonin, same system as a lot of anxiety medications, but lighter. Pinene is the pine terpene — it's actually the only thing in cannabis that directly reverses the memory fog from THC, so you stay functional. Together they give you calm without couch lock. Pull the COA, look for limonene over 0.3% and some pinene, and make sure myrcene is low — under 0.3%. Anything with 'lemon' or 'haze' genetics is your starting shortlist, but verify the numbers."

## Contraindications and Cautions

- **High-THC sensitivity:** Consumers prone to THC-induced anxiety should start at 15% THC or below even with this profile. The limonene buffer is real but not absolute.
- **Evening use:** This is a functional daytime profile. Using it within 2 hours of intended sleep will extend alertness. Recommend consumers note session timing.
- **Expectations:** This profile reduces anxiety — it does not eliminate it. Consumers with clinical anxiety disorders should treat cannabis as a complement to, not replacement for, established care.

## Sources

All pharmacology cited here is documented in the primary terpene articles:
- Limonene serotonergic / anxiolytic: Russo (2011) Table 2; Liktor-Busa (2021) — documented in [[limonene]]
- Pinene acetylcholinesterase inhibition / memory: Russo (2011); Perry et al. (2000) — documented in [[pinene]]
- Myrcene sedation / THC potentiation: Russo (2011); Liktor-Busa (2021) — documented in [[myrcene]]

## Backlinks

[[limonene]] | [[pinene]] | [[myrcene]] | [[linalool]] | [[caryophyllene]]
