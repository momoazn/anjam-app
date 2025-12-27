# Design System Refactor Plan (Tailwind + shadcn)

This plan fixes the current “edit every file” pain by centralizing tokens, recipes, and guardrails in a way that matches shadcn best practices (CSS variables + registry style + custom utilities).

## Pain Points → What Must Become “1-File Changes”

- **Change primary/foreground/background colors** → update CSS vars in one place, all components inherit.
- **Change border radius across app** → update `--radius` (and derived radii) once, all `ui/*` and recipes update.
- **Change spacing/density (card padding, section padding, header height)** → update recipe defaults (`Surface`, `Section`, `Toolbar`) and/or spacing tokens once.
- **Change typography scale/weights** → update base layer (`@layer base`) + font vars once.
- **Change motion/hover behavior** → update shared motion utilities/vars once; remove per-component transition strings.
- **Stop per-page “special” implementations** → wrap recurring patterns (background grids, hero sections, metric rows, page headers) into recipes/components so only the recipe changes.

## Objectives

- Single source of truth for theme (light/dark), spacing, radius, motion, typography.
- Token-driven shadcn primitives so changes propagate without per-file edits.
- Reusable section/surface/hero/toolbar patterns to kill layout duplication.
- Guardrails to block raw colors/radii and enforce token/utility usage.

## Current Constraints (Repo Reality)

- This repo is on **Tailwind v4 (CSS-first)**: tokens and theming already live in `src/index.css` via `@theme inline`, plus `@layer base` and `@layer utilities`.
- shadcn’s Tailwind layer is imported via `@import "shadcn/tailwind.css";`. Our plan must build on top of that (not fight it).

## Principles (shadcn-aligned)

- **Theme via CSS vars**: All colors/radii/spacing/motion exposed as CSS variables consumed by shadcn components.
- **Custom style registry**: Treat our design layer as a custom shadcn style (extends:none) so future `shadcn add` stays consistent.
- **Override centrally**: Use registryDependencies-style overrides (button, card, input) instead of ad-hoc tweaks.
- **Custom utilities**: Ship motion/spacing/interaction helpers as Tailwind utilities, not scattered class strings.
- **Slots + variants**: Keep `data-slot` hooks and cva/variant patterns for predictable theming.

## Deliverables

- `src/design/tokens.json` (authoritative) + `src/design/tokens.ts` (auto-generated) + CSS vars emitted into `src/index.css`.
- Tailwind v4 utilities for tokens (spacing, radius, motion) and interaction helpers (implemented in CSS via `@layer utilities` and/or `@utility`; plugin optional).
- Refactored shadcn primitives (`ui/*`) to use vars/slots; reduced hard-coded radii/spacing.
- Recipe layer components (`Surface`, `Section`, `Toolbar`, `PageHeader`, `StatCard`, `PatternBackground`) built on shadcn primitives.
- ESLint rule(s) to forbid raw colors/radii and unregistered `bg-[…]`/`rounded-…`/`duration-…` outside the tokens/util layer (with opt-out comment).
- A migration checklist covering **all** `src/pages/**` and `src/components/**` usage, with clear “done” criteria per file.
- Migration guide + design docs; Storybook-style showroom optional.
- CI check/report for token violations.

## Repository Coverage (All Pages & Components)

This plan only solves the “manual edits everywhere” problem if we migrate and enforce **everything**, not just a few screens.

Scope definition (must be covered):

- **All pages**: `src/pages/**` (including nested pages like `src/pages/settings/**` and `src/pages/organizations/**`)
- **All components**: `src/components/**` (including feature folders and `src/components/ui/**`)
- Optional but recommended: any additional app UIs under other roots (e.g. `redesign/**`) if they ship to users.

File-level “done” criteria (applies to every page/component in scope):

- Uses shadcn primitives and/or our recipes for surfaces/sections/typography instead of bespoke wrapper div stacks.
- No raw theme colors (hex/oklch literals) except in whitelisted “visual blocks” (e.g., a single `LandingBackground`).
- No scattered core radii/spacing/motion knobs in-line for shared patterns (they must be routed through tokens/recipes).
- If a file needs an exception, it uses `// design-token-ignore` with a short reason.

## Workstreams & Steps

1. **Token source of truth**
   - Create `src/design/tokens.json` for colors (light/dark), radius, spacing, typography, motion.
   - Generate `tokens.ts` (typed export) and inject vars into `index.css` (light/dark scopes).
   - Map tokens into Tailwind v4 via `@theme inline` so utilities resolve to our tokens (no JS config required unless we need advanced extensions).

2. **Utilities & plugin**
   - Add app-wide utilities in `@layer utilities` (and/or Tailwind v4 `@utility`) for interaction/motion (spring transitions, hover states, stagger).
   - Expose design helpers as classes (`ds-surface`, `ds-section`, `ds-hero-bg`, `ds-grid`, etc.) so pages stop embedding long class strings.

3. **Refit shadcn primitives**
   - Update `ui/button`, `card`, `input`, `sheet`, `dialog`, `tooltip`, `breadcrumb`, `sidebar` to consume CSS vars for radius/spacing/shadows/motion.
   - Ensure `data-slot` attributes exist for theme overrides; keep variants minimal and token-driven.
   - Remove duplicated `designTokens` map (or sync it to generated tokens).

4. **Recipe components**
   - Build tokenized primitives: `Surface` (elevations/borders), `Section` (max-width + padding presets), `Toolbar/PageHeader` (actions + breadcrumbs), `StatCard`, `PatternBackground`.
   - Provide cva/variant APIs (density, tone, emphasis) and doc their usage.
   - Replace bespoke patterns in header/landing/dashboard with recipes (incremental).

5. **Guardrails**
   - ESLint rule to block raw hex/oklch, `bg-[…]` gradients, `rounded-*`, `duration-*` outside `src/design` and `tailwind.config`.
   - Add lint script + CI check; allow `// design-token-ignore` escapes.

6. **Migration & rollout**
   - Create `docs/design-system-migration.md` as a checklist generated from the repo inventory:
     - List every file under `src/pages/**` and `src/components/**`.
     - Track status (`todo`, `in-progress`, `done`) + notes/exceptions per file.
   - Pass 1: shell components (`site-header`, nav, layout surfaces) to recipes.
   - Pass 2: high-traffic pages (dashboard cards, landing sections) to recipes/utilities.
   - Pass 3: forms/tables modals (reuse Surface/Section and refit inputs).
   - Pass 4: long tail (remaining pages/components) until the checklist is complete.
   - Track TODOs with an owner + checklist; avoid visual churn by keeping tokens stable during refactors.
   - Enforce “new code stays clean”: add lint rules early, but allow temporary opt-outs while migrating; remove opt-outs as files reach `done`.

7. **Docs & DX**
   - Add `docs/design-system.md` (tokens, recipes, do/don’t, how to add shadcn components with the custom style).
   - Optional: Storybook or gallery page showing components with token switches.
   - PR checklist: “Uses recipes,” “No raw colors/radius,” “Slots intact.”

8. **Testing/QA**
   - Run `bun run check` after refactors.
   - Add light smoke snapshot tests for recipes (render + class expectations).
   - Consider minimal visual regression on key pages once stable.

## “Will This Actually Fix It?” Checklist

This plan resolves the pain only if these conditions become true:

- Most UI is composed from **shadcn primitives + our recipes**, not raw Tailwind blocks.
- The common “edit one thing everywhere” knobs are **not hard-coded** in components:
  - radius (no scattered `rounded-2xl` for core surfaces/buttons)
  - spacing/density (no scattered `p-6`/`px-6` for core surfaces/sections)
  - motion (no scattered `duration-1000`/custom easings for core interactions)
  - colors (no scattered hex/OKLCH literals for UI surfaces; gradients wrapped in recipe components)
- Guardrails prevent backsliding (lint/CI).

If we only add tokens but do not migrate components/pages to recipes, the pain persists.

## Risks & Mitigations

- **Drift between CSS vars and TS tokens** → generate TS + CSS from one JSON.
- **Lint false positives** → allow scoped ignores; iterate thresholds.
- **Migration churn** → do phased rollout and keep tokens stable until coverage is high.
- **One-off marketing visuals** → isolate them into a small set of “blocks” (e.g., `LandingBackground`, `HeroSection`) so changes stay centralized.

## Success Criteria

- Changing a token (radius, spacing, primary color, motion curve) updates all shadcn primitives and recipes without per-file edits.
- New pages compose from recipes/utilities with zero raw colors/radii.
- Lint/CI fails on manual token violations.
