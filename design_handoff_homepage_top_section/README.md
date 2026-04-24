# Handoff: Homepage Top Section Redesign (Page 1) — **Mobile-First**

## Overview
Redesign of the **top section** of `dailyweednewspaper.com` — above the 3-column newspaper grid. **Primary target is mobile (390px).** Desktop is secondary.

Content blocks, vertical order:

1. **Masthead** — folio, Latin motto, fraktur title, subhead, Today's Almanac, triple-rule dateline.
2. **Ticker** — red band with pulsing "Live" flag + scrolling headlines. **Pick of the Day is the anchor headline** here (no separate panel).
3. **Stats strip** — "MARKET VITALS" band, 5 market-data cells, delta indicators, exclusion footnote.

Mobile chrome:
- **Top bar** (hamburger + `VOL. I · № 024` pill + Sign In) — replaces desktop folio strip.
- **Bottom nav** (5 shortcuts: Front · Prices · Top 10 · Tea · Ziggy) — replaces desktop section rail.
- **Slide-in index sheet** — Today's Index + full Today's Almanac + edition metadata.

No CTAs / subscription / upsell in this section.

## About the Design Files
- `Top Section — Mobile.html` — **primary** reference, 390px. Build this first.
- `Top Section.html` — desktop reference (max-width 1400px).

Both are HTML design references, not production code. Recreate in the existing Next.js + Tailwind codebase (`src/app/components/Page1.tsx` + `src/app/globals.css`). The codebase already has the font imports, `:root` tokens, and grain overlay — reuse them.

## Fidelity
**High-fidelity.** Match pixel-for-pixel at both breakpoints. Hard rules: no gradients, no shadows, no rounded corners, no floating cards. Yes to column rules, double rules, kicker labels, triple-rule dateline.

---

## Mobile Layout (390px) — priority build

Top to bottom:

1. **`.mbar`** — flex, `padding: 8px 14px`, bottom `1px solid var(--ink)`.
   - Left: hamburger button (22×14px, three 2px ink bars) → opens index sheet.
   - Center: `VOL. I · № 024` pill, 1px ink border, padding 2px 6px, Space Mono 10px bold.
   - Right: `Sign In`, Space Mono 10px bold, color `var(--accent)`. Wire to existing `AuthLabel`.
2. **`.mfolio`** — flex center, gap 10px, `padding: 4px 14px`, bottom 1px ink. Source Serif italic 10px motto `"All the Deals That's Fit to Print"` + `│` (opacity 0.5) + Space Mono 9px `36°10′N · 115°08′W`.
3. **`.masthead`** — `padding: 16px 14px 0`, text-align center.
   - Latin motto `Veritas · Cannabis · Economia` — Source Serif italic 10.5px muted, `::before`/`::after` `·` margin 8px.
   - Title `Daily Weed Newspaper` — UnifrakturMaguntia **54px**, line-height 0.9, letter-spacing -0.5px, `white-space: nowrap`. (54px is the size that fits the full word inside 362px of content width.)
   - Subhead — Space Mono 9px, letter-spacing 0.18em, uppercase: `The Only Cannabis Publication § That Actually Gives a Damn About Your Wallet`. `§` wraps in `<span class="tilde">` at `var(--accent)`, bold, margin 0 6px.
4. **`.malmanac`** slim almanac strip — `margin: 14px 14px 0`, hairline rules top+bottom `1px solid var(--aged)`, `padding: 6px 10px`, flex space-between. Shows **only High/Low + Moon** on mobile; the full almanac is preserved in the hamburger sheet.
   - Left: label `Today's Almanac` — Playfair italic 900 10px ink.
   - Right group: `78°/54°` bold + `│` + `☾ Waxing Gibbous`.
5. **`.dateline`** — triple rule (1px border-top + absolute `::before { top:-5px; border-top: 3px solid ink }` + 1px border-bottom). `padding: 7px 14px`, text-align center, Space Mono 9.5px letter-spacing 0.1em uppercase, line-height 1.7. Three stacked `<span class="row">`:
   - Row 1: `Friday, April 24, 2026 │ Edition № 024` (edition # `.accent` forest green bold).
   - Row 2: `Las Vegas · Nevada · U.S.A.`
   - Row 3: `16 Dispensaries │ 3,617 Menus Priced` (count `.accent`).
   - `.divider` between pairs: 1×9px muted bar, margin 0 8px, vertical-align middle.
6. **`.ticker-shell`** — full width, `grid-template-columns: auto 1fr`, background `var(--ticker-red)`, top+bottom 1px ink.
   - `.ticker-flag` (static left): background `#a41d1d`, border-right `1px solid #fff3`, padding 0 10px, gap 6px. Pulsing 6px white dot (`@keyframes pulse` 1.6s ease-in-out: opacity 1→0.35→1) + `Live` (Space Mono 9px bold letter-spacing 0.12em uppercase). Kept on mobile; label shortened from "Ziggy Live" to "Live".
   - `.ticker-bar`: overflow-hidden, white-space nowrap, padding 7px 0, Space Mono 11px bold. `.ticker-inner` has `padding-left: 100%; animation: ticker-scroll 50s linear infinite`, pauses on hover.
   - Headlines (duplicate set for seamless loop):
     1. `★ PICK OF THE DAY` → `{topDeals[0].name} — {discountPct}% OFF at {dispensaryName}, now ${price} — "{ZIGGY_LINER}"` — **anchor headline, replaces the separate Pick panel.**
     2. `★ ZIGGY REPORT` → `Strip dispensaries still charging 2022 prices`
     3. `ON SALE` → `{onSaleCount} products discounted right now`
     4. `LOW WATERMARK` → `Cheapest eighth spotted at ${minPriceExAccessories}`
     5. `AVG PRICE` → `${avgPriceExAccessories} across all menus`
     6. `MARKET RATING` → `{marketRating} / 10 — prices softening`
     7. `ZIGGY SAYS` → random `ZIGGY_LINERS`
   - Tags: `.tk-tag` color `#ffd28a` bold margin-right 5px letter-spacing 0.08em. Separator: `.tk-sep` `◆` color `#ffffffaa` margin 0 14px.
7. **`.stats-strip`** — relative, bottom `3px double var(--ink)`. `::before` notched label **MARKET VITALS** at `top:-8px; left:50%; transform:translateX(-50%)`, background newsprint, padding 0 12px, Space Mono 8.5px bold letter-spacing 0.3em muted, white-space nowrap.
   - `.stats-grid` = `display: grid; grid-template-columns: 1fr 1fr; padding-top: 12px`.
   - **2-2-1 layout**: cells 01–04 fill a 2×2 (each with `border-right: 1px solid ink` removed on every 2nd, `border-bottom: 1px solid ink`). Cell 05 uses `.stat-box.span2` → `grid-column: 1 / -1`, no right/bottom border. **Avg Price gets full-width emphasis** — it's the single most-scanned number on a price-intel product. Kicker becomes `Average Price (Across All Menus)`, number 44px (vs 36px on 01–04), sub lists included categories.
   - Each `.stat-box`: `padding: 14px 10px 12px`, text-align center.
   - `.stat-kicker`: Space Mono 8.5px letter-spacing 0.2em uppercase muted, flex center gap 5px, margin-bottom 8px. Leading `01`–`05` in `<span class="tag">` forest-green bold.
   - `.stat-number`: Playfair 900 **36px** (44px on span2), line-height 1, letter-spacing -0.02em, `font-variant-numeric: tabular-nums`. `$` prefix in `.pre` (Space Mono, 0.5em, muted, 400, position relative top 0.25em). Asterisk in `.ast` (Space Mono, 0.32em, forest green, bold, top 0.4em) — **only on cells 04 and 05**.
   - `.stat-hair`: 28×1px ink, margin `8px auto 6px`.
   - `.stat-sub`: Space Mono 9px letter-spacing 0.12em uppercase muted line-height 1.4. Delta child `.delta`: display block margin-top 2px, 8.5px, forest bold letter-spacing 0.08em. `.delta.down`: color `var(--ticker-red)`.
   - **Optional alt layout: horizontal scroll.** Change `.stats-grid` to `display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch`; each `.stat-box` becomes `flex: 0 0 60%; scroll-snap-align: start`. Default is 2-2-1 grid because it keeps all five visible without interaction — matches the newspaper-strip metaphor better.

   Cell contents (mobile-tightened copy):

   | # | Kicker | Number | Sub | Delta |
   |---|---|---|---|---|
   | 01 | Total Products | `3,617` | `Menus Priced` | `▲ 142 vs. last ed.` |
   | 02 | Dispensaries | `16` | `Las Vegas Metro` | `All Audited` |
   | 03 | On Sale Now | `1,248` | `34.5% of Inv.` | `▲ 3.1 pts w/w` |
   | 04 | Lowest Price* | `$4.99*` | `Pre-Roll, 0.5g` | `Thrive · N.L.V.` |
   | 05 | Average Price (Across All Menus)* | `$38.74*` | `Flower · Pre-Rolls · Concentrates · Edibles · Vapes` | `▼ $0.42 vs. last edition` (down=red) |

8. **`.stats-footnote`** — `padding: 8px 14px`, top `1px solid var(--aged)`, text-align center, line-height 1.5.
   - Line 1: Source Serif italic 10.5px muted: `*Excludes accessories, apparel & novelty.` Leading `*` in `<span class="ast">` Space Mono not-italic bold forest green, margin-right 3px.
   - Line 2 `.meta`: Space Mono 8.5px letter-spacing 0.14em uppercase: `Sourced from public menus · Updated 06:00 PST` (wire to real snapshot timestamp).

### Mobile chrome (outside content flow)

9. **`.mbottom`** bottom nav — `position: fixed; bottom: 0`, full 390px width (max 440px on wider phones), `grid-template-columns: repeat(5, 1fr)`, background newsprint, top `3px double var(--ink)`, z-index 500. **Reserve space on `.sheet`: `padding-bottom: 56px`.**
   - Cells: **Front** (current) · **Prices** · **Top 10** · **Tea** · **Ziggy**.
   - Each cell: `padding: 9px 2px 10px`, text-align center, `border-right: 1px solid var(--aged)` (last none), Space Mono 9px letter-spacing 0.08em uppercase ink, line-height 1.2, no underline.
   - Each has a Playfair 900 13px typographic glyph above the label: `¶ $ ★ ☕ Z`. No SVG icons.
   - Current cell: `color: var(--accent); background: var(--aged); font-weight: 700`; glyph inherits forest.
10. **`.index-sheet`** slide-in drawer — `position: fixed; top:0; left:0; width: 300px; height: 100vh`, background newsprint, `border-right: 3px double var(--ink)`, z-index 1000. Transform `translateX(-100%)` → `translateX(0)` with `.open`, transition 0.25s ease. Overflow-y auto, padding 18px 20px.
    - `.sheet-backdrop`: `position: fixed; inset: 0; background: rgba(26,16,8,0.55)`, z-index 900, opacity 0→1 with `.open`, transition 0.2s.
    - Close button `.x` top-right, Space Mono 14px bold `✕`.
    - Header `Today's Index` — Playfair italic 900 16px, bottom `1px solid var(--ink)`, padding-bottom 6px.
    - Index `dl` (grid `1fr auto`, gap 0 10px, Space Mono 11px line-height 2): Front Page/01, Inside Scoop/02, The Closer/03, Market Data/04, Ziggy's Column/05, Big Mike's Tea/02, Tourist Terry/03.
    - Subhead `Today's Almanac` — Space Mono 9px letter-spacing 0.2em uppercase muted, top `1px solid var(--aged)`, padding-top 10px, margin `18px 0 6px`. Full 5-row dl: Sunrise/05:58, Sunset/19:14, High/Low/78°/54°, Humidity/18%, Moon/Waxing Gibbous. `dd` bold ink right-aligned.
    - Subhead `Edition`. dl: Volume/I, Number/024, Date/Apr 24 '26, Latitude/36°10′N, Longitude/115°08′W.
    - Footer: Source Serif italic 11px muted: `"All the Deals That's Fit to Print." — Est. April 2026`.
    - **React state** in `Page1.tsx`: `const [indexOpen, setIndexOpen] = useState(false)`. Lock body scroll while open. Close on Esc keydown and on backdrop click. Move focus to close button on open, restore on close.

---

## Desktop Layout (≥1000px)

At `min-width: 1000px`, the existing `Top Section.html` is authoritative:

- Hide `.mbar`, `.mfolio`, `.malmanac`, `.mbottom`, `.index-sheet`.
- Show desktop folio strip (3-col `1fr auto 1fr`, padding 6px 28px, bottom 1px ink). Left: `VOL. I` pill + `No. 024` + `│` + coords. Center: italic motto. Right: `Las Vegas, Nev.` + weather + `Sign In`.
- `.masthead-row` becomes `grid-template-columns: 1fr auto 1fr; gap: 28px`.
- Left ornament — **Today's Index** (5 rows, right-aligned).
- Right ornament — **Today's Almanac** full (Sunrise/Sunset/High-Low/Humidity/Moon). **Confirmed keeper.** (The earlier Market Snapshot was removed — vibes-based.)
- Dateline becomes single-row 3-col (`1fr 2fr 1fr`), Space Mono 10.5px.
- Section rail (bottom `3px double var(--ink)`, flex center wrap): Front Page · Price Dashboard · Top 10 Winners · Big Mike's Tea · Tourist Terry · Ziggy's Column. **Archives removed.** Current link `color: var(--accent)` with trailing `●`.
- Stats grid becomes `repeat(5, 1fr)`. No `.span2`. Stat number scales `clamp(40px, 4.6vw, 60px)`. Box padding `22px 18px 18px`.

---

## Components (shared) — full reference

### Screen: Homepage Top Section (Page 1, above the 3-column grid)

**Purpose:** Establishes the newspaper identity at first contact and surfaces the five market vitals. Tells the reader in one glance: this is a broadsheet for cannabis price intelligence in Las Vegas, with a personality.

**Layout:** Single column, max-width `1400px`, centered. Stacked blocks top-to-bottom. No gutters between blocks — they abut via shared rules.

Vertical order:

1. `.folio` — 1-row horizontal strip, 3-column grid (`1fr auto 1fr`), `padding: 6px 28px`, bottom rule `1px solid var(--ink)`.
2. `.masthead` — `padding: 22px 28px 0`. Contains:
   - `.masthead-row` — 3-column grid (`1fr auto 1fr`, `gap: 28px`, `align-items: center`).
     - `.orn-left` (Today's Index)
     - `.title-wrap` (Latin motto + fraktur title + subhead)
     - `.orn-right` (Today's Almanac)
   - `.dateline` — `margin-top: 18px`, bordered top+bottom with an additional 3px rule offset `-5px` above (the triple-rule signature). Interior is 3-column `1fr 2fr 1fr`.
3. `.section-rail` — nav row, double-bottom-border (`3px double var(--ink)`), `padding: 6px 28px 10px`, flex centered, wraps on narrow screens.
4. `.ticker-shell` — 2-column grid (`auto 1fr`). Left cell is `.ticker-flag` (static "Ziggy Live" tag on darker red). Right cell is `.ticker-bar` with the scrolling `.ticker-inner`.
5. `.stats-strip` — relative container with the "MARKET VITALS" label notched into the top rule via `::before` absolutely positioned. Contains `.stats-row` (5-column grid) and `.stats-footnote` beneath.

---

## Components

### 1. Folio strip (`.folio`)
- Background: `var(--newsprint)` / `#f4f0e4`.
- Border-bottom: `1px solid var(--ink)`.
- Padding: `6px 28px`.
- Font: `'Space Mono', monospace`, `10px`, `letter-spacing: 0.08em`, `text-transform: uppercase`, color `var(--muted)` / `#6b5e45`.
- **Left cell** (flex, gap 14px):
  - `<span class="pill">VOL. I</span>` — `padding: 1px 6px`, `border: 1px solid var(--ink)`, color `var(--ink)`, `font-weight: 700`.
  - `No. 024` (dynamic — edition number, zero-padded 3 digits).
  - Separator `│` at `opacity: .5`.
  - `36°10′N · 115°08′W` — static coordinates for Las Vegas.
- **Center cell** (hidden below 640px): `"All the Deals That's Fit to Print" — Est. April 2026`. Set in `'Source Serif 4'` italic, `11px`, `color: var(--ink)`.
- **Right cell** (flex, gap 14px):
  - `Las Vegas, Nev.` (static location)
  - `Partly Cloudy · 72°F` (weather — wire to weather API or leave static; low priority)
  - `Sign In` (link — wire into existing `AuthLabel` component)
  - All separated by `│` at `opacity: .5`.

### 2. Masthead (`.masthead`)
- Padding: `22px 28px 0`. No bottom border of its own (the dateline and section rail handle closure).

#### 2a. Left ornament — Today's Index (`.orn.orn-left`)
- Font: `'Space Mono', monospace`, `10px`, line-height `1.7`, color `var(--muted)`, uppercase, `letter-spacing: 0.08em`.
- Text-align right; `padding-right: 4px`.
- **Header `.head`**: `'Playfair Display'` 900 italic, `13px`, color `var(--ink)`, not uppercased, `border-bottom: 1px solid var(--ink)`, inline-block, `padding-bottom: 4px`, `margin-bottom: 6px`. Text: **"Today's Index"**.
- **Definition list** `dl`: `display: grid; grid-template-columns: 1fr auto; gap: 2px 10px; text-align: right`.
  - Rows: `Front Page / 01`, `Inside Scoop / 02`, `The Closer / 03`, `Market Data / 04`, `Ziggy's Column / 05`.
  - `dt` color `var(--muted)`; `dd` color `var(--ink)`, `font-weight: 700`.

#### 2b. Title block (`.title-wrap`)
- Text-align center, `padding: 0 8px`.
- **Latin motto** (`.latin-motto`): `'Source Serif 4'` italic, `12px`, color `var(--muted)`, `letter-spacing: 0.04em`, `margin-bottom: 4px`. Text: `Veritas · Cannabis · Economia`. Use `::before`/`::after` to add `·` ornaments at 10px margin.
- **Title** (`.masthead-title`): `'UnifrakturMaguntia', cursive`, `font-size: clamp(54px, 8.4vw, 112px)`, `line-height: 0.92`, `letter-spacing: -1px`, color `var(--ink)`, `white-space: nowrap`, padding `2px 0 0`. Text: **"Daily Weed Newspaper"**.
- **Subhead** (`.masthead-subhead`): `'Space Mono'`, `11px`, `letter-spacing: 0.22em`, uppercase, color `var(--ink)`, `margin-top: 10px`. Text: **"The Only Cannabis Publication § That Actually Gives a Damn About Your Wallet"**. The `§` is wrapped in `<span class="tilde">` and rendered in `var(--accent)` / `#2d6a4f`, `font-weight: 700`, `margin: 0 8px`.

#### 2c. Right ornament — Today's Almanac (`.orn.orn-right`)
- Mirrors left ornament styles; text-align left; `padding-left: 4px`; dl grid is `auto 1fr` (default, left-aligned).
- Header text: **"Today's Almanac"**.
- Rows (static, but wire to a weather/almanac API if desired):
  - `Sunrise / 05:58`
  - `Sunset / 19:14`
  - `High / Low — 78° / 54°`
  - `Humidity / 18%`
  - `Moon / Waxing Gibbous`
- **Important:** The earlier "Market Snapshot" block (Sentiment / Pricing / Inventory / Strip Markup / Verdict) was removed per design review — it was vibes-based and undermined data credibility. Do not reintroduce it. Today's Almanac is factual/observable and is the correct element for this slot.

#### 2d. Dateline (`.dateline`)
- `margin-top: 18px`. Border-top and border-bottom both `1px solid var(--ink)`. Plus an additional 3px rule offset `-5px` above (create with `::before { position: absolute; left: 0; right: 0; top: -5px; border-top: 3px solid var(--ink); }`). Result: a thin/thick/thin triple rule — the broadsheet signature.
- Interior `.dateline-inner`: 3-col grid `1fr 2fr 1fr`, `'Space Mono'`, `10.5px`, `letter-spacing: 0.1em`, uppercase, `padding: 8px 0`.
- **Left cell**: `Friday, April 24, 2026 │ Edition № 024` — date from `new Date().toLocaleDateString(...)`; edition number from days since launch (see existing `Page1.tsx`).
- **Center cell**: `Las Vegas · Nevada · United States of America`. `letter-spacing: 0.18em`.
- **Right cell**: `16 Dispensaries Audited │ 3,617 Menus Priced` — wire to `stats.dispensaryCount` and `stats.totalProducts`.
- `.divider` between pairs: `display: inline-block; width: 1px; height: 10px; background: var(--muted); margin: 0 10px; vertical-align: middle`.
- `.accent` (edition number, total products): `color: var(--accent); font-weight: 700`.

### 3. Section rail (`.section-rail`)
- Flex centered, wrap, `padding: 6px 28px 10px`, `border-bottom: 3px double var(--ink)`, `'Space Mono'`, `10px`, `letter-spacing: 0.18em`, uppercase.
- Links: `color: var(--ink)`, no underline, `padding: 0 14px`, `border-right: 1px solid var(--aged)` (last-child: none).
- Current link (`.current`): `color: var(--accent)`, `font-weight: 700`, followed by a `●` (8px) via `::after` in accent color, `margin-left: 6px`.
- **Items (in order):** Front Page (current) · Price Dashboard · Top 10 Winners · Big Mike's Tea · Tourist Terry · Ziggy's Column.
- **Archives was removed** per design review. Do not include it.

### 4. Ticker (`.ticker-shell`)
- 2-column grid `auto 1fr`. Background `var(--ticker-red)` / `#d62828`. White text. Top and bottom `1px solid var(--ink)`.
- **`.ticker-flag`** (left): static, doesn't scroll. `background: #a41d1d`, `border-right: 1px solid #fff3`, `padding: 0 14px`, flex center, gap 8px, `'Space Mono'`, `10px`, bold, `letter-spacing: 0.16em`, uppercase. Contents: a 7px white dot (`.dot`) with `pulse` animation (1.6s ease-in-out infinite, opacity 1 → 0.35 → 1), then the word "Ziggy Live". Hidden on screens ≤640px.
- **`.ticker-bar`** (right): `overflow: hidden`, `white-space: nowrap`, `padding: 8px 0`, `'Space Mono'`, `12px`, bold.
  - `.ticker-inner`: `display: inline-block; padding-left: 100%; animation: ticker-scroll 55s linear infinite`. Pauses on hover (`animation-play-state: paused`).
  - Each headline is preceded by `<span class="tk-tag">` (color `#ffd28a`, bold, `letter-spacing: 0.1em`, `margin-right: 6px`) and separated by `<span class="tk-sep">◆</span>` (color `#ffffffaa`, `margin: 0 18px`).
  - **Headlines (in order, loop to provide seamless scroll — duplicate the set):**
    1. `★ PICK OF THE DAY` → top deal from `topDeals[0]`: "{product name} {weight} — {discountPct}% OFF at {dispensary}, now ${price} — ‘{Ziggy one-liner}’"
    2. `★ ZIGGY REPORT` → "Strip dispensaries still charging 2022 prices"
    3. `ON SALE` → "{onSaleCount} products discounted right now"
    4. `LOW WATERMARK` → "Cheapest eighth spotted at ${minPrice}"
    5. `AVG PRICE` → "${avgPrice} across all menus"
    6. `MARKET RATING` → "{marketRating} / 10 — prices softening"
    7. `ZIGGY SAYS` → random Ziggy one-liner from `ZIGGY_LINERS`
  - **The Pick of the Day previously lived in its own panel on the right rail; it now lives only in the ticker**, per the design review. Do not also render it as a separate box.

### 5. Stats strip (`.stats-strip`)
- `border-bottom: 3px double var(--ink)`, relative.
- **"MARKET VITALS" label** (`::before`): absolutely positioned `top: -8px; left: 50%; transform: translateX(-50%)`, `background: var(--newsprint)`, `padding: 0 14px`, `'Space Mono'` 9px bold, `letter-spacing: 0.32em`, uppercase, color `var(--muted)`. Sits on top of the incoming double rule, appearing notched into it.

#### 5a. Stats row (`.stats-row`)
- 5-column grid, `padding-top: 10px`.
- Each `.stat-box`: `padding: 22px 18px 18px`, text-align center, `border-right: 1px solid var(--ink)` (last-child none).

For each stat cell, in order:

| # | Kicker | Data source | Number format | Sub label | Delta line |
|---|---|---|---|---|---|
| 01 | Total Products | `stats.totalProducts` | integer w/ thousands separators | "Menus Priced" | `▲ {n} vs. last edition` (accent green, or `▼` red if down) |
| 02 | Dispensaries | `stats.dispensaryCount` | integer | "Las Vegas Metro" | "All Legal · All Audited" (accent green) |
| 03 | On Sale Now | `stats.onSaleCount` | integer | `{(onSaleCount/totalProducts*100).toFixed(1)}% of Inventory` | `▲ {pts} pts week-over-week` |
| 04 | Lowest Price\* | `stats.minPriceExAccessories` | `$` prefix + `N.NN` | "{product subtype}, {size}" e.g. "Single Pre-Roll, 0.5g" | "{dispensary} · {city}" (accent green, no arrow) |
| 05 | Avg Price\* | `stats.avgPriceExAccessories` | `$` prefix + `N.NN` | "Across All Menus" | `▼ ${delta} vs. last edition` (down = red) |

- **Kicker** `.stat-kicker`: flex center, gap 6px, `'Space Mono'` 9px, `letter-spacing: 0.22em`, uppercase, color `var(--muted)`, `margin-bottom: 10px`. The leading `01`–`05` digits go in `<span class="tag">` colored `var(--accent)`, weight 700.
- **Number** `.stat-number`: `'Playfair Display'` 900, `font-size: clamp(40px, 4.6vw, 60px)`, `line-height: 1`, `letter-spacing: -0.02em`, `font-variant-numeric: tabular-nums`, color `var(--ink)`, inline-block, relative.
  - `.pre` (for `$`): `font-size: 0.5em`, `vertical-align: top`, `margin-right: 2px`, color `var(--muted)`, weight 400, `'Space Mono'`, position relative, `top: 0.25em`.
  - `.ast` (asterisk on #4 and #5): `'Space Mono'`, `font-size: 0.32em`, `vertical-align: top`, color `var(--accent)`, weight 700, `margin-left: 3px`, `top: 0.4em`. **Only on Lowest Price and Avg Price.**
- **Hair rule** `.stat-hair`: `width: 36px; height: 1px; background: var(--ink); margin: 10px auto 8px`.
- **Sub label** `.stat-sub`: `'Space Mono'`, 10px, `letter-spacing: 0.14em`, uppercase, color `var(--muted)`, line-height 1.4.
- **Delta line** `.stat-sub .delta`: `display: block; margin-top: 3px; font-size: 9px; color: var(--accent); font-weight: 700; letter-spacing: 0.1em`. `.down` variant: `color: var(--ticker-red)`.

#### 5b. Stats footnote (`.stats-footnote`)
- Flex row, space-between, `padding: 8px 20px`, `border-top: 1px solid var(--aged)`, `'Source Serif 4'` italic, 11px, color `var(--muted)`.
- **Left**: `"*Figures exclude accessories, apparel & novelty items. Flower, pre-rolls, concentrates, edibles, vapes & tinctures only."` — leading `*` wrapped in `<span class="ast">` styled `'Space Mono'` not-italic bold, color `var(--accent)`, `margin-right: 4px`.
- **Right (`.meta`)**: `'Space Mono'` not-italic, 9.5px, `letter-spacing: 0.14em`, uppercase, color `var(--muted)`. Text: `"Sourced from public menus · Updated 06:00 PST · Refreshed every 4 hrs"`. Replace with real updated-at timestamp from the latest snapshot row.

---

## Interactions & Behavior

- **Ticker scroll**: 55s linear infinite. Pause on hover (already in CSS). Accessibility: consider `prefers-reduced-motion` to disable the animation.
- **Live dot pulse**: 1.6s ease-in-out infinite, opacity 1 → 0.35 → 1.
- **Section rail links**: standard navigation. Current section gets `.current` class server-side.
- **Stats numbers**: no interactivity; pure data display.
- **Delta indicators**: computed server-side comparing today's numbers to yesterday's snapshot (see State Management).
- **No hover effects** on stat boxes, no click handlers in this section, no CTA buttons — this is the newspaper header.

### Responsive behavior
- **≤1000px**: Masthead row collapses to single column; ornaments center-align. Dateline inner collapses to single column. Stats row becomes `3fr` — boxes 4 and 5 wrap to a new row with a top border.
- **≤640px**: Folio center cell hidden. Ticker flag hidden. Stats row becomes 2-column. Footnote stacks, text-align center.

---

## State Management

The component is server-rendered (Next.js App Router). All data is passed in via `PageData` from `@/lib/data`. No client state needed for this section except the CSS animations.

**Required fields on `stats` (extend `PageData` if missing):**

```ts
type Stats = {
  totalProducts: number;
  dispensaryCount: number;
  onSaleCount: number;

  // EXCLUDE accessories, apparel, novelty from these two:
  minPriceExAccessories: number;
  avgPriceExAccessories: number;

  // For the Lowest Price sub-label:
  minPriceProduct: { name: string; category: string; size: string; dispensaryName: string; city: string };

  // Deltas vs. previous day's snapshot:
  totalProductsDelta: number;          // e.g. +142
  onSalePct: number;                    // 34.5
  onSalePctDeltaPts: number;            // +3.1
  avgPriceDelta: number;                // -0.42 (negative = down)
  lastUpdatedAt: string;                // ISO timestamp for footnote
};
```

### Supabase queries

Exclusion filter for Lowest Price and Avg Price — exclude these category values (adjust to your enum):

```sql
WHERE category NOT IN ('accessories', 'apparel', 'novelty')
```

Today's snapshot:

```sql
-- Min and avg price, excluding accessories/apparel/novelty
SELECT MIN(price) AS min_price, AVG(price) AS avg_price
FROM products
WHERE category NOT IN ('accessories','apparel','novelty')
  AND in_stock = true
  AND snapshot_date = CURRENT_DATE;

-- Totals (all categories)
SELECT
  COUNT(*) AS total_products,
  COUNT(*) FILTER (WHERE is_on_sale) AS on_sale_count,
  COUNT(DISTINCT dispensary_id) AS dispensary_count
FROM products
WHERE in_stock = true
  AND snapshot_date = CURRENT_DATE;

-- Product backing the min price (for the Lowest Price sub-label)
SELECT p.name, p.category, p.weight_grams, d.name AS dispensary_name, d.city
FROM products p JOIN dispensaries d ON d.id = p.dispensary_id
WHERE p.category NOT IN ('accessories','apparel','novelty')
  AND p.in_stock = true
  AND p.snapshot_date = CURRENT_DATE
ORDER BY p.price ASC
LIMIT 1;
```

### Delta computation

Store a daily snapshot row keyed by `snapshot_date` (recommend a new `daily_stats` table or a materialized view). For the deltas, read yesterday's row and diff:

```sql
SELECT
  total_products,
  on_sale_count,
  avg_price_ex_accessories
FROM daily_stats
WHERE snapshot_date = CURRENT_DATE - INTERVAL '1 day';
```

Then in the component:

```ts
totalProductsDelta = today.totalProducts - yesterday.totalProducts;
onSalePctDeltaPts  = (today.onSaleCount/today.totalProducts*100) - (yesterday.onSaleCount/yesterday.totalProducts*100);
avgPriceDelta      = today.avgPriceExAccessories - yesterday.avgPriceExAccessories;
```

Render arrow and color based on sign:
- `delta > 0` → `▲`, green (`var(--accent)`)
- `delta < 0` → `▼`, red (`var(--ticker-red)`) — add `.down` class
- `delta === 0` → `—`, muted

For Avg Price, **down is good news**. Display as down+red anyway (factual direction); the editorial voice lives in the ticker, not the stats strip.

---

## Design Tokens

All already exist in `src/app/globals.css` except where noted.

### Colors
```
--newsprint: #f4f0e4   page bg
--ink:       #1a1008   primary text, rules
--accent:    #2d6a4f   forest green — per design spec, used for accents
                       (note: existing codebase has --accent: #34a529 bud green;
                        the spec asks for forest green #2d6a4f for this section.
                        Introduce --accent-forest: #2d6a4f and swap in this section,
                        or accept the change project-wide — confirm with product.)
--aged:      #f0e9d9   secondary surface, hairline dividers
--muted:     #6b5e45   secondary text, labels, kickers
--ticker-red:#d62828   ticker background, down-deltas
--deep-forest:#13240f  not used in this section
```

White text inside the ticker uses pure `#fff`. Ticker flag darker-red background: `#a41d1d`. Ticker tag color: `#ffd28a`. Ticker separator: `#ffffffaa`.

### Typography
```
UnifrakturMaguntia   — masthead title ONLY
Playfair Display 900 — stat numbers, ornament head
Space Mono 400/700   — all labels, data, kickers, ticker, dateline, folio
Source Serif 4       — Latin motto, footnote, folio center
```

### Spacing
- Sheet max-width `1400px`
- Outer horizontal padding: `28px` on masthead, folio, and section rail
- Stat box padding `22px 18px 18px`
- Ornament head bottom margin `6px`, bottom padding `4px`
- Dateline padding `8px 0`
- Ticker vertical padding `8px`
- Footnote padding `8px 20px`

### Border treatments (none of these have radius — radius is forbidden)
- Single rule: `1px solid var(--ink)`
- Double rule: `3px double var(--ink)`
- Triple rule: thin (1px) + 3px-offset-negative + thin (1px) — see `.dateline`
- Hairline divider inside aged areas: `1px solid var(--aged)`
- Stat hair: 36px wide, 1px tall, centered

### Shadows / radii / gradients
**None.** Explicitly prohibited.

---

## Assets
No external image assets. Grain texture is generated inline as an SVG data-URI in the `body::after` overlay (already in `globals.css`). Icons are typographic (`◆`, `●`, `·`, `│`, `§`, `★`, `▲`, `▼`) — no icon font, no SVG icons.

---

## Files

### In this handoff
- `Top Section — Mobile.html` — **primary** reference. Open at 390px viewport.
- `Top Section.html` — desktop reference (max-width 1400px).

### In the target repo (files to modify)
- `src/app/components/Page1.tsx` — rewrite the masthead, ticker, and stats row JSX. Remove the standalone Pick-of-the-Day / Deal-of-the-Day panel from this section (it now lives in the ticker). Keep the 3-column grid and everything below it untouched — that's a later prompt.
- `src/app/components/HeroBlock.tsx` — confirm this still fits below the stats strip; the current implementation places it between the masthead and the ticker, which conflicts with the new order. Move or remove per product.
- `src/app/globals.css` — add the new class styles (`.folio`, `.masthead-row`, `.orn`, `.orn-left`, `.orn-right`, `.latin-motto`, `.dateline`, `.dateline-inner`, `.section-rail`, `.ticker-shell`, `.ticker-flag`, `.ticker-flag .dot`, `.tk-tag`, `.tk-sep`, `.stats-strip`, `.stat-kicker`, `.stat-hair`, `.stat-sub`, `.stat-sub .delta`, `.stats-footnote`). Existing `.ticker-bar`, `.ticker-inner`, `.stats-row`, `.stat-box`, `.stat-number`, `.stat-label`, `.masthead-title`, `.masthead-subhead`, `.masthead-topbar`, `.edition-bar` should be retired or updated — remove the old rules once the new ones are in place and no other pages depend on them (grep first: `mini-masthead` on `/prices` reuses some patterns).
- `src/lib/data.ts` — extend the `Stats` shape with the new fields above. Update the Supabase query or add a new one for `daily_stats`.
- Add migration/materialized view for `daily_stats` if not already present.

### Hard constraints (repeated for the implementer)
- No gradients, no box-shadows, no rounded corners anywhere in this section.
- Only three font families plus UnifrakturMaguntia (masthead only).
- Only the palette listed; do not introduce new colors.
- No CTAs, no subscribe buttons, no upsell in this section.
- Accessories/apparel/novelty MUST be excluded from Lowest Price and Avg Price; the asterisk and footnote depend on this.
- `★` prefix on the ticker's `PICK OF THE DAY` headline is intentional — it's the anchor headline; surface `topDeals[0]` there, not in a separate panel.
