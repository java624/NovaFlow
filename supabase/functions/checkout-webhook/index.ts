import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      metadata?: {
        user_id?: string;
        lessons_count?: string;
      };
    };
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
  if (!stripeWebhookSecret) {
    return jsonResponse({ error: "Stripe webhook secret is not configured" }, 500);
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  if (!(await verifyStripeSignature(rawBody, signature, stripeWebhookSecret))) {
    return jsonResponse({ error: "Invalid webhook signature" }, 401);
  }

  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(rawBody) as StripeWebhookEvent;
  } catch (err) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  if (event.type !== "checkout.session.completed") {
    return jsonResponse({ received: true });
  }

  const session = event.data.object;
  const userId = session.metadata?.user_id;
  const lessonsCount = Number(session.metadata?.lessons_count ?? 0);

  if (!userId || lessonsCount < 1) {
    return jsonResponse({ error: "Invalid session metadata" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("lessons_left")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Webhook profile lookup failed:", profileError.message);
    return jsonResponse({ error: "Profile lookup failed" }, 500);
  }

  const currentLessons = profile?.lessons_left ?? 0;
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ lessons_left: currentLessons + lessonsCount })
    .eq("id", userId);

  if (updateError) {
    console.error("Webhook update failed:", updateError.message);
    return jsonResponse({ error: "Failed to update lessons balance" }, 500);
  }

  return jsonResponse({ received: true });
});

function parseStripeSignature(signatureHeader: string) {
  const result: Record<string, string[]> = {};
  signatureHeader.split(",").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (!key || !value) return;
    const normalizedKey = key.trim();
    result[normalizedKey] = result[normalizedKey] || [];
    result[normalizedKey].push(value.trim());
  });
  return {
    timestamp: result["t"]?.[0] || "",
    signatures: result["v1"] || [],
  };
}

function secureCompare(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifyStripeSignature(payload: string, signature: string, secret: string) {
  if (!signature) return false;

  const { timestamp, signatures } = parseStripeSignature(signature);
  if (!timestamp || signatures.length === 0) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(signedPayload);

  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
    const computed = Array.from(new Uint8Array(signatureBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return signatures.some((sig) => secureCompare(sig, computed));
  } catch {
    return false;
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
