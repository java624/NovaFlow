import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckoutBody {
  planName?: string;
  price?: number;
  lessonsCount?: number;
  lang?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Missing authorization" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    const siteUrl = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = (await req.json()) as CheckoutBody;
    const planName = String(body.planName ?? "").trim();
    const price = Number(body.price ?? 0);
    const lessonsCount = Number(body.lessonsCount ?? 0);
    const lang = String(body.lang ?? "english").trim();

    if (!planName || !Number.isFinite(price) || price < 0) {
      return jsonResponse({ error: "Invalid plan parameters" }, 400);
    }

    if (!Number.isFinite(lessonsCount) || lessonsCount < 1) {
      return jsonResponse({ error: "Invalid lessons count" }, 400);
    }

    const baseUrl = resolveSiteBaseUrl(req, siteUrl);
    // ✅ FIXED: Use Next.js /dashboard route instead of dashboard.html
    const successUrl = `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/dashboard?payment=cancelled`;

    const amountCents = Math.round(price * lessonsCount * 100);
    const isMockMode = !stripeSecretKey;

    if (isMockMode || amountCents <= 0) {
      // Тестовий режим — записуємо уроки та створюємо запис в payments_history
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      const adminClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase;
      
      // Get current lesson balance
      const { data: profile } = await adminClient
        .from('profiles')
        .select('lessons_left')
        .eq('id', user.id)
        .single();
      const currentLessons = profile?.lessons_left ?? 0;

      // Update lessons
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ lessons_left: currentLessons + lessonsCount })
        .eq('id', user.id);

      if (updateError) {
        console.error("Mock mode profile update failed:", updateError);
        return jsonResponse({ error: "Failed to update lessons balance" }, 500);
      }

      // Record the payment in payments_history
      const mockSessionId = `mock_${user.id}_${Date.now()}`;
      const { error: paymentRecordError } = await adminClient
        .from('payments_history')
        .insert({
          user_id: user.id,
          stripe_session_id: mockSessionId,
          plan_name: planName,
          learning_language: lang,
          lessons_purchased: lessonsCount,
          amount_paid_cents: amountCents,
          currency: 'usd',
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: {
            mock: true,
            price_per_lesson: price,
            lessons_count: lessonsCount,
          },
        });

      if (paymentRecordError) {
        console.error("Mock payment record failed:", paymentRecordError);
        // Non-fatal: lessons were already added
      }

      return jsonResponse({
        url: `${successUrl.replace('{CHECKOUT_SESSION_ID}', mockSessionId)}&mock=true`,
        mock: true,
        message: isMockMode
          ? "Stripe не налаштований; згенеровано тестовий успіх"
          : "Free plan — no Stripe session required",
      });
    }

    // Build Stripe Checkout Session via raw fetch (no Stripe SDK needed)
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", successUrl);
    params.set("cancel_url", cancelUrl);
    params.set("client_reference_id", user.id);
    params.set("line_items[0][quantity]", String(lessonsCount));
    params.set("line_items[0][price_data][currency]", "usd");
    params.set(
      "line_items[0][price_data][product_data][name]",
      `NovaFlow — ${planName}`,
    );
    params.set(
      "line_items[0][price_data][product_data][description]",
      `${lessonsCount} lesson(s) · ${lang}`,
    );
    params.set("line_items[0][price_data][unit_amount]", String(price * 100));
    params.set("metadata[user_id]", user.id);
    params.set("metadata[plan_name]", planName);
    params.set("metadata[lessons_count]", String(lessonsCount));
    params.set("metadata[learning_language]", lang);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const stripeSession = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("Stripe error:", stripeSession);
      return jsonResponse(
        { error: stripeSession.error?.message ?? "Stripe session failed" },
        502,
      );
    }

    if (!stripeSession.url) {
      return jsonResponse({ error: "Stripe did not return a session URL" }, 502);
    }

    // Create a pending payment record BEFORE redirect
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const adminClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

    if (adminClient) {
      const { error: pendingRecordError } = await adminClient
        .from('payments_history')
        .insert({
          user_id: user.id,
          stripe_session_id: stripeSession.id,
          plan_name: planName,
          learning_language: lang,
          lessons_purchased: lessonsCount,
          amount_paid_cents: amountCents,
          currency: 'usd',
          status: 'pending',
          metadata: {
            price_per_lesson: price,
            lessons_count: lessonsCount,
          },
        });

      if (pendingRecordError) {
        console.error("Failed to create pending payment record:", pendingRecordError);
        // Non-fatal: webhook will create it if missing
      }
    }

    return jsonResponse({ url: stripeSession.url, sessionId: stripeSession.id });
  } catch (err) {
    console.error("checkout error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return jsonResponse({ error: message }, 500);
  }
});

function resolveSiteBaseUrl(req: Request, configuredSiteUrl: string): string {
  // 1. Спочатку беремо динамічний origin з браузера (localhost:3000 або твоя netlify.app)
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  // 2. Якщо origin чомусь немає, пробуємо витягнути з referer
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      /* ignore invalid referer */
    }
  }

  // 3. І тільки якщо браузер нічого не передав, беремо константу з налаштувань або дефолт
  if (configuredSiteUrl) return configuredSiteUrl.replace(/\/$/, "");
  return "http://localhost:3000"; // Дефолт для розробки Next.js
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