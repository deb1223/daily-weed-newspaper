import { createClient } from '@supabase/supabase-js'
import { chromium, type Page } from 'playwright'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)

const SKIP_WORKING = false
const WORKING_SLUGS = ['planet-13-dispensary', 'the-dispensary-las-vegas', 'the-grove-las-vegas', 'the-sanctuary-north-las-vegas']

// TEST_MODE: when true, only scrape stores whose slug is in TEST_SLUGS
const TEST_MODE = false
const TEST_SLUGS = ['sahara-wellness', 'thrive-west-sahara']

const LAS_VEGAS_DUTCHIE_SLUGS = [
  { slug: 'planet-13-dispensary', path: 'dispensary' },
  { slug: 'the-dispensary-las-vegas', path: 'dispensary' },
  { slug: 'the-grove-las-vegas', path: 'dispensary' },
  { slug: 'the-sanctuary-north-las-vegas', path: 'dispensary' },
  { slug: 'curaleaf-nv-lasvegasblvd', path: 'dispensary' },
  { slug: 'curaleaf-north-las-vegas', path: 'dispensary' },
  { slug: 'curaleaf-nv-western-aveacres', path: 'dispensary' },
  { slug: 'thrive-sammy-davis', path: 'dispensary' },
  { slug: 'thrive-cannabis-marketplace-downtown', path: 'dispensary' },
  { slug: 'thrive-cannabis-marketplace-north-las-vegas-drive-thru', path: 'dispensary' },
  { slug: 'nuwu-cannabis-marketplace-downtown', path: 'dispensary' },
  { slug: 'nuwu-north-centennial-hills', path: 'dispensary' },
  { slug: 'nevada-made-marijuana-warm-springs', path: 'dispensary' },
  { slug: 'nevada-made-marijuana-charleston', path: 'dispensary' },
  { slug: 'inyo-fine-cannabis-dispensary', path: 'stores' },
  // Added April 5 2026
  { slug: 'cannastarz', path: 'dispensary' },
  { slug: 'the-cannabis-co', path: 'dispensary' },
  { slug: 'cookies-las-vegas', path: 'dispensary' },
  { slug: 'cultivate-las-vegas', path: 'dispensary' },
  { slug: 'c-durango', path: 'dispensary' },
  { slug: 'curaleaf-nv-north-las-vegas', path: 'dispensary' },
  { slug: 'curaleaf-las-vegas-western-ave', path: 'dispensary' },
  { slug: 'zen-leaf-las-vegas', path: 'dispensary' },
  // Added April 5 2026 (batch 2)
  { slug: 'euphoria-dispensary',                   path: 'dispensary' },
  { slug: 'green-nv-hualapai',                     path: 'dispensary' },
  { slug: 'green-nv-henderson',                    path: 'dispensary' },
  { slug: 'green-nv-rainbow',                      path: 'dispensary' },
  { slug: 'greenlight-downtown-las-vegas',         path: 'dispensary' },
  { slug: 'greenlight-paradise',                   path: 'dispensary' },
  { slug: 'blum-desert-inn',                       path: 'dispensary' },
  { slug: 'jade-kola',                             path: 'dispensary' },
  { slug: 'jardin-premium-cannabis-dispensary',    path: 'dispensary' },
  { slug: 'the-dispensary-eastern-express',        path: 'dispensary' },
  { slug: 'medizin-dispensary',                    path: 'dispensary' },
  { slug: 'the-mint-paradise',                     path: 'dispensary' },
  { slug: 'the-mint-spring-valley',                path: 'dispensary' },
  { slug: 'nevada-made-marijuana-henderson1',      path: 'dispensary' },
  { slug: 'nevada-made-marijuana-laughlin1',       path: 'dispensary' },
  { slug: 'sahara-wellness',                       path: 'dispensary' },
  { slug: 'the-sanctuary-downtown',               path: 'dispensary' },
  { slug: 'shango-vegas',                          path: 'dispensary' },
  { slug: 'mmj-america-vegas',                     path: 'dispensary' },
]

interface InterceptedResponse {
  url: string
  body: unknown
}

// Note: products table has `product_url text` column (migration already applied):
// alter table products add column if not exists product_url text;

// Produce a URL-safe slug from any product name
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface InterceptedProduct {
  name: string
  brand?: string
  category?: string
  subcategory?: string
  strainType?: string
  thcPercentage?: number
  cbdPercentage?: number
  weightGrams?: number
  price: number
  originalPrice?: number
  onSale?: boolean
  dealDescription?: string
  inStock?: boolean
  imageUrl?: string
  productUrl?: string
}

function parseWeight(text: string): number | null {
  if (!text) return null
  const match = text.match(/(\d*\.?\d+)\s*(g|oz|mg)/i)
  if (!match) return null
  const value = parseFloat(match[1])
  const unit = match[2].toLowerCase()
  if (unit === 'oz') return value * 28.35
  if (unit === 'mg') return value / 1000
  return value
}

function parseStrainType(text: string): string | null {
  if (!text) return null
  const t = text.toLowerCase()
  if (t.includes('indica')) return 'indica'
  if (t.includes('sativa')) return 'sativa'
  if (t.includes('hybrid')) return 'hybrid'
  if (t.includes('cbd')) return 'cbd'
  return null
}

async function interceptDutchieProducts(
  page: Page,
  slug: string,
  path: string
): Promise<InterceptedProduct[]> {
  const products: InterceptedProduct[] = []
  const intercepted: InterceptedResponse[] = []

  // Listen for API responses
  page.on('response', async response => {
    const url = response.url()

    if (
      url.includes('graphql') &&
      (url.includes('FilteredProducts') ||
        response.request().postData()?.includes('FilteredProducts'))
    ) {
      try {
        const body: unknown = await response.json()
        intercepted.push({ url, body })
        console.log(`  📡 Intercepted GraphQL FilteredProducts: ${url.substring(0, 80)}`)
      } catch {
        // not json
      }
    }
  })

  // Navigate to dispensary menu
  const url = `https://dutchie.com/${path}/${slug}`
  console.log(`  🌐 Navigating to ${url}`)

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    await page.waitForTimeout(6000)

    // Scroll through page in steps to trigger lazy category loads
    for (let i = 0; i < 5; i++) {
      await page.evaluate((step) => {
        window.scrollTo(0, (document.body.scrollHeight / 5) * step)
      }, i)
      await page.waitForTimeout(500)
    }

    // Click through all category tabs to trigger per-category GraphQL requests
    const tabs = await page.$$('[data-testid="category-tab"], [class*="CategoryTab"], [class*="category-tab"]')
    console.log(`  📑 Found ${tabs.length} category tabs`)
    for (const tab of tabs) {
      try {
        await tab.click()
        await page.waitForTimeout(1500)
      } catch {
        // tab may have become detached
      }
    }

    // Wait for all in-flight requests to settle
    await page.waitForTimeout(5000)

  } catch (error) {
    console.error(`  ✗ Navigation failed: ${error}`)
    return []
  }

  // Collect products from ALL intercepted FilteredProducts responses
  const allProducts: InterceptedProduct[] = []
  for (const response of intercepted) {
    const parsed = extractProductsFromResponse(response.body, slug)
    allProducts.push(...parsed)
  }

  // Deduplicate by name + weight
  const seen = new Set<string>()
  const uniqueProducts = allProducts.filter(p => {
    const key = `${p.name}-${p.weightGrams}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  products.push(...uniqueProducts)

  // If no JSON intercepted fall back to HTML parsing
  if (products.length === 0) {
    console.log('  ⚠ No JSON intercepted — trying HTML fallback')
    const htmlProducts = await parseProductsFromHTML(page)
    products.push(...htmlProducts)
  }

  return products
}

function extractProductsFromResponse(body: unknown, slug: string): InterceptedProduct[] {
  const products: InterceptedProduct[] = []

  if (!body || typeof body !== 'object') return products

  const b = body as Record<string, unknown>

  // Dutchie GraphQL path: data.filteredProducts.products
  const filteredProducts = (b?.data as Record<string, unknown>)?.filteredProducts as Record<string, unknown>
  const productList = filteredProducts?.products as unknown[]

  if (!Array.isArray(productList) || productList.length === 0) return products
  const total = filteredProducts?.total as number | undefined
  if (total) {
    console.log(`  📊 Category total: ${total} products (got ${productList.length})`)
  } else {
    console.log(`  📋 Found ${productList.length} products in GraphQL response`)
  }

  for (const item of productList) {
    if (!item || typeof item !== 'object') continue
    const p = item as Record<string, unknown>

    // Get name — strip Nuwu POS codes e.g. "M{304} Medizin Jealousy N{S/O} 3.5g"
    const name = String(p.Name || p.name || p.title || '')
      .replace(/^M\{[^}]+\}\s*/i, '')
      .replace(/\s*N\{[^}]+\}/gi, '')
      .trim()
    if (!name) continue

    // medicalPrices and recPrices are plain number[] e.g. [25]
    // medicalSpecialPrices / recSpecialPrices hold the discounted price when on sale
    const medicalPrices = (p.medicalPrices || []) as number[]
    const medicalSpecialPrices = (p.medicalSpecialPrices || []) as number[]
    const recPrices = (p.recPrices || []) as number[]
    const recSpecialPrices = (p.recSpecialPrices || []) as number[]

    const regularPrice = medicalPrices[0] || recPrices[0] || 0
    const specialPrice = medicalSpecialPrices[0] || recSpecialPrices[0] || 0

    const price = specialPrice > 0 ? specialPrice : regularPrice
    const originalPrice = specialPrice > 0 ? regularPrice : 0

    if (!price || price <= 0) continue

    // Get brand
    const brand = String(
      (p.brand as Record<string, unknown>)?.name ||
      p.brandName ||
      p.Brand ||
      ''
    )

    // Get category
    const category = String(
      (p.category as Record<string, unknown>)?.name ||
      p.category ||
      p.Category ||
      p.type ||
      ''
    )

    // Get THC/CBD
    let thcPercentage = parseFloat(String(
      ((p.cannabinoids as Record<string, unknown>)?.THCContent as Record<string, unknown>)?.formatted ||
      p.thcContent ||
      p.THC ||
      0
    )) || undefined

    // THC fallback: THCContent.range[0]
    if (!thcPercentage) {
      const thcContent = p.THCContent as Record<string, unknown> | undefined
      const range = thcContent?.range as number[] | undefined
      if (range?.[0]) thcPercentage = range[0]
    }

    // Weight: primary from Options[].unit/value
    let weightGrams: number | undefined
    const options = (p.Options || p.options) as Record<string, unknown>[] | undefined
    if (Array.isArray(options) && options.length > 0) {
      const unit = String(options[0].unit || '').toLowerCase()
      const val = parseFloat(String(options[0].value || 0))
      if (val > 0) {
        if (unit === 'oz') weightGrams = val * 28.35
        else if (unit === 'mg') weightGrams = val / 1000
        else weightGrams = val // grams
      }
    }

    // Weight fallback: measurements.netWeight.values[0]
    if (!weightGrams) {
      const measurements = p.measurements as Record<string, unknown> | undefined
      const netWeight = measurements?.netWeight as Record<string, unknown> | undefined
      const unit = String(netWeight?.unit || '')
      const values = netWeight?.values as number[] | undefined
      if (values?.[0]) {
        if (unit === 'MILLIGRAMS') weightGrams = values[0] / 1000
        else if (unit === 'GRAMS') weightGrams = values[0]
      }
    }

    // Weight fallback: rawOptions e.g. ["0.5g", "1.0g"]
    if (!weightGrams) {
      const rawOptions = p.rawOptions as string[] | undefined
      if (Array.isArray(rawOptions) && rawOptions.length > 0) {
        weightGrams = parseWeight(rawOptions[0]) ?? undefined
      }
    }

    // Final fallback: parse weight from product name
    if (!weightGrams) {
      weightGrams = parseWeight(name) ?? undefined
    }

    const productId = String(p.id || p._id || p.Id || '')
    const productUrl = productId
      ? `https://dutchie.com/dispensary/${slug}/product/${productId}`
      : undefined

    products.push({
      name,
      brand,
      category,
      price,
      originalPrice: originalPrice > price ? originalPrice : undefined,
      onSale: originalPrice > price,
      thcPercentage,
      weightGrams,
      inStock: p.isAvailable !== false && p.isSoldOut !== true,
      productUrl,
    })
  }

  return products
}

async function parseProductsFromHTML(page: Page): Promise<InterceptedProduct[]> {
  const products: InterceptedProduct[] = []

  try {
    // Extract product data from rendered HTML
    const rawProducts = await page.evaluate(() => {
      const items: Record<string, string>[] = []
      
      // Look for product cards — Dutchie uses consistent class patterns
      const cards = document.querySelectorAll(
        '[data-testid="product-card"], .product-card, [class*="ProductCard"], [class*="product-item"]'
      )

      cards.forEach(card => {
        const name = card.querySelector(
          '[class*="name"], [class*="title"], h3, h4'
        )?.textContent?.trim() || ''

        const priceEl = card.querySelector(
          '[class*="price"], [class*="Price"]'
        )?.textContent?.trim() || ''

        const price = parseFloat(priceEl.replace(/[^0-9.]/g, ''))

        if (name && price > 0) {
          items.push({ name, price: String(price) })
        }
      })

      return items
    })

    for (const item of rawProducts) {
      products.push({
        name: item.name,
        price: parseFloat(item.price),
      })
    }

    console.log(`  📄 HTML fallback found ${products.length} products`)
  } catch (error) {
    console.error('  ✗ HTML parsing failed:', error)
  }

  return products
}

async function upsertDispensary(slug: string, path: string, name: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('dispensaries')
    .upsert({
      slug,
      name,
      platform: 'dutchie',
      dutchie_url: `https://dutchie.com/${path}/${slug}`,
      last_scraped: new Date().toISOString(),
    }, { onConflict: 'slug' })
    .select('id')
    .single()

  if (error) {
    console.error(`  ✗ Failed to upsert dispensary ${slug}:`, error.message)
    return null
  }

  return data?.id || null
}

async function upsertDispensaryJane(slug: string, name: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('dispensaries')
    .upsert({
      slug,
      name,
      platform: 'iheartjane',
      dutchie_url: null,
      last_scraped: new Date().toISOString(),
    }, { onConflict: 'slug' })
    .select('id')
    .single()

  if (error) {
    console.error(`  ✗ Failed to upsert dispensary ${slug}:`, error.message)
    return null
  }

  return data?.id || null
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

async function upsertSingleProduct(
  product: InterceptedProduct,
  dispensaryId: string,
  source: 'dutchie' | 'jane' | 'curaleaf'
): Promise<'inserted' | 'updated' | 'failed'> {
  const payload = {
    dispensary_id: dispensaryId,
    name: product.name,
    brand: product.brand || null,
    category: product.category || null,
    subcategory: product.subcategory || null,
    strain_type: product.strainType || null,
    thc_percentage: (product.thcPercentage != null && product.thcPercentage >= 0 && product.thcPercentage <= 100) ? product.thcPercentage : null,
    cbd_percentage: (product.cbdPercentage != null && product.cbdPercentage >= 0 && product.cbdPercentage <= 100) ? product.cbdPercentage : null,
    weight_grams: product.weightGrams || null,
    price: product.price,
    original_price: product.originalPrice || null,
    on_sale: product.onSale || false,
    deal_description: product.dealDescription || null,
    in_stock: product.inStock !== false,
    image_url: product.imageUrl || null,
    product_url: product.productUrl || null,
    source,
    last_scraped: new Date().toISOString(),
  }

  // True upsert against the existing unique index on (dispensary_id, name, weight_grams).
  // NULLS NOT DISTINCT on the index means null weight_grams values are treated as equal,
  // so products without a weight resolve correctly without SELECT+INSERT races.
  // Note: do NOT use onConflict:'dispensary_id,name' — it would break multi-weight products
  // (same strain in 1g/3.5g/7g). The 3-column index is the correct conflict target.
  const { data, error } = await supabase
    .from('products')
    .upsert(payload, { onConflict: 'dispensary_id,name,weight_grams', ignoreDuplicates: false })
    .select('id')
    .maybeSingle()

  if (error) return 'failed'
  return data ? 'updated' : 'inserted'
}

async function upsertProducts(
  dispensaryId: string,
  products: InterceptedProduct[],
  source: 'dutchie' | 'jane' | 'curaleaf'
): Promise<{ inserted: number; updated: number; failed: number }> {
  let inserted = 0
  let updated = 0
  let failed = 0

  const batches = chunkArray(products, 50)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`  💾 Saving batch ${i + 1}/${batches.length} (${batch.length} products)...`)

    const results = await Promise.all(
      batch.map(p => upsertSingleProduct(p, dispensaryId, source))
    )

    for (const r of results) {
      if (r === 'inserted') inserted++
      else if (r === 'updated') updated++
      else failed++
    }

    if (i < batches.length - 1) {
      await new Promise(r => setTimeout(r, 150))
    }
  }

  return { inserted, updated, failed }
}

async function getDispensaryName(page: Page, slug: string): Promise<string> {
  try {
    const name = await page.evaluate(() => {
      return document.querySelector('h1')?.textContent?.trim() ||
        document.title?.split('|')[0]?.trim() ||
        ''
    })
    return name || slug
  } catch {
    return slug
  }
}

// ─── Thrive / iHeartJane scraper ─────────────────────────────────────────────

const THRIVE_DISPENSARIES = [
  { slug: 'thrive-north-las-vegas-drive-thru', name: 'Thrive Cannabis Marketplace (North LV Drive-Thru)', url: 'https://thrivenevada.com/north-las-vegas-drive-thru-menu', storeId: 3305 },
  { slug: 'thrive-west-sahara',                name: 'Thrive Cannabis Marketplace (West Sahara)',          url: 'https://thrivenevada.com/west-sahara-weed-dispensary-menu',         storeId: 3308 },
  { slug: 'thrive-southern-highlands',         name: 'Thrive Cannabis Marketplace (Southern Highlands)',   url: 'https://thrivenevada.com/southern-highlands-weed-dispensary-menu',  storeId: 3307 },
  { slug: 'thrive-las-vegas-strip',            name: 'Thrive Cannabis Marketplace (Las Vegas Strip)',      url: 'https://thrivenevada.com/las-vegas-strip-dispensary-menu',           storeId: 3306 },
  // iHeartJane: non-Thrive locations that use the same scraping pattern
  { slug: 'cookies-on-the-strip',              name: 'Cookies On The Strip',                              url: 'https://iheartjane.com/stores/888/cookies-on-the-strip/menu',       storeId: 888  },
  // Added April 5 2026
  { slug: 'beyond-hello-sahara-ave',           name: 'Beyond Hello - Sahara Ave',                         url: 'https://iheartjane.com/stores/4361/beyond-hello-sahara-ave/menu',   storeId: 4361 },
  { slug: 'beyond-hello-twain-ave',            name: 'Beyond Hello - Twain Ave',                          url: 'https://iheartjane.com/stores/5215/beyond-hello-twain-ave/menu',    storeId: 5215 },
  { slug: 'the-source-henderson-eastern',      name: 'The Source - Henderson Eastern',                    url: 'https://iheartjane.com/stores/3013/the-source-henderson-eastern/menu', storeId: 3013 },
  { slug: 'the-source-las-vegas-rainbow',      name: 'The Source - Las Vegas Rainbow',                    url: 'https://iheartjane.com/stores/3012/the-source-las-vegas-rainbow/menu', storeId: 3012 },
  { slug: 'the-source-north-lv-deer-springs',  name: 'The Source - North LV Deer Springs',                url: 'https://iheartjane.com/stores/3104/the-source-north-lv-deer-springs/menu', storeId: 3104 },
  { slug: 'the-source-henderson-water-st',     name: 'The Source - Henderson Water St',                   url: 'https://iheartjane.com/stores/6922/the-source-henderson-water-st/menu', storeId: 6922 },
  { slug: 'zen-leaf-north-las-vegas',          name: 'Zen Leaf - North Las Vegas',                        url: 'https://iheartjane.com/stores/2747/zen-leaf-north-las-vegas/menu',  storeId: 2747 },
  { slug: 'deep-roots-cheyenne',               name: 'Deep Roots - Cheyenne',                             url: 'https://iheartjane.com/stores/6149/deep-roots-cheyenne/menu',       storeId: 6149 },
  { slug: 'deep-roots-craig',                  name: 'Deep Roots - Craig',                                url: 'https://iheartjane.com/stores/6530/deep-roots-craig/menu',           storeId: 6530 },
  { slug: 'deep-roots-blue-diamond',           name: 'Deep Roots - Blue Diamond',                         url: 'https://iheartjane.com/stores/6529/deep-roots-blue-diamond/menu',   storeId: 6529 },
  { slug: 'deep-roots-parkson-henderson',      name: 'Deep Roots - Parkson Henderson',                    url: 'https://iheartjane.com/stores/6527/deep-roots-parkson-henderson/menu', storeId: 6527 },
  // Added April 5 2026 (batch 2)
  { slug: 'thrive-main-st-arts-district',      name: 'Thrive - Main St Arts District',                    url: 'https://iheartjane.com/stores/6213/thrive-main-st-arts-district/menu', storeId: 6213 },
  { slug: 'jennys-dispensary',                 name: "Jenny's Dispensary",                                url: 'https://iheartjane.com/stores/1597/jennys-dispensary/menu',           storeId: 1597 },
  { slug: 'rise-henderson-sunset',             name: 'RISE - Henderson Sunset',                           url: 'https://iheartjane.com/stores/887/rise-henderson-sunset/menu',        storeId: 887  },
  { slug: 'rise-tropicana',                    name: 'RISE - Tropicana',                                  url: 'https://iheartjane.com/stores/886/rise-tropicana/menu',               storeId: 886  },
  { slug: 'rise-rainbow',                      name: 'RISE - Rainbow',                                    url: 'https://iheartjane.com/stores/1718/rise-rainbow/menu',                storeId: 1718 },
  { slug: 'rise-nellis',                       name: 'RISE - Nellis',                                     url: 'https://iheartjane.com/stores/5267/rise-nellis/menu',                 storeId: 5267 },
  { slug: 'rise-henderson-boulder',            name: 'RISE - Henderson Boulder',                          url: 'https://iheartjane.com/stores/6211/rise-henderson-boulder/menu',      storeId: 6211 },
  { slug: 'rise-durango',                      name: 'RISE - Durango',                                    url: 'https://iheartjane.com/stores/1885/rise-durango/menu',                storeId: 1885 },
  { slug: 'rise-craig-rd',                     name: 'RISE - Craig Rd',                                   url: 'https://iheartjane.com/stores/5429/rise-craig-rd/menu',               storeId: 5429 },
  { slug: 'silver-sage-wellness',              name: 'Silver Sage Wellness',                              url: 'https://iheartjane.com/stores/1281/silver-sage-wellness/menu',        storeId: 1281 },
  // storeId 932 ShowGrow skipped — listed as "pending" on Jane, verify before enabling
  { slug: 'tree-of-life-las-vegas',            name: 'Tree of Life - Las Vegas',                          url: 'https://iheartjane.com/stores/4219/tree-of-life-las-vegas/menu',      storeId: 4219 },
  { slug: 'tree-of-life-north-las-vegas',      name: 'Tree of Life - North Las Vegas',                    url: 'https://iheartjane.com/stores/3274/tree-of-life-north-las-vegas/menu', storeId: 3274 },
  { slug: 'zen-leaf-fort-apache',              name: 'Zen Leaf - Fort Apache',                            url: 'https://iheartjane.com/stores/1648/zen-leaf-fort-apache/menu',        storeId: 1648 },
]

function parseJaneProducts(products: Record<string, unknown>[], storeId: number): InterceptedProduct[] {
  const result: InterceptedProduct[] = []

  for (const item of products) {
    const sa = item.search_attributes as Record<string, unknown> | undefined
    if (!sa) continue

    const name = String(sa.name || '')
    if (!name) continue

    // Price: use bucket_price as the canonical price
    const bucketPrice = Number(sa.bucket_price ?? 0)
    if (!bucketPrice || bucketPrice <= 0) continue

    // Sale: check applicable_special_ids or brand_special_prices
    const specialIds = (sa.applicable_special_ids as unknown[]) ?? []
    const brandSpecials = sa.brand_special_prices as Record<string, Record<string, unknown>> | undefined

    let price = bucketPrice
    let originalPrice: number | undefined
    let onSale = false

    // Check for a product-level special price (any weight)
    if (specialIds.length > 0) {
      const specialPriceKeys = Object.keys(sa).filter(k => k.startsWith('special_price_') || k.startsWith('discounted_price_'))
      for (const k of specialPriceKeys) {
        const v = sa[k] as Record<string, unknown> | number | undefined
        const discounted = k.startsWith('discounted_price_') ? Number(v) : (typeof v === 'object' && v?.price ? Number(v.price) : 0)
        if (discounted > 0 && discounted < bucketPrice) {
          price = discounted
          originalPrice = bucketPrice
          onSale = true
          break
        }
      }
    }

    // Brand specials (e.g. "20% back") — use as sale indicator
    if (!onSale && brandSpecials && Object.keys(brandSpecials).length > 0) {
      for (const weightKey of Object.keys(brandSpecials)) {
        const bp = brandSpecials[weightKey]
        if (bp?.price) {
          const salePrice = parseFloat(String(bp.price))
          if (salePrice > 0 && salePrice < bucketPrice) {
            price = salePrice
            originalPrice = bucketPrice
            onSale = true
            break
          }
        }
      }
    }

    // THC %: prefer inventory_potencies[0].thc_potency, fallback percent_thc
    let thcPct: number | undefined
    const potencies = sa.inventory_potencies as Record<string, unknown>[] | undefined
    if (potencies && potencies.length > 0) {
      const pct = Number(potencies[0].thc_potency ?? 0)
      if (pct > 0) thcPct = pct
    }
    if (!thcPct) {
      const raw = Number(sa.percent_thc ?? 0)
      if (raw > 0) thcPct = raw
    }

    const productId = String(item.objectID || sa.product_id || '')
    // Always construct canonical iHeartJane URL — never trust URLs from the API response,
    // which may use custom dispensary domains (e.g. thrivenevada.com).
    const productUrl = productId
      ? `https://iheartjane.com/stores/${storeId}/menu/products/${productId}/${slugify(name)}`
      : undefined

    // Weight extraction priority:
    // 1. net_weight_grams / weight_grams from search_attributes or root item
    // 2. amount field (e.g. "2g", "1g")
    // 3. name parsing (many names contain "[1g]", "[2g]", "[500mg]", etc.)
    // 4. available_weights array (Jane structured size list, e.g. ["1g"] for plain-named carts)
    //
    // KNOWN ISSUES with Jane's net_weight_grams field:
    // - Returns mg instead of g for some vape carts (850mg cart -> net_weight_grams=850)
    // - Returns total pack weight instead of per-unit weight for some products
    //   (e.g. 20-pack of 1.75g pre-rolls -> net_weight_grams=35, name says [1.75g])
    // - Returns values 10x too large for some sub-1g carts (.5g cart -> net_weight_grams=5)
    // - Returns 0 for plain-named products like "Ape" (classic 510 carts) — use available_weights
    // Guard: when name has an explicit parseable weight and net_weight_grams is implausibly
    // larger (>3x), trust the name weight instead.
    let weightGrams: number | undefined
    // sa.weight_grams is a separate field from sa.net_weight_grams on some product types
    const netWt = Number(sa.net_weight_grams ?? sa.weight_grams ?? item.net_weight_grams ?? item.weight_grams ?? 0)
    const nameWeight = parseWeight(name) ?? parseWeight(String(sa.amount || ''))
    if (netWt > 0) {
      // Fix mg-stored-as-grams: net_weight_grams > 100 is always mg for cannabis products
      const netWtNormalized = netWt > 100 ? netWt / 1000 : netWt
      // Fix pack-total / 10x inflation: if name says X but API says >3X, name is per-unit truth
      if (nameWeight && nameWeight > 0 && netWtNormalized / nameWeight > 3) {
        weightGrams = nameWeight
      } else {
        weightGrams = netWtNormalized
      }
    } else if (nameWeight) {
      weightGrams = nameWeight
    } else {
      // Fallback: available_weights is a Jane structured field listing selectable size buckets.
      // Values are unit labels ("gram", "half_gram", "two_gram"), not parseable weight strings.
      // This covers plain-named products (e.g. "Ape" vape carts, loose flower sold per gram).
      const JANE_WEIGHT_MAP: Record<string, number> = {
        half_gram: 0.5,
        gram:      1,
        two_gram:  2,
        eighth:    3.5,
        quarter:   7,
        half:      14,
        ounce:     28,
      }
      const availableWeights = sa.available_weights as string[] | undefined
      if (Array.isArray(availableWeights) && availableWeights.length > 0) {
        const mapped = JANE_WEIGHT_MAP[availableWeights[0]]
        weightGrams = mapped ?? parseWeight(availableWeights[0]) ?? undefined
      }
    }

    result.push({
      name,
      brand:         String(sa.brand ?? ''),
      category:      String(sa.custom_product_type ?? sa.kind ?? ''),
      subcategory:   String(sa.custom_product_subtype ?? sa.root_subtype ?? sa.brand_subtype ?? ''),
      strainType:    String(sa.category ?? ''),  // indica/sativa/hybrid
      thcPercentage: thcPct,
      weightGrams,
      price,
      originalPrice,
      onSale,
      inStock:       sa.at_visible_store !== false && sa.max_cart_quantity !== 0,
      productUrl,
    })
  }

  return result
}

const JANE_API_KEY = 'ce5f15c9-3d09-441d-9bfd-26e87aff5925'
const JANE_DMERCH = `https://dmerch.iheartjane.com/v2/multi?jdm_api_key=${JANE_API_KEY}&jdm_source=monolith&jdm_version=2.16.0`
const JANE_FACETS = `https://dmerch.iheartjane.com/v2/facets?jdm_api_key=${JANE_API_KEY}&jdm_source=monolith&jdm_version=2.16.0`

async function scrapeThrive(
  dispensary: typeof THRIVE_DISPENSARIES[number]
): Promise<InterceptedProduct[]> {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  })
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
  })

  // Navigate to seed browser session/cookies
  console.log(`  🌐 Seeding session: ${dispensary.url}`)
  const seedPage = await context.newPage()
  try {
    await seedPage.goto(dispensary.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await seedPage.waitForTimeout(8000)
  } catch (err) {
    console.error(`  ✗ Navigation failed: ${err}`)
    await browser.close()
    return []
  }

  // Helper: call Jane dmerch API from within browser context
  async function janePost(url: string, body: unknown): Promise<unknown> {
    const page = await context.newPage()
    try {
      return await page.evaluate(async ({ url, body }) => {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!r.ok) return null
        return r.json()
      }, { url, body })
    } finally {
      await page.close()
    }
  }

  // Step 1: Get all kind_root_subtype facets
  const storeId = dispensary.storeId
  const facetsResult = await janePost(JANE_FACETS, {
    appMode: 'framelessEmbed',
    janeDeviceId: 'scraper-001',
    searchFacets: ['kind_root_subtype'],
    searchFilter: '',
    storeId,
  }) as Record<string, unknown> | null

  const kindSubtypeCounts = (facetsResult?.searchFacets as Record<string, Record<string, number>>)?.kind_root_subtype ?? {}
  const subtypes = Object.entries(kindSubtypeCounts)
  console.log(`  📊 Found ${subtypes.length} subcategories`)

  // Step 2: Fetch products for each subcategory (and split by strain if >60)
  const allRaw: Record<string, unknown>[] = []

  async function fetchByFilter(filter: string): Promise<void> {
    const result = await janePost(JANE_DMERCH, {
      app_mode: 'framelessEmbed',
      distinct_id: '$device:scraper-001',
      jane_device_id: 'scraper-001',
      num_columns: 4,
      search_attributes: ['*'],
      store_id: storeId,
      placements: [{
        disable_ads: true,
        page_size: 60,
        placement: 'menu_inline_table',
        search_filter: filter,
        search_sort: 'recommendation',
      }],
      type: 'custom',
    }) as Record<string, unknown> | null

    if (!result) return
    const placements = result.placements as Record<string, unknown>[]
    for (const p of placements) {
      if (p.placement === 'menu_inline_table') {
        const products = (p.products as Record<string, unknown>[]) ?? []
        allRaw.push(...products)
      }
    }
  }

  for (const [subtype, count] of subtypes) {
    // Skip non-cannabis gear/merch
    const kind = subtype.split(':')[0]
    if (kind === 'gear' || kind === 'merch') continue

    const filter = `kind_root_subtype:"${subtype}"`

    if (count <= 60) {
      await fetchByFilter(filter)
    } else {
      // Split by strain type to stay under 60 per request
      for (const strain of ['indica', 'sativa', 'hybrid', 'cbd', 'blend']) {
        await fetchByFilter(`${filter} AND category:${strain}`)
      }
    }
  }

  await seedPage.close()
  await browser.close()

  // Deduplicate by product_id or name
  const seen = new Set<string>()
  const uniqueRaw = allRaw.filter(item => {
    const sa = item.search_attributes as Record<string, unknown> | undefined
    if (!sa?.name) return false
    const key = String(sa.name)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  console.log(`  📦 ${uniqueRaw.length} unique products after dedup`)
  return parseJaneProducts(uniqueRaw, dispensary.storeId)
}

// ─── Curaleaf / Sweed POS scraper ────────────────────────────────────────────

const CURALEAF_DISPENSARIES = [
  { slug: 'curaleaf-nv-las-vegas',       name: 'Curaleaf NV Las Vegas',       url: 'https://curaleaf.com/shop/nevada/curaleaf-nv-las-vegas/recreational' },
  { slug: 'curaleaf-north-las-vegas',    name: 'Curaleaf North Las Vegas',    url: 'https://curaleaf.com/shop/nevada/curaleaf-north-las-vegas/recreational' },
  { slug: 'curaleaf-las-vegas-western',  name: 'Curaleaf Las Vegas Western',  url: 'https://curaleaf.com/shop/nevada/curaleaf-las-vegas-western-ave/recreational' },
]

/**
 * Navigates through all Curaleaf gate layers in sequence.
 *
 * Gate 1 — Age gate (/age-gate?returnurl=...)
 *   Select Nevada, check both boxes, click "I'm over 21"
 *   Cookie is set after this — reused for all subsequent Curaleaf pages in same context.
 *
 * Gate 2 — Dispensary landing page
 *   Click "Shop Adult Menu" / "Adult Use Menu" button
 *
 * Gate 3 — Guest modal
 *   Click "Continue as Guest" / dismiss without email
 *
 * Returns true if all gates passed and product grid is visible, false otherwise.
 */
async function navigateCuraleafGate(page: Page, url: string): Promise<boolean> {
  // ── Navigate to the dispensary URL ──────────────────────────────────────
  console.log(`  🌐 Navigating to ${url}`)
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(3000)
  } catch (err) {
    console.error(`  ✗ [Gate 0] Initial navigation failed: ${err}`)
    return false
  }

  // ── Gate 1: Age gate ─────────────────────────────────────────────────────
  if (page.url().includes('age-gate') || page.url().includes('age_gate')) {
    console.log(`  🔞 [Gate 1] Age gate detected at ${page.url()}`)
    try {
      // State dropdown — Curaleaf uses a custom button-based dropdown, not a <select>
      const stateBtn = page.locator('button, [role="button"], [role="combobox"]')
        .filter({ hasText: /state|select state/i })
        .first()
      await stateBtn.waitFor({ timeout: 8000 })
      await stateBtn.click()
      await page.waitForTimeout(800)

      // Nevada option in the dropdown list
      const nevadaOpt = page.locator('[role="option"], li, button')
        .filter({ hasText: /^nevada$/i })
        .first()
      await nevadaOpt.waitFor({ timeout: 8000 })
      await nevadaOpt.click()
      await page.waitForTimeout(800)
      console.log(`  ✓ [Gate 1] Nevada selected`)

      // Wait for both checkboxes to become enabled, then check them
      const checkboxes = page.locator('input[type="checkbox"]')
      await checkboxes.first().waitFor({ timeout: 8000 })
      const count = await checkboxes.count()
      console.log(`  🔲 [Gate 1] Found ${count} checkbox(es)`)
      for (let i = 0; i < count; i++) {
        const cb = checkboxes.nth(i)
        // Only check if not already checked
        const checked = await cb.isChecked().catch(() => false)
        if (!checked) {
          await cb.click({ force: true })
          await page.waitForTimeout(300)
        }
      }

      // Click the "I'm over 21" / "I am 21+" button
      const over21Btn = page.locator('button, [role="button"]')
        .filter({ hasText: /i.?m over 21|i am 21|over 21/i })
        .first()
      await over21Btn.waitFor({ timeout: 8000 })
      await over21Btn.click()
      await page.waitForTimeout(5000)
      console.log(`  ✓ [Gate 1] Age gate passed → ${page.url()}`)
    } catch (err) {
      console.error(`  ✗ [Gate 1] Age gate failed: ${err}`)
      return false
    }
  } else {
    console.log(`  ✓ [Gate 1] No age gate (cookie already set)`)
  }

  // ── Gate 2: "Shop Adult Menu" button on dispensary landing ───────────────
  console.log(`  🛒 [Gate 2] Looking for adult menu button...`)
  try {
    const shopBtn = page.locator('a, button, [role="button"]')
      .filter({ hasText: /shop adult|adult use|adult menu|recreational menu|shop rec/i })
      .first()
    // If it appears within 8s, click it; otherwise assume already on menu page
    const visible = await shopBtn.isVisible().catch(() => false)
    if (!visible) {
      await shopBtn.waitFor({ timeout: 8000 }).catch(() => null)
    }
    const stillVisible = await shopBtn.isVisible().catch(() => false)
    if (stillVisible) {
      await shopBtn.click()
      await page.waitForTimeout(4000)
      console.log(`  ✓ [Gate 2] Adult menu button clicked → ${page.url()}`)
    } else {
      console.log(`  ✓ [Gate 2] No landing button found — already on menu`)
    }
  } catch (err) {
    // Non-fatal: page may already be on the product menu
    console.log(`  ⚠ [Gate 2] Adult menu button not found (${err}) — continuing`)
  }

  // ── Gate 3: Guest modal ───────────────────────────────────────────────────
  console.log(`  👤 [Gate 3] Looking for guest modal...`)
  try {
    const guestBtn = page.locator('button, [role="button"], a')
      .filter({ hasText: /continue as guest|skip|no thanks|guest/i })
      .first()
    await guestBtn.waitFor({ timeout: 8000 })
    await guestBtn.click()
    await page.waitForTimeout(3000)
    console.log(`  ✓ [Gate 3] Guest modal dismissed`)
  } catch {
    // Non-fatal: modal may not appear if cookie already set
    console.log(`  ✓ [Gate 3] No guest modal (already authenticated as guest)`)
  }

  // ── Confirm product grid is visible ──────────────────────────────────────
  console.log(`  🔍 Waiting for product grid...`)
  try {
    // Curaleaf product cards have a data-testid or contain price elements
    await page.waitForSelector(
      '[data-testid*="product"], [class*="ProductCard"], [class*="product-card"], [class*="ProductGrid"]',
      { timeout: 10000 }
    )
    console.log(`  ✓ Product grid confirmed`)
    return true
  } catch {
    // Fallback: check for any price element as proxy for product grid
    try {
      await page.waitForSelector('[class*="price"], [class*="Price"]', { timeout: 5000 })
      console.log(`  ✓ Product grid confirmed (price elements found)`)
      return true
    } catch {
      console.error(`  ✗ Product grid never appeared — gate sequence may have failed`)
      return false
    }
  }
}


function parseSweedProducts(items: unknown[]): InterceptedProduct[] {
  const products: InterceptedProduct[] = []
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    const p = item as Record<string, unknown>

    const name = String(p.name || p.customName || '')
    if (!name) continue

    const brandObj  = p.brand    as Record<string, unknown> | null
    const catObj    = p.category as Record<string, unknown> | null
    const strainObj = p.strain   as Record<string, unknown> | null

    // Prices live inside variants[].price / variants[].compareAtPrice
    // Each variant = one SKU (e.g. 1g, 3.5g). Create one product per variant.
    const variants = (p.variants as Record<string, unknown>[] | undefined) ?? []

    if (variants.length > 0) {
      for (const v of variants) {
        const price = parseFloat(String(v.price ?? 0))
        if (!price || price <= 0) continue
        const compareAt = parseFloat(String(v.compareAtPrice ?? 0))

        // THC lives on the variant or on the product strain
        const thcRaw = v.thc ?? strainObj?.thc
        const thcPct = thcRaw
          ? parseFloat(String((thcRaw as Record<string, unknown>)?.value ?? thcRaw)) || undefined
          : undefined

        // Build a descriptive name that includes size if multiple variants
        const sizeName = v.name ? ` ${v.name}` : ''
        const fullName = variants.length > 1 ? `${name}${sizeName}` : name

        // Weight: v.name holds the size label (e.g. "3.5g", "1g", "7g")
        const weightGrams = parseWeight(String(v.name || '')) || parseWeight(fullName) || undefined

        products.push({
          name:          fullName,
          brand:         String(brandObj?.name ?? ''),
          category:      String(catObj?.name ?? ''),
          price,
          originalPrice: compareAt > price ? compareAt : undefined,
          onSale:        compareAt > price,
          thcPercentage: thcPct,
          weightGrams,
          inStock:       v.isAvailable !== false && v.inStock !== false,
        })
      }
    } else {
      // Fallback: top-level price fields
      const price = parseFloat(String(p.price ?? 0))
      if (!price || price <= 0) continue
      const compareAt = parseFloat(String(p.compareAtPrice ?? 0))
      products.push({
        name,
        brand:         String(brandObj?.name ?? ''),
        category:      String(catObj?.name ?? ''),
        price,
        originalPrice: compareAt > price ? compareAt : undefined,
        onSale:        compareAt > price,
        weightGrams:   parseWeight(name) || undefined,
        inStock:       p.inStock !== false && p.isAvailable !== false,
      })
    }
  }
  return products
}

async function scrapeCuraleaf(
  context: Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>['newContext']>>,
  dispensary: typeof CURALEAF_DISPENSARIES[number]
): Promise<InterceptedProduct[]> {
  const page = await context.newPage()
  const sweedResponses: { url: string; body: unknown }[] = []

  page.on('response', async response => {
    const url = response.url()
    if (url.includes('sweedpos.com/_api/proxy/Products/')) {
      try {
        const body: unknown = await response.json()
        sweedResponses.push({ url, body })
      } catch { /* not json */ }
    }
  })

  // Navigate through all 3 gate layers (age gate cookie persists in shared context)
  const gateOk = await navigateCuraleafGate(page, dispensary.url)
  if (!gateOk) {
    console.error(`  ✗ Gate sequence failed for ${dispensary.slug}`)
    await page.close()
    return []
  }

  // Scroll to trigger lazy-loaded product carousels / Sweed API calls
  for (let i = 1; i <= 5; i++) {
    await page.evaluate((step) => window.scrollTo(0, (document.body.scrollHeight / 5) * step), i)
    await page.waitForTimeout(600)
  }
  await page.waitForTimeout(3000)

  console.log(`  📡 ${sweedResponses.length} Sweed API responses intercepted`)

  const allProducts: InterceptedProduct[] = []
  for (const r of sweedResponses) {
    const endpoint = r.url.split('/').pop() ?? r.url
    const b = r.body as Record<string, unknown>

    // GetProductCarouselList → root-level array of carousels, each has .products[]
    if (Array.isArray(b)) {
      console.log(`  🔍 [${endpoint}] root array, ${b.length} items`)
      for (const carousel of b) {
        const c = carousel as Record<string, unknown>
        const items = c.products as unknown[] | undefined
        if (Array.isArray(items) && items.length > 0) {
          const firstKeys = Object.keys(items[0] as object).join(', ')
          console.log(`    carousel "${c.name}" → ${items.length} products | keys: ${firstKeys}`)
          allProducts.push(...parseSweedProducts(items))
        }
      }
    } else {
      // Object response: may be wrapped
      const keys = Object.keys(b).join(', ')
      console.log(`  🔍 [${endpoint}] object keys: ${keys}`)
      const items = (b.products ?? b.items ?? b.data) as unknown[] | undefined
      if (Array.isArray(items) && items.length > 0) {
        const firstKeys = Object.keys(items[0] as object).join(', ')
        console.log(`    product array → ${items.length} items | keys: ${firstKeys}`)
        allProducts.push(...parseSweedProducts(items))
      }
    }
  }

  // Deduplicate by name+price (same SKU may appear in multiple carousels)
  const seen = new Set<string>()
  const unique = allProducts.filter(p => {
    const key = `${p.name}|${p.price}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  await page.close()
  return unique
}

async function deleteStaleProducts(dispensaryId: string, scrapedProducts: InterceptedProduct[]): Promise<number> {
  const { data: existing } = await supabase
    .from('products')
    .select('id, name')
    .eq('dispensary_id', dispensaryId)

  const scrapedNames = new Set(scrapedProducts.map(p => p.name))
  const staleIds = (existing ?? [])
    .filter(row => !scrapedNames.has(row.name))
    .map(row => row.id as string)

  if (staleIds.length === 0) return 0

  const { error } = await supabase
    .from('products')
    .delete()
    .in('id', staleIds)

  if (error) {
    console.error(`  ✗ Stale cleanup failed:`, error.message)
    return 0
  }
  return staleIds.length
}

async function main() {
  const janeOnly = process.argv.includes('--jane-only')
  const dutchieOnly = process.argv.includes('--dutchie-only')
  const curaleafOnly = process.argv.includes('--curaleaf-only')

  console.log('🌿 Las Vegas Dispensary Scraper Starting...')
  if (janeOnly) console.log('  Mode: Jane-only')
  if (dutchieOnly) console.log('  Mode: Dutchie-only')
  console.log(`  Targeting ${LAS_VEGAS_DUTCHIE_SLUGS.length + THRIVE_DISPENSARIES.length + CURALEAF_DISPENSARIES.length} dispensaries\n`)

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  let totalProducts = 0
  let totalFailed = 0

  for (const dispensary of LAS_VEGAS_DUTCHIE_SLUGS) {
    if (janeOnly || curaleafOnly) continue
    if (TEST_MODE && !TEST_SLUGS.includes(dispensary.slug)) {
      console.log(`  ⏭ TEST_MODE: skipping ${dispensary.slug}`)
      continue
    }
    if (SKIP_WORKING && WORKING_SLUGS.includes(dispensary.slug)) {
      console.log(`  ⏭ Skipping ${dispensary.slug} (already working)`)
      continue
    }
    console.log(`\n🏪 Scraping: ${dispensary.slug}`)

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })
    const page = await context.newPage()

    // Scrape products
    const products = await interceptDutchieProducts(page, dispensary.slug, dispensary.path)

    if (products.length === 0) {
      console.log(`  ⚠ No products found for ${dispensary.slug}`)
      await context.close()
      continue
    }

    // Get dispensary name from page
    const name = await getDispensaryName(page, dispensary.slug)
    await context.close()

    console.log(`  ✓ Found ${products.length} products — "${name}"`)

    // Upsert dispensary
    const dispensaryId = await upsertDispensary(dispensary.slug, dispensary.path, name)
    if (!dispensaryId) continue

    // Upsert products
    const results = await upsertProducts(dispensaryId, products, 'dutchie')
    console.log(`  ✓ Saved: ${results.inserted} new, ${results.updated} updated (${results.failed} failed)`)

    const deleted = await deleteStaleProducts(dispensaryId, products)
    if (deleted > 0) console.log(`  🗑 Removed ${deleted} stale/out-of-stock products`)

    totalProducts += results.inserted + results.updated
    totalFailed += results.failed

    // Polite delay between dispensaries
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // ── Thrive (iHeartJane) ───────────────────────────────────────────────────
  if (!dutchieOnly && !curaleafOnly) {
  console.log('\n\n══ iHeartJane ══')
  for (const dispensary of THRIVE_DISPENSARIES) {
    if (TEST_MODE && !TEST_SLUGS.includes(dispensary.slug)) {
      console.log(`  ⏭ TEST_MODE: skipping ${dispensary.slug}`)
      continue
    }
    console.log(`\n🏪 Scraping: ${dispensary.slug}`)
    const products = await scrapeThrive(dispensary)

    if (products.length === 0) {
      console.log(`  ⚠ No products found for ${dispensary.slug}`)
      continue
    }
    console.log(`  ✓ Found ${products.length} products — "${dispensary.name}"`)

    const dispensaryId = await upsertDispensaryJane(dispensary.slug, dispensary.name)
    if (!dispensaryId) continue

    const results = await upsertProducts(dispensaryId, products, 'jane')
    console.log(`  ✓ Saved: ${results.inserted} new, ${results.updated} updated (${results.failed} failed)`)

    const deleted = await deleteStaleProducts(dispensaryId, products)
    if (deleted > 0) console.log(`  🗑 Removed ${deleted} stale/out-of-stock products`)

    totalProducts += results.inserted + results.updated
    totalFailed += results.failed

    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  } // end !dutchieOnly

  // ── Curaleaf (Sweed POS) ──────────────────────────────────────────────────
  if (!janeOnly && !dutchieOnly) {
  console.log('\n\n══ Curaleaf (Sweed POS) ══')
  if (curaleafOnly) console.log('  Mode: Curaleaf-only')

  // Single persistent context shared across all Curaleaf stores so the age gate
  // cookie (set on the first store) carries through to subsequent stores.
  const curaleafContext = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  })

  for (const dispensary of CURALEAF_DISPENSARIES) {
    if (TEST_MODE && !TEST_SLUGS.includes(dispensary.slug)) {
      console.log(`  ⏭ TEST_MODE: skipping ${dispensary.slug}`)
      continue
    }
    console.log(`\n🏪 Scraping: ${dispensary.slug}`)
    const products = await scrapeCuraleaf(curaleafContext, dispensary)

    if (products.length === 0) {
      console.log(`  ⚠ No products found for ${dispensary.slug}`)
      continue
    }
    console.log(`  ✓ Found ${products.length} products — "${dispensary.name}"`)

    const dispensaryId = await upsertDispensary(dispensary.slug, 'dispensary', dispensary.name)
    if (!dispensaryId) continue

    const results = await upsertProducts(dispensaryId, products, 'curaleaf')
    console.log(`  ✓ Saved: ${results.inserted} new, ${results.updated} updated (${results.failed} failed)`)

    const deleted = await deleteStaleProducts(dispensaryId, products)
    if (deleted > 0) console.log(`  🗑 Removed ${deleted} stale/out-of-stock products`)

    totalProducts += results.inserted + results.updated
    totalFailed += results.failed

    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  await curaleafContext.close()
  } // end !janeOnly && !dutchieOnly

  await browser.close()

  console.log('\n=====================================')
  console.log('✓ Scrape Complete')
  console.log(`  Total products saved: ${totalProducts}`)
  console.log(`  Total failed: ${totalFailed}`)
  console.log('=====================================')
}

main().catch(console.error)