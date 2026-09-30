# Supabase Edge Functions + Resend Integration Guide

This directory contains the production-ready code files for sending automated welcome emails and weekly digests using **Supabase Edge Functions** and the **Resend Mailing Service**.

---

## 📂 Function Layout

- `/supabase/functions/welcome-email/index.ts`: Triggered automatically on user signups to deliver a personalized visual welcome card.
- `/supabase/functions/weekly-digest/index.ts`: Gathers the latest Prompts, Creator Skills, and Blogs, fetches subscriber list, and dispatches weekly HTML newsletters.

---

## 🛠️ Step-by-Step Deployment Instructions

### 1. Set up Supabase Secrets & Environment Keys
Securely inject your **Resend API Key** into your cloud-hosted Supabase dashboard so the Edge Functions can authenticat with the Resend mailing endpoints.

Run the following command in your terminal containing the Supabase CLI:
```bash
supabase secrets set RESEND_API_KEY=re_your_secret_resend_api_key
```

### 2. Deploy your Functions to the Supabase Cloud
Compile and deploy the Edge Functions into your live Supabase project environment:
```bash
supabase functions deploy welcome-email
supabase functions deploy weekly-digest
```

### 3. Set up the Database Trigger for Welcoming New Users
To automatically dispatch a welcome email when a user registers, execute the following SQL in your **Supabase Dashboard SQL Editor**:

```sql
-- Create an asynchronous webhook trigger function
create or replace function public.send_welcome_email_webhook()
returns trigger as $$
declare
  payload json;
begin
  payload := json_build_object(
    'record', json_build_object(
      'id', new.id,
      'email', new.email,
      'raw_user_meta_data', new.raw_user_meta_data
    )
  );
  
  -- Invoke the welcome-email edge function securely 
  -- Replace <project-ref> with your actual Supabase Project Reference ID
  perform net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.jwt.claims', true)::json->>'role'
    )::json,
    body := payload::text
  );
  
  return new;
exception
  when others then
    -- Fail-safe so signups never fail if email server is down
    return new;
end;
$$ language plpgsql security definer;

-- Bind the trigger to auth.users insertion
create or replace trigger on_auth_user_signed_up
  after insert on auth.users
  for each row execute procedure public.send_welcome_email_webhook();
```

---

## 📊 Scheduling Weekly Newsletter Digests
To automatically dispatch the newsletter digest once a week, you can schedule a cron task using Supabase's `pg_cron` extension:

```sql
-- Enable the pg_cron extension if not active
create extension if not exists pg_cron;

-- Schedule the weekly-digest edge function to run every Monday at 9:00 AM UTC
-- Replace <project-ref> and <anon-key> with your project details
select cron.schedule(
  'weekly-newsletter-digest-job',
  '0 9 * * 1', -- "At 09:00 on Monday"
  $$
    select net.http_post(
      url := 'https://<project-ref>.supabase.co/functions/v1/weekly-digest',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer <anon-key>"}'::jsonb
    );
  $$
);
```
