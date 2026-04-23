/**
 * test-classify-subtype.ts
 *
 * Unit tests for the classifySubtype() classifier.
 * Usage: npx tsx scripts/test-classify-subtype.ts
 *
 * Sections:
 *   1. Original 20 edge case tests (regression suite)
 *   2. Item #3.6 new tests (6 pattern fixes)
 */

import { classifySubtype, Subtype } from './classify-subtype'

// ── Test harness ──────────────────────────────────────────────────────────────

let passed = 0
let failed = 0

function test(
  label: string,
  product: { name?: string; category?: string; subcategory?: string; brand?: string },
  expected: Subtype | null
) {
  const result = classifySubtype(product)
  if (result === expected) {
    console.log(`  ✓  ${label}`)
    passed++
  } else {
    console.log(`  ✗  ${label}`)
    console.log(`       expected: ${expected}`)
    console.log(`       got:      ${result}`)
    failed++
  }
}

// ── Section 1: Original regression suite (20 cases) ──────────────────────────

console.log('\nOriginal regression suite')
console.log('='.repeat(60))

// Flower
test('Flower regular — name only', { name: 'Blue Dream 3.5g', category: 'Flower' }, 'flower_regular')
test('Flower shake — category + name', { name: 'Shake Ounce', category: 'Flower' }, 'flower_shake')
test('Flower smalls — category + name', { name: 'Bubba Kush Smalls 7g', category: 'Flower' }, 'flower_shake')
test('Flower regular — lowercase category', { name: 'OG Kush 1oz', category: 'flower' }, 'flower_regular')

// Pre-rolls
test('Preroll single — standard', { name: 'Infused Pre-Roll 1g', category: 'Pre-Rolls' }, 'preroll_single')
test('Preroll pack — numeric pack', { name: 'Wedding Cake 5-pack 0.5g', category: 'Pre-Rolls' }, 'preroll_pack')
test('Preroll pack — x notation', { name: 'Sour Diesel 5 x 0.5g', category: 'Pre-Rolls' }, 'preroll_pack')
test('Shake preroll → preroll_single (not flower_shake)', { name: 'Shake Pre-Roll 1g', category: 'Pre-Rolls' }, 'preroll_single')

// Vape
test('Vape cart — standard', { name: 'Gelato 1g Cartridge', category: 'Vape' }, 'vape_cart')
test('Vape disposable — explicit', { name: 'Watermelon Disposable 1g', category: 'Vape' }, 'vape_disposable')
test('Vape pod — PAX brand', { name: 'Blue Dream Pod', category: 'Vape', brand: 'PAX' }, 'vape_pod')
test('Vape disposable beats pod brand in cat=vape', { name: 'Stiiizy Disposable All-in-One', category: 'Vape', brand: 'Stiiizy' }, 'vape_disposable')

// Concentrates
test('Concentrate RSO — keyword', { name: 'RSO Syringe 1g', category: 'Concentrate' }, 'concentrate_rso')
test('Live resin disposable → vape_disposable (not concentrate)', { name: 'Live Resin Disposable 0.5g', category: 'Vape' }, 'vape_disposable')
test('RSO gummy → edible_other (not concentrate_rso)', { name: 'RSO Gummy 100mg', category: 'Edibles' }, 'edible_other')
test('"cart" in name with cat=concentrate → concentrate_other', { name: 'Rick Simpson Cart 1g', category: 'Concentrate' }, 'concentrate_rso')

// Edibles & tinctures
test('Edible drink — sparkling water', { name: 'Lemon Sparkling Water 10mg', category: 'Beverage' }, 'edible_drink')
test('Edible other — gummy', { name: 'Watermelon Gummy 100mg', category: 'Edibles' }, 'edible_other')
test('Tincture — standard', { name: 'Full Spectrum Tincture 1000mg', category: 'Tincture' }, 'tincture')
test('Topical — standard', { name: 'CBD Relief Balm 500mg', category: 'Topicals' }, 'topical')

// ── Section 2: Item #3.6 new pattern tests ────────────────────────────────────

console.log('\nItem #3.6 pattern fixes')
console.log('='.repeat(60))

// Pattern 1: CBD category
test('CBD gummy — cat=CBD → edible_other', { name: 'CBD Gummies | Raspberry 10pk', category: 'CBD', brand: 'Wyld' }, 'edible_other')
test('CBD sparkling water — cat=CBD → edible_drink', { name: 'CBD Sparkling Water - Raspberry', category: 'CBD', brand: 'Wyld' }, 'edible_drink')
test('CBD cream — cat=CBD → topical', { name: 'Vlasic | Mini CBD Relief Cream', category: 'CBD', brand: 'Vlasic Labs' }, 'topical')
test('CBD roll-on — cat=CBD → topical', { name: 'CBD Full Spectrum Sports Roll On | 3000mg', category: 'CBD', brand: 'Vlasic Labs' }, 'topical')

// Pattern 2: Oral category → tincture
test('LEVEL tincture — cat=Oral → tincture', { name: 'Unflavored', category: 'Oral', brand: 'LEVEL' }, 'tincture')
test('Oral drops — cat=Oral → tincture', { name: 'CBD Drops 500mg', category: 'Oral' }, 'tincture')

// Pattern 3: Carts/Cart category → vape
test('Rove cart — cat=Carts → vape_cart', { name: 'Dream (0.5G)', category: 'Carts', brand: 'Rove' }, 'vape_cart')
test('Disposable — cat=Cart → vape_disposable', { name: 'Pineapple Express Disposable 1g', category: 'Cart' }, 'vape_disposable')

// Pattern 4: Accessory order — STIIIZY battery before pod recognition
test('Stiiizy battery — null cat → accessory (not vape_pod)', { name: 'Acc - Stiiizy Battery $30', category: '', brand: 'STIIIZY' }, 'accessory')
test('Stiiizy power case — null cat → accessory', { name: 'Acc - Stiiizy Portable Power Case', category: '', brand: 'STIIIZY' }, 'accessory')
test('Stiiizy pod — cat=Vape → vape_pod (no regression)', { name: 'OG Kush 1g', category: 'Vape', brand: 'Stiiizy' }, 'vape_pod')
test('Generic battery — null cat → accessory', { name: '510 Battery Charger', category: '' }, 'accessory')

// ── Summary ───────────────────────────────────────────────────────────────────

const total = passed + failed
console.log('\n' + '='.repeat(60))
console.log(`Result: ${passed}/${total} passed${failed > 0 ? ` — ${failed} FAILED` : ''}`)
if (failed > 0) {
  console.log('Fix failing tests before shipping.')
  process.exit(1)
}
