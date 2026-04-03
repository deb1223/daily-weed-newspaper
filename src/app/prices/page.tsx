"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { displayProductSize, calcMgPerDollar } from "@/lib/format";

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
}

type SortField = "price" | "thc" | "discount" | "size" | "value";
type SortDir = "asc" | "desc";

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

// ─── CLIENT-SIDE SIZE FILTER ───────────────────────────────────
function applyClientSizeFilter(rows: Product[], cat: string, size: string): Product[] {
  if (size === "all" || !size) return rows;

  const gramRanges: Record<string, Record<string, [number, number]>> = {
    Flower:       { "1g": [0.85,1.15], "3.5g": [3.0,4.0], "7g": [6.0,8.0], "14g": [12.0,16.0], "28g": [24.0,32.0] },
    "Pre-Rolls":  { "0.5g": [0.4,0.6], "1g": [0.85,1.15] },
    Vape:         { "0.3g": [0.25,0.35], "0.5g": [0.4,0.6], "1g": [0.85,1.15], "2g": [1.7,2.3] },
    Concentrates: { "0.5g": [0.4,0.6], "1g": [0.85,1.15], "2g": [1.7,2.3] },
  };

  const ranges = gramRanges[cat];
  if (ranges?.[size]) {
    const [lo, hi] = ranges[size];
    return rows.filter(
      (p) => p.weight_grams != null && Number(p.weight_grams) >= lo && Number(p.weight_grams) <= hi
    );
  }

  if (cat === "Pre-Rolls") {
    if (size === "2pk") return rows.filter((p) => /2[\s-]?p(?:k|ack)/i.test(p.name));
    if (size === "5pk") return rows.filter((p) => /5[\s-]?p(?:k|ack)/i.test(p.name));
  }

  if (cat === "Edibles" || cat === "Tinctures") {
    if (size === "200mg+") {
      return rows.filter((p) => {
        const m = p.name.match(/(?:^|\D)(\d+)mg/i);
        return m ? parseInt(m[1]) >= 200 : false;
      });
    }
    // \b word boundary: \b10mg\b won't match "100mg"
    const mgVal = size.replace("mg", "");
    const regex = new RegExp(`\\b${mgVal}mg\\b`, "i");
    return rows.filter((p) => regex.test(p.name));
  }

  return rows;
}

// ─── HELPERS ──────────────────────────────────────────────────
function getDispName(dispensaries: Product["dispensaries"]): string {
  return (Array.isArray(dispensaries) ? dispensaries[0]?.name : dispensaries?.name) ?? "—";
}

export default function PricesPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dispensaries, setDispensaries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [dispensary, setDispensary] = useState("All");
  const [saleOnly, setSaleOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Pro gate state for value sort tooltip
  const isPro = true; // wire to auth later
  const [valueSortMsg, setValueSortMsg] = useState(false);

  // Compare modal
  const [compareModal, setCompareModal] = useState<{
    productName: string;
    results: CompareResult[];
    totalCount: number;
  } | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const sizeOptions = SIZE_OPTIONS[category] ?? null;
  const sizeLabel = category === "Edibles" || category === "Tinctures" ? "Dose" : "Size";
  const showSizeFilter = !!sizeOptions;

  // ─── LOAD ALL PRODUCTS ONCE ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("id, name, brand, category, weight_grams, price, original_price, on_sale, thc_percentage, dispensary_id, dispensaries(name)")
        .eq("in_stock", true)
        .limit(5000);
      if (!cancelled) {
        setAllProducts((data ?? []) as Product[]);
        setLoading(false);
      }
    }

    loadAll();

    supabase
      .from("dispensaries")
      .select("name")
      .neq("slug", "__test__")
      .then(({ data }) => {
        if (!cancelled) {
          const names = ((data ?? []) as { name: string }[])
            .map((d) => d.name)
            .filter(Boolean)
            .sort();
          setDispensaries(names);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // Reset page whenever any filter/sort changes
  useEffect(() => {
    setPage(0);
  }, [query, category, sizeFilter, dispensary, saleOnly, sortField, sortDir]);

  // ─── REACTIVE FILTER + SORT ────────────────────────────────
  const filteredProducts = useMemo(() => {
    let rows = allProducts;

    // Require weight_grams and thc_percentage unless it's an Accessory
    rows = rows.filter((p) => {
      const isAccessory = CAT_MAP["Accessories"].includes(p.category ?? "");
      if (isAccessory) return true;
      return (p.weight_grams != null && Number(p.weight_grams) > 0) && p.thc_percentage != null;
    });

    // Text search: name OR brand
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q)
      );
    }

    // Category
    if (category !== "All") {
      const variants = CAT_MAP[category] ?? [category];
      rows = rows.filter((p) => variants.includes(p.category ?? ""));
    }

    // Size / Dose
    if (showSizeFilter && sizeFilter !== "all") {
      rows = applyClientSizeFilter(rows, category, sizeFilter);
    }

    // Dispensary
    if (dispensary !== "All") {
      rows = rows.filter((p) => getDispName(p.dispensaries) === dispensary);
    }

    // On sale
    if (saleOnly) {
      rows = rows.filter(
        (p) =>
          p.on_sale ||
          (p.original_price != null && p.price != null && Number(p.original_price) > Number(p.price))
      );
    }

    // Sort
    return [...rows].sort((a, b) => {
      if (sortField === "price") {
        const va = a.price != null ? Number(a.price) : (sortDir === "asc" ? Infinity : -Infinity);
        const vb = b.price != null ? Number(b.price) : (sortDir === "asc" ? Infinity : -Infinity);
        return sortDir === "asc" ? va - vb : vb - va;
      }
      if (sortField === "thc") {
        const va = a.thc_percentage != null ? Number(a.thc_percentage) : (sortDir === "desc" ? -Infinity : Infinity);
        const vb = b.thc_percentage != null ? Number(b.thc_percentage) : (sortDir === "desc" ? -Infinity : Infinity);
        return sortDir === "asc" ? va - vb : vb - va;
      }
      if (sortField === "discount") {
        const disc = (p: Product) =>
          p.original_price && p.price && Number(p.original_price) > Number(p.price)
            ? (Number(p.original_price) - Number(p.price)) / Number(p.original_price)
            : 0;
        const va = disc(a), vb = disc(b);
        return sortDir === "desc" ? vb - va : va - vb;
      }
      if (sortField === "value") {
        const va = calcMgPerDollar(a.name, a.category, a.thc_percentage, a.weight_grams, a.price);
        const vb = calcMgPerDollar(b.name, b.category, b.thc_percentage, b.weight_grams, b.price);
        if (va === null && vb === null) return 0;
        if (va === null) return 1;
        if (vb === null) return -1;
        return sortDir === "desc" ? vb - va : va - vb;
      }
      if (sortField === "size") {
        if (category === "Edibles" || category === "Tinctures") {
          const getMg = (p: Product) => {
            const m = p.name.match(/(?:^|\D)(\d+)mg/i);
            return m ? parseInt(m[1]) : null;
          };
          const va = getMg(a), vb = getMg(b);
          if (va === null && vb === null) return 0;
          if (va === null) return 1;
          if (vb === null) return -1;
          return sortDir === "desc" ? vb - va : va - vb;
        }
        const va = a.weight_grams != null ? Number(a.weight_grams) : null;
        const vb = b.weight_grams != null ? Number(b.weight_grams) : null;
        if (va === null && vb === null) return 0;
        if (va === null) return 1;
        if (vb === null) return -1;
        return sortDir === "desc" ? vb - va : va - vb;
      }
      return 0;
    });
  }, [allProducts, query, category, sizeFilter, showSizeFilter, dispensary, saleOnly, sortField, sortDir]);

  const totalFiltered = filteredProducts.length;
  const pageProducts = filteredProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

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

  const hotDeal = useMemo(() => {
    const candidates = allProducts
      .filter((p) => p.on_sale && p.original_price != null && p.price != null && Number(p.original_price) > Number(p.price))
      .map((p) => ({
        ...p,
        discountPct: Math.round(((Number(p.original_price) - Number(p.price)) / Number(p.original_price)) * 100),
      }))
      .filter((p) => p.discountPct >= 15)
      .sort((a, b) => b.discountPct - a.discountPct);
    return candidates[0] ?? null;
  }, [allProducts]);

  const hotTakeIndex = useMemo(() => {
    if (!hotDeal) return 0;
    return Math.abs(hotDeal.id.charCodeAt(0) + hotDeal.id.charCodeAt(1)) % ZIGGY_HOT_TAKES.length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotDeal]);

  // ─── HANDLERS ─────────────────────────────────────────────
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSizeFilter("all");
  };

  const handleSort = (field: SortField) => {
    if (field === "value") {
      if (!isPro) {
        setValueSortMsg(true);
        setTimeout(() => setValueSortMsg(false), 3000);
        return;
      }
      if (sortField !== "value") {
        setSortField("value");
        setSortDir("desc"); // first click: highest mg/$ first
      } else if (sortDir === "desc") {
        setSortDir("asc");
      } else {
        setSortField("price");
        setSortDir("asc");
      }
      return;
    }
    if (field === "size") {
      if (sortField !== "size") {
        setSortField("size");
        setSortDir("desc");
      } else if (sortDir === "desc") {
        setSortDir("asc");
      } else {
        setSortField("price");
        setSortDir("asc");
      }
    } else if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "discount" ? "desc" : "asc");
    }
  };

  const sortIndicator = (field: SortField) =>
    sortField !== field ? " ↕" : sortDir === "asc" ? " ↑" : " ↓";

  const calcDiscount = (p: Product) => {
    if (!p.original_price || !p.price || Number(p.original_price) <= Number(p.price)) return null;
    return Math.round(((Number(p.original_price) - Number(p.price)) / Number(p.original_price)) * 100);
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
      .select("price, original_price, on_sale, dispensaries(name, platform, slug, dutchie_url)")
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
            ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
            : null,
        viewUrl: buildMenuUrl(disp?.platform, disp?.slug, disp?.dutchie_url, productName, disp?.name ?? ""),
      };
    });

    setCompareModal({ productName, results, totalCount: results.length });
    setCompareLoading(false);
  };

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const searchGridCols = showSizeFilter
    ? "1fr auto auto auto auto"
    : "1fr auto auto auto";

  return (
    <div className="prices-page">
      {/* Mini Masthead */}
      <div className="mini-masthead">
        <Link href="/" className="mini-masthead-link">
          <div className="mini-title-link">Daily Weed Newspaper</div>
          <div className="breadcrumb">
            Home → Price Intelligence Dashboard
            <span style={{ marginLeft: "16px", color: "var(--muted)" }}>
              {loading ? "Loading…" : `${totalFiltered.toLocaleString()} products`} &middot; Updated {today}
            </span>
          </div>
        </Link>
      </div>

      {/* Search Zone */}
      <div className="search-zone">
        <div className="search-inputs" style={{ gridTemplateColumns: searchGridCols }}>
          <div>
            <label className="search-label">Search Product or Strain</label>
            <input
              className="search-input"
              type="text"
              placeholder="e.g. Blue Dream, OG Kush, gummies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="search-label">Category</label>
            <select
              className="search-select"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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
              onChange={(e) => setSizeFilter(e.target.value)}
              style={{ minWidth: "120px" }}
            >
              {(sizeOptions ?? []).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="search-label">Dispensary</label>
            <select
              className="search-select"
              value={dispensary}
              onChange={(e) => setDispensary(e.target.value)}
            >
              <option>All</option>
              {dispensaries.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <button className="search-button" onClick={() => setPage(0)}>
            Search
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="filter-row">
        <button
          className={`filter-chip${sortField === "price" && sortDir === "asc" ? " active" : ""}`}
          onClick={() => { setSortField("price"); setSortDir("asc"); }}
        >
          Price ↑
        </button>
        <button
          className={`filter-chip${sortField === "price" && sortDir === "desc" ? " active" : ""}`}
          onClick={() => { setSortField("price"); setSortDir("desc"); }}
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
        <span className="filter-spacer" />
        <button
          className={`filter-chip sale-toggle${saleOnly ? " active" : ""}`}
          onClick={() => setSaleOnly((v) => !v)}
        >
          On Sale Only
        </button>
      </div>

      {/* Ziggy's Hot Take Banner */}
      {!loading && hotDeal && (
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
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
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexShrink: 0 }}>
            <span style={{ fontFamily: "Space Mono, monospace", fontSize: "16px", fontWeight: 700, color: "var(--deal-green)" }}>
              ${Number(hotDeal.price).toFixed(2)}
            </span>
            <span style={{ fontFamily: "Space Mono, monospace", fontSize: "11px", color: "var(--muted)", textDecoration: "line-through" }}>
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
              onClick={() => setSaleOnly(true)}
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
      ) : pageProducts.length === 0 ? (
        <div className="gork-empty">
          <div className="gork-empty-headline">No Products Found</div>
          <p>
            No products found. Ziggy suggests broadening your search — or just
            drive to Decatur, they&apos;re winning today.
          </p>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginBottom: "8px" }}>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalFiltered)} of{" "}
            {totalFiltered.toLocaleString()} products
          </div>

          <table className="results-table">
            <thead>
              <tr>
                <th>Product</th>
                <th onClick={() => handleSort("size")} style={{ cursor: "pointer" }}>
                  Size{sortField === "size" ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                </th>
                <th>Dispensary</th>
                <th onClick={() => handleSort("price")}>Price{sortIndicator("price")}</th>
                <th
                  onClick={() => handleSort("value")}
                  style={{ cursor: "pointer", color: sortField === "value" ? "#2d6a4f" : undefined, position: "relative" }}
                >
                  mg/${sortField === "value" ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                  {valueSortMsg && (
                    <div style={{ position: "absolute", top: "100%", left: 0, width: "180px", fontFamily: "Space Mono, monospace", fontSize: "9px", color: "var(--muted)", fontWeight: 400, background: "var(--paper)", border: "1px solid var(--aged)", padding: "4px 6px", zIndex: 10, lineHeight: 1.4 }}>
                      Sort by value score is a Pro feature — $9/month
                    </div>
                  )}
                </th>
                <th onClick={() => handleSort("thc")}>THC{sortIndicator("thc")}</th>
                <th onClick={() => handleSort("discount")}>Discount{sortIndicator("discount")}</th>
                <th style={{ cursor: "default" }}>Compare</th>
              </tr>
            </thead>
            <tbody>
              {pageProducts.map((p, i) => {
                const discount = calcDiscount(p);
                const sizeDisplay = displayProductSize(p.name, p.category, p.weight_grams);
                const mgpd = calcMgPerDollar(p.name, p.category, p.thc_percentage, p.weight_grams, p.price);
                return (
                  <tr key={p.id || i} className={discount ? "on-sale" : ""}>
                    <td>
                      <span className="td-product-name">{p.name}</span>
                      {p.brand && <span className="td-brand">{p.brand}</span>}
                    </td>
                    <td>
                      <span className="td-size">{sizeDisplay}</span>
                    </td>
                    <td>
                      <span className="td-dispensary">{getDispName(p.dispensaries)}</span>
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
                        <span style={{ color: "var(--muted)", fontFamily: "Space Mono, monospace", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className="td-thc">{displayThc(p)}</span>
                    </td>
                    <td>
                      {discount ? (
                        <span className="td-discount">-{discount}%</span>
                      ) : (
                        <span style={{ color: "var(--muted)", fontFamily: "Space Mono, monospace", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                    <td>
                      <button className="compare-btn" onClick={() => handleCompare(p.name)}>
                        Compare Prices
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 4, totalPages - 10));
                const p = start + i;
                return (
                  <button
                    key={p}
                    className={`page-btn${p === page ? " active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
                  <h2 className="font-headline" style={{ fontSize: "18px", fontWeight: 900, marginTop: "2px" }}>
                    {compareModal.productName}
                  </h2>
                </div>
                <button className="modal-close" onClick={() => setCompareModal(null)}>✕</button>
              </div>

              {compareLoading ? (
                <p style={{ fontFamily: "Space Mono, monospace", fontSize: "12px", color: "var(--muted)", padding: "24px", textAlign: "center" }}>
                  Ziggy is checking all dispensaries...
                </p>
              ) : compareModal.results.length === 0 ? (
                <p style={{ fontFamily: "Space Mono, monospace", fontSize: "12px", color: "var(--muted)", padding: "24px", textAlign: "center" }}>
                  Only found at one dispensary. No comparison available.
                </p>
              ) : (
                <>
                  <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginBottom: "12px" }}>
                    Found at {compareModal.totalCount} dispensar{compareModal.totalCount === 1 ? "y" : "ies"}
                    {compareModal.totalCount > FREE_COMPARE_LIMIT && ` — showing top ${FREE_COMPARE_LIMIT} free`}
                  </div>
                  <table className="compare-table">
                    <thead>
                      <tr>
                        <th>Dispensary</th>
                        <th>Price</th>
                        <th>Original</th>
                        <th>Discount</th>
                        <th style={{ textAlign: "right" }}>Menu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compareModal.results.slice(0, FREE_COMPARE_LIMIT).map((r, i) => (
                        <tr key={i} className={r.on_sale ? "on-sale" : ""} style={i === 0 ? { background: "#eef5eb" } : {}}>
                          <td>
                            <span style={{ fontFamily: "Space Mono, monospace", fontSize: "12px" }}>
                              {i === 0 && (
                                <span style={{ background: "var(--deal-green)", color: "#fff", fontFamily: "Space Mono, monospace", fontSize: "9px", padding: "1px 5px", marginRight: "6px" }}>
                                  BEST
                                </span>
                              )}
                              {r.dispensaryName}
                            </span>
                          </td>
                          <td><span className="td-price" style={{ fontSize: "14px" }}>${r.price.toFixed(2)}</span></td>
                          <td>
                            {r.original_price ? (
                              <span className="td-orig-price" style={{ display: "inline" }}>${r.original_price.toFixed(2)}</span>
                            ) : (
                              <span style={{ color: "var(--muted)", fontFamily: "Space Mono, monospace", fontSize: "11px" }}>—</span>
                            )}
                          </td>
                          <td>
                            {r.discountPct ? (
                              <span className="td-discount">-{r.discountPct}%</span>
                            ) : (
                              <span style={{ color: "var(--muted)", fontFamily: "Space Mono, monospace", fontSize: "11px" }}>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <span className="pro-badge">PRO</span>
                            <a
                              href={r.viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-menu-link"
                            >
                              View Menu →
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {compareModal.totalCount > FREE_COMPARE_LIMIT && (
                    <div className="modal-upsell">
                      <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", textAlign: "center", padding: "8px 0 4px", borderTop: "1px solid var(--aged)" }}>
                        +{compareModal.totalCount - FREE_COMPARE_LIMIT} more dispensaries carrying this product — blurred below
                      </div>
                      <div className="blurred-rows">
                        {[...Array(Math.min(compareModal.totalCount - FREE_COMPARE_LIMIT, 3))].map((_, i) => (
                          <div key={i} className="blurred-row" />
                        ))}
                      </div>
                      <div style={{ textAlign: "center", padding: "16px", background: "var(--aged)", border: "1px solid var(--ink)", marginTop: "8px" }}>
                        <div className="font-headline" style={{ fontSize: "15px", fontWeight: 900, marginBottom: "4px" }}>
                          Pro members see all {compareModal.totalCount} dispensaries
                        </div>
                        <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginBottom: "12px" }}>
                          $9/month · 7-day free trial · cancel anytime
                        </div>
                        <button className="cta-button" style={{ maxWidth: "220px", margin: "0 auto", display: "block" }}>
                          Start Free Trial
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="site-footer">
        © {new Date().getFullYear()} Daily Weed Newspaper &middot;{" "}
        <Link href="/" style={{ color: "var(--accent)" }}>← Back to Front Page</Link>
      </footer>
    </div>
  );
}
