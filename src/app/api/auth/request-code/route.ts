import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { createHash, randomInt } from "crypto";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
}

function hashCode(email: string, code: string): string {
  return createHash("sha256").update(`${email}:${code}`).digest("hex");
}

function otpEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Daily Weed Newspaper code</title>
</head>
<body style="margin:0;padding:0;background:#f4f0e4;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0e4;padding:24px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#f4f0e4;border:2px solid #1a1008;max-width:560px;">

  <tr>
    <td style="border-bottom:3px double #1a1008;padding:18px 28px;text-align:center;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#6b5e45;margin-bottom:6px;">
        Las Vegas, Nevada · Est. 2026
      </div>
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:900;color:#1a1008;line-height:1;">
        Daily Weed Newspaper
      </div>
    </td>
  </tr>

  <tr>
    <td style="padding:28px 32px;">
      <div style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#1a1008;margin-bottom:20px;">
        Ziggy here. You asked to sign in — here's your code. It expires in 10 minutes.
        Don't give it to anyone. Not even a very convincing budtender.
      </div>

      <div style="text-align:center;padding:24px;border:2px solid #1a1008;background:#1a1008;margin-bottom:20px;">
        <div style="font-family:'Space Mono',monospace,monospace;font-size:42px;font-weight:700;color:#f4f0e4;letter-spacing:0.2em;">
          ${code}
        </div>
      </div>

      <div style="font-family:'Space Mono',monospace,monospace;font-size:10px;color:#6b5e45;text-align:center;">
        Expires in 10 minutes · Don't share this code · Valid for one use only
      </div>
    </td>
  </tr>

  <tr>
    <td style="padding:16px 32px;border-top:1px solid #c8b99a;">
      <div style="font-family:Georgia,serif;font-size:12px;font-style:italic;color:#6b5e45;line-height:1.6;">
        "If you didn't request this code, ignore it. Nobody got in. Relax."
      </div>
      <div style="font-family:'Space Mono',monospace,monospace;font-size:10px;color:#34a529;margin-top:4px;">
        — Ziggy
      </div>
    </td>
  </tr>

  <tr>
    <td style="background:#1a1008;padding:14px 28px;text-align:center;">
      <div style="font-family:'Space Mono',monospace,monospace;font-size:9px;color:#f4f0e4;letter-spacing:0.05em;">
        dailyweednewspaper.com · Las Vegas, NV
      </div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Rate limit: max 3 code requests per email per hour
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabase
    .from("auth_codes")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= 3) {
    return NextResponse.json(
      { error: "Too many code requests. Try again in an hour." },
      { status: 429 }
    );
  }

  // Generate 6-digit code
  const code = randomInt(100000, 999999).toString();
  const codeHash = hashCode(email, code);
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

  const { error: insertError } = await supabase.from("auth_codes").insert({
    email,
    code_hash: codeHash,
    expires_at: expiresAt,
  });

  if (insertError) {
    console.error("[request-code] insert error:", insertError);
    return NextResponse.json({ error: "Failed to create code" }, { status: 500 });
  }

  // Send via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailError } = await resend.emails.send({
    from: "Ziggy at Daily Weed Newspaper <noreply@dailyweednewspaper.com>",
    to: email,
    subject: `Your sign-in code: ${code}`,
    html: otpEmailHtml(code),
  });

  if (emailError) {
    console.error("[request-code] email error:", emailError);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }

  // Log analytics event
  await supabase.from("events").insert({
    email,
    event_name: "otp_requested",
    props: {},
  });

  return NextResponse.json({ ok: true });
}
