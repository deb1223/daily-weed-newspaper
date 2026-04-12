"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { displayProductSize, calcMgPerDollar } from "@/lib/format";
import TerpProfileSelector, { type ProfileKey, TERP_PROFILES } from "@/components/TerpProfileSelector";

interface Dispensary {
  name: string;
}

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  weight_grams: number | null;
  price: number | null;
  original_price: number | null;
  on_sale: boolean;
  thc_percentage: number | null;
  in_stock: boolean;
  dispensary_id: string;
  dispensaries: Dispensary | { name: string }[] | null;
}

interface CompareResult {
  dispensaryName: string;
  price: number;
  original_price: number | null;
  on_sale: boolean;
  discountPct: number | null;
  viewUrl: string;
  productUrl: string | null;
}

type SortField = "price" | "thc" | "discount" | "size" | "value";
type SortDir = "asc" | "desc";
type HotDeal = Product & { discountPct: number };

const CATEGORIES = [
  "All",
  "Flower",
  "Pre-Rolls",
  "Edibles",
  "Vape",
  "Concentrates",
  "Tinctures",
  "Accessories",
];
const PAGE_SIZE = 50;
const FREE_COMPARE_LIMIT = 3;

// ─── SIZE OPTIONS PER CATEGORY ─────────────────────────────────
const SIZE_OPTIONS: Record<string, { label: string; value: string }[]> = {
  Flower: [
    { label: "All Sizes", value: "all" },
    { label: "1g", value: "1g" },
    { label: "3.5g", value: "3.5g" },
    { label: "7g", value: "7g" },
    { label: "14g", value: "14g" },
    { label: "28g", value: "28g" },
  ],
  "Pre-Rolls": [
    { label: "All Sizes", value: "all" },
    { label: "0.5g", value: "0.5g" },
    { label: "1g", value: "1g" },
    { label: "2-pack", value: "2pk" },
    { label: "5-pack", value: "5pk" },
  ],
  Vape: [
    { label: "All Sizes", value: "all" },
    { label: "0.3g", value: "0.3g" },
    { label: "0.5g", value: "0.5g" },
    { label: "1g", value: "1g" },
    { label: "2g", value: "2g" },
  ],
  Concentrates: [
    { label: "All Sizes", value: "all" },
    { label: "0.5g", value: "0.5g" },
    { label: "1g", value: "1g" },
    { label: "2g", value: "2g" },
  ],
  Edibles: [
    { label: "All Doses", value: "all" },
    { label: "5mg", value: "5mg" },
    { label: "10mg", value: "10mg" },
    { label: "25mg", value: "25mg" },
    { label: "50mg", value: "50mg" },
    { label: "100mg", value: "100mg" },
    { label: "200mg+", value: "200mg+" },
  ],
  Tinctures: [
    { label: "All Sizes", value: "all" },
    { label: "100mg", value: "100mg" },
    { label: "250mg", value: "250mg" },
    { label: "500mg", value: "500mg" },
    { label: "1000mg", value: "1000mg" },
  ],
};

const CAT_MAP: Record<string, string[]> = {
  Flower:       ["Flower", "flower"],
  "Pre-Rolls":  ["Pre-Rolls", "pre-roll"],
  Edibles:      ["Edible", "Edibles", "edible"],
  Vape:         ["Vape", "vape", "Vaporizers"],
  Concentrates: ["Concentrate", "Concentrates", "extract"],
  Tinctures:    ["Tincture", "Oral", "oral"],
  Accessories:  ["Accessories", "Accessory", "CBD"],
};

// ─── MENU URL BUILDER ─────────────────────────────────────────
function buildMenuUrl(
  platform: string | null | undefined,
  slug: string | null | undefined,
  dutchieUrl: string | null | undefined,
  productName: string,
  dispensaryName: string
): string {
  if (platform === "dutchie") {
    if (dutchieUrl) return `${dutchieUrl.replace(/\/+$/, "")}/menu`;
    if (slug) return `https://dutchie.com/dispensary/${slug}/menu`;
  }
  if (platform === "iheartjane" && slug) {
    return `https://iheartjane.com/dispensaries/${slug}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${productName} ${dispensaryName} dispensary`)}`;
}

// ─── SERVER-SIDE SIZE FILTER ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySizeFilterToQuery(q: any, cat: string, size: string): any {
  if (size === "all" || !size) return q;

  const gramRanges: Record<string, Record<string, [number, number]>> = {
    Flower:       { "1g": [0.85,1.15], "3.5g": [3.0,4.0], "7g": [6.0,8.0], "14g": [12.0,16.0], "28g": [24.0,32.0] },
    "Pre-Rolls":  { "0.5g": [0.4,0.6], "1g": [0.85,1.15] },
    Vape:         { "0.3g": [0.25,0.35], "0.5g": [0.4,0.6], "1g": [0.85,1.15], "2g": [1.7,2.3] },
    Concentrates: { "0.5g": [0.4,0.6], "1g": [0.85,1.15], "2g": [1.7,2.3] },
  };

  const ranges = gramRanges[cat];
  if (ranges?.[size]) {
    const [lo, hi] = ranges[size];
    return q.gte("weight_grams", lo).lte("weight_grams", hi);
  }

  if (cat === "Pre-Rolls") {
    if (size === "2pk") return q.or("name.ilike.%2-pack%,name.ilike.%2 pack%,name.ilike.%2pk%,name.ilike.%2-pk%");
    if (size === "5pk") return q.or("name.ilike.%5-pack%,name.ilike.%5 pack%,name.ilike.%5pk%,name.ilike.%5-pk%");
  }

  if (cat === "Edibles" || cat === "Tinctures") {
    // 200mg+: no numeric column to filter on — use ilike "%mg%" as a broad server-side filter;
    // the count reflects all items with "mg" in the name (slightly over-counts), page results are correct.
    if (size === "200mg+") return q.ilike("name", "%mg%");
    const mgVal = size.replace("mg", "");
    return q.ilike("name", `%${mgVal}mg%`);
  }

  return q;
}

// ─── HELPERS ──────────────────────────────────────────────────
function getDispName(dispensaries: Product["dispensaries"]): string {
  return (Array.isArray(dispensaries) ? dispensaries[0]?.name : dispensaries?.name) ?? "—";
}

function sortByDiscount(rows: Product[], dir: SortDir): Product[] {
  return [...rows].sort((a, b) => {
    const disc = (p: Product) =>
      p.original_price && p.price && Number(p.original_price) > Number(p.price)
        ? (Number(p.original_price) - Number(p.price)) / Number(p.original_price)
        : 0;
    return dir === "desc" ? disc(b) - disc(a) : disc(a) - disc(b);
  });
}

function sortByValue(rows: Product[], dir: SortDir): Product[] {
  return [...rows].sort((a, b) => {
    const va = calcMgPerDollar(a.name, a.category, a.thc_percentage, a.weight_grams, a.price);
    const vb = calcMgPerDollar(b.name, b.category, b.thc_percentage, b.weight_grams, b.price);
    if (va === null && vb === null) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    return dir === "desc" ? vb - va : va - vb;
  });
}

// ─── SUSPENSE WRAPPER ─────────────────────────────────────────
export default function PricesPage() {
  return (
    <Suspense
      fallback={
        <div className="gork-empty">
          <p>Ziggy is scanning the market...</p>
        </div>
      }
    >
      <PricesPageInner />
    </Suspense>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
function PricesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── Read all filter/sort/page state from URL ──
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));
  const query = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "All";
  const sizeFilter = searchParams.get("size") ?? "all";
  const dispensaryFilter = searchParams.get("dispensary") ?? "All";
  const saleOnly = searchParams.get("sale_only") === "1";
  const sortField = (searchParams.get("sort") ?? "price") as SortField;
  const sortDir = (searchParams.get("sort_dir") ?? "asc") as SortDir;
  const activeProfile = (searchParams.get("profile") ?? null) as ProfileKey | null;

  // ── Local state ──
  const [localQuery, setLocalQuery] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dispensaries, setDispensaries] = useState<{ id: string; name: string }[]>([]);
  const [hotDeal, setHotDeal] = useState<HotDeal | null>(null);
  const [lastScraped, setLastScraped] = useState<string | null>(null);

  const isPro = true; // wire to auth later
  const [valueSortMsg, setValueSortMsg] = useState(false);

  const [compareModal, setCompareModal] = useState<{
    productName: string;
    results: CompareResult[];
    totalCount: number;
  } | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    if (!compareModal) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setCompareModal(null); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [compareModal]);

  const sizeOptions = SIZE_OPTIONS[category] ?? null;
  const sizeLabel = category === "Edibles" || category === "Tinctures" ? "Dose" : "Size";
  const showSizeFilter = !!sizeOptions;

  // ── URL update helper ──
  function setParams(updates: Record<string, string | null>) {
    const savedY = window.scrollY;
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "All" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    requestAnimationFrame(() => window.scrollTo(0, savedY));
  }

  // ── Sync local query input when URL changes (e.g. browser back) ──
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // ── Debounce search input → URL (400ms) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const trimmed = localQuery.trim();
      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }
      params.delete("page");
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 400);
    return () => clearTimeout(timer);
  }, [localQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch last scraped timestamp once on mount ──
  useEffect(() => {
    supabase
      .from("products")
      .select("last_scraped")
      .eq("in_stock", true)
      .order("last_scraped", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.last_scraped) setLastScraped(data.last_scraped as string);
      });
  }, []);

  // ── Fetch dispensary list once ──
  useEffect(() => {
    supabase
      .from("dispensaries")
      .select("id, name")
      .neq("slug", "__test__")
      .then(({ data }) => {
        setDispensaries(
          ((data ?? []) as { id: string; name: string }[])
            .filter((d) => d.name)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      });
  }, []);

  // ── Fetch hot deal once on mount ──
  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, price, original_price, on_sale, dispensaries(name)")
      .eq("in_stock", true)
      .eq("on_sale", true)
      .not("original_price", "is", null)
      .order("original_price", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        const best =
          ((data ?? []) as Product[])
            .filter(
              (p) =>
                p.original_price &&
                p.price &&
                Number(p.original_price) > Number(p.price)
            )
            .map((p) => ({
              ...p,
              discountPct: Math.round(
                ((Number(p.original_price!) - Number(p.price!)) /
                  Number(p.original_price!)) *
                  100
              ),
            }))
            .filter((p) => p.discountPct >= 15)
            .sort((a, b) => b.discountPct - a.discountPct)[0] ?? null;
        setHotDeal(best);
      });
  }, []);

  // ── Main paginated fetch — fires whenever URL params change ──
  useEffect(() => {
    // Wait for dispensaries to load before filtering by dispensary name
    if (dispensaryFilter !== "All" && dispensaries.length === 0) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const dispId =
        dispensaryFilter !== "All"
          ? (dispensaries.find((d) => d.name === dispensaryFilter)?.id ?? null)
          : null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase
        .from("products")
        .select(
          "id, name, brand, category, weight_grams, price, original_price, on_sale, thc_percentage, dispensary_id, dispensaries(name)",
          { count: "exact" }
        )
        .eq("in_stock", true);

      // Text search
      if (query.trim()) {
        q = q.or(
          `name.ilike.%${query.trim()}%,brand.ilike.%${query.trim()}%`
        );
      }

      // Category
      if (category !== "All") {
        q = q.in("category", CAT_MAP[category] ?? [category]);
      } else {
        // "All" means all cannabis products — exclude accessories from the default view
        q = q.not("category", "in", `(${(CAT_MAP["Accessories"] ?? ["Accessories"]).join(",")})`);
      }

      // Size
      q = applySizeFilterToQuery(q, category, sizeFilter);

      // Dispensary
      if (dispId) {
        q = q.eq("dispensary_id", dispId);
      }

      // On sale
      if (saleOnly) {
        q = q.eq("on_sale", true);
      }

      // Terpene profile filter
      const profileParam = searchParams.get("profile") as ProfileKey | null;
      if (profileParam) {
        const profile = TERP_PROFILES.find((p) => p.key === profileParam);
        if (profile) {
          for (const f of profile.filters) {
            if (f.required) {
              // Required: column must exceed threshold (non-null)
              q = q.not(f.col, "is", null).gt(f.col, f.value);
            } else if (f.operator === "lt") {
              // Suppress: column must be null OR below threshold
              q = q.or(`${f.col}.is.null,${f.col}.lt.${f.value}`);
            }
          }
        }
      }

      // Sort — read directly from searchParams to avoid stale closure
      const sort = searchParams.get("sort");
      switch (sort) {
        case "value":
          q = q.order("mg_per_dollar", { ascending: false, nullsFirst: false });
          break;
        case "thc":
          q = q.order("thc_percentage", { ascending: false, nullsFirst: false });
          break;
        case "discount":
          q = q.order("on_sale", { ascending: false });
          q = q.order("original_price", { ascending: false, nullsFirst: false });
          break;
        case "size":
          q = q.order("weight_grams", { ascending: false, nullsFirst: false });
          break;
        default:
          q = q.order("price", { ascending: true, nullsFirst: false });
      }

      q = q.range(from, to);

      const { data, count, error } = await q;

      if (!cancelled) {
        if (!error) {
          const rows = (data ?? []) as Product[];
          setProducts(rows);
          setTotalCount(count ?? 0);
        }
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, query, category, sizeFilter, dispensaryFilter, saleOnly, sortField, sortDir, activeProfile, dispensaries]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ─── HOT TAKE BANNER ──────────────────────────────────────
  const ZIGGY_HOT_TAKES = [
    "Ziggy has reviewed the market. This is the one. Do not overthink it.",
    "This discount is real. Ziggy verified it personally. Go.",
    "The market produces deals like this maybe twice a week. This is one of them.",
    "Ziggy does not endorse products. Ziggy endorses math. The math here is good.",
    "You will not find a better price-per-unit on this right now. Ziggy checked.",
    "This is what a real deal looks like. Note the difference. Remember it.",
    "Ziggy has seen a thousand dispensary promotions. This one passes inspection.",
    "The discount is not marketing. The discount is real. The difference is significant.",
    "Other dispensaries are charging more for the same category right now. Just noting.",
    "Ziggy's hot take: buy it. Ziggy's cold take: also buy it.",
  ];

  const hotTakeIndex = hotDeal
    ? Math.abs(hotDeal.id.charCodeAt(0) + hotDeal.id.charCodeAt(1)) %
      ZIGGY_HOT_TAKES.length
    : 0;

  // ── Flush debounce immediately (shared by button click and Enter key) ──
  function flushSearch() {
    const params = new URLSearchParams(window.location.search);
    const trimmed = localQuery.trim();
    if (trimmed) params.set("search", trimmed);
    else params.delete("search");
    params.delete("page");
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  // ─── HANDLERS ─────────────────────────────────────────────
  const handleCategoryChange = (val: string) => {
    setParams({ category: val === "All" ? null : val, size: null, page: null });
  };

  const handleProfileSelect = (key: ProfileKey | null) => {
    setParams({ profile: key, page: null });
  };

  const handleSort = (field: SortField) => {
    if (field === "value") {
      if (!isPro) {
        setValueSortMsg(true);
        setTimeout(() => setValueSortMsg(false), 3000);
        return;
      }
      if (sortField !== "value") {
        setParams({ sort: "value", sort_dir: "desc", page: null });
      } else if (sortDir === "desc") {
        setParams({ sort: "value", sort_dir: "asc", page: null });
      } else {
        setParams({ sort: null, sort_dir: null, page: null });
      }
      return;
    }
    if (field === "size") {
      if (sortField !== "size") {
        setParams({ sort: "size", sort_dir: "desc", page: null });
      } else if (sortDir === "desc") {
        setParams({ sort: "size", sort_dir: "asc", page: null });
      } else {
        setParams({ sort: null, sort_dir: null, page: null });
      }
    } else if (sortField === field) {
      setParams({ sort_dir: sortDir === "asc" ? "desc" : "asc", page: null });
    } else {
      setParams({
        sort: field,
        sort_dir: field === "discount" || field === "thc" ? "desc" : "asc",
        page: null,
      });
    }
  };

  const sortIndicator = (field: SortField) =>
    sortField !== field ? " ↕" : sortDir === "asc" ? " ↑" : " ↓";

  const formatTimeAgo = (iso: string): { label: string; stale: boolean } => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    if (mins < 60) return { label: `Updated ${mins} min ago`, stale: false };
    if (hrs < 3) return { label: `Updated ${hrs} hr ago`, stale: false };
    return { label: `Updated ${hrs} hrs ago`, stale: true };
  };

  const calcDiscount = (p: Product) => {
    if (!p.original_price || !p.price || Number(p.original_price) <= Number(p.price))
      return null;
    return Math.round(
      ((Number(p.original_price) - Number(p.price)) / Number(p.original_price)) * 100
    );
  };

  const displayThc = (p: Product) => {
    if (!p.thc_percentage) return "—";
    return `${Number(p.thc_percentage).toFixed(1)}%`;
  };

  // ─── COMPARE ──────────────────────────────────────────────
  const handleCompare = async (productName: string) => {
    setCompareLoading(true);
    setCompareModal({ productName, results: [], totalCount: 0 });

    const { data } = await supabase
      .from("products")
      .select(
        "price, original_price, on_sale, product_url, dispensaries(name, platform, slug, dutchie_url)"
      )
      .ilike("name", productName)
      .eq("in_stock", true)
      .order("price", { ascending: true })
      .limit(50);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: CompareResult[] = (data ?? []).map((p: any) => {
      const disp = Array.isArray(p.dispensaries) ? p.dispensaries[0] : p.dispensaries;
      return {
        dispensaryName: disp?.name ?? "Unknown",
        price: p.price,
        original_price: p.original_price,
        on_sale: p.on_sale,
        discountPct:
          p.original_price && p.price && p.original_price > p.price
            ? Math.round(
                ((p.original_price - p.price) / p.original_price) * 100
              )
            : null,
        viewUrl: buildMenuUrl(
          disp?.platform,
          disp?.slug,
          disp?.dutchie_url,
          productName,
          disp?.name ?? ""
        ),
        productUrl: p.product_url || null,
      };
    });

    setCompareModal({ productName, results, totalCount: results.length });
    setCompareLoading(false);
  };

  const searchGridCols = showSizeFilter
    ? "minmax(160px, 1fr) auto auto auto auto"
    : "minmax(160px, 1fr) auto auto auto";

  return (
    <div className="prices-page">
      {/* Mini Masthead */}
      <div className="mini-masthead">
        <Link href="/" className="mini-masthead-link">
          <div className="mini-title-link">Daily Weed Newspaper</div>
          <div className="breadcrumb">
            Home → Price Intelligence Dashboard
            <span style={{ marginLeft: "16px", color: "var(--muted)" }}>
              {loading
                ? "Loading…"
                : `${totalCount.toLocaleString()} products`}{" "}
              &middot;{" "}
              {lastScraped ? (() => {
                const { label, stale } = formatTimeAgo(lastScraped);
                return (
                  <span style={stale ? { color: "var(--amber, #d97706)" } : undefined}>
                    {label}
                  </span>
                );
              })() : "Updated hourly"}
            </span>
          </div>
        </Link>
      </div>

      <h1 className="prices-h1">
        Las Vegas Cannabis Price Comparison
        {!loading && totalCount > 0 && (
          <span className="prices-h1-count"> — {totalCount.toLocaleString()} Products</span>
        )}
      </h1>

      {/* Terp Profile Selector */}
      <TerpProfileSelector
        activeProfile={activeProfile}
        onSelectProfile={handleProfileSelect}
      />

      {/* Search Zone */}
      <div className="search-zone">
        <div
          className="search-inputs"
          style={{ gridTemplateColumns: searchGridCols }}
        >
          <div>
            <label className="search-label">Search Product or Strain</label>
            <input
              className="search-input"
              type="text"
              placeholder="e.g. Blue Dream, OG Kush, gummies..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") flushSearch(); }}
            />
          </div>

          <div>
            <label className="search-label">Category</label>
            <select
              className="search-select"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Size / Dose — animated in/out */}
          <div
            style={{
              overflow: "hidden",
              maxWidth: showSizeFilter ? "160px" : "0px",
              opacity: showSizeFilter ? 1 : 0,
              transition: "max-width 0.2s ease, opacity 0.2s ease",
              pointerEvents: showSizeFilter ? "auto" : "none",
            }}
          >
            <label className="search-label">{sizeLabel}</label>
            <select
              className="search-select"
              value={sizeFilter}
              onChange={(e) =>
                setParams({ size: e.target.value === "all" ? null : e.target.value, page: null })
              }
              style={{ minWidth: "120px" }}
            >
              {(sizeOptions ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="search-label">Dispensary</label>
            <select
              className="search-select"
              value={dispensaryFilter}
              onChange={(e) =>
                setParams({ dispensary: e.target.value === "All" ? null : e.target.value, page: null })
              }
            >
              <option>All</option>
              {dispensaries.map((d) => (
                <option key={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <button
            className="search-button"
            onClick={flushSearch}
          >
            Search
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="filter-row">
        <button
          className={`filter-chip${sortField === "price" && sortDir === "asc" ? " active" : ""}`}
          onClick={() => setParams({ sort: null, sort_dir: null, page: null })}
        >
          Price ↑
        </button>
        <button
          className={`filter-chip${sortField === "price" && sortDir === "desc" ? " active" : ""}`}
          onClick={() => setParams({ sort: "price", sort_dir: "desc", page: null })}
        >
          Price ↓
        </button>
        <button
          className={`filter-chip${sortField === "discount" ? " active" : ""}`}
          onClick={() => handleSort("discount")}
        >
          Biggest Discount
        </button>
        <button
          className={`filter-chip${sortField === "thc" ? " active" : ""}`}
          onClick={() => handleSort("thc")}
        >
          Highest THC
        </button>
        <button
          className={`filter-chip${sortField === "value" ? " active" : ""}`}
          onClick={() => handleSort("value")}
        >
          Best Value
        </button>
        <span className="filter-spacer" />
        <button
          className={`filter-chip sale-toggle${saleOnly ? " active" : ""}`}
          onClick={() =>
            setParams({ sale_only: saleOnly ? null : "1", page: null })
          }
        >
          On Sale Only
        </button>
      </div>

      {/* Ziggy's Hot Take Banner */}
      {hotDeal && (
        <div
          style={{
            margin: "0 24px 0",
            padding: "14px 20px",
            background: "var(--aged)",
            borderLeft: "4px solid var(--deal-green)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--deal-green)",
                fontWeight: 700,
              }}
            >
              Ziggy&apos;s Hot Take
            </span>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <span
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              {hotDeal.name}
            </span>
            <span
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
                color: "var(--muted)",
                marginLeft: "8px",
              }}
            >
              @ {getDispName(hotDeal.dispensaries)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--deal-green)",
              }}
            >
              ${Number(hotDeal.price).toFixed(2)}
            </span>
            <span
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
                color: "var(--muted)",
                textDecoration: "line-through",
              }}
            >
              ${Number(hotDeal.original_price).toFixed(2)}
            </span>
            <span
              style={{
                background: "var(--deal-green)",
                color: "#fff",
                fontFamily: "Space Mono, monospace",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 6px",
              }}
            >
              -{hotDeal.discountPct}%
            </span>
          </div>
          <div
            style={{
              fontFamily: "Source Serif 4, serif",
              fontSize: "12px",
              fontStyle: "italic",
              color: "var(--muted)",
              flexBasis: "100%",
              borderTop: "1px solid rgba(26,16,8,0.12)",
              paddingTop: "8px",
              marginTop: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span>&ldquo;{ZIGGY_HOT_TAKES[hotTakeIndex]}&rdquo;</span>
            <button
              className="filter-chip active"
              style={{ flexShrink: 0, fontSize: "10px" }}
              onClick={() => setParams({ sale_only: "1", page: null })}
            >
              See all deals →
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="gork-empty">
          <p>Ziggy is scanning the market...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="gork-empty">
          <div className="gork-empty-headline">No Products Found</div>
          <p>
            No products found. Ziggy suggests broadening your search — or just
            drive to Decatur, they&apos;re winning today.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "10px",
              color: "var(--muted)",
              marginBottom: "8px",
            }}
          >
            {query.trim()
              ? `${totalCount.toLocaleString()} products matching "${query.trim()}"`
              : `${totalCount.toLocaleString()} products total`}
            {" · "}Showing {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, totalCount)} of{" "}
            {totalCount.toLocaleString()}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th
                    onClick={() => handleSort("size")}
                    style={{ cursor: "pointer" }}
                  >
                    Size
                    {sortField === "size"
                      ? sortDir === "desc"
                        ? " ↓"
                        : " ↑"
                      : ""}
                  </th>
                  <th>Dispensary</th>
                  <th onClick={() => handleSort("price")}>
                    Price{sortIndicator("price")}
                  </th>
                  <th
                    onClick={() => handleSort("value")}
                    style={{
                      cursor: "pointer",
                      color:
                        sortField === "value" ? "#34a529" : undefined,
                      position: "relative",
                    }}
                  >
                    mg/$
                    {sortField === "value"
                      ? sortDir === "desc"
                        ? " ↓"
                        : " ↑"
                      : ""}
                    {valueSortMsg && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          width: "180px",
                          fontFamily: "Space Mono, monospace",
                          fontSize: "9px",
                          color: "var(--muted)",
                          fontWeight: 400,
                          background: "var(--paper)",
                          border: "1px solid var(--aged)",
                          padding: "4px 6px",
                          zIndex: 10,
                          lineHeight: 1.4,
                        }}
                      >
                        Sort by value score is a Pro feature — $9/month
                      </div>
                    )}
                  </th>
                  <th onClick={() => handleSort("thc")}>
                    THC{sortIndicator("thc")}
                  </th>
                  <th onClick={() => handleSort("discount")}>
                    Discount{sortIndicator("discount")}
                  </th>
                  <th style={{ cursor: "default" }}>Compare</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const discount = calcDiscount(p);
                  const sizeDisplay = displayProductSize(
                    p.name,
                    p.category,
                    p.weight_grams
                  );
                  const mgpd = calcMgPerDollar(
                    p.name,
                    p.category,
                    p.thc_percentage,
                    p.weight_grams,
                    p.price
                  );
                  return (
                    <tr key={p.id || i} className={discount ? "on-sale" : ""}>
                      <td>
                        <span className="td-product-name">{p.name}</span>
                        {(p.brand || p.category) && (
                          <span className="td-brand">
                            {[p.brand, p.category].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="td-size">{sizeDisplay}</span>
                      </td>
                      <td>
                        <span className="td-dispensary">
                          {getDispName(p.dispensaries)}
                        </span>
                      </td>
                      <td>
                        <span className="td-price">
                          {p.price ? `$${Number(p.price).toFixed(2)}` : "—"}
                        </span>
                        {p.original_price && (
                          <span className="td-orig-price">
                            ${Number(p.original_price).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td>
                        {mgpd !== null ? (
                          <span className="td-value">{mgpd.toFixed(1)}</span>
                        ) : (
                          <span
                            style={{
                              color: "var(--muted)",
                              fontFamily: "Space Mono, monospace",
                              fontSize: "12px",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="td-thc">{displayThc(p)}</span>
                      </td>
                      <td>
                        {discount ? (
                          <span className="td-discount">-{discount}%</span>
                        ) : (
                          <span
                            style={{
                              color: "var(--muted)",
                              fontFamily: "Space Mono, monospace",
                              fontSize: "12px",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="compare-btn"
                          onClick={() => handleCompare(p.name)}
                        >
                          Compare Prices
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() =>
                  setParams({ page: page > 1 ? String(page - 1) : null })
                }
                disabled={page === 0}
              >
                ← Prev
              </button>
              <span
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "11px",
                  color: "var(--muted)",
                  padding: "0 12px",
                  alignSelf: "center",
                }}
              >
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="page-btn"
                onClick={() => setParams({ page: String(page + 1) })}
                disabled={page >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* COMPARE MODAL */}
      <AnimatePresence>
        {compareModal && (
          <>
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setCompareModal(null)}
            />
            <div className="modal-wrapper">
              <motion.div
                className="modal-box"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
              <div className="modal-header">
                <div>
                  <span className="kicker">Price Comparison</span>
                  <h2
                    className="font-headline"
                    style={{
                      fontSize: "18px",
                      fontWeight: 900,
                      marginTop: "2px",
                    }}
                  >
                    {compareModal.productName}
                  </h2>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setCompareModal(null)}
                >
                  ✕
                </button>
              </div>

              {compareLoading ? (
                <p
                  style={{
                    fontFamily: "Space Mono, monospace",
                    fontSize: "12px",
                    color: "var(--muted)",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  Ziggy is checking all dispensaries...
                </p>
              ) : compareModal.results.length === 0 ? (
                <p
                  style={{
                    fontFamily: "Space Mono, monospace",
                    fontSize: "12px",
                    color: "var(--muted)",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  Only found at one dispensary. No comparison available.
                </p>
              ) : (
                <>
                  <div
                    style={{
                      fontFamily: "Space Mono, monospace",
                      fontSize: "10px",
                      color: "var(--muted)",
                      marginBottom: "12px",
                    }}
                  >
                    Found at {compareModal.totalCount} dispensar
                    {compareModal.totalCount === 1 ? "y" : "ies"}
                    {compareModal.totalCount > FREE_COMPARE_LIMIT &&
                      ` — showing top ${FREE_COMPARE_LIMIT} free`}
                  </div>
                  <table className="compare-table">
                    <thead>
                      <tr>
                        <th>Dispensary</th>
                        <th>Price</th>
                        <th>Original</th>
                        <th>Discount</th>
                        <th style={{ textAlign: "right" }}>Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compareModal.results
                        .slice(0, FREE_COMPARE_LIMIT)
                        .map((r, i) => (
                          <tr
                            key={i}
                            className={r.on_sale ? "on-sale" : ""}
                            style={i === 0 ? { background: "#eef5eb" } : {}}
                          >
                            <td>
                              <span
                                style={{
                                  fontFamily: "Space Mono, monospace",
                                  fontSize: "12px",
                                }}
                              >
                                {i === 0 && (
                                  <span
                                    style={{
                                      background: "var(--deal-green)",
                                      color: "#fff",
                                      fontFamily: "Space Mono, monospace",
                                      fontSize: "9px",
                                      padding: "1px 5px",
                                      marginRight: "6px",
                                    }}
                                  >
                                    BEST
                                  </span>
                                )}
                                {r.dispensaryName}
                              </span>
                            </td>
                            <td>
                              <span
                                className="td-price"
                                style={{ fontSize: "14px" }}
                              >
                                ${r.price.toFixed(2)}
                              </span>
                            </td>
                            <td>
                              {r.original_price ? (
                                <span
                                  className="td-orig-price"
                                  style={{ display: "inline" }}
                                >
                                  ${r.original_price.toFixed(2)}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    color: "var(--muted)",
                                    fontFamily: "Space Mono, monospace",
                                    fontSize: "11px",
                                  }}
                                >
                                  —
                                </span>
                              )}
                            </td>
                            <td>
                              {r.discountPct ? (
                                <span className="td-discount">
                                  -{r.discountPct}%
                                </span>
                              ) : (
                                <span
                                  style={{
                                    color: "var(--muted)",
                                    fontFamily: "Space Mono, monospace",
                                    fontSize: "11px",
                                  }}
                                >
                                  —
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                              <span className="pro-badge">PRO</span>
                              <a
                                href={r.productUrl || r.viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view-menu-link"
                              >
                                {r.productUrl ? "View Product →" : "View Menu →"}
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {compareModal.totalCount > FREE_COMPARE_LIMIT && (
                    <div className="modal-upsell">
                      <div
                        style={{
                          fontFamily: "Space Mono, monospace",
                          fontSize: "10px",
                          color: "var(--muted)",
                          textAlign: "center",
                          padding: "8px 0 4px",
                          borderTop: "1px solid var(--aged)",
                        }}
                      >
                        +{compareModal.totalCount - FREE_COMPARE_LIMIT} more
                        dispensaries carrying this product — blurred below
                      </div>
                      <div className="blurred-rows">
                        {[
                          ...Array(
                            Math.min(
                              compareModal.totalCount - FREE_COMPARE_LIMIT,
                              3
                            )
                          ),
                        ].map((_, i) => (
                          <div key={i} className="blurred-row" />
                        ))}
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "16px",
                          background: "var(--aged)",
                          border: "1px solid var(--ink)",
                          marginTop: "8px",
                        }}
                      >
                        <div
                          className="font-headline"
                          style={{
                            fontSize: "15px",
                            fontWeight: 900,
                            marginBottom: "4px",
                          }}
                        >
                          Pro members see all {compareModal.totalCount}{" "}
                          dispensaries
                        </div>
                        <div
                          style={{
                            fontFamily: "Space Mono, monospace",
                            fontSize: "10px",
                            color: "var(--muted)",
                            marginBottom: "12px",
                          }}
                        >
                          $9/month · 7-day free trial · cancel anytime
                        </div>
                        <button
                          className="cta-button"
                          style={{
                            maxWidth: "220px",
                            margin: "0 auto",
                            display: "block",
                          }}
                          onClick={async () => {
                            const res = await fetch("/api/checkout", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({}),
                            });
                            if (res.ok) {
                              const { url } = await res.json();
                              window.location.href = url;
                            }
                          }}
                        >
                          Start Free Trial
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <footer className="site-footer">
        © {new Date().getFullYear()} Daily Weed Newspaper &middot;{" "}
        <Link href="/" style={{ color: "var(--accent)" }}>
          ← Back to Front Page
        </Link>
      </footer>
    </div>
  );
}
