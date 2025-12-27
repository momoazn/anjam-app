# Design System Refactor Plan (Tailwind + shadcn) - REVISED

This plan fixes the current "edit every file" pain by centralizing tokens, recipes, and guardrails in a way that matches shadcn best practices (CSS variables + registry style + custom utilities).

## Problem Statement: The Current Pain (Validated)

**Status**: You have built a professional, well-structured design system on Tailwind v4 + shadcn/ui with:

- 60+ UI components with CVA variants and data-slot patterns
- Sophisticated CSS variable system for theming (light/dark)
- Custom utilities for animations, patterns, and interactions
- RTL support and spring physics animations

**But**: The design tokens and recipes are **not fully extracted and enforced**, causing scattered hardcoded styling across 40+ pages/components:

### Concrete Examples of the Pain

| Pattern                    | Found In                                       | Pain                                                                                                        | Change Cost                                                |
| -------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Hero headers**           | Projects, Tasks, MyTasks (3+ files)            | Icon box: `bg-primary/10 text-primary flex size-16...rounded-2xl` hardcoded                                 | Change rounded-2xl → rounded-xl: 5+ files                  |
| **Stat/Metric cards**      | Dashboard, Projects, ProjectList (3+ files)    | Label: `text-muted-foreground/60 text-[10px] font-bold tracking-tight` duplicated                           | Change label color or size: 3+ files                       |
| **Icon boxes**             | 15+ locations across dashboard/cards           | Sizes: `size-16`, `size-12`, `size-4` mixed with radii `rounded-2xl`, `rounded-lg`, `rounded-md`            | Standardize icon boxes: 15+ files                          |
| **Form fields**            | All forms (10+ files)                          | Input: `h-9 rounded-xl border bg-white font-medium shadow-sm focus-visible:ring-1` duplicated in every form | Change input height h-9→h-10: 10+ files                    |
| **Card dividers**          | ProjectList, Charts, Dashboard (10+ locations) | Border: `border-border/40` or `border-b` with varying padding `p-6`/`p-1.5`                                 | Change divider opacity: 10+ locations                      |
| **Progress metrics**       | ProjectsWidget, ProjectListGroup               | Values already conflicting: `text-2xl` vs `text-3xl` (!)                                                    | Standardize metric sizes: 2+ files with existing conflicts |
| **Toolbars/button groups** | TaskHeader, MyTasks (3+ files)                 | Heights: `h-12` vs `h-11` vs `h-14` with inconsistent padding `px-5`/`px-6`/`px-8`                          | Standardize button heights: 3+ files                       |
| **Empty states**           | UI component + ChartsWidget overrides          | Padding: `py-16` vs `py-20` with icon `size-16` vs `size-14`                                                | Standardize empty state: 2+ files                          |

**Critical Finding**: If you change border-radius from `rounded-2xl` to `rounded-xl` globally, you must edit **20+ files** across:

- Dashboard hero header, Tasks page hero, Projects page hero
- Button styling in 5+ toolbars
- Icon boxes throughout (15 locations!)
- Card sections (10+ dividers)
- Form inputs (10+ files)
- Empty state cards, Cards themselves
- All shadcn primitives that hardcode radii

## Objectives (Clarified)

- **Extract & enforce** single source of truth for: icon sizes/styles, form field heights, card dividers, spacing density, metric card styling, button groups
- **Token-driven shadcn primitives** so changes propagate without per-file edits.
- **Recipe components** for repeating patterns: `HeroHeader`, `IconBox`, `MetricCard`, `StatCard`, `CardDivider`, `EmptyState`, `FormField`, `Toolbar`
- **Guardrails** to block raw colors/radii/spacing and enforce token/recipe usage.

## Current Constraints (Repo Reality)

- This repo is on **Tailwind v4.1.18 (CSS-first)**: tokens and theming already live in `src/index.css` via `@theme inline`, plus `@layer base` and `@layer utilities`.
- shadcn's Tailwind layer is imported via `@import "shadcn/tailwind.css";`. Our plan builds on top.
- **No tailwind.config.js** (using inline theme in CSS).
- **No separate tokens.json** — tokens are scattered across `src/index.css`, components have `designTokens` maps.
- **No recipe layer** — patterns are reimplemented in each page (e.g., HeroHeader reimplemented 4+ times).
- **40+ pages/components** use custom Tailwind classes; no enforced standard.

## Principles (shadcn-aligned)

- **Token extraction first**: Extract hardcoded values into a single JSON source of truth.
- **CSS custom properties**: All design decisions exposed as CSS variables consumed by components.
- **Recipe over utility**: Wrap scattered class strings (20+ classes) into composable recipe components.
- **CVA + data-slot**: Keep existing component variant patterns; enhance with token consumption.
- **Enforce via lint/CI**: Block backsliding with ESLint rules and automated checks.

## Deliverables (Revised)

### Phase 1: Token Extraction & Enforcement (Foundation)

- `src/design/tokens.json` (authoritative source): icon sizes, form heights, card padding, divider styling, motion timing, spacing density
- `src/design/tokens.ts` (auto-generated): TypeScript types for token access in components
- Enhanced `src/index.css`: Emit CSS custom properties for all design decisions (not just colors)
- ESLint rule + CI check: Block hardcoded `rounded-*`, `p-*`, `size-*`, `h-*`, `w-*` outside `src/design` with escape hatches

### Phase 2: Recipe Components (Kill Duplication)

- **`HeroHeader`** (replaces 4+ duplicates): icon-box, title, subtitle, action slots with standardized sizes/spacing
- **`IconBox`** (replaces 15+ locations): size variants (xs, sm, md, lg), border-radius from tokens, hover effects
- **`MetricCard`** (replaces ProjectsWidget/ProjectListGroup): label, value, progress bar with consistent sizing
- **`FormField`** (wraps existing Field): Input height, label styling, message styling from tokens
- **`CardSection`** (replaces repeated `border-b p-6`): Divider component with consistent border/padding from tokens
- **`StatCard`** (replaces dashboard stat hardcoding): Icon + label + value with consistent spacing
- **`Toolbar`** (replaces scattered button groups): Button height, padding, divider width from tokens
- **`EmptyState`** (enhance existing): Centralize padding, icon size, text styling

### Phase 3: Shadcn Primitive Updates

- Refactor `ui/button`, `ui/card`, `ui/input`: Consume token values for radius, spacing, shadows
- Refactor `ui/form` components: Input height, label size, message text size from tokens
- Add `data-token` attributes for easier selector overrides

### Phase 4: Migration & Enforcement

- Create `docs/design-system-migration.md`: Checklist of all 40+ pages/components with status
- Phase 1 migration: Shell components (site-header, nav) → recipes
- Phase 2 migration: High-traffic pages (dashboard, projects, tasks) → recipes
- Phase 3 migration: Forms, modals, settings → refitted form recipes
- Phase 4 migration: Long tail (remaining pages) until checklist complete
- Lint enforcement: New code fails lint if it violates token rules (with escape hatches during migration)

## Workstreams & Steps (Prioritized)

### **CRITICAL FIRST: Extract & Document Current Values**

1. **Audit hardcoded design decisions** (Find all the pain points)
   - Run grep for `rounded-2xl`, `rounded-xl`, `size-16`, `size-12`, `h-9`, `p-6`, etc.
   - Document every unique value found for: icon sizes, border radii, form heights, padding, spacing
   - Create spreadsheet showing duplicates and inconsistencies (e.g., `text-2xl` vs `text-3xl` for metrics)

2. **Create `src/design/tokens.json` (single source of truth)**

   ```json
   {
     "spacing": {
       "card-padding": "1.5rem",
       "section-padding": "2rem",
       "hero-padding": "2rem",
       "form-label-gap": "0.25rem"
     },
     "radius": {
       "button": "0.75rem",
       "card": "1rem",
       "input": "0.75rem",
       "icon-box": "1rem",
       "hero-header": "1.5rem"
     },
     "sizing": {
       "icon-sm": "1rem",
       "icon-md": "1.5rem",
       "icon-lg": "2rem",
       "icon-xl": "4rem",
       "form-input-height": "2.25rem"
     },
     "motion": {
       "transition-fast": "150ms",
       "transition-normal": "300ms",
       "transition-slow": "500ms",
       "easing": "cubic-bezier(0.4, 0, 0.2, 1)"
     }
   }
   ```

3. **Generate `src/design/tokens.ts`** from tokens.json

   ```typescript
   export const tokens = {
     spacing: { ... },
     radius: { ... },
     sizing: { ... },
     motion: { ... }
   }
   ```

4. **Emit CSS variables into `src/index.css`**
   ```css
   @layer theme {
     :root {
       --spacing-card-padding: 1.5rem;
       --radius-button: 0.75rem;
       --sizing-icon-md: 1.5rem;
       --motion-transition-normal: 300ms;
     }
   }
   ```

### **THEN: Build Recipe Components (Quick Wins)**

5. **Create `src/components/recipes/icon-box.tsx`**
   - Variants: size (sm, md, lg, xl), tone (primary, secondary, muted)
   - Uses token values for sizing and border-radius
   - Replaces 15+ hardcoded icon box patterns

   ```tsx
   <IconBox size="md" tone="primary" icon={Target} />
   ```

6. **Create `src/components/recipes/hero-header.tsx`**
   - Props: icon, title, subtitle, action slot
   - Uses tokens for spacing, border-radius, icon sizes
   - Replaces 4+ hardcoded hero headers in Projects/Tasks pages

7. **Create `src/components/recipes/metric-card.tsx`**
   - Props: label, value, icon, progress (optional)
   - Uses tokens for sizing, label color, spacing
   - Replaces ProjectsWidget/ProjectListGroup metric rendering

8. **Create `src/components/recipes/form-field.tsx`**
   - Wraps existing Field component
   - Uses tokens for input height, label size, message styling
   - Provides consistent form styling across all forms

9. **Create `src/components/recipes/card-section.tsx`**
   - Props: border (top/bottom), padding, children
   - Replaces scattered `border-b p-6` patterns
   - Example: `<CardSection border="bottom">{children}</CardSection>`

10. **Create `src/components/recipes/stat-card.tsx`**
    - Props: icon, label, value, color
    - Uses tokens for icon box styling, spacing, typography

### **NEXT: ESLint Guardrails**

11. **Add ESLint rule to block scattered hardcoding**
    - Rule: Forbid `rounded-*` outside specific files (with exceptions)
    - Rule: Forbid `size-*` (icons should use IconBox recipe)
    - Rule: Forbid `h-9`, `h-10`, etc. (inputs should use FormField recipe)
    - Rule: Forbid `p-6`, `px-4`, etc. for card padding (use CardSection recipe)
    - Add escape hatch: `// design-token-ignore: reason` for exceptions

12. **Add CI check for token violations**
    - Run ESLint as part of `bun run check`
    - Report percentage of token-compliant code
    - Fail CI if hardcoded values increase

### **FINALLY: Migration (Phased Rollout)**

13. **Phase 1: Shell components** (site-header, nav, layout)
    - Migrate to recipe components: HeroHeader, IconBox, CardSection
    - Update shadcn primitives to consume token values
    - Target: 10% of codebase

14. **Phase 2: High-traffic pages** (Dashboard, Projects, Tasks)
    - Replace hardcoded patterns with recipes
    - Update stat rendering, metric cards, headers
    - Target: 40% of codebase

15. **Phase 3: Forms & modals**
    - Refit all form fields with FormField recipe
    - Update modal/dialog card styling with CardSection
    - Target: 70% of codebase

16. **Phase 4: Long tail** (remaining pages/components)
    - Migrate remaining pages until checklist is 100%
    - Remove lint escape hatches as files reach "done"
    - Target: 100% of codebase

17. **Create migration checklist** `docs/design-system-migration.md`
    - List every `src/pages/*` and `src/components/*` file
    - Track status: todo, in-progress, done
    - Note exceptions or reasons

## Migration Checkpoints

**Checkpoint 1** (After token extraction + 1-2 recipes):

- `src/design/tokens.json` created and consumed in CSS
- 2-3 critical recipes working (HeroHeader, IconBox, FormField)
- ESLint rule active (not blocking yet, just reporting)
- First page migrated to recipes as proof of concept

**Checkpoint 2** (After Phase 1-2):

- All shell components using recipes
- Dashboard/Projects/Tasks pages using MetricCard, StatCard, HeroHeader
- ESLint rule now enforcing with escape hatches allowed
- 40%+ of codebase migrated

**Checkpoint 3** (After Phase 3):

- All forms using FormField recipe
- All form inputs now consistent height/styling
- CardSection used throughout for dividers
- 70%+ of codebase migrated

**Checkpoint 4** (Complete):

- 100% of pages/components migrated
- Escape hatches removed or documented
- ESLint rule blocks new violations
- Global changes (e.g., radius token change) require edits in 0 files

## "Will This Actually Fix It?" Checklist

✅ **After completion, changing a token** (e.g., `--radius-card: 1rem` → `0.5rem`):

- Dashboard hero header updates
- Projects page hero updates
- Button styling updates
- Icon boxes update
- Card sections update
- Form inputs update
- Empty states update
- **0 files manually edited** (changes in `tokens.json` + `src/index.css` only)

✅ **Adding new pages** requires:

- Import `HeroHeader`, `IconBox`, `MetricCard`, `FormField` from recipes
- Compose UI from existing recipes
- Zero custom Tailwind hardcoding for spacing/sizing/radius
- ESLint enforces this on PR

✅ **Guardrails prevent backsliding**:

- `// design-token-ignore` comment required to bypass ESLint
- CI reports token violations
- Code review catches exceptions

## Risks & Mitigations

| Risk                                    | Mitigation                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------- |
| Drift between tokens.json and CSS vars  | Auto-generate TS types + CSS from JSON during build                        |
| ESLint false positives in existing code | Allow escape hatches during migration; remove as files reach "done"        |
| Visual churn during migration           | Keep token values stable; only migrate to recipes, not change values       |
| One-off marketing visuals               | Isolate in dedicated "visual blocks" (e.g., `LandingBackground`) component |
| Team doesn't adopt recipes              | Docs + examples + PR checklist enforcement                                 |

## Success Criteria

- ✅ Changing `--radius-button` from `0.75rem` to `0.5rem` updates all buttons without per-file edits
- ✅ Changing form input height token updates all forms without per-file edits
- ✅ Changing icon size token updates all icon boxes without per-file edits
- ✅ New pages use recipes/tokens with zero hardcoded design values
- ✅ ESLint + CI enforce token usage; PRs fail if new hardcoding is added
- ✅ 100% of `src/pages/**` and `src/components/**` migrated to recipes
- ✅ Global UI change (e.g., "make all cards more compact") requires edits only in token definitions, not 20+ files

## Implementation Timeline

**Do not estimate timeline; break into actionable steps:**

1. Audit hardcoded values → document in tokens.json
2. Create tokens.json + tokens.ts + emit CSS vars
3. Build HeroHeader + IconBox + MetricCard recipes
4. Add ESLint rules
5. Migrate Phase 1: shell components
6. Migrate Phase 2: high-traffic pages
7. Migrate Phase 3: forms/modals
8. Migrate Phase 4: long tail
9. Remove escape hatches + finalize
