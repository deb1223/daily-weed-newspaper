import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
}

function trialWelcomeHtml(email: string): string {
  const trialEnd = new Date(Date.now() + 7 * 86400_000).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your 7-day trial is live</title>
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
      <div style="font-family:'Space Mono',monospace,monospace;font-size:10px;color:#34a529;margin-top:8px;text-transform:uppercase;letter-spacing:0.1em;">
        7-Day Pro Trial — Active
      </div>
    </td>
  </tr>

  <tr>
    <td style="padding:28px 32px;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#34a529;border-bottom:2px solid #34a529;padding-bottom:4px;margin-bottom:12px;">
        Your trial is live
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:900;color:#1a1008;line-height:1.2;margin:0 0 16px;">
        7 Days of Ziggy Pro. No Card. No Catch.
      </h1>
      <p style="font-family:Georgia,serif;font-size:15px;line-height:1.75;color:#1a1008;margin:0 0 16px;">
        Ziggy here. You've got full Pro access through <strong>${trialEnd}</strong>.
        That means unlimited deal lookups, the Bargain Rating before the market opens,
        terpene-guided recommendations, and Talk to Ziggy — my personal AI budtender
        that knows every mg/$ ratio in the valley.
      </p>
      <p style="font-family:Georgia,serif;font-size:15px;line-height:1.75;color:#1a1008;margin:0 0 24px;">
        Use it. Actually use it. Then decide if $9/month is worth knowing exactly
        where to get the best flower in Vegas before anyone else does.
      </p>

      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://www.dailyweednewspaper.com/prices"
           style="display:inline-block;background:#1a1008;color:#f4f0e4;font-family:'Space Mono',monospace,monospace;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:14px 32px;">
          Open the Price Dashboard →
        </a>
      </div>

      <div style="border:1px solid #c8b99a;padding:16px;font-family:'Space Mono',monospace,monospace;font-size:11px;color:#6b5e45;line-height:1.8;">
        <strong style="color:#1a1008;">What you have now:</strong><br>
        ✓ Unlimited deal lookups<br>
        ✓ Bargain Rating — real math, not guessing<br>
        ✓ Deal rarity scores — know when a price is actually rare<br>
        ✓ Talk to Ziggy — terpene-guided AI budtender<br>
        ✓ Full dispensary comparison across Las Vegas
      </div>
    </td>
  </tr>

  <tr>
    <td style="padding:16px 32px;border-top:1px solid #c8b99a;">
      <div style="font-family:Georgia,serif;font-size:12px;font-style:italic;color:#6b5e45;line-height:1.6;">
        "Trial ends ${trialEnd}. After that it's $9/month. Which is less than one mediocre pre-roll on the Strip. Do the math."
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
      <div style="font-family:'Space Mono',monospace,monospace;font-size:9px;color:#6b5e45;margin-top:4px;">
        You're receiving this because you signed up for a trial at ${email}
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

  // Check if subscriber already has an active paid subscription — don't downgrade
  const { data: existing } = await supabase
    .from("subscribers")
    .select("subscription_status, tier")
    .eq("email", email)
    .maybeSingle();

  const isAlreadyPaid =
    existing?.subscription_status === "active" ||
    existing?.tier === "pro";

  if (isAlreadyPaid) {
    // Already paying — just return ok, they have access
    return NextResponse.json({ ok: true, already_pro: true });
  }

  const isAlreadyTrialing = existing?.subscription_status === "trialing";
  if (isAlreadyTrialing) {
    return NextResponse.json({ ok: true, already_trialing: true });
  }

  const now = new Date().toISOString();
  const trialEnd = new Date(Date.now() + 7 * 86400_000).toISOString();

  const { error } = await supabase
    .from("subscribers")
    .upsert(
      {
        email,
        tier: "free", // keep tier free; subscription_status drives trial access
        subscription_status: "trialing",
        trial_started_at: now,
        trial_ends_at: trialEnd,
        confirmed: true,
      },
      { onConflict: "email" }
    );

  if (error) {
    console.error("[setup-trial] upsert error:", error);
    return NextResponse.json({ error: "Failed to activate trial" }, { status: 500 });
  }

  // Log analytics
  await supabase.from("events").insert({
    email,
    event_name: "trial_started",
    props: { trial_ends_at: trialEnd },
  });

  // Send trial welcome email
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Ziggy at Daily Weed Newspaper <noreply@dailyweednewspaper.com>",
    to: email,
    subject: "Your 7-day Ziggy Pro trial is live",
    html: trialWelcomeHtml(email),
  }).catch((e) => console.error("[setup-trial] welcome email failed:", e));

  return NextResponse.json({ ok: true, trial_ends_at: trialEnd });
}
