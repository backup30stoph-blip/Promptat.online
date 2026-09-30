import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    const email = record?.email
    const fullName = record?.raw_user_meta_data?.full_name || 'Creator Guest'

    if (!email) {
      throw new Error('No email found in webhook payload record')
    }

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not configured in Supabase Secrets')
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to GemiPrompts!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #fafafa; color: #1e293b; padding: 24px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .logo { font-size: 20px; font-weight: 800; color: #f43f5e; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; }
          h1 { font-size: 24px; font-weight: 900; margin-bottom: 16px; color: #0f172a; }
          p { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 16px; }
          .btn { display: inline-block; background-color: #f43f5e; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; margin: 16px 0; text-align: center; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">GemiPrompts</div>
          <h1>Welcome aboard, ${fullName}! 🚀</h1>
          <p>We are absolutely thrilled to welcome you to GemiPrompts — the ultimate workspace for pro prompt engineers, content creators, and developers.</p>
          <p>Your creator account is now fully active. You have unlocked access to custom prompt blueprints, curated Midjourney v6 seeds, advanced Cursor rules, and faceless video niches designed to speed up your AI production.</p>
          <p>Get started today by saving your favorite blueprints, exploring trending configurations, or personalizing your creator workspace.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://gemiprompts.store" class="btn">Explore Creative Blueprints</a>
          </div>
          <p>If you have any questions or need helper resources, simply reply to this email. Our support team is always ready to guide you.</p>
          <p>Happy prompting,<br>The GemiPrompts Team</p>
          <div class="footer">
            &copy; 2026 GemiPrompts. All rights reserved.<br>
            You received this welcome notification because you registered an account at GemiPrompts.store.
          </div>
        </div>
      </body>
      </html>
    `

    // Dispatch request to Resend REST API endpoint
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'GemiPrompts <welcome@resend.dev>',
        to: [email],
        subject: 'Welcome to GemiPrompts! Your Creator Workspace is Ready 🚀',
        html: htmlContent,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      throw new Error(resData?.message || 'Failed to dispatch email via Resend')
    }

    return new Response(JSON.stringify({ success: true, info: resData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
