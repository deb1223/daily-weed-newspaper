/**
 * /api/compute-winners
 *
 * Computes Ziggy's Top 10 daily winners and upserts them into daily_winners.
 * Runs via Vercel cron at 10:00 AM daily (after 9:30 AM scrape).
 * Also accepts POST for manual trigger.
 *
 * Each category selects the best product by:
 *   - mg/$ (THC milligrams per dollar) for 9 categories
 *   - lowest price for "cheapest_eighth"
 *
 * Classification uses the subtype column when populated (post-scrape).
 * Falls back to category name + product name keywords when subtype is null
 * (pre-scrape or products where classifier returned null).
 *
 * Idempotent: re-running for the same date safely overwrites prior results.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ProductRow = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  subtype: string | null;
  thc_percentage: number | null;
  thc_mg_total: number | null;
  weight_grams: number | null;
  price: number;
  in_stock: boolean;
  product_url: string | null;
  dispensaries: { name: string } | null;
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
}

// ── mg/$ calculation ────────────────────────────────────────────────────────
// Handles all product types: flower/vape/concentrate via %, edibles/tinctures
// via thc_mg_total, edible fallback via name extraction.
function computeMgPerDollar(p: ProductRow): number | null {
  const price = Number(p.price);
  if (!price || price <= 0) return null;

  if (p.thc_mg_total != null) return p.thc_mg_total / price;

  if (p.thc_percentage != null && p.weight_grams != null) {
    const wg = Number(p.weight_grams);
    if (wg <= 0) return null;
    return (Number(p.thc_percentage) / 100) * wg * 1000 / price;
  }

  // Edible name fallback: "100mg gummy" → 100 / price
  const m = p.name.match(/(\d+)\s*mg/i);
  if (m) return Number(m[1]) / price;

  return null;
}

// ── Classification helpers ───────────────────────────────────────────────────
// Used when subtype column is null (first run before scrape populates it).

function lc(s: string | null | undefined): string {
  return (s ?? "").toLowerCase();
}

function isFlowerCat(p: ProductRow): boolean {
  return lc(p.category).includes("flower");
}

function isShake(p: ProductRow): boolean {
  if (p.subtype === "flower_shake") return true;
  if (p.subtype !== null) return false; // subtype set, not shake
  const n = lc(p.name);
  return n.includes("shake") || n.includes("trim") || n.includes("smalls") ||
    n.includes("popcorn") || n.includes("mini bud");
}

function isFlowerRegular(p: ProductRow): boolean {
  if (p.subtype === "flower_regular") return true;
  if (p.subtype !== null) return false;
  return isFlowerCat(p) && !isShake(p);
}

function isPrerollSingle(p: ProductRow): boolean {
  if (p.subtype === "preroll_single") return true;
  if (p.subtype !== null) return false;
  const cat = lc(p.category);
  if (!cat.includes("pre-roll") && !cat.includes("preroll") && !cat.includes("pre roll")) return false;
  const n = lc(p.name);
  return !(/\b\d+-?pack\b|\/pk|\d+\s*x\s*\d*\.?\d+g/.test(n) || n.includes(" pack") || n.includes("multi"));
}

function isVapeCart(p: ProductRow): boolean {
  if (p.subtype === "vape_cart") return true;
  if (p.subtype !== null) return false;
  const cat = lc(p.category);
  if (!cat.includes("vape") && !cat.includes("vapor") && !cat.includes("cartridge")) return false;
  const n = lc(p.name);
  return !n.includes("disposable") && !n.includes("all-in-one") && !n.includes("all in one") && !n.includes(" aio");
}

function isVapeDisposable(p: ProductRow): boolean {
  if (p.subtype === "vape_disposable") return true;
  if (p.subtype !== null) return false;
  const cat = lc(p.category);
  if (!cat.includes("vape") && !cat.includes("vapor") && !cat.includes("cartridge")) return false;
  const n = lc(p.name);
  return n.includes("disposable") || n.includes("all-in-one") || n.includes("all in one") || n.includes(" aio");
}

function isConcentrateOther(p: ProductRow): boolean {
  if (p.subtype === "concentrate_other") return true;
  if (p.subtype !== null) return false;
  const cat = lc(p.category);
  if (!cat.includes("concentrate") && !cat.includes("extract") && !cat.includes("wax") && !cat.includes("rosin")) return false;
  const n = lc(p.name);
  return !n.includes("rso") && !n.includes("rick simpson") && !n.includes("feco") && !n.includes("fmoe");
}

function isRso(p: ProductRow): boolean {
  if (p.subtype === "concentrate_rso") return true;
  if (p.subtype !== null) return false;
  const n = lc(p.name);
  return n.includes("rso") || n.includes("rick simpson") || n.includes("feco") || n.includes("fmoe");
}

function isEdible(p: ProductRow): boolean {
  if (p.subtype === "edible_drink" || p.subtype === "edible_other") return true;
  if (p.subtype !== null) return false;
  const cat = lc(p.category);
  return cat.includes("edible") || cat.includes("beverage") || cat.includes("drink") ||
    cat.includes("gumm") || cat.includes("food");
}

function isTincture(p: ProductRow): boolean {
  if (p.subtype === "tincture") return true;
  if (p.subtype !== null) return false;
  const cat = lc(p.category);
  const n = lc(p.name);
  return cat.includes("tincture") || cat.includes("sublingual") ||
    n.includes("tincture") || n.includes("sublingual");
}

// ── Winner computation per category ─────────────────────────────────────────

type CategorySpec = {
  key: string;
  label: string;
  filter: (p: ProductRow) => boolean;
  minThc?: number;
  weightRange?: [number, number]; // [min, max] grams
  metric: "mg_per_dollar" | "lowest_price";
};

const CATEGORY_SPECS: CategorySpec[] = [
  {
    key: "best_value_flower",
    label: "Best Value Flower",
    filter: isFlowerRegular,
    minThc: 18,
    metric: "mg_per_dollar",
  },
  {
    key: "cheapest_eighth",
    label: "Cheapest 8th",
    filter: isFlowerRegular,
    minThc: 20,
    weightRange: [3.0, 4.0],
    metric: "lowest_price",
  },
  {
    key: "shake",
    label: "Shake",
    filter: isShake,
    metric: "mg_per_dollar",
  },
  {
    key: "prerolls",
    label: "Pre-Rolls",
    filter: isPrerollSingle,
    metric: "mg_per_dollar",
  },
  {
    key: "vape_cart",
    label: "Vape Cart",
    filter: isVapeCart,
    metric: "mg_per_dollar",
  },
  {
    key: "vape_disposable",
    label: "Disposable Vape",
    filter: isVapeDisposable,
    metric: "mg_per_dollar",
  },
  {
    key: "concentrates",
    label: "Concentrates",
    filter: isConcentrateOther,
    metric: "mg_per_dollar",
  },
  {
    key: "rso",
    label: "RSO",
    filter: isRso,
    metric: "mg_per_dollar",
  },
  {
    key: "edibles",
    label: "Edibles",
    filter: isEdible,
    metric: "mg_per_dollar",
  },
  {
    key: "tinctures",
    label: "Tinctures",
    filter: isTincture,
    metric: "mg_per_dollar",
  },
];

// Broad category buckets for the initial fetch — one fetch per bucket, reused across specs.
// This avoids 10 separate DB calls for related categories.
const FETCH_BUCKETS: { key: string; catPatterns: string[] }[] = [
  { key: "flower",      catPatterns: ["Flower", "flower"] },
  { key: "preroll",     catPatterns: ["Pre-Rolls", "pre-roll", "Pre-Roll", "preroll"] },
  { key: "vape",        catPatterns: ["Vape", "vape", "Vaporizers", "Vaporizer"] },
  { key: "concentrate", catPatterns: ["Concentrate", "Concentrates", "extract", "Extract", "wax", "Wax", "rosin", "Rosin"] },
  { key: "edible",      catPatterns: ["Edible", "Edibles", "edible", "Beverage", "beverage", "Food"] },
  { key: "tincture",    catPatterns: ["Tincture", "Tinctures", "tincture", "Oral", "oral", "sublingual"] },
  // RSO: also appears in concentrate category, covered there, plus any null-category with rso in name
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run(supabase: any) {
  const today = new Date().toISOString().slice(0, 10);

  // Fetch all in-stock products with their subtype + key fields.
  // We fetch all at once and filter in TypeScript — avoids complex OR queries.
  // 20k products × ~200 bytes = ~4MB in memory, fine for a server-side job.
  const { data: allProducts, error: fetchError } = await supabase
    .from("products")
    .select(
      "id, name, brand, category, subtype, thc_percentage, thc_mg_total, weight_grams, price, in_stock, product_url, dispensaries!inner(name)"
    )
    .eq("in_stock", true)
    .not("price", "is", null)
    .gt("price", 0);

  if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);

  const products = ((allProducts ?? []) as unknown as ProductRow[]);
  console.log(`[compute-winners] ${products.length} in-stock products loaded`);

  const winners: {
    date: string;
    category_key: string;
    product_id: string | null;
    metric_value: number | null;
    metric_display: string | null;
    created_at: string;
  }[] = [];

  for (const spec of CATEGORY_SPECS) {
    // Step 1: filter by category classifier
    let candidates = products.filter(spec.filter);

    // Step 2: apply additional constraints
    if (spec.minThc != null) {
      candidates = candidates.filter(
        (p) => p.thc_percentage != null && Number(p.thc_percentage) >= spec.minThc!
      );
    }

    if (spec.weightRange) {
      const [lo, hi] = spec.weightRange;
      candidates = candidates.filter(
        (p) => p.weight_grams != null && Number(p.weight_grams) >= lo && Number(p.weight_grams) <= hi
      );
    }

    console.log(`[compute-winners] ${spec.key}: ${candidates.length} candidates`);

    if (candidates.length === 0) {
      // No qualifying product today — still record an empty row
      winners.push({
        date: today,
        category_key: spec.key,
        product_id: null,
        metric_value: null,
        metric_display: null,
        created_at: new Date().toISOString(),
      });
      continue;
    }

    // Step 3: score and pick winner
    let winner: ProductRow;
    let metricValue: number | null;
    let metricDisplay: string;

    if (spec.metric === "lowest_price") {
      winner = candidates.reduce((best, p) =>
        Number(p.price) < Number(best.price) ? p : best
      );
      metricValue = Number(winner.price);
      metricDisplay = `$${Number(winner.price).toFixed(2)}`;
    } else {
      // mg_per_dollar — filter to only products with computable mg/$
      const scored = candidates
        .map((p) => ({ p, mgpd: computeMgPerDollar(p) }))
        .filter((x): x is { p: ProductRow; mgpd: number } => x.mgpd !== null && x.mgpd > 0)
        .sort((a, b) => b.mgpd - a.mgpd);

      if (scored.length === 0) {
        winners.push({
          date: today,
          category_key: spec.key,
          product_id: null,
          metric_value: null,
          metric_display: null,
          created_at: new Date().toISOString(),
        });
        continue;
      }

      const top = scored[0];
      winner = top.p;
      metricValue = top.mgpd;
      metricDisplay = `${top.mgpd.toFixed(1)} mg/$`;
    }

    const disp = winner.dispensaries as { name: string } | null;
    console.log(
      `[compute-winners] ${spec.key} winner: "${winner.name}" @ ${disp?.name ?? "?"} — ${metricDisplay}`
    );

    winners.push({
      date: today,
      category_key: spec.key,
      product_id: winner.id,
      metric_value: metricValue,
      metric_display: metricDisplay,
      created_at: new Date().toISOString(),
    });
  }

  // Upsert all 10 rows — idempotent, safe to re-run
  const { error: upsertError } = await supabase
    .from("daily_winners")
    .upsert(winners, { onConflict: "date,category_key" });

  if (upsertError) throw new Error(`Upsert error: ${upsertError.message}`);

  console.log(`[compute-winners] Done — ${winners.length} rows upserted for ${today}`);
  return { date: today, computed: winners.length, empty: winners.filter((w) => !w.product_id).length };
}

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

// Vercel crons use GET
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await run(getSupabase());
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[compute-winners]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Manual trigger via POST
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await run(getSupabase());
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[compute-winners]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
