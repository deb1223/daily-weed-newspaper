"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Product {
  id?: string | number;
  product_name?: string;
  name?: string;
  brand?: string;
  category?: string;
  dispensary_name?: string;
  price?: number | string;
  original_price?: number | string;
  thc?: number | string;
  thc_percentage?: number | string;
  [key: string]: unknown;
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

export default function PricesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dispensaries, setDispensaries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [dispensary, setDispensary] = useState("All");
  const [saleOnly, setSaleOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Schema check + dispensary list on mount
  useEffect(() => {
    supabase
      .from("dispensary_products")
      .select("*")
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          console.log("[DWN Prices] Schema keys:", Object.keys(data[0]));
        }
      });

    supabase
      .from("dispensary_products")
      .select("dispensary_name")
      .limit(2000)
      .then(({ data }) => {
        const unique = [
          ...new Set(
            (data ?? [])
              .map((d: { dispensary_name: string }) => d.dispensary_name)
              .filter(Boolean)
          ),
        ].sort() as string[];
        setDispensaries(unique);
      });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    // For discount sort, fetch on sale items ordered by price ascending then compute client-side
    const sortColumn =
      sortField === "discount"
        ? "price"
        : sortField === "thc"
        ? "thc"
        : "price";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase
      .from("dispensary_products")
      .select("*", { count: "exact" });

    if (query.trim()) {
      q = q.or(
        `product_name.ilike.%${query.trim()}%,name.ilike.%${query.trim()}%`
      );
    }

    if (category !== "All") {
      q = q.ilike("category", `%${category}%`);
    }

    if (dispensary !== "All") {
      q = q.eq("dispensary_name", dispensary);
    }

    if (saleOnly || sortField === "discount") {
      q = q.not("original_price", "is", null);
    }

    q = q.order(sortColumn, {
      ascending: sortDir === "asc",
      nullsFirst: false,
    });

    q = q.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count, error } = await q;

    if (error) {
      console.error("[DWN] Query error:", error);
    }

    let rows: Product[] = data ?? [];

    // Client-side discount sort since we can't sort by computed column
    if (sortField === "discount") {
      rows = rows
        .map((p) => ({
          ...p,
          _discountPct: calcDiscount(p) ?? 0,
        }))
        .sort((a, b) =>
          sortDir === "desc"
            ? (b._discountPct as number) - (a._discountPct as number)
            : (a._discountPct as number) - (b._discountPct as number)
        );
    }

    setProducts(rows);
    setTotal(count ?? 0);
    setLoading(false);
  }, [query, category, dispensary, saleOnly, sortField, sortDir, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "discount" ? "desc" : "asc");
    }
    setPage(0);
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const calcDiscount = (p: Product): number | null => {
    if (!p.original_price || !p.price) return null;
    const orig = Number(p.original_price);
    const sale = Number(p.price);
    if (orig <= 0 || sale <= 0) return null;
    const pct = Math.round(((orig - sale) / orig) * 100);
    return pct > 0 ? pct : null;
  };

  const displayName = (p: Product) =>
    p.product_name || p.name || "Unknown Product";

  const displayThc = (p: Product) => {
    const thc = p.thc ?? p.thc_percentage;
    if (thc === null || thc === undefined || thc === "") return "—";
    const n = Number(thc);
    if (isNaN(n)) return String(thc);
    return `${n.toFixed(1)}%`;
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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
        <div className="search-inputs">
          <div>
            <label className="search-label">Search Product or Strain</label>
            <input
              className="search-input"
              type="text"
              placeholder="e.g. Blue Dream, OG Kush, gummies..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
            />
          </div>
          <div>
            <label className="search-label">Category</label>
            <select
              className="search-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="search-label">Dispensary</label>
            <select
              className="search-select"
              value={dispensary}
              onChange={(e) => {
                setDispensary(e.target.value);
                setPage(0);
              }}
            >
              <option>All</option>
              {dispensaries.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <button className="search-button" onClick={() => { setPage(0); fetchProducts(); }}>
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
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            fontFamily: "Space Mono, monospace",
            fontSize: "12px",
            color: "var(--muted)",
          }}
        >
          Gork is scanning the market...
        </div>
      ) : products.length === 0 ? (
        <div className="gork-empty">
          <div className="gork-empty-headline">No Products Found</div>
          <p>
            No products found. Gork suggests broadening your search — or just
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
            Showing {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, total)} of{" "}
            {total.toLocaleString()} products
          </div>

          <table className="results-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Dispensary</th>
                <th onClick={() => handleSort("price")}>
                  Price{sortIndicator("price")}
                </th>
                <th onClick={() => handleSort("thc")}>
                  THC{sortIndicator("thc")}
                </th>
                <th onClick={() => handleSort("discount")}>
                  Discount{sortIndicator("discount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const discount = calcDiscount(p);
                return (
                  <tr key={String(p.id ?? i)} className={discount ? "on-sale" : ""}>
                    <td>
                      <span className="td-product-name">{displayName(p)}</span>
                      {p.brand && (
                        <span className="td-brand">{String(p.brand)}</span>
                      )}
                    </td>
                    <td>
                      <span className="td-category">{p.category || "—"}</span>
                    </td>
                    <td>
                      <span className="td-dispensary">
                        {p.dispensary_name || "—"}
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
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
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
                const startPage = Math.max(
                  0,
                  Math.min(page - 4, totalPages - 10)
                );
                const p = startPage + i;
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
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={page >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <footer className="site-footer">
        © {new Date().getFullYear()} Daily Weed Newspaper &middot;{" "}
        <Link href="/" style={{ color: "var(--accent)" }}>
          ← Back to Front Page
        </Link>
      </footer>
    </div>
  );
}
