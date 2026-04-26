import { PageData, Lucky7Averages } from "@/lib/data";

// ── Lucky 7 category definitions ──────────────────────────────────────────────
const CATEGORIES: Array<{
  key: keyof Pick<Lucky7Averages, "eighth" | "cart" | "edible" | "resin" | "preroll" | "infused" | "disposable">;
  label: string;
  cssVar: string;
}> = [
  { key: "eighth",     label: "Eighth",           cssVar: "--cat-eighth" },
  { key: "cart",       label: "1g Cart",           cssVar: "--cat-cart" },
  { key: "edible",     label: "100mg Edible",      cssVar: "--cat-edible" },
  { key: "resin",      label: "1g Live Resin",     cssVar: "--cat-resin" },
  { key: "preroll",    label: "Single Pre-Roll",   cssVar: "--cat-preroll" },
  { key: "infused",    label: "Infused Pre-Roll",  cssVar: "--cat-infused" },
  { key: "disposable", label: "1g Disposable",     cssVar: "--cat-disposable" },
];

const TEA_ITEMS = [
  {
    kicker: "Heard 'round Sahara",
    body: "Thrive's been restocking heavy this week — new Wyld and Stiiizy SKUs hit the case Tuesday. Manager wouldn't confirm but the back room had pallets. Something's coming, probably a 4/20 hangover sale that runs into next weekend.",
    byline: "—M.",
  },
  {
    kicker: "On the Strip",
    body: "Two of the corridor shops still pricing eighths at $55 retail. Same SKU is $32 four miles east. The math ain't mathing for tourists, and the security guard at the door agreed with me on the record.",
    byline: "—M.",
  },
  {
    kicker: "Cultivator chatter",
    body: "Word from a buyer at a Henderson grow: live resin yields are up, wholesale's soft, expect $30 carts to be standard by month's end. You heard it here, in print, on paper.",
    byline: "—M.",
  },
];

function fmt(n: number | null): string {
  if (n == null) return "—";
  return `$${n.toFixed(2)}`;
}

// ── Section 1 — Lucky 7 Market Averages ────────────────────────────────────────
function Lucky7({ avgs }: { avgs: Lucky7Averages }) {
  const values = CATEGORIES.map(c => avgs[c.key] ?? 0);
  const maxVal = Math.max(...values.filter(v => v > 0), 1);

  const today = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).toUpperCase();

  return (
    <section className="p2-section">
      <div className="p2-kicker">
        <span className="p2-kicker-mark">§</span>
        LUCKY 7 · MARKET AVERAGES
        <span className="p2-kicker-tail">— SEVEN PRICES THAT TELL THE STORY —</span>
      </div>
      <h2 className="p2-section-title">
        What an average gram, eighth, and dose costs in Las Vegas today.
      </h2>

      <div className="p2-bars">
        <div className="p2-bars-head">
          <span />
          <span>CATEGORY</span>
          <span className="p2-ax">AVG. RETAIL · {today}</span>
        </div>

        {CATEGORIES.map((c, i) => {
          const val = avgs[c.key];
          const pct = val != null && maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={c.key} className="p2-bar-row">
              <div className="p2-bar-rank">{String(i + 1).padStart(2, "0")}</div>
              <div className="p2-bar-name">{c.label}</div>
              <div className="p2-bar-track">
                <div
                  className="p2-bar-fill"
                  style={{ width: `${pct}%`, background: `var(${c.cssVar})` }}
                />
                <div className="p2-bar-track-tick" />
              </div>
              <div className="p2-bar-val">{fmt(val)}</div>
            </div>
          );
        })}
      </div>

      <div className="p2-bars-foot">
        <span>
          <span className="p2-ast">*</span>
          Average of in-stock retail prices across audited Las Vegas dispensaries. Excludes accessories, apparel &amp; novelty.
        </span>
        <span className="p2-meta">
          N = {avgs.totalListings.toLocaleString()} LISTINGS · UPDATED{" "}
          {new Date(avgs.lastUpdatedAt).toLocaleTimeString("en-US", {
            hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles", timeZoneName: "short",
          })}
        </span>
      </div>
    </section>
  );
}

// ── Section 2 — Big Mike's Local Tea ──────────────────────────────────────────
function LocalTea() {
  const filed = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  }) + ", 06:14 PST";

  return (
    <section className="p2-section">
      <div className="p2-kicker">
        <span className="p2-kicker-mark">☕</span>
        BIG MIKE&apos;S LOCAL TEA
        <span className="p2-kicker-tail">— PG. 2 · OVERHEARD, CONFIRMED, PRINTED —</span>
      </div>

      <div className="p2-tea-head">
        <h2 className="p2-tea-title">
          &ldquo;The shops talk to each other. <em>I just write it down.</em>&rdquo;
        </h2>
        <div className="p2-tea-meta">
          <div className="p2-tea-meta-row"><dt>FILED</dt><dd>{filed}</dd></div>
          <div className="p2-tea-meta-row"><dt>BEAT</dt><dd>Las Vegas Metro</dd></div>
          <div className="p2-tea-meta-row"><dt>SOURCES</dt><dd>3 anon · 1 named</dd></div>
        </div>
      </div>

      <div className="p2-tea-cols">
        {TEA_ITEMS.map((t, i) => (
          <article key={i} className="p2-tea-item">
            <div className="p2-tea-kicker">{t.kicker}</div>
            <p className="p2-tea-body">
              <span className="p2-dropcap">{t.body.charAt(0)}</span>
              {t.body.slice(1)}
            </p>
            <div className="p2-tea-byline">{t.byline}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── Section 3 — Price History (Day-1 empty state) ─────────────────────────────
function PriceHistory({ avgs }: { avgs: Lucky7Averages }) {
  const values = CATEGORIES.map(c => avgs[c.key] ?? 0);
  const maxVal = Math.ceil((Math.max(...values, 4) + 4) / 5) * 5; // e.g. 40
  const yTicks = Array.from({ length: 5 }, (_, i) => i * (maxVal / 4));

  const W = 1080, H = 360;
  const PAD = { l: 56, r: 120, t: 24, b: 44 }; // extra right for labels
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const todayX = PAD.l + innerW * 0.82;
  const yAt = (v: number) => PAD.t + innerH * (1 - v / maxVal);

  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  const nextEdition = new Date(today);
  nextEdition.setDate(nextEdition.getDate() + 1);
  const nextLabel = nextEdition.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();

  // X-axis ticks: sparse labels across a 27-day window (-22 to +4)
  const xTickDays = [-21, -14, -7, 0, 4];
  const xAt = (d: number) => PAD.l + innerW * ((d + 22) / 26);

  return (
    <section className="p2-section">
      <div className="p2-kicker">
        <span className="p2-kicker-mark">⌗</span>
        LUCKY 7 · PRICE HISTORY
        <span className="p2-kicker-tail">— EVERY EDITION, ANOTHER DOT —</span>
      </div>
      <h2 className="p2-section-title">
        Day 1 of tracking. The lines build with each printing.
      </h2>

      <div className="p2-chart-wrap">
        <svg
          className="p2-chart"
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label="Lucky 7 price history, day 1 — lines build over time"
        >
          {/* Plot frame */}
          <rect
            x={PAD.l} y={PAD.t}
            width={innerW} height={innerH}
            fill="none" stroke="var(--ink)" strokeWidth="1"
          />

          {/* Y gridlines + labels */}
          {yTicks.map((v, i) => (
            <g key={`y-${i}`}>
              <line
                x1={PAD.l} x2={PAD.l + innerW}
                y1={yAt(v)} y2={yAt(v)}
                stroke="var(--ink)"
                strokeOpacity={i === 0 ? 0 : 0.18}
                strokeDasharray={i === 0 ? "0" : "1 3"}
              />
              <text x={PAD.l - 8} y={yAt(v) + 4} textAnchor="end" className="p2-ax-tick">
                ${v.toFixed(0)}
              </text>
            </g>
          ))}

          {/* X axis ticks */}
          {xTickDays.map(d => (
            <g key={`x-${d}`}>
              <line
                x1={xAt(d)} x2={xAt(d)}
                y1={PAD.t + innerH} y2={PAD.t + innerH + 4}
                stroke="var(--ink)"
              />
              <text x={xAt(d)} y={PAD.t + innerH + 16} textAnchor="middle" className="p2-ax-tick">
                {d === 0 ? todayLabel : `${d}d`}
              </text>
            </g>
          ))}

          {/* TODAY guide */}
          <line
            x1={todayX} x2={todayX}
            y1={PAD.t} y2={PAD.t + innerH}
            stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 3"
          />
          <text x={todayX} y={PAD.t - 8} textAnchor="middle" className="p2-ax-tick" fontWeight="700">
            ◆ TODAY · {todayLabel}
          </text>

          {/* Ghost trails — faint horizontal trace back into history */}
          {CATEGORIES.map(c => {
            const val = avgs[c.key];
            if (val == null) return null;
            return (
              <line
                key={`ghost-${c.key}`}
                x1={PAD.l} x2={todayX}
                y1={yAt(val)} y2={yAt(val)}
                stroke={`var(${c.cssVar})`}
                strokeOpacity="0.18"
                strokeWidth="1"
                strokeDasharray="1 4"
              />
            );
          })}

          {/* Data dots — Day 1 */}
          {CATEGORIES.map(c => {
            const val = avgs[c.key];
            if (val == null) return null;
            return (
              <g key={`dot-${c.key}`}>
                <circle
                  cx={todayX} cy={yAt(val)} r="5"
                  fill={`var(${c.cssVar})`}
                  stroke="var(--newsprint)" strokeWidth="1.5"
                />
                {/* Leader line to label */}
                <line
                  x1={todayX + 6} x2={W - 4}
                  y1={yAt(val)} y2={yAt(val)}
                  stroke={`var(${c.cssVar})`}
                  strokeOpacity="0.5" strokeWidth="1"
                />
                <text
                  x={W - 2} y={yAt(val) + 3}
                  textAnchor="end"
                  className="p2-dot-label"
                  fill={`var(${c.cssVar})`}
                >
                  {c.label.toUpperCase()} · {fmt(val)}
                </text>
              </g>
            );
          })}

          {/* Future hint */}
          <text
            x={(todayX + PAD.l + innerW) / 2}
            y={PAD.t + innerH / 2}
            textAnchor="middle"
            className="p2-future-hint"
          >
            ⤳ LINES BUILD HERE
          </text>
        </svg>
      </div>

      <div className="p2-history-foot">
        <span>Day 1 of tracking · Lines build daily</span>
        <span className="p2-meta">
          NEXT EDITION: {nextLabel}, 06:00 PST · DOTS BECOME LINES
        </span>
      </div>
    </section>
  );
}

// ── Assembled Page 2 ───────────────────────────────────────────────────────────
export default function Page2({ data }: { data: PageData }) {
  const { lucky7 } = data;

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

  const editionNum = (
    Math.max(0, Math.floor((Date.now() - new Date("2026-04-01T00:00:00Z").getTime()) / 86400000)) + 1
  ).toString().padStart(3, "0");

  return (
    <div className="page2">
      {/* Folio strip */}
      <div className="p2-folio">
        <span className="p2-folio-l">
          <span className="p2-pill">PG. 2</span>
          <span className="p2-sep">│</span>
          <span>The Sheet</span>
        </span>
        <span className="p2-folio-c">
          Where Numbers Become Stories &amp; Stories Become Numbers
        </span>
        <span className="p2-folio-r">
          <span>{dateStr}</span>
          <span className="p2-sep">│</span>
          <span>Edition № {editionNum}</span>
        </span>
      </div>

      <Lucky7 avgs={lucky7} />
      <div className="p2-rule-double" />
      <LocalTea />
      <div className="p2-rule-double" />
      <PriceHistory avgs={lucky7} />

      <div className="p2-tail">— END PG. 2 —</div>
    </div>
  );
}
