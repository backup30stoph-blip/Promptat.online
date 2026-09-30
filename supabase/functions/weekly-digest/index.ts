import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

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
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY environment variable is not configured')
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase project configuration keys (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY) are missing')
    }

    // Initialize Supabase Client with service-role privileges to override RLS and list newsletter subscribers safely
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Fetch latest newly added assets for weekly digest compilation
    const { data: latestPrompt } = await supabase.from('prompts').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
    const { data: latestSkill } = await supabase.from('skills').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
    const { data: latestBlog } = await supabase.from('blogs').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()

    // 2. Fetch all active newsletter subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('status', 'subscribed')

    if (subError) throw subError
    
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No active subscribers to notify.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const emails = subscribers.map(s => s.email)

    // 3. Draft the beautiful weekly digest newsletter body
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>GemiPrompts Weekly Digest</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #fafafa; color: #1e293b; padding: 24px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .logo { font-size: 18px; font-weight: 800; color: #f43f5e; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }
          h1 { font-size: 22px; font-weight: 900; margin-bottom: 12px; color: #0f172a; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 16px; }
          .item-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
          .item-badge { display: inline-block; background-color: #ffe4e6; color: #f43f5e; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px; text-transform: uppercase; }
          .item-title { font-size: 16px; font-weight: bold; color: #0f172a; margin: 4px 0; }
          .item-desc { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0; }
          .btn { display: inline-block; background-color: #f43f5e; color: #ffffff !important; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; margin-top: 10px; font-size: 13px; text-align: center; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">GemiPrompts Digest</div>
          <h1>Fresh Creator Blueprints are Live! 🌟</h1>
          <p>Hi there! Here is your curated weekly roundup of the latest creative blueprints, custom playbooks, and prompt engineering resources from the GemiPrompts studio:</p>

          ${latestPrompt ? `
          <div class="item-card">
            <span class="item-badge">Featured Image Prompt</span>
            <div class="item-title">${latestPrompt.title}</div>
            <p class="item-desc">${latestPrompt.description || 'Step-by-step premium prompt recipe for visual generation models.'}</p>
            <div style="margin-top: 8px;"><a href="https://gemiprompts.store/prompts" class="btn">View Prompt Recipe</a></div>
          </div>
          ` : ''}

          ${latestSkill ? `
          <div class="item-card">
            <span class="item-badge">New Creator Skill</span>
            <div class="item-title">${latestSkill.title}</div>
            <p class="item-desc">${latestSkill.description || 'System configurations, prompt scripts, or developer templates.'}</p>
            <div style="margin-top: 8px;"><a href="https://gemiprompts.store/skills" class="btn">Learn Core Skill</a></div>
          </div>
          ` : ''}

          ${latestBlog ? `
          <div class="item-card">
            <span class="item-badge">SEO Playbook</span>
            <div class="item-title">${latestBlog.title}</div>
            <p class="item-desc">${latestBlog.excerpt || 'In-depth playbook regarding modern AI production strategies.'}</p>
            <div style="margin-top: 8px;"><a href="https://gemiprompts.store/blog" class="btn">Read Playbook</a></div>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://gemiprompts.store" class="btn" style="background-color: #0f172a; padding: 12px 30px; border-radius: 8px;">Visit Full GemiPrompts Library</a>
          </div>

          <p>Keep building and shaping amazing outputs. We add new premium blueprints and custom developer scripts every week!</p>
          <p>Best wishes,<br>The GemiPrompts Curators Team</p>

          <div class="footer">
            &copy; 2026 GemiPrompts. All rights reserved.<br>
            You subscribed to GemiPrompts weekly digests. If you wish to stop receiving these, you can unsubscribe at any time.
          </div>
        </div>
      </body>
      </html>
    `

    // Dispatch batch to Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'GemiPrompts Weekly <newsletter@resend.dev>',
        to: emails,
        subject: 'Weekly Digest: Fresh Curated Creator Resources are Live! 🌟',
        html: htmlContent,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      throw new Error(resData?.message || 'Failed to dispatch email batch via Resend')
    }

    // Insert an automated log notification into database
    await supabase.from('notifications').insert({
      title: 'Weekly Digest Newsletter Dispatched',
      message: `Automatically triggered weekly newsletter email summary sent via Resend to ${emails.length} subscriber(s).`,
      type: 'email_summary',
      is_read: false
    })

    return new Response(JSON.stringify({ success: true, subscribersNotified: emails.length, info: resData }), {
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
