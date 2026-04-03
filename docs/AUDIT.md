# Daily Weed Newspaper — Site Audit
## Conducted: April 1, 2026 — Session 1

---

## CRITICAL (fix before showing anyone)

### 1. Top 5 Steals — brand/category dedup ✅ IN PROGRESS
Same brand in same category at same dispensary shows multiple times.
9 Medizin flower products at 64% off = 1 entry, not 5.
BUT: if same dispensary has deals across different categories, each category earns its spot.
Rule: deduplicate by brand + category + dispensary combo. Fetch 30, return best 5 unique.

### 2. Category Winners — weight not normalized
"Cheapest Flower: Solaris Jealousy 1g at $8.45" — that's 1 gram.
Comparing 1g to 3.5g to 7g is apples to oranges.
Fix: either normalize to price-per-gram, OR filter category winners to a standard weight
(e.g. flower = 3.5g only). Label the weight clearly in the table.

### 3. "Head Cheese" in Vape category
Head Cheese is a concentrate showing up as cheapest vape.
Category normalization issue — vape should only show cartridges/disposables.
Fix: tighten category filtering for vape (exclude concentrates).

### 4. Ticker duplicated
"★ ZIGGY REPORT..." appears twice in the HTML — not a clean CSS loop, actual duplication.
Fix: single ticker element with CSS marquee animation only.

---

## SERIOUS (fix this week)

### 5. Pro signup form does nothing
Email input + "Get Pro — $9/mo" button is dead. No endpoint, no feedback.
First thing a potential subscriber tries. Kills trust instantly.
Fix: wire to /api/subscribe → Resend (in NEXT_PROMPT.md)

### 6. "Market Pulse" section is hardcoded nonsense
"Best city in Nevada for prices: Las Vegas" — you only have LV data.
"Avg savings vs. MSRP: ~$9" — made up number.
Fix: remove Market Pulse entirely OR make it 100% data-driven from Supabase.

### 7. About Ziggy on Page 1
Bio is wasting Page 1 real estate below the fold.
Page 1 should be deals, data, conversion. Bio belongs on an About page or Page 2.
Fix: move to a dedicated /about page or bottom of Page 2.

### 8. Ziggy intro paragraph — wrong voice
"Every morning, Ziggy rises before dawn..." — third person Wikipedia voice.
Ziggy writes in first person, present tense, no poetry.
Fix: rewrite as Ziggy speaking directly. "Yo. Let's get into it."

### 9. "$$9" and "$$99" double dollar sign bug
Visible in pricing tier section.
Fix: one-line CSS/JSX fix.

### 10. "3,617Products" missing space
Edition bar: "16 Dispensaries · 3,617Products" — missing space before Products.
Fix: one character.

### 11. Edition #001 hardcoded
Should be dynamic: days since April 1 2026 launch.
Fix: `Math.floor((Date.now() - new Date('2026-04-01').getTime()) / 86400000) + 1`

---

## POLISH (next sprint)

### 12. Two competing navigation systems
Fixed bottom nav bar (← Prev / 1 of 3 / Next →) AND corner curl "pg 2 →" both exist.
Pick one. Recommendation: keep bottom nav bar, remove corner curl text, keep curl visual only.

### 13. Data is stale — scraper may not be running on Vercel
last_scraped shows March 29. It's April 1. 3 days stale.
Check: Vercel cron job for scraper — is it configured and running?
Fix: verify cron in vercel.json, check Vercel dashboard for cron execution logs.

### 14. avg price too many decimals in raw data
$30.834445673209864 — if this renders anywhere visible it looks broken.
Fix: toFixed(2) everywhere price is displayed.

### 15. "Coming Soon" city order
Current: Denver, Phoenix, Portland, LA, Chicago, Detroit
Portland before LA makes no sense strategically.
Correct order by market size/cannabis culture: Denver, LA, Phoenix, Seattle, Chicago, Detroit.

### 16. Tourist Terry Strip deals — all Uncle Arnie's drinks
The strip deals section on Page 3 is showing only Uncle Arnie's beverages at 20% off.
Better strip deal exists (Planet 13 Medizin 64% off is walk-able from the Strip).
Fix: expand strip deal query to include Planet 13, not just Thrive Strip location.

### 17. No favicon
Browser tab shows generic icon. Easy brand win.
Fix: Simple "DWN" or Ziggy initial in forest green, export as favicon.ico.

### 18. No OG image / social preview
Share this URL on X and it shows nothing.
Fix: Add og:image — newspaper masthead screenshot or designed card.
This is critical for the X marketing strategy.

### 19. /prices page title same as homepage
Both say "Daily Weed Newspaper — Cannabis Price Intelligence"
Fix: /prices should say "Price Dashboard — Daily Weed Newspaper"

### 20. No way to get back to newspaper from /prices on mobile
"← Back to Front Page" exists but may be hard to find on mobile.
Fix: ensure back link is prominent, above the fold on mobile.

---

## THINGS WE DISAGREE WITH (don't fix these)
- Dispensary diversity in Top 5 — merit only, category dedup is the right rule
- The 3-page structure — keep it, it's the differentiator
- Ziggy's rating hardcoded at 7.8 — fine for now, LLM brief will make it dynamic

---

## Priority Order for Next Session
1. ✅ Brand+category dedup on Top 5 (in progress)
2. Email capture → Resend (NEXT_PROMPT.md)
3. Fix weight normalization on category winners
4. Remove/fix Market Pulse section
5. Fix Ziggy intro voice
6. OG image (critical for X marketing)
7. Favicon
8. Fix all the one-liners ($$9, space, edition number)
