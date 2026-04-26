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

// Subtle crosshatch gives the card-back a felt/paper texture feel
const CARD_BACK_PATTERN =
  "repeating-linear-gradient(45deg, rgba(244,240,228,0.055) 0px, rgba(244,240,228,0.055) 1px, transparent 1px, transparent 10px), " +
  "repeating-linear-gradient(-45deg, rgba(244,240,228,0.055) 0px, rgba(244,240,228,0.055) 1px, transparent 1px, transparent 10px)";

interface Props {
  winners: DailyWinner[];
  quips: string[];
  gate: GateProps;
}

export default function VerdictCards({ winners, quips, gate }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [compareProduct, setCompareProduct] = useState<string | null>(null);

  // Dot-counter observer — watch the perspective wrappers via data-card-idx
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

  // Pro auto-flip: sequential stagger after mount
  useEffect(() => {
    if (!gate.isPro) return;
    winners.forEach((_, i) => {
      const t = setTimeout(() => {
        setFlipped((prev) => new Set([...prev, i]));
      }, i * 150);
      return () => clearTimeout(t);
    });
  }, [gate.isPro]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToProPage = useCallback(() => {
    window.dispatchEvent(new CustomEvent("dwn:goto", { detail: 3 }));
  }, []);

  const flip = useCallback((i: number) => {
    setFlipped((prev) => new Set([...prev, i]));
  }, []);

  const flipsUsed = flipped.size;
  const flipsRemaining = Math.max(0, MAX_FREE_FLIPS - flipsUsed);
  const total = winners.length;

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

          // A card can be flipped if: not yet flipped AND (pro user OR flips still available)
          const canFlip = !isFlipped && (gate.isPro || flipsUsed < MAX_FREE_FLIPS);
          // Locked = not flipped AND free user has used all flips
          const isLocked = !isFlipped && !gate.isPro && flipsUsed >= MAX_FREE_FLIPS;
          // Compare is available on a flipped card that has a product
          const canCompare = isFlipped && !!p?.name;

          return (
            <div
              key={w.category_key}
              data-card-idx={i}
              aria-label={`Card ${i + 1} of ${total}: ${CAT_LABELS[w.category_key] ?? w.category_key}${isFlipped ? " — revealed" : canFlip ? " — tap to flip" : " — Pro only"}`}
              style={{
                // Replicate .b-lb-card flex/snap sizing on the perspective wrapper
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
                  transition: "transform 400ms ease",
                  position: "relative",
                  minHeight: "190px",
                  height: "100%",
                }}
              >
                {/* ── BACK FACE — face-down card ──────────────────── */}
                <div
                  className={`b-lb-card${isLead ? " lead" : ""}`}
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    position: "absolute",
                    inset: 0,
                    // Override card background with deep forest green
                    background: "#13240f",
                    backgroundImage: CARD_BACK_PATTERN,
                    cursor: canFlip ? "pointer" : isLocked ? "pointer" : "default",
                    userSelect: "none",
                  }}
                  onClick={canFlip ? () => flip(i) : isLocked ? goToProPage : undefined}
                >
                  <div className="b-lb-rank" style={{ color: "rgba(244,240,228,0.38)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="b-lb-cat" style={{ color: "rgba(244,240,228,0.72)" }}>
                    {CAT_LABELS[w.category_key] ?? w.category_key}
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

      {/* Picks counter — free users only, shown while picks remain */}
      {!gate.isPro && flipsRemaining > 0 && (
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
