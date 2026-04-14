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

    const { order_id, email_type, custom_message } = await req.json();
    if (!order_id || !email_type) {
      return new Response(JSON.stringify({ error: "order_id and email_type required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: settingsRows } = await adminClient
      .from("store_settings")
      .select("key, value")
      .in("key", [
        "smtp_host", "smtp_port", "smtp_user", "smtp_pass",
        "smtp_from_email", "smtp_from_name", "store_name",
        "email_api_type", "email_api_key", "email_api_endpoint",
      ]);

    const settings: Record<string, string> = {};
    settingsRows?.forEach((r: any) => { settings[r.key] = r.value; });

    const { data: order } = await adminClient
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shippingAddr = order.shipping_address as any;
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name")
      .eq("user_id", order.user_id)
      .maybeSingle();

    const { data: { user: orderUser } } = await adminClient.auth.admin.getUserById(order.user_id);
    const customerEmail = orderUser?.email;

    if (!customerEmail) {
      return new Response(JSON.stringify({ error: "Customer email not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const storeName = settings.store_name || "Our Store";
    const customerName = profile?.full_name || shippingAddr?.full_name || "Customer";

    let subject = "";
    let htmlBody = "";

    const itemsHtml = (order.order_items || [])
      .map((item: any) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.product_name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">x${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">GH₵ ${Number(item.price).toFixed(2)}</td></tr>`)
      .join("");

    const orderTable = `<table style="width:100%;border-collapse:collapse;margin:16px 0"><thead><tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Price</th></tr></thead><tbody>${itemsHtml}</tbody><tfoot><tr><td colspan="2" style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;text-align:right;font-weight:bold">GH₵ ${Number(order.total).toFixed(2)}</td></tr></tfoot></table>`;

    switch (email_type) {
      case "order_confirmation":
        subject = `Order Confirmed — #${order.id.slice(0, 8)}`;
        htmlBody = `<h2>Hi ${customerName},</h2><p>Thank you for your order with ${storeName}! Your order <strong>#${order.id.slice(0, 8)}</strong> has been confirmed.</p>${orderTable}<p>We'll notify you when your order ships.</p>`;
        break;
      case "payment_receipt":
        subject = `Payment Receipt — #${order.id.slice(0, 8)}`;
        htmlBody = `<h2>Payment Received</h2><p>Hi ${customerName}, we've received your payment for order <strong>#${order.id.slice(0, 8)}</strong>.</p>${orderTable}<p>Payment method: ${order.payment_method || "N/A"}</p><p>Reference: ${order.payment_reference || "N/A"}</p>`;
        break;
      case "shipping_update":
        subject = `Your Order Has Shipped — #${order.id.slice(0, 8)}`;
        htmlBody = `<h2>Your order is on its way!</h2><p>Hi ${customerName}, your order <strong>#${order.id.slice(0, 8)}</strong> has been shipped.</p>${orderTable}${custom_message ? `<p><strong>Note:</strong> ${custom_message}</p>` : ""}`;
        break;
      case "refund_notification":
        subject = `Refund Processed — #${order.id.slice(0, 8)}`;
        htmlBody = `<h2>Refund Processed</h2><p>Hi ${customerName}, a refund has been processed for your order <strong>#${order.id.slice(0, 8)}</strong>.</p><p>Refunded amount: GH₵ ${Number(order.refunded_amount || 0).toFixed(2)}</p>${custom_message ? `<p><strong>Note:</strong> ${custom_message}</p>` : ""}`;
        break;
      default:
        subject = `Order Update — #${order.id.slice(0, 8)}`;
        htmlBody = `<h2>Order Update</h2><p>Hi ${customerName}, there's an update on your order <strong>#${order.id.slice(0, 8)}</strong>.</p><p>Status: <strong>${order.status}</strong></p>${custom_message ? `<p>${custom_message}</p>` : ""}`;
    }

    const fullHtml = `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">${htmlBody}<hr style="margin:24px 0;border:none;border-top:1px solid #eee"><p style="font-size:12px;color:#999">${storeName}</p></body></html>`;

    const apiType = settings.email_api_type || "smtp";

    if (apiType === "resend") {
      const apiKey = settings.email_api_key;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Email API key not configured" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `${settings.smtp_from_name || storeName} <${settings.smtp_from_email || "noreply@example.com"}>`,
          to: [customerEmail],
          subject,
          html: fullHtml,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return new Response(JSON.stringify({ error: resData.message || "Email send failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (apiType === "custom_api") {
      const apiKey = settings.email_api_key;
      const endpoint = settings.email_api_endpoint;
      if (!apiKey || !endpoint) {
        return new Response(JSON.stringify({ error: "Custom email API not fully configured" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: settings.smtp_from_email || "noreply@example.com",
          from_name: settings.smtp_from_name || storeName,
          to: customerEmail,
          subject,
          html: fullHtml,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return new Response(JSON.stringify({ error: errData.message || "Email send failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Unsupported email type. Configure Resend or Custom API in settings." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: `Email sent to ${customerEmail}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Email error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
