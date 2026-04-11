**HEADLINE:** Social-creativity profile is terpinolene plus limonene plus ocimene — the Haze stack for creative euphoria.

**SUMMARY:** The social-creativity profile anchors on terpinolene above 0.3% — the Haze terpene that delivers stimulating energy despite sedative preclinical pharmacology. Limonene above 0.2% adds serotonergic mood lift. Ocimene above 0.1% contributes light, euphoric freshness. Together they create the entourage behind cannabis social euphoria: conversation flows, ideas connect, inhibition drops without sedation.

**ARTICLE:**

> **Build note:** This is a combination profile article synthesizing pharmacology documented in [[terpinolene]], [[limonene]], and [[ocimene]]. All mechanism citations reference those primary terpene articles and their sources. No new pharmacology is introduced here — this is an applied integration document for Talk to Ziggy recommendations.

## What This Profile Is

The social-creativity profile is the most paradoxical in the DWN collection. Terpinolene — its anchor terpene — is *sedative in preclinical animal models* yet consistently associated with *stimulating, euphoric experiences* in human consumer reports. The [[terpinolene]] article documents this contradiction in full. For practical purposes: terpinolene above 0.3% in Haze genetics reliably produces the light, energetic, socially open experience consumers describe. The pharmacological explanation for why the preclinical sedation doesn't translate to human experience at these doses is not yet resolved in the DWN source literature.

**The core stack:** terpinolene >0.3% + limonene >0.2% + ocimene >0.1%.

What each component contributes:
1. **Terpinolene** — the signal terpene of Haze genetics; produces the distinctive fresh-pine-floral aroma and the associated heady, euphoric, light-bodied experience; high in Jack Herer, Ghost Train Haze, Golden Goat, Chernobyl
2. **Limonene** — serotonergic 5-HT1A mood lift; reduces social inhibition; amplifies the euphoric dimension without adding sedation
3. **Ocimene** — the most volatile primary terpene; sweet, herbal, tropical top note; described in the [[ocimene]] article as contributing to the light-heady sensation and the entourage of social openness; no dominant standalone pharmacology confirmed in primary DWN literature, but consistent co-occurrence with terpinolene in social-effect genetics

The combination is not about sedation, analgesia, or anxiety relief — it is the profile for *creativity, conversation, euphoria, and social engagement*.

## Terpene Targets

| Terpene | Threshold | Mechanism | Source |
|---|---|---|---|
| Terpinolene | **>0.3%** (required) | Dominant social/euphoric signal in Haze genetics; sedative preclinical pharmacology (mouse models) but energizing in human reports at typical inhalation doses; GABA-A modulation suspected | Russo (2011), Liktor-Busa (2021) |
| Limonene | **>0.2%** (required) | 5-HT1A serotonergic activity; mood lift; social inhibition reduction; anxiolytic | Russo (2011), Liktor-Busa (2021) |
| Ocimene | **>0.1%** (supporting) | Aromatic freshness; sweet-herbal entourage contribution; highly volatile — inhalation-only activation | Russo (2011) — documented in [[ocimene]] |
| β-Myrcene | **<0.3%** (suppress) | Sedation directly counteracts the energizing goal; Haze genetics are defined partly by their low myrcene expression | Russo (2011) |
| Linalool | **<0.2%** (suppress) | GABA sedation; counteracts social energy | Russo (2011) |

**The terpinolene paradox, operationalized:** The consumer-facing rule is simple — Haze genetics with confirmed terpinolene >0.3% deliver the social-creativity profile. The pharmacological why is documented but unresolved. Never tell consumers terpinolene is "sedating" in a social context recommendation — the preclinical data is real but not clinically relevant at normal inhalation doses and is documented as such.

## What Must Be Avoided

| Terpene | Why to Avoid |
|---|---|
| β-Myrcene >0.3% | Directly opposing: sedation suppresses social openness and creative energy |
| Linalool >0.2% | GABA-mediated calm pulls the experience toward relaxation, away from social engagement |
| β-Caryophyllene >0.5% | High levels can add a body-heaviness that grounds the Haze-profile lightness |
| Nerolidol >0.1% | Sedative sesquiterpene — contradicts profile goals |

**Label guidance:** Terpinolene is concentrated in a specific subset of genetics — Haze lineages and their crosses. It is almost entirely absent from Kush, OG, and heavy indica genetics. If a product label says "indica" or has Kush/OG/Bubba in the name, it almost certainly lacks terpinolene at threshold levels. Do not recommend by label; verify COA.

## Cannabinoid Recommendations

**THC (moderate to moderately high):** The social-creativity profile benefits from a real THC effect — this is not a "barely feel it" profile. The euphoria, creativity, and social openness are partly THC-mediated, with limonene and terpinolene shaping the character of the experience. 18–26% THC is the target range. Beyond 28%, even with a clean terpene profile, anxiety risk increases significantly for tolerance-naive consumers.

**CBD (minimal):** CBD at high doses mutes the euphoric, heady quality of the Haze profile — exactly what the consumer is after. Low CBD (<5 mg) or CBD-free products are preferred. If a consumer is anxiety-prone, address that with the terpene selection (limonene >0.3% instead of 0.2%), not with high CBD, which will flatten the experience.

**CBG:** No definitive interaction documented with terpinolene or ocimene in primary DWN sources. Do not recommend CBG specifically for this profile.

## Consumption Route

**Inhalation (required for ocimene):** Ocimene has the lowest boiling point of the primary DWN terpenes (~50°C for the volatile form) — it is almost entirely destroyed by combustion and degrades significantly even with improper vaporization. Terpinolene also boils at ~186°C. Low-temperature vaporization (165–185°C) is the only delivery method that fully activates all three profile terpenes. This is the profile most damaged by combustion.

**Oral / Edibles:** Terpinolene has poor documented oral bioavailability in the DWN primary sources. Ocimene's oral activity is not characterized. Limonene is the only component with documented oral absorption. Edibles will largely fail to deliver the social-creativity profile as a terpene stack — limonene's mood lift will be present, but terpinolene and ocimene's entourage contribution will be lost. If a consumer requires an edible format, recommend a limonene-forward gummy and set expectations that the full Haze character is not replicable orally.

**Pre-rolls / Combustion:** Significant ocimene and terpinolene degradation through combustion. The flower's aroma will be present at the point of combustion (the first second of the hit), but the functional terpene delivery is compromised. For consumers who prefer pre-rolls, this profile should be delivered via low-temp vaporizer if maximizing terpene effect is the goal.

## Supabase Query (once terpene columns populated)

```sql
-- Social-creativity: terpinolene anchor, limonene supporting, ocimene present
WHERE terpene_terpinolene > 0.3
  AND terpene_limonene > 0.2
  AND terpene_ocimene > 0.1
  AND (terpene_myrcene < 0.3 OR terpene_myrcene IS NULL)
  AND in_stock = true
  AND category ILIKE '%flower%'
ORDER BY (thc_percentage / 100.0 * weight_grams * 1000 / price) DESC
```

## Live Product Examples

*Queried 2026-04-09.*

> **⚠️ PENDING — Terpene columns not yet populated by scraper (migration confirmed 2026-04-09).** Use the query above once COA data flows in. Until then, proxy by genetics:
>
> **Proxy genetics (terpinolene + limonene + ocimene):** Jack Herer, Ghost Train Haze, Golden Goat, Chernobyl, Dutch Treat, Ace of Spades, J1 (Jack the Ripper), Sour Tangie. Terpinolene is rare — the genetics list for confirmed high-terpinolene cultivars is short. If the product name contains "Haze," "Jack," "Ghost Train," or "Golden," it's a reasonable starting suspect. Verify with COA.
>
> **Note on current inventory:** No products in the current Las Vegas inventory have strain names that clearly confirm terpinolene-dominant Haze genetics among the top mg/$ results queried. This is expected — terpinolene cultivars represent a small fraction of commercial cannabis inventory. When COA terpene data populates, this section will identify specific products. Until then, ask dispensary staff specifically about COA availability for any Haze-named cultivar.

*This section will be updated with live terpene-filtered Supabase data when COA columns are populated.*

## Budtender Language

"The social-creativity stack is terpinolene, limonene, and ocimene — and you're basically describing Haze genetics in terpene language. Terpinolene is the defining terpene of the Haze family: Jack Herer, Ghost Train Haze, Golden Goat. It's a little paradoxical because it's actually sedative in lab studies on mice, but in real humans at normal vaping doses it's consistently the euphoric, heady, creative, social experience. Limonene adds the serotonin piece — mood lift, social ease. Ocimene is that sweet, fresh aromatic layer you smell in the jar. The whole combination is the terpene chemistry behind 'I want to be at a party and have good conversations and feel creative.' Pull the COA and confirm terpinolene over 0.3% — that's your gate. If they don't have the COA, look for the Haze genetics by name."

## Contraindications and Cautions

- **Anxiety-prone consumers:** The social-creativity profile involves real THC euphoria. Without myrcene's THC-buffering sedation, the experience can feel more racey for sensitive consumers. Terpinolene strains have a reputation for producing anxiety at high doses in some users. Start with a moderate THC product (18–20%) and confirm the experience before recommending high-THC Haze products.
- **Evening use:** The profile is energizing and not appropriate for consumers who want to sleep within 2–3 hours of consumption.
- **COA is critical:** Terpinolene is rare enough in the market that a product without a COA cannot be reliably recommended for this profile. The genetics proxy is a starting point, not a confirmation.

## Sources

All pharmacology cited here is documented in the primary terpene articles:
- Terpinolene sedative pharmacology / human experience paradox: Russo (2011); Liktor-Busa (2021) — documented in [[terpinolene]]
- Limonene 5-HT1A serotonergic activity: Russo (2011); Liktor-Busa (2021) — documented in [[limonene]]
- Ocimene aromatic entourage contribution: Russo (2011) — documented in [[ocimene]]

## Backlinks

[[terpinolene]] | [[limonene]] | [[ocimene]] | [[myrcene]] | [[daytime-anxiety-profile]] | [[focus-profile]]
