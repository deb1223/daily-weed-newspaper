import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  const { data, error } = await supabase
    .from("subscribers")
    .update({ subscription_status: "expired" })
    .eq("subscription_status", "trialing")
    .lt("trial_ends_at", new Date().toISOString())
    .select("email");

  if (error) {
    console.error("[expire-trials] error:", error);
    throw error;
  }

  const expired = data?.length ?? 0;
  console.log(`[expire-trials] expired ${expired} trials`);

  if (expired > 0 && data) {
    await supabase.from("events").insert(
      data.map((row) => ({
        email: row.email,
        event_name: "trial_expired",
        props: {},
      }))
    );
  }

  return expired;
}

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  return authHeader === `Bearer ${cronSecret}`;
}

// Vercel crons use GET
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const expired = await run();
    return NextResponse.json({ ok: true, expired });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Manual trigger via POST
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const expired = await run();
    return NextResponse.json({ ok: true, expired });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
