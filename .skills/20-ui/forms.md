# UI Forms Guidance
## GemiPrompts.store — Inputs & Form Validation

> Part of the 20-ui module. Enforces standard form layouts, focus rings, and valid states.

---

## 1. Input Elements Anatomy

All text inputs, textareas, and select menus must follow a unified style scheme:

- **Borders:** `border border-slate-200 dark:border-slate-800`.
- **Focus Rings:** Use smooth, wide glows for focus indicators. Avoid standard 1px outline offsets:
  - Good: `focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500`
- **Paddings:** Comfortable standard sizing: `py-2 px-3 text-sm`.
- **Background:** `bg-slate-50 hover:bg-slate-100/60 dark:bg-slate-900 dark:hover:bg-slate-850/60`.

---

## 2. Validation & Zod Integration

- Use **React Hook Form** + **Zod** schema resolvers for all structured forms (newsletter submission, prompt submission, contact forms).
- **Inline Errors:** Render detailed error messages right below the input with high-contrast text: `text-xs font-semibold text-rose-500 dark:text-rose-400 mt-1`.
- **Submission Feedback:** Always show a clear loading indicator on the submit button (`disabled`, `opacity-75`, with loading spinner) to prevent multiple submissions.

---

## 3. Search Inputs

Global search and toolbar search boxes must remain highly reactive:
- **Search Icons:** Prefix icon (`Search` from `lucide-react`) positioned absolutely on the left with `pointer-events-none`.
- **Debouncing:** Always debounce local search inputs by `300ms` to prevent sluggish filter updates.
