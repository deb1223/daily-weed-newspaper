"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { DailyWinner } from "@/lib/data";
import { GateProps } from "./NewspaperClient";

const CAT_LABELS: Record<string, string> = {
  cheapest_eighth:  "Cheapest Eighth",
  vape_cart:        "1g Cart",
  edibles:          "100mg Edible",
  concentrates:     "1g Live Resin",
  prerolls:         "Single Pre-Roll",
  infused_preroll:  "Infused Pre-Roll",
  vape_disposable:  "1g Disposable",
};

interface Props {
  winners: DailyWinner[];
  quips: string[];
  gate: GateProps;
}

export default function VerdictCards({ winners, quips, gate }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const cards = Array.from(strip.querySelectorAll<HTMLElement>(".b-lb-card"));
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx ?? 0);
            setActiveCard(idx);
          }
        }
      },
      { root: strip, threshold: 0.55 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  // Navigate to Page 4 (The Back Page, index 3) via custom event
  const goToProPage = useCallback(() => {
    window.dispatchEvent(new CustomEvent("dwn:goto", { detail: 3 }));
  }, []);

  const revealedSet = new Set(gate.revealedIndices);
  const total = winners.length;

  return (
    <>
      <div
        className="b-lb-strip"
        ref={stripRef}
        role="region"
        aria-label="Lucky 7 verdict cards — swipe to explore"
      >
        {winners.map((w, i) => {
          const isRevealed = revealedSet.has(i);
          const p = w.product;
          const isLead = i % 2 === 0;

          if (!isRevealed) {
            // ── Locked card ──────────────────────────────────────────────────
            return (
              <button
                key={w.category_key}
                className={`b-lb-card b-lb-card-locked${isLead ? " lead" : ""}`}
                data-idx={i}
                aria-label={`Card ${i + 1} of ${total}: ${CAT_LABELS[w.category_key] ?? w.category_key} — Pro only`}
                onClick={goToProPage}
              >
                <div className="b-lb-rank">{String(i + 1).padStart(2, "0")}</div>
                <div className="b-lb-cat">
                  {CAT_LABELS[w.category_key] ?? w.category_key}
                </div>
                <div className="b-lb-locked-line">
                  Pro · Unlock all 7
                </div>
              </button>
            );
          }

          // ── Revealed card ────────────────────────────────────────────────
          return (
            <div
              key={w.category_key}
              className={`b-lb-card${isLead ? " lead" : ""}`}
              data-idx={i}
              aria-label={`Card ${i + 1} of ${total}: ${CAT_LABELS[w.category_key] ?? w.category_key}`}
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
                      <span className="b-lb-disp">{p.dispensary_name}</span>
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
          );
        })}
      </div>

      <div className="b-lb-counter" aria-live="polite" aria-atomic="true">
        <span className="b-lb-counter-label">
          Card {String(activeCard + 1).padStart(2, "0")} of {String(total).padStart(2, "0")}
        </span>
        <div className="b-lb-dots" aria-hidden="true">
          {winners.map((_, i) => (
            <span
              key={i}
              className={`b-lb-dot${i === activeCard ? " active" : ""}${!revealedSet.has(i) ? " locked" : ""}`}
            />
          ))}
        </div>
        <span className="b-lb-swipe-hint" aria-hidden="true">← Swipe →</span>
      </div>
    </>
  );
}
