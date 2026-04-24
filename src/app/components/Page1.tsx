import Link from "next/link";
import { PageData } from "@/lib/data";
import { displayProductSize, calcMgPerDollar } from "@/lib/format";
import EmailSignupForm from "./EmailSignupForm";
import AuthLabel from "./AuthLabel";
import Top10Table from "./Top10Table";
import MobileChrome from "./MobileChrome";

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
  const { stats, topDeals, dailyWinners, dailyBrief } = data;
  const brief = dailyBrief?.brief_json ?? null;

  // Edition number: days since April 1 2026 launch
  const launchDate = new Date("2026-04-01T00:00:00Z");
  const editionNum = (
    Math.max(0, Math.floor((Date.now() - launchDate.getTime()) / 86400000)) + 1
  )
    .toString()
    .padStart(3, "0");

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  // e.g. "Apr 24 '26" for the index sheet
  const shortDate =
    now.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " '" +
    String(now.getFullYear()).slice(2);

  // Ziggy liner for ticker — deterministic by day to avoid hydration mismatch
  const ziggyLine = ZIGGY_LINERS[now.getDay() % ZIGGY_LINERS.length];

  // Ticker pick-of-the-day
  const deal = topDeals[0];
  const dealLine = deal
    ? `${deal.name}${deal.weight_grams ? ` ${displayProductSize(deal.name, deal.category, deal.weight_grams)}` : ""} — ${deal.discountPct}% OFF at ${deal.dispensaries?.name ?? "local dispensary"}, now $${Number(deal.price).toFixed(2)} — "${ZIGGY_LINERS[0]}"`
    : null;

  // Ticker headlines (duplicated for seamless loop)
  function TickerContent() {
    return (
      <>
        {dealLine && (
          <>
            <span className="tk-tag">★ PICK OF THE DAY</span>
            {dealLine}
            <span className="tk-sep">◆</span>
          </>
        )}
        <span className="tk-tag">★ ZIGGY REPORT</span>
        Strip dispensaries still charging 2022 prices
        <span className="tk-sep">◆</span>
        <span className="tk-tag">ON SALE</span>
        {stats.onSaleCount.toLocaleString()} products discounted right now
        <span className="tk-sep">◆</span>
        <span className="tk-tag">LOW WATERMARK</span>
        Cheapest eighth spotted at ${stats.minPrice.toFixed(2)}
        <span className="tk-sep">◆</span>
        <span className="tk-tag">AVG PRICE</span>
        ${stats.avgPrice.toFixed(2)} across all menus
        <span className="tk-sep">◆</span>
        <span className="tk-tag">MARKET RATING</span>
        {brief?.marketRating ?? "7.8"} / 10 — prices softening
        <span className="tk-sep">◆</span>
        <span className="tk-tag">ZIGGY SAYS</span>
        &ldquo;{ziggyLine}&rdquo;
        <span className="tk-sep">◆</span>
      </>
    );
  }

  // Stats deltas helpers
  const totalDelta = stats.totalProductsDelta;
  const avgDelta = stats.avgPriceDelta;

  // Min price product sub-label
  const mpp = stats.minPriceProduct;
  const mppSub = mpp
    ? [
        mpp.category,
        mpp.weightGrams ? `${mpp.weightGrams}g` : null,
      ]
        .filter(Boolean)
        .join(", ")
    : "In Stock";
  const mppCity = mpp?.city
    ? mpp.city.replace("North Las Vegas", "N.L.V.").replace("Las Vegas", "L.V.")
    : null;
  const mppDispLine =
    mpp ? [mpp.dispensaryName, mppCity].filter(Boolean).join(" · ") : null;

  return (
    <>
      {/* ══ MOBILE CHROME (client component: hamburger + drawer + bottom nav) ══ */}
      <MobileChrome editionNum={editionNum} shortDate={shortDate} />

      {/* ══ MOBILE SECONDARY FOLIO ROW ══════════════════════════════════════════ */}
      <div className="mfolio">
        <span className="mfolio-motto">
          &ldquo;All the Deals That&apos;s Fit to Print&rdquo;
        </span>
        <span className="folio-sep">│</span>
        <span>36°10′N · 115°08′W</span>
      </div>

      {/* ══ DESKTOP FOLIO STRIP ══════════════════════════════════════════════════ */}
      <div className="folio">
        <div className="folio-left">
          <span className="folio-pill">VOL. I</span>
          <span>No.&nbsp;{editionNum}</span>
          <span className="folio-sep">│</span>
          <span>36°10′N · 115°08′W</span>
        </div>
        <div className="folio-center">
          &ldquo;All the Deals That&apos;s Fit to Print&rdquo; — Est. April 2026
        </div>
        <div className="folio-right">
          <span>Las Vegas, Nev.</span>
          <span className="folio-sep">│</span>
          <span>Sign In</span>
          {/* AuthLabel integrated inline on desktop */}
          <span className="folio-auth"><AuthLabel /></span>
        </div>
      </div>

      {/* ══ MASTHEAD ═════════════════════════════════════════════════════════════ */}
      <header className="masthead">
        <div className="masthead-row">

          {/* Left ornament: Today's Index — desktop only */}
          <aside className="orn orn-left" aria-label="Today in this edition">
            <div className="orn-head">Today&apos;s Index</div>
            <dl className="orn-dl">
              <dt>Front Page</dt><dd>01</dd>
              <dt>Inside Scoop</dt><dd>02</dd>
              <dt>The Closer</dt><dd>03</dd>
              <dt>Market Data</dt><dd>04</dd>
              <dt>Ziggy&apos;s Column</dt><dd>05</dd>
            </dl>
          </aside>

          {/* Center: Title block */}
          <div className="title-wrap">
            <div className="latin-motto">Veritas · Cannabis · Economia</div>
            <h1 className="masthead-title">Daily Weed Newspaper</h1>
            <p className="masthead-subhead">
              The Only Cannabis Publication
              <span className="tilde">§</span>
              That Actually Gives a Damn About Your Wallet
            </p>
          </div>

          {/* Right ornament: Today's Almanac — desktop only */}
          <aside className="orn orn-right" aria-label="Today's almanac">
            <div className="orn-head">Today&apos;s Almanac</div>
            <dl className="orn-dl">
              <dt>Sunrise</dt><dd>05:58</dd>
              <dt>Sunset</dt><dd>19:14</dd>
              <dt>High / Low</dt><dd>78° / 54°</dd>
              <dt>Humidity</dt><dd>18%</dd>
              <dt>Moon</dt><dd>Waxing Gibbous</dd>
            </dl>
          </aside>

        </div>

        {/* Mobile slim almanac strip — hidden on desktop */}
        <div className="malmanac" aria-label="Today's almanac">
          <span className="malmanac-label">Today&apos;s Almanac</span>
          <span className="malmanac-grp">
            <span className="malmanac-val">78°/54°</span>
            <span className="malmanac-sep">│</span>
            <span>
              <span className="malmanac-val">☾</span> Waxing Gibbous
            </span>
          </span>
        </div>

        {/* Dateline — triple rule */}
        <div className="dateline">
          {/* Mobile: 3 stacked centered rows */}
          <div className="dateline-mobile">
            <span className="dateline-row">
              {dateStr}
              <span className="dateline-divider" />
              Edition <span className="dateline-accent">№&nbsp;{editionNum}</span>
            </span>
            <span className="dateline-row">Las Vegas · Nevada · U.S.A.</span>
            <span className="dateline-row">
              {stats.dispensaryCount} Dispensaries
              <span className="dateline-divider" />
              <span className="dateline-accent">
                {stats.totalProducts.toLocaleString()}
              </span>{" "}
              Menus Priced
            </span>
          </div>
          {/* Desktop: 3-column grid */}
          <div className="dateline-inner">
            <span className="dateline-lo">
              {dateStr}
              <span className="dateline-divider" />
              Edition{" "}
              <span className="dateline-accent">№&nbsp;{editionNum}</span>
            </span>
            <span className="dateline-md">
              Las Vegas · Nevada · United States of America
            </span>
            <span className="dateline-hi">
              {stats.dispensaryCount} Dispensaries Audited
              <span className="dateline-divider" />
              <span className="dateline-accent">
                {stats.totalProducts.toLocaleString()}
              </span>{" "}
              Menus Priced
            </span>
          </div>
        </div>
      </header>

      {/* ══ SECTION RAIL — desktop only ══════════════════════════════════════════ */}
      <nav className="section-rail" aria-label="Sections">
        <a href="/" className="section-link section-current">Front Page</a>
        <a href="/prices" className="section-link">Price Dashboard</a>
        <a href="/#top10" className="section-link">Top 10 Winners</a>
        <a href="#" className="section-link">Big Mike&apos;s Tea</a>
        <a href="#" className="section-link">Tourist Terry</a>
        <a href="#" className="section-link">Ziggy&apos;s Column</a>
      </nav>

      {/* ══ TICKER ═══════════════════════════════════════════════════════════════ */}
      <div className="ticker-shell" role="marquee" aria-label="Ziggy ticker">
        <div className="ticker-flag">
          <span className="ticker-dot" aria-hidden="true" />
          <span className="ticker-flag-label-mobile">Live</span>
          <span className="ticker-flag-label-desktop">Ziggy Live</span>
        </div>
        <div className="ticker-bar">
          <div className="ticker-inner">
            <TickerContent />
            <TickerContent />
          </div>
        </div>
      </div>

      {/* ══ STATS STRIP ══════════════════════════════════════════════════════════ */}
      <section className="stats-strip" aria-label="Market vitals">
        <div className="stats-grid">

          {/* 01 — Total Products */}
          <div className="stat-box">
            <div className="stat-kicker">
              <span className="stat-tag">01</span> Total Products
            </div>
            <div className="stat-number">
              {stats.totalProducts.toLocaleString()}
            </div>
            <div className="stat-hair" />
            <div className="stat-sub">
              Menus Priced
              {totalDelta !== null && (
                <span className={`delta${totalDelta < 0 ? " down" : ""}`}>
                  {totalDelta >= 0 ? "▲" : "▼"} {Math.abs(totalDelta)} vs. last ed.
                </span>
              )}
            </div>
          </div>

          {/* 02 — Dispensaries */}
          <div className="stat-box">
            <div className="stat-kicker">
              <span className="stat-tag">02</span> Dispensaries
            </div>
            <div className="stat-number">{stats.dispensaryCount}</div>
            <div className="stat-hair" />
            <div className="stat-sub">
              Las Vegas Metro
              <span className="delta">All Audited</span>
            </div>
          </div>

          {/* 03 — On Sale Now */}
          <div className="stat-box">
            <div className="stat-kicker">
              <span className="stat-tag">03</span> On Sale Now
            </div>
            <div className="stat-number">
              {stats.onSaleCount.toLocaleString()}
            </div>
            <div className="stat-hair" />
            <div className="stat-sub">
              {stats.onSalePct.toFixed(1)}% of Inv.
              {stats.onSalePctDeltaPts !== null && (
                <span className={`delta${stats.onSalePctDeltaPts < 0 ? " down" : ""}`}>
                  {stats.onSalePctDeltaPts >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(stats.onSalePctDeltaPts).toFixed(1)} pts w/w
                </span>
              )}
            </div>
          </div>

          {/* 04 — Lowest Price */}
          <div className="stat-box">
            <div className="stat-kicker">
              <span className="stat-tag">04</span> Lowest Price
            </div>
            <div className="stat-number">
              <span className="stat-pre">$</span>
              {stats.minPriceExAccessories.toFixed(2)}
              <span className="stat-ast">*</span>
            </div>
            <div className="stat-hair" />
            <div className="stat-sub">
              {mppSub}
              {mppDispLine && (
                <span className="delta">{mppDispLine}</span>
              )}
            </div>
          </div>

          {/* 05 — Average Price (full-width on mobile) */}
          <div className="stat-box stat-span2">
            <div className="stat-kicker">
              <span className="stat-tag">05</span>
              <span className="stat-kicker-short">Avg Price</span>
              <span className="stat-kicker-long">Average Price (Across All Menus)</span>
            </div>
            <div className="stat-number stat-number-lg">
              <span className="stat-pre">$</span>
              {stats.avgPriceExAccessories.toFixed(2)}
              <span className="stat-ast">*</span>
            </div>
            <div className="stat-hair" />
            <div className="stat-sub">
              <span className="stat-sub-cats">
                Flower · Pre-Rolls · Concentrates · Edibles · Vapes
              </span>
              {avgDelta !== null && (
                <span className={`delta${avgDelta < 0 ? " down" : ""}`}>
                  {avgDelta >= 0 ? "▲" : "▼"} ${Math.abs(avgDelta).toFixed(2)} vs. last edition
                </span>
              )}
            </div>
          </div>

        </div>

        <div className="stats-footnote">
          <span>
            <span className="footnote-ast">*</span>
            Figures exclude accessories, apparel &amp; novelty items.
            Flower, pre-rolls, concentrates, edibles, vapes &amp; tinctures only.
          </span>
          <span className="footnote-meta">
            Sourced from public menus · Updated{" "}
            {new Date(stats.lastUpdatedAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: "America/Los_Angeles",
              timeZoneName: "short",
            })}
          </span>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          STOP: everything below this line is untouched per brief scope
          ═════════════════════════════════════════════════════════════════════ */}

      {/* 3-COLUMN GRID */}
      <div className="newspaper-grid">
        {/* LEFT COLUMN */}
        <div className="column">
          <span className="kicker">Ziggy&apos;s Top 10 Winners</span>
          <h2
            className="font-headline"
            style={{ fontSize: "20px", fontWeight: 900, marginBottom: "4px" }}
          >
            Ziggy&apos;s Top 10
          </h2>
          <p style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginBottom: "12px", lineHeight: 1.6 }}>
            The best value in Vegas right now, by category. Shake gets its own trophy so it stops stealing flower&apos;s.
          </p>
          <Top10Table winners={dailyWinners} />

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
            By Ziggy, Price Intelligence Correspondent &middot; Updated{" "}
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <p
            className="drop-cap"
            style={{ marginBottom: "20px", fontSize: "14px", lineHeight: "1.7" }}
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
            topDeals.map((dealItem, i) => (
              <div key={dealItem.id} className="deal-box">
                <span className="deal-number">#{i + 1}</span>
                <div className="deal-name">
                  {dealItem.name}
                  {dealItem.weight_grams && (
                    <span style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginLeft: "8px", fontWeight: 400 }}>
                      {displayProductSize(dealItem.name, dealItem.category, dealItem.weight_grams)}
                    </span>
                  )}
                </div>
                <div className="deal-dispensary">
                  {dealItem.dispensaries?.name ?? "Unknown Dispensary"}
                  {dealItem.brand && (
                    <span style={{ color: "var(--muted)", marginLeft: "6px" }}>
                      · {dealItem.brand}
                    </span>
                  )}
                </div>
                <div className="deal-prices">
                  <span className="deal-price-sale">
                    ${Number(dealItem.price).toFixed(2)}
                  </span>
                  {dealItem.original_price && (
                    <span className="deal-price-orig">
                      ${Number(dealItem.original_price).toFixed(2)}
                    </span>
                  )}
                  <span className="deal-discount-badge">
                    -{dealItem.discountPct}%
                  </span>
                  {dealItem.thc_percentage && (
                    <span style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginLeft: "4px" }}>
                      {Number(dealItem.thc_percentage).toFixed(1)}% THC
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
              style={{ fontFamily: "Space Mono, monospace", fontSize: "11px", color: "var(--accent)", textDecoration: "none", borderBottom: "1px solid var(--accent)" }}
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
              <span style={{ fontSize: "14px", fontFamily: "Space Mono, monospace", color: "var(--muted)" }}>
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

          {/* Ziggy's Rating */}
          <div className="gork-rating">
            <span className="kicker">Ziggy&apos;s Market Rating</span>
            <div className="rating-number">{brief?.marketRating ?? 7.8}</div>
            <div style={{ fontFamily: "Space Mono, monospace", fontSize: "11px", color: "var(--muted)" }}>
              /10 — Market Confidence
            </div>
            <p style={{ fontFamily: "Source Serif 4, serif", fontSize: "12px", marginTop: "8px", fontStyle: "italic", color: "var(--muted)" }}>
              &ldquo;{brief?.ratingQuote ?? "Prices are improving. Slowly. Like a high that takes 45 minutes."}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="bottom-grid">
        <div className="bottom-column">
          <span className="kicker">About Ziggy</span>
          <h2 className="font-headline" style={{ fontSize: "22px", fontWeight: 900, marginBottom: "12px" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
            {["Denver, CO", "Phoenix, AZ", "Portland, OR", "Los Angeles, CA", "Chicago, IL", "Detroit, MI"].map((city) => (
              <div key={city} style={{ fontFamily: "Space Mono, monospace", fontSize: "11px", padding: "6px 8px", border: "1px solid var(--aged)", color: "var(--muted)" }}>
                {city}
              </div>
            ))}
          </div>
        </div>

        <div className="bottom-column">
          <span className="kicker">Subscribe to Ziggy Intelligence</span>
          <h2 className="font-headline" style={{ fontSize: "22px", fontWeight: 900, marginBottom: "4px" }}>
            Don&apos;t Pay Dispensary Prices in the Dark
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px", fontFamily: "Space Mono, monospace" }}>
            Free tier included. No credit card required to start.
          </p>

          <div className="pricing-tiers">
            <div className="pricing-tier">
              <span className="kicker">Monthly</span>
              <div className="tier-price">$9</div>
              <p style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
                per month
              </p>
            </div>
            <div className="pricing-tier" style={{ border: "3px solid var(--ink)" }}>
              <span className="kicker" style={{ color: "var(--deal-green)" }}>
                Annual · Best Value
              </span>
              <div className="tier-price">$99</div>
              <p style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
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
