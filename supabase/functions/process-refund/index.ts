import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Verify user is admin
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { order_id, amount } = await req.json();
    if (!order_id || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "order_id and positive amount required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get order details
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.payment_reference) {
      return new Response(JSON.stringify({ error: "No payment reference found for this order" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Paystack secret key from store_settings
    const { data: secretSetting } = await adminClient
      .from("store_settings")
      .select("value")
      .eq("key", "paystack_secret_key")
      .single();

    if (!secretSetting?.value) {
      return new Response(JSON.stringify({ error: "Paystack secret key not configured. Go to Admin Settings → Payment to add it." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Paystack refund API
    const refundRes = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretSetting.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: order.payment_reference,
        amount: Math.round(amount * 100), // Paystack uses pesewas
      }),
    });

    const refundData = await refundRes.json();

    if (!refundRes.ok || !refundData.status) {
      console.error("Paystack refund error:", JSON.stringify(refundData));
      return new Response(JSON.stringify({ error: refundData.message || "Refund failed at Paystack" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order with refund info
    const newRefundedAmount = Number(order.refunded_amount || 0) + amount;
    const refundStatus = newRefundedAmount >= Number(order.total) ? "full" : "partial";

    await adminClient
      .from("orders")
      .update({
        refunded_amount: newRefundedAmount,
        refund_status: refundStatus,
        status: refundStatus === "full" ? "cancelled" : order.status,
      })
      .eq("id", order_id);

    return new Response(
      JSON.stringify({ success: true, refund_status: refundStatus, refunded_amount: newRefundedAmount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Refund error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
