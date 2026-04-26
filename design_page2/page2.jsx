/* eslint-disable */
// Daily Weed Newspaper — Page 2: The Sheet
// Three sections: Lucky 7 Market Averages, Big Mike's Local Tea, Price History
// Renders both desktop (1180px column) and mobile (390px) variants.

const { useMemo } = React;

// ── DATA ──────────────────────────────────────────────────────────────────
// Lucky 7 categories — order is non-negotiable per spec.
const CATEGORIES = [
  { key: "eighth",     label: "Eighth",            avg: 24.96, var: "--cat-eighth" },
  { key: "cart",       label: "1g Cart",           avg: 32.40, var: "--cat-cart" },
  { key: "edible",     label: "100mg Edible",      avg: 14.82, var: "--cat-edible" },
  { key: "resin",      label: "1g Live Resin",     avg: 38.15, var: "--cat-resin" },
  { key: "preroll",    label: "Single Pre-Roll",   avg:  6.74, var: "--cat-preroll" },
  { key: "infused",    label: "Infused Pre-Roll",  avg: 12.58, var: "--cat-infused" },
  { key: "disposable", label: "1g Disposable",     avg: 28.30, var: "--cat-disposable" },
];

const TEA_ITEMS = [
  {
    kicker: "Heard ’round Sahara",
    body: "Thrive’s been restocking heavy this week — new Wyld and Stiiizy SKUs hit the case Tuesday. Manager wouldn’t confirm but the back room had pallets. Something’s coming, probably a 4/20 hangover sale that runs into next weekend.",
    byline: "—M.",
  },
  {
    kicker: "On the Strip",
    body: "Two of the corridor shops still pricing eighths at $55 retail. Same SKU is $32 four miles east. The math ain’t mathing for tourists, and the security guard at the door agreed with me on the record.",
    byline: "—M.",
  },
  {
    kicker: "Cultivator chatter",
    body: "Word from a buyer at a Henderson grow: live resin yields are up, wholesale’s soft, expect $30 carts to be standard by month’s end. You heard it here, in print, on paper.",
    byline: "—M.",
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────
const fmtUSD = (n) => `$${n.toFixed(2)}`;
const maxAvg = Math.max(...CATEGORIES.map((c) => c.avg));

// ── SECTION 1 — LUCKY 7 MARKET AVERAGES ───────────────────────────────────
function Lucky7({ compact = false }) {
  return (
    <section className={`p2-section lucky7 ${compact ? "is-compact" : ""}`}>
      <div className="kicker">
        <span className="kicker-mark">§</span> LUCKY 7 · MARKET AVERAGES
        <span className="kicker-tail">— SEVEN PRICES THAT TELL THE STORY —</span>
      </div>

      <h2 className="section-title">
        What an average gram, eighth, and dose costs in Las Vegas today.
      </h2>

      <div className="bars">
        <div className="bars-head">
          <span>CATEGORY</span>
          <span className="ax">AVG. RETAIL · APR 25, 2026</span>
        </div>

        {CATEGORIES.map((c, i) => {
          const pct = (c.avg / maxAvg) * 100;
          return (
            <div key={c.key} className="bar-row">
              <div className="bar-rank">{String(i + 1).padStart(2, "0")}</div>
              <div className="bar-name">{c.label}</div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${pct}%`, background: `var(${c.var})` }}
                />
                <div className="bar-track-tick" />
              </div>
              <div className="bar-val">{fmtUSD(c.avg)}</div>
            </div>
          );
        })}
      </div>

      <div className="bars-foot">
        <span>
          <span className="ast">*</span>Average of in-stock retail prices across 16
          audited Las Vegas dispensaries. Excludes accessories, apparel &amp; novelty.
        </span>
        <span className="meta">N = 3,617 LISTINGS · UPDATED 06:00 PST</span>
      </div>
    </section>
  );
}

// ── SECTION 2 — BIG MIKE'S LOCAL TEA ──────────────────────────────────────
function LocalTea({ compact = false }) {
  return (
    <section className={`p2-section tea ${compact ? "is-compact" : ""}`}>
      <div className="kicker">
        <span className="kicker-mark">☕</span> BIG MIKE’S LOCAL TEA
        <span className="kicker-tail">— PG. 2 · OVERHEARD, CONFIRMED, PRINTED —</span>
      </div>

      <div className="tea-head">
        <h2 className="tea-title">
          “The shops talk to each other. <em>I just write it down.</em>”
        </h2>
        <div className="tea-meta">
          <div className="tea-meta-row"><dt>FILED</dt><dd>Apr 25, 06:14 PST</dd></div>
          <div className="tea-meta-row"><dt>BEAT</dt><dd>Las Vegas Metro</dd></div>
          <div className="tea-meta-row"><dt>SOURCES</dt><dd>3 anon · 1 named</dd></div>
        </div>
      </div>

      <div className="tea-cols">
        {TEA_ITEMS.map((t, i) => (
          <article key={i} className="tea-item">
            <div className="tea-kicker">{t.kicker}</div>
            <p className="tea-body">
              <span className="dropcap">{t.body.charAt(0)}</span>
              {t.body.slice(1)}
            </p>
            <div className="tea-byline">{t.byline}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── SECTION 3 — PRICE HISTORY (Day 1 empty state) ─────────────────────────
function PriceHistory({ compact = false }) {
  // Day 1: a single dot per category at today's value.
  // Y axis spans 0 → ceil(maxAvg / 5) * 5, with a small headroom.
  const yMax = Math.ceil((maxAvg + 4) / 5) * 5; // 40
  const yTicks = useMemo(() => {
    const step = yMax / 4;
    return Array.from({ length: 5 }, (_, i) => i * step);
  }, [yMax]);

  // SVG dimensions — desktop = wide, mobile = scrollable wide canvas
  const W = compact ? 720 : 1080;
  const H = compact ? 280 : 360;
  const PAD = { l: 56, r: 28, t: 24, b: 44 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  // Day 1 is the only data point. We pin it 18% in from the right of the inner
  // chart so there's "future room" to the right (where lines will build).
  const todayX = PAD.l + innerW * 0.82;
  const yAt = (v) => PAD.t + innerH * (1 - v / yMax);

  // Date axis: build a month-window starting from a reference launch date.
  const startDate = new Date(2026, 3, 25); // Apr 25, 2026 (Day 1)
  const dayLabels = useMemo(() => {
    const labels = [];
    for (let d = -22; d <= 4; d += 1) {
      const dt = new Date(startDate);
      dt.setDate(dt.getDate() + d);
      labels.push({
        d,
        label:
          dt.getDate() === 1 || d === 0 || d === -22 || d === 4
            ? `${dt.toLocaleString("en-US", { month: "short" }).toUpperCase()} ${dt.getDate()}`
            : `${dt.getDate()}`,
        major: d === 0 || dt.getDate() === 1,
      });
    }
    return labels;
  }, []);

  const xAt = (d) =>
    PAD.l + innerW * ((d + 22) / 26); // map -22..+4 → 0..1

  return (
    <section className={`p2-section history ${compact ? "is-compact" : ""}`}>
      <div className="kicker">
        <span className="kicker-mark">⌗</span> LUCKY 7 · PRICE HISTORY
        <span className="kicker-tail">— EVERY EDITION, ANOTHER DOT —</span>
      </div>

      <h2 className="section-title">
        Day 1 of tracking. The lines build with each printing.
      </h2>

      <div className={`chart-wrap ${compact ? "is-scroll" : ""}`}>
        <svg
          className="chart"
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          role="img"
          aria-label="Lucky 7 price history, day 1"
        >
          {/* Plot area frame */}
          <rect
            x={PAD.l}
            y={PAD.t}
            width={innerW}
            height={innerH}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1"
          />

          {/* Y gridlines + labels */}
          {yTicks.map((v, i) => (
            <g key={`y-${i}`}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={yAt(v)}
                y2={yAt(v)}
                stroke="var(--ink)"
                strokeOpacity={i === 0 ? 0 : 0.18}
                strokeDasharray={i === 0 ? "0" : "1 3"}
              />
              <text
                x={PAD.l - 8}
                y={yAt(v) + 4}
                textAnchor="end"
                className="ax-tick"
              >
                ${v.toFixed(0)}
              </text>
            </g>
          ))}

          {/* X axis baseline */}
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={PAD.t + innerH}
            y2={PAD.t + innerH}
            stroke="var(--ink)"
            strokeWidth="1"
          />

          {/* X tick labels — sparse */}
          {dayLabels
            .filter((t) => t.major || Math.abs(t.d) % 7 === 0)
            .map((t) => (
              <g key={`x-${t.d}`}>
                <line
                  x1={xAt(t.d)}
                  x2={xAt(t.d)}
                  y1={PAD.t + innerH}
                  y2={PAD.t + innerH + 4}
                  stroke="var(--ink)"
                />
                <text
                  x={xAt(t.d)}
                  y={PAD.t + innerH + 16}
                  textAnchor="middle"
                  className="ax-tick"
                >
                  {t.label}
                </text>
              </g>
            ))}

          {/* "TODAY" vertical guide */}
          <line
            x1={todayX}
            x2={todayX}
            y1={PAD.t}
            y2={PAD.t + innerH}
            stroke="var(--ink)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <text
            x={todayX}
            y={PAD.t - 8}
            textAnchor="middle"
            className="ax-tick"
            style={{ fontWeight: 700 }}
          >
            ◆ TODAY · APR 25
          </text>

          {/* Empty-state ghost lines: faint horizontal traces from the dot
              back into history, suggesting where the line WILL appear. */}
          {CATEGORIES.map((c) => (
            <line
              key={`ghost-${c.key}`}
              x1={PAD.l}
              x2={todayX}
              y1={yAt(c.avg)}
              y2={yAt(c.avg)}
              stroke={`var(${c.var})`}
              strokeOpacity="0.18"
              strokeWidth="1"
              strokeDasharray="1 4"
            />
          ))}

          {/* Data dots — Day 1 — one per category */}
          {CATEGORIES.map((c) => (
            <g key={`dot-${c.key}`}>
              <circle
                cx={todayX}
                cy={yAt(c.avg)}
                r="5"
                fill={`var(${c.var})`}
                stroke="var(--newsprint)"
                strokeWidth="1.5"
              />
              {/* leader line + label, off the right edge of the chart */}
              <line
                x1={todayX + 6}
                x2={W - PAD.r - 4}
                y1={yAt(c.avg)}
                y2={yAt(c.avg)}
                stroke={`var(${c.var})`}
                strokeOpacity="0.5"
                strokeWidth="1"
              />
              <text
                x={W - PAD.r - 2}
                y={yAt(c.avg) + 3}
                textAnchor="end"
                className="dot-label"
                fill={`var(${c.var})`}
              >
                {c.label.toUpperCase()} · {fmtUSD(c.avg)}
              </text>
            </g>
          ))}

          {/* "future" hint — empty plot to the right of TODAY */}
          <text
            x={(todayX + (W - PAD.r)) / 2}
            y={PAD.t + innerH / 2}
            textAnchor="middle"
            className="future-hint"
          >
            ⤳ LINES BUILD HERE
          </text>
        </svg>
      </div>

      <div className="history-foot">
        <span>Day 1 of tracking · Lines build daily</span>
        <span className="meta">
          NEXT EDITION: APR 26, 06:00 PST · DOTS BECOME LINES
        </span>
      </div>
    </section>
  );
}

// ── ASSEMBLED PAGE ────────────────────────────────────────────────────────
function PageTwo({ compact = false }) {
  return (
    <div className={`page2 ${compact ? "is-mobile" : "is-desktop"}`}>
      {/* Folio strip — page 2 header (mirrors page 1's chrome at low key) */}
      <div className="p2-folio">
        <span className="p2-folio-l">
          <span className="pill">PG. 2</span>
          <span className="sep">│</span>
          <span>The Sheet</span>
        </span>
        <span className="p2-folio-c">
          Where Numbers Become Stories &amp; Stories Become Numbers
        </span>
        <span className="p2-folio-r">
          <span>Sat, Apr 25, 2026</span>
          <span className="sep">│</span>
          <span>Edition № 025</span>
        </span>
      </div>

      <Lucky7 compact={compact} />
      <div className="rule-double" />
      <LocalTea compact={compact} />
      <div className="rule-double" />
      <PriceHistory compact={compact} />

      <div className="p2-tail">
        <span>— END PG. 2 —</span>
      </div>
    </div>
  );
}

window.PageTwo = PageTwo;
window.PAGE2_CATEGORIES = CATEGORIES;
