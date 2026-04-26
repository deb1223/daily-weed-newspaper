/**
 * /api/compute-winners
 *
 * Manual or cron trigger for computing daily winners.
 * The primary execution path is chained at the end of the scrape script
 * (scripts/scrape-dispensaries.ts) so winners are always computed on fresh data.
 *
 * This route exists for manual re-runs and emergency backfills only.
 * It is NOT in the Vercel cron schedule — see vercel.json.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { run } from "../../../../scripts/compute-winners-logic";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
}

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

// Vercel crons use GET; manual triggers can use either
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await run(getSupabase());
    revalidatePath("/");
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[compute-winners]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await run(getSupabase());
    revalidatePath("/");
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[compute-winners]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
