# GemiPrompts Platform Architecture & Layout Specification
**Project Name:** Promptat Online (برومبتات أونلاين)
**Document Purpose:** Full-detailed Blueprint of Platform Options, Functions, Components, and Admin/User Dashboards.

---

## 1. General Concept & Architecture
"Promptat Online" is a high-fidelity Multilingual AI Prompt & Skill Publishing Platform. It connects high-resolution image prompts, developer directives, viral video scripts, and educational blog guidebooks under a unified, isolated, and SEO-optimized structure.

- **Primary Language:** Arabic (`ar` - default, RTL).
- **Secondary Languages (LTR):** English (`en`), French (`fr`), Spanish (`es`), Indonesian (`id`).
- **Core Technology Stack:** React 19 (SPA on Vite), Supabase (Database & Authentication), Express (Backend Helper APIs & Dynamic Redirection Middleware), Tailwind CSS (Utility Styling).

---

## 2. Directory & Routing Architecture
Clean directories with dynamic pathname parsing instead of legacy hashes:
- **Arabic (Default):** `https://promptat.online/[content-type]/[slug]`
- **English:** `https://promptat.online/en/[content-type]/[slug]`
- **French:** `https://promptat.online/fr/[content-type]/[slug]`
- **Spanish:** `https://promptat.online/es/[content-type]/[slug]`
- **Indonesian:** `https://promptat.online/id/[content-type]/[slug]`

---

## 3. Core Functions & Hooks

### A. Localization & Language Hook (`useActiveLanguage`)
- **Location:** `src/hooks/useActiveLanguage.ts`
- **Functionality:** Listens reactively to history pushState/replaceState and `popstate` events to extract and return the active language context directly from the URL path.
- **Benefits:** Prevents state-lag and cross-language content contamination.

### B. Dynamic Translation Function (`t()`)
- **Location:** `src/lib/i18n.ts`
- **Signature:** `t(key: string, lang: LanguageCode, fallback?: string): string`
- **Strict Isolation Policy:** No default language parameter is set to guarantee strict lookup without accidental fallbacks. Matches target dictionary first, falls back strictly to specified fallback string, and uses English dictionary as a last resort.

### C. Database Locale Filter (`databaseLocaleFilter`)
- **Location:** `src/utils/localeDatabase.ts`
- **Functionality:** Re-maps translation fields dynamically depending on the current locale (e.g. mapping `title_en` into `title`) and filters out other non-active translations from Supabase JSON payloads to secure memory consumption and keep rendering decoupled.

### D. Dynamic SEO Metadata Generator (`generateDynamicSeoMetadata`)
- **Location:** `src/utils/seoGenerator.ts`
- **Functionality:** Returns title, description, ogImage, canonicalUrl, and correct reciprocal `hreflang` alternate arrays based on `translation_group_id` for perfect crawler indexation.

---

## 4. Key UI Components

### A. Dynamic Layout Header & Navigation Drawer
- **Navbar (`src/components/layout/Navbar.tsx`):**
  - Displays localized menus dynamically built from `getNavigation(lang)`.
  - Sets global body direction (`rtl` / `ltr`) dynamically.
  - Combines search overlay, quick filter tags, and bookmarks count.
  - Hosts the **Globe Language Switcher** which queries translated counterpart slugs based on `translation_group_id` before redirecting.

- **MobileDrawer (`src/components/layout/MobileDrawer.tsx`):**
  - Fully responsive slide-in panel representing main directories, quick filters, and direct language checklist buttons.

- **Breadcrumbs (`src/components/layout/Breadcrumbs.tsx`):**
  - Renders schema-valid hierarchical breadcrumbs dynamically in the current language.

### B. Content Cards Grid
- **PromptCard (`src/components/cards/PromptCard.tsx`):** Displays image generator prompts (Midjourney, Flux, DALL-E) with quick actions (Copy Prompt, Favorite).
- **SkillCard (`src/components/cards/SkillCard.tsx`):** Focuses on developer instruction blocks (.cursorrules, Claude prompts).
- **VideoCard (`src/components/cards/VideoCard.tsx`):** Represents high-retention video blueprints, showing estimated RPM and competition.
- **BlogCard (`src/components/cards/BlogCard.tsx`):** Displays technical articles and guidebooks with read-time estimators.

---

## 5. Dashboards & Console Layout Design

### A. User Collection & settings Dashboard (`UserProfileModal.tsx`)
A sliding modal or central panel where registered creators manage and interact with their saved elements:
1. **Saved Collections Panel:**
   - Shows user-created folders (public/private).
   - Lists saved image prompts, developer skills, and viral video scripts.
2. **Account settings Tab:**
   - Localized fields to update display name, avatar, bio, and interface language.
3. **History Tab:**
   - Tracks the last 50 viewed items for easy access.

### B. Central Admin Console Layout (`src/pages/Admin.tsx`)
A robust sidebar-drawer-driven layout tailored for content management, SEO audits, and localization metrics:

1. **Sidebar Options Drawer (`AdminLayout.tsx`):**
   - **Dashboard Overview:** General metrics (Total items, views, copies, downloads).
   - **Manage Prompts / Skills / Videos / Blog:** Full tabular lists with creation/editing tools.
   - **Translation Manager Panel (`TranslationManager.tsx`):** Dedicated workflow to view translation status per language (Ar, En, Fr, Es, Id), filter missing translations, and run "Add Translation" triggers.
   - **International SEO Audit Panel (`InternationalSeoAdmin.tsx`):** Validates canonicals, reciprocity of hreflangs, indexability configurations, and logs 404 errors.

2. **Add/Edit Item Modal Options:**
   - Form fields grouped by: Primary Content (Title, base Prompt/Markdown), Technical metadata (Model, category, aspect ratio), and SEO Metadata (Focus keyword, custom Meta Description, robots).
   - **Add Translation Option:** Handles one-click copy of the original item, automatically inheriting the `translation_group_id`, requesting translated strings, generating a localized slug, and registering it as a connected entity.

---

## 6. Layout Design Wireframe (Google Stitch Layout Concept)

### Dashboard Grid Layout Scheme (12-Column Grid)
```
+-----------------------------------------------------------------------------------+
|                           NAVBAR (Sticky Header)                                  |
|  [Logo]   [Search Bar (Centered)]   [Quick News]   [Saved Icon]   [Lang Globe v]  |
+-----------------------------------------------------------------------------------+
|  [RTL/LTR Dynamic Body Layout]                                                    |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  |  Primary Sidebar Nav (3-Cols)       |  |  Content Area / Workspace (9-Cols) |  |
|  |  - Dashboard Overview               |  |                                    |  |
|  |  - Content Manager                  |  |  - High-impact Stats Cards (x4)    |  |
|  |  - Translation & Locale Manager     |  |  - Data Table / Live Editor View   |  |
|  |  - Int'l SEO / Hreflang Auditor     |  |  - SEO & Keyphrase Validator       |  |
|  |  - System & 404 Telemetry Logs     |  |                                    |  |
|  +-------------------------------------+  +------------------------------------+  |
+-----------------------------------------------------------------------------------+
```
