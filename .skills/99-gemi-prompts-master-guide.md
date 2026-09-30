# GemiPrompts — Core System Architecture & Developer Blueprint

This master documentation provides an exhaustive overview of the GemiPrompts technical framework, visual design system, administrative dashboards, database schemas, and the newly integrated Supabase Deno Edge Functions + Resend email marketing pipeline.

---

## 1. Core Visual Identity & Design System

GemiPrompts is built on a custom design system optimized for creator workflow efficiency and high visual impact. It rejects generic templates in favor of a mathematically calibrated, eye-safe typographic and spatial layout.

### 🎨 Color Palette & Brightness Limits
The system utilizes a warm neutral foundation combined with energetic rose and slate accents to establish a premium dark/light layout.
*   **Base Canvas**: Off-white background with a calibrated `<5% HSB` warmth (`#FAF9F6` / `#FAFAFA`).
*   **Primary Neutrals**: Deep Slate (`#0F172A` / `#1E293B`) for high-contrast legible typography, preventing eye fatigue.
*   **Aesthetic Accents**: Vibrant Rose (`#F43F5E`) and warm Amber (`#D97706`) as focal colors for badges, button states, and tags.
*   **Nesting & Containers**: Container backgrounds adhere strictly to the **7% maximum brightness deviation rule** on light canvases to preserve flat depth without relying on generic shadows.
*   **Nested Border Radius Rule**: Mathematical alignment of corners:
    $$\text{Inner Radius} = \text{Outer Radius} - \text{Padding}$$
    This prevents visual "corner overlap" and maintains optical alignment.

### ✍️ Typography & Hierarchical Scaling
*   **Display / Headings**: Playfair Display / Plus Jakarta Sans.
*   **Body & UI Controls**: System UI paired with Plus Jakarta Sans. No all-caps for body prose; minimum 16px body text size with a relaxed $1.6$ line-height.
*   **No Multi-line Labels**: Text inside tags, pills, chips, tabs, and action buttons is strictly constrained to single-line labels (`white-space: nowrap`) to avoid unpolished wrapping bugs.

---

## 2. Full-Stack Tech Stack & Architecture

GemiPrompts is built on a lightning-fast, secure, full-stack React and Supabase serverless pipeline.

```
┌────────────────────────────────────────────────────────┐
│                     Vite + React                       │
│        (Tailwind CSS, Lucide Icons, Recharts)          │
└───────────────────────────┬────────────────────────────┘
                            │ (Client API Calls)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Supabase Backend                    │
│   (PostgreSQL DB, Row-Level Security, Database Webhooks)│
└───────────────────────────┬────────────────────────────┘
                            │ (Webhook Trigger)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Supabase Edge Functions                  │
│       (Deno Runtimes, secure JWT authorization)        │
└───────────────────────────┬────────────────────────────┘
                            │ (REST Email Dispatch)
                            ▼
┌────────────────────────────────────────────────────────┐
│                Resend Mailing Service                  │
│             (Onboarding & Newsletter API)              │
└────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Blueprint

The PostgreSQL database is fully structured and managed through Row Level Security (RLS) policies to protect data access.

### Core Tables & Types
```sql
-- 1. Prompts Table (visual and visual-text recipes)
CREATE TABLE public.prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  recipe_content text NOT NULL,
  category_id uuid REFERENCES public.categories(id),
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Skills Table (expert systems playbooks)
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  playbook_content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Blog Playbooks Table (curated SEO growth articles)
CREATE TABLE public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  seo_title text,
  seo_description text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Newsletter Subscribers Table (automatic email listing)
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Site Settings and SEO Registry Table
CREATE TABLE public.site_settings (
  id text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);
```

---

## 4. Features & Interactive Views

### ⚡ Client-Side Directory Filter Engine
The directory layout employs `useMemo` optimization to handle high-density client filtering smoothly without server roundtrips.
*   **Hardware Tag Pills**: Allows creators to instantly filter models based on hardware constraints (e.g., `8GB VRAM`, `16GB VRAM`, `CPU-Only`).
*   **Search Box**: Instantly filters titles, descriptions, and tag descriptors in real-time.
*   **Zero-State UI**: A gorgeous, empty state placeholder when no matching models or categories correspond to filters.

### 🎥 Creative Video Blueprints
An integrated video database displaying step-by-step video timelines and timelines corresponding to prompt tutorials (e.g., faceless video niches, short-form generation).

---

## 5. Unified Site Administrator Panel

The Admin page (`/src/pages/Admin.tsx`) is a command dashboard built to manage content, analytics, and server features.

### Content Manager Tabs
1.  **Prompts Dashboard**: Create, update, and drop generative prompt templates.
2.  **Categories Registry**: Manage visual taxonomies, colors, and badges.
3.  **Skills Repository**: Post system guidelines, Cursor rules, and developer recipes.
4.  **Videos Playlists**: Register new video tutorials, timestamps, and model dependencies.
5.  **Blogs Playbooks**: High-quality SEO-optimized playbooks markdown compiler.
6.  **Static Pages**: Edit custom pages such as Legal, FAQ, and Terms.
7.  **Media Library**: Upload and manage assets, images, and mock assets.

### Webmaster Site Settings Hub (`SiteSettingsAdmin.tsx`)
A dedicated dashboard split into multi-functional webmaster sections:
*   **General Settings**: Title, description, analytics tracking ID.
*   **Search Engines**: Meta verification IDs (Google Search Console, Bing Webmaster).
*   **Analytics & Tag Manager**: Configure Google Analytics and GTM script injection.
*   **Indexing & Crawler Configuration**: Manage `robots.txt` dynamic guidelines and automated sitemap XML compilation.
*   **Redirects Management**: Create instant `301` and `302` route rewrites dynamically to preserve PageRank.
*   **Crawler Performance & Security**: Manage HTTP security headers (CSP, HSTS, X-Frame-Options) and optimize crawler speed.
*   **404 Error Log**: Real-time logging of dead links to identify and apply redirects immediately.

---

## 6. Supabase Edge Functions + Resend Mailing Integration

We have implemented standard, serverless, full-stack Deno Edge Functions in Supabase integrated with the Resend mailing API to deliver both automated onboarding emails and newsletter digests.

### 🚀 Function A: Welcome Email Onboarding (`welcome-email`)
*   **Location**: `/supabase/functions/welcome-email/index.ts`
*   **Behavior**: Fired automatically on user registration via database webhooks.
*   **Trigger Mechanism**: Binds a PostgreSQL trigger function to the auth schema (`auth.users`) to seamlessly capture registrations and transmit them securely.

```sql
-- Trigger definition inside supabase_setup.sql
CREATE OR REPLACE FUNCTION public.send_welcome_email_webhook()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
  project_ref text := 'xfqlffxpbginaxbrxnvm'; -- Production Supabase reference
BEGIN
  payload := json_build_object(
    'record', json_build_object(
      'id', NEW.id,
      'email', NEW.email,
      'raw_user_meta_data', NEW.raw_user_meta_data
    )
  );
  
  -- Dispatches an asynchronous net.http_post call safely
  PERFORM net.http_post(
    url := 'https://' || project_ref || '.supabase.co/functions/v1/welcome-email',
    headers := jsonb_build_object(
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' || COALESCE(current_setting('request.jwt.claims', true)::json->>'role', 'anon')
    )::json,
    body := payload::text
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW; -- Ensures user auth signups never fail if mailing network is congested
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_signed_up
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.send_welcome_email_webhook();
```

### 📰 Function B: Weekly Newsletter Digest (`weekly-digest`)
*   **Location**: `/supabase/functions/weekly-digest/index.ts`
*   **Behavior**: Dynamically pulls active database records (latest Prompt recipe, Creator Skill playbook, and Blog page), maps all verified newsletter subscribers, drafts a beautiful high-density newsletter payload, and dispatches the email batch.
*   **Automated Scheduling**: Scheduled to run on a recurring cron task through Supabase's `pg_cron` extension:
    ```sql
    SELECT cron.schedule(
      'weekly-newsletter-digest-job',
      '0 9 * * 1', -- Runs every Monday at 9:00 AM UTC
      $$
        SELECT net.http_post(
          url := 'https://xfqlffxpbginaxbrxnvm.supabase.co/functions/v1/weekly-digest',
          headers := '{"Content-Type": "application/json"}'::jsonb
        );
      $$
    );
    ```

### 🎛️ Integration Dashboard Simulation Hub
To test and view email setups safely, we built the **Email & Resend Hub** directly into the Site Settings tab.
*   **Mock Sandbox and Real Mode**: If a Resend API Key is provided in the admin configuration field, it compiles actual HTML layouts and dispatches real emails. If empty, it runs in a robust Sandbox mock simulator, creating visual output records inside the main workspace notifications database.
*   **Interactive Simulation Console**: Outputs complete terminal logs in real-time, detailing JWT handshake states, API request/response structures, database fetches, and detailed debug logs.

---

## 7. Operational Deployment Guidelines

To deploy these Edge Functions on your Supabase Cloud account, execute the following commands in your local CLI terminal:

```bash
# 1. Store your Resend API secrets in your cloud-hosted environment
supabase secrets set RESEND_API_KEY=re_your_secret_api_key

# 2. Compile and push both serverless Edge Functions
supabase functions deploy welcome-email
supabase functions deploy weekly-digest
```

*This file acts as a permanent record of the GemiPrompts system architecture, guiding future feature development, API modifications, and team onboarding.*
