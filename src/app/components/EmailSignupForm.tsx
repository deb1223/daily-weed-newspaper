"use client";

import { useState } from "react";

interface Props {
  tier?: "free" | "pro";
  buttonText?: string;
}

export default function EmailSignupForm({ tier = "free", buttonText = "Get Pro — $9/mo" }: Props) {
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
        body: JSON.stringify({ email: trimmed, tier }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div style={{
        fontFamily: "Space Mono, monospace",
        fontSize: "11px",
        color: "#2d6a4f",
        padding: "12px",
        border: "1px solid #2d6a4f",
        background: "var(--aged)",
        lineHeight: 1.5,
      }}>
        Ziggy&apos;s got your email. Report drops at 8am.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ fontFamily: "Space Mono, monospace", fontSize: "11px", color: "var(--muted)", padding: "12px", border: "1px solid var(--aged)" }}>
        Something broke. Ziggy is investigating.
        <button
          onClick={() => setStatus("idle")}
          style={{ marginLeft: "8px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "Space Mono, monospace", fontSize: "11px", color: "var(--muted)" }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        className="email-input"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={status === "loading"}
      />
      <button
        className="cta-button"
        onClick={handleSubmit}
        disabled={status === "loading"}
        style={{ marginTop: "4px" }}
      >
        {status === "loading" ? "Sending..." : buttonText}
      </button>
    </>
  );
}
