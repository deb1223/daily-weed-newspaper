import Link from "next/link";
import { PageData, DealProduct } from "@/lib/data";

const TERRY_NOTES: Record<string, string> = {
  "Thrive Cannabis Marketplace (Las Vegas Strip)":
    "Took an Uber from the Bellagio. $9 each way. Saved $28 on the eighth. Math is math. Friendly staff, no pressure, they explained the menu without making me feel like a tourist. Which I am. But still.",
  "Cookies On The Strip":
    "Closer to the Strip than you'd think. Big brand, premium vibes, but they're running actual deals right now which surprised me. Good for brand-names if that's your thing. Prices are honest.",
};

const TERRY_AVOID = [
  {
    name: "Any dispensary with 'luxury' in its branding",
    reason:
      "You are paying for the word luxury, not the product. Ziggy has confirmed this multiple times.",
  },
  {
    name: "Hotel gift shop cannabis partnerships",
    reason:
      "Not a real thing yet but they're trying. Do not let them gaslight you when they figure it out.",
  },
];

const TERRY_TIPS = [
  "Rideshare from the Strip to Decatur is ~$12. The savings on a dispensary visit there can easily hit $20-40. Basic math.",
  "Check the menu BEFORE the Uber. Don't show up and be disappointed. Ziggy publishes this data for a reason.",
  "Edibles for the hotel room are a legitimate strategy. Just wait the full two hours before you panic.",
  "Loyalty programs are worth signing up for on your first visit. Just don't let them fool you into thinking you're getting a deal when you're not.",
];

const ZIGGY_SIGN_OFF = `Seven point eight out of ten. The market is trending in the right direction, which is to say, toward prices that don't constitute a crime. Some dispensaries are competing on price now — genuinely competing — and that is good for everyone except the dispensaries that got comfortable charging Strip prices for products nobody had to walk far to buy. Those dispensaries are now panicking. Ziggy does not feel sorry for them. Ziggy feels vindicated.

Come back tomorrow. The prices will be different. Some will be better. Some will be worse. That's the market. That's the newspaper. That's Ziggy.`;

function StripDealCard({ deal, idx }: { deal: DealProduct; idx: number }) {
  const terryNote = TERRY_NOTES[deal.dispensaries?.name ?? ""];
  return (
    <div
      style={{
        border: "2px solid var(--ink)",
        padding: "16px",
        marginBottom: "16px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -12,
          left: 12,
          background: "var(--ink)",
          color: "var(--newsprint)",
          fontFamily: "Space Mono, monospace",
          fontSize: "10px",
          fontWeight: 700,
          padding: "2px 8px",
        }}
      >
        {deal.dispensaries?.name}
      </div>
      <div
        style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "15px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        {deal.name}
      </div>
      {deal.brand && (
        <div
          style={{
            fontFamily: "Space Mono, monospace",
            fontSize: "10px",
            color: "var(--muted)",
            marginBottom: "8px",
          }}
        >
          {deal.brand} {deal.category && `· ${deal.category}`}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
        <span
          style={{
            fontFamily: "Space Mono, monospace",
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--deal-green)",
          }}
        >
          ${Number(deal.price).toFixed(2)}
        </span>
        {deal.original_price && (
          <span
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "13px",
              color: "var(--muted)",
              textDecoration: "line-through",
            }}
          >
            ${Number(deal.original_price).toFixed(2)}
          </span>
        )}
        <span
          style={{
            background: "var(--accent)",
            color: "#fff",
            fontFamily: "Space Mono, monospace",
            fontSize: "10px",
            fontWeight: 700,
            padding: "2px 6px",
          }}
        >
          -{deal.discountPct}%
        </span>
      </div>
      {terryNote && idx === 0 && (
        <div
          style={{
            fontFamily: "Source Serif 4, serif",
            fontSize: "12px",
            fontStyle: "italic",
            color: "var(--muted)",
            borderTop: "1px solid var(--aged)",
            paddingTop: "8px",
          }}
        >
          &ldquo;{terryNote}&rdquo; — Tourist Terry
        </div>
      )}
    </div>
  );
}

export default function Page3({ data }: { data: PageData }) {
  const { stripDeals, stats } = data;

  // Group by dispensary
  const thriveDeals = stripDeals.filter((d) =>
    d.dispensaries?.name?.includes("Thrive")
  );
  const cookiesDeals = stripDeals.filter((d) =>
    d.dispensaries?.name?.includes("Cookies")
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Page 3 Masthead */}
      <header className="masthead" style={{ borderBottom: "2px solid var(--ink)" }}>
        <div className="masthead-topbar">
          <span>Page 3 · The Closer</span>
          <span className="font-masthead" style={{ fontSize: "20px" }}>
            Daily Weed Newspaper
          </span>
          <span>{today}</span>
        </div>
      </header>

      {/* Main content: 2 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1px 1fr",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* LEFT: Tourist Terry's Strip Guide */}
        <div style={{ padding: "32px 24px 32px 0" }}>
          <span className="kicker">Tourist Terry&apos;s Strip Guide</span>
          <h2
            className="font-headline"
            style={{ fontSize: "28px", fontWeight: 900, marginBottom: "8px", lineHeight: 1.1 }}
          >
            No Car. No Problem. Here&apos;s the Play.
          </h2>
          <div className="byline-bar" style={{ marginBottom: "20px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                background: "var(--aged)",
                color: "var(--ink)",
                border: "1px solid var(--ink)",
                borderRadius: "50%",
                fontFamily: "Space Mono, monospace",
                fontSize: "9px",
                fontWeight: 700,
                marginRight: "8px",
              }}
            >
              TT
            </span>
            Tourist Terry · Visiting Las Vegas · No rental car, full intentions
          </div>

          <p
            style={{
              fontFamily: "Source Serif 4, serif",
              fontSize: "14px",
              lineHeight: "1.7",
              marginBottom: "20px",
            }}
          >
            I took an Uber from the Bellagio. $8 each way. Saved $30 on the eighth.
            That&apos;s a $14 net win before I even got high. I am not a financial advisor
            but I am a tourist who did the math and the math said: go to the
            dispensary, don&apos;t buy it from the hotel minibar equivalent.
          </p>

          {/* Strip dispensaries */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "24px",
            }}
          >
            {/* Thrive Strip */}
            <div>
              <div
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--deal-green)",
                  borderBottom: "2px solid var(--deal-green)",
                  paddingBottom: "4px",
                  marginBottom: "12px",
                  letterSpacing: "0.1em",
                }}
              >
                ✓ Worth the Uber
              </div>
              <div
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "15px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                Thrive Las Vegas Strip
              </div>
              <p
                style={{
                  fontFamily: "Source Serif 4, serif",
                  fontSize: "12px",
                  color: "var(--muted)",
                  lineHeight: "1.6",
                  marginBottom: "12px",
                }}
              >
                Best selection near the Strip. Staff knows their product.
                Legitimate deals on sale items. Terry-approved.
              </p>
              {thriveDeals.slice(0, 2).map((deal, i) => (
                <StripDealCard key={deal.id} deal={deal} idx={i} />
              ))}
              {thriveDeals.length === 0 && (
                <p
                  style={{
                    fontFamily: "Space Mono, monospace",
                    fontSize: "11px",
                    color: "var(--muted)",
                    fontStyle: "italic",
                  }}
                >
                  No current sale items — check the Price Dashboard for full inventory.
                </p>
              )}
            </div>

            {/* Cookies Strip */}
            <div>
              <div
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--deal-green)",
                  borderBottom: "2px solid var(--deal-green)",
                  paddingBottom: "4px",
                  marginBottom: "12px",
                  letterSpacing: "0.1em",
                }}
              >
                ✓ Worth the Walk
              </div>
              <div
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "15px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                Cookies On The Strip
              </div>
              <p
                style={{
                  fontFamily: "Source Serif 4, serif",
                  fontSize: "12px",
                  color: "var(--muted)",
                  lineHeight: "1.6",
                  marginBottom: "12px",
                }}
              >
                Brand-name recognition, honest pricing. Closer to foot traffic.
                Good for tourists who want a name they&apos;ve heard of.
              </p>
              {cookiesDeals.slice(0, 2).map((deal, i) => (
                <StripDealCard key={deal.id} deal={deal} idx={i} />
              ))}
              {cookiesDeals.length === 0 && (
                <p
                  style={{
                    fontFamily: "Space Mono, monospace",
                    fontSize: "11px",
                    color: "var(--muted)",
                    fontStyle: "italic",
                  }}
                >
                  No current sale items — check the Price Dashboard for full inventory.
                </p>
              )}
            </div>
          </div>

          {/* Terry's survival tips */}
          <div
            style={{
              background: "var(--aged)",
              border: "1px solid var(--ink)",
              padding: "16px",
            }}
          >
            <span className="kicker">Terry&apos;s Survival Tips</span>
            <ul style={{ listStyle: "none", marginTop: "8px" }}>
              {TERRY_TIPS.map((tip, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: "Source Serif 4, serif",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    padding: "6px 0",
                    borderBottom:
                      i < TERRY_TIPS.length - 1
                        ? "1px solid var(--muted)"
                        : "none",
                    paddingLeft: "16px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      color: "var(--accent)",
                      fontFamily: "Space Mono, monospace",
                      fontSize: "10px",
                    }}
                  >
                    {i + 1}.
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Avoid list */}
          <div style={{ marginTop: "20px" }}>
            <span className="kicker" style={{ color: "var(--muted)" }}>
              Tourist Terry Says Avoid
            </span>
            {TERRY_AVOID.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "12px",
                }}
              >
                <span
                  style={{
                    color: "var(--accent)",
                    fontFamily: "Space Mono, monospace",
                    fontSize: "12px",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "Playfair Display, serif",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "Source Serif 4, serif",
                      fontSize: "12px",
                      color: "var(--muted)",
                      fontStyle: "italic",
                      lineHeight: "1.5",
                    }}
                  >
                    {item.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ background: "var(--ink)", margin: "24px 0" }} />

        {/* RIGHT: Ziggy's Final Rating + Pro Upsell */}
        <div style={{ padding: "32px 0 32px 24px" }}>
          <span className="kicker">Ziggy&apos;s Final Market Rating</span>
          <h2
            className="font-headline"
            style={{ fontSize: "26px", fontWeight: 900, marginBottom: "8px", lineHeight: 1.1 }}
          >
            Today&apos;s Verdict
          </h2>

          {/* Big rating display */}
          <div
            style={{
              textAlign: "center",
              padding: "32px 16px",
              border: "3px double var(--ink)",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "96px",
                fontWeight: 900,
                color: "var(--accent)",
                lineHeight: 1,
              }}
            >
              7.8
            </div>
            <div
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "12px",
                color: "var(--muted)",
                marginTop: "4px",
              }}
            >
              /10 — Market Confidence Rating
            </div>
            <div
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--muted)",
                marginTop: "8px",
              }}
            >
              Updated Daily by Ziggy
            </div>
          </div>

          <p
            style={{
              fontFamily: "Source Serif 4, serif",
              fontSize: "14px",
              lineHeight: "1.75",
              marginBottom: "24px",
              whiteSpace: "pre-line",
            }}
          >
            {ZIGGY_SIGN_OFF}
          </p>

          <div
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "11px",
              color: "var(--accent)",
              borderTop: "2px solid var(--ink)",
              paddingTop: "12px",
              marginBottom: "32px",
            }}
          >
            — Ziggy, Daily Weed Newspaper
          </div>

          {/* Stats for context */}
          <div
            style={{
              background: "var(--aged)",
              border: "1px solid var(--ink)",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <span className="kicker">Today by the Numbers</span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              {[
                { n: stats.totalProducts.toLocaleString(), l: "Products Tracked" },
                { n: stats.dispensaryCount.toString(), l: "Dispensaries" },
                { n: stats.onSaleCount.toLocaleString(), l: "Items On Sale" },
                { n: `$${stats.minPrice.toFixed(2)}`, l: "Lowest Price" },
              ].map(({ n, l }) => (
                <div key={l}>
                  <div
                    style={{
                      fontFamily: "Playfair Display, serif",
                      fontSize: "22px",
                      fontWeight: 900,
                      color: "var(--accent)",
                    }}
                  >
                    {n}
                  </div>
                  <div
                    style={{
                      fontFamily: "Space Mono, monospace",
                      fontSize: "9px",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro upsell */}
          <div
            style={{
              border: "3px double var(--ink)",
              background: "var(--aged)",
              padding: "20px",
            }}
          >
            <span className="kicker">Get The Full Intelligence</span>
            <h3
              className="font-headline"
              style={{ fontSize: "20px", fontWeight: 900, marginBottom: "8px" }}
            >
              Ziggy Pro — $9/mo
            </h3>
            <ul className="pro-features" style={{ marginBottom: "16px" }}>
              <li>Daily price alerts for your saved strains</li>
              <li>All dispensaries, all products, always live</li>
              <li>Historical trends — spot the cycles</li>
              <li>CSV export for power users</li>
              <li>7-day free trial, cancel anytime</li>
            </ul>
            <input
              className="email-input"
              type="email"
              placeholder="your@email.com"
            />
            <button className="cta-button" style={{ marginTop: "4px" }}>
              Start Free Trial
            </button>
          </div>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
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
              → Open the Price Dashboard
            </Link>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        © {new Date().getFullYear()} Daily Weed Newspaper &middot; Page 3 of 3
        &middot; dailyweednewspaper.com &middot;{" "}
        <Link href="/prices" style={{ color: "var(--accent)" }}>
          Price Dashboard
        </Link>
      </footer>
    </>
  );
}
