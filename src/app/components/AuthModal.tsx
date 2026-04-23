"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Step = "email" | "code" | "done";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
  /** If true, activates a 7-day trial after successful sign-in */
  startTrial?: boolean;
}

export default function AuthModal({ onClose, onSuccess, startTrial = false }: AuthModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Focus code input when step changes
  useEffect(() => {
    if (step === "code") codeInputRef.current?.focus();
  }, [step]);

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function requestCode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send code");
      setStep("code");
      setCountdown(60);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");

      // Establish Supabase session from hashed_token
      const { error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: data.hashed_token,
        type: "magiclink",
      });

      if (sessionError) throw new Error("Failed to create session. Try again.");

      // If starting a trial, activate it
      if (startTrial) {
        await fetch("/api/auth/setup-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
      }

      setStep("done");
      onSuccess(email.trim().toLowerCase());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    border: "2px solid var(--ink)",
    background: "var(--newsprint)",
    fontFamily: "Space Mono, monospace",
    fontSize: "13px",
    color: "var(--ink)",
    outline: "none",
    boxSizing: "border-box",
  };

  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 20px",
    background: loading ? "var(--muted)" : "var(--ink)",
    color: "var(--newsprint)",
    border: "none",
    fontFamily: "Space Mono, monospace",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: loading ? "not-allowed" : "pointer",
    marginTop: "12px",
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,16,8,0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--newsprint)",
          border: "2px solid var(--ink)",
          padding: "32px",
          maxWidth: "420px",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "16px",
            background: "none",
            border: "none",
            fontFamily: "Space Mono, monospace",
            fontSize: "18px",
            cursor: "pointer",
            color: "var(--muted)",
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <div
          style={{
            fontFamily: "Space Mono, monospace",
            fontSize: "9px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "8px",
          }}
        >
          Daily Weed Newspaper
        </div>

        {step === "email" && (
          <>
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
              {startTrial ? "Start Your Free 7-Day Trial" : "Sign In"}
            </div>
            <p
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
                color: "var(--muted)",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              {startTrial
                ? "No credit card. 7 days of full Pro access. We'll send a code to your email."
                : "We'll send a 6-digit code to your email. No password required."}
            </p>

            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && email && requestCode()}
              style={inputStyle}
              autoFocus
              autoComplete="email"
            />

            {error && (
              <div style={{ color: "#c0392b", fontFamily: "Space Mono, monospace", fontSize: "11px", marginTop: "8px" }}>
                {error}
              </div>
            )}

            <button
              onClick={requestCode}
              disabled={loading || !email.trim()}
              style={btnStyle}
            >
              {loading ? "Sending…" : "Send Code →"}
            </button>

            {startTrial && (
              <div
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "9px",
                  color: "var(--muted)",
                  textAlign: "center",
                  marginTop: "12px",
                  lineHeight: 1.6,
                }}
              >
                No card required · Trial ends after 7 days · $9/mo after
              </div>
            )}
          </>
        )}

        {step === "code" && (
          <>
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
              Check Your Email
            </div>
            <p
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
                color: "var(--muted)",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              Ziggy sent a 6-digit code to{" "}
              <strong style={{ color: "var(--ink)" }}>{email}</strong>.
              Enter it below.
            </p>

            <input
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && !loading && code.length === 6 && verifyCode()}
              style={{ ...inputStyle, fontSize: "24px", letterSpacing: "0.3em", textAlign: "center" }}
            />

            {error && (
              <div style={{ color: "#c0392b", fontFamily: "Space Mono, monospace", fontSize: "11px", marginTop: "8px" }}>
                {error}
              </div>
            )}

            <button
              onClick={verifyCode}
              disabled={loading || code.length !== 6}
              style={btnStyle}
            >
              {loading ? "Verifying…" : "Verify Code →"}
            </button>

            <div style={{ marginTop: "14px", textAlign: "center" }}>
              {countdown > 0 ? (
                <span style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", color: "var(--muted)" }}>
                  Resend in {countdown}s
                </span>
              ) : (
                <button
                  onClick={() => { setCode(""); setError(null); requestCode(); }}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "Space Mono, monospace",
                    fontSize: "10px",
                    color: "var(--accent)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Resend code
                </button>
              )}
              {" · "}
              <button
                onClick={() => { setStep("email"); setCode(""); setError(null); }}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "Space Mono, monospace",
                  fontSize: "10px",
                  color: "var(--muted)",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Change email
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <>
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
              {startTrial ? "Trial Active." : "You're In."}
            </div>
            <p
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
                color: "var(--muted)",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              {startTrial
                ? "7 days of full Pro access. Check your email — Ziggy sent the details."
                : "Welcome back. Ziggy has been holding it down while you were gone."}
            </p>
            <button onClick={onClose} style={btnStyle}>
              Let&apos;s Go →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
