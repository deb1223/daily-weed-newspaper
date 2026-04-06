import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

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

function welcomeEmailHtml(tier: string): string {
  const tierLabel = tier === "pro" ? "Pro" : "Free";
  const tierBenefits =
    tier === "pro"
      ? `<li style="padding:4px 0;border-bottom:1px solid #c8b99a;">Full dispensary compare — all locations, all prices</li>
         <li style="padding:4px 0;border-bottom:1px solid #c8b99a;">Daily price alerts for your saved strains</li>
         <li style="padding:4px 0;border-bottom:1px solid #c8b99a;">Historical price tracking — spot the cycles</li>
         <li style="padding:4px 0;">CSV export for the truly obsessed</li>`
      : `<li style="padding:4px 0;border-bottom:1px solid #c8b99a;">Daily Ziggy brief delivered every morning at 8am</li>
         <li style="padding:4px 0;border-bottom:1px solid #c8b99a;">Full price comparison table — all dispensaries</li>
         <li style="padding:4px 0;">Category winners updated in real-time</li>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Space+Mono&display=swap" rel="stylesheet">
<title>Ziggy says welcome.</title>
</head>
<body style="margin:0;padding:0;background:#f4f0e4;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0e4;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#f4f0e4;border:2px solid #1a1008;max-width:600px;">

  <!-- MASTHEAD -->
  <tr>
    <td style="border-bottom:3px double #1a1008;padding:20px 32px;text-align:center;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#6b5e45;margin-bottom:8px;">
        Las Vegas, Nevada · Est. 2026
      </div>
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:36px;font-weight:900;color:#1a1008;line-height:1;">
        Daily Weed Newspaper
      </div>
      <div style="font-family:'Space Mono',monospace,monospace;font-size:10px;color:#6b5e45;margin-top:8px;text-transform:uppercase;letter-spacing:0.1em;">
        Subscriber Confirmation · ${tierLabel} Tier
      </div>
    </td>
  </tr>

  <!-- HEADLINE -->
  <tr>
    <td style="padding:28px 32px 0;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#34a529;border-bottom:2px solid #34a529;padding-bottom:4px;margin-bottom:12px;">
        Breaking
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:900;color:#1a1008;line-height:1.15;margin:0 0 16px;">
        You Made a Smart Financial Decision Today
      </h1>
      <p style="font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.75;color:#1a1008;margin:0 0 16px;">
        Ziggy here. I track every dispensary menu in Las Vegas every single day because someone has to do it and apparently that someone is me. You've just subscribed to the only cannabis publication that actually gives a damn about your wallet.
      </p>
      <p style="font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.75;color:#1a1008;margin:0 0 24px;">
        The daily brief drops at 8am. It includes the top deals, the market rating, a roast of whoever deserves it, and Tourist Terry's tips if you're visiting. Read it before you go anywhere.
      </p>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 32px;"><div style="border-top:1px solid #c8b99a;"></div></td></tr>

  <!-- BENEFITS -->
  <tr>
    <td style="padding:20px 32px;">
      <div style="font-family:'Space Mono',monospace,monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:#6b5e45;margin-bottom:12px;">
        What you get — ${tierLabel}
      </div>
      <ul style="list-style:none;margin:0;padding:0;font-family:'Space Mono',monospace,monospace;font-size:12px;color:#1a1008;">
        ${tierBenefits}
      </ul>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 32px;"><div style="border-top:1px solid #c8b99a;"></div></td></tr>

  <!-- ZIGGY SIGN-OFF -->
  <tr>
    <td style="padding:20px 32px;">
      <p style="font-family:Georgia,serif;font-size:13px;font-style:italic;line-height:1.7;color:#6b5e45;margin:0 0 8px;">
        &ldquo;Don't pay Strip prices. Don't buy things you didn't look up first. Check the site before you get in the Uber. That's it. That's all I ask.&rdquo;
      </p>
      <p style="font-family:'Space Mono',monospace,monospace;font-size:10px;color:#34a529;margin:0;">
        — Ziggy, Lead Correspondent
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#1a1008;padding:16px 32px;text-align:center;">
      <div style="font-family:'Space Mono',monospace,monospace;font-size:10px;color:#f4f0e4;letter-spacing:0.05em;">
        dailyweednewspaper.com · Las Vegas, NV
      </div>
      <div style="font-family:'Space Mono',monospace,monospace;font-size:9px;color:#6b5e45;margin-top:4px;">
        You're receiving this because you signed up. Unsubscribe any time.
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
