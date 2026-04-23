import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
}

function hashCode(email: string, code: string): string {
  return createHash("sha256").update(`${email}:${code}`).digest("hex");
}

export async function POST(req: NextRequest) {
  let body: { email?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const code = (body.code ?? "").trim();

  if (!email || !code) {
    return NextResponse.json({ error: "Email and code required" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Find the most recent unconsumed, unexpired code for this email
  const { data: authCode, error: fetchError } = await supabase
    .from("auth_codes")
    .select("id, code_hash, expires_at, attempts")
    .eq("email", email)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error("[verify-code] fetch error:", fetchError);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }

  if (!authCode) {
    return NextResponse.json(
      { error: "No valid code found. Request a new one." },
      { status: 400 }
    );
  }

  // Max 5 attempts per code
  if (authCode.attempts >= 5) {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Request a new code." },
      { status: 429 }
    );
  }

  const expectedHash = hashCode(email, code);
  if (authCode.code_hash !== expectedHash) {
    // Increment attempt counter
    await supabase
      .from("auth_codes")
      .update({ attempts: authCode.attempts + 1 })
      .eq("id", authCode.id);

    const remaining = 4 - authCode.attempts;
    return NextResponse.json(
      { error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` },
      { status: 400 }
    );
  }

  // Mark consumed
  await supabase
    .from("auth_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", authCode.id);

  // Generate a magic link token via Supabase Admin so the client can establish a session
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData.properties?.hashed_token) {
    console.error("[verify-code] generateLink error:", linkError);
    return NextResponse.json({ error: "Session creation failed" }, { status: 500 });
  }

  // Log analytics event
  await supabase.from("events").insert({
    email,
    event_name: "otp_verified",
    props: {},
  });

  return NextResponse.json({
    ok: true,
    hashed_token: linkData.properties.hashed_token,
  });
}
