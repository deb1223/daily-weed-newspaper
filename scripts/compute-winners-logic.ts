/**
 * Shared compute-winners logic.
 * Imported by:
 *   - src/app/api/compute-winners/route.ts  (cron / manual API trigger)
 *   - scripts/scrape-dispensaries.ts        (chained after each scrape)
 */

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
  original_price: number | null;
  in_stock: boolean;
  product_url: string | null;
  dispensaries: { name: string } | null;
};

// ── mg/$ calculation ─────────────────────────────────────────────────────────
export function computeMgPerDollar(p: ProductRow): number | null {
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

// ── Discount fraction (0–1) ───────────────────────────────────────────────────
function discountFraction(p: ProductRow): number {
  const orig = Number(p.original_price);
  const sale = Number(p.price);
  if (orig > 0 && sale > 0 && orig > sale) return (orig - sale) / orig;
  return 0;
}

// ── Classification helpers ───────────────────────────────────────────────────

function lc(s: string | null | undefined): string {
  return (s ?? "").toLowerCase();
}

function isFlowerCat(p: ProductRow): boolean {
  return lc(p.category).includes("flower");
}

function isShake(p: ProductRow): boolean {
  if (p.subtype === "flower_shake") return true;
  if (p.subtype !== null) return false;
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
  if (/\b\d+-?pack\b|\/pk|\d+\s*x\s*\d*\.?\d+g/.test(n) || n.includes(" pack") || n.includes("multi")) return false;
  // Exclude infused — they have their own category
  if (n.includes("infused") || n.includes("liquid diamond") || n.includes("live resin") || n.includes("kief")) return false;
  return true;
}

function isInfusedPreroll(p: ProductRow): boolean {
  const cat = lc(p.category);
  if (!cat.includes("pre-roll") && !cat.includes("preroll") && !cat.includes("pre roll")) return false;
  const n = lc(p.name);
  // Pack exclusion still applies
  if (/\b\d+-?pack\b|\/pk|\d+\s*x\s*\d*\.?\d+g/.test(n) || n.includes(" pack") || n.includes("multi")) return false;
  return n.includes("infused") || n.includes("liquid diamond") || n.includes("live resin") || n.includes("kief");
}

// Fix 2: vape_cart AND vape_pod both qualify as "cart" category
function isVapeCart(p: ProductRow): boolean {
  if (p.subtype === "vape_cart" || p.subtype === "vape_pod") return true;
  if (p.subtype !== null) return false;
  const cat = lc(p.category);
  if (!cat.includes("vape") && !cat.includes("vapor") && !cat.includes("cartridge")) return false;
  const n = lc(p.name);
  return !n.includes("disposable") && !n.includes("all-in-one") && !n.includes("all in one") && !n.includes(" aio");
}

// Fix 2: vape_disposable only (unchanged — already correct)
function isVapeDisposable(p: ProductRow): boolean {
  if (p.subtype === "vape_disposable") return true;
  if (p.subtype !== null) return false;
  const cat = lc(p.category);
  if (!cat.includes("vape") && !cat.includes("vapor") && !cat.includes("cartridge")) return false;
  const n = lc(p.name);
  return n.includes("disposable") || n.includes("all-in-one") || n.includes("all in one") || n.includes(" aio");
}

// Fix 2: concentrate_hash also qualifies (previously only concentrate_other passed)
function isConcentrateOther(p: ProductRow): boolean {
  if (p.subtype === "concentrate_other" || p.subtype === "concentrate_hash") return true;
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

// Fix 2: edible_gummy, edible_drink, edible_other all qualify (previously only _drink/_other)
function isEdible(p: ProductRow): boolean {
  if (p.subtype === "edible_gummy" || p.subtype === "edible_drink" || p.subtype === "edible_other") return true;
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

// ── Category specs ────────────────────────────────────────────────────────────

type CategorySpec = {
  key: string;
  label: string;
  filter: (p: ProductRow) => boolean;
  minThc?: number;
  weightRange?: [number, number];
  metric: "mg_per_dollar" | "lowest_price";
};

// ── Lucky 7 — the canonical categories ───────────────────────────────────────
const CATEGORY_SPECS: CategorySpec[] = [
  {
    key: "cheapest_eighth",
    label: "Cheapest Eighth",
    filter: isFlowerRegular,
    weightRange: [3.0, 4.2],
    metric: "lowest_price",
  },
  {
    key: "vape_cart",
    label: "1g Cart",
    filter: isVapeCart,
    metric: "mg_per_dollar",
  },
  {
    key: "edibles",
    label: "100mg Edible",
    filter: isEdible,
    metric: "mg_per_dollar",
  },
  {
    key: "concentrates",
    label: "1g Live Resin",
    filter: isConcentrateOther,
    metric: "mg_per_dollar",
  },
  {
    key: "prerolls",
    label: "Single Pre-Roll",
    filter: isPrerollSingle,
    metric: "mg_per_dollar",
  },
  {
    key: "infused_preroll",
    label: "Infused Pre-Roll",
    filter: isInfusedPreroll,
    metric: "mg_per_dollar",
  },
  {
    key: "vape_disposable",
    label: "1g Disposable",
    filter: isVapeDisposable,
    metric: "mg_per_dollar",
  },
];

// ── Main run function ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function run(supabase: any): Promise<{ date: string; computed: number; empty: number }> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: allProducts, error: fetchError } = await supabase
    .from("products")
    .select(
      "id, name, brand, category, subtype, thc_percentage, thc_mg_total, weight_grams, price, original_price, in_stock, product_url, dispensaries!inner(name)"
    )
    .eq("in_stock", true)
    .not("price", "is", null)
    .gt("price", 0);

  if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);

  const products = (allProducts ?? []) as unknown as ProductRow[];
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
    let candidates = products.filter(spec.filter);

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
      winners.push({ date: today, category_key: spec.key, product_id: null, metric_value: null, metric_display: null, created_at: new Date().toISOString() });
      continue;
    }

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
      // mg_per_dollar with Fix 4: fall back to discount% then price when THC data missing
      const scored = candidates
        .map((p) => ({ p, mgpd: computeMgPerDollar(p) }))
        .filter((x): x is { p: ProductRow; mgpd: number } => x.mgpd !== null && x.mgpd > 0)
        .sort((a, b) => b.mgpd - a.mgpd);

      if (scored.length > 0) {
        // Normal path: best mg/$
        const top = scored[0];
        winner = top.p;
        metricValue = top.mgpd;
        metricDisplay = `${top.mgpd.toFixed(1)} mg/$`;
      } else {
        // Fix 4: no THC data available — fall back to biggest discount, then lowest price
        console.log(`[compute-winners] ${spec.key}: no mg/$ data — falling back to discount/price`);
        const fallback = [...candidates].sort((a, b) => {
          const da = discountFraction(a);
          const db = discountFraction(b);
          if (db !== da) return db - da;
          return Number(a.price) - Number(b.price);
        });
        winner = fallback[0];
        const disc = Math.round(discountFraction(winner) * 100);
        metricValue = null;
        metricDisplay = disc > 0
          ? `-${disc}% · $${Number(winner.price).toFixed(2)}`
          : `$${Number(winner.price).toFixed(2)}`;
      }
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

  const { error: upsertError } = await supabase
    .from("daily_winners")
    .upsert(winners, { onConflict: "date,category_key" });

  if (upsertError) throw new Error(`Upsert error: ${upsertError.message}`);

  const empty = winners.filter((w) => !w.product_id).length;
  console.log(`[compute-winners] Done — ${winners.length} rows upserted for ${today} (${empty} empty)`);
  return { date: today, computed: winners.length, empty };
}
