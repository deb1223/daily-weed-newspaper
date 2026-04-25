"use client";

import { useState } from "react";

export default function NewsletterCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, tier: "free" }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="nl-card" aria-label="Subscribe to the Daily Weed Newspaper">
      <div className="nl-inner">
        <div className="nl-copy">
          <p className="nl-headline">The best deals in Las Vegas. Every morning.</p>
          <p className="nl-sub">Free. No card. Just deals.</p>
        </div>

        <div className="nl-col-rule" aria-hidden="true" />

        <div className="nl-form">
          {status === "success" ? (
            <p className="nl-success">You&apos;re in. Check your inbox at 11am.</p>
          ) : status === "error" ? (
            <p className="nl-error">
              Something broke.{" "}
              <button className="nl-retry" onClick={() => setStatus("idle")}>
                Try again
              </button>
            </p>
          ) : (
            <div className="nl-fields">
              <input
                className="nl-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={status === "loading"}
                aria-label="Email address"
              />
              <button
                className="nl-btn"
                onClick={handleSubmit}
                disabled={status === "loading"}
              >
                {status === "loading" ? "..." : "→"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
