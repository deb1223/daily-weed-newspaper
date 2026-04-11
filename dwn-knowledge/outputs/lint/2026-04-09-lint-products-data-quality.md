# Products Table Data Quality Audit
**Date:** 2026-04-09  
**Scope:** All in_stock products (18,462 rows) — iHeartJane (13,906) + Dutchie (2,964)  
**Method:** Supabase diagnostic SQL queries  

---

## CRITICAL BUG #1 — iHeartJane Flower: 98.8% Missing Weight

**Category:** Normalization / Coverage  
**Platform:** iHeartJane  
**Affected rows:** 2,210 of 2,236 in-stock flower products  
**Impact:** These products are entirely excluded from mg/$ deal scoring — the core value metric

**What's happening:**  
iHeartJane's flower listings don't populate `weight_grams`. The product name contains no parseable weight hint in 2,199/2,210 cases (regex checked for 1g, 2g, 3.5g, 7g, 14g, 28g, eighth, quarter, half, oz patterns — all came back with 11 parseable, 2,199 unresolvable).

**Why it happens:**  
iHeartJane serves flower with weights as variant/option selectors — the user picks "3.5g" or "7g" on the product page. The scraper appears to be hitting a product listing endpoint that returns the base product without a selected variant, so weight is null.

**Fix — scraper change required:**  
The iHeartJane scraper needs to enumerate variants per product. The Jane API (Jane Technologies) exposes product variants as `roots` or `options` on the product object. The scraper should iterate variants and create one row per weight option, not one row per product. This is the same pattern Dutchie uses (Dutchie returns each weight option as a separate product_id).

**Interim workaround (SQL-side):**  
Cannot be fixed in the database — the data simply isn't there. No fallback. This is the highest priority scraper fix.

---

## CRITICAL BUG #2 — iHeartJane Vapes: Weight Stored as mg Not Grams (1000x Inflation)

**Category:** Weight Parsing  
**Platform:** iHeartJane  
**Affected rows:** ~59 products  
**Examples:**
- `Pineapple Haze [900mg]` (Vapure) → `weight_grams = 900` (should be `0.9`)
- `Creamsicle [850mg]` (Bounti) → `weight_grams = 850` (should be `0.85`)

**Impact:**  
mg/$ calculations for these vapes are inflated by 1,000x. A Vapure 900mg cart at $35 with 91.77% THC shows as:  
- **Buggy:** (91.77/100 * 900 * 1000) / 35 = **23,591 mg/$** (absurd)  
- **Correct:** (91.77/100 * 0.9 * 1000) / 35 = **23.6 mg/$** (plausible for a premium cart)

**Why it happens:**  
The scraper parses the mg value from the product name bracket `[900mg]` and writes the integer `900` directly into `weight_grams` without converting mg → g (divide by 1000).

**Fix — scraper change:**  
In the name-parsing weight extraction logic: when unit is `mg`, divide by 1000 before writing to `weight_grams`. When unit is `g`, write directly.

```python
# Pseudocode fix
if unit == 'mg':
    weight_grams = float(value) / 1000
elif unit == 'g':
    weight_grams = float(value)
```

**Database cleanup (after scraper fix):**  
```sql
-- Identify affected rows
SELECT id, name, weight_grams FROM products
WHERE platform_source = 'iheartjane'
  AND weight_grams > 100
  AND category = 'vape'
  AND name ~* '\[\d+mg\]';

-- Fix: divide by 1000 (requires extracting the value — do in application layer)
```

[ACTION REQUIRED — DAN REVIEW BEFORE DATABASE UPDATE]

---

## CRITICAL BUG #3 — iHeartJane Topicals: Leading Decimal Dropped in oz Parsing (100x Inflation)

**Category:** Weight Parsing  
**Platform:** iHeartJane  
**Affected rows:** ~9 confirmed (Dr. Solomon's product across multiple dispensaries)  
**Example:**
- `1:3 Rescue [.62oz]` (Dr. Solomon's) → `weight_grams = 1757.7` (should be `17.57`)

**Why it happens:**  
The scraper regex for oz weight fails when the value starts with a bare decimal: `.62oz` → the leading `.` is not captured → parsed as `62oz` → `62 * 28.3495 = 1757.7g`.

**Fix — scraper regex:**  
```python
# Current (broken): r'(\d+\.?\d*)\s*oz'  -- misses leading decimal
# Fixed:           r'(\d*\.?\d+)\s*oz'   -- captures .62, 1.5, etc.
```

**Database cleanup:**  
Topicals are not used in mg/$ calculations (no THC%), so impact on deal scoring is zero. Still bad data — fix in scraper, manual cleanup optional.

---

## HIGH BUG #4 — Dutchie Edibles/Tinctures: THC mg Stored as THC %

**Category:** THC% Corruption  
**Platform:** Dutchie  
**Affected rows:** 267 products (257 Edible, 9 Tincture, 1 Vaporizer)  
**Examples:**
- `IndoTab Max Tabs 1000mg` → `thc_percentage = 966` (total mg stored as %)
- `Spiked Flamingo Green Apple Tincture 800mg` → `thc_percentage = 793.24`
- `LEVEL ProTab 25mg 10pk` → `thc_percentage = 280.9` (250mg total stored as %)
- `WYLD Sour Cherry Gummies 10mg 10pk` → `thc_percentage = 114.8` (100mg total stored as %)

**Why it happens:**  
The Dutchie API returns `thc_content` as total package mg for edibles and tinctures rather than a concentration percentage. The scraper writes this raw value into `thc_percentage` without checking whether it's a % or a mg total.

**Impact:**  
- Any query filtering `thc_percentage < 100` silently excludes 267 products
- Any mg/$ calculation using `thc_percentage` for edibles is nonsensical
- The `thc_percentage` field is semantically wrong for edibles — the correct field is total THC mg, not % by weight

**Fix — scraper + schema change:**  
1. **Short-term:** For Dutchie edibles/tinctures, when the API returns `thc_content` in mg (detectable because the value >> 100 or the API field is labeled differently), store it in a separate column or NULL `thc_percentage` and parse mg into `deal_description`.
2. **Longer term:** Add a `thc_mg_total` column to `products` for non-inhaled formats. Edibles should be scored on mg/$ using `thc_mg_total / price`, not `thc_percentage * weight_grams`.

```sql
-- Identify all affected products
SELECT id, name, category, thc_percentage, weight_grams, price
FROM products
WHERE thc_percentage > 100 AND in_stock = true;
-- 267 rows returned

-- Interim: NULL out the corrupted % values
UPDATE products SET thc_percentage = NULL
WHERE thc_percentage > 100 AND category IN ('Edible', 'Edibles', 'Tincture');
```

[ACTION REQUIRED — DAN REVIEW BEFORE DATABASE UPDATE]

---

## MEDIUM BUG #5 — iHeartJane Edibles/Beverages: weight_grams = 0.01 (Placeholder Junk Value)

**Category:** Weight Parsing  
**Platform:** iHeartJane  
**Affected rows:** 162 products  
**Examples:**
- `KANHA 20:1 Watermelon [10pk]` → `weight_grams = 0.01`
- `Keef Bubba Kush Root Beer [12oz]` → `weight_grams = 0.01`

**Why it happens:**  
The scraper appears to default to `0.01` when no weight is parseable, rather than writing `NULL`. This creates phantom weight values that look real but produce nonsensical mg/$ results.

**Fix:**  
Change the scraper default from `0.01` to `NULL`. Any downstream code that divides by `weight_grams` must already guard against NULL — the 0.01 default hides the missing data rather than flagging it.

**Additionally:** Beverages (12oz cans) are correctly being weight-converted in some cases (340.2g for 12oz) but this is semantically wrong — beverage weight is meaningless for dosage comparison. Beverages should have `weight_grams = NULL` and rely on mg from product name for scoring.

---

## MEDIUM BUG #6 — Category Fragmentation (Both Platforms)

**Category:** Normalization  
**Platform:** Both  

Raw category values currently in the database:

| Canonical Category | Dutchie Raw Values | iHeartJane Raw Values |
|---|---|---|
| Flower | `Flower` | `flower` |
| Vape | `Vaporizers`, `Vape` | `vape` |
| Edible | `Edible`, `Edibles` | `edible` |
| Concentrate | `Concentrate`, `Concentrates` | `extract`, `Concentrate` |
| Pre-Roll | `Pre-Rolls` | `pre-roll` |
| Topical | `Topical` | `topical` |
| Tincture | `Tincture` | `tincture` |

**Problems:**
- `Edible` vs `Edibles` on Dutchie — same category, two values (555 split between them)
- `Vaporizers` vs `Vape` on Dutchie — same category, two values (671 split)
- `Concentrate` vs `Concentrates` on Dutchie (485 split)
- `extract` on iHeartJane ≠ `Concentrate` — but represents the same category
- Case inconsistency: iHeartJane lowercase, Dutchie title case

**Impact:** Any GROUP BY category query returns wrong counts. Deal scoring by category is inaccurate.

**Fix — add normalized_category column or normalize on ingest:**  
```sql
-- View showing normalized mapping (proposed)
SELECT
  CASE
    WHEN LOWER(category) IN ('flower') THEN 'Flower'
    WHEN LOWER(category) IN ('vaporizers', 'vape') THEN 'Vape'
    WHEN LOWER(category) IN ('edible', 'edibles') THEN 'Edible'
    WHEN LOWER(category) IN ('concentrate', 'concentrates', 'extract') THEN 'Concentrate'
    WHEN LOWER(category) IN ('pre-rolls', 'pre-roll') THEN 'Pre-Roll'
    WHEN LOWER(category) IN ('topical') THEN 'Topical'
    WHEN LOWER(category) IN ('tincture') THEN 'Tincture'
    ELSE category
  END AS normalized_category,
  COUNT(*) AS count
FROM products WHERE in_stock = true
GROUP BY normalized_category
ORDER BY count DESC;
```

A `normalized_category` generated column or a scraper-side mapping dict would fix this permanently.

---

## KNOWN ISSUE (Previously Documented)

**Curaleaf null URLs:** 223 products across 3 dispensaries (Curaleaf NV Las Vegas: 79, Curaleaf Las Vegas Western: 73, Curaleaf North Las Vegas: 71). Confirmed as Sweed POS non-standard behavior — noted in CLAUDE.md.

**Nuwu POS codes in product names:** e.g., `GREEN APPLE TINCTURE 800MG SPIKED FLAMINGO M{233} N{}` — documented in CLAUDE.md, do not surface to users.

---

## SUMMARY TABLE

| # | Bug | Platform | Rows Affected | mg/$ Impact | Priority |
|---|---|---|---|---|---|
| 1 | Flower weight null — API variant gap | iHeartJane | 2,210 | ZERO data for 99% of iHJ flower | CRITICAL |
| 2 | Vape weight in mg not grams (1000x) | iHeartJane | ~59 | 1000x inflation | CRITICAL |
| 3 | oz leading decimal drop (100x) | iHeartJane | ~9 | 100x inflation (topicals) | HIGH |
| 4 | THC% stores total mg for edibles | Dutchie | 267 | Unusable % values | HIGH |
| 5 | weight_grams = 0.01 placeholder | iHeartJane | 162 | Phantom data | MEDIUM |
| 6 | Category fragmentation | Both | Systemic | Scoring grouping errors | MEDIUM |
| Known | Curaleaf null URLs | Dutchie | 223 | No link-out | DOCUMENTED |

---

## SCRAPER PRIORITY FIX LIST

1. **iHeartJane flower variants** — enumerate weight variants from Jane API, create one DB row per variant. This is the single highest-leverage fix (unlocks 2,210 flower products for deal scoring).
2. **mg → g unit conversion** — when parsing `[Xmg]` from product name, divide by 1000 before writing `weight_grams`.
3. **oz leading decimal** — fix regex to capture `.62oz` pattern: `r'(\d*\.?\d+)\s*oz'`
4. **Edible/tincture THC normalization** — detect when Dutchie returns total_mg vs percentage and route appropriately; NULL `thc_percentage` for edibles; parse mg total from name/API field instead.
5. **Null vs 0.01 default** — replace junk default with NULL throughout scraper weight parsing.
6. **Category normalization dict** — apply a mapping at ingest time to write a consistent `normalized_category` value regardless of source platform casing/naming.
