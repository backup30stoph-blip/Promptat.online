# UI Layout Layout Guidelines
## GemiPrompts.store — Grids & Container Rhythms

> Part of the 20-ui module. Controls spacing, responsive containers, and overall viewport architecture.

---

## 1. Global Viewports & Containers

- **Max Widths:** Use `w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` for primary pages to prevent layouts from stretching on ultra-wide screens.
- **Backgrounds:** Use high-quality, professional neutrals:
  - Light mode: `bg-slate-50` with containers on `bg-white`.
  - Dark mode: `bg-slate-950` with containers on `bg-slate-900`.
- **Brightness Contrast:** Maintain ≤7% contrast step in light mode and ≤12% in dark mode between page backgrounds and cards.

---

## 2. Navigations & Footers

- **Sticky Navbar:** Header is fixed/sticky (`sticky top-0 z-50`) with a thin border and blur backdrop filter (`backdrop-blur-md bg-white/90 dark:bg-slate-950/90`).
- **Footer Structure:** Includes multiple columns mapping directory categories, ending with a persistent Status Bar (`h-10 px-8 bg-slate-100 dark:bg-slate-900 border-t border-slate-200`) showcasing integration status, active system version, and server details.

---

## 3. Mathematical Spacing & Nested Radius

- **Radius Nesting Formula:** When a rounded container sits inside another, always calculate the inner corner radius mathematically:
  `Inner Radius = Outer Radius - Padding`
  Example: If outer container is `rounded-2xl` (16px) and padding is `p-4` (16px), the inner child corners should be sharp (`rounded-none`). If padding is `p-2` (8px), the inner child radius should be `rounded-lg` (8px).
- **Outer vs Inner Spacing:** Outer padding of a section must always be greater than or equal to the space between items: `Section Padding >= Gap Space`.
- **Paddings:** Button paddings should strictly match the golden formula: horizontal padding is exactly 2x vertical padding (e.g. `px-4 py-2`).
