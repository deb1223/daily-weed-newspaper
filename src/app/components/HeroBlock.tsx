"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";

interface HeroBlockProps {
  onTrialStart?: (email: string) => void;
}

export default function HeroBlock({ onTrialStart }: HeroBlockProps) {
  const [showModal, setShowModal] = useState(false);

  function handleSuccess(email: string) {
    setShowModal(false);
    if (onTrialStart) onTrialStart(email);
  }

  return (
    <>
      <div
        style={{
          borderTop: "3px double var(--ink)",
          borderBottom: "3px double var(--ink)",
          padding: "28px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "20px",
          justifyContent: "space-between",
          background: "var(--newsprint)",
        }}
      >
        {/* Left: copy */}
        <div style={{ flex: "1 1 300px" }}>
          <div
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "9px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "6px",
            }}
          >
            Ziggy Pro Intelligence — Free Trial
          </div>
          <div
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "22px",
              fontWeight: 900,
              color: "var(--ink)",
              lineHeight: 1.2,
              marginBottom: "8px",
            }}
          >
            7 Days Free. Every Deal in Las Vegas. No Card.
          </div>
          <p
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "11px",
              color: "var(--muted)",
              lineHeight: 1.7,
              margin: 0,
              maxWidth: "480px",
            }}
          >
            Bargain Rating. Deal rarity scores. Talk to Ziggy — the AI budtender
            that knows every mg/$ ratio in the valley. Full Pro access for 7 days,
            then $9/month if you want to keep it.
          </p>
        </div>

        {/* Right: CTA */}
        <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "14px 28px",
              background: "var(--ink)",
              color: "var(--newsprint)",
              border: "none",
              fontFamily: "Space Mono, monospace",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Start Free Trial →
          </button>
          <div
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "9px",
              color: "var(--muted)",
              textAlign: "right",
            }}
          >
            No credit card · Cancel anytime · Already have an account?{" "}
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "none",
                border: "none",
                fontFamily: "Space Mono, monospace",
                fontSize: "9px",
                color: "var(--accent)",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <AuthModal
          startTrial
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
