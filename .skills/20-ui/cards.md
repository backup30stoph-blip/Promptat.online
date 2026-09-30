# UI Cards Guidance
## GemiPrompts.store — Component Cards Blueprint

> Part of the 20-ui module. Enforces card shapes, sizing, colors, and layout rhythm.

---

## 1. Cards Foundations

Every card in the platform represents an item in our catalog. Cards must feel tactile, highly polished, and premium.

- **Border Radius:** Always use `rounded-2xl` on cards.
- **Borders:** Thin, high-contrast borders: `border border-slate-200/80` (light) and `dark:border-slate-800` (dark).
- **Shadows & Hover Lift:** Cards must have a subtle entry shadow. On hover, apply a soft lift: `hover:-translate-y-1 hover:shadow-lg transition-all duration-300`.
- **Card Padding:** Outer padding must be exactly `p-4` or `p-5`.

---

## 2. Image Ratio & Placeholders

To prevent Cumulative Layout Shift (CLS), images must use aspect-ratio boxes:
- **PromptCard & SkillCard:** `aspect-square` or `aspect-[4/3]`.
- **VideoCard & BlogCard:** `aspect-[16/9]`.
- **Placeholders:** Always render a blur or a loading skeleton with matching aspect ratio while loading cover images.

---

## 3. Accent Color Tokens (Per Content Type)

Each content domain features a distinctive accent color for badges, indicators, and icons:

- **Image Prompts:** Violet (`bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300`)
- **Skills Library:** Emerald (`bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300`)
- **Video Concepts:** Amber (`bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300`)
- **Blog Articles:** Sky (`bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300`)

---

## 4. Interactive Quick Actions

Cards are not passive displays; they must support rapid workflows directly:
- **Copy Actions:** Include a direct clipboard copy button (with a checkmark success feedback state) on the card itself so users don't have to navigate to copy.
- **Bookmark / Favorite Actions:** A quick save icon button (optimistic update state) with smooth transitions.
- **Single Line Labels:** All text badges must fit on a single line with `white-space: nowrap` and elegant padding.
