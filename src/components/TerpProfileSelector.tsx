"use client";

import { useState, useRef, useEffect } from "react";

// ─── Profile Definitions ───────────────────────────────────────────────────

export type ProfileKey =
  | "sleep"
  | "daytime-anxiety"
  | "pain-relief"
  | "focus"
  | "social-creativity"
  | "body-relief-daytime";

export interface TerpFilter {
  col: string;
  operator: "gt" | "lt";
  value: number;
  required: boolean; // false = suppress (lt check, nullable = ok)
}

export interface TerpProfile {
  key: ProfileKey;
  label: string;
  icon: string;
  tagline: string;
  description: string;
  researchHook: string; // one bold science sentence for the modal
  filters: TerpFilter[];
  ziggyOpener: string; // Ziggy's first message in chat
}

export const TERP_PROFILES: TerpProfile[] = [
  {
    key: "sleep",
    label: "Sleep Profile",
    icon: "🌙",
    tagline: "Body sedation + mind quieting",
    description:
      "Myrcene above 0.5% sedates your body through the opioid pathway — naloxone-reversible, muscle-relaxing, and it amplifies THC so it hits harder. Linalool above 0.5% quiets your mind through GABA, the same receptor pathway as sleep medication but at natural intensity. Two mechanisms, not one. That's why the combination works deeper than either alone.",
    researchHook:
      "Russo (2011) identifies myrcene + linalool as the strongest mechanistic case for cannabis terpene synergy in the entire primary literature.",
    filters: [
      { col: "terpene_myrcene", operator: "gt", value: 0.5, required: true },
      { col: "terpene_linalool", operator: "gt", value: 0.3, required: true },
      { col: "terpene_terpinolene", operator: "lt", value: 0.2, required: false },
      { col: "terpene_pinene", operator: "lt", value: 0.2, required: false },
    ],
    ziggyOpener:
      "Sleep profile. Two terpenes, two mechanisms. Myrcene hits the opioid pathway — body sedation, muscle relaxation, and it drops blood-brain barrier resistance so THC arrives harder and faster. Linalool hits GABA — mind sedation, same receptor family as benzodiazepines but orders of magnitude lighter. The combination isn't redundant. It's additive. You're quieting body and mind through entirely different systems simultaneously.\n\nWhat do you want to know — the science, the best genetics for this stack, or where to find it right now in Vegas?",
  },
  {
    key: "daytime-anxiety",
    label: "Daytime Anxiety Profile",
    icon: "☀️",
    tagline: "Anxiety relief without sedation",
    description:
      "Limonene above 0.3% works through 5-HT1A serotonin receptors — the same pathway as many anti-anxiety medications — lifting mood without opioid-pathway sedation. Pinene above 0.1% inhibits acetylcholinesterase, the enzyme that breaks down acetylcholine, which directly counteracts THC's memory fog. The key is keeping myrcene below 0.3% — most 'anxiety' products are myrcene-dominant and will sedate you.",
    researchHook:
      "Pinene is the only cannabis compound with documented acetylcholinesterase inhibition — the same mechanism as pharmaceutical memory drugs (Perry et al., 2000).",
    filters: [
      { col: "terpene_limonene", operator: "gt", value: 0.3, required: true },
      { col: "terpene_pinene", operator: "gt", value: 0.1, required: true },
      { col: "terpene_myrcene", operator: "lt", value: 0.3, required: false },
      { col: "terpene_linalool", operator: "lt", value: 0.3, required: false },
    ],
    ziggyOpener:
      "Daytime anxiety is the hardest profile to get right because the most common recommendation — indica, myrcene-heavy — is exactly wrong for daytime use. Myrcene sedates via the opioid pathway. That's not anxiety relief. That's trading anxiety for couch lock.\n\nWhat you want: limonene above 0.3% for the serotonergic mood lift, pinene above 0.1% to counteract THC memory fog so you stay functional. And myrcene suppressed — under 0.3%.\n\nGenetics shortlist: anything with 'Lemon,' 'Haze,' or 'Jack' in the name. Durban Poison, Jack Herer, Super Lemon Haze. Verify the COA — the label is not the chemistry.\n\nWhat specifically — the science, the best current products, or how to read a COA for this profile?",
  },
  {
    key: "pain-relief",
    label: "Pain Relief Profile",
    icon: "💊",
    tagline: "Three pain mechanisms. Evening stack.",
    description:
      "Caryophyllene above 0.3% directly activates CB2 receptors — the only cannabis terpene with confirmed GPCR binding, producing anti-inflammatory relief without psychoactivity. Myrcene above 0.3% adds opioid-pathway analgesia and muscle relaxation. Humulene above 0.1% deepens anti-inflammatory coverage through NF-κB, PLA2, and COX pathways simultaneously. This is an evening profile — myrcene's sedation is a feature, not a bug.",
    researchHook:
      "Caryophyllene is the only terpene in cannabis with confirmed direct CB2 receptor agonism (LaVigne et al., 2021) — the peripheral pain/inflammation receptor.",
    filters: [
      { col: "terpene_caryophyllene", operator: "gt", value: 0.3, required: true },
      { col: "terpene_myrcene", operator: "gt", value: 0.3, required: true },
      { col: "terpene_humulene", operator: "gt", value: 0.1, required: true },
    ],
    ziggyOpener:
      "Pain relief profile — three terpenes, three different mechanisms, none of them redundant.\n\nCaryophyllene is the CB2 agonist. Only terpene in cannabis that actually binds to a cannabinoid receptor — the peripheral one, in immune cells and inflamed tissue. Anti-inflammatory at the receptor level, no sedation. Myrcene adds the opioid pathway piece — naloxone-reversible analgesia, muscle relaxation, and it drops blood-brain barrier resistance so THC hits the pain harder. Humulene is caryophyllene's structural cousin — same general anti-inflammatory territory (NF-κB, COX) but different enough to deepen the stack.\n\nGSC lineage, Chemdog genetics, anything called GMO or Garlic Cookies — those are your highest-probability caryophyllene + humulene producers.\n\nWhat do you want to dig into?",
  },
  {
    key: "focus",
    label: "Focus Profile",
    icon: "🎯",
    tagline: "Memory clarity + serotonergic alertness",
    description:
      "Pinene above 0.2% inhibits acetylcholinesterase — the enzyme that destroys acetylcholine — directly reversing the memory impairment that THC causes at the hippocampus. Limonene above 0.3% adds 5-HT1A serotonergic mood stabilization, keeping the state calm-alert rather than anxious. Myrcene must stay below 0.2% — any sedation kills the focus goal. This is the work, study, and creative output stack.",
    researchHook:
      "Pinene's acetylcholinesterase inhibition mechanism is the same pharmacological action as Alzheimer's drugs like donepezil — it preserves working memory that THC degrades.",
    filters: [
      { col: "terpene_pinene", operator: "gt", value: 0.2, required: true },
      { col: "terpene_limonene", operator: "gt", value: 0.3, required: true },
      { col: "terpene_myrcene", operator: "lt", value: 0.2, required: false },
      { col: "terpene_linalool", operator: "lt", value: 0.2, required: false },
    ],
    ziggyOpener:
      "Focus profile. The key terpene here — pinene — does something nothing else in cannabis does. It inhibits acetylcholinesterase, the enzyme that breaks down acetylcholine. That's the same mechanism as pharmaceutical memory drugs. THC impairs short-term memory through CB1 agonism at the hippocampus. Pinene directly blocks the enzyme responsible for that impairment. It doesn't just mask the fog — it reverses the biochemical mechanism.\n\nPair that with limonene's 5-HT1A serotonergic alertness and you have calm, clear, focused energy — not the jittery stimulation of high-terpinolene Haze, but clean cognitive output.\n\nStrict low-myrcene requirement. Jack Herer, Durban, Green Crack. Verify pinene over 0.2% on the COA.\n\nWhat do you want to know?",
  },
  {
    key: "social-creativity",
    label: "Social Creativity Profile",
    icon: "✨",
    tagline: "The Haze stack — euphoria and open thinking",
    description:
      "Terpinolene above 0.3% is the signal terpene of Haze genetics — paradoxically sedative in preclinical animal models but consistently producing light, euphoric, socially open experiences in human reports at inhalation doses. Limonene above 0.2% adds serotonergic social inhibition reduction. Ocimene above 0.1% contributes the sweet, tropical top note. Keep myrcene below 0.3% — it sedates and collapses the social energy.",
    researchHook:
      "Terpinolene's paradox: sedative in every mouse model (Russo 2011), yet reliably euphoric at human inhalation doses — the pharmacological explanation remains unresolved.",
    filters: [
      { col: "terpene_terpinolene", operator: "gt", value: 0.3, required: true },
      { col: "terpene_limonene", operator: "gt", value: 0.2, required: true },
      { col: "terpene_ocimene", operator: "gt", value: 0.1, required: true },
      { col: "terpene_myrcene", operator: "lt", value: 0.3, required: false },
    ],
    ziggyOpener:
      "Social creativity profile — and I want to flag something upfront. Terpinolene is pharmacologically bizarre. Every controlled animal study shows sedative effects. Yet every human consumer report from Haze genetics describes the opposite: light, heady, euphoric, socially energizing. That contradiction is not resolved in the literature. Booth & Bohlmann (2019) describe the biosynthesis but not why the preclinical-to-human translation fails here.\n\nPractically: terpinolene above 0.3% reliably delivers the Haze experience. Pair with limonene for the serotonergic social ease and ocimene for the aromatic freshness, and you have the stack behind Jack Herer, Ghost Train Haze, Golden Goat, and Chernobyl.\n\nLow myrcene is non-negotiable — it sedates and kills the energy. If the COA shows myrcene above 0.3%, it's not this profile.\n\nWhat do you want to understand better?",
  },
  {
    key: "body-relief-daytime",
    label: "Body Relief Daytime",
    icon: "💪",
    tagline: "CB2 anti-inflammatory — function intact",
    description:
      "The daytime version of the pain profile: caryophyllene above 0.3% for CB2 anti-inflammatory without CNS sedation, humulene above 0.1% to deepen the anti-inflammatory coverage across NF-κB, PLA2, and COX pathways, and moderate pinene to preserve cognitive function and provide bronchodilatory support for inhalation. No myrcene — that's what separates this from the evening pain stack.",
    researchHook:
      "Fernandes et al. (2007) documented humulene's anti-inflammatory action across three distinct pathways simultaneously — making the caryophyllene + humulene pairing uniquely comprehensive.",
    filters: [
      { col: "terpene_caryophyllene", operator: "gt", value: 0.3, required: true },
      { col: "terpene_humulene", operator: "gt", value: 0.1, required: true },
      { col: "terpene_pinene", operator: "gt", value: 0.05, required: false },
      { col: "terpene_myrcene", operator: "lt", value: 0.2, required: false },
    ],
    ziggyOpener:
      "Body relief, daytime. Same anti-inflammatory terpene stack as the pain profile but without myrcene — which is the sedating piece. Caryophyllene is still the anchor: only terpene in cannabis with direct CB2 receptor agonism, peripheral anti-inflammatory, no CNS sedation. Humulene deepens the coverage across multiple inflammatory pathways. Pinene keeps your head clear via acetylcholinesterase inhibition and provides bronchodilation — useful when you're inhaling.\n\nThe genetics overlap with the pain profile (GSC, Chemdog lineage) but you want to specifically confirm low myrcene. Some GSC phenotypes run high myrcene — that makes them evening-appropriate, not daytime.\n\nFor workout recovery, chronic inflammation, or daytime pain management: this is the profile. What do you want to dig into?",
  },
];

// ─── Chat Message Type ─────────────────────────────────────────────────────

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

// ─── Main Component ────────────────────────────────────────────────────────

interface Props {
  activeProfile: ProfileKey | null;
  onSelectProfile: (key: ProfileKey | null) => void;
}

export default function TerpProfileSelector({ activeProfile, onSelectProfile }: Props) {
  const [infoModal, setInfoModal] = useState<ProfileKey | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProfile, setChatProfile] = useState<TerpProfile | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeProfileData = TERP_PROFILES.find((p) => p.key === activeProfile) ?? null;

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  function openInfo(key: ProfileKey, e: React.MouseEvent) {
    e.stopPropagation();
    setInfoModal(key);
  }

  function closeInfo() {
    setInfoModal(null);
  }

  function openZiggyChat(profile: TerpProfile) {
    setChatProfile(profile);
    setMessages([
      { role: "assistant", content: profile.ziggyOpener },
    ]);
    setInput("");
    setInfoModal(null);
    setChatOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function sendMessage() {
    if (!input.trim() || streaming || !chatProfile) return;

    const userMsg: ChatMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // Add placeholder for assistant response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ziggy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          profile: chatProfile.label,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break;
          try {
            const { text } = JSON.parse(payload);
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: updated[updated.length - 1].content + text,
              };
              return updated;
            });
          } catch {
            // ignore parse errors in stream
          }
        }
      }
    } catch (err) {
      console.error("Ziggy stream error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Connection issue. Try again.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  const infoModalData = TERP_PROFILES.find((p) => p.key === infoModal) ?? null;

  return (
    <>
      {/* ── Terp Profile Bar ──────────────────────────────────────────── */}
      <div className="terp-profile-bar">
        <div className="terp-profile-label">
          <span className="terp-profile-ziggy-name">Ziggy&apos;s Terp Profiles</span>
          <span className="terp-profile-hint">Filter by terpene effect goal</span>
        </div>

        <div className="terp-profile-options">
          {/* "All" / clear selection */}
          <button
            className={`terp-chip${!activeProfile ? " terp-chip-active" : ""}`}
            onClick={() => onSelectProfile(null)}
          >
            All
          </button>

          {TERP_PROFILES.map((profile) => (
            <div key={profile.key} className="terp-chip-wrapper">
              <button
                className={`terp-chip${activeProfile === profile.key ? " terp-chip-active" : ""}`}
                onClick={() =>
                  onSelectProfile(activeProfile === profile.key ? null : profile.key)
                }
                title={profile.tagline}
              >
                <span className="terp-chip-icon">{profile.icon}</span>
                {profile.label}
              </button>
              <button
                className="terp-info-btn"
                onClick={(e) => openInfo(profile.key, e)}
                aria-label={`Info about ${profile.label}`}
                title={`About ${profile.label}`}
              >
                <InfoIcon />
              </button>
            </div>
          ))}
        </div>

        {/* Active profile tagline */}
        {activeProfileData && (
          <div className="terp-active-tagline">
            <span className="terp-active-icon">{activeProfileData.icon}</span>
            <span className="terp-active-label">{activeProfileData.tagline}</span>
            <span className="terp-active-note">
              Filtering by terpene thresholds · COA data required · results may be limited
            </span>
          </div>
        )}
      </div>

      {/* ── Info Modal ───────────────────────────────────────────────────── */}
      {infoModal && infoModalData && (
        <div className="terp-modal-overlay" onClick={closeInfo}>
          <div className="terp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="terp-modal-close" onClick={closeInfo}>×</button>

            <div className="terp-modal-header">
              <span className="terp-modal-icon">{infoModalData.icon}</span>
              <div>
                <div className="terp-modal-title">{infoModalData.label}</div>
                <div className="terp-modal-tagline">{infoModalData.tagline}</div>
              </div>
            </div>

            <p className="terp-modal-desc">{infoModalData.description}</p>

            <div className="terp-modal-research">
              <span className="terp-modal-research-label">Research</span>
              {infoModalData.researchHook}
            </div>

            <div className="terp-modal-filters">
              <span className="terp-modal-filters-label">Thresholds</span>
              <div className="terp-filter-pills">
                {infoModalData.filters.map((f) => (
                  <span
                    key={f.col}
                    className={`terp-filter-pill ${f.required ? "terp-filter-required" : "terp-filter-suppress"}`}
                  >
                    {formatFilterLabel(f)}
                  </span>
                ))}
              </div>
            </div>

            <button
              className="terp-ziggy-btn"
              onClick={() => openZiggyChat(infoModalData)}
            >
              <span className="terp-ziggy-btn-icon">💬</span>
              Talk to Ziggy about this profile
            </button>
          </div>
        </div>
      )}

      {/* ── Ziggy Chat Modal ──────────────────────────────────────────────── */}
      {chatOpen && chatProfile && (
        <div className="terp-modal-overlay" onClick={() => setChatOpen(false)}>
          <div
            className="terp-modal terp-chat-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="terp-chat-header">
              <div className="terp-chat-header-left">
                <div className="terp-chat-ziggy-badge">Z</div>
                <div>
                  <div className="terp-chat-title">Ziggy</div>
                  <div className="terp-chat-subtitle">
                    {chatProfile.icon} {chatProfile.label}
                  </div>
                </div>
              </div>
              <button className="terp-modal-close" onClick={() => setChatOpen(false)}>×</button>
            </div>

            <div className="terp-chat-messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`terp-chat-msg terp-chat-msg-${msg.role}`}
                >
                  {msg.role === "assistant" && (
                    <div className="terp-chat-msg-avatar">Z</div>
                  )}
                  <div className="terp-chat-msg-bubble">
                    {msg.content || (streaming && i === messages.length - 1 ? (
                      <span className="terp-chat-typing">
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : null)}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <div className="terp-chat-input-row">
              <input
                ref={inputRef}
                className="terp-chat-input"
                type="text"
                placeholder="Ask about terpenes, strains, products..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                disabled={streaming}
              />
              <button
                className="terp-chat-send"
                onClick={sendMessage}
                disabled={streaming || !input.trim()}
              >
                {streaming ? "…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatFilterLabel(f: TerpFilter): string {
  const name = f.col.replace("terpene_", "");
  const symbol = f.operator === "gt" ? ">" : "<";
  const req = f.required ? "" : " (avoid)";
  return `${name} ${symbol}${f.value}%${req}`;
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
      <rect x="6.25" y="6" width="1.5" height="4.5" fill="currentColor" rx="0.5" />
      <rect x="6.25" y="3.5" width="1.5" height="1.5" fill="currentColor" rx="0.5" />
    </svg>
  );
}
