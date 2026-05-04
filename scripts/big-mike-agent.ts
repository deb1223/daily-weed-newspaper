/**
 * Big Mike Agent — daily deal commentary for dailyweednewspaper.com
 *
 * Scrapes iHeartJane SSR deal pages → scores candidates against Supabase
 * floor prices → generates Big Mike commentary via Claude → saves to daily_briefs.
 *
 * Run: npx tsx scripts/big-mike-agent.ts
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ── Supabase + Anthropic clients ──────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_KEY! // service role — bypasses RLS
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ── Store config ──────────────────────────────────────────────────────────────

type JaneStore = {
  name: string;
  id: number;
  domain: string;
};

const JANE_STORES: JaneStore[] = [
  { name: "Deep Roots Harvest - Cheyenne",     id: 6149, domain: "deeprootsharvest.com" },
  { name: "Deep Roots Harvest - Blue Diamond", id: 6526, domain: "deeprootsharvest.com" },
  { name: "The Source - Las Vegas",            id: 3012, domain: "thesourcenv.com"      },
  { name: "The Source - North Las Vegas",      id: 3013, domain: "thesourcenv.com"      },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type DealCandidate = {
  brand: string;
  product_name: string;
  sale_price: number;
  original_price: number | null;
  weight_grams: number | null;
  category: string;
  dispensary_name: string;
  deal_label: string | null;
  thc_percentage: number | null;
  is_bundle: boolean;  // true = came from bundle/promo card, false = single product card
};

type DealTier = "floor_beater" | "brand_best";

type QualifiedDeal = DealCandidate & {
  floor_price: number;       // whichever floor was beaten (category preferred)
  savings_pct: number;
  deal_tier: DealTier;
  category_floor: number | null;
  brand_floor: number | null;
  category_sample_size: number;
  brand_sample_size: number;
};

type DealGroup = {
  representative: QualifiedDeal;  // highest THC deal in the group
  variant_count: number;          // total strains at this dispensary/price/category
};

type MikeCommentary = {
  deal_summary: string;
  commentary: string;
  savings_pct: number;
  dispensary_name: string;
  deal_tier: DealTier;
};

// ── Category inference ────────────────────────────────────────────────────────

function inferCategory(text: string): string {
  const lc = text.toLowerCase();
  if (lc.includes("disposable") || lc.includes("cartridge") || lc.includes("cart") || lc.includes("vape")) return "vape";
  if (lc.includes("pre-roll") || lc.includes("preroll") || lc.includes("pre roll") || lc.includes("infused preroll") || lc.includes("infused pre")) return "pre_roll";
  if (lc.includes("concentrate") || lc.includes("live resin") || lc.includes("cured resin") || lc.includes("wax") || lc.includes("rosin") || lc.includes("extract")) return "concentrate";
  if (lc.includes("edible") || lc.includes("gumm") || lc.includes("chocolate") || lc.includes("candy")) return "edible";
  if (lc.includes("tincture")) return "tincture";
  if (lc.includes("topical")) return "topical";
  // Flower indicators: eighths, ounce, gram flower
  if (lc.includes("eighth") || lc.includes("ounce") || lc.includes("flower") || lc.includes("bud")) return "flower";
  return "flower"; // default fallback for unclassified — flower is most common
}

// ── Weight parser ─────────────────────────────────────────────────────────────

function parseWeight(label: string): number | null {
  const s = label.trim().toUpperCase();
  // Fractions
  if (/^1\/8\s*(OZ|G)?$/.test(s) || s === "3.5G" || s === "3.5 G") return 3.5;
  if (/^1\/4\s*(OZ|G)?$/.test(s) || s === "7G" || s === "7 G") return 7;
  if (/^1\/2\s*OZ$/.test(s) || s === "14G" || s === "14 G") return 14;
  if (/^1\s*OZ$/.test(s) || s === "28G" || s === "28 G") return 28;
  if (/^1\/2\s*G$/.test(s) || s === "0.5G" || s === "0.5 G" || s === ".5G" || s === ".5 G") return 0.5;
  if (/^1\s*G$/.test(s) || s === "1G") return 1;
  if (/^2\s*G$/.test(s) || s === "2G") return 2;
  if (/^0\.3\s*G$/.test(s) || s === ".3G" || s === "0.3G") return 0.3;

  // Numeric prefix: "3.5G", "2G", "14G"
  const m = s.match(/^(\d+(?:\.\d+)?)\s*G$/);
  if (m) return parseFloat(m[1]);

  return null;
}

// ── HTML parser — iHeartJane / Bloom platform ────────────────────────────────

/** Strip all HTML tags and collapse whitespace */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Parse all product cards from iHeartJane Bloom-platform SSR HTML.
 */
function parseProductCards(html: string, dispensaryName: string): DealCandidate[] {
  const results: DealCandidate[] = [];

  const cardStarts: number[] = [];
  let pos = 0;
  while (true) {
    const idx = html.indexOf('data-testid="product-card"', pos);
    if (idx === -1) break;
    cardStarts.push(idx);
    pos = idx + 1;
  }

  for (let i = 0; i < cardStarts.length; i++) {
    const start = cardStarts[i];
    const end = cardStarts[i + 1] ?? start + 6000;
    const cardHtml = html.slice(start, end);
    const cardText = stripTags(cardHtml);

    const nameM = cardHtml.match(/data-testid="product-name"[^>]*>([^<]+)/);
    if (!nameM) continue;
    const product_name = nameM[1].trim();

    const lc = cardText.toLowerCase();
    if (
      lc.includes("trucker hat") ||
      lc.includes(" hat ") ||
      lc.includes("merchandise") ||
      (lc.includes("merch") && !lc.includes("g thc"))
    ) continue;

    const namePos = cardText.indexOf(product_name);
    if (namePos === -1) continue;
    const afterName = cardText.slice(namePos + product_name.length).trim();
    const brandM = afterName.match(/^([A-Za-z][A-Za-z0-9&\s\-'.]{1,40}?)(?=\s+(?:THC|CBD|Indoor|Outdoor|Greenhouse|Sativa|Indica|Hybrid|Gummies|Mylar|\d|$))/);
    if (!brandM) continue;
    const brand = brandM[1].trim();
    if (!brand || brand.length < 2) continue;

    const normalizedPrices = [...cardText.matchAll(/\$([\d.]+)\/([\d.]+)g/gi)].map((m) => ({
      price: parseFloat(m[1]),
      weight_grams: parseFloat(m[2]),
    }));

    if (normalizedPrices.length === 0) continue;

    const byWeight = new Map<number, number[]>();
    for (const { price, weight_grams } of normalizedPrices) {
      if (!byWeight.has(weight_grams)) byWeight.set(weight_grams, []);
      byWeight.get(weight_grams)!.push(price);
    }

    let chosenWeight: number | null = null;
    let sale_price: number | null = null;
    let original_price: number | null = null;

    for (const [wg, prices] of [...byWeight.entries()].sort((a, b) => a[0] - b[0])) {
      if (prices.length >= 2) {
        const [p1, p2] = prices;
        if (p1 < p2) {
          chosenWeight = wg;
          sale_price = p1;
          original_price = p2;
          break;
        }
      } else if (prices.length === 1) {
        const hasDiscount = /\d+%\s*off/i.test(cardText);
        if (hasDiscount) {
          chosenWeight = wg;
          sale_price = prices[0];
          break;
        }
      }
    }

    if (!sale_price || !chosenWeight) continue;
    if (original_price && sale_price >= original_price) continue;

    // Extract THC% — "THC X%" or "X% THC" patterns in card text
    const thcM = cardText.match(/(?:THC\s+)?([\d.]+)\s*%\s*(?:THC)?/i);
    const thc_percentage = thcM ? parseFloat(thcM[1]) : null;

    results.push({
      brand,
      product_name,
      sale_price,
      original_price,
      weight_grams: chosenWeight,
      category: inferCategory(cardText),
      dispensary_name: dispensaryName,
      deal_label: null,
      thc_percentage: thc_percentage && thc_percentage > 0 && thc_percentage <= 100 ? thc_percentage : null,
      is_bundle: false,
    });
  }

  return results;
}

/**
 * Parse bundle/promo deals from Bloom/iHeartJane special-card elements.
 *
 * Handles:
 *   A. "N FOR $TOTAL Wg DESCRIPTION"       — qty bundle with explicit weight
 *   B. "Npk PRODUCT BRAND N for $TOTAL"    — pack deal
 *   C. "N FOR $TOTAL DESCRIPTION"          — qty bundle, infer weight from description
 *   D. "$X All/Select [Category]"          — flat-price category deal
 *   E. "$X BRAND [Quantity] (Wg ...)"      — flat-price mix & match with explicit weight
 *   F. "DESCRIPTION N for $TOTAL"          — reversed qty bundle (brand/product first)
 *   pct-off patterns → skipped, cannot resolve without base price
 */
function parseBundleCards(html: string, dispensaryName: string): DealCandidate[] {
  const results: DealCandidate[] = [];

  const altPattern = /data-testid="special-card"[\s\S]*?alt="([^"]+)"/g;
  let m: RegExpExecArray | null;

  while ((m = altPattern.exec(html)) !== null) {
    const raw = m[1].replace(/\s*special\s*$/i, "").replace(/&amp;/g, "&").trim();

    // ── Skip percent-off patterns — cannot resolve without base price ────────
    if (/\d+\s*%\s*off/i.test(raw) || /off\s+\w/i.test(raw)) {
      console.log(`  [skip] percent-off requires base price: "${raw}"`);
      continue;
    }

    // ── Pattern A: "N FOR $TOTAL Wg DESCRIPTION" (explicit weight before desc) ──
    const patternA = raw.match(
      /^(\d+)\s+for\s+\$(\d+(?:\.\d+)?)\s+([\d.]+\s*(?:g|oz|OZ|G))\s+(.+)$/i
    );
    if (patternA) {
      const qty = parseInt(patternA[1], 10);
      const totalPrice = parseFloat(patternA[2]);
      const weightStr = patternA[3].trim();
      const description = patternA[4].trim();
      const weight_grams = parseWeight(weightStr);
      if (weight_grams && qty > 0 && totalPrice > 0) {
        const unitPrice = totalPrice / qty;
        results.push({
          brand: "__any__",
          product_name: raw,
          sale_price: unitPrice,
          original_price: null,
          weight_grams,
          category: inferCategory(description),
          dispensary_name: dispensaryName,
          deal_label: raw,
          thc_percentage: null,
          is_bundle: true,
        });
        console.log(`  [bundle] parsed: "${raw}" → $${unitPrice.toFixed(2)}/${weight_grams}g (${description})`);
        continue;
      }
    }

    // ── Pattern B: "Npk PRODUCT BRAND N for $TOTAL" ───────────────────────────
    const patternB = raw.match(
      /^(\d+)pk\s+[\w\s]+?\s+(\d+)\s+for\s+\$(\d+(?:\.\d+)?)$/i
    );
    if (patternB) {
      const qty = parseInt(patternB[2], 10);
      const totalPrice = parseFloat(patternB[3]);
      if (qty > 0 && totalPrice > 0) {
        const unitPrice = totalPrice / qty;
        results.push({
          brand: "__any__",
          product_name: raw,
          sale_price: unitPrice,
          original_price: null,
          weight_grams: 1,
          category: "pre_roll",
          dispensary_name: dispensaryName,
          deal_label: raw,
          thc_percentage: null,
          is_bundle: true,
        });
        console.log(`  [bundle] parsed pack: "${raw}" → $${unitPrice.toFixed(2)}/unit`);
        continue;
      }
    }

    // ── Pattern C: "N FOR $TOTAL DESCRIPTION" (no explicit weight) ───────────
    // e.g. "2 FOR $40 GUMMIES", "10 for $50 Select 1g Prerolls"
    // Inline weight like "1g" in description is handled here too.
    const patternC = raw.match(
      /^(\d+)\s+for\s+\$(\d+(?:\.\d+)?)\s+(.+)$/i
    );
    if (patternC) {
      const qty = parseInt(patternC[1], 10);
      const totalPrice = parseFloat(patternC[2]);
      const description = patternC[3].trim();
      if (qty > 0 && totalPrice > 0) {
        // Try to extract inline weight from description (e.g. "1g Prerolls")
        const inlineWt = description.match(/^([\d.]+)\s*g\b/i);
        const weight_grams = inlineWt ? parseFloat(inlineWt[1]) : null;
        const unitPrice = totalPrice / qty;
        const wtStr = weight_grams ? `${weight_grams}g` : "unit";
        results.push({
          brand: "__any__",
          product_name: raw,
          sale_price: unitPrice,
          original_price: null,
          weight_grams,
          category: inferCategory(description),
          dispensary_name: dispensaryName,
          deal_label: raw,
          thc_percentage: null,
          is_bundle: true,
        });
        console.log(`  [bundle] parsed: "${raw}" → $${unitPrice.toFixed(2)}/${wtStr} (${description})`);
        continue;
      }
    }

    // ── Pattern E first (mix & match with explicit weight) — must run before D ─
    // e.g. "$89 Neon Moon Ounce (14g Mix & Match)", "$99 OUNCES (14g Mix & Match)"
    // "$169 Neon Moon 2 Ounces (14g Mix & Match)" → ambiguous quantity, skip
    const patternE = raw.match(
      /^\$(\d+(?:\.\d+)?)\s+(.*?)\s*\((\d+(?:\.\d+)?)g\s+mix\s*&?\s*match\)/i
    );
    if (patternE) {
      const price = parseFloat(patternE[1]);
      const label = patternE[2].trim();
      const weight_grams = parseFloat(patternE[3]);

      if (/\b\d+\s+ounce/i.test(label)) {
        console.log(`  [skip] ambiguous quantity in mix & match: "${raw}"`);
        continue;
      }

      const brandM = label.match(/^(.*?)\s*(?:ounce|eighth|half|quarter|\d+g).*$/i);
      const brand = brandM ? brandM[1].trim() : "__any__";

      if (price > 0 && weight_grams > 0) {
        results.push({
          brand: brand || "__any__",
          product_name: raw,
          sale_price: price,
          original_price: null,
          weight_grams,
          category: "flower",
          dispensary_name: dispensaryName,
          deal_label: raw,
          thc_percentage: null,
          is_bundle: true,
        });
        console.log(`  [flat_price] parsed: "${raw}" → $${price.toFixed(2)}/${weight_grams}g (Flower, brand: ${brand || "__any__"})`);
        continue;
      }
    }

    // ── Pattern D: "$X All/Select [Category]" — flat-price category deal ──────
    // e.g. "$30 All Eighths", "$15 Select Gummies", "$45 Select Half Ounces"
    const patternD = raw.match(
      /^\$(\d+(?:\.\d+)?)\s+(?:all|select)?\s*(.+)$/i
    );
    if (patternD) {
      const price = parseFloat(patternD[1]);
      const desc = patternD[2].trim();
      if (price > 0) {
        // Infer weight from category keywords
        const descLc = desc.toLowerCase();
        let weight_grams: number | null = null;
        let category = inferCategory(desc);

        if (/\beighth(s)?\b/.test(descLc)) { weight_grams = 3.5; category = "flower"; }
        else if (/\bhalf.?ounce(s)?\b/.test(descLc)) { weight_grams = 14; category = "flower"; }
        else if (/\bounce(s)?\b/.test(descLc)) { weight_grams = 28; category = "flower"; }
        else if (/\bgumm/.test(descLc)) { weight_grams = null; category = "edible"; }

        const wtStr = weight_grams ? `${weight_grams}g` : "unit";
        results.push({
          brand: "__any__",
          product_name: raw,
          sale_price: price,
          original_price: null,
          weight_grams,
          category,
          dispensary_name: dispensaryName,
          deal_label: raw,
          thc_percentage: null,
          is_bundle: true,
        });
        console.log(`  [flat_price] parsed: "${raw}" → $${price.toFixed(2)}/${wtStr} (${desc})`);
        continue;
      }
    }

    // ── Pattern F: "DESCRIPTION N for $TOTAL" (brand/product prefix) ─────────
    // e.g. "Cartridges & Disposables (1g) 3 for $50"
    const patternF = raw.match(
      /^(.+?)\s+(\d+)\s+for\s+\$(\d+(?:\.\d+)?)$/i
    );
    if (patternF) {
      const description = patternF[1].trim();
      const qty = parseInt(patternF[2], 10);
      const totalPrice = parseFloat(patternF[3]);
      if (qty > 0 && totalPrice > 0) {
        const inlineWt = description.match(/\(([\d.]+)g\)/i);
        const weight_grams = inlineWt ? parseFloat(inlineWt[1]) : null;
        const unitPrice = totalPrice / qty;
        const wtStr = weight_grams ? `${weight_grams}g` : "unit";
        results.push({
          brand: "__any__",
          product_name: raw,
          sale_price: unitPrice,
          original_price: null,
          weight_grams,
          category: inferCategory(description),
          dispensary_name: dispensaryName,
          deal_label: raw,
          thc_percentage: null,
          is_bundle: true,
        });
        console.log(`  [bundle] parsed: "${raw}" → $${unitPrice.toFixed(2)}/${wtStr} (${description})`);
        continue;
      }
    }

    console.log(`  [bundle] could not parse: "${raw}"`);
  }

  return results;
}

// ── Store fetcher ─────────────────────────────────────────────────────────────

async function fetchStoreDeals(store: JaneStore): Promise<DealCandidate[]> {
  const url = `https://www.${store.domain}/menu/store/${store.id}/deals`;

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      console.warn(`  [${store.name}] HTTP ${res.status} — skipping`);
      return [];
    }
    html = await res.text();
  } catch (err) {
    console.warn(`  [${store.name}] Fetch failed: ${(err as Error).message} — skipping`);
    return [];
  }

  const bundles = parseBundleCards(html, store.name);
  const products = parseProductCards(html, store.name);

  console.log(`  [${store.name}] ${bundles.length} bundle candidates (${products.length} single-product cards — filtered before qualification)`);
  return [...bundles, ...products];
}

// ── Two-floor qualification ───────────────────────────────────────────────────

async function qualifyCandidate(candidate: DealCandidate): Promise<QualifiedDeal | null> {
  // ── Category floor ────────────────────────────────────────────────────────
  const hasWeight = candidate.weight_grams !== null && candidate.weight_grams > 0;
  const lo = hasWeight ? candidate.weight_grams! * 0.85 : null;
  const hi = hasWeight ? candidate.weight_grams! * 1.15 : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyWeight = (q: any) => (lo !== null && hi !== null ? q.gte("weight_grams", lo).lte("weight_grams", hi) : q);

  const [{ count: catCount }, { data: catMinRows }] = await Promise.all([
    applyWeight(
      supabase
        .from("products")
        .select("price", { count: "exact", head: true })
        .eq("category", candidate.category)
        .gt("price", 0)
    ),
    applyWeight(
      supabase
        .from("products")
        .select("price")
        .eq("category", candidate.category)
        .gt("price", 0)
        .order("price", { ascending: true })
        .limit(1)
    ),
  ]);

  const categorySampleSize = catCount ?? 0;
  const categoryFloor = categorySampleSize >= 10 && catMinRows && catMinRows.length > 0
    ? Number(catMinRows[0].price)
    : null;

  // ── Brand floor (skip for __any__ category-wide deals) ────────────────────
  let brandFloor: number | null = null;
  let brandSampleSize = 0;

  if (candidate.brand !== "__any__") {
    const [{ count: brandCount }, { data: brandMinRows }] = await Promise.all([
      applyWeight(
        supabase
          .from("products")
          .select("price", { count: "exact", head: true })
          .ilike("brand", `%${candidate.brand}%`)
          .eq("category", candidate.category)
          .gt("price", 0)
      ),
      applyWeight(
        supabase
          .from("products")
          .select("price")
          .ilike("brand", `%${candidate.brand}%`)
          .eq("category", candidate.category)
          .gt("price", 0)
          .order("price", { ascending: true })
          .limit(1)
      ),
    ]);

    brandSampleSize = brandCount ?? 0;
    if (brandSampleSize >= 2 && brandMinRows && brandMinRows.length > 0) {
      brandFloor = Number(brandMinRows[0].price);
    }
  }

  // ── Tier determination ────────────────────────────────────────────────────
  const beatsCategoryFloor = categoryFloor !== null && candidate.sale_price < categoryFloor;
  const beatsBrandFloor = brandFloor !== null && candidate.sale_price < brandFloor;

  if (!beatsCategoryFloor && !beatsBrandFloor) return null; // dropped

  // floor_beater: below BOTH reliable floors (or below category when brand floor unreliable)
  // brand_best: below brand floor only (cheaper alternatives exist in category)
  const deal_tier: DealTier = beatsCategoryFloor ? "floor_beater" : "brand_best";

  // Use the floor that was beaten as the savings reference (category preferred)
  const referencFloor = categoryFloor ?? brandFloor!;
  const savings_pct = (referencFloor - candidate.sale_price) / referencFloor;

  return {
    ...candidate,
    floor_price: referencFloor,
    savings_pct,
    deal_tier,
    category_floor: categoryFloor,
    brand_floor: brandFloor,
    category_sample_size: categorySampleSize,
    brand_sample_size: brandSampleSize,
  };
}

// ── Commentary grouping ───────────────────────────────────────────────────────
// Groups deals by (dispensary_name, sale_price, category). Each group gets one
// commentary entry. Representative = highest sale_price-to-floor deal; if THC %
// is unavailable on the DealCandidate, fall back to highest savings_pct.

function groupForCommentary(deals: QualifiedDeal[]): DealGroup[] {
  const groups = new Map<string, QualifiedDeal[]>();

  for (const deal of deals) {
    const key = `${deal.dispensary_name}||${deal.sale_price.toFixed(2)}||${deal.category}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(deal);
  }

  return [...groups.values()].map((variants) => {
    // Pick representative: best savings_pct (proxy for highest THC value deal)
    const representative = variants.reduce((best, d) =>
      d.savings_pct > best.savings_pct ? d : best
    );
    return { representative, variant_count: variants.length };
  });
}

// ── Claude commentary ─────────────────────────────────────────────────────────

async function generateCommentary(groups: DealGroup[]): Promise<MikeCommentary[]> {
  if (groups.length === 0) return [];

  const SYSTEM = `You are Big Mike. You've lived in Las Vegas for 15 years. You know every dispensary, every budtender, every deal worth knowing. Your voice is chill, informed, never alarmist. Gossip energy — you heard things, you checked them out, and you're sharing. You write like you're texting a friend who trusts your judgment.

Rules:
- 2-3 sentences max per deal. Never more.
- Start with "Word is..." or "Heard that..." or "Checked it myself —" or similar. Vary it.
- Name the dispensary and the brand. Always.
- Include the actual price and what it normally goes for. The math is the point.
- Never use exclamation points. Confidence doesn't need them.
- Never say "amazing" "incredible" "awesome" "don't miss out" or anything marketing.
- Never be mean to people. The deal is the story.
- Respond ONLY with a valid JSON array. No preamble. No markdown. No explanation.

Tier voice rules (CRITICAL — match tone to tier):
- floor_beater: Write with urgency. This is the cheapest this item exists in the city right now. Be direct and confident. "Checked it myself."
- brand_best: Acknowledge cheaper alternatives exist in the category. Voice: "if [brand] is your thing, this is the move — but if you're flexible on brand, cheaper is on the board." NEVER write brand_best deals with floor_beater urgency.

Multi-variant rule (CRITICAL):
- When variant_count > 1, the deal covers multiple strains at the same price/dispensary/category.
- Do NOT list multiple strain names. Reference the category deal and name only the representative example.
- Example framing: "The Source has eighths at $15 right now — grabbed the AMA at 28%, that's the move."`;

  const groupLines = groups.map((g, i) => {
    const d = g.representative;
    const variantNote = g.variant_count > 1 ? ` (${g.variant_count} strains at this price — use representative product only)` : "";
    const thcNote = d.thc_percentage && d.thc_percentage > 0 ? `, THC: ${d.thc_percentage}%` : "";
    return `${i + 1}. [${d.deal_tier.toUpperCase()}] ${d.brand} ${d.weight_grams}g @ ${d.dispensary_name} — $${d.sale_price.toFixed(2)} vs category floor $${d.category_floor?.toFixed(2) ?? "N/A"} / brand floor $${d.brand_floor?.toFixed(2) ?? "N/A"} (${Math.round(d.savings_pct * 100)}% below reference floor)${variantNote}\n   Representative product: ${d.product_name}${thcNote}`;
  }).join("\n");

  const userMsg = `Today's qualifying deal groups (one commentary entry per group):\n\n${groupLines}\n\nCRITICAL: Use only the product name and THC% provided above. Do not invent strain names. Do not reference any product not explicitly listed. If no THC% is shown, do not mention THC at all.\n\nWrite Big Mike's commentary for each group. Return a JSON array where each object has:\n- "deal_summary": one line description (brand or category, dispensary, price, size)\n- "commentary": Big Mike's 2-3 sentence take, voice matched to tier. For multi-variant groups, reference the category deal — name only the representative product listed above, never enumerate strains.\n- "savings_pct": copy savings_pct from representative deal (as decimal)\n- "dispensary_name": copy dispensary_name from representative deal\n- "deal_tier": copy deal_tier from representative deal`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: userMsg }],
    system: SYSTEM,
  });

  const raw = message.content.find((b) => b.type === "text")?.text ?? "[]";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned) as MikeCommentary[];
}

// ── Supabase save — deep-merge big_mike key ───────────────────────────────────

async function saveToSupabase(
  commentary: MikeCommentary[],
  totalCandidates: number,
  floorBeaterCount: number,
  brandBestCount: number,
  droppedCount: number
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("daily_briefs")
    .select("brief_json")
    .eq("date", today)
    .single();

  const existingJson = (existing?.brief_json as Record<string, unknown>) ?? {};

  const mergedJson = {
    ...existingJson,
    big_mike: commentary,
    big_mike_generated_at: new Date().toISOString(),
    big_mike_candidates_evaluated: totalCandidates,
    big_mike_floor_beaters: floorBeaterCount,
    big_mike_brand_best: brandBestCount,
    big_mike_dropped: droppedCount,
  };

  const { error } = await supabase
    .from("daily_briefs")
    .upsert(
      { date: today, brief_json: mergedJson },
      { onConflict: "date" }
    );

  if (error) throw new Error(`Supabase save error: ${error.message}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Big Mike agent starting...\n");

  // Step 1 — scrape all stores
  const allCandidates: DealCandidate[] = [];
  for (const store of JANE_STORES) {
    const candidates = await fetchStoreDeals(store);
    allCandidates.push(...candidates);
  }
  console.log(`\nTotal candidates parsed: ${allCandidates.length}`);

  // Step 1b — bundles only: drop single-product cards before qualification
  const bundleCandidates = allCandidates.filter((c) => c.is_bundle);
  const singleProductCount = allCandidates.length - bundleCandidates.length;
  console.log(`[filter] dropped ${singleProductCount} single-product candidates — bundles only`);

  // Step 2 — two-floor qualification
  console.log("Qualifying candidates against category + brand floors...");
  const qualifiedResults = await Promise.all(bundleCandidates.map(qualifyCandidate));
  const qualified = qualifiedResults
    .filter((r): r is QualifiedDeal => r !== null)
    .sort((a, b) => b.savings_pct - a.savings_pct);

  const floorBeaters = qualified.filter((d) => d.deal_tier === "floor_beater");
  const brandBest = qualified.filter((d) => d.deal_tier === "brand_best");
  const dropped = bundleCandidates.length - qualified.length;

  // Step 3 — Group by (dispensary_name, sale_price, category) for commentary.
  // All qualified deals are preserved individually for data integrity.
  // Grouping only reduces what gets sent to Claude — one entry per unique deal concept.
  const commentaryGroups = groupForCommentary(qualified);
  console.log(`Grouped into ${commentaryGroups.length} commentary entries (${qualified.length} individual deals)`);

  // Step 4 — Claude commentary (empty list = no section in brief)
  let commentary: MikeCommentary[] = [];
  if (commentaryGroups.length > 0) {
    console.log("\nGenerating Big Mike's Bundles & BOGOs commentary via Claude...");
    try {
      commentary = await generateCommentary(commentaryGroups);
    } catch (err) {
      console.error("Claude API error:", (err as Error).message);
      process.exit(1);
    }
  } else {
    console.log("\nNo qualifying bundles/BOGOs — Big Mike's Bundles & BOGOs section will be omitted from brief.");
  }

  // Step 5 — save
  try {
    await saveToSupabase(commentary, allCandidates.length, floorBeaters.length, brandBest.length, dropped);
  } catch (err) {
    console.error("Supabase save error:", (err as Error).message);
    process.exit(1);
  }

  // Summary
  const today = new Date().toISOString().split("T")[0];
  console.log("\n──────────────────────────────────────────");
  console.log("Big Mike's Bundles & BOGOs run complete.");
  console.log(`Stores scraped:               ${JANE_STORES.length}`);
  console.log(`Candidates evaluated:         ${allCandidates.length}`);
  console.log(`Floor beaters:                ${floorBeaters.length}`);
  console.log(`Brand best:                   ${brandBest.length}`);
  console.log(`Dropped (no qualification):   ${dropped}`);
  console.log(`Deals written to promotions:  ${qualified.length}`);
  console.log(`Commentary entries:           ${commentary.length}`);

  qualified.forEach((d, idx) => {
    const catStr = d.category_floor != null ? `cat $${d.category_floor.toFixed(2)}` : "cat N/A";
    const brandStr = d.brand_floor != null ? `brand $${d.brand_floor.toFixed(2)}` : "brand N/A";
    console.log(
      `\nDeal ${idx + 1} [${d.deal_tier}]: ${d.brand} ${d.weight_grams}g @ ${d.dispensary_name} — $${d.sale_price.toFixed(2)} | ${catStr} / ${brandStr}`
    );
  });

  if (commentary.length > 0) {
    console.log("\nBig Mike's Bundles & BOGOs takes:");
    commentary.forEach((c, idx) => {
      console.log(`\n[${idx + 1}] [${c.deal_tier}] ${c.deal_summary}`);
      console.log(`    ${c.commentary}`);
    });
  }

  console.log(`\nBig Mike's Bundles & BOGOs saved to daily_briefs for ${today}.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
