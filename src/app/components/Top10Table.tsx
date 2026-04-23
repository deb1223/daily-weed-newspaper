"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import type { DailyWinner } from "@/lib/data";

// ── Category display labels (matches compute-winners category keys exactly) ──
const CATEGORY_LABELS: Record<string, string> = {
  best_value_flower: "Best Value Flower",
  cheapest_eighth:   "Cheapest 8th",
  shake:             "Shake",
  prerolls:          "Pre-Rolls",
  vape_cart:         "Vape Cart",
  vape_disposable:   "Disposable Vape",
  concentrates:      "Concentrates",
  rso:               "RSO",
  edibles:           "Edibles",
  tinctures:         "Tinctures",
};

// ── Compare modal types (mirrors /prices page implementation) ────────────────
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

// ── Main component ───────────────────────────────────────────────────────────

interface Top10TableProps {
  winners: DailyWinner[];
}

export default function Top10Table({ winners }: Top10TableProps) {
  const { tier, loading: authLoading } = useUser();
  const isProUser = tier === "pro";

  const [compareModal, setCompareModal] = useState<{
    productName: string;
    results: CompareResult[];
    totalCount: number;
  } | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!compareModal) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCompareModal(null);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [compareModal]);

  async function handleCompare(productName: string) {
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
        price: Number(p.price),
        original_price: p.original_price ? Number(p.original_price) : null,
        on_sale: p.on_sale,
        discountPct:
          p.original_price && p.price && Number(p.original_price) > Number(p.price)
            ? Math.round(((Number(p.original_price) - Number(p.price)) / Number(p.original_price)) * 100)
            : null,
        viewUrl: buildMenuUrl(disp?.platform, disp?.slug, disp?.dutchie_url, productName, disp?.name ?? ""),
        productUrl: p.product_url || null,
      };
    });

    setCompareModal({ productName, results, totalCount: results.length });
    setCompareLoading(false);
  }

  return (
    <>
      {/* Table */}
      <table className="category-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th style={{ width: "28%" }}>Category</th>
            <th>Product &amp; Dispensary</th>
            <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {winners.map((winner, i) => {
            const label = CATEGORY_LABELS[winner.category_key] ?? winner.category_key;
            const hasProduct = winner.product !== null;
            const p = winner.product;

            return (
              <tr
                key={winner.category_key}
                onClick={() => hasProduct && p && handleCompare(p.name)}
                style={{
                  cursor: hasProduct ? "pointer" : "default",
                  background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)",
                }}
                title={hasProduct ? `Click to compare ${p?.name} across dispensaries` : undefined}
              >
                {/* Category */}
                <td
                  className="font-mono"
                  style={{
                    fontSize: "10px",
                    color: "var(--muted)",
                    paddingRight: "8px",
                    verticalAlign: "middle",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "16px",
                      color: "var(--aged)",
                      fontWeight: 400,
                      marginRight: "4px",
                    }}
                  >
                    #{i + 1}
                  </span>
                  {label}
                </td>

                {/* Product + Dispensary */}
                <td style={{ verticalAlign: "middle", maxWidth: "180px" }}>
                  {hasProduct && p ? (
                    <>
                      <span style={{ fontSize: "12px", display: "block", lineHeight: 1.3 }}>
                        {p.name}
                      </span>
                      {p.dispensary_name && (
                        <span
                          style={{
                            display: "block",
                            fontFamily: "Space Mono, monospace",
                            fontSize: "9px",
                            color: "var(--muted)",
                            marginTop: "2px",
                          }}
                        >
                          {p.dispensary_name}
                        </span>
                      )}
                    </>
                  ) : (
                    <span
                      style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "11px" }}
                    >
                      No qualifier today
                    </span>
                  )}
                </td>

                {/* Metric + Price */}
                <td
                  className="price"
                  style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap" }}
                >
                  {hasProduct && p ? (
                    <>
                      {winner.metric_display && (
                        <span
                          style={{
                            display: "block",
                            color: "var(--deal-green)",
                            fontFamily: "Space Mono, monospace",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          {winner.metric_display}
                        </span>
                      )}
                      <span
                        style={{
                          display: "block",
                          fontFamily: "Space Mono, monospace",
                          fontSize: "10px",
                          color: "var(--muted)",
                          marginTop: "2px",
                        }}
                      >
                        ${Number(p.price).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: "var(--muted)", fontFamily: "Space Mono, monospace", fontSize: "10px" }}>
                      —
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Compare Modal — identical to /prices page modal */}
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
                      style={{ fontSize: "18px", fontWeight: 900, marginTop: "2px" }}
                    >
                      {compareModal.productName}
                    </h2>
                  </div>
                  <button className="modal-close" onClick={() => setCompareModal(null)}>
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
                      {!isProUser && compareModal.totalCount > FREE_COMPARE_LIMIT &&
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
                          .slice(0, isProUser ? undefined : FREE_COMPARE_LIMIT)
                          .map((r, i) => (
                            <tr
                              key={i}
                              className={r.on_sale ? "on-sale" : ""}
                              style={i === 0 ? { background: "#eef5eb" } : {}}
                            >
                              <td>
                                <span style={{ fontFamily: "Space Mono, monospace", fontSize: "12px" }}>
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
                                <span className="td-price" style={{ fontSize: "14px" }}>
                                  ${r.price.toFixed(2)}
                                </span>
                              </td>
                              <td>
                                {r.original_price ? (
                                  <span className="td-orig-price" style={{ display: "inline" }}>
                                    ${r.original_price.toFixed(2)}
                                  </span>
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
                                {!authLoading && isProUser ? (
                                  <a
                                    href={r.productUrl || r.viewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-menu-link"
                                  >
                                    {r.productUrl ? "View Product →" : "View Menu →"}
                                  </a>
                                ) : (
                                  <span style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)" }}>
                                    Pro only
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>

                    {!isProUser && compareModal.totalCount > FREE_COMPARE_LIMIT && (
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
                          +{compareModal.totalCount - FREE_COMPARE_LIMIT} more dispensaries — upgrade to see all
                        </div>
                        <div className="blurred-rows">
                          {[...Array(Math.min(compareModal.totalCount - FREE_COMPARE_LIMIT, 3))].map((_, i) => (
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
                          <div className="font-headline" style={{ fontSize: "15px", fontWeight: 900, marginBottom: "4px" }}>
                            Pro members see all {compareModal.totalCount} dispensaries
                          </div>
                          <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginBottom: "12px" }}>
                            $9/month · 7-day free trial · cancel anytime
                          </div>
                          <a href="/prices" className="cta-button" style={{ display: "inline-block", textDecoration: "none" }}>
                            Start Free Trial →
                          </a>
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
    </>
  );
}
