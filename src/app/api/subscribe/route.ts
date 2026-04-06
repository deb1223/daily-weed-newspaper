import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import { welcomeEmailHtml } from "@/lib/email";

// Required Supabase table (create once in dashboard):
// CREATE TABLE subscribers (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   email text UNIQUE NOT NULL,
//   tier text DEFAULT 'free',
//   city text,
//   created_at timestamptz DEFAULT now(),
//   confirmed boolean DEFAULT false
// );

function getResend() { return new Resend(process.env.RESEND_API_KEY); }

export async function POST(req: NextRequest) {
  let body: { email?: string; tier?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, tier = "free" } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const safeTier = tier === "pro" ? "pro" : "free";

  const { error: dbError } = await supabase
    .from("subscribers")
    .upsert({ email, tier: safeTier }, { onConflict: "email" });

  if (dbError) {
    console.error("[Subscribe] DB error:", dbError);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  const resend = getResend();

  // Welcome email to subscriber
  await resend.emails.send({
    from: "Ziggy at Daily Weed Newspaper <noreply@dailyweednewspaper.com>",
    to: email,
    subject: "Ziggy says welcome. Don't embarrass us.",
    html: welcomeEmailHtml(safeTier),
  }).catch((e) => console.error("[Subscribe] Welcome email failed:", e));

  // Notify Dan
  await resend.emails.send({
    from: "Daily Weed Newspaper <noreply@dailyweednewspaper.com>",
    to: "danieledwardbeecher@gmail.com",
    subject: `New subscriber: ${email} (${safeTier})`,
    text: `New subscriber: ${email} signed up for ${safeTier} tier.`,
  }).catch((e) => console.error("[Subscribe] Notify email failed:", e));

  return NextResponse.json({ success: true });
}
