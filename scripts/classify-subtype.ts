/**
 * Shared product subtype classifier for the DWN scraper pipeline.
 *
 * Every product written to the DB goes through classifySubtype() in
 * upsertSingleProduct(). One source of truth, all scrapers benefit.
 *
 * Strategy — first match wins:
 *   1. resolveNativeSubtype()  — uses structured subtype/subcategory from source platform
 *      · Jane:    sa.custom_product_subtype ?? sa.root_subtype ?? sa.brand_subtype
 *      · Dutchie: no subcategory extracted (falls through to keyword classifier)
 *      · Carrot:  no subcategory extracted (falls through to keyword classifier)
 *      · Sweed:   no subcategory extracted (falls through to keyword classifier)
 *   2. Category-gated keyword classifier — category narrows the search space,
 *      then keywords within that category determine subtype
 *   3. Null-category fallback — runs all keyword rules in priority order
 *
 * On vape_pod: implemented via brand recognition (PAX, Stiiizy, Dosist, etc.).
 * Cleanly detectable in the brand field. Defaults to vape_cart when no pod brand
 * is detected. If detection proves noisy in practice, remove POD_BRANDS and let
 * those products fall to vape_cart — no data loss, just coarser taxonomy.
 */

export type Subtype =
  | 'flower_shake'
  | 'flower_regular'
  | 'preroll_single'
  | 'preroll_pack'
  | 'vape_cart'
  | 'vape_disposable'
  | 'vape_pod'
  | 'concentrate_rso'
  | 'concentrate_other'
  | 'edible_drink'
  | 'edible_other'
  | 'tincture'
  | 'topical'
  | 'accessory'

export interface ClassifiableProduct {
  name?: string
  category?: string
  subcategory?: string  // native platform taxonomy value, if available
  brand?: string
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function lc(s: string | undefined): string {
  return (s ?? '').toLowerCase()
}

function has(text: string, ...terms: string[]): boolean {
  return terms.some(t => text.includes(t))
}

// ── Category detectors ────────────────────────────────────────────────────────
// Normalized to handle: "Flower", "flower", "Vaporizers", "Pre-Rolls", "Beverages", etc.

function isFlower(cat: string): boolean {
  return cat.includes('flower')
}

function isPreroll(cat: string): boolean {
  return cat.includes('pre-roll') || cat.includes('preroll') || cat.includes('pre roll') || cat.includes('joint')
}

function isVape(cat: string): boolean {
  // Handles: "Vape", "Vapes", "Vaporizer", "Vaporizers", "Cartridge", "Cartridges", "Cart", "Carts"
  return cat.includes('vape') || cat.includes('vapor') || cat.includes('cartridge') || cat.includes('cart')
}

function isConcentrate(cat: string): boolean {
  return (
    cat.includes('concentrate') ||
    cat.includes('extract') ||
    cat.includes('wax') ||
    cat.includes('shatter') ||
    cat.includes('rosin') ||
    cat.includes('dab') ||
    // "oil" only counts as concentrate when not an edible or vape context
    (cat.includes('oil') && !cat.includes('edible') && !isVape(cat))
  )
}

function isEdible(cat: string): boolean {
  // Handles: "Edible", "Edibles", "Beverage", "Beverages", "Drink", "Food"
  return (
    cat.includes('edible') ||
    cat.includes('beverage') ||
    cat.includes('drink') ||
    cat.includes('food') ||
    cat.includes('candy') ||
    cat.includes('gumm') ||
    cat.includes('chocolate')
  )
}

function isTincture(cat: string): boolean {
  return cat.includes('tincture') || cat.includes('sublingual') || cat.includes('oral spray') || cat === 'oral'
}

function isTopical(cat: string): boolean {
  return cat.includes('topical') || cat.includes('lotion') || cat.includes('balm') || cat.includes('patch')
}

function isAccessory(cat: string): boolean {
  return (
    cat.includes('accessor') ||   // "accessory", "accessories"
    cat.includes('gear') ||
    cat.includes('merch') ||
    cat.includes('apparel')
  )
}

// ── Subtype keyword sets ──────────────────────────────────────────────────────

const FLOWER_SHAKE_KEYWORDS = ['shake', 'trim', 'smalls', 'popcorn', 'mini bud']

const PREROLL_PACK_PATTERN = /\b\d+-?pack\b|\/pk|\d+\s*x\s*\d*\.?\d+g/

// Pod system brands — if name or brand matches, classify as vape_pod
// Source: vendor/platform product listings; expand as new brands appear in market
const POD_BRANDS = ['pax', 'stiiizy', 'dosist', 'key tag', 'keytag', 'hyer', 'plus pod', 'original pod', 'era pod', 'stiiizy pod']

const RSO_KEYWORDS = ['rso', 'rick simpson', 'feco', 'fmoe', 'full extract cannabis oil', 'full extract oil', 'fso']

const DRINK_KEYWORDS = [
  'drink', 'beverage', 'seltzer', 'soda', ' tea', 'lemonade', ' shot', 'elixir',
  'tonic', 'sparkling water', 'juice', 'cocoa', 'coffee', ' cola', 'lemonade'
]

// ── Category-specific classifiers ─────────────────────────────────────────────

function classifyFlower(name: string): Subtype {
  if (FLOWER_SHAKE_KEYWORDS.some(k => name.includes(k))) return 'flower_shake'
  return 'flower_regular'
}

function classifyPreroll(name: string): Subtype {
  // Multi-pack indicators: "5-pack", "5 x 0.5g", "/pk", "multipack", " pack"
  if (
    PREROLL_PACK_PATTERN.test(name) ||
    has(name, 'multi', 'multipack') ||
    // " pack" with a leading space avoids false match on "backpack" etc.
    name.includes(' pack')
  ) return 'preroll_pack'
  return 'preroll_single'
}

function classifyVape(name: string, brand: string): Subtype {
  // Disposable first — explicit labeling takes precedence
  if (has(name, 'disposable', 'all-in-one', 'all in one', ' aio', 'disp')) return 'vape_disposable'

  // Pod brand recognition — checked before generic cart default
  if (POD_BRANDS.some(p => name.includes(p) || brand.includes(p))) return 'vape_pod'

  // Default: 510-thread cartridge
  // Note: "pen" alone is ambiguous (used for both carts and disposables in market copy),
  // so we do not assign vape_disposable on "pen" alone — falls through to vape_cart.
  return 'vape_cart'
}

function classifyConcentrate(name: string): Subtype {
  if (RSO_KEYWORDS.some(k => name.includes(k))) return 'concentrate_rso'
  return 'concentrate_other'
}

function classifyEdible(name: string): Subtype {
  if (DRINK_KEYWORDS.some(k => name.includes(k))) return 'edible_drink'
  return 'edible_other'
}

// ── Native subtype resolver ───────────────────────────────────────────────────
// Interprets structured platform subtype values (Jane's root_subtype etc.)
// before falling back to keyword matching.

function resolveNativeSubtype(cat: string, sub: string): Subtype | null {
  if (!sub) return null

  if (isFlower(cat)) {
    if (has(sub, 'shake', 'trim', 'smalls', 'popcorn', 'mini bud')) return 'flower_shake'
    if (has(sub, 'bud', 'flower', 'prepack', 'eighth', 'quarter', 'half', 'ounce', 'nug', 'regular')) return 'flower_regular'
    // Non-null subtype in flower context: resolve with name keywords at call site
    return null
  }

  if (isPreroll(cat)) {
    if (has(sub, 'pack', 'multi')) return 'preroll_pack'
    // Any non-null preroll subtype → single
    return 'preroll_single'
  }

  if (isVape(cat)) {
    if (has(sub, 'disposable', 'all-in-one', 'aio')) return 'vape_disposable'
    if (has(sub, 'pod')) return 'vape_pod'
    if (has(sub, 'cartridge', 'cart', '510')) return 'vape_cart'
    // Non-null subtype in vape context: fall through to keyword classifier
    return null
  }

  if (isConcentrate(cat)) {
    if (has(sub, 'rso', 'rick simpson', 'feco', 'fmoe')) return 'concentrate_rso'
    // Any non-null concentrate subtype → other
    return 'concentrate_other'
  }

  if (isEdible(cat)) {
    if (has(sub, 'drink', 'beverage', 'seltzer', 'shot', 'elixir', 'tonic')) return 'edible_drink'
    // Any non-null edible subtype → other
    return 'edible_other'
  }

  if (isTincture(cat)) return 'tincture'
  if (isTopical(cat)) return 'topical'
  if (isAccessory(cat)) return 'accessory'

  return null
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Returns the subtype for a product, or null if no subtype can be determined.
 *
 * Null is correct and honest for products that genuinely don't fit the taxonomy
 * (e.g., CBD topicals sold as edibles, mislabeled products, truly new formats).
 * A null rate above 5% across the full product set indicates a classifier problem.
 */
export function classifySubtype(product: ClassifiableProduct): Subtype | null {
  const name  = lc(product.name)
  const cat   = lc(product.category)
  const sub   = lc(product.subcategory)
  const brand = lc(product.brand)

  // ── Step 1: Native structured subtype from source platform ────────────────
  // Checks product.subcategory which contains:
  //   Jane: sa.custom_product_subtype ?? sa.root_subtype ?? sa.brand_subtype
  //   All other platforms: empty (falls through to keyword classifier)
  const native = resolveNativeSubtype(cat, sub)
  if (native !== null) return native

  // ── Step 2: Category-gated keyword classifier ─────────────────────────────
  // Category narrows the search space; keywords determine the subtype within it.
  // Edge cases handled by gating:
  //   - "Live resin disposable" with cat=vape → vape_disposable (not concentrate)
  //   - "RSO gummy" with cat=edible → edible_other (not concentrate_rso)
  //   - "'cart' in name" with cat=concentrate → concentrate_other (not vape_cart)
  //   - "Shake pre-roll" with cat=preroll → preroll_single (not flower_shake)
  if (isFlower(cat))      return classifyFlower(name)
  if (isPreroll(cat))     return classifyPreroll(name)
  if (isVape(cat))        return classifyVape(name, brand)
  if (isConcentrate(cat)) return classifyConcentrate(name)
  if (isEdible(cat))      return classifyEdible(name)
  if (isTincture(cat))    return 'tincture'
  if (isTopical(cat))     return 'topical'
  if (isAccessory(cat))   return 'accessory'

  // ── Step 3: Null/unrecognized category — full keyword scan in priority order
  // Also runs for cat="CBD": cannabinoid label, not a format — resolve from name.
  // Skipped for all other non-empty unrecognized categories (returns null below)
  // to avoid mis-classifying new category strings we haven't seen yet.
  if (!cat || cat === 'cbd') {
    if (FLOWER_SHAKE_KEYWORDS.some(k => name.includes(k)))                           return 'flower_shake'
    if (PREROLL_PACK_PATTERN.test(name) || has(name, 'multipack'))                   return 'preroll_pack'
    if (has(name, 'pre-roll', 'preroll', 'joint'))                                   return 'preroll_single'
    if (has(name, 'disposable', 'all-in-one', 'all in one', ' aio'))                 return 'vape_disposable'
    // Accessory check before pod brand recognition — a Stiiizy battery is an
    // accessory, not a pod. Keywords like 'battery', 'charger', 'acc -' must
    // fire before POD_BRANDS, which would otherwise claim the product first.
    if (has(name, 'grinder', 'lighter', 'paper', 'rolling tray', 'battery',
                  'charger', 'power case', 'acc -', ' hat', 'shirt', 'sticker'))    return 'accessory'
    if (POD_BRANDS.some(p => name.includes(p) || brand.includes(p)))                 return 'vape_pod'
    if (has(name, 'cartridge', ' cart ', 'vape', '510'))                             return 'vape_cart'
    if (RSO_KEYWORDS.some(k => name.includes(k)))                                    return 'concentrate_rso'
    if (has(name, 'concentrate', 'extract', 'wax', 'shatter', 'rosin', 'dab',
                  'badder', 'budder', 'diamond', 'sauce', 'live resin', 'live rosin',
                  'distillate', 'crumble', 'sugar'))                                 return 'concentrate_other'
    if (DRINK_KEYWORDS.some(k => name.includes(k)))                                  return 'edible_drink'
    if (has(name, 'tincture', 'sublingual', 'oral spray'))                           return 'tincture'
    if (has(name, 'lotion', 'balm', 'patch', 'transdermal', 'topical',
                  'salve', 'cream', 'ointment', 'roll-on', 'roll on', 'roller',
                  'body oil', 'massage oil'))                                         return 'topical'
    if (has(name, 'gumm', 'chocolate', 'candy', 'cookie', 'brownie',
                  'capsule', 'edible', 'mint', 'lozenge'))                           return 'edible_other'
  }

  return null
}
