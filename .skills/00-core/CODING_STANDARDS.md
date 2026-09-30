# Coding Standards
## GemiPrompts.store — Coding Rules & Guidelines

> Part of the 00-core module. Enforced on all code contributions.

---

## 1. Language & Type Safety (TypeScript)

- **Strict Mode:** Always write type-safe code. Avoid the use of `any` or `unknown` unless absolutely necessary (with type guards).
- **Import Statements:** Always use named imports. Place them at the very top of the file.
- **Enums:** Use standard `enum` declarations instead of `const enum` to avoid runtime compilation issues.
- **Type Definitions:** Keep types defined in `/src/types.ts` for domain structures, or locally if specific to a single component.

---

## 2. React Components

- **Functional Architecture:** Use functional components with hooks only. Class components are strictly prohibited unless for React Error Boundaries.
- **Modularization:** Do not build monolith files. Extract sub-components into `src/components/` and separate business logic into custom hooks.
- **Component Anatomy:**
  1. Imports (third-party, custom hooks, components, styles/types)
  2. Local Interfaces/Types
  3. Main Component declaration
  4. React Hooks (State, Effects, Context, Refs, TanStack Query)
  5. Derived variables / event handlers
  6. Return JSX expression (highly readable and well-grouped)

---

## 3. Styling & Presentation (Tailwind CSS v4)

- **Tailwind Only:** No inline styles, CSS files, or CSS-in-JS libraries.
- **Responsive Layouts:** Always design with responsiveness in mind (`sm:`, `md:`, `lg:`, `xl:` modifiers).
- **Aesthetic Excellence:** Adhere to the "Anti-Slop" rules. Maintain balanced margins, clean paddings, mathematical typography, and high-contrast color choices.
- **Transitions & Animations:** Use `framer-motion` for transitions. Avoid native animations unless styled strictly with Tailwind transitions.

---

## 4. State Management & Hooks

- **TanStack Query (React Query):** Use for all remote/async state.
- **React Context:** Use only for lightweight global states like user auth, active tab routing, and notifications.
- **Local State:** Use `useState` for UI states (toggles, accordions, loading state).
- **Infinite Re-renders prevention:** Never change state inside the render path. Keep dependency arrays clean and use primitive values where possible.
