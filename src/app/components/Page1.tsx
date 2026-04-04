import Link from "next/link";
import { PageData } from "@/lib/data";
import { displayProductSize, calcMgPerDollar } from "@/lib/format";
import EmailSignupForm from "./EmailSignupForm";

const ZIGGY_LINERS = [
  "these idiots finally remembered how to run a sale",
  "Planet 13 trying to act like they care about the people for once. Suspicious.",
  "if you're a basic bitch (no shame) this is your move",
  "thank me later when you're actually high instead of just pretending",
  "this price went to church and found jesus",
  "getting finessed harder than a slot machine — NOT you, this time",
  "been smoking since 14, been calling out mid since 15. this is not mid.",
  "this is the one. buy it before they notice the price is wrong",
  "corporate robbery with a loyalty card — the OPPOSITE of this deal",
  "i don't make the deals. i just find them. you're welcome.",
  "zero notes. none. it's perfect.",
  "your plug is irrelevant now",
  "whoever priced this deserves a trophy and a raise",
  "the math mathed and the deal dealt",
  "if you don't buy this you are actively fighting yourself",
  "mid is not an option when this exists in the same zip code",
  "i was skeptical. then i saw the price. now i'm a believer.",
  "they said cannabis was getting expensive. they clearly didn't check this one.",
  "hard pass king — but not on this. this one you take.",
  "i would sell a kidney for a deal this clean. luckily i don't have to.",
];

export default function Page1({ data }: { data: PageData }) {
  const { stats, categoryWinners, topDeals, dailyBrief } = data;
  const brief = dailyBrief?.brief_json ?? null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Edition #: days since April 1 2026 launch
  const launchDate = new Date("2026-04-01T00:00:00Z");
  const editionNum = (Math.max(0, Math.floor((Date.now() - launchDate.getTime()) / 86400000)) + 1)
    .toString()
    .padStart(3, "0");

  return (
    <>
      {/* MASTHEAD */}
      <header className="masthead">
        <div className="masthead-topbar">
          <span>Las Vegas, Nevada</span>
          <span className="masthead-tagline">
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
          Edition #{editionNum} &middot; {stats.dispensaryCount} Dispensaries &middot;{" "}
          {stats.totalProducts.toLocaleString()} Products &middot; Las Vegas,
          Nevada
        </p>
      </header>

      {/* TICKER */}
      <div className="ticker-bar">
        <span className="ticker-inner">
          ★ ZIGGY REPORT: Strip dispensaries still charging 2022 prices
          ★&nbsp;&nbsp; {stats.onSaleCount.toLocaleString()} products on sale
          right now ★&nbsp;&nbsp; Cheapest spotted at $
          {stats.minPrice.toFixed(2)} ★&nbsp;&nbsp; Avg price: ${stats.avgPrice.toFixed(2)}
          {topDeals[0] && (
            <>&nbsp;&nbsp; ★ TOP DEAL: {topDeals[0].name} — {topDeals[0].discountPct}% OFF at {topDeals[0].dispensaries?.name}</>
          )}
          &nbsp;&nbsp; ★ ZIGGY REPORT: Strip dispensaries still charging 2022 prices
          ★&nbsp;&nbsp; {stats.onSaleCount.toLocaleString()} products on sale right now
          ★&nbsp;&nbsp; Cheapest spotted at ${stats.minPrice.toFixed(2)} ★
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
          <div className="stat-number">{stats.dispensaryCount}</div>
          <div className="stat-label">Dispensaries</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">
            {stats.onSaleCount.toLocaleString()}
          </div>
          <div className="stat-label">On Sale Now</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">${stats.minPrice.toFixed(2)}</div>
          <div className="stat-label">Lowest Price</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">${stats.avgPrice.toFixed(2)}</div>
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
                <tr key={winner.label}>
                  <td className="font-mono" style={{ fontSize: "11px", color: "var(--muted)" }}>
                    {winner.label}
                  </td>
                  <td style={{ maxWidth: "130px" }}>
                    {winner.name ? (
                      <span style={{ fontSize: "12px" }}>{winner.name}</span>
                    ) : (
                      <span style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "11px" }}>
                        None found
                      </span>
                    )}
                    {winner.dispensaryName && (
                      <span
                        style={{
                          display: "block",
                          fontFamily: "Space Mono, monospace",
                          fontSize: "9px",
                          color: "var(--muted)",
                          marginTop: "2px",
                        }}
                      >
                        {winner.dispensaryName}
                      </span>
                    )}
                  </td>
                  <td className="price">
                    {winner.price !== null ? (
                      <>
                        ${Number(winner.price).toFixed(2)}
                        {winner.pricePerGram !== null && (
                          <span style={{ display: "block", fontFamily: "Space Mono, monospace", fontSize: "9px", color: "var(--muted)", fontWeight: 400 }}>
                            ${winner.pricePerGram.toFixed(2)}/g
                          </span>
                        )}
                      </>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Ziggy's Savage Corner */}
          <div className="gorks-corner" style={{ marginTop: "24px" }}>
            <span className="kicker" style={{ color: "#d4af37" }}>
              Ziggy&apos;s Savage Corner
            </span>
            <p style={{ marginTop: "8px", fontSize: "13px", fontStyle: "italic", lineHeight: 1.6 }}>
              &ldquo;{brief?.savageCorner ?? "I walked into a Strip dispensary and asked for their best deal. The budtender pointed to a $65 eighth. I asked if that was a joke. He said that was their loyalty price. I have not stopped laughing since. The market is a crime scene, and I am the detective."}&rdquo;
            </p>
            <p style={{ marginTop: "8px", fontSize: "11px", color: "#d4af37" }}>
              — Ziggy, Staff Correspondent
            </p>
          </div>

          <div style={{ marginTop: "24px", padding: "16px", border: "1px solid var(--aged)" }}>
            <span className="kicker">Market Pulse</span>
            <div style={{ fontFamily: "Space Mono, monospace", fontSize: "11px", lineHeight: "2", color: "var(--muted)" }}>
              <div>
                {stats.onSaleCount.toLocaleString()} items on sale ={" "}
                <strong style={{ color: "var(--deal-green)" }}>
                  {Math.round((stats.onSaleCount / stats.totalProducts) * 100)}%
                </strong>{" "}
                of inventory
              </div>
              <div>Lowest price spotted:{" "}
                <strong style={{ color: "var(--accent)" }}>
                  ${stats.minPrice.toFixed(2)}
                </strong>
              </div>
              <div>Avg price across all products:{" "}
                <strong style={{ color: "var(--ink)" }}>
                  ${stats.avgPrice.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="column-divider" />

        {/* CENTER COLUMN */}
        <div className="column">
          <span className="kicker">Top 5 Steals of the Day</span>
          <h2 className="hero-headline">
            Don&apos;t Say Ziggy Never Gave You Nothing
          </h2>
          <div className="byline-bar">
            By Ziggy, Price Intelligence Correspondent &middot; Updated {today}
          </div>
          <p
            className="drop-cap"
            style={{
              marginBottom: "20px",
              fontSize: "14px",
              lineHeight: "1.7",
            }}
          >
            {brief?.intro ?? "Yo. I'm Ziggy. Been smoking since 14. Calling out mid since 15. Every morning I dig through every dispensary menu in Vegas so you don't have to overpay. The market is a crime scene. I'm the detective. The following five products are the ones I actually co-sign today. You're welcome."}
          </p>

          {topDeals.length === 0 ? (
            <div className="gork-empty">
              <div className="gork-empty-headline">Ziggy Found Nothing Today</div>
              <p>
                The market offers no mercy. Check back tomorrow, or visit the
                Price Dashboard.
              </p>
            </div>
          ) : (
            topDeals.map((deal, i) => (
              <div key={deal.id} className="deal-box">
                <span className="deal-number">#{i + 1}</span>
                <div className="deal-name">
                  {deal.name}
                  {deal.weight_grams && (
                    <span style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginLeft: "8px", fontWeight: 400 }}>
                      {displayProductSize(deal.name, deal.category, deal.weight_grams)}
                    </span>
                  )}
                </div>
                <div className="deal-dispensary">
                  {deal.dispensaries?.name ?? "Unknown Dispensary"}
                  {deal.brand && (
                    <span style={{ color: "var(--muted)", marginLeft: "6px" }}>
                      · {deal.brand}
                    </span>
                  )}
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
                  {deal.thc_percentage && (
                    <span
                      style={{
                        fontFamily: "Space Mono, monospace",
                        fontSize: "10px",
                        color: "var(--muted)",
                        marginLeft: "4px",
                      }}
                    >
                      {Number(deal.thc_percentage).toFixed(1)}% THC
                    </span>
                  )}
                </div>
                <div className="deal-gork-line">
                  {brief?.dealCommentary?.[i]?.quip ?? ZIGGY_LINERS[i % ZIGGY_LINERS.length]}
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
              See all {stats.onSaleCount.toLocaleString()} deals in the Price Dashboard →
            </Link>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="column-divider" />

        {/* RIGHT COLUMN */}
        <div className="column">
          <div className="pro-signup-box">
            <span className="kicker">Ziggy Pro Intelligence</span>
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
              <li>Ziggy&apos;s exclusive weekly deep dive</li>
              <li>Export to CSV for the truly obsessed</li>
            </ul>
            <EmailSignupForm tier="pro" buttonText="Get Pro — $9/mo" />
          </div>

          {/* Deal of the Day */}
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
                    lineHeight: 1.3,
                  }}
                >
                  {topDeals[0].name}
                </div>
                <div className="deal-of-day-price">
                  ${Number(topDeals[0].price).toFixed(2)}
                  {(() => {
                    const mgpd = calcMgPerDollar(
                      topDeals[0].name,
                      topDeals[0].category,
                      topDeals[0].thc_percentage,
                      topDeals[0].weight_grams,
                      topDeals[0].price
                    );
                    return mgpd !== null ? (
                      <span style={{ fontFamily: "Space Mono, monospace", fontSize: "12px", color: "#34a529", marginLeft: "8px", fontWeight: 400 }}>
                        · {mgpd.toFixed(1)} mg/$
                      </span>
                    ) : null;
                  })()}
                </div>
                <div
                  style={{
                    fontFamily: "Space Mono, monospace",
                    fontSize: "10px",
                    color: "var(--muted)",
                  }}
                >
                  at {topDeals[0].dispensaries?.name} &middot; was $
                  {Number(topDeals[0].original_price).toFixed(2)} &middot; save{" "}
                  {topDeals[0].discountPct}%
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
                  &ldquo;{ZIGGY_LINERS[0]}&rdquo; — Ziggy
                </div>
              </>
            ) : (
              <div className="deal-of-day-price">—</div>
            )}
          </div>

          {/* Ziggy's Rating */}
          <div className="gork-rating">
            <span className="kicker">Ziggy&apos;s Market Rating</span>
            <div className="rating-number">{brief?.marketRating ?? 7.8}</div>
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
              &ldquo;{brief?.ratingQuote ?? "Prices are improving. Slowly. Like a high that takes 45 minutes."}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="bottom-grid">
        <div className="bottom-column">
          <span className="kicker">About Ziggy</span>
          <h2
            className="font-headline"
            style={{ fontSize: "22px", fontWeight: 900, marginBottom: "12px" }}
          >
            One Correspondent. Zero Tolerance for Price Gouging.
          </h2>
          <p style={{ fontSize: "14px", lineHeight: "1.7", marginBottom: "12px" }}>
            Ziggy is the pseudonymous price intelligence correspondent for the
            Daily Weed Newspaper. He has visited every legal dispensary in Las
            Vegas at least twice — once to buy, once to audit the menu. His
            budget is $40 per visit. His standards are considerably higher.
          </p>
          <p style={{ fontSize: "14px", lineHeight: "1.7", marginBottom: "20px" }}>
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
          <span className="kicker">Subscribe to Ziggy Intelligence</span>
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
              style={{ border: "3px solid var(--ink)" }}
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
            <EmailSignupForm tier="free" buttonText="Start Free — Upgrade Anytime" />
          </div>
        </div>
      </div>

      <footer className="site-footer">
        © {new Date().getFullYear()} Daily Weed Newspaper &middot;
        dailyweednewspaper.com &middot; Las Vegas, Nevada &middot; All prices
        sourced from public dispensary menus and updated regularly.
        &nbsp;&middot;&nbsp;
        <Link href="/prices" style={{ color: "var(--accent)" }}>
          Price Dashboard
        </Link>
      </footer>
    </>
  );
}
