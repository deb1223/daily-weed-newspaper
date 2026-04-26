export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllPageData } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase-server";
import NewspaperClient from "./components/NewspaperClient";

export const metadata: Metadata = {
  title: "Daily Weed Newspaper — Las Vegas Cannabis Price Comparison & Deals",
  description:
    "Real-time dispensary price comparison for Las Vegas. Sort by THC per dollar, price, and category across 57+ dispensaries. Find deals you didn't know existed.",
};

export default async function HomePage() {
  const data = await getAllPageData();

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

  return (
    <NewspaperClient
      data={data}
      gate={{ isPro: isPro || !gateEnabled }}
    />
  );
}
