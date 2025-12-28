# Design System Supplement: Primitives-First Implementation

This supplement adds a **primitives-first** execution path without changing the existing plan. It clarifies how to build shared components on top of shadcn primitives and reduce duplication while keeping Tailwind scale values.

## Goals

- Use shadcn primitives as the foundation (`Card`, `Button`, `Input`, `Dialog`, `Select`, etc.).
- Build small reusable components **on top of primitives** for repeated patterns.
- Avoid new token layers; keep Tailwind scale values in utilities.
- Minimize duplicated layout and spacing logic across pages.

## Scope

- Applies to all `src/pages/**` and `src/components/**`.
- Prioritize high-traffic screens (Dashboard, Projects, Tasks, Settings).

## Principles

- **Prefer primitives**: if a pattern is a surface or control, start with shadcn components.
- **Small wrappers**: only create a custom component when the same layout appears in 3+ files.
- **No tokens.json**: spacing/sizing/radius stays on Tailwind scale.
- **Keep CSS vars**: only for theme colors and base radius in `src/index.css`.

## Recommended Shared Components (Built on Primitives)

Create these only if they appear repeatedly:

1. **SectionCard**
   - Built on `Card` + `CardContent`
   - Use for card-like surfaces with consistent padding and border
2. **SectionHeader**
   - Title + optional description/actions
   - Use with `CardHeader` or within a `CardContent`
3. **IconBadge**
   - Built on `div` + shared classes (or `Badge` if appropriate)
   - Replaces repeated icon-in-rounded-box patterns when not using `IconBox`
4. **ActionBar**
   - Horizontal button group, built on `Toolbar` (recipe)
   - Standardizes spacing + separators

## When to Use Recipes

Keep and use only these recipes:

- `IconBox` (for consistent icon sizing/tones)
- `HeroHeader` (page hero layout)
- `FormField` (consistent form rows)
- `Toolbar` (button group surfaces)

Everything else should be primitives-first or custom wrapper if repeated.

## Migration Checklist (Supplement)

- [ ] Replace ad-hoc card wrappers with `Card` + `CardContent`
- [ ] Standardize headers with `HeroHeader` or `SectionHeader`
- [ ] Replace repeated icon blocks with `IconBox`
- [ ] Replace repeated form rows with `FormField`
- [ ] Replace repeated button groups with `Toolbar`

## Review Guidance

- Reject new raw wrappers when a primitive exists.
- Approve new wrappers only after they appear in 3+ locations.
- Keep spacing/radius values consistent with Tailwind scale.
