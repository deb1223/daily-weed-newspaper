**HEADLINE:** Pain-relief profile is caryophyllene plus myrcene plus humulene — CB2 activation backed by opioid-pathway depth.

**SUMMARY:** The pain-relief profile stacks three terpenes with non-redundant mechanisms. Caryophyllene above 0.3% activates CB2 receptors for cannabimimetic pain relief. Myrcene above 0.3% adds opioid-pathway analgesia and muscle relaxation. Humulene above 0.1% deepens anti-inflammatory coverage. Together, these three address sources of inflammation, nerve pain, and muscle tension through distinct pathways simultaneously.

**ARTICLE:**

> **Build note:** This is a combination profile article synthesizing pharmacology documented in [[caryophyllene]], [[myrcene]], and [[humulene]]. All mechanism citations reference those primary terpene articles and their sources. No new pharmacology is introduced here — this is an applied integration document for Talk to Ziggy recommendations.

## What This Profile Is

The pain-relief profile is pharmacologically the most defensible combination in the DWN collection for pain management. Three terpenes, three distinct anti-nociceptive mechanisms — none of them redundant.

**The core stack:** caryophyllene >0.3% + myrcene >0.3% + humulene >0.1%.

Why each piece is essential:
1. **Caryophyllene** — the only cannabis terpene that directly activates CB2 receptors (GPCR binding confirmed). CB2 is the peripheral cannabinoid receptor dominant in immune cells and inflamed tissue. This is targeted anti-inflammatory and pain relief at the receptor level — no sedation, no psychoactive mechanism.
2. **Myrcene** — opioid-pathway analgesia (naloxone-sensitive in animal models) plus muscle relaxation. For musculoskeletal and tension pain, myrcene addresses what caryophyllene cannot. It also potentiates THC uptake, amplifying the analgesic effect of the cannabinoid.
3. **Humulene** — sesquiterpene from hops; documented anti-inflammatory (NF-κB pathway inhibition) and analgesic in Russo (2011). Shares structural similarity with caryophyllene (isomer), but its mechanism is distinct — it deepens the anti-inflammatory stack without adding sedation.

This is the evening/nighttime lean profile when pain is the primary complaint and sedation is acceptable as a side effect. For pain that must be managed during the day, see the [[body-relief-daytime-profile]].

## Terpene Targets

| Terpene | Threshold | Mechanism | Source |
|---|---|---|---|
| β-Caryophyllene | **>0.3%** (required) | Direct CB2 receptor agonism; anti-inflammatory (NF-κB inhibition); cannabimimetic without psychoactivity | Russo (2011), LaVigne (2021), Liktor-Busa (2021) |
| β-Myrcene | **>0.3%** (required) | Naloxone-sensitive opioid-pathway analgesia; muscle relaxation; THC potentiation amplifying analgesic effect | Russo (2011), Liktor-Busa (2021) |
| α-Humulene | **>0.1%** (required) | Anti-inflammatory (NF-κB, PLA2, COX pathways per Fernandes 2007); analgesic; synergistic with caryophyllene | Russo (2011), Fernandes (2007) — documented in [[humulene]] |
| Linalool | **>0.3%** (optional add) | GABA sedation — appropriate if pain disrupts sleep; deepens the nighttime pain stack alongside myrcene | Russo (2011), LaVigne (2021) |
| Nerolidol | **>0.1%** (optional add) | Additional sedative layer; CBN synergy (Russo 2011) — add when pain management crosses into sleep support | Russo (2011) — documented in [[nerolidol]] |

**Key nuance:** Myrcene sedation is a feature here, not a bug. The pain-relief profile is evening-appropriate. The consumer asking for pain relief who needs to stay awake should be redirected to the [[body-relief-daytime-profile]] (caryophyllene + humulene + pinene).

## What Must Be Avoided

| Terpene | Why to Avoid |
|---|---|
| α-Pinene >0.3% | Counteracts THC potentiation from myrcene; reduces analgesic amplification |
| Terpinolene >0.3% | Energizing Haze character contradicts pain rest goals |
| Limonene >0.5% | High limonene partially counteracts myrcene sedation — acceptable at lower levels |

**What not to confuse:** High-CBD products marketed for pain are not equivalent to this terpene profile. CBD's anti-inflammatory mechanism (indirect CB2 influence, adenosine potentiation) operates through different pathways. CBD can complement this profile at moderate doses (15–30 mg) but does not replace caryophyllene's direct CB2 agonism.

## Cannabinoid Recommendations

**THC (important here):** Myrcene's opioid-pathway analgesia and blood-brain barrier potentiation are both THC-dependent. For maximum analgesic effect, this profile requires meaningful THC. Products with THC >20% paired with the full caryophyllene + myrcene + humulene stack represent the highest-value pain-relief combination. Low-THC or THC-free products lose a key mechanism.

**CBD (supportive at moderate doses):** CBD's indirect CB2 influence and adenosine potentiation complement caryophyllene's direct CB2 action. 15–30 mg CBD alongside this terpene profile is additive, not redundant. Avoid extremely high CBD ratios (>4:1 CBD:THC) as they dilute the THC-myrcene analgesic synergy.

**CBN (for sleep-disrupting pain):** When pain prevents sleep, add CBN product or look for CBN-infused cultivar with nerolidol. See [[sleep-profile]] for the myrcene + linalool + nerolidol CBN stack, which can be combined with this profile for pain that also disrupts sleep.

## Consumption Route

**Inhalation (preferred for acute pain):** All three primary terpenes survive low-temperature vaporization. Both caryophyllene and humulene are sesquiterpenes with high boiling points (200°C+), making them more heat-stable than monoterpenes like limonene. Vaporize at 185–200°C to activate the full profile. Onset within minutes — appropriate for breakthrough pain and acute relief.

**Oral / Edibles:** Caryophyllene is orally bioavailable with documented absorption via food pathways — Russo explicitly notes dietary caryophyllene (from black pepper, cloves) as a source. Oral humulene absorption is less characterized. Myrcene has poor oral bioavailability (rapid hepatic metabolism, ~34 min half-life in rats per Liktor-Busa). Edibles will deliver caryophyllene well, humulene partially, and myrcene poorly. Oral cannabis with caryophyllene-forward genetics is still useful for chronic inflammatory pain, but the myrcene analgesic component is diminished. Onset 60–120 minutes.

**Pre-rolls / Combustion:** Sesquiterpenes (caryophyllene, humulene) are more combustion-stable than monoterpenes. Pre-rolls with Garlic Cookies / GSC / Chemdog genetics will deliver meaningful caryophyllene via combustion, making this the most combustion-resilient of the six profiles.

## Supabase Query (once terpene columns populated)

```sql
-- Pain relief: full three-terpene stack
WHERE terpene_caryophyllene > 0.3
  AND terpene_myrcene > 0.3
  AND terpene_humulene > 0.1
  AND in_stock = true
  AND category IN ('Flower', 'Concentrates')
ORDER BY (thc_percentage / 100.0 * weight_grams * 1000 / price) DESC

-- With sleep extension (pain disrupts sleep):
  AND (terpene_linalool > 0.3 OR terpene_nerolidol > 0.1)
```

## Live Product Examples

*Queried 2026-04-09.*

> **⚠️ PENDING — Terpene columns not yet populated by scraper (migration confirmed 2026-04-09).** Use the query above once COA data flows in. Until then, proxy by genetics:
>
> **Proxy genetics (caryophyllene + myrcene + humulene):** Girl Scout Cookies (GSC), Garlic Cookies (GMO), Chemdog / Chemdawg, Original Glue (GG4), Do-Si-Dos, Wedding Cake, Gelato. All GSC-lineage cultivars are among the highest caryophyllene producers in the commercial market. Chemdog genetics specifically co-produce caryophyllene and humulene at high levels.
>
> **Best current mg/$ proxy candidates (verify COA at point of sale):**
> - **Nature's Chemistry Garlic Cookies Baker's Batch Shake 14g** — The Dispensary (Eastern) — 29.7% THC, 14g, $45 (on sale) → **92.4 mg/$**. Garlic Cookies (GMO) is a GSC × Chemdawg cross: among the highest-probability caryophyllene + humulene genetics commercially available. COA should be available — request it. [Product link](https://dutchie.com/dispensary/the-dispensary-eastern-express/product/699371f06cd14081a8b6508c)
> - **Nature's Chemistry GEMS Flower Garlic Cookies 28g** — The Cannabis Co. (Downtown) — 32.67% THC, 28g, $120 → **76.2 mg/$**. Same genetics, premium whole-flower format with higher THC — confirm COA for caryophyllene and humulene. [Product link](https://dutchie.com/dispensary/the-cannabis-co/product/69268ad38bd55afa6513bb60)

*This section will be updated with live terpene-filtered Supabase data when COA columns are populated.*

## Budtender Language

"For pain relief, the terpene triple stack is caryophyllene, myrcene, and humulene — three different pain mechanisms hitting at the same time. Caryophyllene is the one that actually binds to the same receptor as anti-inflammatory medications — CB2. It's the only terpene in cannabis that does that. Myrcene adds the opioid-pathway piece — muscle relaxation, analgesic effect, and it makes the THC hit the bloodstream harder so the pain relief is amplified. Humulene is caryophyllene's natural partner — same anti-inflammatory pathways, deeper coverage. For genetics, anything in the Garlic Cookies, GSC, or Chemdog family is your best starting point. Pull the COA and look for caryophyllene over 0.3%, myrcene over 0.3%, and any humulene above 0.1%."

## Contraindications and Cautions

- **Daytime use:** High myrcene makes this profile sedating. Consumers managing chronic pain who need to stay awake should use [[body-relief-daytime-profile]] instead.
- **Opioid-pathway interaction:** Myrcene's naloxone-sensitive mechanism is not equivalent to opioid medications and has no documented adverse interaction with opioid pharmaceuticals in the DWN primary literature — but this is an area where we note the limitation of our source base. Consumers on opioid medications should consult a physician.
- **THC dose escalation:** Starting with the highest available THC product may backfire — a smaller, well-targeted dose of a high-caryophyllene cultivar often outperforms a brute-force high-THC approach.

## Sources

All pharmacology cited here is documented in the primary terpene articles:
- Caryophyllene CB2 agonism / anti-inflammatory: Russo (2011); LaVigne (2021); Liktor-Busa (2021) — documented in [[caryophyllene]]
- Myrcene opioid-pathway analgesia: Russo (2011); Liktor-Busa (2021); do Vale et al. (2002); Rao et al. (1990) — documented in [[myrcene]]
- Humulene anti-inflammatory / analgesic: Russo (2011); Fernandes et al. (2007) — documented in [[humulene]]
- Nerolidol CBN synergy for sleep extension: Russo (2011) — documented in [[nerolidol]]

## Backlinks

[[caryophyllene]] | [[myrcene]] | [[humulene]] | [[linalool]] | [[nerolidol]] | [[sleep-profile]] | [[body-relief-daytime-profile]]
