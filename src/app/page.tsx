import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Product {
  id?: string | number;
  product_name?: string;
  name?: string;
  dispensary_name?: string;
  price?: number | string;
  original_price?: number | string;
  category?: string;
  [key: string]: unknown;
}

interface DealWithDiscount extends Product {
  discountPct: number;
}

async function getStats() {
  // Schema check — log first row keys
  const { data: sample } = await supabase
    .from("dispensary_products")
    .select("*")
    .limit(1);

  if (sample?.[0]) {
    console.log("[DWN] Schema keys:", Object.keys(sample[0]));
  }

  const [
    { count: totalProducts },
    { data: dispensaryRows },
    { count: onSaleCount },
    { data: priceData },
  ] = await Promise.all([
    supabase
      .from("dispensary_products")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("dispensary_products")
      .select("dispensary_name")
      .limit(2000),
    supabase
      .from("dispensary_products")
      .select("*", { count: "exact", head: true })
      .not("original_price", "is", null),
    supabase
      .from("dispensary_products")
      .select("price")
      .not("price", "is", null)
      .order("price", { ascending: true })
      .limit(500),
  ]);

  const uniqueDispensaries = new Set(
    (dispensaryRows ?? []).map(
      (d: { dispensary_name: string }) => d.dispensary_name
    )
  ).size;

  const prices = (priceData ?? [])
    .map((p: { price: number }) => Number(p.price))
    .filter((n) => !isNaN(n) && n > 0);

  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const avgPrice =
    prices.length > 0
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : 0;

  return {
    totalProducts: totalProducts ?? 0,
    dispensaries: uniqueDispensaries,
    onSale: onSaleCount ?? 0,
    lowestPrice,
    avgPrice,
  };
}

async function getCategoryWinners() {
  const categories = ["Flower", "Pre-Rolls", "Edibles", "Vape", "Concentrates"];

  const results = await Promise.all(
    categories.map(async (cat) => {
      const { data } = await supabase
        .from("dispensary_products")
        .select("product_name, name, dispensary_name, price, category")
        .ilike("category", `%${cat}%`)
        .not("price", "is", null)
        .order("price", { ascending: true })
        .limit(1);

      const row = data?.[0] ?? null;
      return {
        category: cat,
        product_name: row?.product_name ?? null,
        name: row?.name ?? null,
        dispensary_name: row?.dispensary_name ?? null,
        price: row?.price ?? null,
      };
    })
  );

  return results;
}

async function getTopDeals(): Promise<DealWithDiscount[]> {
  const { data } = await supabase
    .from("dispensary_products")
    .select("*")
    .not("original_price", "is", null)
    .not("price", "is", null)
    .limit(100);

  if (!data) return [];

  return (data as Product[])
    .map((p) => {
      const orig = Number(p.original_price);
      const sale = Number(p.price);
      const discountPct =
        orig > 0 && sale > 0 ? Math.round(((orig - sale) / orig) * 100) : 0;
      return { ...p, discountPct };
    })
    .filter((p) => p.discountPct > 0)
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 5);
}

const GORK_LINERS = [
  "Gork smells corporate desperation on this one.",
  "This is what justice looks like at the register.",
  "Your dealer in 2019 never pulled a move like this.",
  "Finally, a dispensary that remembers you exist.",
  "Gork wept. Wept with joy.",
  "Even your broke friend can afford this.",
  "This price is unconstitutional. In a good way.",
];

export default async function HomePage() {
  const [stats, categoryWinners, topDeals] = await Promise.all([
    getStats(),
    getCategoryWinners(),
    getTopDeals(),
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* MASTHEAD */}
      <header className="masthead">
        <div className="masthead-topbar">
          <span>Las Vegas, Nevada</span>
          <span>
            We tell you what&apos;s worth smoking and what&apos;s corporate
            robbery
          </span>
          <span>{today}</span>
        </div>
        <h1 className="masthead-title">Daily Weed Newspaper</h1>
        <p className="masthead-subhead">
          The Only Cannabis Publication That Actually Gives a Damn About Your
          Wallet
        </p>
        <p className="edition-bar">
          Edition #001 &middot; {stats.dispensaries} Dispensaries &middot;{" "}
          {stats.totalProducts.toLocaleString()} Products &middot; Las Vegas,
          Nevada
        </p>
      </header>

      {/* TICKER */}
      <div className="ticker-bar">
        <span className="ticker-inner">
          ★ GORK REPORT: Strip dispensaries still charging 2022 prices
          ★&nbsp;&nbsp;
          {stats.onSale > 0
            ? `${stats.onSale.toLocaleString()} products on sale right now`
            : "Fresh deals just landed"}{" "}
          ★&nbsp;&nbsp; Cheapest flower spotted at $
          {stats.lowestPrice > 0 ? stats.lowestPrice.toFixed(2) : "—"}{" "}
          ★&nbsp;&nbsp; Average price across all products: $
          {stats.avgPrice > 0 ? stats.avgPrice.toFixed(2) : "—"} ★&nbsp;&nbsp;
          ★ GORK REPORT: Strip dispensaries still charging 2022 prices
          ★&nbsp;&nbsp;
          {stats.onSale > 0
            ? `${stats.onSale.toLocaleString()} products on sale right now`
            : "Fresh deals just landed"}{" "}
          ★&nbsp;&nbsp; Cheapest flower spotted at $
          {stats.lowestPrice > 0 ? stats.lowestPrice.toFixed(2) : "—"} ★
        </span>
      </div>

      {/* STATS ROW */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-number">
            {stats.totalProducts.toLocaleString()}
          </div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{stats.dispensaries}</div>
          <div className="stat-label">Dispensaries</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">
            {stats.onSale > 0 ? stats.onSale.toLocaleString() : "—"}
          </div>
          <div className="stat-label">On Sale Now</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">
            {stats.lowestPrice > 0 ? `$${stats.lowestPrice.toFixed(2)}` : "—"}
          </div>
          <div className="stat-label">Lowest Price</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">
            {stats.avgPrice > 0 ? `$${stats.avgPrice.toFixed(2)}` : "—"}
          </div>
          <div className="stat-label">Avg Price</div>
        </div>
      </div>

      {/* 3-COLUMN GRID */}
      <div className="newspaper-grid">
        {/* LEFT COLUMN */}
        <div className="column">
          <span className="kicker">Category Winners</span>
          <h2
            className="font-headline"
            style={{ fontSize: "20px", fontWeight: 900, marginBottom: "12px" }}
          >
            Best Bang Per Category
          </h2>
          <table className="category-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Product</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {categoryWinners.map((winner) => (
                <tr key={winner.category}>
                  <td
                    style={{
                      fontFamily: "Space Mono, monospace",
                      fontSize: "11px",
                      color: "var(--muted)",
                    }}
                  >
                    {winner.category}
                  </td>
                  <td style={{ maxWidth: "120px" }}>
                    {winner.product_name || winner.name ? (
                      <span style={{ fontSize: "13px" }}>
                        {winner.product_name || winner.name}
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "var(--muted)",
                          fontStyle: "italic",
                          fontSize: "12px",
                        }}
                      >
                        None found
                      </span>
                    )}
                    {winner.dispensary_name && (
                      <span
                        style={{
                          display: "block",
                          fontFamily: "Space Mono, monospace",
                          fontSize: "9px",
                          color: "var(--muted)",
                          marginTop: "2px",
                        }}
                      >
                        {winner.dispensary_name}
                      </span>
                    )}
                  </td>
                  <td className="price">
                    {winner.price
                      ? `$${Number(winner.price).toFixed(2)}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="gorks-corner">
            <span className="kicker">Gork&apos;s Savage Corner</span>
            <p>
              &ldquo;I walked into a Strip dispensary and asked for their best
              deal. The budtender pointed to a $65 eighth. I asked if that was a
              joke. He said that was their loyalty price. I have not stopped
              laughing since. The market is a crime scene, and I am the
              detective.&rdquo;
            </p>
            <p
              style={{
                marginTop: "8px",
                fontSize: "11px",
                color: "#d4af37",
              }}
            >
              — Gork, Staff Correspondent
            </p>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="column-divider" />

        {/* CENTER COLUMN */}
        <div className="column">
          <span className="kicker">Top 5 Steals of the Day</span>
          <h2 className="hero-headline">
            Don&apos;t Say Gork Never Gave You Nothing
          </h2>
          <div className="byline-bar">
            By Gork, Price Intelligence Correspondent &middot; Updated {today}
          </div>
          <p className="drop-cap" style={{ marginBottom: "20px", fontSize: "14px", lineHeight: "1.7" }}>
            Every morning, Gork rises before dawn, loads the database, and hunts
            the Las Vegas cannabis market for proof that dispensaries are still
            capable of human decency. Some days the news is grim. Today,
            however, there are deals worth knowing about. The following five
            products represent the current market doing its job. Buy them before
            someone notices.
          </p>

          {topDeals.length === 0 ? (
            <div className="gork-empty">
              <div className="gork-empty-headline">Gork Found Nothing Today</div>
              <p>
                The market offers no mercy. Check back tomorrow, or visit the
                Price Dashboard.
              </p>
            </div>
          ) : (
            topDeals.map((deal, i) => (
              <div key={String(deal.id ?? i)} className="deal-box">
                <span className="deal-number">#{i + 1}</span>
                <div className="deal-name">
                  {deal.product_name || deal.name || "Unnamed Product"}
                </div>
                <div className="deal-dispensary">
                  {deal.dispensary_name || "Unknown Dispensary"}
                </div>
                <div className="deal-prices">
                  <span className="deal-price-sale">
                    ${Number(deal.price).toFixed(2)}
                  </span>
                  {deal.original_price && (
                    <span className="deal-price-orig">
                      ${Number(deal.original_price).toFixed(2)}
                    </span>
                  )}
                  <span className="deal-discount-badge">
                    -{deal.discountPct}%
                  </span>
                </div>
                <div className="deal-gork-line">
                  {GORK_LINERS[i % GORK_LINERS.length]}
                </div>
              </div>
            ))
          )}

          <div style={{ textAlign: "right", marginTop: "8px" }}>
            <Link
              href="/prices"
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
                color: "var(--accent)",
                textDecoration: "none",
                borderBottom: "1px solid var(--accent)",
              }}
            >
              See all deals in the Price Dashboard →
            </Link>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="column-divider" />

        {/* RIGHT COLUMN */}
        <div className="column">
          <div className="pro-signup-box">
            <span className="kicker">Gork Pro Intelligence</span>
            <div className="pro-headline">Get the Full Picture</div>
            <div className="pro-price">
              $9
              <span
                style={{
                  fontSize: "14px",
                  fontFamily: "Space Mono, monospace",
                  color: "var(--muted)",
                }}
              >
                /mo
              </span>
            </div>
            <ul className="pro-features">
              <li>Daily price alerts for your favorite strains</li>
              <li>Full dispensary comparison across all 16 locations</li>
              <li>Historical price tracking — know the trends</li>
              <li>Gork&apos;s exclusive weekly deep dive</li>
              <li>Export to CSV for the truly obsessed</li>
            </ul>
            <input
              className="email-input"
              type="email"
              placeholder="your@email.com"
            />
            <button className="cta-button">Get Gork Pro — $9/mo</button>
          </div>

          <div className="deal-of-day">
            <span className="kicker">Deal of the Day</span>
            {topDeals[0] ? (
              <>
                <div
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: "15px",
                    fontWeight: 700,
                    marginTop: "4px",
                  }}
                >
                  {topDeals[0].product_name || topDeals[0].name}
                </div>
                <div className="deal-of-day-price">
                  ${Number(topDeals[0].price).toFixed(2)}
                </div>
                <div
                  style={{
                    fontFamily: "Space Mono, monospace",
                    fontSize: "10px",
                    color: "var(--muted)",
                  }}
                >
                  at {topDeals[0].dispensary_name}
                </div>
                <div
                  style={{
                    fontFamily: "Source Serif 4, serif",
                    fontSize: "12px",
                    fontStyle: "italic",
                    marginTop: "8px",
                    color: "var(--muted)",
                    borderTop: "1px solid var(--aged)",
                    paddingTop: "8px",
                  }}
                >
                  &ldquo;{GORK_LINERS[0]}&rdquo; — Gork
                </div>
              </>
            ) : (
              <>
                <div className="deal-of-day-price">—</div>
                <p
                  style={{
                    fontFamily: "Space Mono, monospace",
                    fontSize: "11px",
                    color: "var(--muted)",
                  }}
                >
                  Market data loading...
                </p>
              </>
            )}
          </div>

          <div className="gork-rating">
            <span className="kicker">Gork&apos;s Market Rating</span>
            <div className="rating-number">7.8</div>
            <div
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
                color: "var(--muted)",
              }}
            >
              /10 — Market Confidence
            </div>
            <p
              style={{
                fontFamily: "Source Serif 4, serif",
                fontSize: "12px",
                marginTop: "8px",
                fontStyle: "italic",
                color: "var(--muted)",
              }}
            >
              &ldquo;Prices are improving. Slowly. Like a high that takes 45
              minutes.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="bottom-grid">
        <div className="bottom-column">
          <span className="kicker">About Gork</span>
          <h2
            className="font-headline"
            style={{ fontSize: "22px", fontWeight: 900, marginBottom: "12px" }}
          >
            One Correspondent. Zero Tolerance for Price Gouging.
          </h2>
          <p
            style={{ fontSize: "14px", lineHeight: "1.7", marginBottom: "12px" }}
          >
            Gork is the pseudonymous price intelligence correspondent for the
            Daily Weed Newspaper. He has visited every legal dispensary in Las
            Vegas at least twice, once to buy, once to audit the menu. His
            budget is $40 per visit. His standards are considerably higher.
          </p>
          <p
            style={{ fontSize: "14px", lineHeight: "1.7", marginBottom: "20px" }}
          >
            The Daily Weed Newspaper publishes real-time price data pulled
            directly from dispensary menus. No affiliate links. No sponsored
            content. No mercy for $75 eighths.
          </p>

          <span className="kicker">Coming Soon</span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            {[
              "Denver, CO",
              "Phoenix, AZ",
              "Portland, OR",
              "Los Angeles, CA",
              "Chicago, IL",
              "Detroit, MI",
            ].map((city) => (
              <div
                key={city}
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "11px",
                  padding: "6px 8px",
                  border: "1px solid var(--aged)",
                  color: "var(--muted)",
                }}
              >
                {city}
              </div>
            ))}
          </div>
        </div>

        <div className="bottom-column">
          <span className="kicker">Subscribe to Gork Intelligence</span>
          <h2
            className="font-headline"
            style={{ fontSize: "22px", fontWeight: 900, marginBottom: "4px" }}
          >
            Don&apos;t Pay Dispensary Prices in the Dark
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              marginBottom: "16px",
              fontFamily: "Space Mono, monospace",
            }}
          >
            Free tier included. No credit card required to start.
          </p>

          <div className="pricing-tiers">
            <div className="pricing-tier">
              <span className="kicker">Monthly</span>
              <div className="tier-price">$9</div>
              <p
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "10px",
                  color: "var(--muted)",
                  marginTop: "4px",
                }}
              >
                per month
              </p>
            </div>
            <div
              className="pricing-tier"
              style={{ border: "3px solid var(--ink)", position: "relative" }}
            >
              <span className="kicker" style={{ color: "var(--deal-green)" }}>
                Annual · Best Value
              </span>
              <div className="tier-price">$99</div>
              <p
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "10px",
                  color: "var(--muted)",
                  marginTop: "4px",
                }}
              >
                per year — save $9
              </p>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <input
              className="email-input"
              type="email"
              placeholder="your@email.com"
            />
            <button className="cta-button" style={{ marginTop: "4px" }}>
              Start Free — Upgrade Anytime
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="site-footer">
        © {new Date().getFullYear()} Daily Weed Newspaper &middot;
        dailyweednewspaper.com &middot; Las Vegas, Nevada &middot; All prices
        sourced from public dispensary menus and updated regularly. Not
        affiliated with any dispensary. &nbsp;&middot;&nbsp;
        <Link href="/prices" style={{ color: "var(--accent)" }}>
          Price Dashboard
        </Link>
      </footer>
    </>
  );
}
