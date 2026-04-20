"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ─── Inner component (needs useSearchParams → must be inside Suspense) ─────

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (err) {
      setError(ziggyError(err.message));
    } else {
      setStep("otp");
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) return;
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: "email",
    });
    setLoading(false);
    if (err) {
      setError(ziggyError(err.message));
    } else {
      router.push(next);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--newsprint)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        border: "3px double var(--ink)",
        padding: "40px 32px",
      }}>

        {/* Kicker */}
        <div style={{
          fontFamily: "Space Mono, monospace",
          fontSize: "10px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "12px",
        }}>
          Ziggy&apos;s Drip &middot; {step === "email" ? "Members" : "Check Your Inbox"}
        </div>

        {/* Headline */}
        <h1 className="font-headline" style={{
          fontSize: "clamp(26px, 5vw, 38px)",
          fontWeight: 900,
          lineHeight: 1.1,
          color: "var(--ink)",
          marginBottom: "12px",
        }}>
          {step === "email" ? "Who's asking?" : "Check your inbox."}
        </h1>

        {/* Divider */}
        <div style={{
          borderTop: "1px solid var(--ink)",
          marginBottom: "20px",
        }} />

        {/* Sub-copy */}
        <p style={{
          fontFamily: "Source Serif 4, serif",
          fontSize: "15px",
          lineHeight: 1.6,
          color: "var(--muted)",
          marginBottom: "28px",
        }}>
          {step === "email"
            ? "Drop your email. I'll send you a magic link. No passwords, no drama."
            : <>Magic link sent to <strong style={{ color: "var(--ink)" }}>{email}</strong>. Click the link to sign in — it expires in 10 minutes.</>
          }
        </p>

        {/* Form */}
        {step === "email" ? (
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              style={inputStyle}
            />
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <button
              type="submit"
              disabled={loading}
              style={btnStyle(loading)}
            >
              {loading ? "Sending…" : "Send the link →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--muted)",
              marginBottom: "8px",
            }}>
              Or enter the code from the email
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              autoFocus
              style={{ ...inputStyle, fontSize: "24px", letterSpacing: "0.3em", textAlign: "center" }}
            />
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <button
              type="submit"
              disabled={loading}
              style={btnStyle(loading)}
            >
              {loading ? "Checking…" : "Let me in →"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setError(null); setOtp(""); }}
              style={{
                marginTop: "12px",
                background: "none",
                border: "none",
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
                color: "var(--muted)",
                cursor: "pointer",
                textDecoration: "underline",
                display: "block",
                width: "100%",
                textAlign: "center",
              }}
            >
              wrong email? start over
            </button>
          </form>
        )}

        {/* Footer rule */}
        <div style={{
          marginTop: "36px",
          fontFamily: "Space Mono, monospace",
          fontSize: "10px",
          color: "var(--muted)",
          letterSpacing: "0.1em",
          textAlign: "center",
        }}>
          ✦ &nbsp; dailyweednewspaper.com &nbsp; ✦
        </div>
      </div>
    </div>
  );
}

// ─── Shared styles ──────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px 14px",
  fontFamily: "Space Mono, monospace",
  fontSize: "14px",
  background: "var(--newsprint)",
  border: "2px solid var(--ink)",
  color: "var(--ink)",
  marginBottom: "12px",
  outline: "none",
};

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    padding: "13px 20px",
    fontFamily: "Space Mono, monospace",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background: disabled ? "var(--muted)" : "var(--ink)",
    color: "var(--newsprint)",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "opacity 0.15s",
  };
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "Space Mono, monospace",
      fontSize: "11px",
      color: "var(--ticker-red, #d62828)",
      marginBottom: "12px",
      lineHeight: 1.5,
    }}>
      {children}
    </p>
  );
}

/** Translate Supabase error messages into Ziggy-voiced copy. */
function ziggyError(msg: string): string {
  if (/invalid.*otp|token.*expired|expired/i.test(msg))
    return "That link's expired. Links are good for 10 minutes — hit 'start over' and I'll send a fresh one.";
  if (/rate.?limit|too many/i.test(msg))
    return "Easy. Too many requests. Give it a minute and try again.";
  if (/invalid.*email|email.*invalid/i.test(msg))
    return "That email doesn't look right. Double-check it.";
  return `Something went wrong: ${msg}`;
}

// ─── Page export (Suspense boundary for useSearchParams) ───────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        background: "var(--newsprint)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Space Mono, monospace",
        fontSize: "12px",
        color: "var(--muted)",
      }}>
        Loading…
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
