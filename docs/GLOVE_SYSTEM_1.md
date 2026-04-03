# The Glove System — Design Document

## Tagline (LOCKED)
"Share the Love, Get a Glove"

## Concept
Ziggy's anime hand flips the newspaper pages.
The hand is customizable — skin tones + gloves.
Gloves are earned through referrals or Pro subscription.
This is simultaneously: a fun UX feature, a viral growth mechanic, 
a retention tool, and future merch inventory.

## The Hand (v2 spec)
Style: anime flat illustration — bold black outlines, 3-4 cel shading tones,
Studio Ghibli adjacent energy. NOT hyperrealistic. NOT Dragon Ball Z muscle.
Think: confident, slightly stylized, clearly illustrated.

Mobile-first: bold lines read beautifully on phone screens.
Desktop: larger canvas, more detail visible.

Technical: SVG base hand + SVG glove overlay layer.
Skin tones swap the base fill colors.
Gloves are separate SVG files composited on top.

## Skin Tone Options (6)
1. Porcelain (#FDDBB4)
2. Warm Beige (#F5C89A)
3. Golden (#D4956A)
4. Caramel (#A0613A)
5. Deep Brown (#6B3A2A)
6. Ebony (#3D1C0E)

Saved in localStorage. No account required to set skin tone.

## Glove Unlock Tiers

| Gloves | Requirement | Design |
|--------|-------------|--------|
| None (bare hand) | Default | Just the base hand |
| Skin tone selector | 1 referral | Unlocks all 6 tones |
| 420 Leaf Glove | 3 referrals | Forest green #2d6a4f base, white cannabis leaf pattern, black outline |
| Las Vegas Glove | 5 referrals | Black base, gold (#d4af37) dice + card suits (♠♥♦♣) pattern |
| Ziggy Glove | 10 referrals | Ziggy's signature look — TBD with illustrator |
| Gold Pro Glove | Pro subscriber | Literal gold fill, heavier outline weight, premium feel |
| Secret Gloves | ??? | Never announced — discovered organically |

## Secret Glove Ideas (brainstorm — not final)
- The Dealer's Glove (Dan's poker dealer connection — white glove, playing card pattern)
- The Techno Peasant Glove (earthy tones, pixelated farm pattern — inside joke)
- The Idaho Glove (pine trees, mountain silhouette — Sandpoint easter egg)
- The Optimus Glove (silver robot hand — Tesla/Optimus reference)
Keep these hidden until someone finds them. Let the community theorize.

## Referral Mechanic
1. User signs up (free or pro)
2. Gets unique referral link: dailyweednewspaper.com?ref=ZIGGY123
3. Each signup via their link = 1 referral credit
4. Referral count stored in Supabase `subscribers` table (referral_count column)
5. Glove unlocks trigger automatically when threshold hit
6. Email notification: "You unlocked the 420 Leaf Glove. Ziggy is proud."

## Merch Pipeline
SVG glove designs → print-on-demand (Printful or similar)
Products:
- Forest green hoodie, UnifrakturMaguntia "Daily Weed Newspaper" across chest
- Ziggy hand on left sleeve
- Individual glove designs as standalone prints (poster, sticker, tee)
- "Share the Love, Get a Glove" campaign tee

## Build Timeline
- V1 (now): CSS corner curl page flip, no hand
- V2 (after 100 subscribers): Commission anime hand SVG, implement bare hand flip
- V2.1: Skin tone selector (localStorage)
- V2.2: Glove unlock system (requires auth — Supabase Auth)
- V2.3: Referral tracking + "Share the Love, Get a Glove" campaign launch
- V3: Merch store integration

## Notes
- Don't build gloves before the hand exists
- Don't build the hand before email capture works  
- Don't build merch before gloves are done
- Sequence matters — each layer enables the next
