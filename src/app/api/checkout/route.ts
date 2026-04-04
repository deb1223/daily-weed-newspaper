import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.json().catch(() => ({}));
  const email: string | undefined = body.email || undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_MONTHLY!, quantity: 1 }],
    customer_email: email,
    success_url: "https://dailyweednewspaper.com/success",
    cancel_url: "https://dailyweednewspaper.com",
  });

  return NextResponse.json({ url: session.url });
}
