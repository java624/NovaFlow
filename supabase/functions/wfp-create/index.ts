import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"
import crypto from "node:crypto"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Функція для генерації НАЙПРАВИЛЬНІШОГО HMAC-MD5
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
    const lessonsCount = body.lessonsCount || body.lessons_count
    let amount = body.amount || body.totalAmount

    if (!userId || !amount || !lessonsCount) {
      throw new Error("Missing required fields")
    }

    if (amount < 200) {
      amount = Math.round(amount * 40)
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: payment, error: pError } = await supabase
      .from("payments")
      .insert([{
        user_id: userId,
        amount: Number(amount),
        status: "pending",
        lessons_added: Number(lessonsCount),
      }])
      .select().single()

    if (pError) throw new Error(`DB Error: ${pError.message}`)

    const merchantAccount = "test_merch_n1"
    const secretKey = "flk3409refn3094f1029f43lpathae:alpha34"
    
    const rawOrigin = req.headers.get("origin") ?? "http://localhost:3000"
    const merchantDomainName = rawOrigin.replace(/^https?:\/\//, "").split(":")[0]

    const orderReference = `${payment.id}_${Date.now()}`
    const orderDate = Math.floor(Date.now() / 1000)
    const productName = "Lessons"

    // Рядок підпису для CREATE_INVOICE СУТO з даних ТОВАРУ (БЕЗ секретного ключа в самому рядку!)
    const signatureComponents = [
      merchantAccount,
      merchantDomainName,
      orderReference,
      orderDate,
      amount,
      "UAH",
      productName,
      1,
      amount
    ]
    
    const signatureString = signatureComponents.join(";")
    
    // Генеруємо підпис через HMAC-MD5, використовуючи secretKey як ключ
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
      amount: Number(amount),
      currency: "UAH",
      productName: [productName],
      productPrice: [Number(amount)],
      productCount: [1],
      serviceUrl: `${supabaseUrl}/functions/v1/wfp-webhook`,
      returnUrl: `${rawOrigin}/dashboard`
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})