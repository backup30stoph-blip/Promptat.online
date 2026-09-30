# UI Dialogs & Modals Guidance
## GemiPrompts.store — Popups & Overlays

> Part of the 20-ui module. Enforces backdrop overlays, close triggers, and entry animations.

---

## 1. Backdrop Overlays

Modals are high-focus elements that overlay the workspace:
- **Overlay Style:** Must use dark translucent overlays with backdrop blurs: `fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm`.
- **Entrance Transition:** The backdrop should fade in while the modal content scales up gently:
  - Good: Framer Motion using `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}`.

---

## 2. Close Operations

Every modal dialog must support three simple close triggers:
1. **Click Outside:** Clicking the backdrop outside the modal card bounds must trigger a close handler.
2. **Keyboard Esc:** Mounting a global event listener listening for the `Escape` key to close.
3. **Dedicated Close Button:** A clean close button in the top right corner: `absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300`.

---

## 3. Scope & Authentication Modals

- Auth trigger flows (likes, downloads, bookmark/save) must open an elegant inline modal directly over the current workspace rather than redirecting the user to a standalone login page. This guarantees high retention rates and keeps the user's focus on their current page state.
