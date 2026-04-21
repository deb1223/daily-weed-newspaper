/**
 * debug-dutchie-weight.ts  (repurposed for Curaleaf/Sweed audit)
 * Navigates curaleaf.com, intercepts Sweed API responses, and dumps the full
 * raw variant fields for any Select/ROVE/STIIIZY vape product.
 *
 * Run: npx tsx scripts/debug-dutchie-weight.ts
 */

import { chromium } from 'playwright'

const TARGET = {
  slug: 'curaleaf-north-las-vegas',
  url: 'https://curaleaf.com/shop/nevada/curaleaf-north-las-vegas/recreational',
}

const TARGET_BRANDS = ['select', 'rove', 'stiiizy']

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  })
  const page = await context.newPage()

  const sweedResponses: { url: string; body: unknown }[] = []

  // Capture every network response and log anything from sweedpos
  page.on('response', async (response) => {
    const url = response.url()
    if (url.includes('sweedpos.com') || url.includes('curaleaf.com/api') || url.includes('/_api/')) {
      try {
        const body = await response.json()
        sweedResponses.push({ url, body })
        console.log(`  [intercept] ${url.substring(0, 120)}`)
      } catch { /* not json */ }
    }
  })

  console.log(`\nNavigating to ${TARGET.url}`)
  await page.goto(TARGET.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(4000)

  // ── Gate 1: Age gate ─────────────────────────────────────────────────────
  if (page.url().includes('age-gate') || page.url().includes('age_gate')) {
    console.log(`[Gate 1] Age gate at ${page.url()}`)
    try {
      const stateBtn = page.locator('button, [role="button"], [role="combobox"]')
        .filter({ hasText: /state|select state/i }).first()
      await stateBtn.waitFor({ timeout: 8000 })
      await stateBtn.click()
      await page.waitForTimeout(800)
      const nevadaOpt = page.locator('[role="option"], li, button')
        .filter({ hasText: /^nevada$/i }).first()
      await nevadaOpt.waitFor({ timeout: 8000 })
      await nevadaOpt.click()
      await page.waitForTimeout(800)
      const checkboxes = page.locator('input[type="checkbox"]')
      const count = await checkboxes.count()
      for (let i = 0; i < count; i++) {
        const cb = checkboxes.nth(i)
        if (!await cb.isChecked().catch(() => false)) await cb.click({ force: true })
        await page.waitForTimeout(300)
      }
      const over21Btn = page.locator('button, [role="button"]')
        .filter({ hasText: /i.?m over 21|i am 21|over 21/i }).first()
      await over21Btn.waitFor({ timeout: 8000 })
      await over21Btn.click()
      await page.waitForTimeout(5000)
      console.log(`[Gate 1] passed → ${page.url()}`)
    } catch (err) {
      console.error(`[Gate 1] FAILED: ${err}`)
    }
  } else {
    console.log(`[Gate 1] no age gate`)
  }

  // ── Gate 2: Shop Adult Menu ───────────────────────────────────────────────
  try {
    const shopBtn = page.locator('a, button, [role="button"]')
      .filter({ hasText: /shop adult|adult use|adult menu|recreational menu|shop rec/i }).first()
    const visible = await shopBtn.isVisible().catch(() => false)
    if (!visible) await shopBtn.waitFor({ timeout: 8000 }).catch(() => null)
    if (await shopBtn.isVisible().catch(() => false)) {
      await shopBtn.click()
      await page.waitForTimeout(4000)
      console.log(`[Gate 2] adult menu clicked → ${page.url()}`)
    } else {
      console.log(`[Gate 2] no button needed`)
    }
  } catch { console.log(`[Gate 2] skipped`) }

  // ── Gate 3: Guest modal ───────────────────────────────────────────────────
  try {
    const guestBtn = page.locator('button, [role="button"], a')
      .filter({ hasText: /continue as guest|skip|no thanks|guest/i }).first()
    await guestBtn.waitFor({ timeout: 8000 })
    await guestBtn.click()
    await page.waitForTimeout(3000)
    console.log(`[Gate 3] guest modal dismissed`)
  } catch { console.log(`[Gate 3] no guest modal`) }

  // ── Scroll to trigger lazy loads ──────────────────────────────────────────
  for (let i = 1; i <= 6; i++) {
    await page.evaluate((step) => window.scrollTo(0, (document.body.scrollHeight / 6) * step), i)
    await page.waitForTimeout(700)
  }
  await page.waitForTimeout(3000)

  await browser.close()

  console.log(`\n${'='.repeat(70)}`)
  console.log(`Intercepted ${sweedResponses.length} Sweed/API response(s)`)
  console.log('='.repeat(70))

  if (sweedResponses.length === 0) {
    console.log('\nNo Sweed API responses captured. The page may require cookies from a prior session.')
    console.log('Try running with PWDEBUG=1 to see the browser: PWDEBUG=1 npx tsx scripts/debug-dutchie-weight.ts')
    process.exit(0)
  }

  let foundCount = 0

  for (const { url: respUrl, body } of sweedResponses) {
    console.log(`\nResponse URL: ${respUrl}`)

    // Collect all product items from any structure
    const items: Record<string, unknown>[] = []
    const b = body as Record<string, unknown>

    if (Array.isArray(body)) {
      for (const carousel of body as Record<string, unknown>[]) {
        const prods = carousel.products as Record<string, unknown>[] | undefined
        if (Array.isArray(prods)) items.push(...prods)
      }
    } else {
      const nested = (b.products ?? b.items ?? b.data) as Record<string, unknown>[] | undefined
      if (Array.isArray(nested)) items.push(...nested)
    }

    if (items.length === 0) {
      console.log('  (no product array found in this response — raw keys:', Object.keys(b).join(', '), ')')
      continue
    }

    console.log(`  ${items.length} products in response`)

    for (const p of items) {
      const brandObj = p.brand as Record<string, unknown> | null
      const brand = String(brandObj?.name ?? p.brandName ?? '').toLowerCase()
      const catObj = p.category as Record<string, unknown> | null
      const cat = String(catObj?.name ?? p.category ?? '').toLowerCase()
      const pName = String(p.name ?? p.customName ?? '')

      if (!TARGET_BRANDS.some(b => brand.includes(b)) || !cat.includes('vape')) continue

      foundCount++
      if (foundCount > 4) { console.log('\n(stopping after 4 matches)'); break }

      console.log('\n' + '-'.repeat(70))
      console.log(`PRODUCT: "${pName}"  brand="${brand}"  category="${cat}"`)
      console.log('-'.repeat(70))

      const variants = (p.variants as Record<string, unknown>[] | undefined) ?? []
      if (variants.length === 0) {
        console.log('  variants: [] (empty — no variants array)')
      } else {
        console.log(`  variants (${variants.length}):`)
        for (const v of variants) {
          console.log('    variant raw:', JSON.stringify(v, null, 4)
            .split('\n').map(l => '    ' + l).join('\n'))
        }
      }

      // Dump all weight-adjacent top-level fields on the product
      const weightFields = [
        'weight', 'Weight', 'net_weight', 'netWeight', 'weightGrams',
        'size', 'Size', 'amount', 'Amount', 'quantity', 'Quantity',
        'unitOfMeasure', 'UnitOfMeasure', 'unit', 'packageSize',
        'quantityValue', 'options', 'Options',
      ]
      console.log('  top-level weight fields:')
      let anyFound = false
      for (const f of weightFields) {
        if (p[f] !== undefined) {
          console.log(`    ${f}:`, JSON.stringify(p[f]))
          anyFound = true
        }
      }
      if (!anyFound) console.log('    (none)')

      console.log('  ALL top-level keys:', Object.keys(p).join(', '))
    }
  }

  if (foundCount === 0) {
    console.log('\nNo matching Select/ROVE/STIIIZY vape products found.')
    console.log('Dumping first 2 products from first response for structure inspection:')
    const first = sweedResponses[0]
    const b = first.body as Record<string, unknown>
    const items: Record<string, unknown>[] = []
    if (Array.isArray(first.body)) {
      for (const c of first.body as Record<string, unknown>[]) {
        const prods = c.products as Record<string, unknown>[] | undefined
        if (Array.isArray(prods)) items.push(...prods)
      }
    } else {
      const nested = (b.products ?? b.items ?? b.data) as Record<string, unknown>[] | undefined
      if (Array.isArray(nested)) items.push(...nested)
    }
    for (const p of items.slice(0, 2)) {
      console.log('\n', JSON.stringify(p, null, 2).substring(0, 2000))
    }
  }
}

main().catch(console.error)
