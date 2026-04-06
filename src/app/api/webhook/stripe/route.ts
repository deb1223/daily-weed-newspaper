import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { welcomeEmailHtml } from "@/lib/email";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function alertError(eventType: string, customerEmail: string | null, errorMessage: string) {
  try {
    await getResend().emails.send({
      from: "Daily Weed Newspaper <noreply@dailyweednewspaper.com>",
      to: "danieledwardbeecher@gmail.com",
      subject: `[Stripe webhook error] ${eventType}`,
      text: [
        `Event: ${eventType}`,
        `Customer: ${customerEmail ?? "(unknown)"}`,
        `Error: ${errorMessage}`,
        "",
        "This requires manual intervention in Supabase.",
      ].join("\n"),
    });
  } catch (e) {
    console.error("[Webhook] Alert email failed:", e);
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const supabase = getSupabase();

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email || session.customer_details?.email;
    const customerId =
      typeof session.customer === "string" ? session.customer : null;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : null;

    if (email) {
      const { error } = await supabase
        .from("subscribers")
        .upsert(
          {
            email,
            tier: "pro",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            confirmed: true,
          },
          { onConflict: "email" }
        );

      if (error) {
        console.error("[Webhook] checkout.session.completed upsert failed:", error);
        await alertError(event.type, email, error.message);
      } else {
        // Send Pro welcome email on successful subscription
        await getResend().emails.send({
          from: "Ziggy at Daily Weed Newspaper <noreply@dailyweednewspaper.com>",
          to: email,
          subject: "Ziggy says welcome. Don't embarrass us.",
          html: welcomeEmailHtml("pro"),
        }).catch((e) => console.error("[Webhook] Pro welcome email failed:", e));
      }
    }
  } else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId =
      typeof sub.customer === "string" ? sub.customer : null;

    if (customerId) {
      const { error } = await supabase
        .from("subscribers")
        .update({ tier: "free", stripe_subscription_id: null })
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("[Webhook] customer.subscription.deleted update failed:", error);
        await alertError(event.type, null, error.message);
      }
    }
  } else if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId =
      typeof sub.customer === "string" ? sub.customer : null;

    if (customerId) {
      const tier = sub.status === "active" ? "pro" : "free";
      const { error } = await supabase
        .from("subscribers")
        .update({ tier, stripe_subscription_id: sub.id })
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("[Webhook] customer.subscription.updated update failed:", error);
        await alertError(event.type, null, error.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
