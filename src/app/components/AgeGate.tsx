"use client";

import { useState } from "react";

export default function AgeGate() {
  const [showGate, setShowGate] = useState(true);

  if (!showGate) return null;

  function handleYes() {
    setShowGate(false);
  }

  function handleNo() {
    window.location.href = "https://www.google.com";
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "var(--newsprint)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          border: "3px double var(--ink)",
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        {/* Kicker */}
        <div
          style={{
            fontFamily: "Space Mono, monospace",
            fontSize: "10px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "16px",
          }}
        >
          Daily Weed Newspaper &middot; Age Verification
        </div>

        {/* Masthead title */}
        <div
          style={{
            fontFamily: "UnifrakturMaguntia, cursive",
            fontSize: "clamp(28px, 6vw, 42px)",
            color: "var(--ink)",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          Daily Weed Newspaper
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid var(--ink)",
            marginBottom: "20px",
          }}
        />

        {/* Headline */}
        <h1
          className="font-headline"
          style={{
            fontSize: "clamp(26px, 5vw, 36px)",
            fontWeight: 900,
            lineHeight: 1.1,
            color: "var(--ink)",
            marginBottom: "16px",
          }}
        >
          Are you 21 or older?
        </h1>

        {/* Body */}
        <p
          style={{
            fontFamily: "Source Serif 4, serif",
            fontSize: "14px",
            lineHeight: 1.6,
            color: "var(--muted)",
            marginBottom: "32px",
          }}
        >
          You must be 21 or older to view cannabis pricing and deals.
          Nevada state law requires age verification.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleYes}
            style={{
              padding: "13px 32px",
              fontFamily: "Space Mono, monospace",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "var(--ink)",
              color: "var(--newsprint)",
              border: "2px solid var(--ink)",
              cursor: "pointer",
            }}
          >
            Yes, I&apos;m 21+
          </button>
          <button
            onClick={handleNo}
            style={{
              padding: "13px 32px",
              fontFamily: "Space Mono, monospace",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "transparent",
              color: "var(--ink)",
              border: "2px solid var(--ink)",
              cursor: "pointer",
            }}
          >
            No
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "36px",
            fontFamily: "Space Mono, monospace",
            fontSize: "10px",
            color: "var(--muted)",
            letterSpacing: "0.1em",
          }}
        >
          ✦ &nbsp; dailyweednewspaper.com &nbsp; ✦
        </div>
      </div>
    </div>
  );
}
