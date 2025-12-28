# Design System Refactor Plan (Tailwind + shadcn)

> Update (2025-12): This plan is primitives-first: reuse shadcn components and Tailwind scale values (`p-6`, `rounded-xl`, `h-12`) instead of introducing a separate token system.

This plan fixes the current "edit every file" pain by centralizing primitives, recipes, and guardrails in a way that matches shadcn best practices (CSS variables + registry style + custom utilities).

## Problem Statement: The Current Pain (Validated)

**Status**: The Anjam app has built a professional, well-structured design system on Tailwind v4 + shadcn/ui with:

- 60+ UI components with CVA variants and data-slot patterns
- Sophisticated CSS variable system for theming (light/dark)
- Custom utilities for animations, patterns, and interactions
- RTL support and spring physics animations

**But**: The primitives and recipes are **not fully enforced**, causing scattered hardcoded styling across 40+ pages/components. This means **every small UI change requires manual edits in 5-20 files**.

### Concrete Examples of the Pain

| Pattern                    | Found In                                       | Current Issue                                                                                               | Change Cost                                                |
| -------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Hero headers**           | Projects, Tasks, MyTasks (3+ files)            | Icon box: `bg-primary/10 text-primary flex size-16...rounded-2xl` hardcoded                                 | Change rounded-2xl → rounded-xl: 5+ files                  |
| **Stat/Metric cards**      | Dashboard, Projects, ProjectList (3+ files)    | Label: `text-muted-foreground/60 text-[10px] font-bold tracking-tight` duplicated                           | Change label color or size: 3+ files                       |
| **Icon boxes**             | 15+ locations across dashboard/cards           | Sizes: `size-16`, `size-12`, `size-4` mixed with radii `rounded-2xl`, `rounded-lg`, `rounded-md`            | Standardize icon boxes: 15+ files                          |
| **Form fields**            | All forms (10+ files)                          | Input: `h-9 rounded-xl border bg-white font-medium shadow-sm focus-visible:ring-1` duplicated in every form | Change input height h-9→h-10: 10+ files                    |
| **Card dividers**          | ProjectList, Charts, Dashboard (10+ locations) | Border: `border-border/40` with varying padding `p-6`/`p-1.5`                                               | Change divider opacity: 10+ locations                      |
| **Progress metrics**       | ProjectsWidget, ProjectListGroup               | Values already conflicting: `text-2xl` vs `text-3xl`                                                        | Standardize metric sizes: 2+ files with existing conflicts |
| **Toolbars/button groups** | TaskHeader, MyTasks (3+ files)                 | Heights: `h-12` vs `h-11` vs `h-14` with inconsistent padding                                               | Standardize button heights: 3+ files                       |
| **Empty states**           | UI component + ChartsWidget overrides          | Padding: `py-16` vs `py-20` with icon `size-16` vs `size-14`                                                | Standardize empty state: 2+ files                          |

**Critical Finding**: Changing border-radius from `rounded-2xl` to `rounded-xl` globally requires edits in **20+ files** across dashboard hero headers, pages, components, form inputs, card sections, and all shadcn primitives.

## Pain Points → What Must Become "1-File Changes"

- **Change primary/foreground/background colors** → update CSS vars in one place, all components inherit. ✅ (Tokens exist but not fully enforced)
- **Change border radius across app** → update `--radius` once, all `rounded-*` utilities inherit without editing 20+ files. ❌ (Currently `rounded-2xl`, `rounded-xl` scattered everywhere)
- **Change icon box size/styling** → update 1 recipe component, not 15+ locations. ❌ (Currently `size-16`, `size-12`, `size-4` mixed)
- **Change form input height** → update input component + Field recipe, not 10+ files. ❌ (Currently `h-9 rounded-xl` duplicated)
- **Change metric card labels** → update 1 recipe, not 3+ files. ❌ (Currently `text-muted-foreground/60 text-[10px]` hardcoded)
- **Change spacing/density (card padding, section padding, header height)** → update recipe defaults (`Surface`, `Section`, `Toolbar`) once. ❌ (Currently `p-6`, `px-4 py-3`, `gap-6` scattered)
- **Change typography scale/weights** → update base layer (`@layer base`) + font vars once. ✅ (Tokens exist but components override)
- **Change motion/hover behavior** → update shared motion utilities once, not per-component. ❌ (Currently `transition-all duration-300`, `group-hover:scale-110` scattered)
- **Stop per-page "special" implementations** → wrap recurring patterns into recipes. ❌ (Hero headers, stat cards, empty states, metric rows all duplicated)

## Objectives (Clarified)

- **Standardize via primitives** for: icon sizes/styles, form field heights, card dividers, spacing density, metric card styling, button groups, hero headers
- **Primitive-driven shadcn components** so changes propagate without per-file edits.
- **Recipe components** for repeating patterns: `HeroHeader`, `IconBox`, `FormField`, `Toolbar`
- **Guardrails** to block raw colors and encourage primitives/recipes.

## Current Constraints (Repo Reality)

- This repo is on **Tailwind v4.1.18 (CSS-first)**: tokens and theming already live in `src/index.css` via `@theme inline`, plus `@layer base` and `@layer utilities`.
- shadcn's Tailwind layer is imported via `@import "shadcn/tailwind.css";`. Our plan builds on top.
- **No tailwind.config.js** (using inline theme in CSS).
- Use Tailwind scale + shadcn primitives; keep CSS vars for theme colors and radius.
- **No recipe layer** — patterns are reimplemented in each page (e.g., HeroHeader reimplemented 4+ times).
- **40+ pages/components** use custom Tailwind classes; no enforced standard.

## Principles (shadcn-aligned)

- **Theme via CSS vars**: Colors + radius via CSS variables; spacing/sizing via Tailwind scale.
- **Custom style registry**: Treat our design layer as a custom shadcn style (extends:none) so future `shadcn add` stays consistent.
- **Override centrally**: Use registryDependencies-style overrides (button, card, input) instead of ad-hoc tweaks.
- **Custom utilities**: Ship motion/spacing/interaction helpers as Tailwind utilities, not scattered class strings.
- **Slots + variants**: Keep `data-slot` hooks and cva/variant patterns for predictable theming.

## Deliverables (Phased)

### Phase 1: Primitive Alignment (Foundation)

- Replace ad-hoc `div` stacks with shadcn primitives (Card, Button, Input, Dialog, etc.)
- Align sizing/spacing to Tailwind scale (`p-6`, `rounded-xl`, `h-12`)
- Enhance `src/index.css` only for theme colors + radius
- ESLint rule + CI check: Block raw colors and encourage primitives/recipes

### Phase 2: Recipe Components (Kill Duplication)

- **`HeroHeader`** (replaces 4+ duplicates): icon-box, title, subtitle, action slots with standardized sizes/spacing
- **`IconBox`** (replaces 15+ locations): size variants (xs, sm, md, lg) aligned to Tailwind scale
- **`FormField`** (wraps existing Field): Input height, label styling, message styling via Tailwind scale
- **`Toolbar`** (replaces scattered button groups): Button height, padding, divider width from scale

### Phase 3: Shadcn Primitive Updates

- Refactor `ui/button`, `ui/card`, `ui/input`: Use Tailwind scale + shadcn CSS vars for radius/colors
- Refactor `ui/form` components: Input height, label size, message text size from Tailwind scale
- Add `data-token` attributes for easier selector overrides

### Phase 4: Migration & Enforcement

- Create `docs/design-system-migration.md`: Checklist of all 40+ pages/components with status
- Phase 1 migration: Shell components (site-header, nav) → recipes
- Phase 2 migration: High-traffic pages (dashboard, projects, tasks) → recipes
- Phase 3 migration: Forms, modals, settings → refitted form recipes
- Phase 4 migration: Long tail (remaining pages) until checklist complete
- Lint enforcement: New code fails lint if it violates primitive/recipe rules
- Migration guide + design docs (how to use recipes, examples, do/don't)
- Optional: Storybook or gallery page showing components with style switches

## Repository Coverage (All Pages & Components)

This plan only solves the “manual edits everywhere” problem if we migrate and enforce **everything**, not just a few screens.

Scope definition (must be covered):

- **All pages**: `src/pages/**` (including nested pages like `src/pages/settings/**` and `src/pages/organizations/**`)
- **All components**: `src/components/**` (including feature folders and `src/components/ui/**`)
- Optional but recommended: any additional app UIs under other roots (e.g. `redesign/**`) if they ship to users.

File-level “done” criteria (applies to every page/component in scope):

- Uses shadcn primitives and/or our recipes for surfaces/sections/typography instead of bespoke wrapper div stacks.
- No raw theme colors (hex/oklch literals) except in whitelisted “visual blocks” (e.g., a single `LandingBackground`).
- No scattered core radii/spacing/motion knobs in-line for shared patterns (they must be routed through primitives/recipes).
- If a file needs an exception, document it inline with a short reason.

## Workstreams & Steps (Prioritized)

### **CRITICAL FIRST: Primitive Audit & Alignment**

1. **Audit hardcoded design decisions** (Find all the pain points)
   - Run grep for `rounded-2xl`, `rounded-xl`, `size-16`, `size-12`, `h-9`, `p-6`, etc.
   - Document every unique value found for: icon sizes, border radii, form heights, padding, spacing
   - Create spreadsheet showing duplicates and inconsistencies (e.g., `text-2xl` vs `text-3xl` for metrics)

2. **Standardize via primitives first**
   - Replace ad-hoc card wrappers with `Card`, `CardHeader`, `CardContent`, `CardFooter`
   - Replace bespoke inputs/buttons with `Input`, `Button`, `Select`, `Dialog`
   - Keep spacing/radii/sizing on the Tailwind scale (`p-6`, `rounded-xl`, `h-12`)
   - Reserve CSS variables in `src/index.css` for theme colors + radius only

### **THEN: Build Recipe Components (Quick Wins)**

5. **Create `src/components/recipes/icon-box.tsx`**
   - Variants: size (sm, md, lg, xl), tone (primary, secondary, muted)
   - Uses Tailwind scale values for sizing and radius
   - Replaces 15+ hardcoded icon box patterns

   ```tsx
   <IconBox size="md" tone="primary" icon={Target} />
   ```

6. **Create `src/components/recipes/hero-header.tsx`**
   - Props: icon, title, subtitle, action slot
   - Uses Tailwind scale for spacing, radius, icon sizes
   - Replaces 4+ hardcoded hero headers in Projects/Tasks pages

7. **Create `src/components/recipes/form-field.tsx`**
   - Wraps existing Field component
   - Uses Tailwind scale for input height, label size, message styling
   - Provides consistent form styling across all forms

8. **Create `src/components/recipes/toolbar.tsx`**
   - Props: variant, children
   - Standardizes button-group surfaces and separators

### **NEXT: ESLint Guardrails**

11. **Add ESLint rule to block scattered hardcoding**
    - Rule: Forbid `rounded-*` outside specific files (with exceptions)
    - Rule: Forbid `size-*` (icons should use IconBox recipe)
    - Rule: Forbid `h-9`, `h-10`, etc. (inputs should use FormField recipe)
    - Rule: Prefer Card + CardContent for consistent padding
    - Document exceptions inline with a short reason

12. **Add CI check for style violations**
    - Run ESLint as part of `bun run check`
    - Report percentage of primitive/recipe-compliant code
    - Fail CI if hardcoded values increase

### **FINALLY: Migration (Phased Rollout)**

13. **Phase 1: Shell components** (site-header, nav, layout)
    - Migrate to recipe components: HeroHeader, IconBox, Toolbar
    - Align shadcn primitives to the Tailwind scale
    - Target: 10% of codebase

14. **Phase 2: High-traffic pages** (Dashboard, Projects, Tasks)
    - Replace hardcoded patterns with recipes
    - Update headers and icon boxes to recipes
    - Target: 40% of codebase

15. **Phase 3: Forms & modals**
    - Refit all form fields with FormField recipe
    - Update modal/dialog card styling with Card + CardContent
    - Target: 70% of codebase

16. **Phase 4: Long tail** (remaining pages/components)
    - Migrate remaining pages until checklist is 100%
    - Remove lint escape hatches as files reach "done"
    - Target: 100% of codebase

17. **Create migration checklist** `docs/design-system-migration.md`
    - List every `src/pages/*` and `src/components/*` file
    - Track status: todo, in-progress, done
    - Note exceptions or reasons

18. **Docs & Testing**
    - Add `docs/design-system.md` (primitives, recipes, do/don't, how to use)
    - Add light smoke snapshot tests for recipes
    - Create PR checklist: "Uses recipes," "No raw colors/radius"
    - Run `bun run check` after each phase

## Migration Checkpoints

**Checkpoint 1** (After primitive alignment + 1-2 recipes):

- Card/Input/Button standardized in key flows
- 2-3 critical recipes working (HeroHeader, IconBox, FormField)
- First page migrated to recipes as proof of concept

**Checkpoint 2** (After Phase 1-2):

- All shell components using recipes
- Dashboard/Projects/Tasks pages using HeroHeader and IconBox
- 40%+ of codebase migrated

**Checkpoint 3** (After Phase 3):

- All forms using FormField recipe
- All form inputs now consistent height/styling
- Card + CardContent used throughout for dividers
- 70%+ of codebase migrated

**Checkpoint 4** (Complete):

- 100% of pages/components migrated
- Global changes (e.g., radius scale change) require edits only in primitives/recipes

## "Will This Actually Fix It?" Checklist

✅ **After completion, changing `--radius`** (e.g., `0.5rem` → `0.375rem`):

- Dashboard hero header updates
- Projects page hero updates
- Button styling updates
- Icon boxes update
- Card sections update
- Form inputs update
- Empty states update
- **Centralized primitives** drive most UI changes (Card/Input/Button updates ripple everywhere)

✅ **Adding new pages** requires:

- Import `HeroHeader`, `IconBox`, `FormField` from recipes
- Compose UI from existing recipes
- Zero custom Tailwind hardcoding for spacing/sizing/radius
- ESLint enforces this on PR

✅ **Guardrails prevent backsliding**:

- Prefer shadcn primitives + recipes for new UI
- Code review catches exceptions and custom wrappers

## Risks & Mitigations

- **Inconsistent use of primitives** → require Card/Input/Button in review for surfaces & controls.
- **Migration churn** → do phased rollout and keep spacing/radius scale stable until coverage is high.
- **One-off marketing visuals** → isolate them into a small set of “blocks” (e.g., `LandingBackground`, `HeroSection`) so changes stay centralized.

## Success Criteria

- ✅ Changing `--radius` updates rounded utilities without per-file edits
- ✅ Changing input height class in `ui/input` updates all forms
- ✅ Changing icon box sizes in recipe updates all icon boxes
- ✅ New pages use primitives/recipes with minimal bespoke wrappers
- ✅ 100% of `src/pages/**` and `src/components/**` migrated to recipes
- ✅ Global UI change (e.g., "make all cards more compact") requires edits in primitives/recipes, not 20+ files

## Implementation Notes for Agents/Developers

**Phase 1 (Primitives First)** is the critical foundation. Do not skip to recipes without primitives in place.

**Recipe Components** should use Tailwind scale values and shadcn primitives. Avoid bespoke wrappers.

**Migration Checklist** at `docs/design-system-migration.md` is your single source of truth for progress. Update it frequently.

**Visual Regression** is unlikely if you migrate to primitives/recipes without changing scale values. Keep spacing/radius stable during migration.

**Testing**: Run `bun run check` after each phase. Add snapshot tests for recipes to catch regressions.
