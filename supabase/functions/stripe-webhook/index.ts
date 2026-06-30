// supabase/functions/stripe-webhook/index.ts
// Listens for Stripe payment confirmations and updates order status + loyalty points
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// Then register this URL in your Stripe Dashboard webhook settings:
//   https://<project-ref>.supabase.co/functions/v1/stripe-webhook
// Listen for event: payment_intent.succeeded

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.order_id;

        // Fetch order to calculate points (10 pts per $1)
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (!order) break;

        const pointsEarned = Math.floor(order.total * 10);

        // Mark order paid + confirmed
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            points_earned: pointsEarned,
          })
          .eq("id", orderId);

        // Award loyalty points + stamp to the user
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("loyalty_points, loyalty_stamps")
          .eq("id", order.user_id)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              loyalty_points: profile.loyalty_points + pointsEarned,
              loyalty_stamps: profile.loyalty_stamps + 1,
            })
            .eq("id", order.user_id);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.order_id;

        await supabaseAdmin
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("id", orderId);

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
