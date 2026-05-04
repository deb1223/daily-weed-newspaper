import { supabase } from "./supabase";

// ─── TYPES ────────────────────────────────────────────────────
export interface DispensaryRef {
  name: string;
  city?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  subcategory: string | null;
  strain_type: string | null;
  thc_percentage: number | null;
  cbd_percentage: number | null;
  weight_grams: number | null;
  price: number;
  original_price: number | null;
  on_sale: boolean;
  deal_description: string | null;
  in_stock: boolean;
  dispensary_id: string;
  dispensaries: DispensaryRef | null;
}

export interface DealProduct extends Product {
  discountPct: number;
}

export interface CategoryWinner {
  label: string;
  name: string | null;
  price: number | null;
  pricePerGram: number | null;
  dispensaryName: string | null;
}

export interface MinPriceProduct {
  category: string;
  weightGrams: number | null;
  dispensaryName: string;
  city: string | null;
}

export interface SiteStats {
  totalProducts: number;
  dispensaryCount: number;
  onSaleCount: number;
  minPrice: number;
  avgPrice: number;
  // Excludes accessories, apparel, novelty (for stats strip display)
  minPriceExAccessories: number;
  avgPriceExAccessories: number;
  minPriceProduct: MinPriceProduct | null;
  onSalePct: number;
  // Deltas vs. previous edition — null until daily_stats migration
  totalProductsDelta: number | null;
  onSalePctDeltaPts: number | null;
  avgPriceDelta: number | null;
  lastUpdatedAt: string;
}

export interface AvgByCategory {
  category: string;
  avg: number;
}

export interface DailyBriefJson {
  intro: string;
  dealCommentary: { productId: string; quip: string }[];
  savageCorner: string;
  bigMikeTea: string[];
  touristTerry: string;
  marketRating: number;
  ratingQuote: string;
}

export interface DailyBrief {
  date: string;
  brief_json: DailyBriefJson;
  status: string;
}

export interface DailyWinnerProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  thc_percentage: number | null;
  weight_grams: number | null;
  product_url: string | null;
  dispensary_name: string | null;
}

export interface DailyWinner {
  category_key: string;
  metric_display: string | null;
  product: DailyWinnerProduct | null;
}

export interface Lucky7Averages {
  eighth: number | null;
  cart: number | null;
  edible: number | null;
  resin: number | null;
  preroll: number | null;
  infused: number | null;
  disposable: number | null;
  totalListings: number;
  lastUpdatedAt: string;
}

export interface PageData {
  stats: SiteStats;
  categoryWinners: CategoryWinner[];
  dailyWinners: DailyWinner[];
  topDeals: DealProduct[];
  avgByCategory: AvgByCategory[];
  stripDeals: DealProduct[];
  dailyBrief: DailyBrief | null;
  lucky7: Lucky7Averages;
}

// ─── CATEGORY MAPPINGS ────────────────────────────────────────
const CATEGORY_GROUPS: Record<string, string[]> = {
  Flower: ["Flower", "flower"],
  "Pre-Rolls": ["Pre-Rolls", "pre-roll"],
  Edibles: ["Edible", "Edibles", "edible"],
  Vape: ["Vape", "vape", "Vaporizers", "Vape Carts 510", "Disposables", "Specialty Pods"],
  Concentrates: ["Concentrate", "Concentrates", "extract"],
};

// IDs of Strip dispensaries
const STRIP_DISPENSARY_IDS = [
  "b70e2850-8095-4791-8700-7ea8633b6d72", // Thrive Las Vegas Strip
  "98d7d2a6-7ef1-46a2-9c95-b2e1f93ff805", // Cookies On The Strip
];

// ─── STATS ────────────────────────────────────────────────────
function isAccessoryCategory(cat: string | null | undefined): boolean {
  const c = (cat ?? "").toLowerCase();
  return (
    c.includes("accessor") ||
    c.includes("apparel") ||
    c.includes("gear") ||
    c.includes("novelty")
  );
}

async function getStats(): Promise<SiteStats> {
  const [
    { count: totalProducts },
    { count: onSaleCount },
    { count: dispensaryCount },
    { data: priceRows },
    { data: minPriceRows },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("in_stock", true),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("on_sale", true)
      .eq("in_stock", true),
    supabase
      .from("dispensaries")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .neq("slug", "__test__"),
    supabase
      .from("products")
      .select("price, category")
      .eq("in_stock", true)
      .not("price", "is", null)
      .limit(5000),
    // Cheapest non-accessory product for stats strip sub-label
    supabase
      .from("products")
      .select("category, weight_grams, price, dispensaries(name, city)")
      .eq("in_stock", true)
      .not("price", "is", null)
      .not("category", "ilike", "%accessor%")
      .not("category", "ilike", "%apparel%")
      .not("category", "ilike", "%novelty%")
      .order("price", { ascending: true })
      .limit(1),
  ]);

  const allEntries = (priceRows ?? []).map((p) => ({
    price: Number(p.price),
    category: p.category as string | null,
  }));
  const allPrices = allEntries.filter((p) => p.price > 0).map((p) => p.price);
  const exPrices = allEntries
    .filter((p) => p.price > 0 && !isAccessoryCategory(p.category))
    .map((p) => p.price);

  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const avgPrice = allPrices.length
    ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length
    : 0;
  const minPriceExAccessories = exPrices.length ? Math.min(...exPrices) : 0;
  const avgPriceExAccessories = exPrices.length
    ? exPrices.reduce((a, b) => a + b, 0) / exPrices.length
    : 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mpRow = (minPriceRows ?? [])[0] as any;
  const mpDisp = Array.isArray(mpRow?.dispensaries)
    ? mpRow.dispensaries[0]
    : mpRow?.dispensaries;
  const minPriceProduct: MinPriceProduct | null = mpRow
    ? {
        category: mpRow.category ?? "",
        weightGrams: mpRow.weight_grams ? Number(mpRow.weight_grams) : null,
        dispensaryName: mpDisp?.name ?? "",
        city: mpDisp?.city ?? null,
      }
    : null;

  const tp = totalProducts ?? 0;
  const os = onSaleCount ?? 0;

  return {
    totalProducts: tp,
    dispensaryCount: dispensaryCount ?? 0,
    onSaleCount: os,
    minPrice,
    avgPrice,
    minPriceExAccessories,
    avgPriceExAccessories,
    minPriceProduct,
    onSalePct: tp > 0 ? (os / tp) * 100 : 0,
    // Deltas require daily_stats table — null until that migration ships
    totalProductsDelta: null,
    onSalePctDeltaPts: null,
    avgPriceDelta: null,
    lastUpdatedAt: new Date().toISOString(),
  };
}

// ─── CATEGORY WINNERS ────────────────────────────────────────
const WINNER_CONFIG: {
  label: string;
  cats: string[];
  maxGrams?: number;
  perGram?: boolean;
  mgFilter?: string;
}[] = [
  { label: "Flower ($/g)",       cats: ["Flower", "flower"],                          maxGrams: 14, perGram: true },
  { label: "Pre-Rolls ($/g)",    cats: ["Pre-Rolls", "pre-roll"],                     maxGrams: 5,  perGram: true },
  { label: "Vape ($/g)",         cats: ["Vape", "vape", "Vaporizers", "Vape Carts 510", "Disposables", "Specialty Pods"], maxGrams: 2,  perGram: true },
  { label: "Concentrates ($/g)", cats: ["Concentrate", "Concentrates", "extract"],    maxGrams: 3,  perGram: true },
  { label: "Edibles (100mg)",    cats: ["Edible", "Edibles", "edible"],               mgFilter: "100" },
];

async function getCategoryWinners(): Promise<CategoryWinner[]> {
  const results = await Promise.all(
    WINNER_CONFIG.map(async ({ label, cats, maxGrams, perGram, mgFilter }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase
        .from("products")
        .select("name, price, weight_grams, dispensaries(name)")
        .in("category", cats)
        .eq("in_stock", true)
        .not("price", "is", null);

      if (perGram) {
        q = q.not("weight_grams", "is", null).gt("weight_grams", 0);
        if (maxGrams !== undefined) q = q.lte("weight_grams", maxGrams);
        const { data } = await q.order("price", { ascending: true }).limit(300);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let bestRow: any = null;
        let bestPpg = Infinity;
        for (const row of data ?? []) {
          const ppg = Number(row.price) / Number(row.weight_grams);
          if (ppg < bestPpg) { bestPpg = ppg; bestRow = row; }
        }

        return {
          label,
          name: bestRow?.name ?? null,
          price: bestRow ? Number(bestRow.price) : null,
          pricePerGram: bestRow ? Math.round(bestPpg * 100) / 100 : null,
          dispensaryName: (bestRow?.dispensaries as DispensaryRef | null)?.name ?? null,
        };
      }

      if (mgFilter) {
        // ILIKE pre-filter, then word-boundary regex in code
        q = q.ilike("name", `%${mgFilter}mg%`);
        const { data } = await q.order("price", { ascending: true }).limit(100);
        const regex = new RegExp(`\\b${mgFilter}mg\\b`, "i");
        const row = ((data ?? []) as { name: string; price: number; dispensaries: DispensaryRef | null }[])
          .find((r) => regex.test(r.name));

        return {
          label,
          name: row?.name ?? null,
          price: row ? Number(row.price) : null,
          pricePerGram: null,
          dispensaryName: (row?.dispensaries as DispensaryRef | null)?.name ?? null,
        };
      }

      // Standard: cheapest total price
      const { data } = await q.order("price", { ascending: true }).limit(1);
      const row = data?.[0] as
        | { name: string; price: number; dispensaries: DispensaryRef | null }
        | undefined;

      return {
        label,
        name: row?.name ?? null,
        price: row?.price ?? null,
        pricePerGram: null,
        dispensaryName: (row?.dispensaries as DispensaryRef | null)?.name ?? null,
      };
    })
  );
  return results;
}

// ─── TOP DEALS ────────────────────────────────────────────────
async function getTopDeals(): Promise<DealProduct[]> {
  const { data } = await supabase
    .from("products")
    .select("*, dispensaries(name, city)")
    .eq("on_sale", true)
    .eq("in_stock", true)
    .not("original_price", "is", null)
    .not("price", "is", null)
    .limit(300);

  const sorted = ((data ?? []) as Product[])
    .map((p) => {
      const orig = Number(p.original_price);
      const sale = Number(p.price);
      const discountPct =
        orig > 0 && sale > 0 && orig > sale
          ? Math.round(((orig - sale) / orig) * 100)
          : 0;
      return { ...p, discountPct };
    })
    .filter((p) => p.discountPct >= 10)
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 30);

  // Deduplicate: per brand+category+dispensary, max 2 per dispensary
  const seen = new Set<string>();
  const dispensaryCount = new Map<string, number>();
  const deduped: DealProduct[] = [];
  for (const p of sorted) {
    const count = dispensaryCount.get(p.dispensary_id) ?? 0;
    if (count >= 2) continue;
    const key = `${p.brand ?? ""}|${p.category ?? ""}|${p.dispensary_id}`;
    if (!seen.has(key)) {
      seen.add(key);
      dispensaryCount.set(p.dispensary_id, count + 1);
      deduped.push(p);
    }
    if (deduped.length === 5) break;
  }
  return deduped;
}

// ─── AVG BY CATEGORY ─────────────────────────────────────────
async function getAvgByCategory(): Promise<AvgByCategory[]> {
  const { data } = await supabase
    .from("products")
    .select("category, price")
    .eq("in_stock", true)
    .not("price", "is", null)
    .not("category", "is", null)
    .limit(5000);

  const grouped: Record<string, number[]> = {};
  for (const p of data ?? []) {
    const cat = String(p.category);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(Number(p.price));
  }

  // Normalise the messy category names
  const normalised: Record<string, number[]> = {};
  const norm = (cat: string) => {
    if (/flower/i.test(cat)) return "Flower";
    if (/pre.?roll/i.test(cat)) return "Pre-Rolls";
    if (/edible/i.test(cat)) return "Edibles";
    if (/vape|vaporiz/i.test(cat)) return "Vape";
    if (/concentrate|extract/i.test(cat)) return "Concentrates";
    if (/tincture|oral/i.test(cat)) return "Tinctures";
    if (/topical/i.test(cat)) return "Topicals";
    if (/accessory|accessories|cbd/i.test(cat)) return "Other";
    return cat;
  };

  for (const [cat, prices] of Object.entries(grouped)) {
    const key = norm(cat);
    if (!normalised[key]) normalised[key] = [];
    normalised[key].push(...prices);
  }

  return Object.entries(normalised)
    .map(([category, prices]) => ({
      category,
      avg: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
    }))
    .filter((x) => x.category !== "Other")
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 7);
}

// ─── STRIP DEALS ─────────────────────────────────────────────
async function getStripDeals(): Promise<DealProduct[]> {
  const { data } = await supabase
    .from("products")
    .select("*, dispensaries(name, city)")
    .in("dispensary_id", STRIP_DISPENSARY_IDS)
    .eq("in_stock", true)
    .eq("on_sale", true)
    .not("original_price", "is", null)
    .not("price", "is", null)
    .order("price", { ascending: true })
    .limit(50);

  return ((data ?? []) as Product[])
    .map((p) => {
      const orig = Number(p.original_price);
      const sale = Number(p.price);
      const discountPct =
        orig > 0 && sale > 0 && orig > sale
          ? Math.round(((orig - sale) / orig) * 100)
          : 0;
      return { ...p, discountPct };
    })
    .filter((p) => p.discountPct > 0)
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 6);
}

// ─── DAILY WINNERS ───────────────────────────────────────────

// Lucky 7 category keys — always returned in this order, empty state for missing.
const WINNER_CATEGORY_KEYS = [
  "cheapest_eighth",
  "vape_cart",
  "edibles",
  "concentrates",
  "prerolls",
  "infused_preroll",
  "vape_disposable",
] as const;

async function getDailyWinners(): Promise<DailyWinner[]> {
  const today = new Date().toISOString().slice(0, 10);

  // Step 1: fetch winner rows for today.
  // NOTE: daily_winners.product_id has no FK constraint yet, so PostgREST cannot
  // do an implicit join. We use two explicit queries instead.
  const { data: winnerRows, error: winnerError } = await supabase
    .from("daily_winners")
    .select("category_key, metric_display, product_id")
    .eq("date", today);

  console.log("[getDailyWinners] today:", today);
  console.log("[getDailyWinners] winnerRows:", JSON.stringify(winnerRows));
  console.log("[getDailyWinners] error:", winnerError ? JSON.stringify(winnerError) : "none");

  if (!winnerRows || winnerRows.length === 0) {
    return WINNER_CATEGORY_KEYS.map((key) => ({
      category_key: key,
      metric_display: null,
      product: null,
    }));
  }

  // Step 2: fetch product details for all winner product_ids in one query.
  const productIds = winnerRows
    .map((r) => (r as { product_id: string | null }).product_id)
    .filter((id): id is string => id !== null);

  const productById = new Map<string, DailyWinnerProduct>();

  if (productIds.length > 0) {
    const { data: productRows } = await supabase
      .from("products")
      .select("id, name, brand, price, thc_percentage, weight_grams, product_url, dispensaries(name)")
      .in("id", productIds);

    for (const p of (productRows ?? []) as unknown as Array<{
      id: string;
      name: string;
      brand: string | null;
      price: number;
      thc_percentage: number | null;
      weight_grams: number | null;
      product_url: string | null;
      dispensaries: { name: string } | { name: string }[] | null;
    }>) {
      const disp = Array.isArray(p.dispensaries) ? p.dispensaries[0] : p.dispensaries;
      productById.set(p.id, {
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: Number(p.price),
        thc_percentage: p.thc_percentage,
        weight_grams: p.weight_grams,
        product_url: p.product_url,
        dispensary_name: disp?.name ?? null,
      });
    }
  }

  // Step 3: assemble winners indexed by category key.
  const byKey = new Map<string, DailyWinner>();
  for (const row of winnerRows as unknown as Array<{
    category_key: string;
    metric_display: string | null;
    product_id: string | null;
  }>) {
    byKey.set(row.category_key, {
      category_key: row.category_key,
      metric_display: row.metric_display,
      product: row.product_id ? (productById.get(row.product_id) ?? null) : null,
    });
  }

  // Return all 7 categories in fixed order, empty state for any missing.
  return WINNER_CATEGORY_KEYS.map((key) => byKey.get(key) ?? {
    category_key: key,
    metric_display: null,
    product: null,
  });
}

// ─── LUCKY 7 AVERAGES ─────────────────────────────────────────
async function getLucky7Averages(): Promise<Lucky7Averages> {
  const now = new Date().toISOString();
  const fallback: Lucky7Averages = {
    eighth: null, cart: null, edible: null, resin: null,
    preroll: null, infused: null, disposable: null,
    totalListings: 0, lastUpdatedAt: now,
  };

  try {
    // Fetch all in-stock products with price and relevant fields
    const [{ data, error }, { count: totalCount }] = await Promise.all([
      supabase
        .from("products")
        .select("category, subcategory, name, price, weight_grams, thc_mg_total")
        .eq("in_stock", true)
        .not("price", "is", null)
        .gt("price", 0),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("in_stock", true)
        .not("price", "is", null)
        .gt("price", 0),
    ]);

    if (error || !data) return fallback;

    const rows = data as Array<{
      category: string | null;
      subcategory: string | null;
      name: string | null;
      price: number;
      weight_grams: number | null;
      thc_mg_total: number | null;
    }>;

    const lc = (s: string | null | undefined) => (s ?? "").toLowerCase();

    const avg = (arr: number[]) =>
      arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length;

    const eighths = rows
      .filter(r => lc(r.category).includes("flower") && r.weight_grams != null && Number(r.weight_grams) >= 3.0 && Number(r.weight_grams) <= 4.2)
      .map(r => Number(r.price));

    const carts = rows
      .filter(r => {
        const cat = lc(r.category);
        const n = lc(r.name);
        if (!cat.includes("vape") && !cat.includes("vapor") && !cat.includes("cartridge")) return false;
        if (n.includes("disposable") || n.includes("all-in-one") || n.includes("all in one") || n.includes(" aio")) return false;
        return true;
      })
      .map(r => Number(r.price));

    const edibles = rows
      .filter(r => {
        const cat = lc(r.category);
        return cat.includes("edible") || cat.includes("beverage") || cat.includes("gumm") || cat.includes("food");
      })
      .map(r => Number(r.price));

    const resins = rows
      .filter(r => {
        const cat = lc(r.category);
        const n = lc(r.name);
        if (!cat.includes("concentrate") && !cat.includes("extract") && !cat.includes("wax") && !cat.includes("rosin")) return false;
        return n.includes("live resin") || n.includes("live rosin") || n.includes("rosin");
      })
      .map(r => Number(r.price));

    const prerolls = rows
      .filter(r => {
        const cat = lc(r.category);
        const n = lc(r.name);
        if (!cat.includes("pre-roll") && !cat.includes("preroll") && !cat.includes("pre roll")) return false;
        if (/\b\d+-?pack\b|\/pk|\d+\s*x\s*\d*\.?\d+g/.test(n) || n.includes(" pack") || n.includes("multi")) return false;
        if (n.includes("infused") || n.includes("liquid diamond") || n.includes("live resin") || n.includes("kief")) return false;
        return true;
      })
      .map(r => Number(r.price));

    const infused = rows
      .filter(r => {
        const cat = lc(r.category);
        const n = lc(r.name);
        if (!cat.includes("pre-roll") && !cat.includes("preroll") && !cat.includes("pre roll")) return false;
        if (/\b\d+-?pack\b|\/pk|\d+\s*x\s*\d*\.?\d+g/.test(n) || n.includes(" pack") || n.includes("multi")) return false;
        return n.includes("infused") || n.includes("liquid diamond") || n.includes("live resin") || n.includes("kief");
      })
      .map(r => Number(r.price));

    const disposables = rows
      .filter(r => {
        const cat = lc(r.category);
        const n = lc(r.name);
        if (!cat.includes("vape") && !cat.includes("vapor") && !cat.includes("cartridge")) return false;
        return n.includes("disposable") || n.includes("all-in-one") || n.includes("all in one") || n.includes(" aio");
      })
      .map(r => Number(r.price));

    return {
      eighth:   avg(eighths),
      cart:     avg(carts),
      edible:   avg(edibles),
      resin:    avg(resins),
      preroll:  avg(prerolls),
      infused:  avg(infused),
      disposable: avg(disposables),
      totalListings: totalCount ?? rows.length,
      lastUpdatedAt: now,
    };
  } catch {
    return fallback;
  }
}

// ─── DAILY BRIEF ─────────────────────────────────────────────
async function getDailyBrief(): Promise<DailyBrief | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("daily_briefs")
    .select("date, brief_json, status")
    .eq("date", today)
    .eq("status", "published")
    .single();
  return data ?? null;
}

// ─── MAIN FETCH ───────────────────────────────────────────────
export async function getAllPageData(): Promise<PageData> {
  const [stats, categoryWinners, dailyWinners, topDeals, avgByCategory, stripDeals, dailyBrief, lucky7] =
    await Promise.all([
      getStats(),
      getCategoryWinners(),
      getDailyWinners(),
      getTopDeals(),
      getAvgByCategory(),
      getStripDeals(),
      getDailyBrief(),
      getLucky7Averages(),
    ]);

  return { stats, categoryWinners, dailyWinners, topDeals, avgByCategory, stripDeals, dailyBrief, lucky7 };
}
