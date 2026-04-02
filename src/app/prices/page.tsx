"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { displayProductSize } from "@/lib/format";

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
  dispensaries: Dispensary | null;
}

interface CompareResult {
  dispensaryName: string;
  price: number;
  original_price: number | null;
  on_sale: boolean;
  discountPct: number | null;
}

type SortField = "price" | "thc" | "discount";
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

// ─── SIZE FILTER APPLICATION ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySizeFilter(q: any, cat: string, size: string): any {
  if (size === "all" || !size) return q;

  const gramRanges: Record<string, Record<string, [number, number]>> = {
    Flower: {
      "1g":   [0.9,  1.1],
      "3.5g": [3.0,  4.0],
      "7g":   [6.5,  7.5],
      "14g":  [13,   15],
      "28g":  [27,   30],
    },
    "Pre-Rolls": {
      "0.5g": [0.4, 0.6],
      "1g":   [0.9, 1.2],
    },
    Vape: {
      "0.3g": [0.25, 0.35],
      "0.5g": [0.4,  0.6],
      "1g":   [0.9,  1.2],
      "2g":   [1.8,  2.2],
    },
    Concentrates: {
      "0.5g": [0.4, 0.6],
      "1g":   [0.9, 1.2],
      "2g":   [1.8, 2.2],
    },
  };

  const ranges = gramRanges[cat];
  if (ranges?.[size]) {
    const [lo, hi] = ranges[size];
    return q.gte("weight_grams", lo).lte("weight_grams", hi);
  }

  // Pre-roll pack sizes — match name
  if (cat === "Pre-Rolls") {
    if (size === "2pk") return q.or("name.ilike.%2pk%,name.ilike.%2-pack%,name.ilike.%2 pack%");
    if (size === "5pk") return q.or("name.ilike.%5pk%,name.ilike.%5-pack%,name.ilike.%5 pack%");
  }

  // Edibles/Tinctures — mg in name
  if (cat === "Edibles" || cat === "Tinctures") {
    if (size === "200mg+") {
      return q.or(
        "name.ilike.%200mg%,name.ilike.%250mg%,name.ilike.%300mg%,name.ilike.%400mg%," +
        "name.ilike.%500mg%,name.ilike.%600mg%,name.ilike.%750mg%,name.ilike.%1000mg%"
      );
    }
    return q.ilike("name", `%${size}%`);
  }

  return q;
}

const CAT_MAP: Record<string, string[]> = {
  Flower:       ["Flower", "flower"],
  "Pre-Rolls":  ["Pre-Rolls", "pre-roll"],
  Edibles:      ["Edible", "Edibles", "edible"],
  Vape:         ["Vape", "vape", "Vaporizers"],
  Concentrates: ["Concentrate", "Concentrates", "extract"],
  Tinctures:    ["Tincture", "Oral", "oral"],
  Accessories:  ["Accessories", "Accessory", "CBD"],
};

export default function PricesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dispensaries, setDispensaries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [dispensary, setDispensary] = useState("All");
  const [saleOnly, setSaleOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Compare modal
  const [compareModal, setCompareModal] = useState<{
    productName: string;
    results: CompareResult[];
    totalCount: number;
  } | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Derived: does this category have size options?
  const sizeOptions = SIZE_OPTIONS[category] ?? null;
  const sizeLabel = category === "Edibles" || category === "Tinctures" ? "Dose" : "Size";
  const showSizeFilter = !!sizeOptions;

  // Schema log + dispensary list
  useEffect(() => {
    supabase.from("products").select("*").limit(1).then(({ data }) => {
      if (data?.[0]) console.log("[DWN Prices] Schema:", Object.keys(data[0]));
    });
    supabase
      .from("dispensaries")
      .select("name")
      .neq("slug", "__test__")
      .then(({ data }) => {
        const names = ((data ?? []) as { name: string }[])
          .map((d) => d.name)
          .filter(Boolean)
          .sort();
        setDispensaries(names);
      });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase
      .from("products")
      .select("*, dispensaries(name)", { count: "exact" })
      .eq("in_stock", true);

    if (query.trim()) {
      q = q.ilike("name", `%${query.trim()}%`);
    }

    if (category !== "All") {
      const variants = CAT_MAP[category];
      q = variants ? q.in("category", variants) : q.ilike("category", `%${category}%`);
    }

    // Size filter
    if (showSizeFilter && sizeFilter !== "all") {
      q = applySizeFilter(q, category, sizeFilter);
    }

    if (dispensary !== "All") {
      const { data: dispData } = await supabase
        .from("dispensaries")
        .select("id")
        .eq("name", dispensary)
        .single();
      if (dispData?.id) q = q.eq("dispensary_id", dispData.id);
    }

    if (saleOnly) {
      q = q.eq("on_sale", true);
    }

    const sortCol =
      sortField === "discount" ? "price"
      : sortField === "thc" ? "thc_percentage"
      : "price";
    q = q.order(sortCol, { ascending: sortDir === "asc", nullsFirst: false });
    q = q.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count, error } = await q;
    if (error) console.error("[DWN] Query error:", error);

    let rows: Product[] = (data ?? []) as Product[];

    if (sortField === "discount") {
      rows = rows
        .map((p) => ({
          ...p,
          _disc:
            p.original_price && p.price && p.original_price > p.price
              ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
              : 0,
        }))
        .sort((a, b) =>
          sortDir === "desc"
            ? (b as unknown as { _disc: number })._disc - (a as unknown as { _disc: number })._disc
            : (a as unknown as { _disc: number })._disc - (b as unknown as { _disc: number })._disc
        );
    }

    setProducts(rows);
    setTotal(count ?? 0);
    setLoading(false);
  }, [query, category, sizeFilter, showSizeFilter, dispensary, saleOnly, sortField, sortDir, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset size filter when category changes
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSizeFilter("all");
    setPage(0);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "discount" ? "desc" : "asc");
    }
    setPage(0);
  };

  const sortIndicator = (field: SortField) =>
    sortField !== field ? " ↕" : sortDir === "asc" ? " ↑" : " ↓";

  const calcDiscount = (p: Product) => {
    if (!p.original_price || !p.price || p.original_price <= p.price) return null;
    return Math.round(((p.original_price - p.price) / p.original_price) * 100);
  };

  const displayThc = (p: Product) => {
    if (!p.thc_percentage) return "—";
    return `${Number(p.thc_percentage).toFixed(1)}%`;
  };

  // ─── COMPARE ────────────────────────────────────────────────
  const handleCompare = async (productName: string) => {
    setCompareLoading(true);
    setCompareModal({ productName, results: [], totalCount: 0 });

    const { data } = await supabase
      .from("products")
      .select("price, original_price, on_sale, dispensaries(name)")
      .ilike("name", productName)
      .eq("in_stock", true)
      .order("price", { ascending: true })
      .limit(50);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: CompareResult[] = (data ?? []).map((p: any) => ({
      dispensaryName:
        (Array.isArray(p.dispensaries) ? p.dispensaries[0]?.name : p.dispensaries?.name) ??
        "Unknown",
      price: p.price,
      original_price: p.original_price,
      on_sale: p.on_sale,
      discountPct:
        p.original_price && p.price && p.original_price > p.price
          ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
          : null,
    }));

    setCompareModal({ productName, results, totalCount: results.length });
    setCompareLoading(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Grid columns for search-inputs: grow when size filter is visible
  const searchGridCols = showSizeFilter
    ? "1fr auto auto auto auto"
    : "1fr auto auto auto";

  return (
    <div className="prices-page">
      {/* Mini Masthead */}
      <div className="mini-masthead">
        <div className="mini-title">Daily Weed Newspaper</div>
        <div className="breadcrumb">
          <Link href="/">Home</Link> → Price Intelligence Dashboard
          <span style={{ marginLeft: "16px", color: "var(--muted)" }}>
            {total.toLocaleString()} products &middot; Updated {today}
          </span>
        </div>
      </div>

      {/* Search Zone */}
      <div className="search-zone">
        <div className="search-inputs" style={{ gridTemplateColumns: searchGridCols }}>
          {/* Text search */}
          <div>
            <label className="search-label">Search Product or Strain</label>
            <input
              className="search-input"
              type="text"
              placeholder="e.g. Blue Dream, OG Kush, gummies..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
            />
          </div>

          {/* Category */}
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
              onChange={(e) => { setSizeFilter(e.target.value); setPage(0); }}
              style={{ minWidth: "120px" }}
            >
              {(sizeOptions ?? []).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Dispensary */}
          <div>
            <label className="search-label">Dispensary</label>
            <select
              className="search-select"
              value={dispensary}
              onChange={(e) => { setDispensary(e.target.value); setPage(0); }}
            >
              <option>All</option>
              {dispensaries.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <button
            className="search-button"
            onClick={() => { setPage(0); fetchProducts(); }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="filter-row">
        <button
          className={`filter-chip${sortField === "price" && sortDir === "asc" ? " active" : ""}`}
          onClick={() => { setSortField("price"); setSortDir("asc"); setPage(0); }}
        >
          Price ↑
        </button>
        <button
          className={`filter-chip${sortField === "price" && sortDir === "desc" ? " active" : ""}`}
          onClick={() => { setSortField("price"); setSortDir("desc"); setPage(0); }}
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
          onClick={() => { setSaleOnly((v) => !v); setPage(0); }}
        >
          On Sale Only
        </button>
      </div>

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
          <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginBottom: "8px" }}>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of{" "}
            {total.toLocaleString()} products
          </div>

          <table className="results-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Size</th>
                <th>Dispensary</th>
                <th onClick={() => handleSort("price")}>Price{sortIndicator("price")}</th>
                <th onClick={() => handleSort("thc")}>THC{sortIndicator("thc")}</th>
                <th onClick={() => handleSort("discount")}>Discount{sortIndicator("discount")}</th>
                <th style={{ cursor: "default" }}>Compare</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const discount = calcDiscount(p);
                const sizeDisplay = displayProductSize(p.name, p.category, p.weight_grams);
                return (
                  <tr key={p.id || i} className={discount ? "on-sale" : ""}>
                    <td>
                      <span className="td-product-name">{p.name}</span>
                      {p.brand && <span className="td-brand">{p.brand}</span>}
                    </td>
                    <td>
                      <span className="td-category">{p.category || "—"}</span>
                    </td>
                    <td>
                      <span className="td-size">{sizeDisplay}</span>
                    </td>
                    <td>
                      <span className="td-dispensary">{p.dispensaries?.name || "—"}</span>
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
