"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageData } from "@/lib/data";
import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";

export interface GateProps {
  isPro: boolean;
}

const PAGE_LABELS = ["Front Page", "The Sheet", "The Closer", "The Back Page"];
const PAGE_COUNT = 4;

const variants = {
  initial: (dir: number) => ({
    x: dir > 0 ? "6%" : "-6%",
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-6%" : "6%",
    opacity: 0,
  }),
};

export default function NewspaperClient({
  data,
  gate,
}: {
  data: PageData;
  gate: GateProps;
}) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (newPage: number) => {
      if (newPage < 0 || newPage >= PAGE_COUNT) return;
      setDirection(newPage > page ? 1 : -1);
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [page]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(page + 1);
      if (e.key === "ArrowLeft") goTo(page - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [page, goTo]);

  // Custom event — locked cards dispatch dwn:goto to navigate to a page
  useEffect(() => {
    const handler = (e: Event) => goTo((e as CustomEvent<number>).detail);
    window.addEventListener("dwn:goto", handler);
    return () => window.removeEventListener("dwn:goto", handler);
  }, [goTo]);

  return (
    <>
      {/* Overflow clip wrapper */}
      <div style={{ overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.75, ease: "easeInOut" }}
          >
            {page === 0 && <Page1 data={data} gate={gate} />}
            {page === 1 && <Page2 data={data} />}
            {page === 2 && <Page3 data={data} />}
            {page === 3 && (
              <div style={{ padding: "48px 24px", textAlign: "center", fontFamily: "Space Mono, monospace", fontSize: "12px", color: "var(--muted)" }}>
                The Back Page — coming soon
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page navigation bar */}
      <div className="page-nav-bar">
        <button
          className="page-nav-btn"
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
        >
          ← Prev
        </button>

        <div className="page-nav-dots">
          {Array.from({ length: PAGE_COUNT }, (_, i) => (
            <button
              key={i}
              className={`page-dot${page === i ? " active" : ""}`}
              onClick={() => goTo(i)}
              title={PAGE_LABELS[i]}
            />
          ))}
        </div>

        <span className="page-nav-count font-mono">
          {page + 1} of {PAGE_COUNT} — {PAGE_LABELS[page]}
        </span>

        <button
          className="page-nav-btn"
          onClick={() => goTo(page + 1)}
          disabled={page === PAGE_COUNT - 1}
        >
          Next →
        </button>
      </div>

      {/* Corner curl — next page trigger */}
      {page < PAGE_COUNT - 1 && (
        <div
          className="corner-curl"
          onClick={() => goTo(page + 1)}
          title={`Go to ${PAGE_LABELS[page + 1]}`}
        >
          <span className="corner-curl-label">pg {page + 2} →</span>
        </div>
      )}
    </>
  );
}
