# Design System Refactor - Quick Start for Agents/Developers

**Full plan**: See [`design-system-plan.md`](./design-system-plan.md) for complete details.

## Repo Reality (Read First)

- This repo is **Tailwind v4 (CSS-first)** + **shadcn/ui**.
- **Theme tokens already exist** in `src/index.css` (`:root` + `.dark`) and feed Tailwind via `@theme inline`.
- **No custom `--ds-*` token layer**. Use shadcn primitives + Tailwind scale for spacing/sizing/radius.
- The refactor goal is to make **layout/radii/spacing changes consistent** by reusing primitives + recipes (and then migrating usage).

**Workflow note**: avoid running the app after every change; when you’re done with a batch of edits, run `bun run check`.

## The Problem (30 seconds)

You have scattered hardcoded styling across 40+ pages/components. Changing border-radius from `rounded-2xl` to `rounded-xl` requires editing **20+ files**. This plan fixes it by extracting tokens and building recipe components.

## The Solution (4 Phases)

| Phase | Goal                                                    | Key Deliverables                                                                                  | Impact                                      |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **1** | Replace ad-hoc div stacks with shadcn primitives         | Card, CardHeader/Content/Footer, Button, Input, Dialog, etc.                                      | Consistent surfaces & spacing               |
| **2** | Build recipe components for repeated patterns            | 8 recipes: IconBox, HeroHeader, MetricCard, FormField, CardSection, StatCard, Toolbar, EmptyState | 15-40 files worth of duplication eliminated |
| **3** | Align primitives with Tailwind scale + theme vars        | Refactor `ui/button`, `ui/card`, `ui/input`, `ui/form`                                            | Consistent styling across all components    |
| **4** | Migrate pages/components to recipes + enforce with lint | 4 migration passes + ESLint rules                                                                 | 100% of codebase using recipes              |

## Getting Started

**Option A: Primitives First (Recommended)**

1. Audit hardcoded values: `rg` for `rounded-2xl`, `size-16`, `h-9`, `p-6`, etc.
2. Replace ad-hoc card wrappers with `<Card />` + `<CardContent />`
3. Replace bespoke inputs/buttons with `Input`, `Button`, `Select`, `Dialog`, etc.
4. Keep spacing/radius in the Tailwind scale (`p-6`, `rounded-xl`, `h-12`)
5. Build 2-3 critical recipes (IconBox, HeroHeader, FormField)

**Option B: Recipe Components First**

1. Start with the most painful duplication (icon boxes: 15+ locations)
2. Build IconBox recipe using Tailwind scale values
3. Keep it aligned to primitives (Card + Button + Input)
4. Migrate pages to use recipes

## Critical Paths

**Do NOT skip Phase 1 (Primitives First)**. Recipes without primitives still cause per-file tweaks.

**Do NOT invent a new token layer**. Use shadcn primitives + Tailwind scale.

**Do keep a migration checklist** (`docs/design-system-migration.md`). If it doesn't exist yet, create it before migrating files.

## What Each Phase Solves

### Phase 1: Stop editing `src/index.css` 100+ times

- Icon sizes consolidated into tokens
- Border radii consolidated into tokens
- Form heights consolidated into tokens
- Spacing/padding consolidated into tokens

### Phase 2: Stop reimplementing hero headers, icon boxes, metric cards

- 15+ hardcoded icon boxes → 1 `<IconBox />` component
- 4+ hardcoded hero headers → 1 `<HeroHeader />` component
- 3+ hardcoded metric cards → 1 `<MetricCard />` component
- 10+ hardcoded form fields → 1 `<FormField />` component

### Phase 3: Stop editing shadcn primitives

- All shadcn components reference tokens, not hardcoded values
- Changes to a token propagate everywhere

### Phase 4: Prevent backsliding

- ESLint blocks new hardcoded values
- CI fails PRs with violations
- Team adopts recipes for all new code

## Migration Checkpoints

| Checkpoint | Target          | Completed When                                              |
| ---------- | --------------- | ----------------------------------------------------------- |
| **CP1**    | Foundation      | Cards/inputs standardized, 2-3 recipes working, lint reporting |
| **CP2**    | Quick wins      | 40% of codebase migrated (shell + high-traffic pages)       |
| **CP3**    | Forms & cleanup | 70% of codebase migrated (all forms using recipes)          |
| **CP4**    | Complete        | 100% migrated, lint enforced, no escape hatches needed      |

## Key Files

| File                                  | Purpose                                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/index.css`                       | Existing theme tokens (colors + radius) and Tailwind `@theme inline` definitions              |
| `src/components/ui/*`                 | shadcn primitives + some existing “recipe-ish” components (e.g. `metric-card`, `empty-state`) |
| `src/components/forms/form-field.tsx` | Existing form wrapper (good starting point for tokenizing heights/radii)                      |
| `src/components/recipes/*`            | Planned home for recipes (HeroHeader, IconBox, Toolbar, etc.)                                 |
| `docs/design-system-migration.md`     | Checklist tracking migration progress (create if missing)                                     |
| `docs/design-system-plan.md`          | Full implementation plan                                                                      |

## Example: Adding a New Page

**Before design system**:

```tsx
// Projects page reimplements hero header manually
<div className="bg-card border-border/10 mb-12 flex items-center justify-between rounded-3xl border p-8">
  <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl">
    <Target className="size-8" />
  </div>
  <h1 className="text-4xl font-bold">Projects</h1>
  {/* ... more manual styling ... */}
</div>
```

**After design system**:

```tsx
// Simply use the recipe
<HeroHeader
  icon={Target}
  title="Projects"
  subtitle="Manage all your projects"
  action={<Button>New Project</Button>}
/>
```

## Common Mistakes to Avoid

❌ Hardcoding values in recipes (defeats the purpose)
❌ Skipping token extraction (recipes still can't propagate changes)
❌ Not updating the migration checklist (you'll forget what's done)
❌ Adding new code without recipes (breaks the system)
❌ Changing token values during migration (causes visual churn)

## Questions?

See [`design-system-plan.md`](./design-system-plan.md) for:

- Concrete pain point examples (section 1.4)
- Full workstreams (section "Workstreams & Steps")
- Risk mitigations (section "Risks & Mitigations")
- Success criteria (section "Success Criteria")
