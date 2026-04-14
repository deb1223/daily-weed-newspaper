import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const sanitize = (v: string | undefined) => (v ?? "").replace(/\\n/g, "").replace(/\n/g, "").trim();

    const priceMonthly = sanitize(process.env.STRIPE_PRICE_MONTHLY);
    const priceYearly = sanitize(process.env.STRIPE_PRICE_YEARLY);
    const keySnippet = sanitize(process.env.STRIPE_SECRET_KEY).slice(0, 20);
    console.log(`[checkout] key prefix: ${keySnippet} | monthly: ${priceMonthly} | yearly: ${priceYearly}`);

    const stripe = new Stripe(sanitize(process.env.STRIPE_SECRET_KEY), {
      apiVersion: "2026-03-25.dahlia" as const,
    });
    const body = await req.json().catch(() => ({}));
    const email: string | undefined = body.email || undefined;
    const plan: string = body.plan ?? "monthly";

    const priceId = plan === "yearly" ? priceYearly : priceMonthly;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: "https://dailyweednewspaper.com/success",
      cancel_url: "https://dailyweednewspaper.com",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
