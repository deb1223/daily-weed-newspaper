"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface CompareResult {
  dispensaryName: string;
  price: number;
  original_price: number | null;
  on_sale: boolean;
  discountPct: number | null;
  viewUrl: string;
  productUrl: string | null;
}

const FREE_COMPARE_LIMIT = 3;

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

interface Props {
  productName: string;
  isProUser: boolean;
  onClose: () => void;
}

export default function CompareModal({ productName, isProUser, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<CompareResult[]>([]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    supabase
      .from("products")
      .select("price, original_price, on_sale, product_url, dispensaries(name, platform, slug, dutchie_url)")
      .ilike("name", productName)
      .eq("in_stock", true)
      .order("price", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: CompareResult[] = (data ?? []).map((p: any) => {
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
            productUrl: p.product_url || null,
          };
        });
        setResults(mapped);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [productName]);

  const totalCount = results.length;

  return (
    <AnimatePresence>
      <>
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
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
                  style={{ fontSize: "18px", fontWeight: 900, marginTop: "2px" }}
                >
                  {productName}
                </h2>
              </div>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            {loading ? (
              <p style={{ fontFamily: "Space Mono, monospace", fontSize: "12px", color: "var(--muted)", padding: "24px", textAlign: "center" }}>
                Ziggy is checking all dispensaries...
              </p>
            ) : totalCount === 0 ? (
              <p style={{ fontFamily: "Space Mono, monospace", fontSize: "12px", color: "var(--muted)", padding: "24px", textAlign: "center" }}>
                Only found at one dispensary. No comparison available.
              </p>
            ) : (
              <>
                <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginBottom: "12px" }}>
                  Found at {totalCount} dispensar{totalCount === 1 ? "y" : "ies"}
                  {!isProUser && totalCount > FREE_COMPARE_LIMIT && ` — showing top ${FREE_COMPARE_LIMIT} free`}
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
                    {results
                      .slice(0, isProUser ? undefined : FREE_COMPARE_LIMIT)
                      .map((r, i) => (
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
                          <td>
                            <span className="td-price" style={{ fontSize: "14px" }}>${r.price.toFixed(2)}</span>
                          </td>
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
                            {isProUser ? (
                              <a href={r.productUrl || r.viewUrl} target="_blank" rel="noopener noreferrer" className="view-menu-link">
                                {r.productUrl ? "View Product →" : "View Menu →"}
                              </a>
                            ) : (
                              <span style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)" }}>Pro only</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {!isProUser && totalCount > FREE_COMPARE_LIMIT && (
                  <div className="modal-upsell">
                    <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", textAlign: "center", padding: "8px 0 4px", borderTop: "1px solid var(--aged)" }}>
                      +{totalCount - FREE_COMPARE_LIMIT} more dispensaries carrying this product — blurred below
                    </div>
                    <div className="blurred-rows">
                      {[...Array(Math.min(totalCount - FREE_COMPARE_LIMIT, 3))].map((_, i) => (
                        <div key={i} className="blurred-row" />
                      ))}
                    </div>
                    <div style={{ textAlign: "center", padding: "16px", background: "var(--aged)", border: "1px solid var(--ink)", marginTop: "8px" }}>
                      <div className="font-headline" style={{ fontSize: "15px", fontWeight: 900, marginBottom: "4px" }}>
                        Pro members see all {totalCount} dispensaries
                      </div>
                      <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginBottom: "12px" }}>
                        $9/month · 7-day free trial · cancel anytime
                      </div>
                      <button
                        className="cta-button"
                        style={{ maxWidth: "220px", margin: "0 auto", display: "block" }}
                        onClick={async () => {
                          const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
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
    </AnimatePresence>
  );
}
