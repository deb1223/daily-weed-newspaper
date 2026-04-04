import Link from "next/link";

export default function SuccessPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--newsprint)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          width: "100%",
          border: "3px double var(--ink)",
          padding: "40px 32px",
          textAlign: "center",
          position: "relative",
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
            marginBottom: "12px",
          }}
        >
          Ziggy&apos;s Drip · Confirmation
        </div>

        {/* Headline */}
        <h1
          className="font-headline"
          style={{
            fontSize: "clamp(28px, 6vw, 42px)",
            fontWeight: 900,
            lineHeight: 1.1,
            color: "var(--accent)",
            marginBottom: "20px",
          }}
        >
          You&apos;re in.
        </h1>

        <div
          style={{
            borderTop: "1px solid var(--ink)",
            borderBottom: "1px solid var(--ink)",
            padding: "20px 0",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontFamily: "Source Serif 4, serif",
              fontSize: "17px",
              lineHeight: 1.6,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Welcome to the Drip. I personally sifted through{" "}
            <em>thousands</em> of deals so you don&apos;t have to. Check your
            inbox — the next edition drops at 8am Las Vegas time.
          </p>
        </div>

        <p
          style={{
            fontFamily: "Space Mono, monospace",
            fontSize: "11px",
            color: "var(--muted)",
            marginBottom: "28px",
          }}
        >
          — Ziggy, Professional Hater & Head of Deals
        </p>

        <Link
          href="/"
          className="cta-button"
          style={{ display: "inline-block" }}
        >
          Read Today&apos;s Edition →
        </Link>

        {/* Ornamental rule */}
        <div
          style={{
            marginTop: "32px",
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
