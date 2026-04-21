"use client";

import { useState } from "react";

const MCP_URL = "https://www.dailyweednewspaper.com/api/mcp";
const CLI_COMMAND = `claude mcp add dwn ${MCP_URL}`;
const DESKTOP_CONFIG = JSON.stringify(
  {
    mcpServers: {
      dwn: {
        url: MCP_URL,
      },
    },
  },
  null,
  2
);

export default function ConnectToClaudeButton() {
  const [expanded, setExpanded] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedDesktop, setCopiedDesktop] = useState(false);

  function copy(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ fontFamily: "Space Mono, monospace" }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          background: "var(--ink)",
          color: "var(--newsprint)",
          border: "2px solid var(--ink)",
          fontFamily: "Space Mono, monospace",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "14px" }}>◆</span>
        Connect to Claude
      </button>

      {expanded && (
        <div
          style={{
            marginTop: "12px",
            border: "2px solid var(--ink)",
            padding: "24px",
            maxWidth: "520px",
            background: "var(--newsprint)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "16px",
            }}
          >
            MCP Server — dailyweednewspaper.com
          </div>

          <p
            style={{
              fontSize: "12px",
              lineHeight: 1.6,
              color: "var(--ink)",
              marginBottom: "20px",
            }}
          >
            Give Claude real-time access to Las Vegas dispensary prices.
            Ask for the best mg/$ flower, search by strain, or find deals near
            you — straight from your AI assistant.
          </p>

          {/* Claude Code CLI */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "8px",
              }}
            >
              Claude Code (CLI)
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <code
                style={{
                  flex: 1,
                  background: "var(--ink)",
                  color: "var(--newsprint)",
                  padding: "10px 12px",
                  fontSize: "11px",
                  letterSpacing: "0.03em",
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                {CLI_COMMAND}
              </code>
              <button
                onClick={() => copy(CLI_COMMAND, setCopiedCli)}
                style={{
                  padding: "10px 14px",
                  background: "transparent",
                  border: "2px solid var(--ink)",
                  fontFamily: "Space Mono, monospace",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  color: "var(--ink)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {copiedCli ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Claude Desktop */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "8px",
              }}
            >
              Claude Desktop — claude_desktop_config.json
            </div>
            <div style={{ position: "relative" }}>
              <pre
                style={{
                  background: "var(--ink)",
                  color: "var(--newsprint)",
                  padding: "12px",
                  fontSize: "11px",
                  lineHeight: 1.5,
                  margin: 0,
                  overflowX: "auto",
                }}
              >
                {DESKTOP_CONFIG}
              </pre>
              <button
                onClick={() => copy(DESKTOP_CONFIG, setCopiedDesktop)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  padding: "4px 10px",
                  background: "var(--newsprint)",
                  border: "1px solid var(--newsprint)",
                  fontFamily: "Space Mono, monospace",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  color: "var(--ink)",
                }}
              >
                {copiedDesktop ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Pro note */}
          <div
            style={{
              borderTop: "1px solid var(--ink)",
              paddingTop: "16px",
              fontSize: "11px",
              lineHeight: 1.6,
              color: "var(--muted)",
            }}
          >
            Free: 3 lookups/day by IP &nbsp;·&nbsp; Pro: unlimited
            &nbsp;·&nbsp;{" "}
            <a
              href="/prices"
              style={{ color: "var(--ink)", fontWeight: 700 }}
            >
              Subscribe $9/mo →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
