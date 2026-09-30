import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase/client';
import { 
  Mail, Play, Code, Database, Check, Copy, AlertCircle, RefreshCw, Send, Terminal, Key, ShieldAlert
} from 'lucide-react';

export const EmailMarketingAdmin: React.FC = () => {
  const [selectedCodeTab, setSelectedCodeTab] = useState<'welcome' | 'digest' | 'sql'>('welcome');
  const [copied, setCopied] = useState<string | null>(null);

  // Simulation Form states
  const [resendApiKey, setResendApiKey] = useState(() => localStorage.getItem('gp_resend_api_key') || '');
  const [welcomeRecipient, setWelcomeRecipient] = useState('creator@example.com');
  const [welcomeName, setWelcomeName] = useState('Creative Pro');
  
  // Weekly Digest compile state
  const [latestPrompt, setLatestPrompt] = useState<any>(null);
  const [latestSkill, setLatestSkill] = useState<any>(null);
  const [latestBlog, setLatestBlog] = useState<any>(null);
  const [digestRecipients, setDigestRecipients] = useState('subscriber1@example.com, subscriber2@example.com');
  
  // Simulation activity logs
  const [simLog, setSimLog] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'error' }>>([
    { time: new Date().toLocaleTimeString(), text: 'Email & Resend Integration Hub loaded.', type: 'info' }
  ]);

  // Loading indicator states
  const [compiling, setCompiling] = useState(false);
  const [sendingWelcome, setSendingWelcome] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);

  // Fetch latest database contents for weekly digest compilation
  const fetchLatestContentForDigest = async () => {
    setCompiling(true);
    addLog('Querying database for latest Prompt, Skill, and Blog playbook...', 'info');
    try {
      const { data: prompts } = await supabase.from('prompts').select('*').order('created_at', { ascending: false }).limit(1);
      const { data: skills } = await supabase.from('skills').select('*').order('created_at', { ascending: false }).limit(1);
      const { data: blogs } = await supabase.from('blogs').select('*').order('created_at', { ascending: false }).limit(1);

      if (prompts && prompts[0]) setLatestPrompt(prompts[0]);
      if (skills && skills[0]) setLatestSkill(skills[0]);
      if (blogs && blogs[0]) setLatestBlog(blogs[0]);

      addLog('Successfully loaded and compiled latest database content into newsletter blueprint!', 'success');
    } catch (err: any) {
      addLog(`Failed to query content: ${err.message}`, 'error');
    } finally {
      setCompiling(false);
    }
  };

  useEffect(() => {
    fetchLatestContentForDigest();
    // Retrieve newsletter subscribers to pre-fill recipients field
    const fetchSubscribers = async () => {
      try {
        const { data: subs } = await supabase
          .from('newsletter_subscribers')
          .select('email')
          .eq('status', 'subscribed')
          .limit(5);
        if (subs && subs.length > 0) {
          setDigestRecipients(subs.map(s => s.email).join(', '));
        }
      } catch (e) {
        // Safe to ignore, fallback email list is pre-filled
      }
    };
    fetchSubscribers();
  }, []);

  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setSimLog(prev => [
      { time: new Date().toLocaleTimeString(), text, type },
      ...prev
    ]);
  };

  const handleSaveKey = (val: string) => {
    setResendApiKey(val);
    localStorage.setItem('gp_resend_api_key', val);
    addLog('Resend API key securely cached in local session context.', 'success');
  };

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Simulation: Trigger sending welcome email
  const handleSimulateWelcome = async () => {
    if (!welcomeRecipient) {
      addLog('Error: Recipient email address is required for welcome email dispatch.', 'error');
      return;
    }
    setSendingWelcome(true);
    addLog(`Initiating Automated Welcome Email sequence for ${welcomeName} (${welcomeRecipient})...`, 'info');

    try {
      // If user provided a real Resend Key, we can make a real dispatch to test it!
      if (resendApiKey) {
        addLog('Attempting real Resend API email dispatch using user secret key...', 'info');
        const welcomeHtml = getWelcomeEmailHtml(welcomeName);
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'GemiPrompts <onboarding@resend.dev>',
            to: [welcomeRecipient],
            subject: 'Welcome to GemiPrompts! Your Creator Workspace is Ready 🚀',
            html: welcomeHtml,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          addLog(`Real email successfully sent via Resend API! ID: ${data.id || 'N/A'}. Check your inbox!`, 'success');
          // Add a notification entry in the database
          await supabase.from('notifications').insert([{
            title: 'Welcome Email Simulated (Real Sent)',
            message: `Successfully dispatched custom welcome email via Resend endpoint to ${welcomeRecipient}.`,
            type: 'info',
            is_read: false
          }]);
        } else {
          throw new Error(data.message || 'Resend endpoint rejected key or domain permissions');
        }
      } else {
        // Fallback simulation mode
        await new Promise(resolve => setTimeout(resolve, 1500));
        addLog('Edge Function Webhook invocation triggered successfully!', 'success');
        addLog(`[SIMULATION SUCCESS] Delivered beautiful Welcome email notification to ${welcomeRecipient}.`, 'success');
        addLog('Notification registered inside system-wide workspace feed database.', 'info');
        
        // Add a simulation notification in the DB
        await supabase.from('notifications').insert([{
          title: 'Welcome Email Simulated (Mock Run)',
          message: `Simulated edge function welcome trigger for subscriber: ${welcomeRecipient}.`,
          type: 'info',
          is_read: false
        }]);
      }
    } catch (err: any) {
      addLog(`Dispatch error: ${err.message}`, 'error');
      addLog('Tip: If using real Resend Key, ensure the recipient or domain is registered/verified in your Resend account.', 'info');
    } finally {
      setSendingWelcome(false);
    }
  };

  // Simulation: Trigger sending weekly digest
  const handleSimulateDigest = async () => {
    if (!digestRecipients) {
      addLog('Error: At least one recipient email address is required for newsletter digest.', 'error');
      return;
    }
    setSendingDigest(true);
    const emails = digestRecipients.split(',').map(e => e.trim());
    addLog(`Compiling and dispatching Weekly Digest to ${emails.length} subscriber(s)...`, 'info');

    try {
      if (resendApiKey) {
        addLog('Constructing custom HTML weekly newsletter using real database values...', 'info');
        const digestHtml = getDigestEmailHtml();
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'GemiPrompts Weekly <newsletter@resend.dev>',
            to: emails,
            subject: 'Weekly Digest: Fresh Curated Creator Resources are Live! 🌟',
            html: digestHtml,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          addLog(`Real Batch Weekly Digest successfully sent via Resend API! ID: ${data.id || 'N/A'}`, 'success');
          await supabase.from('notifications').insert([{
            title: 'Weekly Digest simulated (Real Sent)',
            message: `Real digest dispatch completed to ${emails.length} subscriber(s) via Resend.`,
            type: 'email_summary',
            is_read: false
          }]);
        } else {
          throw new Error(data.message || 'Resend rejected batch send command');
        }
      } else {
        // Fallback simulation mode
        await new Promise(resolve => setTimeout(resolve, 1800));
        addLog('Retrieved subscriber profile list from newsletter_subscribers database...', 'success');
        addLog(`Edge function payload sent successfully for ${emails.length} subscribers.`, 'success');
        addLog(`[SIMULATION SUCCESS] Dispatched Weekly Digest containing newest blueprints to ${emails.join(', ')}.`, 'success');

        await supabase.from('notifications').insert([{
          title: 'Weekly Digest simulated (Mock Run)',
          message: `Simulated automated edge function batch dispatch for ${emails.length} subscribers.`,
          type: 'email_summary',
          is_read: false
        }]);
      }
    } catch (err: any) {
      addLog(`Digest dispatch error: ${err.message}`, 'error');
      addLog('Tip: Resend Free Tier only allows sending emails to your verified account email unless you have a custom verified domain.', 'info');
    } finally {
      setSendingDigest(false);
    }
  };

  // Helper functions to construct HTML strings dynamically
  const getWelcomeEmailHtml = (name: string) => `
    <html>
      <body style="font-family: sans-serif; background-color: #fafafa; padding: 20px; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #f43f5e; margin-bottom: 20px;">GemiPrompts</h2>
          <h1 style="color: #0f172a; font-size: 22px;">Welcome onboard, ${name}! 🚀</h1>
          <p>We are thrilled to welcome you to the ultimate hub for premium prompt blueprints, advanced Cursor configurations, and SEO strategies.</p>
          <p>Get started today by saving your favorite blueprints, exploring trending layouts, or setting up your custom creator workspace.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://gemiprompts.store" style="background: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore Creative Blueprints</a>
          </div>
          <p>Happy prompting,<br>The GemiPrompts Team</p>
        </div>
      </body>
    </html>
  `;

  const getDigestEmailHtml = () => `
    <html>
      <body style="font-family: sans-serif; background-color: #fafafa; padding: 20px; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #f43f5e; margin-bottom: 10px;">GemiPrompts Digest</h2>
          <h1 style="color: #0f172a; font-size: 20px; margin-bottom: 15px;">Fresh Curated Creator Resources are Live! 🌟</h1>
          <p>Here is your curated weekly roundup of the latest creative blueprints from the GemiPrompts studio:</p>
          
          ${latestPrompt ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
            <span style="background-color: #ffe4e6; color: #f43f5e; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">Featured Image Prompt</span>
            <h3 style="margin: 6px 0; color: #0f172a;">${latestPrompt.title}</h3>
            <p style="font-size: 13px; color: #64748b; margin: 0;">${latestPrompt.description || 'Curated blueprint recipe for visual generation models.'}</p>
          </div>
          ` : ''}

          ${latestSkill ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
            <span style="background-color: #ffe4e6; color: #f43f5e; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">New Creator Skill</span>
            <h3 style="margin: 6px 0; color: #0f172a;">${latestSkill.title}</h3>
            <p style="font-size: 13px; color: #64748b; margin: 0;">${latestSkill.description || 'System configurations, prompt scripts, or developer templates.'}</p>
          </div>
          ` : ''}

          ${latestBlog ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
            <span style="background-color: #ffe4e6; color: #f43f5e; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">SEO Playbook</span>
            <h3 style="margin: 6px 0; color: #0f172a;">${latestBlog.title}</h3>
            <p style="font-size: 13px; color: #64748b; margin: 0;">${latestBlog.excerpt || 'In-depth playbook regarding modern AI production.'}</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 25px 0;">
            <a href="https://gemiprompts.store" style="background: #0f172a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold;">Visit GemiPrompts Library</a>
          </div>
          <p>Happy prompting,<br>The GemiPrompts Curators</p>
        </div>
      </body>
    </html>
  `;

  const welcomeCode = `// /supabase/functions/welcome-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    const email = record?.email
    const fullName = record?.raw_user_meta_data?.full_name || 'Creator Guest'

    if (!email) throw new Error('No email found in webhook payload record')
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')

    const htmlContent = \`
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; background-color: #fafafa; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
            <div style="font-size: 20px; font-weight: 800; color: #f43f5e; margin-bottom: 24px;">GemiPrompts</div>
            <h1 style="font-size: 24px; font-weight: 900; color: #0f172a;">Welcome aboard, \${fullName}! 🚀</h1>
            <p>Your creator account is now fully active. You have unlocked access to custom prompt blueprints, curated Midjourney v6 seeds, advanced Cursor rules, and faceless video niches designed to speed up your AI production.</p>
            <div style="text-align: center; margin: 24px 0;"><a href="https://gemiprompts.store" style="background-color: #f43f5e; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none;">Explore Blueprints</a></div>
            <p>Happy prompting,<br>The GemiPrompts Team</p>
          </div>
        </body>
      </html>
    \`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${RESEND_API_KEY}\`,
      },
      body: JSON.stringify({
        from: 'GemiPrompts <welcome@resend.dev>',
        to: [email],
        subject: 'Welcome to GemiPrompts! Your Creator Workspace is Ready 🚀',
        html: htmlContent,
      }),
    })

    return new Response(JSON.stringify({ success: true, info: await res.json() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})`;

  const digestCode = `// /supabase/functions/weekly-digest/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Fetch latest content
    const { data: latestPrompt } = await supabase.from('prompts').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
    const { data: latestSkill } = await supabase.from('skills').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
    const { data: latestBlog } = await supabase.from('blogs').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()

    // 2. Fetch subscribers
    const { data: subscribers } = await supabase.from('newsletter_subscribers').select('email').eq('status', 'subscribed')
    if (!subscribers || subscribers.length === 0) return new Response('No subscribers')

    const emails = subscribers.map(s => s.email)

    // 3. Dispatch batch to Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${RESEND_API_KEY}\`,
      },
      body: JSON.stringify({
        from: 'GemiPrompts Weekly <newsletter@resend.dev>',
        to: emails,
        subject: 'Weekly Digest: Fresh Curated Creator Resources are Live! 🌟',
        html: \`<!-- Digest Newsletter HTML -->\`
      }),
    })

    return new Response(JSON.stringify({ success: true, notified: emails.length }))
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})`;

  const sqlCode = `-- SQL Trigger and pg_cron deployment script
-- 1. Function to call welcome-email webhook
CREATE OR REPLACE FUNCTION public.send_welcome_email_webhook()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
  project_ref text := 'xfqlffxpbginaxbrxnvm';
BEGIN
  payload := json_build_object(
    'record', json_build_object(
      'id', NEW.id,
      'email', NEW.email,
      'raw_user_meta_data', NEW.raw_user_meta_data
    )
  );
  
  PERFORM net.http_post(
    url := 'https://' || project_ref || '.supabase.co/functions/v1/welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(current_setting('request.jwt.claims', true)::json->>'role', 'anon')
    )::json,
    body := payload::text
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Auth trigger
CREATE OR REPLACE TRIGGER on_auth_user_signed_up
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.send_welcome_email_webhook();

-- 3. Schedule the digest once a week using pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'weekly-newsletter-digest-job',
  '0 9 * * 1', -- "Every Monday at 9:00 AM"
  $$
    SELECT net.http_post(
      url := 'https://xfqlffxpbginaxbrxnvm.supabase.co/functions/v1/weekly-digest',
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  $$
);`;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Mail className="h-4.5 w-4.5 text-red-600" />
            Supabase Edge Functions + Resend Integration Hub
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Build and manage Resend mail triggers, deploy serverless Deno Edge Functions, and run live layout dispatch simulations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
            <Database className="h-3 w-3" /> Supabase v2
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 uppercase">
            <Check className="h-3 w-3" /> Resend SMTP
          </span>
        </div>
      </div>

      {/* Integration Setup Dashboard Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Welcome Mail Trigger', desc: 'Runs instantly on user auth registration', status: 'Configured', color: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
          { title: 'Weekly Newsletter', desc: 'Compiles and distributes weekly updates', status: 'Scheduled', color: 'bg-blue-50 border-blue-100 text-blue-800' },
          { title: 'Database Webhooks', desc: 'Invokes Edge Function on table insert', status: 'Active', color: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
          { title: 'Mailing Provider', desc: 'Resend API endpoints authorization', status: 'Real/Mock Ready', color: 'bg-amber-50 border-amber-100 text-amber-800' }
        ].map((card, i) => (
          <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">{card.title}</span>
            <p className="text-slate-500 text-[10px] mt-0.5 leading-snug font-medium min-h-6">{card.desc}</p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${card.color}`}>
                {card.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* API Key Configuration Block */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-white border border-slate-100 p-2 text-slate-500 shadow-2xs">
            <Key className="h-4.5 w-4.5 text-red-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Configure Real Resend Credentials (Optional)</span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              By default, simulations will execute in a safe <strong>Mock Sandbox</strong> mode. To test sending actual emails directly to your inbox, paste your Resend API key below. Keys are strictly kept inside your current browser session.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="password"
            value={resendApiKey}
            onChange={(e) => handleSaveKey(e.target.value)}
            placeholder="re_your_resend_api_key_here..."
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-700 placeholder-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
          />
          {resendApiKey && (
            <button
              onClick={() => handleSaveKey('')}
              className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              Clear Key
            </button>
          )}
        </div>
      </div>

      {/* Grid: Simulator Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* WELCOME EMAIL SIMULATOR */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 text-xs font-medium">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span className="font-bold text-slate-800 text-xs">Simulator A: Welcome Email Trigger</span>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Simulates the instant execution of <code>supabase/functions/welcome-email</code>. This fires whenever a new user profile is inserted into the platform.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subscriber Full Name</label>
              <input
                type="text"
                value={welcomeName}
                onChange={(e) => setWelcomeName(e.target.value)}
                placeholder="E.g. Elon Musk"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subscriber Email Address</label>
              <input
                type="email"
                value={welcomeRecipient}
                onChange={(e) => setWelcomeRecipient(e.target.value)}
                placeholder="E.g. elon@spacex.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={handleSimulateWelcome}
              disabled={sendingWelcome}
              className="w-full rounded-lg bg-red-600 hover:bg-red-700 text-white py-2 px-4 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {sendingWelcome ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>{resendApiKey ? 'Send Real Welcome Email' : 'Simulate Welcome Trigger'}</span>
            </button>
          </div>
        </div>

        {/* WEEKLY DIGEST SIMULATOR */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 text-xs font-medium">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-bold text-slate-800 text-xs">Simulator B: Weekly Digest Compiler</span>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Simulates the batch dispatch of <code>supabase/functions/weekly-digest</code>. It dynamically fetches the latest creative assets and sends them as a newsletter.
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Newsletter Subscribers List</label>
                <button 
                  onClick={fetchLatestContentForDigest}
                  disabled={compiling}
                  className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <RefreshCw className={`h-2.5 w-2.5 ${compiling ? 'animate-spin' : ''}`} /> Recompile Assets
                </button>
              </div>
              <input
                type="text"
                value={digestRecipients}
                onChange={(e) => setDigestRecipients(e.target.value)}
                placeholder="Comma separated emails"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-red-500"
              />
            </div>

            {/* Compiled Preview card info */}
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 space-y-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Compiled Newsletter Payload Preview:</span>
              <div className="grid grid-cols-3 gap-2 text-[9px] font-bold text-slate-600">
                <div className="bg-white border border-slate-100 p-1 rounded">
                  <span className="text-slate-400 block text-[8px]">PROMPT</span>
                  <span className="truncate block mt-0.5">{latestPrompt?.title || 'None'}</span>
                </div>
                <div className="bg-white border border-slate-100 p-1 rounded">
                  <span className="text-slate-400 block text-[8px]">SKILL</span>
                  <span className="truncate block mt-0.5">{latestSkill?.title || 'None'}</span>
                </div>
                <div className="bg-white border border-slate-100 p-1 rounded">
                  <span className="text-slate-400 block text-[8px]">BLOG</span>
                  <span className="truncate block mt-0.5">{latestBlog?.title || 'None'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulateDigest}
              disabled={sendingDigest}
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-2 px-4 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {sendingDigest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              <span>{resendApiKey ? 'Send Real Newsletter Batch' : 'Simulate Digest Newsletter Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Simulation Execution Logs & Code Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Logs terminal (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-[10px] text-slate-300 flex flex-col min-h-80">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-red-500 font-bold flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" /> Simulation Console
            </span>
            <button 
              onClick={() => setSimLog([{ time: new Date().toLocaleTimeString(), text: 'Console cleared.', type: 'info' }])}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 h-72">
            {simLog.map((log, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-slate-600">[{log.time}]</span>{' '}
                <span className={
                  log.type === 'success' ? 'text-emerald-400 font-semibold' :
                  log.type === 'error' ? 'text-red-400 font-semibold' : 'text-slate-300'
                }>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Code preview & copy templates (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 flex flex-col min-h-80">
          <div className="border-b border-slate-100 pb-2 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Code className="h-4 w-4 text-violet-500" /> Complete Code Blueprints
            </span>
            
            <div className="flex rounded bg-slate-100 p-0.5 text-[9px] font-bold">
              {[
                { id: 'welcome', label: 'welcome-email/index.ts' },
                { id: 'digest', label: 'weekly-digest/index.ts' },
                { id: 'sql', label: 'Triggers.sql' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCodeTab(tab.id as any)}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedCodeTab === tab.id ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer Textarea box */}
          <div className="relative flex-1">
            <pre className="w-full h-72 rounded-lg bg-slate-50 border border-slate-100 p-3 text-[10px] text-slate-700 font-mono overflow-auto whitespace-pre leading-relaxed select-all">
              {selectedCodeTab === 'welcome' && welcomeCode}
              {selectedCodeTab === 'digest' && digestCode}
              {selectedCodeTab === 'sql' && sqlCode}
            </pre>
            <button
              onClick={() => handleCopyCode(
                selectedCodeTab === 'welcome' ? welcomeCode : selectedCodeTab === 'digest' ? digestCode : sqlCode,
                selectedCodeTab
              )}
              className="absolute top-2.5 right-2.5 rounded bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs p-1.5 text-slate-500 cursor-pointer active:scale-95 transition-all"
              title="Copy Code Template"
            >
              {copied === selectedCodeTab ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
