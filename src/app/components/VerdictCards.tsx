"use client";

import { useRef, useState, useEffect } from "react";
import { DailyWinner } from "@/lib/data";

const CAT_LABELS: Record<string, string> = {
  best_value_flower: "Best Value Flower",
  cheapest_eighth: "Cheapest 1/8",
  shake: "Shake",
  prerolls: "Pre-Rolls",
  vape_cart: "Vape Cart",
  vape_disposable: "Disposable Vape",
  concentrates: "Concentrates",
  rso: "RSO",
  edibles: "Edibles",
  tinctures: "Tinctures",
};

interface Props {
  winners: DailyWinner[];
  /** One quip per card, in winner order — already resolved from brief or fallback */
  quips: string[];
}

export default function VerdictCards({ winners, quips }: Props) {
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

  const total = winners.length;

  return (
    <>
      <div
        className="b-lb-strip"
        ref={stripRef}
        role="region"
        aria-label="Today's verdict cards — swipe to explore"
      >
        {winners.map((w, i) => {
          const p = w.product;
          const isLead = i === 0;
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
              className={`b-lb-dot${i === activeCard ? " active" : ""}`}
            />
          ))}
        </div>
        <span className="b-lb-swipe-hint" aria-hidden="true">← Swipe →</span>
      </div>
    </>
  );
}
