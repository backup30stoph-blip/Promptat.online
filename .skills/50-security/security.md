# Security Policies
## GemiPrompts.store — Data Protection & Key Safety

> Part of the 50-security module. Enforced site-wide to prevent data leaks.

---

## 1. Row Level Security (RLS)

- **Strict Owner RLS Rules:** Junction tables (`bookmarks`, `likes`, `downloads_log`, `view_history`, `comments`) must enforce policies that check users' active login tokens (`auth.uid() = user_id`) on all modifications.
- **Admin Columns:** Profiles roles (e.g., `role = 'admin'`) must only be writable by highly gated database-level rules or security definer triggers. Never allow the client to update their own role directly.

---

## 2. API Key Safeguards

- **No Public API Secrets:** Third-party payment gateways, SMTP keys, or model API keys (like Gemini key) must reside exclusively server-side.
- **VITE_ Prefixes:** Do not prepend `VITE_` to server-side variables (which would accidentally compile them into client browser bundles). Only prefix public variables like the Supabase URL or Google Maps token.

---

## 3. Input Sanitization & XSS Prevention

- **Markdown Rendering:** When rendering Markdown logs or blog posts (`react-markdown`), apply strict HTML sanitizers to prevent cross-site scripting (XSS) via custom scripts or image overlays.
- **Monospace Displays:** Force plaintext outputs on all user-submitted prompt copy strings before pushing them to clipboard nodes.
