import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"
import CryptoJS from "crypto-js"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function generateHmacMD5(data: string, secret: string): string {
  return CryptoJS.HmacMD5(data, secret).toString()
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 })
  }

  try {
    const body = await req.json()
    const userId = body.userId || body.user_id
    const lessonsCount = body.lessonsCount || body.lessons_count || body.lessonsAdded || body.lessons_added
    let amount = body.amount || body.price || body.totalAmount || body.total_amount

    console.log("wfp-create received:", { userId, amount, lessonsCount })

    if (!userId || !amount || !lessonsCount) {
      throw new Error("Missing required fields")
    }

    // Якщо фронтенд передає суму в USD, конвертуємо її в UAH (наприклад, фіксований курс 40)
    // WayForPay вимагає суму в гривнях!
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

    const merchantAccount = Deno.env.get("WFP_MERCHANT_ACCOUNT") ?? ""
    const secretKey = Deno.env.get("WFP_SECRET_KEY") ?? ""
    const domain = req.headers.get("origin") ?? "http://localhost:3000"
    const orderReference = payment.id
    const orderDate = Math.floor(Date.now() / 1000)
    const productName = `Пакет уроків NovaFlow (${lessonsCount} шт)`

    const signatureString = `${merchantAccount};${domain};${orderReference};${orderDate};${amount};UAH;${productName};1;${amount}`
    const merchantSignature = generateHmacMD5(signatureString, secretKey)

    const wfpResponse = await fetch("https://api.wayforpay.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionType: "CREATE_INVOICE",
        merchantAccount,
        merchantAuthType: "SimpleSignature",
        merchantDomainName: domain,
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
        returnUrl: `${domain}/dashboard`,
      }),
    })

    const wfpData = await wfpResponse.json()
    return new Response(JSON.stringify({ url: wfpData.invoiceUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})