---
name: Clerk appearance cssLayerName requires explicit @layer declaration on Tailwind v4
description: Clerk's cssLayerName appearance option (Tailwind v4 projects) silently does nothing unless the CSS entry file declares the layer order first.
---

On Tailwind v4 (`@tailwindcss/vite` plugin), when passing `cssLayerName: "clerk"` in Clerk's `appearance` object, the project's main CSS file (e.g. `src/index.css`) must declare the layer order **before** importing Tailwind:

```css
@layer theme, base, clerk, components, utilities;
@import 'tailwindcss';
```

**Why:** Without the explicit `@layer` declaration establishing `clerk` in the cascade order, Clerk's injected styles under that layer name have no defined precedence relative to Tailwind's own layers — appearance overrides can be silently dropped or misordered depending on load order.

**How to apply:** Whenever wiring Clerk into a Tailwind v4 app (per the `clerk-auth` skill), check the project's global CSS file for this `@layer` line immediately before `@import 'tailwindcss'`. Add it if missing. This is separate from the `tailwindcss({ optimize: false })` vite plugin setting (also required for Clerk on Tailwind v4, but for prod build correctness rather than layer precedence).
