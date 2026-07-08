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
    console.log("Received WayForPay webhook payload:", body)
    
    const { orderReference, transactionStatus } = body

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find the pending payment in payments_history
    const { data: payment, error: pError } = await supabase
      .from("payments_history")
      .select("*")
      .eq("stripe_session_id", orderReference)
      .maybeSingle()

    if (pError) {
      console.error("DB lookup error:", pError.message)
      throw pError
    }

    if (!payment) {
      console.error(`Payment not found for orderReference: ${orderReference}`)
    } else if (transactionStatus === "Approved" && payment.status !== "completed") {
      // 1. Get current user profile lessons balance
      const { data: profile, error: prError } = await supabase
        .from("profiles")
        .select("lessons_left")
        .eq("id", payment.user_id)
        .single()

      if (prError) {
        console.error("Profile lookup error:", prError.message)
        throw prError
      }

      const currentLessons = profile?.lessons_left ?? 0
      const newLessons = currentLessons + payment.lessons_purchased

      // 2. Update profiles balance
      const { error: upError } = await supabase
        .from("profiles")
        .update({ lessons_left: newLessons })
        .eq("id", payment.user_id)

      if (upError) {
        console.error("Failed to update lessons balance:", upError.message)
        throw upError
      }

      // 3. Update payment status to completed
      const { error: payError } = await supabase
        .from("payments_history")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          metadata: {
            ...payment.metadata,
            wayforpay_response: body,
          }
        })
        .eq("id", payment.id)

      if (payError) {
        console.error("Failed to update payment status:", payError.message)
        throw payError
      }

      console.log(`Successfully credited ${payment.lessons_purchased} lessons to user ${payment.user_id}`)
    }

    // Prepare response to WayForPay (Must be signed!)
    const status = "accept"
    const time = Math.floor(Date.now() / 1000)
    const secretKey = "flk3409refn54t54t*FNJRET" // Correct test mode secret key

    const signatureString = `${orderReference};${status};${time}`
    const signature = generateHmacMd5(signatureString, secretKey)

    const responsePayload = {
      orderReference,
      status,
      time,
      signature
    }

    console.log("Sending Webhook Response:", responsePayload)

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("wfp-webhook error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})