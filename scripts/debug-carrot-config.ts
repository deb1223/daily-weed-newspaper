import { chromium } from 'playwright'
import * as dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SITES = [
  { name: 'ShowGrow home',   url: 'https://store.showgrowvegas.com/' },
  { name: 'ShowGrow /menu/', url: 'https://store.showgrowvegas.com/menu/' },
  { name: 'ShowGrow /shop/', url: 'https://store.showgrowvegas.com/shop/' },
]

async function carrotFetch(apiUrl: string, spaceId: number, path: string) {
  const res = await fetch(`${apiUrl}${path}`, {
    headers: {
      'Carrot-Space-Id':     String(spaceId),
      'Carrot-Anonymous-Id': 'scraper-debug-001',
      'Accept':              'application/json',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const seen = new Set<string>()

  for (const site of SITES) {
    console.log(`\n──────────────────────────────────────`)
    console.log(`🔍 ${site.name} → ${site.url}`)

    const page = await browser.newPage()
    try {
      await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(4000)

      const config = await page.evaluate(() => {
        const w = window as unknown as Record<string, unknown>
        const inlineText = Array.from(document.querySelectorAll('script:not([src])'))
          .map(s => s.textContent || '').join('\n')
        const apiMatch = inlineText.match(/CARROT_API_URL\s*=\s*["']([^"']+)["']/)
        const idMatch  = inlineText.match(/CARROT_SPACE_ID\s*=\s*(\d+)/)
        const scriptSrcs = Array.from(document.querySelectorAll('script[src]'))
          .map(s => (s as HTMLScriptElement).src)
        // Log all inline scripts for debugging
        const inlineSnippets = Array.from(document.querySelectorAll('script:not([src])'))
          .map(s => s.textContent?.slice(0, 200) || '')
          .filter(Boolean)
        return {
          apiUrl:     (w.CARROT_API_URL  as string)  || (apiMatch ? apiMatch[1] : null),
          spaceId:    (w.CARROT_SPACE_ID as number)  ?? (idMatch  ? Number(idMatch[1]) : null),
          scriptSrcs: scriptSrcs.filter(s => s.includes('carrot') || s.includes('getcarrot')),
          allScriptSrcs: scriptSrcs.slice(0, 10),
          inlineSnippets: inlineSnippets.slice(0, 5),
        }
      })

      console.log(`  CARROT_API_URL  = ${config.apiUrl  ?? '(not found)'}`)
      console.log(`  CARROT_SPACE_ID = ${config.spaceId ?? '(not found)'}`)
      if (config.scriptSrcs.length) console.log(`  Carrot scripts: ${config.scriptSrcs.slice(0,3).join(', ')}`)
      if (!config.apiUrl) {
        console.log(`  All scripts: ${config.allScriptSrcs.join('\n    ')}`)
        for (const s of config.inlineSnippets) console.log(`  Inline: ${s.replace(/\s+/g,' ')}`)
      }

      if (config.apiUrl && config.spaceId != null) {
        const key = `${config.apiUrl}::${config.spaceId}`
        if (!seen.has(key)) {
          seen.add(key)
          await page.close()

          // ── Node-side API calls (no CORS) ──
          // Try several candidate location endpoints
          for (const ep of ['/store/location?platform=web', '/store/locations?platform=web', '/location?platform=web', '/store/settings?locId=1']) {
            try {
              const r = await carrotFetch(config.apiUrl, config.spaceId, ep)
              console.log(`  ✓ ${ep}: ${JSON.stringify(r).slice(0, 300)}`)
              break
            } catch { /* try next */ }
          }

          // Categories at locId=1 and locId=2
          for (const locId of [1, 2]) {
            try {
              const cats = await carrotFetch(config.apiUrl, config.spaceId, `/store/category?locId=${locId}&platform=web`)
              const slugs = Array.isArray(cats) ? cats.map((c: Record<string,unknown>) => c.slug) : '(not array)'
              console.log(`  locId=${locId} cats: ${JSON.stringify(slugs)}`)
            } catch (e) { console.log(`  locId=${locId}: error ${e}`) }
          }

          // Sample one product from The Spot (spaceId=49, locId=1, confirmed working)
          if (config.spaceId === 49) {
            try {
              const prods = await carrotFetch(config.apiUrl, config.spaceId, '/store/category/slug/flower/product?locId=1&platform=web')
              const arr = Array.isArray(prods) ? prods : []
              if (arr.length > 0) {
                const p = arr[0] as Record<string,unknown>
                console.log(`  Sample product keys: ${Object.keys(p).join(', ')}`)
                const inner = p.product as Record<string,unknown> | undefined
                if (inner) console.log(`  inner product keys: ${Object.keys(inner).join(', ')}`)
                console.log(`  cashOptions[0]: ${JSON.stringify((p.cashOptions as unknown[])?.[0])}`)
                // Check labResults for terpenes
                const labResults = (inner?.labResults as Record<string,unknown>[]) ?? []
                console.log(`  labResults[0]: ${JSON.stringify(labResults[0])}`)
              } else {
                console.log(`  (no products returned)`)
              }
            } catch (e) { console.error(`  ✗ sample product: ${e}`) }
          }
          continue
        }
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err}`)
    } finally {
      await page.close().catch(() => {})
    }
  }

  await browser.close()
}

main().catch(console.error)
