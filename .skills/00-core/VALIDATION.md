# Code Validation & Quality Checklist
## GemiPrompts.store — Verification Guidelines

> Part of the 00-core module. Every agent turn must check code against these validation rules.

---

## 1. Directory & File Alignment

- Verify that all newly created components reside in the proper folder under `/src/components/` or `/src/pages/`.
- Ensure no files introduce duplicate code or duplicate components (e.g., repeating Card elements instead of reusing the card components).
- Ensure `package.json` retains its standard start and build scripts without breaking server configurations.

---

## 2. Compile & Lint Verification

- **Lint Check:** Run `npm run lint` or call `lint_applet` after any batch of code edits. No warning or error should be left unhandled.
- **Build Verification:** Run `npm run build` or call `compile_applet` before finishing the task. Verify that the application compiles perfectly with zero warnings.

---

## 3. UI/UX Integrity Checks

- **Responsive Viewports:** Check mobile layouts (375px), tablet layouts (768px), and desktop viewports (1024px+). No text wrapping defects in button/pill containers.
- **Touch Targets:** Buttons and interactive touch-targets on mobile viewports must be at least 44px in size.
- **Contrast & Contrast AA:** Gray text on colored backgrounds is banned. Text contrast must always pass WCAG AA (4.5:1 ratio).
- **Infinite Scrolling & Skeletons:** Skeletons must match the dimensions of cards perfectly to avoid content jumps (CLS).

---

## 4. Performance & API Best Practices

- **Lazy Initialization:** SDKs (Stripe, Firebase/Supabase, external APIs) must not crash during module load time. Check key existence gracefully before establishing client instances.
- **Client-Side Generation:** For downloadable items (like markdown, text files), generate files dynamically in the browser instead of loading static servers.
