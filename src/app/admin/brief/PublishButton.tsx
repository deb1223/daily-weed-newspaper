"use client";

import { useState } from "react";

export default function PublishButton({ date, secret }: { date: string; secret: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const publish = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/publish-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, secret }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div style={{ fontFamily: "Space Mono, monospace", fontSize: "13px", color: "#34a529", padding: "12px 24px", border: "2px solid #34a529", display: "inline-block" }}>
        ✓ Published. Brief is live.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ fontFamily: "Space Mono, monospace", fontSize: "13px", color: "#d62828", padding: "12px 24px", border: "2px solid #d62828", display: "inline-block" }}>
        ✕ Publish failed. Check console.
      </div>
    );
  }

  return (
    <button
      onClick={publish}
      disabled={status === "loading"}
      style={{
        fontFamily: "Space Mono, monospace",
        fontSize: "13px",
        fontWeight: 700,
        background: "#1a1008",
        color: "#f4f0e4",
        border: "none",
        padding: "12px 32px",
        cursor: status === "loading" ? "wait" : "pointer",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      {status === "loading" ? "Publishing..." : "Publish Today's Brief"}
    </button>
  );
}
