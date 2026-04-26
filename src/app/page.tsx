export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getAllPageData } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase-server";
import NewspaperClient from "./components/NewspaperClient";

export const metadata: Metadata = {
  title: "Daily Weed Newspaper — Las Vegas Cannabis Price Comparison & Deals",
  description:
    "Real-time dispensary price comparison for Las Vegas. Sort by THC per dollar, price, and category across 57+ dispensaries. Find deals you didn't know existed.",
};

// Deterministic selection of `count` indices from `total` using a string seed.
// Same seed always produces the same indices — stable within a session.
function seededRevealIndices(seed: string, total: number, count: number): number[] {
  // Seed a simple LCG (Lehmer) with a hash of the seed string.
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = (Math.imul(s, 31) + seed.charCodeAt(i)) >>> 0;
  }
  // Fisher-Yates shuffle driven by the LCG.
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = total - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  // Return the first `count` results in ascending order for stable card layout.
  return indices.slice(0, count).sort((a, b) => a - b);
}

export default async function HomePage() {
  const [data, cookieStore] = await Promise.all([
    getAllPageData(),
    cookies(),
  ]);

  // ── Gate: Pro check ──────────────────────────────────────────────────────
  const gateEnabled = process.env.NEXT_PUBLIC_PRO_GATE_ENABLED !== "false";

  let isPro = false;
  if (gateEnabled) {
    try {
      const supabase = await createSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: sub } = await supabase
          .from("subscribers")
          .select("tier")
          .eq("email", user.email)
          .single();
        isPro = sub?.tier === "pro";
      }
    } catch {
      // Auth failure is non-fatal — default to free gate
    }
  }

  // ── Revealed indices ─────────────────────────────────────────────────────
  const TOTAL = 7;
  const REVEAL_COUNT = 3;
  const seed = cookieStore.get("dwn_session")?.value ?? "default";
  const revealedIndices = isPro || !gateEnabled
    ? Array.from({ length: TOTAL }, (_, i) => i)  // all 7
    : seededRevealIndices(seed, TOTAL, REVEAL_COUNT);

  return (
    <NewspaperClient
      data={data}
      gate={{ isPro: isPro || !gateEnabled, revealedIndices }}
    />
  );
}
