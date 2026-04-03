# Daily Weed Newspaper — Expansion Strategy

## The Real Vision
Not a Vegas product. Not a West Coast product.
A universal cannabis price intelligence platform — anywhere dispensaries post 
prices online, Ziggy is already there.

Tagline: "Wherever weed is legal, Ziggy's already there."

## The Scraper Insight (this is the moat)
Dutchie and iHeartJane power hundreds of dispensaries across the US and Canada.
Cracking their data structure once = every dispensary on their platform.
This isn't city-by-city manual work — it's flipping a switch per platform.

Current platforms scraped:
- Dutchie (covers ~60% of US dispensaries)
- iHeartJane (covers ~25% of US dispensaries)

Platforms to add:
- Weedmaps (huge, powers many remaining dispensaries)
- Leafly (menu data available)
- Blaze POS
- Treez
- Flowhub
- Alpine IQ
- Regional/custom platforms (state by state)

## Phase 1: Las Vegas (NOW)
- Prove the model
- Get Ziggy's voice right
- Build the subscriber base
- Nail the product before scaling

## Phase 2: National Dutchie + iHeartJane flip
Once scraper is stable in LV, point it at ALL Dutchie/iHeartJane dispensaries.
User selects their city → pulls from that city's dispensary data.
No manual setup per city — it's automatic.
Estimated coverage: 500+ cities across US + Canada

Priority cities for marketing focus (highest cannabis market volume):
**West (highest priority):**
- Denver, CO
- Portland, OR
- Seattle, WA
- Los Angeles, CA
- San Francisco, CA
- San Diego, CA
- Phoenix, AZ
- Tucson, AZ
- Sacramento, CA
- Oakland, CA
- Reno, NV (Dan's personal use case — proves the roaming value)
- Albuquerque, NM

**Midwest/East (secondary):**
- Chicago, IL
- Detroit, MI
- Boston, MA
- New York, NY (market maturing)
- Washington DC
- Baltimore, MD
- Columbus, OH
- Cleveland, OH

**Canada (when ready):**
- Vancouver, BC
- Toronto, ON
- Calgary, AB
- Edmonton, AB

## Phase 3: Anywhere They Post Prices
Custom scrapers for remaining platforms.
If a dispensary posts a public menu, Ziggy can read it.
Goal: 100% coverage of legal cannabis markets.

## The Roaming Pro Subscriber Value Prop
"You're in Reno for the weekend. Open Daily Weed Newspaper. 
Switch city to Reno. Ziggy's already there with today's deals."

This is why Pro subscription covers ALL cities — it's a national cannabis 
intelligence pass. The more cities we add, the more the $9/month feels like 
a bargain. A tourist traveling between legal states gets value everywhere.

## Revenue Projection with National Scale
| Stage | Cities Active | Est Subscribers | MRR |
|-------|--------------|-----------------|-----|
| LV only | 1 | 100-500 | $900-$4,500 |
| West Coast flip | 20+ | 2,000+ | $18,000+ |
| National Dutchie/Jane | 100+ | 8,000+ | $72,000+ |
| Full platform | 500+ | 25,000+ | $225,000+ |

## City Selector UX (to build)
- Homepage: city picker in masthead (Space Mono dropdown or search)
- Remembers last city in localStorage
- Pro users: switch cities freely
- Free users: Las Vegas only (incentive to upgrade)
- "Your city not listed? We're coming soon →" email capture

## Data Architecture for Multi-City
Current: single Supabase table `dispensary_products` with `city` field in 
`dispensaries` table.
Already positioned for multi-city — just need scrapers pointed at new cities.
No schema changes required for Phase 2.
