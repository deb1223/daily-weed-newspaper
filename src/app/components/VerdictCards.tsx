"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { DailyWinner } from "@/lib/data";
import { GateProps } from "./NewspaperClient";
import CompareModal from "./CompareModal";

const CAT_LABELS: Record<string, string> = {
  cheapest_eighth:  "Cheapest Eighth",
  vape_cart:        "1g Cart",
  edibles:          "100mg Edible",
  concentrates:     "1g Live Resin",
  prerolls:         "Single Pre-Roll",
  infused_preroll:  "Infused Pre-Roll",
  vape_disposable:  "1g Disposable",
};

const MAX_FREE_FLIPS = 3;
// Incognito fallback: Eighth (0), Edible (2), Pre-Roll (4) — representative spread
const INCOGNITO_INDICES = [0, 2, 4];

const CARD_BACK_PATTERN =
  "repeating-linear-gradient(45deg, rgba(244,240,228,0.055) 0px, rgba(244,240,228,0.055) 1px, transparent 1px, transparent 10px), " +
  "repeating-linear-gradient(-45deg, rgba(244,240,228,0.055) 0px, rgba(244,240,228,0.055) 1px, transparent 1px, transparent 10px)";

// ── Cookie helpers ────────────────────────────────────────────────────────────

/** Vegas local date string — resets the game at midnight PDT/PST. */
function vegasDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

function areCookiesAvailable(): boolean {
  try {
    document.cookie = "dwn_ck_test=1;max-age=2;path=/;samesite=lax";
    const ok = document.cookie.includes("dwn_ck_test=1");
    document.cookie = "dwn_ck_test=;max-age=0;path=/";
    return ok;
  } catch {
    return false;
  }
}

function readPicksCookie(): number[] {
  try {
    const match = document.cookie.match(/(?:^|;\s*)dwn_picks=([^;]+)/);
    if (!match) return [];
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    // Stale day → fresh game
    if (parsed?.date !== vegasDate()) return [];
    return Array.isArray(parsed?.indices) ? (parsed.indices as number[]) : [];
  } catch {
    return [];
  }
}

function writePicksCookie(indices: number[]): void {
  try {
    const value = encodeURIComponent(
      JSON.stringify({ date: vegasDate(), indices })
    );
    document.cookie = `dwn_picks=${value};max-age=86400;path=/;samesite=lax`;
  } catch {
    // ignore — incognito or cookie denied
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  winners: DailyWinner[];
  quips: string[];
  gate: GateProps;
}

export default function VerdictCards({ winners, quips, gate }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  // flipped: which card indices are face-up
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  // skipAnim: indices that should appear face-up instantly (no transition) —
  // used for cookie-restored picks and incognito pre-reveals
  const [skipAnim, setSkipAnim] = useState<Set<number>>(new Set());
  // cookieMode: unknown until mount effect runs
  const [cookieMode, setCookieMode] = useState<"unknown" | "normal" | "incognito">("unknown");

  const [compareProduct, setCompareProduct] = useState<string | null>(null);

  // Dot-counter observer
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const cards = Array.from(strip.querySelectorAll<HTMLElement>("[data-card-idx]"));
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.cardIdx ?? 0);
            setActiveCard(idx);
          }
        }
      },
      { root: strip, threshold: 0.55 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  // Cookie init — runs once on mount for free users
  useEffect(() => {
    if (gate.isPro) return;

    if (!areCookiesAvailable()) {
      // Incognito: silently serve fallback spread, no counter
      const fallback = new Set(INCOGNITO_INDICES);
      setSkipAnim(fallback);
      setFlipped(fallback);
      setCookieMode("incognito");
      return;
    }

    setCookieMode("normal");

    const saved = readPicksCookie();
    if (saved.length > 0) {
      const restored = new Set(saved);
      setSkipAnim(restored); // appear face-up instantly — no flip animation
      setFlipped(restored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pro auto-flip: sequential stagger after mount
  useEffect(() => {
    if (!gate.isPro) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    winners.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setFlipped((prev) => new Set([...prev, i]));
        }, i * 150)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [gate.isPro]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToProPage = useCallback(() => {
    window.dispatchEvent(new CustomEvent("dwn:goto", { detail: 3 }));
  }, []);

  const flip = useCallback((i: number) => {
    setFlipped((prev) => {
      const next = new Set([...prev, i]);
      writePicksCookie([...next]);
      return next;
    });
  }, []);

  const flipsUsed = flipped.size;
  const flipsRemaining = Math.max(0, MAX_FREE_FLIPS - flipsUsed);
  const total = winners.length;
  // Show the picks counter only for confirmed-normal cookie users with picks left
  const showCounter = !gate.isPro && cookieMode === "normal" && flipsRemaining > 0;

  return (
    <>
      <div
        className="b-lb-strip"
        ref={stripRef}
        role="region"
        aria-label="Lucky 7 verdict cards — tap a card to flip it"
      >
        {winners.map((w, i) => {
          const isFlipped = flipped.has(i);
          const p = w.product;
          const isLead = i % 2 === 0;

          const canFlip = !isFlipped && (gate.isPro || flipsUsed < MAX_FREE_FLIPS);
          const isLocked = !isFlipped && !gate.isPro && flipsUsed >= MAX_FREE_FLIPS;
          const canCompare = isFlipped && !!p?.name;

          return (
            <div
              key={w.category_key}
              data-card-idx={i}
              aria-label={`Card ${i + 1} of ${total}: ${CAT_LABELS[w.category_key] ?? w.category_key}${isFlipped ? " — revealed" : canFlip ? " — tap to flip" : " — Pro only"}`}
              style={{
                flex: "0 0 min(260px, 78vw)",
                scrollSnapAlign: "start",
                minHeight: "190px",
                position: "relative",
                perspective: "900px",
              }}
            >
              {/* ── Flip inner ─────────────────────────────────────── */}
              <div
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  // Skip animation for cookie-restored / incognito pre-revealed cards
                  transition: skipAnim.has(i) ? "none" : "transform 400ms ease",
                  position: "relative",
                  minHeight: "190px",
                  height: "100%",
                }}
              >
                {/* ── BACK FACE — face-down card (blind) ──────────── */}
                <div
                  className={`b-lb-card${isLead ? " lead" : ""}`}
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    position: "absolute",
                    inset: 0,
                    background: "#13240f",
                    backgroundImage: CARD_BACK_PATTERN,
                    cursor: canFlip ? "pointer" : isLocked ? "pointer" : "default",
                    userSelect: "none",
                  }}
                  onClick={canFlip ? () => flip(i) : isLocked ? goToProPage : undefined}
                >
                  {/* Rank only — category name intentionally omitted (blind pick) */}
                  <div className="b-lb-rank" style={{ color: "rgba(244,240,228,0.38)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {isLocked ? (
                    <div
                      className="b-lb-locked-line"
                      style={{
                        color: "rgba(244,240,228,0.38)",
                        borderTopColor: "rgba(244,240,228,0.1)",
                      }}
                    >
                      Pro · Unlock all 7
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: "auto",
                        fontFamily: "Space Mono, monospace",
                        fontSize: "9px",
                        color: "rgba(244,240,228,0.32)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Tap to flip
                    </div>
                  )}
                </div>

                {/* ── FRONT FACE — winner data ─────────────────────── */}
                <div
                  className={`b-lb-card${isLead ? " lead" : ""}`}
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    position: "absolute",
                    inset: 0,
                    transform: "rotateY(180deg)",
                    cursor: canCompare ? "pointer" : "default",
                  }}
                  onClick={canCompare ? () => setCompareProduct(p!.name) : undefined}
                >
                  <div className="b-lb-rank">{String(i + 1).padStart(2, "0")}</div>
                  <div className="b-lb-cat">
                    {CAT_LABELS[w.category_key] ?? w.category_key}
                  </div>

                  {p ? (
                    <>
                      <div className="b-lb-name">{p.name}</div>
                      <div className="b-lb-meta">
                        <span className="b-lb-price">${p.price.toFixed(2)}</span>
                        {w.metric_display && (
                          <span className="b-lb-metric">{w.metric_display}</span>
                        )}
                        {p.dispensary_name && (
                          <span
                            className="b-lb-disp"
                            style={{
                              textDecoration: "underline",
                              textDecorationStyle: "dotted",
                              textUnderlineOffset: "2px",
                            }}
                          >
                            {p.dispensary_name}
                          </span>
                        )}
                      </div>
                      <div className="b-lb-quip">
                        &ldquo;{quips[i] ?? "i don't make the deals. i just find them. you're welcome."}&rdquo;
                      </div>
                    </>
                  ) : (
                    <div className="b-lb-empty">
                      No winner yet — check back at 6 a.m.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Picks counter — normal cookie mode only, while picks remain */}
      {showCounter && (
        <div
          style={{
            fontFamily: "Space Mono, monospace",
            fontSize: "10px",
            color: "var(--muted)",
            textAlign: "center",
            padding: "6px 0 0",
            letterSpacing: "0.05em",
          }}
        >
          {flipsRemaining} pick{flipsRemaining !== 1 ? "s" : ""} remaining
        </div>
      )}

      {compareProduct && (
        <CompareModal
          productName={compareProduct}
          isProUser={gate.isPro}
          onClose={() => setCompareProduct(null)}
        />
      )}

      <div className="b-lb-counter" aria-live="polite" aria-atomic="true">
        <span className="b-lb-counter-label">
          Card {String(activeCard + 1).padStart(2, "0")} of {String(total).padStart(2, "0")}
        </span>
        <div className="b-lb-dots" aria-hidden="true">
          {winners.map((_, i) => (
            <span
              key={i}
              className={`b-lb-dot${i === activeCard ? " active" : ""}${!flipped.has(i) ? " locked" : ""}`}
            />
          ))}
        </div>
        <span className="b-lb-swipe-hint" aria-hidden="true">← Swipe →</span>
      </div>
    </>
  );
}
