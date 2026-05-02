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
  weight_grams: number;
  dispensary_name: string;
  deal_label: string | null;
};

type ScoredDeal = DealCandidate & {
  floor_price: number;
  savings_pct: number;
  floor_dispensary: string | null;
};

type MikeCommentary = {
  deal_summary: string;
  commentary: string;
  savings_pct: number;
  dispensary_name: string;
};

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
//
// Deep Roots and The Source run on iHeartJane's Bloom platform (not Next.js —
// no __NEXT_DATA__). Products are server-rendered with data-testid attributes.
//
// Observed card text structure (stripped of tags):
//   [X% OFF | $PRICE SIZE] [CATEGORY] [rating] PRODUCT_NAME BRAND [subtype]
//   [THC X%] $SALE/Yg [$ORIG/Yg] [Add to bag]
//
// Reliable extraction points:
//   data-testid="product-name"  → product name
//   data-testid="product-price" → "$SALE/Yg" (normalized sale price + weight)
//   Text after product-name tag → brand (first non-empty text node)
//   Second $X/Yg in card text  → original price at same weight

function parsePrice(s: string): number | null {
  const m = s.match(/\$?([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

/** Strip all HTML tags and collapse whitespace */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Parse a normalized iHeartJane price string like "$16.25/3.5g".
 * Returns { price, weight_grams } or null.
 */
function parseNormalizedPrice(s: string): { price: number; weight_grams: number } | null {
  // "$16.25/3.5g" or "$60/14g"
  const m = s.match(/\$([\d.]+)\/([\d.]+)g/i);
  if (!m) return null;
  return { price: parseFloat(m[1]), weight_grams: parseFloat(m[2]) };
}

/**
 * Parse all product cards from iHeartJane Bloom-platform SSR HTML.
 *
 * Strategy: find all data-testid="product-card" elements, slice each block,
 * extract name via data-testid="product-name", extract normalized prices
 * ($X/Yg patterns), and derive brand from the text node after the name tag.
 *
 * Only cards with a discount (sale < original, or X% OFF badge) are included.
 */
function parseProductCards(html: string, dispensaryName: string): DealCandidate[] {
  const results: DealCandidate[] = [];

  // Find all card start positions
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

    // ── Product name ─────────────────────────────────────────────────────
    const nameM = cardHtml.match(/data-testid="product-name"[^>]*>([^<]+)/);
    if (!nameM) continue;
    const product_name = nameM[1].trim();

    // ── Skip non-cannabis items (merch, accessories) ─────────────────────
    const lc = cardText.toLowerCase();
    if (
      lc.includes("trucker hat") ||
      lc.includes(" hat ") ||
      lc.includes("merchandise") ||
      (lc.includes("merch") && !lc.includes("g thc"))
    ) continue;

    // ── Brand: text node immediately after the product-name closing tag ──
    // In the card text, brand appears right after the product name.
    const namePos = cardText.indexOf(product_name);
    if (namePos === -1) continue;
    const afterName = cardText.slice(namePos + product_name.length).trim();
    // Brand is the first "word-run" before THC%, a digit, or known non-brand words
    const brandM = afterName.match(/^([A-Za-z][A-Za-z0-9&\s\-'.]{1,40}?)(?=\s+(?:THC|CBD|Indoor|Outdoor|Greenhouse|Sativa|Indica|Hybrid|Gummies|Mylar|\d|$))/);
    if (!brandM) continue;
    const brand = brandM[1].trim();
    if (!brand || brand.length < 2) continue;

    // ── Normalized prices: "$X/Yg" patterns in card text ────────────────
    // There can be multiple weights (e.g. $25/3.5g - $60/14g). We want the
    // cheapest (smallest weight) pair where two exist: sale + original.
    const normalizedPrices = [...cardText.matchAll(/\$([\d.]+)\/([\d.]+)g/gi)].map((m) => ({
      price: parseFloat(m[1]),
      weight_grams: parseFloat(m[2]),
    }));

    if (normalizedPrices.length === 0) continue;

    // Group by weight, take first occurrence of each weight (sale comes before original in text)
    const byWeight = new Map<number, number[]>();
    for (const { price, weight_grams } of normalizedPrices) {
      if (!byWeight.has(weight_grams)) byWeight.set(weight_grams, []);
      byWeight.get(weight_grams)!.push(price);
    }

    // Use the smallest weight with at least one price (prefer pairs where we have sale + original)
    let chosenWeight: number | null = null;
    let sale_price: number | null = null;
    let original_price: number | null = null;

    for (const [wg, prices] of [...byWeight.entries()].sort((a, b) => a[0] - b[0])) {
      if (prices.length >= 2) {
        // Two prices at same weight → sale and original
        const [p1, p2] = prices;
        if (p1 < p2) {
          chosenWeight = wg;
          sale_price = p1;
          original_price = p2;
          break;
        }
      } else if (prices.length === 1) {
        // Single price — check for X% OFF badge in text (confirms it's a deal)
        const hasDiscount = /\d+%\s*off/i.test(cardText);
        if (hasDiscount) {
          chosenWeight = wg;
          sale_price = prices[0];
          break;
        }
      }
    }

    if (!sale_price || !chosenWeight) continue;

    // ── Only include if there's an actual discount ────────────────────────
    if (original_price && sale_price >= original_price) continue;

    results.push({
      brand,
      product_name,
      sale_price,
      original_price,
      weight_grams: chosenWeight,
      dispensary_name: dispensaryName,
      deal_label: null,
    });
  }

  return results;
}

/**
 * Parse deal bundle cards (named promotions at top of page).
 * Pattern: "2 FOR $35 CAMP .5g Disposables" etc.
 * Only included when we can confidently extract qty, per-unit price, and weight.
 */
/**
 * Parse bundle deals from Bloom/iHeartJane special-card elements.
 *
 * Each bundle renders as data-testid="special-card" with an <img alt="..."> that
 * contains the full deal description in clean text, e.g.:
 *   "2 FOR $45 1G CURED RESIN CONCENTRATES special"
 *   "3 for $65 1g Cartridges & Disposables special"
 *   "3pk Prerolls Neon Moon 3 for $40 special"
 *
 * We extract the alt text and parse qty, total price, weight, and brand where
 * present. Bundles without a brand name in the alt text are category-only deals
 * (any brand qualifies) — we score them by computing per-unit price and checking
 * whether any matching brand+weight in Supabase is above that price. We use a
 * sentinel brand of "__any__" and handle it specially in scoreCandidate.
 */
function parseBundleCards(html: string, dispensaryName: string): DealCandidate[] {
  const results: DealCandidate[] = [];

  // Extract all special-card img alt attributes
  const altPattern = /data-testid="special-card"[\s\S]*?alt="([^"]+)"/g;
  let m: RegExpExecArray | null;

  while ((m = altPattern.exec(html)) !== null) {
    // Strip trailing " special" suffix
    const raw = m[1].replace(/\s*special\s*$/i, "").replace(/&amp;/g, "&").trim();

    // ── Pattern A: "N FOR $TOTAL Wg DESCRIPTION" or "N FOR $TOTAL WG DESCRIPTION"
    // e.g. "2 FOR $45 1G CURED RESIN CONCENTRATES"
    //      "3 for $65 1g Cartridges & Disposables"
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
        results.push({
          brand: "__any__",      // no specific brand — category deal
          product_name: raw,
          sale_price: totalPrice / qty,
          original_price: null,
          weight_grams,
          dispensary_name: dispensaryName,
          deal_label: raw,
        });
        console.log(`  [bundle] parsed: "${raw}" → $${(totalPrice/qty).toFixed(2)}/${weight_grams}g (${description})`);
        continue;
      }
    }

    // ── Pattern B: "Npk PRODUCT BRAND N for $TOTAL"
    // e.g. "3pk Prerolls Neon Moon 3 for $40"
    const patternB = raw.match(
      /^(\d+)pk\s+[\w\s]+?\s+(\d+)\s+for\s+\$(\d+(?:\.\d+)?)$/i
    );
    if (patternB) {
      const qty = parseInt(patternB[2], 10);
      const totalPrice = parseFloat(patternB[3]);
      // pre-roll packs — assume 1g weight per unit
      const weight_grams = 1;
      if (qty > 0 && totalPrice > 0) {
        results.push({
          brand: "__any__",
          product_name: raw,
          sale_price: totalPrice / qty,
          original_price: null,
          weight_grams,
          dispensary_name: dispensaryName,
          deal_label: raw,
        });
        console.log(`  [bundle] parsed pack: "${raw}" → $${(totalPrice/qty).toFixed(2)}/unit`);
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

  const all = [...bundles, ...products];
  console.log(`  [${store.name}] ${all.length} candidates (${bundles.length} bundles, ${products.length} products)`);
  return all;
}

// ── Supabase floor scoring ────────────────────────────────────────────────────

async function scoreCandidate(
  candidate: DealCandidate
): Promise<ScoredDeal | null> {
  let query = supabase
    .from("products")
    .select("price, dispensaries(name)")
    .eq("weight_grams", candidate.weight_grams)
    .eq("in_stock", true)
    .not("price", "is", null)
    .order("price", { ascending: true })
    .limit(1);

  if (candidate.brand === "__any__") {
    // Category-wide bundle — find the floor for this weight across all brands
    // (any product at this gram weight)
    query = query.not("brand", "is", null);
  } else {
    query = query.ilike("brand", candidate.brand);
  }

  const { data: floorRows, error } = await query;

  if (error || !floorRows || floorRows.length === 0) {
    return null; // brand/weight not in DB — can't score
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const floorRow = floorRows[0] as any;
  const floor_price = Number(floorRow.price);

  if (candidate.sale_price >= floor_price) return null; // not beating the market

  const disp = Array.isArray(floorRow.dispensaries)
    ? floorRow.dispensaries[0]
    : floorRow.dispensaries;

  const savings_pct = (floor_price - candidate.sale_price) / floor_price;

  return {
    ...candidate,
    floor_price,
    savings_pct,
    floor_dispensary: disp?.name ?? null,
  };
}

// ── Claude commentary ─────────────────────────────────────────────────────────

async function generateCommentary(deals: ScoredDeal[]): Promise<MikeCommentary[]> {
  const SYSTEM = `You are Big Mike. You've lived in Las Vegas for 15 years. You know every dispensary, every budtender, every deal worth knowing. Your voice is chill, informed, never alarmist. Gossip energy — you heard things, you checked them out, and you're sharing. You write like you're texting a friend who trusts your judgment.

Rules:
- 2-3 sentences max per deal. Never more.
- Start with "Word is..." or "Heard that..." or "Checked it myself —" or similar. Vary it.
- Name the dispensary and the brand. Always.
- Include the actual price and what it normally goes for. The math is the point.
- Never use exclamation points. Confidence doesn't need them.
- Never say "amazing" "incredible" "awesome" "don't miss out" or anything marketing.
- Never be mean to people. The deal is the story.
- If only 1 or 2 deals qualified today, that's fine — say so briefly, don't pad.
- Respond ONLY with a valid JSON array. No preamble. No markdown. No explanation.`;

  const userMsg =
    deals.length === 0
      ? "No deals qualified today. Return an empty array []."
      : `Today's verified deals — each one is cheaper than the current lowest price for that brand anywhere in Las Vegas:\n\n${JSON.stringify(deals, null, 2)}\n\nWrite Big Mike's commentary for each deal. Return a JSON array where each object has:\n- "deal_summary": one line description (brand, dispensary, price, size)\n- "commentary": Big Mike's 2-3 sentence take\n- "savings_pct": copy savings_pct from input\n- "dispensary_name": copy dispensary_name from input\n\nIf zero deals were passed, return [].`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: userMsg }],
    system: SYSTEM,
  });

  const raw = message.content.find((b) => b.type === "text")?.text ?? "[]";

  // Strip any accidental markdown fencing
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned) as MikeCommentary[];
}

// ── Supabase save — deep-merge big_mike key ───────────────────────────────────

async function saveToSupabase(
  commentary: MikeCommentary[],
  totalCandidates: number,
  qualifiedCount: number
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  // Fetch existing row so we don't overwrite other brief_json keys (Ziggy etc.)
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
    big_mike_deals_qualified: qualifiedCount,
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

  // Step 2 — score against Supabase floor
  console.log("Scoring candidates against market floor...");
  const scoredResults = await Promise.all(allCandidates.map(scoreCandidate));
  const qualified = scoredResults
    .filter((r): r is ScoredDeal => r !== null)
    .sort((a, b) => b.savings_pct - a.savings_pct);

  const skipped = allCandidates.length - qualified.length;
  console.log(
    `Candidates qualified (beat floor): ${qualified.length} / ${allCandidates.length} (${skipped} skipped — brand not in DB or not below floor)`
  );

  // Step 3 — deduplicate by brand+weight, keep best savings_pct per brand, then top 3
  const deduped: ScoredDeal[] = [];
  const seen = new Set<string>();
  for (const deal of qualified) { // already sorted by savings_pct desc
    // Bundle deals with __any__ brand are keyed by dispensary+weight to avoid
    // multiple category deals from the same store clogging the top 3
    const dedupeKey = deal.brand === "__any__"
      ? `__any__:${deal.dispensary_name}:${deal.weight_grams}`
      : `${deal.brand.toLowerCase()}:${deal.weight_grams}`;
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      deduped.push(deal);
    }
  }
  console.log(`After dedup (brand+weight): ${deduped.length} unique deals`);

  const topDeals = deduped.slice(0, 3);

  // Step 4 — Claude commentary
  console.log("\nGenerating Big Mike commentary via Claude...");
  let commentary: MikeCommentary[];
  try {
    commentary = await generateCommentary(topDeals);
  } catch (err) {
    console.error("Claude API error:", (err as Error).message);
    process.exit(1);
  }

  // Step 5 — save
  try {
    await saveToSupabase(commentary, allCandidates.length, qualified.length);
  } catch (err) {
    console.error("Supabase save error:", (err as Error).message);
    process.exit(1);
  }

  // Summary
  const today = new Date().toISOString().split("T")[0];
  console.log("\n──────────────────────────────────────────");
  console.log("Big Mike agent complete.");
  console.log(`Stores scraped:                  ${JANE_STORES.length}`);
  console.log(`Candidates parsed:               ${allCandidates.length}`);
  console.log(`Candidates qualified (beat floor): ${qualified.length}`);
  console.log(`Deals in output:                 ${topDeals.length}`);

  topDeals.forEach((d, idx) => {
    console.log(
      `\nDeal ${idx + 1}: ${d.brand} ${d.weight_grams}g @ ${d.dispensary_name} — $${d.sale_price.toFixed(2)} vs $${d.floor_price.toFixed(2)} floor (${Math.round(d.savings_pct * 100)}% below)`
    );
  });

  if (topDeals.length > 0) {
    console.log("\nBig Mike's takes:");
    commentary.forEach((c, idx) => {
      console.log(`\n[${idx + 1}] ${c.deal_summary}`);
      console.log(`    ${c.commentary}`);
    });
  }

  console.log(`\nBig Mike commentary saved to daily_briefs for ${today}.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
