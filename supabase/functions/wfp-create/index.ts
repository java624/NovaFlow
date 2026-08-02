import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"
import crypto from "node:crypto"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function generateHmacMd5(data: string, key: string): string {
  return crypto.createHmac("md5", key).update(data, "utf8").digest("hex");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 })
  }

  try {
    const body = await req.json()
    const userId = body.userId || body.user_id
    const lessonsCount = Number(body.lessonsCount || body.lessons_count)
    const amount = Number(body.amount || body.totalAmount)
    const planName = body.planName || "Lessons Package"
    const lang = body.lang || "english"
    const currency = body.currency || "USD"

    if (!userId || amount === undefined || !lessonsCount) {
      throw new Error("Missing required fields")
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const paymentId = crypto.randomUUID()
    const cleanUserId = String(userId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
    const orderReference = `NF_ORD_${Date.now()}_${cleanUserId}`
    const orderDate = Math.floor(Date.now() / 1000)
    
    // Save pending payment into payments_history
    const { error: pError } = await supabase
      .from("payments_history")
      .insert([{
        id: paymentId,
        user_id: userId,
        order_reference: orderReference,
        stripe_session_id: orderReference,
        plan_name: planName,
        learning_language: lang,
        lessons_purchased: lessonsCount,
        amount_paid_cents: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        status: "pending",
      }])

    if (pError) throw new Error(`DB Error: ${pError.message}`)

    const merchantAccount = Deno.env.get("WAYFORPAY_MERCHANT_ACCOUNT") || "novaflow_school_com"
    const secretKey = Deno.env.get("WAYFORPAY_SECRET_KEY") || "b85872d3530aae9339458de8e60a5496f7140fbd"
    const merchantDomainName = Deno.env.get("WAYFORPAY_MERCHANT_DOMAIN") || "novaflow-school.com"
    const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://novaflow-school.com"

    const productName = `${lessonsCount} Lesson${lessonsCount > 1 ? 's' : ''} - ${planName}`

    let amountUah = amount
    if (currency.toUpperCase() === "USD") {
      amountUah = Math.round(amount * 40)
    }
    if (amountUah < 1) amountUah = 1

    const signatureComponents = [
      merchantAccount,
      merchantDomainName,
      orderReference,
      orderDate,
      amountUah,
      "UAH",
      productName,
      1,
      amountUah
    ]
    
    const signatureString = signatureComponents.join(";")
    const merchantSignature = generateHmacMd5(signatureString, secretKey)

    const wfpPayload = {
      transactionType: "CREATE_INVOICE",
      merchantAccount,
      merchantAuthType: "SimpleSignature",
      merchantDomainName,
      merchantSignature,
      apiVersion: 1,
      orderReference,
      orderDate,
      amount: amountUah,
      currency: "UAH",
      productName: [productName],
      productPrice: [amountUah],
      productCount: [1],
      serviceUrl: `${siteUrl}/api/payments/wayforpay/callback`,
      returnUrl: `${siteUrl}/api/payments/wayforpay/return-success?order=${orderReference}`,
      failedUrl: `${siteUrl}/api/payments/wayforpay/return-failed?order=${orderReference}`
    }

    const wfpResponse = await fetch("https://api.wayforpay.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wfpPayload),
    })

    const wfpData = await wfpResponse.json()

    if (!wfpData.invoiceUrl) {
      throw new Error(wfpData.reason || `WayForPay error: ${JSON.stringify(wfpData)}`)
    }

    return new Response(JSON.stringify({ url: wfpData.invoiceUrl, orderReference }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: any) {
    console.error("wfp-create error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})