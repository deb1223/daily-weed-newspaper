"use client";

import { useState } from "react";
import Link from "next/link";

export default function BottomCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tier: "free" }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const submitted = status === "done";

  return (
    <div className="cta-wrap">

      {/* Masthead */}
      <div className="cta-mast">
        <div className="cta-stamp">
          ¶ Free · <span className="cta-stamp-red">No paywall</span> · Daily 06:00 PST
        </div>
        <h2 className="cta-h2">
          The <span className="cta-frak">Top Ten</span>
          <br />in your inbox.
          <br />Before your coffee.
        </h2>
        <p className="cta-deck">
          One email. Ten verdicts. Zero &ldquo;strategic partnerships.&rdquo; Unsubscribe in one tap, no guilt trip.
        </p>
      </div>

      {/* Form */}
      <form className="cta-form" onSubmit={onSubmit}>
        <label htmlFor="cta-email">Subscribe · The Morning Edition</label>
        <div className="cta-row">
          <input
            id="cta-email"
            type="email"
            placeholder="you@plug-no-longer-needed.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
            required
            disabled={submitted || status === "loading"}
          />
          <button type="submit" disabled={status === "loading"}>
            {submitted
              ? "✓ In"
              : status === "loading"
              ? "..."
              : <>Send it <span className="cta-arr">→</span></>}
          </button>
        </div>
        {status === "error" && (
          <p className="cta-err">Something broke. <button type="button" className="cta-retry" onClick={() => setStatus("idle")}>Try again</button></p>
        )}
        <div className="cta-promise">
          <span><span className="cta-check">✓</span> No spam. Ever.</span>
          <span><span className="cta-check">✓</span> 1-tap unsub.</span>
          <span><span className="cta-check">✓</span> No selling lists.</span>
        </div>
      </form>

      {/* Receipt */}
      <div className="cta-receipt">
        <div className="cta-receipt-head">What lands in your inbox</div>
        <dl className="cta-dl">
          <dt>01.</dt>
          <dd>
            The full Top 10 — every category winner, ranked.
            <em>Same list you just scrolled. Now portable.</em>
          </dd>
          <dt>02.</dt>
          <dd>
            Today&apos;s biggest price drops, with the receipts.
            <em>If a Strip dispensary blinks, you&apos;ll know by 6 a.m.</em>
          </dd>
          <dt>03.</dt>
          <dd>
            One Ziggy line. Maybe two if the market is funny.
            <em>The math, but with attitude.</em>
          </dd>
        </dl>
      </div>

      {/* Proof */}
      <div className="cta-proof">
        Joined this morning by <b>1,247</b> Las Vegans who would rather read a paper than scroll a menu.
      </div>

      {/* Fine print */}
      <div className="cta-fineprint">
        Est. April 2026 · Las Vegas, Nev.
        <span className="cta-sep">·</span>
        <Link href="/privacy">Privacy</Link>
        <span className="cta-sep">·</span>
        <Link href="/archive">Archive</Link>
      </div>

    </div>
  );
}
