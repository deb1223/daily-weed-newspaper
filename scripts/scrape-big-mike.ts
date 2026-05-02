/**
 * Big Mike's Deals Scraper
 *
 * Playwright vision agent that targets chain dispensary deals pages,
 * extracts active promotions, calculates verified savings against the
 * floor price database, and writes ranked deals to the `promotions` table.
 *
 * Run: npx tsx scripts/scrape-big-mike.ts
 * Cron: /api/scrape-big-mike at 7am Las Vegas time (14:00 UTC)
 */

import { chromium, type Browser, type Page } from "playwright";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ── Clients ───────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_KEY! // service role — bypasses RLS
);

// ── Dispensary target list ────────────────────────────────────────────────────
// Only confirmed-accessible public deals pages. IDs sourced from dispensaries table.

const DISPENSARY_TARGETS = [
  // The Source — iHeartJane Bloom platform, store IDs confirmed 2026-04-25
  {
    name: "The Source - Henderson Eastern",
    dispensary_id: "284be6a4-f014-4b04-8a8a-62679870f93f",
    deals_url: "https://www.thesourcenv.com/menu/store/3013/deals",
  },
  {
    name: "The Source - Las Vegas Rainbow",
    dispensary_id: "ff6e6d03-bad7-4c70-ae27-17704891b810",
    deals_url: "https://www.thesourcenv.com/menu/store/3012/deals",
  },
  {
    name: "The Source - Henderson Water St",
    dispensary_id: "2c0905dc-9d85-4804-b5d4-0a6dfcec7152",
    deals_url: "https://www.thesourcenv.com/menu/store/6922/deals",
  },
  {
    name: "The Source - North LV Deer Springs",
    dispensary_id: "53c5df48-9c8b-4f16-a28e-db5d6c6a7d9c",
    deals_url: "https://www.thesourcenv.com/menu/store/3104/deals",
  },
  // Deep Roots Harvest — iHeartJane Bloom platform
  {
    name: "Deep Roots Harvest - Cheyenne",
    dispensary_id: "6315eaf4-c764-4a6e-9080-d615e0401676",
    deals_url: "https://www.deeprootsharvest.com/menu/store/6149/deals",
  },
  {
    // Wallflower Cannabis House (22b2696b-837f-4270-87f7-8067afe403e4) is same physical location — using Deep Roots entry only
    name: "Deep Roots Harvest - Blue Diamond",
    dispensary_id: "1be7aa55-c853-46b3-b75f-f5716bf549a7",
    deals_url: "https://www.deeprootsharvest.com/menu/store/6526/deals",
  },
  // Commented out until deal page structure is confirmed:
  // { name: "Planet 13 Las Vegas", dispensary_id: "f03c5206-5f60-4337-af1b-ec6d4b601a17",
  //   deals_url: "https://www.planet13lasvegas.com/deals" },
  // { name: "RISE Dispensary", dispensary_id: null, deals_url: "https://risedispensaries.com/las-vegas/deals" },
  // Store 4606 = The Source Pahrump — outside Las Vegas market, omitted
];

// ── Types ─────────────────────────────────────────────────────────────────────

type DealType = "bundle" | "bogo" | "pct_off" | "flat_off";
type Confidence = "verified" | "estimated";

interface ExtractedDeal {
  headline: string;
  deal_type: DealType;
  deal_price: number | null;
  discount_pct: number | null;
  flat_amount: number | null;
  n_items: number | null;           // for bundles: N items for $X
  eligible_category: string;
  click_required: boolean;
  deal_link: string | null;
}

interface EligibleItem {
  name: string;
  brand: string;
  weight_grams: number | null;
  category: string;
  listed_price: number;
  floor_price: number;
  floor_confidence: Confidence;
  matched_name: string | null;
}

interface ProcessedDeal {
  dispensary_name: string;
  dispensary_id: string | null;
  deal_headline: string;
  deal_type: DealType;
  deal_price: number | null;
  deal_json: {
    top_items: Array<{
      name: string;
      brand: string;
      floor_price: number;
      matched_name: string | null;
      confidence: Confidence;
    }>;
    total_floor_value: number;
    eligible_category: string;
    n_items?: number;
    discount_pct?: number;
  };
  verified_savings: number;
  confidence: Confidence;
  active_date: string;
  deal_url: string | null;
}

// ── Vision helpers ────────────────────────────────────────────────────────────

async function screenshotToBase64(page: Page): Promise<string> {
  const buf = await page.screenshot({ type: "jpeg", quality: 75, fullPage: false });
  return buf.toString("base64");
}

async function visionConfirmDealsPage(page: Page): Promise<{
  is_deals_page: boolean;
  deal_cards_visible: number;
  page_structure: string;
  notes: string;
}> {
  const b64 = await screenshotToBase64(page);
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: b64 },
          },
          {
            type: "text",
            text: `You are analyzing a cannabis dispensary deals page screenshot.
Return JSON only, no preamble:
{
  "is_deals_page": boolean,
  "deal_cards_visible": number,
  "page_structure": "deals_on_page" | "click_to_subpage" | "login_required" | "empty" | "error",
  "notes": "brief observation if anything unusual"
}`,
          },
        ],
      },
    ],
  });

  const raw = msg.content.find((b) => b.type === "text")?.text ?? "{}";
  try {
    return JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim());
  } catch {
    console.warn("  [vision] confirm parse failed:", raw.slice(0, 200));
    return { is_deals_page: false, deal_cards_visible: 0, page_structure: "error", notes: raw.slice(0, 100) };
  }
}

async function visionExtractDeals(page: Page, dispensaryUrl: string): Promise<ExtractedDeal[]> {
  const b64 = await screenshotToBase64(page);
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: b64 },
          },
          {
            type: "text",
            text: `You are extracting deal information from a cannabis dispensary deals page.
Return JSON only, no preamble. Extract every deal visible:
{
  "deals": [
    {
      "headline": "deal title/name",
      "deal_type": "bundle" | "bogo" | "pct_off" | "flat_off",
      "deal_price": number | null,
      "discount_pct": number | null,
      "flat_amount": number | null,
      "n_items": number | null,
      "eligible_category": "flower" | "concentrate" | "cart" | "edible" | "pre_roll" | "all" | "mixed",
      "click_required": boolean,
      "deal_link": "url if visible, else null"
    }
  ]
}`,
          },
        ],
      },
    ],
  });

  const raw = msg.content.find((b) => b.type === "text")?.text ?? '{"deals":[]}';
  try {
    const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim());
    return (parsed.deals ?? []) as ExtractedDeal[];
  } catch {
    console.warn("  [vision] deal extraction parse failed:", raw.slice(0, 200));
    return [];
  }
}

async function visionExtractItems(page: Page): Promise<EligibleItem[]> {
  const b64 = await screenshotToBase64(page);
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: b64 },
          },
          {
            type: "text",
            text: `You are extracting product information from a cannabis dispensary page.
Return JSON only, no preamble. Extract every product visible:
{
  "items": [
    {
      "name": "product name",
      "brand": "brand name",
      "weight_grams": number | null,
      "category": "flower" | "concentrate" | "cart" | "edible" | "pre_roll" | "other",
      "listed_price": number
    }
  ]
}`,
          },
        ],
      },
    ],
  });

  const raw = msg.content.find((b) => b.type === "text")?.text ?? '{"items":[]}';
  try {
    const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim());
    return (parsed.items ?? []).map((item: Omit<EligibleItem, "floor_price" | "floor_confidence" | "matched_name">) => ({
      ...item,
      floor_price: item.listed_price,
      floor_confidence: "estimated" as Confidence,
      matched_name: null,
    }));
  } catch {
    console.warn("  [vision] item extraction parse failed:", raw.slice(0, 200));
    return [];
  }
}

// ── LLM deal classifier ───────────────────────────────────────────────────────
// Takes raw headline strings (from DOM or any source) and returns structured deals.
// Handles all four deal types without regex.

async function llmClassifyDeals(rawHeadlines: string[]): Promise<ExtractedDeal[]> {
  if (rawHeadlines.length === 0) return [];

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are parsing cannabis dispensary deal headlines. Classify each into structured JSON.

Deal types:
- "bundle": N items for $X total (e.g. "3 for $30", "2 for $50 on 1g carts")
- "bogo": buy one get one free or discounted
- "pct_off": percentage discount (e.g. "20% off all flower")
- "flat_off": fixed dollar amount off (e.g. "$5 off any pre-roll")

Headlines:
${rawHeadlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Return JSON only, one entry per headline, preserving order:
{
  "deals": [
    {
      "headline": "original headline text",
      "deal_type": "bundle" | "bogo" | "pct_off" | "flat_off",
      "deal_price": <bundle total price as number, else null>,
      "discount_pct": <percentage as number 0-100, else null>,
      "flat_amount": <dollar amount off as number, else null>,
      "n_items": <number of items in bundle, else null>,
      "eligible_category": "flower" | "concentrate" | "cart" | "edible" | "pre_roll" | "all" | "mixed",
      "click_required": false,
      "deal_link": null
    }
  ]
}`,
      },
    ],
  });

  const raw = msg.content.find((b) => b.type === "text")?.text ?? '{"deals":[]}';
  try {
    const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim());
    return (parsed.deals ?? []) as ExtractedDeal[];
  } catch {
    console.warn("  [llm-classify] parse failed:", raw.slice(0, 200));
    return [];
  }
}

// ── DOM extraction ────────────────────────────────────────────────────────────

async function domExtractDeals(page: Page): Promise<ExtractedDeal[]> {
  try {
    return await page.$$eval(
      '[class*="deal"], [class*="promo"], [class*="offer"], [class*="bundle"], [class*="special"], [data-testid*="deal"], [data-testid*="special"]',
      (els) =>
        els.slice(0, 20).map((el) => ({
          headline: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 200),
          deal_type: "bundle" as const,
          deal_price: null,
          discount_pct: null,
          flat_amount: null,
          n_items: null,
          eligible_category: "all",
          click_required: false,
          deal_link: (el.querySelector("a") as HTMLAnchorElement | null)?.href ?? null,
        }))
    );
  } catch {
    return [];
  }
}

async function domExtractItems(page: Page): Promise<Array<Omit<EligibleItem, "floor_price" | "floor_confidence" | "matched_name">>> {
  try {
    return await page.$$eval(
      '[data-testid="product-card"], [class*="product-card"], [class*="productCard"]',
      (els) =>
        els.slice(0, 30).map((el) => {
          const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();

          // Extract price — first $X.XX pattern
          const priceM = text.match(/\$([\d.]+)/);
          const listed_price = priceM ? parseFloat(priceM[1]) : 0;

          // Extract weight — "1g", "3.5g", "14g" etc.
          const weightM = text.match(/([\d.]+)\s*g\b/i);
          const weight_grams = weightM ? parseFloat(weightM[1]) : null;

          // Product name from data-testid="product-name" or first meaningful text chunk
          const nameEl = el.querySelector('[data-testid="product-name"]');
          const name = nameEl?.textContent?.trim() ?? text.slice(0, 60);

          // Category inference
          const lc = text.toLowerCase();
          const category = lc.includes("vape") || lc.includes("cart") ? "cart"
            : lc.includes("flower") ? "flower"
            : lc.includes("edible") || lc.includes("gummy") ? "edible"
            : lc.includes("pre-roll") || lc.includes("preroll") ? "pre_roll"
            : lc.includes("concentrate") || lc.includes("wax") || lc.includes("resin") ? "concentrate"
            : "other";

          return { name, brand: "", weight_grams, category, listed_price };
        })
    );
  } catch {
    return [];
  }
}

// ── Floor price lookup ────────────────────────────────────────────────────────

async function getFloorPrice(
  productName: string,
  brand: string,
  weightGrams: number | null
): Promise<{ floor_price: number; confidence: Confidence; matched_name: string | null }> {
  // Try: brand + first 3 words of product name
  const nameWords = productName.split(" ").slice(0, 3).join(" ");

  let query = supabase
    .from("products")
    .select("name, brand, price, weight_grams")
    .order("price", { ascending: true })
    .limit(1);

  if (brand) query = query.ilike("brand", `%${brand}%`);
  if (nameWords) query = query.ilike("name", `%${nameWords}%`);
  if (weightGrams) {
    const lo = weightGrams * 0.85;
    const hi = weightGrams * 1.15;
    query = query.gte("weight_grams", lo).lte("weight_grams", hi);
  }

  const { data: rows } = await query;

  if (rows && rows.length > 0) {
    return {
      floor_price: Number(rows[0].price),
      confidence: "verified",
      matched_name: rows[0].name as string,
    };
  }

  // Fallback: brand only
  if (brand) {
    let fallback = supabase
      .from("products")
      .select("name, price")
      .ilike("brand", `%${brand}%`)
      .order("price", { ascending: true })
      .limit(1);
    if (weightGrams) {
      const lo = weightGrams * 0.85;
      const hi = weightGrams * 1.15;
      fallback = fallback.gte("weight_grams", lo).lte("weight_grams", hi);
    }
    const { data: fallbackRows } = await fallback;
    if (fallbackRows && fallbackRows.length > 0) {
      return {
        floor_price: Number(fallbackRows[0].price),
        confidence: "verified",
        matched_name: fallbackRows[0].name as string,
      };
    }
  }

  return { floor_price: 0, confidence: "estimated", matched_name: null };
}

async function enrichItemsWithFloor(items: Array<Omit<EligibleItem, "floor_price" | "floor_confidence" | "matched_name">>): Promise<EligibleItem[]> {
  return Promise.all(
    items.map(async (item) => {
      const { floor_price, confidence, matched_name } = await getFloorPrice(
        item.name,
        item.brand,
        item.weight_grams
      );
      return {
        ...item,
        floor_price: floor_price > 0 ? floor_price : item.listed_price,
        floor_confidence: confidence,
        matched_name,
      };
    })
  );
}

// ── Savings calculation ───────────────────────────────────────────────────────

function calculateSavings(
  deal: ExtractedDeal,
  items: EligibleItem[]
): { savings: number; deal_price: number; top_items: EligibleItem[]; total_floor: number } | null {
  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => b.floor_price - a.floor_price);

  switch (deal.deal_type) {
    case "bundle": {
      const n = deal.n_items ?? Math.min(sorted.length, 3);
      const topN = sorted.slice(0, n);
      const total_floor = topN.reduce((s, i) => s + i.floor_price, 0);
      const deal_price = deal.deal_price ?? total_floor;
      const savings = total_floor - deal_price;
      if (savings <= 0) return null;
      return { savings, deal_price, top_items: topN, total_floor };
    }
    case "bogo": {
      if (sorted.length < 2) return null;
      const [first, second] = sorted;
      const total_floor = first.floor_price + second.floor_price;
      const deal_price = first.floor_price; // pay for most expensive
      const savings = second.floor_price;
      return { savings, deal_price, top_items: [first, second], total_floor };
    }
    case "pct_off": {
      const pct = deal.discount_pct ?? 0;
      if (!pct) return null;
      const best = sorted[0];
      const savings = best.floor_price * (pct / 100);
      if (savings <= 0) return null;
      return { savings, deal_price: best.floor_price - savings, top_items: [best], total_floor: best.floor_price };
    }
    case "flat_off": {
      const flat = deal.flat_amount ?? 0;
      if (!flat) return null;
      const best = sorted[0];
      return { savings: flat, deal_price: best.floor_price - flat, top_items: [best], total_floor: best.floor_price };
    }
  }
}

// ── Per-dispensary scraper ────────────────────────────────────────────────────

async function scrapeDispensary(
  target: typeof DISPENSARY_TARGETS[number],
  browser: Browser,
  today: string
): Promise<ProcessedDeal[]> {
  const results: ProcessedDeal[] = [];
  const page = await browser.newPage();

  try {
    console.log(`\n[${target.name}] navigating to ${target.deals_url}`);
    await page.goto(target.deals_url, { waitUntil: "networkidle", timeout: 30_000 });

    // ── Vision confirmation pass ──────────────────────────────────────────
    const confirm = await visionConfirmDealsPage(page);
    console.log(`  [confirm] is_deals_page=${confirm.is_deals_page} cards=${confirm.deal_cards_visible} structure=${confirm.page_structure}`);

    if (!confirm.is_deals_page || confirm.page_structure === "login_required" || confirm.page_structure === "error") {
      console.log(`  [SKIP] ${target.name}: ${confirm.notes}`);
      return [];
    }

    if (confirm.page_structure === "empty") {
      console.log(`  [SKIP] ${target.name}: no deals visible`);
      return [];
    }

    // ── DOM extraction → LLM classify; vision fallback ───────────────────
    const domRaw = await domExtractDeals(page);
    let deals: ExtractedDeal[] = [];

    if (domRaw.length === 0) {
      console.log("  [dom] 0 results — falling back to vision extraction");
      deals = await visionExtractDeals(page, target.deals_url);
    } else {
      // DOM catches nested elements (parent card + type label + text) — deduplicate
      // before sending to LLM. Keep the longest unique headline per ~content group,
      // strip bare type-label fragments ("Product", "Bundle", etc.).
      const BARE_LABELS = /^(product|bundle|bogo|deal|offer|promo|special)\.?$/i;
      // Strip Bloom platform type-label prefixes ("Bundle", "Product") that get
      // concatenated onto the front of deal text in the DOM.
      const TYPE_PREFIX = /^(bundle|product|bogo|deal|offer|promo|special)\s*/i;
      const seen = new Set<string>();
      // Sort ascending by length so shorter (atomic) headlines register in `seen`
      // first — the long concatenated parent element then gets dropped as a superstring.
      const headlines = [...domRaw.map((d) => d.headline)]
        .sort((a, b) => a.length - b.length)
        .filter((h) => h.length > 8 && !BARE_LABELS.test(h.trim()))
        .filter((h) => {
          // Normalise: strip type prefix, collapse whitespace, lowercase
          const norm = h.replace(/\s+/g, " ").trim().toLowerCase().replace(TYPE_PREFIX, "");
          for (const s of seen) {
            if (s.startsWith(norm) || norm.startsWith(s)) return false;
          }
          seen.add(norm);
          return true;
        });

      console.log(`  [dom] ${domRaw.length} raw → ${headlines.length} unique headlines — classifying with LLM`);
      deals = await llmClassifyDeals(headlines);
      console.log(`  [llm-classify] ${deals.length} deals classified`);

      // Supplement with vision if LLM under-extracts vs confirmed card count
      if (confirm.deal_cards_visible > 0 && deals.length < confirm.deal_cards_visible / 2) {
        console.log("  [llm-classify] count mismatch — supplementing with vision extraction");
        const visionDeals = await visionExtractDeals(page, target.deals_url);
        if (visionDeals.length > deals.length) deals = visionDeals;
      }
    }

    console.log(`  [deals] ${deals.length} deals to process`);

    // ── Process each deal ─────────────────────────────────────────────────
    for (const deal of deals) {
      if (!deal.headline || deal.headline.length < 3) continue;

      let items: EligibleItem[] = [];

      if (deal.click_required && deal.deal_link) {
        // Navigate to deal sub-page to get eligible items
        const dealPage = await browser.newPage();
        try {
          await dealPage.goto(deal.deal_link, { waitUntil: "networkidle", timeout: 20_000 });
          const rawItems = await domExtractItems(dealPage);
          if (rawItems.length === 0) {
            const visionItems = await visionExtractItems(dealPage);
            items = await enrichItemsWithFloor(
              visionItems.map((i) => ({ name: i.name, brand: i.brand, weight_grams: i.weight_grams, category: i.category, listed_price: i.listed_price }))
            );
          } else {
            items = await enrichItemsWithFloor(rawItems);
          }
        } catch (err) {
          console.warn(`  [deal] failed to navigate to ${deal.deal_link}: ${(err as Error).message}`);
        } finally {
          await dealPage.close();
        }
      } else {
        // Items are on the current page (bundles for current products)
        const rawItems = await domExtractItems(page);
        if (rawItems.length > 0) {
          items = await enrichItemsWithFloor(rawItems);
        }
      }

      // Calculate savings
      const calc = calculateSavings(deal, items);
      if (!calc || calc.savings <= 0) {
        console.log(`  [deal] "${deal.headline.slice(0, 60)}" — no positive savings, skipping`);
        continue;
      }

      // Overall confidence: verified only if all top items are verified
      const confidence: Confidence = calc.top_items.every((i) => i.floor_confidence === "verified")
        ? "verified"
        : "estimated";

      const processed: ProcessedDeal = {
        dispensary_name: target.name,
        dispensary_id: target.dispensary_id,
        deal_headline: deal.headline.slice(0, 500),
        deal_type: deal.deal_type,
        deal_price: calc.deal_price,
        deal_json: {
          top_items: calc.top_items.map((i) => ({
            name: i.name,
            brand: i.brand,
            floor_price: i.floor_price,
            matched_name: i.matched_name,
            confidence: i.floor_confidence,
          })),
          total_floor_value: calc.total_floor,
          eligible_category: deal.eligible_category,
          ...(deal.n_items ? { n_items: deal.n_items } : {}),
          ...(deal.discount_pct ? { discount_pct: deal.discount_pct } : {}),
        },
        verified_savings: Math.round(calc.savings * 100) / 100,
        confidence,
        active_date: today,
        deal_url: deal.deal_link ?? target.deals_url,
      };

      results.push(processed);
      console.log(
        `  [deal] "${deal.headline.slice(0, 60)}" — $${calc.savings.toFixed(2)} savings [${confidence}]`
      );
    }
  } catch (err) {
    console.error(`  [ERROR] ${target.name}: ${(err as Error).message}`);
  } finally {
    await page.close();
  }

  return results;
}

// ── Supabase write ────────────────────────────────────────────────────────────

async function writeToSupabase(deals: ProcessedDeal[], today: string): Promise<void> {
  // Mark stale deals from previous days as inactive
  const { error: staleErr } = await supabase
    .from("promotions")
    .update({ is_active: false })
    .lt("active_date", today)
    .eq("is_active", true);

  if (staleErr) console.warn("[supabase] stale update error:", staleErr.message);

  // Upsert today's deals
  let written = 0;
  for (const deal of deals) {
    const { error } = await supabase.from("promotions").upsert(
      {
        dispensary_name: deal.dispensary_name,
        dispensary_id: deal.dispensary_id,
        deal_headline: deal.deal_headline,
        deal_type: deal.deal_type,
        deal_price: deal.deal_price,
        deal_json: deal.deal_json,
        verified_savings: deal.verified_savings,
        confidence: deal.confidence,
        active_date: deal.active_date,
        deal_url: deal.deal_url,
        is_active: true,
      },
      { onConflict: "dispensary_name,deal_headline,active_date" }
    );

    if (error) {
      console.error(`  [supabase] write failed for "${deal.deal_headline.slice(0, 60)}": ${error.message}`);
    } else {
      written++;
    }
  }

  console.log(`\nWrote ${written}/${deals.length} deals to Supabase.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().split("T")[0];
  console.log(`Big Mike scraper starting — ${today}\n`);

  const browser = await chromium.launch({ headless: true });
  const allDeals: ProcessedDeal[] = [];

  for (const target of DISPENSARY_TARGETS) {
    try {
      const deals = await scrapeDispensary(target, browser, today);
      allDeals.push(...deals);
    } catch (err) {
      console.error(`[SKIP] ${target.name}: ${(err as Error).message}`);
    }
  }

  await browser.close();

  // Rank: verified first, then by savings descending
  const ranked = allDeals.sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return a.confidence === "verified" ? -1 : 1;
    }
    return b.verified_savings - a.verified_savings;
  });

  // Console summary
  const verified = ranked.filter((d) => d.confidence === "verified");
  const estimated = ranked.filter((d) => d.confidence === "estimated");

  console.log("\n── Ranked deals ───────────────────────────────────────────────");
  for (const d of ranked) {
    const tag = d.confidence === "verified" ? "[VERIFIED]" : "[ESTIMATED]";
    const floor = d.deal_json.total_floor_value;
    const deal = d.deal_price ?? 0;
    console.log(
      `${tag} ${d.dispensary_name} — ${d.deal_headline.slice(0, 60)}: $${d.verified_savings.toFixed(2)} savings | floor $${floor.toFixed(2)} → deal $${deal.toFixed(2)}`
    );
  }

  // Write to Supabase
  if (ranked.length > 0) {
    await writeToSupabase(ranked, today);
  } else {
    console.log("\nNo deals found — nothing to write.");
  }

  console.log(
    `\nBig Mike run complete. ${DISPENSARY_TARGETS.length} dispensaries scraped. ${ranked.length} deals found. ${verified.length} verified, ${estimated.length} estimated. Wrote to Supabase.`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
