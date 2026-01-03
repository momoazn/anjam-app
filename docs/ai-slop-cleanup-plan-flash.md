# AI Slop Cleanup Plan

This document outlines the findings and plan for removing AI-generated "slop," unnecessary abstractions, and redundant code from the Anjam codebase.

## Findings

### 1. AI Slop - Comments

Excessive, low-value comments that describe "what" the code is doing rather than "why," or are simply filler.

- **`src/app.tsx`**: Filler comments like `// Optimized QueryClient configuration`, `// Main content component`, etc.
- **`src/hooks/index.ts`**: Verbose barrel file documentation.
- **`backend/audit.go`**: Highly descriptive comments for standard Go structures and simple logic.
- **`src/constants/command-menu.ts`**: Literal descriptions of obvious constants.

### 2. Unnecessary Abstractions & Over-Engineering

Thin wrappers that add complexity without providing significant value or type safety.

- **`src/hooks/use-mutation-factory.ts`**: A wrapper around TanStack Query's `useMutation` that introduces awkward type casting (`as any`) and hides the standard API.
- **`src/hooks/factories/use-crud-factory.ts`**: A complex generic factory for simple PocketBase operations. It includes hardcoded logic for specific collections (e.g., `['tasks', 'comments']` for soft delete) which violates the abstraction's purpose.
- **`src/hooks/tasks.ts` (and others)**: Many hooks are just thin wrappers around the `crudHooks` factory, which are themselves wrappers around `useMutation`.
- **`src/lib/error-handler.ts`**: Extremely verbose mapping of every possible PocketBase validation code to a toast message.

### 3. Type Issues & AI Workarounds

- **`as any` usage**: Found in `src/components/task/time-entry-dialog.tsx`, `src/hooks/organization-invites.ts`, and `src/hooks/use-mutation-factory.ts`. These are often used to bypass TanStack Query or Zod type complexities.

### 4. Redundant Logic

- **`src/components/project/project-statuses-settings.tsx`**: Repetitive state management, nested `try/catch` blocks for simple 404 checks, and manual query invalidation logic that should be handled by the hooks.

---

## Cleanup Plan

### Phase 1: Clean Comments & Styles

- [ ] Strip filler comments from `src/app.tsx`, `src/hooks/index.ts`, and `src/constants/*.ts`.
- [ ] Review and prune verbose comments in `backend/audit.go`.

### Phase 2: Simplify Mutation Infrastructure

- [ ] **Deprecate `use-mutation-factory.ts`**: Replace its usage with standard `useMutation`. Implement a simple global `onError` handler in `QueryClient` if universal error toasting is required, or keep it local to hooks.
- [ ] **Refactor `use-crud-factory.ts`**: Either simplify it significantly to be a thin utility or remove it in favor of direct `useMutation` calls in feature hooks to improve readability and type safety.
- [ ] **Flatten Hooks**: In `src/hooks/tasks.ts`, `projects.ts`, etc., move logic from the factory into the hooks themselves to make them easier to debug.

### Phase 3: Component Refactoring

- [ ] **`project-statuses-settings.tsx`**:
  - Consolidate state management.
  - Remove redundant `try/catch` and `isSaving` flags where TanStack Query states can be used.
  - Simplify the `handleDelete` logic.
- [ ] **`time-entry-dialog.tsx`**: Fix the Zod resolver type issue to remove `as any`.

### Phase 4: Verification

- [ ] Run `bun run check` to ensure no regressions in types or formatting.
- [ ] Run `bun run test:run` to verify core logic remains intact.
