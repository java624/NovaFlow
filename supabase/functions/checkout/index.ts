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
    const successUrl = `${baseUrl}/dashboard.html?payment=success`;
    const cancelUrl = `${baseUrl}/dashboard.html?payment=cancelled`;

    const amountCents = Math.round(price * 100);
    const isMockMode = !stripeSecretKey;

    if (isMockMode || amountCents <= 0) {
      // У тестовому режимі або для безкоштовного тарифу одразу записуємо уроки в профіль
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      const adminClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase;
      
      const { data: profile } = await adminClient
        .from('profiles')
        .select('lessons_left')
        .eq('id', user.id)
        .single();
      const currentLessons = profile?.lessons_left ?? 0;
      await adminClient
        .from('profiles')
        .update({ lessons_left: currentLessons + lessonsCount })
        .eq('id', user.id);

      return jsonResponse({
        url: isMockMode ? `${successUrl}&mock=true` : successUrl,
        mock: true,
        message: isMockMode
          ? "Stripe не налаштований; згенеровано тестовий успіх"
          : "Free plan — no Stripe session required",
      });
    }

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", successUrl);
    params.set("cancel_url", cancelUrl);
    params.set("client_reference_id", user.id);
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", "usd");
    params.set(
      "line_items[0][price_data][product_data][name]",
      `NovaFlow — ${planName}`,
    );
    params.set(
      "line_items[0][price_data][product_data][description]",
      `${lessonsCount} lesson(s) · ${lang}`,
    );
    params.set("line_items[0][price_data][unit_amount]", String(amountCents));
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

    return jsonResponse({ url: stripeSession.url });
  } catch (err) {
    console.error("checkout error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return jsonResponse({ error: message }, 500);
  }
});

function resolveSiteBaseUrl(req: Request, configuredSiteUrl: string): string {
  if (configuredSiteUrl) return configuredSiteUrl;
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      /* ignore invalid referer */
    }
  }
  return "http://127.0.0.1:5500";
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
