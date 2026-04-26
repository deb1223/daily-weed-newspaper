# Handoff: Homepage Bottom Section — Email CTA

## Overview
This is the **bottom section** of the homepage at `dailyweednewspaper.com` — sits below the price table, above the footer. It is a single email-capture block for "The Morning Edition" newsletter — daily delivery of the Top 10 category winners.

**Mobile-first (390px).** Newspaper aesthetic, no SaaS chrome.

## About the Design Files
- `Bottom CTA.html` — design reference, not production code. Static React/Babel page.

Recreate in the existing Next.js + Tailwind codebase as a new component (e.g. `src/app/components/BottomCTA.tsx` or `src/app/components/MorningEditionSignup.tsx`), placed at the end of `Page1.tsx` after the price table. Reuse the existing tokens in `globals.css` (`--newsprint`, `--ink`, `--accent`, `--bud`, `--aged`, `--muted`, `--ticker-red`) and font imports. **Hook the form** to whatever email-capture endpoint the team uses (Mailchimp, Resend, Supabase `subscribers` table, etc.) — the reference uses local state only.

## Fidelity
**High-fidelity.** Match pixel-for-pixel at 390px. Hard rules: no gradients, no rounded corners on form inputs, no floating cards, no shadows, no SaaS aesthetic.

---

## Anatomy (top to bottom)

The whole block lives inside `.cta-wrap`:
- `border-top: 3px double var(--ink)` — separates it from the price table above.
- `background: var(--newsprint)`.
- No internal padding on the wrapper itself; children manage their own.

### 1. Masthead block (`.cta-mast`)
Centered, `padding: 22px 18px 0`.

- **Stamp** (`.stamp`) — small bordered badge, slightly rotated `-1.5deg`, `background: var(--aged)`, `border: 1px solid var(--ink)`, `padding: 3px 10px`. Space Mono 9px / 0.22em / uppercase. Content:
  `¶ Free · No paywall · Daily 06:00 PST`
  with `No paywall` in `.red` (`var(--ticker-red)` bold).
  `margin-bottom: 14px`.

- **Headline** (`<h2>`) — Playfair Display 900 italic, **30px**, line-height 1.02, letter-spacing -0.015em, `text-wrap: balance`, `margin: 0 0 8px`.
  Content (three lines, `<br/>` between):
  ```
  The <span class="frak">Top Ten</span>
  in your inbox.
  Before your coffee.
  ```
  `.frak` is UnifrakturMaguntia, **not italic**, weight 400, color `var(--accent)`, `font-size: 1.1em`, letter-spacing 0. This is the only fraktur word in the section — it ties back to the masthead.

- **Deck** (`.deck`) — Source Serif 4 italic 13px, `var(--muted)`, line-height 1.45, `text-wrap: pretty`, `margin: 0 4px 16px`.
  Content: `One email. Ten verdicts. Zero "strategic partnerships." Unsubscribe in one tap, no guilt trip.`

### 2. Form block (`.cta-form`)
`margin: 0 14px`. Triple-rule treatment:
- `border-top: 1px solid var(--ink)` and `border-bottom: 1px solid var(--ink)`.
- Plus two pseudo-rules via `::before` (`top: -4px`) and `::after` (`bottom: -4px`), each `border-top: 1px solid var(--ink)` spanning the full width. Net effect: matches the dateline triple-rule treatment from the masthead.
- `padding: 12px 0`.

**Label** — `<label for="cta-email">Subscribe · The Morning Edition</label>`. Space Mono 9px / 0.2em / uppercase, `var(--muted)`, `margin-bottom: 6px`, `padding: 0 4px`. Display block.

**Input row** (`.row`) — `display: grid; grid-template-columns: 1fr auto`, no gap, items stretch.
- `<input type="email" id="cta-email" required>` — `border: 1px solid var(--ink)`, `border-right: none`, `background: #fbf7e8` (slightly warmer cream than the page), `padding: 11px 12px`, Space Mono 13px ink, `border-radius: 0`, `outline: none`, `-webkit-appearance: none`. Placeholder: `you@plug-no-longer-needed.com` (color muted, italic). On focus, background goes pure white.
- `<button type="submit">` — `background: var(--ink)`, color `var(--newsprint)`, `border: 1px solid var(--ink)`, Space Mono 11px bold / 0.14em / uppercase, `padding: 0 16px`, `border-radius: 0`, `white-space: nowrap`. Label: `Send it →` (the arrow `<span class="arr">` is `var(--bud)`). Hover swaps `background` and `border-color` to `var(--accent)`.
- On submit (preventDefault), if email is non-empty, swap button label to `✓ In` (no arrow). Real wiring: POST to your subscribers endpoint and only then flip state.

**Promise row** (`.promise`) — flex space-between, `margin-top: 10px`, `padding: 0 4px`. Space Mono 9px / 0.08em / uppercase muted. Three items, each leading with a `.check` (`var(--accent)` bold ✓):
- `✓ No spam. Ever.`
- `✓ 1-tap unsub.`
- `✓ No selling lists.`

### 3. Receipt block (`.cta-receipt`)
The "what lands in your inbox" specifics. Looks like a bordered receipt with a paragraph-mark tab.

- `margin: 18px 14px 0`, `border: 1px solid var(--ink)`, `background: var(--aged)`, `padding: 14px 14px 12px`, position relative.
- `::before` content `¶` — absolutely positioned `top: -12px; left: 14px`, background `var(--newsprint)`, `padding: 0 6px`, Playfair 900 italic 18px ink. Reads as a typographic tab notch.
- **Header** (`.head`) — Space Mono 9px / 0.22em / uppercase muted, `margin-bottom: 10px`, `padding-bottom: 8px`, bottom `1px dashed var(--ink)`. Content: `What lands in your inbox`.
- **`<dl>`** with `display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; align-items: baseline`.
  - `<dt>` — Space Mono 11px bold `var(--accent)` letter-spacing 0.04em line-height 1.3. Values: `01.`, `02.`, `03.`.
  - `<dd>` — Source Serif 4 12px ink line-height 1.35 `text-wrap: pretty`. Inside each `<dd>`, an `<em>` block: Space Mono 10.5px **not italic** muted letter-spacing 0.04em `display: block; margin-top: 1px` — the dry editorial subline.
  - Items:
    | # | Promise | Subline |
    |---|---|---|
    | 01. | The full Top 10 — every category winner, ranked. | Same list you just scrolled. Now portable. |
    | 02. | Today's biggest price drops, with the receipts. | If a Strip dispensary blinks, you'll know by 6 a.m. |
    | 03. | One Ziggy line. Maybe two if the market is funny. | The math, but with attitude. |

### 4. Proof line (`.cta-proof`)
`margin: 14px 14px 0`, `padding: 10px 0 4px`, top `1px solid var(--aged)`, text-align center.
- Source Serif 4 italic 11.5px muted line-height 1.45 `text-wrap: pretty`.
- The number `1,247` is wrapped in `<b>` — Space Mono 11px bold ink, **not italic**, letter-spacing 0.04em.
- Content: `Joined this morning by **1,247** Las Vegans who would rather read a paper than scroll a menu.`
- **Wire to real data** if available — pull from `subscribers` table count for "today". If unavailable, use a static seed and bump nightly.

### 5. Fine print (`.cta-fineprint`)
`padding: 14px 18px 22px`, text-align center. Space Mono 8.5px / 0.14em / uppercase muted line-height 1.6.
- Content: `Est. April 2026 · Las Vegas, Nev. · Privacy · Archive`
- Separators `.sep` are middle dots `·` with margin 0 6px and opacity 0.5.
- Links (`<a>`) are color `var(--ink)` underlined, underline-offset 2px. Wire `Privacy` → `/privacy`, `Archive` → `/archive` (or wherever past editions live).

---

## React / Behavior notes

```tsx
const [email, setEmail] = useState("");
const [submitted, setSubmitted] = useState(false);

async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!email.trim()) return;
  // Replace with your real endpoint:
  await fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }) });
  setSubmitted(true);
}
```

- Don't replace the form with a thank-you screen — just flip the button label to `✓ In`. Keeps the page from jumping. (Optionally, swap the input for a confirmation line on `submitted === true` if the team prefers.)
- Validate `type="email"` natively + `required`. No JS regex; the browser handles it.
- Add `aria-label="Email address"` on the input if the visible label is hidden on smaller phones. The reference keeps the label visible at 390px so it's fine.
- Respect Reduced Motion — there are no animations in this section, so nothing to gate, but if the team adds one, gate it on `prefers-reduced-motion`.

## Voice rules (for any future copy edits)
- Dry, specific, Gen-Z-savage but never corporate.
- No "join the community", "exclusive insider access", "level up your", "hand-curated by experts."
- Yes to: "the math, but with attitude" / "no strategic partnerships" / "no guilt trip" / specific numbers.
- The fraktur word is the only display flourish allowed in this section. Don't add a second one.

## Files
- `Bottom CTA.html` — open in a browser at 390px width to see the target.
