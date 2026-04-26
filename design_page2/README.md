# Handoff: Page 2 — "The Sheet" (Daily Weed Newspaper)

## Overview
Page 2 of the `dailyweednewspaper.com` 3-page broadsheet, sequenced **after** Page 1's masthead/ticker/stats and **before** Page 3's closer/upsell. The page name is **"The Sheet"** — three stacked, full-width sections separated by double rules.

Vertical order:

1. **Lucky 7 · Market Averages** — proportional bar chart of seven canonical category averages.
2. **Big Mike's Local Tea** — three-column editorial gossip column.
3. **Lucky 7 · Price History** — line-chart slot, **rendered in its Day-1 empty state** (one dot per category at today's value, ghost-trail back into history, vertical TODAY guide, "lines build here" hint to the right).

It is preceded by a Page 2 folio strip and closed by an `— END PG. 2 —` tail. No CTAs, no subscribe, no upsell — those live on Page 3.

## About the Design Files
Everything in this bundle is a **design reference** built in HTML/JSX/CSS. It is not meant to be copy-pasted into production. The task is to **recreate these designs in the existing Next.js + Tailwind + globals.css codebase** (`src/app/components/Page2.tsx` + `src/app/globals.css`), reusing the established conventions: existing CSS-variable tokens, existing font imports, existing grain overlay, existing `Page1.tsx` JSX rhythms (folio strip, kicker, double rules, etc.).

The codebase already has:
- The four font families loaded (`UnifrakturMaguntia`, `Playfair Display`, `Space Mono`, `Source Serif 4`)
- `:root` design tokens (`--newsprint`, `--ink`, `--accent`, `--aged`, `--muted`, `--ticker-red`, `--deep-forest`)
- The body-grain SVG noise overlay
- `Page1.tsx` and the `Stats` shape extension

This handoff **adds** seven new color variables and three new sections; it does not modify Page 1.

## Fidelity
**High-fidelity.** Match pixel-for-pixel at both breakpoints. Hard rules (same as Page 1):

- No gradients
- No box shadows
- No rounded corners
- No floating cards / SaaS chrome
- Typographic glyphs only (`◆ § ☕ ⌗ ▸ ⤳`) — no SVG icons, no icon font

Yes to: column rules, double rules, kicker labels with bordered glyph badges, hairline dividers, dropcaps, justified body copy.

---

## Screens / Views

There is one screen — Page 2 — at two breakpoints.

- **Desktop**: column width 1180px (the production target inside the Page 1 1400px sheet, with 110px margins on either side; clamp for ≥1000px viewports).
- **Mobile**: 390px primary target (same as Page 1).

The component takes a single `compact: boolean` prop that switches between desktop and mobile layouts. In production this should be a CSS-driven media query (`@media (max-width: 760px)`); the prop is only present here to render both variants in the design canvas.

### Folio strip (`.p2-folio`)
- Grid `1fr auto 1fr`, `padding: 7px 24px`, top `3px solid var(--ink)`, bottom `1px solid var(--ink)`.
- Font: `'Space Mono', monospace`, `10px`, `letter-spacing: 0.08em`, uppercase, color `var(--muted)`.
- **Left**: `<span class="pill">PG. 2</span>` (1px ink border, 1px 6px padding, weight 700) · `│` (opacity 0.5) · `The Sheet`
- **Center**: Source Serif 4 italic 11px ink: `Where Numbers Become Stories & Stories Become Numbers`
- **Right**: `Sat, Apr 25, 2026` · `│` · `Edition № 025`
- **Mobile**: padding `6px 14px`, font-size 9px, gap 8px; center cell hidden.

### Section chrome (shared)

Every section is wrapped in `.p2-section` (`padding: 22px 28px 24px` desktop, `18px 14px 20px` mobile) and starts with the same kicker pattern:

- **`.kicker`** — flex row, `border-bottom: 1px solid var(--ink)`, `padding-bottom: 6px`, `margin-bottom: 14px`. Space Mono 10px bold, letter-spacing 0.22em, uppercase ink.
  - Leading **`.kicker-mark`**: 18×18 box, `1px solid var(--ink)`, line-height 16px center-aligned, contains a Playfair Display 900 italic 12px glyph (`§` for Lucky 7, `☕` for Tea, `⌗` for History).
  - Then the kicker text, e.g. `LUCKY 7 · MARKET AVERAGES`.
  - Trailing **`.kicker-tail`**: `margin-left: auto`, color `var(--muted)`, letter-spacing 0.18em, weight 400. E.g. `— SEVEN PRICES THAT TELL THE STORY —`.
  - On mobile the tail wraps to its own line (`flex-wrap: wrap; flex-basis: 100%`).
- **`.section-title`** — Playfair Display 700 italic 26px (mobile 20px), line-height 1.18, letter-spacing -0.005em, max-width 38ch, `text-wrap: pretty`, `margin-bottom: 18px`. The single editorial sentence under each kicker.

Sections are separated by **`.rule-double`**: a 4px-tall element with `border-top: 1px solid ink` and `border-bottom: 1px solid ink`. (A real CSS double rule rendered as two singles 4px apart, which behaves more reliably than `border-style: double` at the page-spanning sizes used here.)

### Section 1 — Lucky 7 · Market Averages

Heading: `LUCKY 7 · MARKET AVERAGES` · tail `— SEVEN PRICES THAT TELL THE STORY —`. Glyph `§`.
Section title: `What an average gram, eighth, and dose costs in Las Vegas today.`

#### Bars table (`.bars`)
- Wrapper: `border-top: 1px solid var(--ink)`, `border-bottom: 1px solid var(--ink)`.
- **Header `.bars-head`**: grid `28px 1fr auto`, gap 14px, `padding: 5px 6px 5px 0`, `border-bottom: 1px solid var(--ink)`. Space Mono 9px letter-spacing 0.18em uppercase muted. Columns: blank · `CATEGORY` · `AVG. RETAIL · APR 25, 2026`.
- **Each `.bar-row`**:
  - Desktop grid: `28px 158px 1fr 76px`, gap 14px, `padding: 11px 6px 11px 0`, `border-bottom: 1px solid var(--aged)` (last-child none).
  - Mobile grid: 2-row layout — `22px 1fr 60px` columns, areas:
    ```
    "rank name val"
    "rank track track"
    ```
    row-gap 6px, column-gap 8px, padding `9px 6px 10px 0`.
  - **`.bar-rank`**: ordinal `01`–`07`, Space Mono 9.5px bold muted, padded 8px, `border-right: 1px solid var(--aged)`, full-height flex center.
  - **`.bar-name`**: Space Mono 11px bold ink, letter-spacing 0.04em, uppercase. Mobile: 10px, letter-spacing 0.03em.
  - **`.bar-track`**: relative, height 14px (11px mobile). Background is a 4px-period repeating linear-gradient at 6% opacity for ruled-paper feel; a 25%-period column-rule overlay (`.bar-track-tick`) gives quarter-marks at 32% opacity, multiply blend.
  - **`.bar-fill`**: positioned absolute from left, width = `(avg / max) * 100%`, `border-right: 1.5px solid var(--ink)` (the leading edge reads as ink ink, not just color). Background = `var(--cat-<key>)` from the palette below.
  - **`.bar-val`**: Playfair 700 18px (mobile 14px), letter-spacing -0.01em, `font-variant-numeric: tabular-nums`, right-aligned, padding-right 8px (6px mobile).

The seven rows, in order:

| # | Category | Avg | Token |
|---|---|---|---|
| 01 | Eighth | $24.96 | `--cat-eighth` |
| 02 | 1g Cart | $32.40 | `--cat-cart` |
| 03 | 100mg Edible | $14.82 | `--cat-edible` |
| 04 | 1g Live Resin | $38.15 | `--cat-resin` |
| 05 | Single Pre-Roll | $6.74 | `--cat-preroll` |
| 06 | Infused Pre-Roll | $12.58 | `--cat-infused` |
| 07 | 1g Disposable | $28.30 | `--cat-disposable` |

Bar widths normalize against the **max** value in the set ($38.15 → 100% width).

#### Footnote (`.bars-foot`)
- Flex row, space-between, `padding: 8px 0 0`.
- **Left** (Source Serif 4 italic 11.5px muted): `*Average of in-stock retail prices across 16 audited Las Vegas dispensaries. Excludes accessories, apparel & novelty.` Leading `*` in `<span class="ast">` Space Mono not-italic bold ink, margin-right 3px.
- **Right `.meta`** (Space Mono 9.5px letter-spacing 0.16em uppercase muted): `N = 3,617 LISTINGS · UPDATED 06:00 PST`.
- **Mobile**: stacks vertically, gap 6px.

### Section 2 — Big Mike's Local Tea

Heading: `BIG MIKE'S LOCAL TEA` · tail `— PG. 2 · OVERHEARD, CONFIRMED, PRINTED —`. Glyph `☕`.

#### Tea head (`.tea-head`)
- Grid `1fr auto`, gap 24px, align-end, `padding-bottom: 14px`, `border-bottom: 1px solid var(--ink)`, `margin-bottom: 18px`.
- **`.tea-title`**: Playfair Display 900 32px (mobile 22px), line-height 1.1, letter-spacing -0.01em, max-width 22ch, `text-wrap: pretty`. Text:
  > "The shops talk to each other. *I just write it down.*"
  
  The italic clause wraps in `<em>` styled italic-400 muted (i.e. de-emphasized — a typographic whisper).
- **`.tea-meta`**: Space Mono 9px letter-spacing 0.16em uppercase muted, `border-left: 1px solid var(--aged)`, `padding-left: 18px`, right-aligned grid of 3 rows. Each row is `display: grid; grid-template-columns: auto 1fr; gap: 10px; justify-items: end`. `dt` muted, `dd` ink bold.
  - `FILED / Apr 25, 06:14 PST`
  - `BEAT / Las Vegas Metro`
  - `SOURCES / 3 anon · 1 named`
- **Mobile**: tea-head collapses to single column (gap 10px); tea-meta loses the left border and gets a top border `1px solid var(--aged)`, left-aligned, font-size 8.5px; meta rows become `80px 1fr`.

#### Tea columns (`.tea-cols`)
- **Desktop**: CSS `column-count: 3`, `column-gap: 24px`, `column-rule: 1px solid var(--ink)`.
- **Mobile**: `column-count: 1`; items get hairline `border-bottom: 1px solid var(--aged)` (last none).

Each `.tea-item`:
- `break-inside: avoid`, `margin-bottom: 16px`.
- **`.tea-kicker`**: Space Mono 9.5px bold letter-spacing 0.18em uppercase ink, `border-bottom: 2px solid var(--ink)`, inline-block, `padding-bottom: 2px`, `margin-bottom: 8px`. Three values: `Heard 'round Sahara`, `On the Strip`, `Cultivator chatter`.
- **`.tea-body`**: Source Serif 4 14.5px (mobile 14px), line-height 1.55, **justified**, `hyphens: auto`, `text-wrap: pretty`. The first character is wrapped in `<span class="dropcap">` — Playfair 900 italic 38px, `float: left`, line-height 0.85, padding `4px 6px 0 0`.
- **`.tea-byline`**: Space Mono 10px letter-spacing 0.12em muted, right-aligned, `margin-top: 6px`. Mike signs everything `—M.`

Body copy used in the design (placeholder until real items are wired):
1. *Heard 'round Sahara* — Thrive's been restocking heavy this week — new Wyld and Stiiizy SKUs hit the case Tuesday. Manager wouldn't confirm but the back room had pallets. Something's coming, probably a 4/20 hangover sale that runs into next weekend.
2. *On the Strip* — Two of the corridor shops still pricing eighths at $55 retail. Same SKU is $32 four miles east. The math ain't mathing for tourists, and the security guard at the door agreed with me on the record.
3. *Cultivator chatter* — Word from a buyer at a Henderson grow: live resin yields are up, wholesale's soft, expect $30 carts to be standard by month's end. You heard it here, in print, on paper.

These are placeholders — wire up to a `tea_items` Supabase table or a Markdown collection. Keep the dropcap behavior; treat each item as `{ kicker, body, byline }`.

### Section 3 — Lucky 7 · Price History (Day-1 empty state)

Heading: `LUCKY 7 · PRICE HISTORY` · tail `— EVERY EDITION, ANOTHER DOT —`. Glyph `⌗`.
Section title: `Day 1 of tracking. The lines build with each printing.`

#### Chart wrapper (`.chart-wrap`)
- **Desktop**: `border: 1px solid var(--ink)`, `padding: 12px 14px 8px`, background newsprint.
- **Mobile** (`.is-scroll`): `overflow-x: auto`, side borders removed, horizontal padding 12px, `-webkit-overflow-scrolling: touch`. A `::after` pseudo-element renders `← scroll →` in Space Mono 8.5px muted, top-right.

#### SVG chart geometry
- **viewBox**: 1080×360 desktop, 720×280 mobile.
- **Padding**: `{ l:56, r:28, t:24, b:44 }`.
- **Y axis**: 0 → 40 (`ceil((maxAvg+4)/5)*5` = 40), 5 ticks at $0/$10/$20/$30/$40. Tick labels are Space Mono 10px muted, right-anchored at `x = padL - 8`. Gridlines at `1px` ink, opacity 0.18, dasharray `1 3` (the baseline gridline is opacity 0).
- **X axis**: a 27-day window, day -22 → day +4 relative to today (Apr 25, 2026). Major tick = month boundary or today; minor tick = every 7th day. Format: `MMM D` for majors, `D` for minors.
- **Plot frame**: `<rect>` on the inner area, ink stroke 1px, no fill.
- **TODAY guide**: vertical line at `x = padL + innerW * 0.82` (so 82% of the inner width is "history" and 18% is "future"). Stroke ink 1px, dasharray `2 3`. Above it, `◆ TODAY · APR 25` label in Space Mono 10px bold.
- **Ghost trails (the empty-state device)**: for each category, a horizontal `<line>` from `padL` → `todayX` at `y = yAt(avg)`, stroke = the category's color at opacity 0.18, dasharray `1 4`. This visually pre-stages where each category's line will eventually land.
- **Data dots — one per category**: `<circle r="5">` at `(todayX, yAt(avg))`, fill = category color, stroke = newsprint 1.5px (so dots punch out of any overlapping ghost trail).
- **Dot labels**: leader line from dot to right gutter at 50% opacity in the category color, then a Space Mono 9.5px bold right-anchored label `<CATEGORY> · $XX.XX`. Label color = category color.
- **Future hint**: Space Mono 10px letter-spacing 0.18em muted, centered between `todayX` and `padR`, text `⤳ LINES BUILD HERE`. Vertically centered on the plot area.

#### History footnote (`.history-foot`)
- Flex space-between, `margin-top: 10px`, `padding-top: 8px`, `border-top: 1px solid var(--aged)`.
- Left: Space Mono 10px letter-spacing 0.14em uppercase ink: `Day 1 of tracking · Lines build daily`.
- Right `.meta`: Space Mono 9px letter-spacing 0.16em uppercase muted: `NEXT EDITION: APR 26, 06:00 PST · DOTS BECOME LINES`.
- **Mobile**: stacks left-aligned, gap 4px.

### Page tail (`.p2-tail`)

- `margin-top: 12px`, `padding: 10px 0 14px`, `border-top: 3px double var(--ink)`, text-align center.
- Space Mono 10px letter-spacing 0.32em uppercase muted: `— END PG. 2 —`.

---

## Interactions & Behavior

Page 2 has **no interactivity** in v1 except the page-flip transition shared across all three pages (Framer Motion `AnimatePresence`, ~800ms easeInOut, with corner-curl + keyboard `←` `→`). The chart is a static SVG — no hover tooltips on Day 1.

Future state (post-Day-7, when real history exists):
- Replace ghost trails with actual polylines (`<polyline points=…>`) per category, stroke `2px`.
- Keep the TODAY guide and dots; remove the `⤳ LINES BUILD HERE` text and the right-side leader-line + label gutter (move labels to terminal points on the lines).
- Optional: light hover-to-highlight (raise the active line's opacity to 1, drop others to 0.25) — only if it doesn't conflict with the no-interactivity newspaper aesthetic.

### Reduced motion
The grain overlay is a static SVG (no animation). The page-flip respects `prefers-reduced-motion` (matches Page 1 behavior).

### Responsive
- **≥760px**: desktop layout (`page2.is-desktop`).
- **<760px**: mobile layout (`page2.is-mobile`). Bars wrap to 2 rows; tea collapses to 1 column with hairline dividers; chart wraps in a horizontal-scroll container; folio center cell hides.

---

## State Management

Server-rendered (Next.js App Router). All data passed in via `PageData`.

```ts
type PageTwoData = {
  // Section 1 — Lucky 7
  lucky7Averages: {
    eighth: number;       // avg in-stock retail price, $/eighth
    cart: number;         // 1g cart
    edible: number;       // 100mg edible
    resin: number;        // 1g live resin
    preroll: number;      // single pre-roll, ≤1g
    infused: number;      // infused pre-roll, single
    disposable: number;   // 1g disposable
  };
  totalListings: number;          // for the "N = X,XXX" footer
  lastUpdatedAt: string;          // ISO

  // Section 2 — Big Mike's Tea
  teaItems: Array<{
    kicker: string;
    body: string;
    byline: string;     // typically "—M."
    filedAt: string;    // ISO; the latest is shown in tea-head meta
  }>;
  teaSourcesSummary: string;      // e.g. "3 anon · 1 named"

  // Section 3 — Price History
  // For each Lucky 7 category, an array of {date, price} dating back to launch.
  // On Day 1 each array has length 1.
  priceHistory: Record<keyof PageTwoData["lucky7Averages"], Array<{ date: string; price: number }>>;
};
```

### Supabase queries

```sql
-- §1: Lucky 7 averages today
SELECT
  AVG(price) FILTER (WHERE category = 'flower' AND weight_grams = 3.5)              AS eighth_avg,
  AVG(price) FILTER (WHERE category = 'cart'   AND weight_grams = 1.0)              AS cart_avg,
  AVG(price) FILTER (WHERE category = 'edible' AND total_thc_mg = 100)              AS edible_avg,
  AVG(price) FILTER (WHERE category = 'concentrate' AND subtype = 'live_resin' AND weight_grams = 1.0) AS resin_avg,
  AVG(price) FILTER (WHERE category = 'preroll' AND infused = false AND units_in_pack = 1) AS preroll_avg,
  AVG(price) FILTER (WHERE category = 'preroll' AND infused = true  AND units_in_pack = 1) AS infused_avg,
  AVG(price) FILTER (WHERE category = 'vape'   AND subtype = 'disposable' AND weight_grams = 1.0) AS disposable_avg,
  COUNT(*)                                                                          AS total_listings
FROM products
WHERE in_stock = true AND snapshot_date = CURRENT_DATE;

-- §3: Price history — daily snapshot table
SELECT snapshot_date AS date, eighth_avg, cart_avg, edible_avg,
       resin_avg, preroll_avg, infused_avg, disposable_avg
FROM lucky7_daily
ORDER BY snapshot_date ASC;
```

Add a `lucky7_daily` materialized view (refresh after each scrape) so §3 is a single-table read.

---

## Design Tokens

### Colors — existing (already in `globals.css`)
```
--newsprint: #f4f0e4    page bg
--ink:       #1a1008    primary text, rules
--accent:    #2d6a4f    forest green (Page 1 spec)
--aged:      #f0e9d9    secondary surfaces, hairline dividers
--muted:     #6b5e45    secondary text, labels, kickers
--ticker-red:#d62828    used here only for stat down-deltas (n/a on Page 2)
```

### Colors — NEW (add to `:root` in `globals.css`)

The Lucky 7 data palette. Each is in chroma 0.06–0.12 / lightness 0.30–0.55, distinguishable as both 14px bar fill and 1.5px line stroke on `#f4f0e4`. No two adjacent rows share a hue family.

```css
--cat-eighth:     #2d6a4f;   /* forest green   — Eighth */
--cat-cart:       #9c2a2a;   /* oxblood        — 1g Cart */
--cat-edible:     #b8841c;   /* mustard ochre  — 100mg Edible */
--cat-resin:      #1f3a5f;   /* ink navy       — 1g Live Resin */
--cat-preroll:    #7a5a2e;   /* tobacco brown  — Single Pre-Roll */
--cat-infused:    #6b3a82;   /* aged plum      — Infused Pre-Roll */
--cat-disposable: #3d6b78;   /* slate teal     — 1g Disposable */
```

`--cat-eighth` is intentionally identical to `--accent`. The forest green doubles as both the Page 1 brand accent and the eighth-flower data color — this is by design (the eighth is the canonical unit, so the brand color anchors it on the Lucky 7 chart). If you want them split for clarity in code, alias: `--cat-eighth: var(--accent);`.

### Typography
```
Playfair Display 700/900   — section titles, tea title, stat values, kicker glyph, dropcap
Space Mono   400/700       — every label, kicker, axis tick, byline, meta
Source Serif 4             — tea body copy, justified with hyphens-auto
UnifrakturMaguntia         — masthead only (not used on Page 2)
```

Sizes (desktop):
- Section title: 26px / 1.18 / -0.005em
- Tea title: 32px / 1.1 / -0.01em (Playfair 900)
- Bar value: 18px (Playfair 700, tabular-nums)
- Tea body: 14.5px / 1.55 (Source Serif 4, justified)
- Bar name / row: 11px Space Mono bold, letter-spacing 0.04em
- Kicker: 10px Space Mono bold, letter-spacing 0.22em
- Axis tick / dot label: 9.5–10px Space Mono

Sizes (mobile, where they differ):
- Section title 20px
- Tea title 22px
- Bar value 14px
- Bar name 10px
- Tea body 14px

### Spacing
- Section padding (desktop): `22px 28px 24px`
- Section padding (mobile): `18px 14px 20px`
- Folio padding: `7px 24px` desktop, `6px 14px` mobile
- Bar row vertical: 11px desktop, 9px mobile
- Tea column gap: 24px (desktop only)
- Chart inner padding: `{ l:56, r:28, t:24, b:44 }`
- Tea item bottom margin: 16px desktop, 14px mobile (with hairline divider)

### Borders / rules
- Single rule: `1px solid var(--ink)`
- Hairline (within aged areas): `1px solid var(--aged)`
- Section separator (`.rule-double`): two stacked 1px ink rules, 4px tall total
- Page tail rule: `3px double var(--ink)` (real CSS double, only used at the very bottom)
- Tea kicker underline: `2px solid var(--ink)` inline-block
- Bar fill leading edge: `1.5px solid var(--ink)`

### Radii / shadows / gradients
**None.** Explicitly forbidden, per Page 1 hard rules. The bar track has a 4px-period repeating linear-gradient at 6% opacity, used as a paper-grain texture (not as decoration); this is the only `linear-gradient` in the section and it is allowed because it reads as ink-on-paper.

### Glyphs (typographic only — no SVG icons)
`§` Lucky 7 averages · `☕` Local Tea · `⌗` Price History · `◆` TODAY marker · `⤳` future hint · `▸` notes bullets · `│` separators · `·` middle dots.

---

## Assets

No image assets. Everything is rendered with type, CSS, and inline SVG.

The grain overlay is the same SVG-noise data-URI already on `body::after` in `globals.css`; no change needed.

---

## Files in this handoff

- `Page 2 - The Sheet.html` — design canvas with desktop, mobile, palette card, and layout notes side-by-side. The primary review document.
- `Page 2 - The Sheet-print.html` — print-ready stacked version (same artboards, no canvas chrome). Used to generate the PDF; ignore for implementation.
- `page2.jsx` — the React component (`PageTwo`, `Lucky7`, `LocalTea`, `PriceHistory`) plus the `CATEGORIES` data array. **This is the canonical reference for component structure.**
- `page2.css` — all of the styles described above. Class names mirror what the production component should use.
- `design-canvas.jsx` — the canvas host component (not part of the design — used only to lay out the artboards in the review document; do not port).

## Files in the target repo to modify

- `src/app/components/Page2.tsx` — port the JSX from `page2.jsx`. Keep prop names; replace the `compact` prop with media-query-driven CSS.
- `src/app/globals.css` — add the `--cat-*` tokens listed above and append the `page2.css` rule blocks (rename selectors if they collide; everything is namespaced under `.page2 .…` so collisions should be limited to `.kicker` / `.section-title` — disambiguate by prefixing them `.page2 .kicker`, `.page2 .section-title`).
- `src/lib/data.ts` — extend with the `PageTwoData` shape and the two queries above.
- New migration: `lucky7_daily` materialized view + a refresh job after the daily scrape (`scripts/scrape-dispensaries.ts` already runs once per day; tack the refresh on the end).

## Hard constraints (repeated for the implementer)

- No gradients (except the bar-track paper-grain), no shadows, no rounded corners, no SaaS card chrome.
- Typographic glyphs only — no SVG icons, no icon font.
- The seven `--cat-*` colors must be used exactly as listed; no neon, no shifting hues.
- §3 is a **deliberate empty state** for Day 1 — keep the ghost trails and `⤳ LINES BUILD HERE` until day 7+, then swap them out for real polylines.
- Big Mike's body copy is placeholder; wire to a real source before launch.
- Tea body copy must remain **justified with hyphens-auto** — that justified setting is what makes it read as newsprint, not blog.
