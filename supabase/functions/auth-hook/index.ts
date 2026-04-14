import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Supabase Auth Hook for Sending Emails
 * Docs: https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user, email_data, type } = await req.json();

    // We only want to handle password reset (recovery) for now
    // Other types: 'signup', 'invite', 'magic_link', 'email_change', etc.
    if (type !== "recovery") {
      // Return a 200 with an empty body to let Supabase Auth handle other emails normally
      // (Or handle them here as well if needed)
      return new Response(JSON.stringify({ message: "Default handling for this email type" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get email settings from store_settings
    const { data: settingsRows } = await adminClient
      .from("store_settings")
      .select("key, value")
      .in("key", ["email_api_key", "smtp_from_email", "smtp_from_name", "store_name"]);

    const settings: Record<string, string> = {};
    settingsRows?.forEach((r) => { settings[r.key] = r.value; });

    const resendApiKey = settings.email_api_key;
    const fromEmail = settings.smtp_from_email || "noreply@example.com";
    const fromName = settings.smtp_from_name || settings.store_name || "Tillies Avenue Glow";
    const storeName = settings.store_name || "Tillies Avenue Glow";

    if (!resendApiKey) {
      console.error("Resend API key missing in store_settings");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const customerEmail = user.email;
    const customerName = user.user_metadata?.full_name || "Customer";
    const resetLink = email_data.link;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { border: 1px solid #eee; border-radius: 12px; padding: 32px; background-color: #fff; }
          .logo { margin-bottom: 24px; font-weight: bold; font-size: 20px; color: #111; }
          .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 24px 0; }
          .footer { margin-top: 32px; font-size: 12px; color: #999; border-top: 1px solid #eee; pt: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">${storeName}</div>
          <h2>Reset Your Password</h2>
          <p>Hi ${customerName},</p>
          <p>We received a request to reset the password for your account. Click the button below to choose a new password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email. The link will expire in 24 hours.</p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [customerEmail],
        subject: `Reset your password — ${storeName}`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Resend API error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Hook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
