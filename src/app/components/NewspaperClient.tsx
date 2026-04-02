"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageData } from "@/lib/data";
import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";

const PAGE_LABELS = ["Front Page", "Inside Scoop", "The Closer"];

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

export default function NewspaperClient({ data }: { data: PageData }) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (newPage: number) => {
      if (newPage < 0 || newPage > 2) return;
      setDirection(newPage > page ? 1 : -1);
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [page]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(page + 1);
      if (e.key === "ArrowLeft") goTo(page - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [page, goTo]);

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
            {page === 0 && <Page1 data={data} />}
            {page === 1 && <Page2 data={data} />}
            {page === 2 && <Page3 data={data} />}
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
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              className={`page-dot${page === i ? " active" : ""}`}
              onClick={() => goTo(i)}
              title={PAGE_LABELS[i]}
            />
          ))}
        </div>

        <span className="page-nav-count font-mono">
          {page + 1} of 3 — {PAGE_LABELS[page]}
        </span>

        <button
          className="page-nav-btn"
          onClick={() => goTo(page + 1)}
          disabled={page === 2}
        >
          Next →
        </button>
      </div>

      {/* Corner curl — next page trigger */}
      {page < 2 && (
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
