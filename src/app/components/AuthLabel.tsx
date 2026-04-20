"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";

const labelStyle: React.CSSProperties = {
  fontFamily: "Space Mono, monospace",
  fontSize: "10px",
  color: "var(--muted)",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const signOutStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "Space Mono, monospace",
  fontSize: "10px",
  color: "var(--muted)",
  padding: 0,
  textDecoration: "underline",
  letterSpacing: "0.05em",
};

export default function AuthLabel() {
  const { user, tier, loading } = useUser();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        style={{ ...labelStyle, color: "var(--muted)", textDecoration: "none" }}
      >
        Sign In →
      </Link>
    );
  }

  const label = tier === "pro" ? "Pro ✓" : "Account";

  return (
    <span style={labelStyle}>
      {label} &middot;{" "}
      <button
        style={signOutStyle}
        onClick={() => supabase.auth.signOut()}
      >
        sign out
      </button>
    </span>
  );
}
