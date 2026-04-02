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

export interface SiteStats {
  totalProducts: number;
  dispensaryCount: number;
  onSaleCount: number;
  minPrice: number;
  avgPrice: number;
}

export interface AvgByCategory {
  category: string;
  avg: number;
}

export interface PageData {
  stats: SiteStats;
  categoryWinners: CategoryWinner[];
  topDeals: DealProduct[];
  avgByCategory: AvgByCategory[];
  stripDeals: DealProduct[];
}

// ─── CATEGORY MAPPINGS ────────────────────────────────────────
const CATEGORY_GROUPS: Record<string, string[]> = {
  Flower: ["Flower", "flower"],
  "Pre-Rolls": ["Pre-Rolls", "pre-roll"],
  Edibles: ["Edible", "Edibles", "edible"],
  Vape: ["Vape", "vape", "Vaporizers"],
  Concentrates: ["Concentrate", "Concentrates", "extract"],
};

// IDs of Strip dispensaries
const STRIP_DISPENSARY_IDS = [
  "b70e2850-8095-4791-8700-7ea8633b6d72", // Thrive Las Vegas Strip
  "98d7d2a6-7ef1-46a2-9c95-b2e1f93ff805", // Cookies On The Strip
];

// ─── STATS ────────────────────────────────────────────────────
async function getStats(): Promise<SiteStats> {
  const [
    { count: totalProducts },
    { count: onSaleCount },
    { count: dispensaryCount },
    { data: priceRows },
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
      .select("price")
      .eq("in_stock", true)
      .not("price", "is", null)
      .limit(5000),
  ]);

  const prices = (priceRows ?? []).map((p) => Number(p.price)).filter((n) => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const avgPrice = prices.length
    ? prices.reduce((a, b) => a + b, 0) / prices.length
    : 0;

  return {
    totalProducts: totalProducts ?? 0,
    dispensaryCount: dispensaryCount ?? 0,
    onSaleCount: onSaleCount ?? 0,
    minPrice,
    avgPrice,
  };
}

// ─── CATEGORY WINNERS ────────────────────────────────────────
// Flower and Pre-Rolls use best price-per-gram logic.
// Other categories use cheapest total price.
const WINNER_CONFIG: {
  label: string;
  cats: string[];
  maxGrams?: number;
  perGram?: boolean;
}[] = [
  { label: "Flower ($/g)", cats: ["Flower", "flower"], maxGrams: 14, perGram: true },
  { label: "Pre-Rolls ($/g)", cats: ["Pre-Rolls", "pre-roll"], maxGrams: 5, perGram: true },
  { label: "Edibles", cats: ["Edible", "Edibles", "edible"] },
  { label: "Vape", cats: ["Vape", "vape", "Vaporizers"] },
  { label: "Concentrates", cats: ["Concentrate", "Concentrates", "extract"] },
];

async function getCategoryWinners(): Promise<CategoryWinner[]> {
  const results = await Promise.all(
    WINNER_CONFIG.map(async ({ label, cats, maxGrams, perGram }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase
        .from("products")
        .select("name, price, weight_grams, dispensaries(name)")
        .in("category", cats)
        .eq("in_stock", true)
        .not("price", "is", null);

      if (perGram) {
        // Find best price-per-gram: fetch candidates, compute $/g, pick minimum
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

      // Standard: cheapest total price
      if (maxGrams !== undefined) q = q.lte("weight_grams", maxGrams);
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

  // Deduplicate: per brand + category + dispensary, keep only the best (first after sort)
  const seen = new Set<string>();
  const deduped: DealProduct[] = [];
  for (const p of sorted) {
    const key = `${p.brand ?? ""}|${p.category ?? ""}|${p.dispensary_id}`;
    if (!seen.has(key)) {
      seen.add(key);
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

// ─── MAIN FETCH ───────────────────────────────────────────────
export async function getAllPageData(): Promise<PageData> {
  const [stats, categoryWinners, topDeals, avgByCategory, stripDeals] =
    await Promise.all([
      getStats(),
      getCategoryWinners(),
      getTopDeals(),
      getAvgByCategory(),
      getStripDeals(),
    ]);

  return { stats, categoryWinners, topDeals, avgByCategory, stripDeals };
}
