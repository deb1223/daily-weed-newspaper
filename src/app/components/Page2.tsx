"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PageData } from "@/lib/data";
import Link from "next/link";

const BIG_MIKE_TEA = [
  {
    headline: "Thrive's Been Restocking Heavy",
    body: "Word around Sahara is that Thrive's been restocking heavy this week — all three locations. Something's coming. Either a holiday weekend push or they got a new supplier. Either way, their pre-roll selection right now is legitimately impressive.",
    dateline: "West Sahara",
  },
  {
    headline: "Planet 13 Is Clearing Inventory",
    body: "Planet 13 dropped prices on their house flower, which only happens when they're trying to move product fast. They got something new coming in. Stack up now before the new stuff lands and the sale prices disappear.",
    dateline: "Strip Adjacent",
  },
  {
    headline: "The Decatur Spot Is Still Winning",
    body: "The Dispensary on Decatur has been quietly winning for months. Nobody talks about it because it's not glamorous and there's no neon. That's exactly why you should go. Locals know. Tourists don't. You're welcome.",
    dateline: "West Las Vegas",
  },
];

const ZIGGY_DEEPER_CUTS = [
  "The dispensary loyalty program industrial complex is a scam. You're earning points on overpriced product so you can eventually buy more overpriced product at a slight discount. Ziggy sees through it.",
  "CBD products priced above $30 for anything under 500mg are catching a fine. Ziggy is issuing the fine. This is the fine.",
  "If a dispensary's 'deal of the day' is $5 off something that was already overpriced, that's not a deal. That's an insult wearing a discount badge.",
];

const CHART_COLORS = ["#2d6a4f", "#2a6e3f", "#1a1008", "#6b5e45", "#2d6a4f", "#2a6e3f", "#1a1008"];

export default function Page2({ data }: { data: PageData }) {
  const { avgByCategory, dailyBrief } = data;
  const briefTea = dailyBrief?.brief_json?.bigMikeTea ?? null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Page 2 Masthead */}
      <header className="masthead" style={{ borderBottom: "2px solid var(--ink)" }}>
        <div className="masthead-topbar">
          <span>Page 2 · The Inside Scoop</span>
          <span className="font-masthead" style={{ fontSize: "20px" }}>
            Daily Weed Newspaper
          </span>
          <span>{today}</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1px 1fr",
            maxWidth: "900px",
            margin: "0 auto",
            padding: "12px 24px 0",
          }}
        >
          <div>
            <span className="kicker">Inside This Issue</span>
            <p
              style={{
                fontFamily: "Source Serif 4, serif",
                fontSize: "13px",
                lineHeight: 1.6,
                color: "var(--muted)",
              }}
            >
              Big Mike&apos;s local intelligence &middot; Price Trend Watch by
              category &middot; Ziggy&apos;s deeper cuts on the market
            </p>
          </div>
          <div style={{ background: "var(--ink)" }} />
          <div style={{ paddingLeft: "24px" }}>
            <span className="kicker">Market Snapshot</span>
            <p
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
                color: "var(--muted)",
                lineHeight: 1.8,
              }}
            >
              Avg across all categories: <strong style={{ color: "var(--accent)" }}>${data.stats.avgPrice.toFixed(2)}</strong>
              <br />
              On sale right now: <strong style={{ color: "var(--deal-green)" }}>{data.stats.onSaleCount.toLocaleString()}</strong>
            </p>
          </div>
        </div>
      </header>

      {/* Main content: 2 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1px 1fr",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* LEFT: Big Mike's Tea */}
        <div style={{ padding: "32px 24px 32px 0" }}>
          <span className="kicker">Big Mike&apos;s Local Tea</span>
          <h2
            className="font-headline"
            style={{ fontSize: "26px", fontWeight: 900, marginBottom: "4px", lineHeight: 1.1 }}
          >
            Word Around Town
          </h2>
          <div
            className="byline-bar"
            style={{ marginBottom: "24px" }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                background: "var(--ink)",
                color: "var(--newsprint)",
                borderRadius: "50%",
                fontFamily: "Space Mono, monospace",
                fontSize: "9px",
                fontWeight: 700,
                marginRight: "8px",
              }}
            >
              BM
            </span>
            Big Mike · Las Vegas Local · 15 years in the valley
          </div>

          {briefTea
            ? briefTea.map((line, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "24px",
                  paddingBottom: "24px",
                  borderBottom: i < briefTea.length - 1 ? "1px solid var(--aged)" : "none",
                }}
              >
                <p style={{ fontFamily: "Source Serif 4, serif", fontSize: "14px", lineHeight: 1.7 }}>
                  {line}
                </p>
              </div>
            ))
            : BIG_MIKE_TEA.map((item, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "24px",
                  paddingBottom: "24px",
                  borderBottom: i < BIG_MIKE_TEA.length - 1 ? "1px solid var(--aged)" : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "Space Mono, monospace",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--muted)",
                    marginBottom: "4px",
                  }}
                >
                  {item.dateline}
                </div>
                <h3
                  className="font-headline"
                  style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}
                >
                  {item.headline}
                </h3>
                <p
                  style={{
                    fontFamily: "Source Serif 4, serif",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))
          }

          {/* Ziggy's Deeper Cuts */}
          <div style={{ marginTop: "8px" }}>
            <span className="kicker">Ziggy&apos;s Deeper Cuts</span>
            <h3
              className="font-headline"
              style={{ fontSize: "18px", fontWeight: 900, marginBottom: "16px" }}
            >
              Market Observations Nobody Asked For
            </h3>
            {ZIGGY_DEEPER_CUTS.map((line, i) => (
              <div
                key={i}
                style={{
                  borderLeft: "3px solid var(--accent)",
                  paddingLeft: "12px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    fontFamily: "Source Serif 4, serif",
                    fontSize: "13px",
                    fontStyle: "italic",
                    lineHeight: 1.65,
                    color: "var(--ink)",
                  }}
                >
                  &ldquo;{line}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ background: "var(--ink)", margin: "24px 0" }} />

        {/* RIGHT: Price Trend Watch */}
        <div style={{ padding: "32px 0 32px 24px" }}>
          <span className="kicker">Price Trend Watch</span>
          <h2
            className="font-headline"
            style={{ fontSize: "26px", fontWeight: 900, marginBottom: "4px", lineHeight: 1.1 }}
          >
            Avg Price by Category
          </h2>
          <div className="byline-bar" style={{ marginBottom: "24px" }}>
            Live data · {data.stats.totalProducts.toLocaleString()} products across {data.stats.dispensaryCount} dispensaries
          </div>

          {avgByCategory.length > 0 ? (
            <div style={{ width: "100%", height: "340px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={avgByCategory}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `$${v}`}
                    tick={{
                      fontFamily: "Space Mono, monospace",
                      fontSize: 10,
                      fill: "var(--muted)",
                    }}
                    axisLine={{ stroke: "var(--ink)" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={90}
                    tick={{
                      fontFamily: "Space Mono, monospace",
                      fontSize: 10,
                      fill: "var(--ink)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Avg Price"]}
                    contentStyle={{
                      fontFamily: "Space Mono, monospace",
                      fontSize: "11px",
                      background: "var(--newsprint)",
                      border: "1px solid var(--ink)",
                      borderRadius: 0,
                    }}
                    cursor={{ fill: "rgba(26,16,8,0.04)" }}
                  />
                  <Bar dataKey="avg" radius={0} maxBarSize={28}>
                    {avgByCategory.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="gork-empty">
              <p>Chart data loading...</p>
            </div>
          )}

          <p
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "9px",
              color: "var(--muted)",
              marginTop: "12px",
            }}
          >
            Average unit price per category. Prices vary by weight and format.
            Concentrates appear higher due to premium live resin and rosin pricing.
          </p>

          {/* Price Intelligence notes */}
          <div
            style={{
              marginTop: "24px",
              background: "var(--aged)",
              padding: "16px",
              border: "1px solid var(--ink)",
            }}
          >
            <span className="kicker">What This Means</span>
            <p
              style={{
                fontFamily: "Source Serif 4, serif",
                fontSize: "13px",
                lineHeight: 1.65,
                marginTop: "4px",
              }}
            >
              Flower remains the value play. Concentrates command the highest
              average price, but{" "}
              <strong>the top deals right now are all in flower and pre-rolls</strong>
              {" "}— suggesting dispensaries are running aggressive promotions on
              their highest-volume categories to clear inventory.
            </p>
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: "24px",
              border: "2px solid var(--ink)",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <span className="kicker" style={{ display: "block", textAlign: "center" }}>
              See Every Price, Live
            </span>
            <h3
              className="font-headline"
              style={{ fontSize: "18px", fontWeight: 900, marginBottom: "8px" }}
            >
              The Full Price Intelligence Dashboard
            </h3>
            <p
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
                color: "var(--muted)",
                marginBottom: "12px",
              }}
            >
              Search, filter, and compare every product across all 16 dispensaries.
            </p>
            <Link href="/prices">
              <button className="cta-button" style={{ maxWidth: "240px", margin: "0 auto", display: "block" }}>
                Open Price Dashboard →
              </button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        © {new Date().getFullYear()} Daily Weed Newspaper &middot; Page 2 of 3 &middot;{" "}
        <Link href="/prices" style={{ color: "var(--accent)" }}>
          Price Dashboard
        </Link>
      </footer>
    </>
  );
}
