# Daily Weed Newspaper — Brand & Design System

## Brand Statement
"We used to advertise to humans. Now we advertise to the AIs that serve humans."
(internal — not for public copy)

Public tagline: "We tell you what's worth smoking and what's corporate robbery."

## Mascot: Ziggy
- Full name: Ziggy (no last name needed)
- Named with Marley energy but fully his own character
- Lead writer and mascot of the Daily Weed Newspaper
- Been smoking since 14, calling out mid since 15
- Savage but accurate. Gen-Z energy but not cringe.
- Calls out bad prices, celebrates real deals, never mean to people — only to bad prices
- Visual (v2): anime-style illustrated hand, bold flat illustration, cel shading
- Signature color: Bud Green #34a529

## Supporting Characters
**Big Mike**
- Chill Las Vegas local, been here 15 years, knows everyone
- Gossip/context energy, never mean, just informed
- Section: "Big Mike's Local Tea" (page 2)
- Sample voice: "Word around Sahara is that Thrive's been restocking heavy 
  this week. Something's coming."

**Tourist Terry**
- No car, rideshare budget, visiting Vegas for 4 days
- Practical, slightly anxious about getting ripped off
- Deeply grateful for good intel
- Section: "Tourist Terry's Strip Guide" (page 3)
- Sample voice: "I took an Uber from the Bellagio. $8 each way. 
  Saved $30 on the eighth. Math is math."

## Color Palette
--newsprint: #f4f0e4    (main page background — warm aged paper)
--ink: #1a1008          (primary text — near black with warmth)
--accent: #34a529       (Bud Green — PRIMARY brand color, headers, Ziggy highlights)
--deal-green: #34a529   (same as accent)
--aged: #f0e9d9         (secondary surfaces, card backgrounds — steps down from newsprint)
--muted: #6b5e45        (secondary text, labels)
--ticker-red: #d62828   (Newspaper Red — buttons, sale badges, urgency CTAs)
--deep-forest: #13240f  (deep accents, footers, heavy text backgrounds)

Rule: red (#d62828) is now allowed on buttons, sale badges, and urgency elements — not ticker-only.
Deep forest (#13240f) replaces the old dark usage of #2d6a4f in footers/backgrounds.

## Typography
- UnifrakturMaguntia — masthead ONLY ("Daily Weed Newspaper" title)
- Playfair Display 700/900 — all headlines
- Space Mono — labels, data, bylines, kickers, monospace UI elements
- Source Serif 4 — body copy, paragraphs

NEVER use: Inter, Roboto, Arial, system-ui (except 404 pages)
NEVER use: Tailwind utility soup — use globals.css semantic class names

## Design Principles
- This is a newspaper that happens to have a website
- NOT a website pretending to be a newspaper
- NO gradients, NO card shadows, NO SaaS aesthetic
- NO rounded cards floating on backgrounds
- YES to column rules (1px ink dividers), double borders, kicker labels
- YES to grain texture overlay (SVG noise, fixed, pointer-events none, z-index 9999)
- YES to newsprint color everywhere
- Data tables feel like newspaper market data sections
- Forms feel like newspaper subscription cards

## Page Structure
**Homepage (/) — 4-page newspaper**
- Page 1: Front Page (masthead, ticker, stats row, Lucky 7 verdict cards, newsletter signup)
- Page 2: The Sheet (Lucky 7 market averages bar chart, Big Mike's Local Tea, Lucky 7 price history line graph, evergreen specials)
- Page 3: The Closer (Tourist Terry's Strip Guide — North Strip / South Strip / Downtown, Pro member teaser CTA)
- Page 4: The Back Page (full Pro membership pitch, crossword)

**Page flip:** Framer Motion AnimatePresence, ~800ms easeInOut
Corner curl CSS element bottom-right. Keyboard ← → support. Dot indicators updated to 4.

**Lucky 7 Categories (used on Page 1 verdicts AND Page 2 averages/history — same 7, same colors):**
1. Eighth (3.5g flower)
2. 1g Cart
3. 100mg Edible
4. 1g Live Resin
5. Single Pre-Roll
6. Infused Pre-Roll
7. 1g Disposable

**Free vs Pro gate on Lucky 7 verdict cards:**
- Free users: 3 randomly selected winners revealed, 4 locked with subtle Pro prompt
- Pro users: all 7 revealed
- Random 3 seeded server-side per session, stable within session
- Winners computed daily at 6am via /api/compute-winners cron

**/prices — Price Intelligence Dashboard (redirects to /#sheet)**
- Embedded inline on Page 1 as "The Sheet" section
- Ziggy's Pick of the Moment banner (top deal right now)
- Search + filter table (18,000+ products)
- Compare Prices modal per product row (free: top 3 + blur + upsell)
- Pagination at 50 rows

## Referral Program
**"Share the Love, Get a Glove"**
The glove unlock system (v2 — build after v1 is stable):
- Default: bare anime hand (neutral)
- 1 referral: unlock skin tone selector (6 options)
- 3 referrals: unlock the 420 Leaf glove (forest green, white leaf pattern)
- 5 referrals: unlock the Las Vegas glove (black, gold dice + card suits)
- 10 referrals: unlock the Ziggy glove (his signature look, custom illustrated)
- Pro subscriber: Gold glove unlocked automatically
- Secret gloves: TBD — discovered organically, never announced

## The Anime Hand (v2 roadmap)
- Style: bold flat illustration, Studio Ghibli adjacent — not Dragon Ball Z
- Clean black outlines, 3-4 cel shading tones, slightly stylized proportions
- Gloves are SVG overlays on base hand shape (easy to swap)
- Used for page-turn animation instead of CSS corner curl
- Skin tone options: 6 base tones
- Glove merch: SVGs → print-on-demand t-shirts, hoodies
- Ziggy's default glove: Bud Green #34a529

## Merch Vision
- Forest green hoodie, white UnifrakturMaguntia "Daily Weed Newspaper" across chest
- Ziggy's anime hand on the sleeve
- Glove designs as standalone prints
- "Share the Love, Get a Glove" referral campaign drives merch awareness
