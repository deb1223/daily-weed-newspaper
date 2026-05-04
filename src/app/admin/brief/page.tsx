import { supabase } from "@/lib/supabase";
import PublishButton from "./PublishButton";

interface BriefJson {
  intro: string;
  dealCommentary: { productId: string; quip: string }[];
  savageCorner: string;
  bigMikeBundlesAndBogos?: string[];
  touristTerry: string;
  marketRating: number;
  ratingQuote: string;
}

interface Brief {
  date: string;
  brief_json: BriefJson;
  status: string;
}

export default async function AdminBriefPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>;
}) {
  const params = await searchParams;
  const secret = params.secret ?? "";

  if (secret !== process.env.CRON_SECRET || !process.env.CRON_SECRET) {
    return (
      <div style={{ fontFamily: "Space Mono, monospace", padding: "48px", textAlign: "center", color: "#1a1008" }}>
        403 — wrong secret.
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: brief } = await supabase
    .from("daily_briefs")
    .select("*")
    .eq("date", today)
    .single() as { data: Brief | null };

  return (
    <div style={{ background: "#f4f0e4", minHeight: "100vh", fontFamily: "Georgia, serif", padding: "48px", maxWidth: "800px", margin: "0 auto" }}>

      {/* Admin masthead */}
      <div style={{ borderBottom: "3px double #1a1008", paddingBottom: "16px", marginBottom: "32px" }}>
        <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b5e45", marginBottom: "4px" }}>
          Admin · Daily Weed Newspaper
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 900, margin: 0, color: "#1a1008" }}>
          Ziggy&apos;s Daily Brief
        </h1>
        <div style={{ fontFamily: "Space Mono, monospace", fontSize: "11px", color: "#6b5e45", marginTop: "4px" }}>
          {today} · Review before publishing
        </div>
      </div>

      {!brief ? (
        <div style={{ fontFamily: "Space Mono, monospace", fontSize: "13px", color: "#6b5e45", padding: "32px", border: "1px solid #c8b99a", textAlign: "center" }}>
          No brief generated yet for {today}.<br />
          Trigger /api/generate-brief to create one.
        </div>
      ) : (
        <>
          {/* Status + publish */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px", padding: "16px", background: brief.status === "published" ? "#eef5eb" : "#f0e9d9", border: "1px solid #1a1008" }}>
            <div>
              <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b5e45" }}>Status</div>
              <div style={{ fontFamily: "Space Mono, monospace", fontSize: "14px", fontWeight: 700, color: brief.status === "published" ? "#34a529" : "#1a1008" }}>
                {brief.status.toUpperCase()}
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              {brief.status === "published" ? (
                <div style={{ fontFamily: "Space Mono, monospace", fontSize: "13px", color: "#34a529" }}>✓ Already published — live on site</div>
              ) : (
                <PublishButton date={today} secret={secret} />
              )}
            </div>
          </div>

          {/* Brief content */}
          <Section label="Intro">
            <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", lineHeight: 1.75, margin: 0 }}>{brief.brief_json.intro}</p>
          </Section>

          <Section label="Deal Commentary">
            {brief.brief_json.dealCommentary.map((d, i) => (
              <div key={i} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: i < brief.brief_json.dealCommentary.length - 1 ? "1px solid #c8b99a" : "none" }}>
                <div style={{ fontFamily: "Space Mono, monospace", fontSize: "10px", textTransform: "uppercase", color: "#6b5e45", marginBottom: "4px" }}>{d.productId}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "italic" }}>&ldquo;{d.quip}&rdquo;</div>
              </div>
            ))}
          </Section>

          <Section label="Savage Corner">
            <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>&ldquo;{brief.brief_json.savageCorner}&rdquo;</p>
          </Section>

          {brief.brief_json.bigMikeBundlesAndBogos && brief.brief_json.bigMikeBundlesAndBogos.length > 0 && (
            <Section label="Big Mike's Bundles & BOGOs">
              <p style={{ fontFamily: "Georgia, serif", fontSize: "12px", color: "#888", marginTop: 0, marginBottom: "8px", fontStyle: "italic" }}>if it doesn't beat buying one, Big Mike didn't post it</p>
              <ol style={{ margin: 0, paddingLeft: "20px" }}>
                {brief.brief_json.bigMikeBundlesAndBogos.map((t, i) => (
                  <li key={i} style={{ fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: 1.7, marginBottom: "8px" }}>{t}</li>
                ))}
              </ol>
            </Section>
          )}

          <Section label="Tourist Terry's Tip">
            <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>{brief.brief_json.touristTerry}</p>
          </Section>

          <Section label={`Market Rating: ${brief.brief_json.marketRating}/10`}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "italic", margin: 0 }}>
              &ldquo;{brief.brief_json.ratingQuote}&rdquo;
            </p>
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ fontFamily: "Space Mono, monospace", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b5e45", borderBottom: "1px solid #c8b99a", paddingBottom: "4px", marginBottom: "12px" }}>
        {label}
      </div>
      {children}
    </div>
  );
}
