/**
 * validate-subtypes.ts
 *
 * Run after a scrape to check subtype distribution and quality.
 * Usage: npx ts-node --esm scripts/validate-subtypes.ts
 *        npx tsx scripts/validate-subtypes.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)

const SUBTYPES = [
  'flower_regular',
  'flower_shake',
  'preroll_single',
  'preroll_pack',
  'vape_cart',
  'vape_disposable',
  'vape_pod',
  'concentrate_rso',
  'concentrate_other',
  'edible_drink',
  'edible_other',
  'tincture',
  'topical',
  'accessory',
] as const

async function main() {
  const date = new Date().toISOString().slice(0, 10)
  console.log(`\nSubtype distribution report — ${date}`)
  console.log('='.repeat(50))

  // Distribution counts
  const counts: Record<string, number> = {}
  let total = 0

  for (const subtype of SUBTYPES) {
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('subtype', subtype)
    counts[subtype] = count ?? 0
    total += count ?? 0
  }

  // Null count
  const { count: nullCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .is('subtype', null)
  counts['null (unclassified)'] = nullCount ?? 0
  total += nullCount ?? 0

  // Print distribution
  const maxLabelLen = Math.max(...Object.keys(counts).map(k => k.length))
  for (const [subtype, count] of Object.entries(counts)) {
    const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
    const label = subtype.padEnd(maxLabelLen)
    const bar = '█'.repeat(Math.round(count / total * 40))
    console.log(`  ${label}  ${String(count).padStart(6)}  (${pct.padStart(5)}%)  ${bar}`)
  }
  console.log(`  ${'TOTAL'.padEnd(maxLabelLen)}  ${String(total).padStart(6)}`)

  // Null rate check
  const nullRate = total > 0 ? (nullCount ?? 0) / total : 0
  console.log()
  if (nullRate > 0.05) {
    console.log(`  ⚠  NULL RATE ${(nullRate * 100).toFixed(1)}% — exceeds 5% threshold. Classifier may need tuning.`)
  } else {
    console.log(`  ✓  Null rate ${(nullRate * 100).toFixed(1)}% — within acceptable range (<5%)`)
  }

  // Spot-check: 5 random products per subtype
  console.log('\n' + '='.repeat(50))
  console.log('Spot-check — 5 random products per subtype')
  console.log('='.repeat(50))

  for (const subtype of SUBTYPES) {
    const { data } = await supabase
      .from('products')
      .select('name, brand, category, subcategory, dispensaries!inner(name)')
      .eq('subtype', subtype)
      .limit(5)

    if (!data || data.length === 0) {
      console.log(`\n  ${subtype}: (no products)`)
      continue
    }

    console.log(`\n  ${subtype} (${counts[subtype]} total):`)
    for (const p of data) {
      const dispensary = (p.dispensaries as unknown as Record<string, string> | null)?.name ?? '?'
      const brand = p.brand ? `[${p.brand}]` : ''
      const sub = p.subcategory ? `{${p.subcategory}}` : ''
      console.log(`    · ${p.name} ${brand} ${sub}`)
      console.log(`      cat="${p.category}" @ ${dispensary}`)
    }
  }

  // Unclassified sample
  if ((nullCount ?? 0) > 0) {
    console.log(`\n  null/unclassified (${counts['null (unclassified)']} total):`)
    const { data } = await supabase
      .from('products')
      .select('name, brand, category, subcategory, dispensaries!inner(name)')
      .is('subtype', null)
      .limit(10)

    for (const p of (data ?? [])) {
      const dispensary = (p.dispensaries as unknown as Record<string, string> | null)?.name ?? '?'
      console.log(`    · ${p.name} [${p.brand ?? ''}] cat="${p.category}" sub="${p.subcategory}" @ ${dispensary}`)
    }
  }

  // Spot-check acceptance criteria
  console.log('\n' + '='.repeat(50))
  console.log('Acceptance criteria checks')
  console.log('='.repeat(50))

  async function spotCheck(label: string, category: string, expectedSubtypes: string[], n = 20) {
    const { data } = await supabase
      .from('products')
      .select('name, subtype')
      .ilike('category', `%${category}%`)
      .limit(n)

    if (!data || data.length === 0) {
      console.log(`  ⚠  ${label}: no products found for category "${category}"`)
      return
    }

    const badProducts = data.filter(p => !expectedSubtypes.includes(p.subtype ?? ''))
    if (badProducts.length === 0) {
      console.log(`  ✓  ${label}: all ${data.length} sampled products correctly classified`)
    } else {
      console.log(`  ✗  ${label}: ${badProducts.length}/${data.length} unexpected subtypes:`)
      for (const p of badProducts.slice(0, 5)) {
        console.log(`     "${p.name}" → subtype="${p.subtype ?? 'null'}"`)
      }
    }
  }

  await spotCheck('Vape spot-check',        'vape',        ['vape_cart', 'vape_disposable', 'vape_pod'])
  await spotCheck('Flower spot-check',      'flower',      ['flower_regular', 'flower_shake'])
  await spotCheck('Concentrate spot-check', 'concentrate', ['concentrate_rso', 'concentrate_other'])
  await spotCheck('Edible spot-check',      'edible',      ['edible_drink', 'edible_other'])

  console.log()
}

main().catch(console.error)
