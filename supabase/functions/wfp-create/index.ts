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

    if (!userId || !amount || !lessonsCount) {
      throw new Error("Missing required fields")
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate UUID for the payment record
    const paymentId = crypto.randomUUID()
    const orderReference = `wfp_${paymentId}_${Date.now()}`
    
    // Insert pending payment into payments_history
    const { data: payment, error: pError } = await supabase
      .from("payments_history")
      .insert([{
        id: paymentId,
        user_id: userId,
        stripe_session_id: orderReference, // using this to store orderReference
        plan_name: planName,
        learning_language: lang,
        lessons_purchased: lessonsCount,
        amount_paid_cents: Math.round(amount * 100), // amount is in USD, store as cents
        currency: "usd",
        status: "pending",
      }])
      .select().single()

    if (pError) throw new Error(`DB Error: ${pError.message}`)

    // Test mode credentials
    const merchantAccount = "test_merch_n1"
    const secretKey = "flk3409refn54t54t*FNJRET" // Correct test mode secret key
    
    const rawOrigin = req.headers.get("origin") ?? "http://localhost:3000"
    const merchantDomainName = rawOrigin.replace(/^https?:\/\//, "").split(":")[0]

    const orderDate = Math.floor(Date.now() / 1000)
    const productName = `${lessonsCount} Lessons (${planName})`

    // Convert amount from USD to UAH for WayForPay (1 USD = 40 UAH)
    const amountUah = Math.round(amount * 40)

    // Signature COMPONENTS for CREATE_INVOICE
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

    console.log("Built Signature String:", signatureString)
    console.log("Generated HMAC-MD5:", merchantSignature)

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
      serviceUrl: `${supabaseUrl}/functions/v1/wfp-webhook`,
      returnUrl: `${rawOrigin}/dashboard?payment=success&session_id=${orderReference}`
    }

    const wfpResponse = await fetch("https://api.wayforpay.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wfpPayload),
    })

    const wfpData = await wfpResponse.json()
    console.log("WayForPay response:", wfpData)

    if (!wfpData.invoiceUrl) {
      throw new Error(wfpData.reason || `WayForPay error: ${JSON.stringify(wfpData)}`)
    }

    return new Response(JSON.stringify({ url: wfpData.invoiceUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    console.error("wfp-create error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})