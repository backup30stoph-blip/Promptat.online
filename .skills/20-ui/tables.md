# UI Tables & Parameter Lists Guidance
## GemiPrompts.store — Data Tables & Parameters

> Part of the 20-ui module. Enforces grid data lists, monospace stats, and mobile horizontal overflows.

---

## 1. Parameters Tables Layouts

Found on single prompt views (`/prompts/:slug`) and video outlines:

- **Rows:** Alternate row background styles for high readability: `odd:bg-slate-50/50 even:bg-transparent dark:odd:bg-slate-900/30`.
- **Borders:** Subtle horizontal borders: `border-b border-slate-100 dark:border-slate-800`.
- **Padding:** Compact table padding: `px-4 py-2.5`.

---

## 2. Text Sizing & Monospace

- **Labels:** Column/parameter labels must be small and clear: `text-xs font-semibold text-slate-500 dark:text-slate-400`.
- **Values:** Values (like Seed, Aspect Ratio, Models) should be rendered in clean monospace text to distinguish technical specs: `font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-100/60 dark:bg-slate-800 px-1.5 py-0.5 rounded`.

---

## 3. Responsive Overflows

- **Scroll Wrappers:** Always wrap tables in a container supporting horizontal scrolls on narrow screen viewports: `w-full overflow-x-auto`. This prevents layout distortion or cell breaking on screens under 640px.
- **Header Locking:** Maintain table headers pinned statically above scroll bodies when list sizes are vertical.
