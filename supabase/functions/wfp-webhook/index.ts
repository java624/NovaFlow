import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const body = await req.json()
    const { orderReference, transactionStatus } = body

    if (transactionStatus === "Approved") {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

      const { error } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', orderReference)

      if (error) throw error
    }

    return new Response(JSON.stringify({ orderReference, status: "accept", time: Math.floor(Date.now() / 1000) }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})