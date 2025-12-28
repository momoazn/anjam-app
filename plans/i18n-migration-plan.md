# i18n Persian (Farsi) & RTL Migration Plan

**Created**: 2025-12-28
**Project**: Anjam Task Management System
**Status**: Planning Complete
**Scope**: Migrate existing Persian text (hardcoded & constants) to i18n system with full RTL support

---

## Executive Summary

This document outlines the plan to organize existing Persian (Farsi) text from hardcoded components and constants into a structured i18n system with full RTL (right-to-left) support. The Anjam application is a Vite SPA (Single Page Application) with purely frontend-based i18n—no server-side rendering involved. The application already has Persian text throughout (~36K lines of frontend code across 200+ components), located either inline in components or in `src/constants/` files. This migration extracts and centralizes these strings into a proper i18n structure.

### Key Metrics

| Category            | Metric                      | Current               | Target    | Improvement                |
| ------------------- | --------------------------- | --------------------- | --------- | -------------------------- |
| **Text sources**    | Persian strings (scattered) | Hardcoded + Constants | i18n JSON | Single source of truth     |
| **Coverage**        | Strings in i18n system      | 0%                    | 100%      | All Persian text organized |
| **Components**      | Using i18n                  | 0                     | 100%      | All components updated     |
| **Maintainability** | Update difficulty           | High                  | Low       | Centralized management     |
| **Layout**          | RTL Support                 | Partial               | Full      | Complete RTL setup         |

---

## Phase 1: Infrastructure & Audit

### Priority 1.1: i18next Setup

**Decision**: Use **i18next** + **react-i18next**

- Industry standard, production-proven
- Excellent TypeScript support and type safety
- Namespace-based organization for large apps
- Lazy loading support for code splitting
- Built-in pluralization and interpolation

**Installation:**

```bash
bun add i18next react-i18next
```

**Note:** Since Anjam is a Vite SPA with Persian-only locale:

- No `i18next-browser-languagedetector` (no language switching)
- No `i18next-http-backend` (translations bundled with app)
- No `i18next-scanner` (simple grep validation sufficient for small team)
- Language is fixed to Persian, translations loaded at build time

**Target Structure:**

```
src/
├── i18n/
│   ├── config.ts                    # i18next configuration
│   ├── i18n.ts                      # i18next instance export
│   └── locales/
│       └── fa/
│           ├── common.json          # Common UI strings
│           ├── tasks.json           # Task-related strings
│           ├── projects.json        # Project-related strings
│           ├── users.json           # User management strings
│           ├── auth.json            # Authentication strings
│           ├── reports.json         # Reports page strings
│           ├── forms.json           # Form labels & errors
│           ├── notifications.json   # Notification strings
│           ├── sidebar.json         # Sidebar navigation
│           └── index.ts             # Namespace exports
├── hooks/
│   └── use-i18n.ts                  # Custom hook (if needed)
└── (rest of app)
```

**Success Metrics:**

- ✅ i18next configured with `fa` locale
- ✅ JSON namespace files created (placeholder)
- ✅ `useTranslation` hook working in test component
- ✅ RTL direction (`dir="rtl"`) applied globally
- ✅ All dependencies installed

**Implementation Steps:**

1. Install dependencies: `bun add i18next react-i18next`
2. Create `src/i18n/` directory structure
3. Create `src/i18n/config.ts`:

   ```typescript
   import i18next from "i18next";
   import { initReactI18next } from "react-i18next";

   const resources = {
     fa: { common: {}, tasks: {}, projects: {} /* ... */ },
   };

   i18next.use(initReactI18next).init({
     resources,
     lng: "fa",
     fallbackLng: "fa",
     debug: false,
     ns: ["common"],
     defaultNS: "common",
     interpolation: { escapeValue: false },
   });
   ```

   4. Create `src/i18n/i18n.ts` to export configured instance
   5. Initialize i18n in `src/main.tsx` before app render
   6. Create placeholder JSON files for all namespaces
   7. Set RTL direction globally in `src/app.tsx`:
      ```typescript
      useEffect(() => {
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "fa";
      }, []);
      ```
   8. Test component rendering with placeholder translations

---

### Priority 1.2: Audit & Categorize Existing Persian Text

**Goal**: Locate and categorize all Persian strings currently hardcoded in components or in constants

**Audit Process:**

1. **Find hardcoded Persian strings in components:**

   ```bash
   grep -r '[ـ-ي]' src/components src/pages \
     --include="*.tsx" --include="*.ts" \
     --exclude-dir=__tests__ > hardcoded-persian.txt
   ```

2. **Find Persian text in constants:**

   ```bash
   grep -r '[ـ-ي]' src/constants \
     --include="*.ts" > constants-persian.txt
   ```

3. **Manually review and categorize:**
   - Review each file in audit results
   - Categorize by feature/namespace (tasks, projects, auth, etc.)
   - Note context (UI label, error message, validation, etc.)
   - Identify strings with dynamic content (interpolation needed)

4. **Document findings in `docs/i18n-audit.md`:**
   - List all Persian strings by location (hardcoded vs constants)
   - Group by namespace
   - Note any special handling needed (pluralization, interpolation, etc.)

**Expected Categories:**

1. **Common UI** (`common.json`): Buttons, placeholders, common labels
   - "اضافه کردن", "ویرایش", "حذف", "ذخیره", "لغو", etc.

2. **Task Management** (`tasks.json`): Task status, priorities, actions
   - Found in `src/constants/tasks.ts` and task components

3. **Projects** (`projects.json`): Project-related strings
   - Found in `src/constants/` and project components

4. **Users & Auth** (`users.json`, `auth.json`): User management, login
   - Found in auth components and user management

5. **Forms & Validation** (`forms.json`): Form labels, validation messages
   - Found in form components and constants

6. **Notifications** (`notifications.json`): Toast, notification messages
   - Found in notification-related code

7. **Reports** (`reports.json`): Report page strings
   - Found in reports components

8. **Navigation** (`sidebar.json`): Menu items, navigation labels
   - Found in sidebar and navigation components

**Success Metrics:**

- ✅ Complete inventory of all Persian strings
- ✅ Categorized by namespace
- ✅ Identified all dynamic content needs
- ✅ Located in either hardcoded or constants files

**Implementation Steps:**

1. Run audit scripts to identify Persian text
2. Create `docs/i18n-audit.md` with findings
3. Organize findings by namespace
4. Create extraction checklist for each namespace

---

## Phase 2: Text Extraction & Migration

### Priority 2.1: Type-Safe Translation Setup

**Goal**: Implement type-safe translation keys to prevent runtime errors

**Implementation:**

1. **Create translation type generator** in `src/i18n/types.ts`:

   ```typescript
   // Auto-generated from JSON structure
   // Provides TypeScript IntelliSense for t() calls
   export type TranslationKey =
     | "fields.status"
     | "actions.edit"
     | "actions.delete";
   // ... all keys
   ```

2. **Configure i18next with typed hook**:

   ```typescript
   // src/hooks/use-i18n.ts
   import { useTranslation as useReactI18next } from "react-i18next";
   import type { TranslationKey } from "@/i18n/types";

   export function useTranslation(ns: string) {
     const result = useReactI18next(ns);
     return {
       ...result,
       t: (key: TranslationKey) => result.t(key),
     };
   }
   ```

3. **Success Metrics:**
   - ✅ TypeScript catches missing keys at compile time
   - ✅ IDE provides autocompletion for translation keys
   - ✅ No runtime `i18next::missingKey` warnings

**Implementation Steps:**

1. Create `src/i18n/types.ts` with basic structure
2. Create custom `useTranslation` hook in `src/hooks/use-i18n.ts`
3. Add type generator script (can be manual initially)
4. Test with first extracted component

---

### Priority 2.2: Extract Hardcoded Strings from Components (Batched)

**Goal**: Move hardcoded Persian text from components to i18n JSON in small, testable batches

**Extraction Strategy (Smaller Batches):**

1. **Batch 2.2A**: Common UI Components (10-15 components)
   - `src/components/common/*` (buttons, modals, dialogs)
   - `src/components/auth/*` (login, register forms)
   - Extract and test, commit before moving to next batch

2. **Batch 2.2B**: Page Headers & Navigation (10-15 components)
   - `src/pages/*` (page titles, descriptions)
   - `src/components/sidebar/*` (menu labels)
   - Test all pages load correctly

3. **Batch 2.2C**: Task Components (20-25 components)
   - `src/components/tasks/*` (task list, detail, forms)
   - Test task features end-to-end

4. **Batch 2.2D**: Project Components (15-20 components)
   - `src/components/projects/*` (project list, detail, settings)
   - Test project features

5. **Batch 2.2E**: Forms & User Management (15-20 components)
   - `src/components/forms/*` (input components, validation)
   - `src/components/users/*` (user list, settings)

6. **Batch 2.2F**: Reports & Utilities (10-15 components)
   - `src/components/reports/*`
   - `src/lib/*` (helpers, utilities)

**Process for Each Batch:**

1. **Extract strings to JSON:**
   - Identify all Persian strings in batch components
   - Add to appropriate namespace JSON
   - Use hierarchical keys: `feature.section.key`

2. **Replace with `t()` calls:**
   - Add `useTranslation('namespace')` hook
   - Replace hardcoded strings with `t('key')`
   - Ensure type safety with custom hook

3. **Test batch:**
   - Run `bun run type:check` to verify types
   - Render all affected components
   - Check browser console for missing keys
   - Verify no layout breaks

4. **Commit batch:**
   - Commit with descriptive message: `feat(i18n): extract [feature] strings`
   - Include JSON changes and component updates
   - Reference which components were updated

**Example extraction:**

**Before (hardcoded in component):**

```tsx
// src/components/task-list-item.tsx
export function TaskListItem({ task }) {
  return (
    <div>
      <span>وضعیت: {task.status}</span>
      <button onClick={handleEdit}>ویرایش کار</button>
      <button onClick={handleDelete}>حذف کار</button>
    </div>
  );
}
```

**After (extracted to i18n):**

```tsx
// src/components/task-list-item.tsx
import { useTranslation } from "@/hooks/use-i18n";

export function TaskListItem({ task }) {
  const { t } = useTranslation("tasks");

  return (
    <div>
      <span>
        {t("fields.status")}: {task.status}
      </span>
      <button onClick={handleEdit}>{t("actions.edit")}</button>
      <button onClick={handleDelete}>{t("actions.delete")}</button>
    </div>
  );
}
```

```json
// src/i18n/locales/fa/tasks.json
{
  "fields": {
    "status": "وضعیت"
  },
  "actions": {
    "edit": "ویرایش کار",
    "delete": "حذف کار"
  }
}
```

**Success Metrics:**

- ✅ Each batch tested before moving to next
- ✅ All hardcoded Persian extracted from batch components
- ✅ No console errors or missing keys
- ✅ Type checking passes for each batch
- ✅ Clean, logical commits per batch

**Implementation Steps:**

1. Start with Batch 2.2A (common components)
2. For each component in batch:
   - Extract Persian strings to JSON
   - Add useTranslation hook
   - Replace strings with t() calls
3. Run type checking: `bun run type:check`
4. Test in browser, check console
5. Commit batch
6. Move to next batch
7. Repeat until all batches complete

---

### Priority 2.3: Extract Persian Strings from Constants Files

**Goal**: Migrate Persian text from `src/constants/` to i18n JSON with helper utilities

**Current State:** Persian strings already organized in constants files, need to move to i18n

**Process:**

1. **Create utility for dynamic translations** (`src/lib/constants-i18n.ts`):

   ```typescript
   // Combines constants with i18n for lists that need labels
   import { i18n } from "@/i18n/i18n";
   import { TASK_STATUSES } from "@/constants/tasks";

   export function getTaskStatusOptions() {
     return Object.entries(TASK_STATUSES).map(([key, config]) => ({
       ...config,
       label: i18n.t(`tasks.status.${config.value}`),
     }));
   }
   ```

2. **Review constants files:**
   - `src/constants/tasks.ts`
   - `src/constants/projects.ts`
   - `src/constants/users.ts`
   - `src/constants/core.ts`
   - etc.

3. **For each constant file:**
   - Extract all Persian strings to appropriate namespace JSON
   - Keep value/config in constants, remove label
   - Create helper function for building labeled options
   - Update all usages to use helper function

4. **Example extraction:**

**Before (in constants):**

```typescript
// src/constants/tasks.ts
export const TASK_STATUSES = {
  TODO: { label: "انجام نشده", value: "todo" },
  IN_PROGRESS: { label: "در حال انجام", value: "in_progress" },
  DONE: { label: "انجام شده", value: "done" },
};

export const TASK_PRIORITIES = {
  LOW: { label: "پایین", value: "low" },
  MEDIUM: { label: "متوسط", value: "medium" },
  HIGH: { label: "بالا", value: "high" },
};
```

**After (in i18n):**

```json
// src/i18n/locales/fa/tasks.json
{
  "status": {
    "todo": "انجام نشده",
    "inProgress": "در حال انجام",
    "done": "انجام شده"
  },
  "priority": {
    "low": "پایین",
    "medium": "متوسط",
    "high": "بالا"
  }
}
```

**Constants file (now without labels):**

```typescript
// src/constants/tasks.ts
export const TASK_STATUSES = {
  TODO: { value: "todo" },
  IN_PROGRESS: { value: "in_progress" },
  DONE: { value: "done" },
};

export const TASK_PRIORITIES = {
  LOW: { value: "low" },
  MEDIUM: { value: "medium" },
  HIGH: { value: "high" },
};
```

**Helper utility for building labeled options:**

```typescript
// src/lib/constants-i18n.ts
import { i18n } from "@/i18n/i18n";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/constants/tasks";

export function getTaskStatusOptions() {
  return Object.entries(TASK_STATUSES).map(([, config]) => ({
    ...config,
    label: i18n.t(`tasks.status.${config.value}`),
  }));
}

export function getTaskPriorityOptions() {
  return Object.entries(TASK_PRIORITIES).map(([, config]) => ({
    ...config,
    label: i18n.t(`tasks.priority.${config.value}`),
  }));
}
```

**Component usage (for select/dropdown):**

```tsx
import { useTranslation } from "@/hooks/use-i18n";
import { getTaskStatusOptions } from "@/lib/constants-i18n";

export function StatusSelect({ value, onChange }) {
  const { t } = useTranslation("tasks");
  const options = getTaskStatusOptions();

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

**Component usage (for displays):**

```tsx
import { useTranslation } from "@/hooks/use-i18n";

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation("tasks");
  return <span>{t(`status.${status}`)}</span>;
}
```

**Success Metrics:**

- ✅ All Persian strings moved from constants to i18n JSON
- ✅ Constants files cleaned of labels (keep only values/configs)
- ✅ Helper utilities created for dynamic translations
- ✅ All components updated to use i18n or helpers
- ✅ No regression in functionality

**Implementation Steps:**

1. Review all `src/constants/` files for Persian strings
2. Extract Persian labels/text to appropriate namespace JSON
3. Update constants files to remove Persian text
4. Create helper utilities in `src/lib/constants-i18n.ts`
5. Find all usages of these constants in components
6. Update components to use `t()` for displays or helpers for lists
7. Test all affected components
8. Commit changes

---

## Phase 3: RTL Layout Configuration

### Priority 3.1: Configure RTL & Text Direction

**Goal**: Ensure full RTL layout support with proper text direction handling

**RTL Setup:**

1. **Set RTL globally** (`src/app.tsx`):

   ```typescript
   import { useEffect } from 'react';

   export function App() {
     useEffect(() => {
       document.documentElement.dir = 'rtl';
       document.documentElement.lang = 'fa';
     }, []);

     return <AppRoutes />;
   }
   ```

2. **Add RTL CSS utilities** (`src/styles/rtl.css`):

   ```css
   /* Logical properties for RTL support */
   [dir="rtl"] {
     direction: rtl;
     unicode-bidi: embed;
   }

   /* Isolate LTR content (URLs, code, technical IDs) */
   .ltr-text {
     direction: ltr;
     unicode-bidi: isolate;
     display: inline-block;
   }

   /* Isolated number formatting (show English numerals) */
   .en-numerals {
     font-feature-settings: "lnum" 1; /* Use lining numerals */
   }
   ```

3. **Update Tailwind CSS for RTL:**
   - Tailwind supports RTL via `dir` attribute
   - Use logical CSS properties where possible
   - Examples:

     ```tsx
     <!-- Space on right side in LTR, left side in RTL -->
     <div className="ml-4 rtl:ml-0 rtl:mr-4">Content</div>

     <!-- Flex direction auto-reverses in RTL -->
     <div className="flex rtl:flex-row-reverse">Items</div>

     <!-- Text alignment -->
     <div className="text-left rtl:text-right">Text</div>

     <!-- Border positions -->
     <div className="border-l rtl:border-l-0 rtl:border-r">Content</div>
     ```

4. **Handle dynamic content with LTR sections:**
   ```tsx
   // For URLs, task IDs, email addresses, etc.
   <p>
     شناسه کار: <span className="ltr-text">ABC-001</span>
   </p>
   ```

**Testing RTL:**

- ✅ All pages render correctly with RTL layout
- ✅ Text right-aligned in Persian
- ✅ Input fields accept Persian text
- ✅ Form validation messages right-aligned
- ✅ Dropdown menus correct in RTL
- ✅ Navigation menus correct in RTL
- ✅ Task IDs and URLs display correctly (not mirrored)
- ✅ No horizontal scrolling
- ✅ Modals and popovers positioned correctly

**Success Metrics:**

- ✅ `dir="rtl"` applied globally with proper unicode-bidi
- ✅ Component spacing correct in RTL (using `rtl:` variants)
- ✅ LTR content (URLs, IDs) isolated with `.ltr-text` class
- ✅ All input fields accept and display Persian text
- ✅ Navigation and menus correct in RTL
- ✅ Visual design intact and symmetrical in RTL
- ✅ No content bleeding or overflow issues

**Implementation Steps:**

1. Set `dir="rtl"` and `lang="fa"` in `src/app.tsx`
2. Create `src/styles/rtl.css` with RTL utilities
3. Audit components for LTR-specific spacing
4. Add `rtl:` variants where needed (focus on high-impact components)
5. Identify and wrap LTR content with `.ltr-text` class
6. Test all pages in RTL view:
   - Check text alignment
   - Verify spacing and margins
   - Test form inputs
   - Test navigation and dropdowns
   - Check modal/popover positioning
7. Fix any layout issues
8. Document RTL guidelines for developers

---

## Phase 4: Testing & Validation

### Priority 4.1: Testing Strategy (Concurrent with Extraction)

**Unit Tests:**

- Create test utilities for i18n in `src/test/i18n-utils.ts`
- Test translation key existence (verify all keys in JSON files exist)
- Test i18n configuration loads correctly
- Test custom `useTranslation` hook with type safety
- Example:

  ```typescript
  // src/test/i18n-utils.test.ts
  import { describe, it, expect } from "vitest";
  import { validateTranslationKeys } from "@/test/i18n-utils";

  describe("i18n translations", () => {
    it("should have all required keys in tasks namespace", () => {
      const result = validateTranslationKeys("tasks");
      expect(result.missing).toHaveLength(0);
    });
  });
  ```

**Component Tests:**

- Test components render with translations
- Verify `useTranslation` hook is used
- Test dynamic translations (interpolation with variables)
- Test translations with special characters/formatting
- Example:
  ```typescript
  it('renders task with translated status', () => {
    const { getByText } = render(<TaskListItem task={mockTask} />);
    expect(getByText('انجام نشده')).toBeInTheDocument();
  });
  ```

**E2E Tests:**

- All pages render in Persian i18n
- RTL layout on all pages
- Persian text input in forms
- Form validation messages in Persian
- Dropdowns with translated options
- Modal/dialog content in Persian

**Success Metrics:**

- ✅ Unit tests passing for i18n configuration
- ✅ Component tests passing with translations
- ✅ E2E tests passing for Persian UI
- ✅ No hardcoded Persian strings in components

**Implementation Steps:**

1. Create test utilities: `src/test/i18n-utils.ts`
2. Add unit tests for i18n configuration
3. Add component tests during extraction (test each batch)
4. Create E2E test suite for Persian interface
5. Run tests after each batch extraction
6. Fix any failing tests before moving to next batch

---

### Priority 4.2: Validation & Audit

**Validation Approach:**

1. **Check for hardcoded Persian in code** (should find nothing):

   ```bash
   # Script to validate no Persian text left in components
   # Save as scripts/validate-i18n.sh
   #!/bin/bash

   echo "Checking for hardcoded Persian in components..."

   # Search for Persian characters in JSX
   RESULTS=$(grep -r '[ـ-ي]' src/components src/pages \
     --include="*.tsx" --include="*.ts" \
     --exclude-dir=__tests__ \
     --exclude-dir=node_modules \
     | grep -v "i18n\|useTranslation\|t(\|\.test\|// " \
     | grep -v "url\|path\|href" || true)

   if [ -z "$RESULTS" ]; then
     echo "✓ No hardcoded Persian text found"
     exit 0
   else
     echo "✗ Found hardcoded Persian text:"
     echo "$RESULTS"
     exit 1
   fi
   ```

2. **Runtime validation** (check browser console):
   - Start dev server: `bun run dev:client`
   - Open browser console (F12)
   - Search for warnings starting with `i18next::missingKey`
   - If none appear, all keys exist
   - Filter console by "warning" to find any i18n issues

3. **Manual QA Checklist:**
   - [ ] All pages load without errors
   - [ ] No `i18next::missingKey` warnings in console
   - [ ] RTL layout correct on all pages
   - [ ] Text right-aligned in Persian
   - [ ] Form labels in Persian
   - [ ] Form validation messages in Persian
   - [ ] Error messages in Persian
   - [ ] Toast/notification messages in Persian
   - [ ] Button labels in Persian
   - [ ] Dynamic content (interpolation) renders correctly
   - [ ] Dropdown/select options have translated labels
   - [ ] Task IDs and URLs display correctly (not mirrored)
   - [ ] No layout breaking or overflow issues

**Validation Steps:**

1. Create validation script: `scripts/validate-i18n.sh`
2. Make script executable: `chmod +x scripts/validate-i18n.sh`
3. Run grep validation: `bash scripts/validate-i18n.sh`
4. Start app: `bun run dev:client` (in another terminal)
5. Open app at `http://localhost:5173`
6. Open browser DevTools console (F12)
7. Navigate through all pages and features
8. Check for any `i18next::missingKey` warnings
9. Fix any missing keys or hardcoded strings found
10. Re-run validation script
11. Verify all QA checklist items pass

**Success Metrics:**

- ✅ Validation script returns "No hardcoded Persian text found"
- ✅ No `i18next::missingKey` warnings in browser console
- ✅ All components render correctly with translations
- ✅ RTL layout correct throughout application
- ✅ All manual QA checklist items passing
- ✅ All tests passing

**Implementation Steps:**

1. Create `scripts/validate-i18n.sh` validation script
2. Run validation after each batch extraction
3. Fix any issues found during validation
4. Run full validation before final release
5. Add validation to pre-commit hook (optional)
6. Document common issues and fixes

---

## Implementation Sequence

### Phase 1: Setup & Audit (Estimated: 2-3 days)

1. **Priority 1.1**: i18next infrastructure
   - Install dependencies: `bun add i18next react-i18next`
   - Create `src/i18n/` directory structure
   - Create `src/i18n/config.ts` with configuration
   - Create `src/i18n/i18n.ts` to export instance
   - Create `src/i18n/types.ts` for type safety
   - Create custom hook: `src/hooks/use-i18n.ts`
   - Create placeholder JSON files for all namespaces
   - Initialize i18n in `src/main.tsx`
   - Test with simple component

2. **Priority 1.2**: Audit existing Persian text
   - Run audit scripts to identify Persian strings
   - Create `docs/i18n-audit.md` with findings
   - Categorize strings by namespace
   - Create extraction checklist

3. **Parallel**: Set RTL globally
   - Add `dir="rtl"` and `lang="fa"` to `src/app.tsx`
   - Create `src/styles/rtl.css` with utilities
   - Test RTL direction in browser

**Success Criteria:** i18next configured, RTL set, audit complete, ready to extract

---

### Phase 2: Text Extraction & Migration (Estimated: 2-3 weeks)

**Phase 2.1**: Type-safe translation setup

- Create translation types in `src/i18n/types.ts`
- Verify custom hook provides type safety
- Test IDE autocompletion for keys

**Phase 2.2**: Extract from components (batched)

**Batch 2.2A**: Common UI + Auth (10-15 components)

- Extract: `src/components/common/*`, `src/components/auth/*`
- Test and commit before next batch
- Update: `src/i18n/locales/fa/common.json`, `auth.json`

**Batch 2.2B**: Pages & Navigation (10-15 components)

- Extract: `src/pages/*`, `src/components/sidebar/*`
- Test all pages load correctly
- Update: `src/i18n/locales/fa/common.json`

**Batch 2.2C**: Tasks (20-25 components)

- Extract: `src/components/tasks/*`
- Test task features end-to-end
- Update: `src/i18n/locales/fa/tasks.json`

**Batch 2.2D**: Projects (15-20 components)

- Extract: `src/components/projects/*`
- Test project features
- Update: `src/i18n/locales/fa/projects.json`

**Batch 2.2E**: Forms & Users (15-20 components)

- Extract: `src/components/forms/*`, `src/components/users/*`
- Update: `src/i18n/locales/fa/forms.json`, `users.json`

**Batch 2.2F**: Reports & Utils (10-15 components)

- Extract: `src/components/reports/*`, `src/lib/*`
- Update: `src/i18n/locales/fa/reports.json`

_For each batch:_

1. Extract Persian strings to JSON
2. Add `useTranslation` hook
3. Replace strings with `t()` calls
4. Run `bun run type:check`
5. Test in browser
6. Check console for missing keys
7. Commit batch with descriptive message

**Phase 2.3**: Extract from constants (parallel with 2.2)

- Create `src/lib/constants-i18n.ts` helper utilities
- Review all `src/constants/` files
- Extract labels to i18n JSON
- Update constants to remove labels
- Update component usages (use helpers or `t()`)
- Test all affected components
- Commit changes

**Success Criteria:** All hardcoded Persian extracted, all components use `useTranslation`, no console warnings

---

### Phase 3: RTL Layout Configuration (Estimated: 1 week)

1. **Audit components for LTR-specific spacing**
   - Focus on high-impact components first
   - Identify all `ml-*`, `mr-*`, `pl-*`, `pr-*` classes

2. **Add RTL variants where needed**
   - Use Tailwind `rtl:` modifiers
   - Wrap LTR content (URLs, IDs) with `.ltr-text` class
   - Test each component in RTL view

3. **Comprehensive testing**
   - Test all pages in RTL view
   - Check text alignment
   - Verify spacing and margins
   - Test form inputs and validation
   - Test navigation and dropdowns
   - Check modal/popover positioning
   - Verify no horizontal scrolling

**Success Criteria:** Full RTL support, proper text direction, visual design intact

---

### Phase 4: Testing & Validation (Concurrent with extraction)

1. **Unit tests** (run after each batch)
   - Create test utilities: `src/test/i18n-utils.ts`
   - Test i18n configuration
   - Test translation key existence

2. **Component tests** (per batch)
   - Test components render with translations
   - Test dynamic translations
   - Run: `bun run test` (watch) or `bun run test:run`

3. **E2E tests**
   - Create test suite for Persian interface
   - Test all pages in RTL
   - Run: `bun run test:e2e`

4. **Validation & audit** (final)
   - Create `scripts/validate-i18n.sh`
   - Run validation: `bash scripts/validate-i18n.sh`
   - Check browser console for warnings
   - Manual QA checklist
   - Run `bun run check` (type + lint + format)

**Success Criteria:** All tests passing, no hardcoded Persian, no missing keys, RTL correct

---

### Recommended Timeline

- **Week 1**: Phase 1 (Setup & Audit)
- **Weeks 2-4**: Phase 2 (Extraction by batches)
- **Week 5**: Phase 3 (RTL Configuration)
- **Ongoing**: Phase 4 (Testing concurrent with work)
- **Final**: Full validation and release

---

## Risk Assessment & Mitigation

| Priority | Area             | Risk                         | Mitigation                          |
| -------- | ---------------- | ---------------------------- | ----------------------------------- |
| High     | Breaking changes | Components fail during i18n  | Test each batch, feature freeze     |
| High     | Missing keys     | UI shows `i18n::key` strings | Console warnings, validation checks |
| Medium   | RTL Layout bugs  | Layout broken in RTL         | Visual testing on all pages         |
| Medium   | Performance      | Slower initial load          | Lazy load namespaces, cache         |
| Low      | Type safety      | Translation key typos        | Strong TypeScript typing            |

### Mitigation Strategies

1. **Breaking Changes**: Extract by feature, test each batch thoroughly
2. **Missing Keys**: Run app and check console for warnings, use validation script
3. **RTL Issues**: Comprehensive visual testing before release
4. **Performance**: Lazy load by feature, use caching

---

## Success Criteria

### Phase 1 Complete: Infrastructure & Audit Ready

- ✅ i18next configured with `fa` locale and all required dependencies installed
- ✅ Directory structure created: `src/i18n/`, `src/i18n/locales/fa/`, namespace JSON files
- ✅ Custom `useTranslation` hook implemented with type safety
- ✅ i18n initialized in `src/main.tsx` before app render
- ✅ RTL globally applied: `dir="rtl"` and `lang="fa"` in HTML
- ✅ `src/styles/rtl.css` created with RTL utilities
- ✅ All Persian text audited and categorized by namespace
- ✅ `docs/i18n-audit.md` created with complete inventory
- ✅ Extraction checklist prepared for Phase 2

**Verification:**

- App loads with RTL direction in browser
- `useTranslation` hook works in test component
- No errors in browser console related to i18n
- TypeScript compilation succeeds with custom hook

---

### Phase 2 Complete: Text Extraction Done

**Component Extraction:**

- ✅ All hardcoded Persian extracted from all component batches (2.2A-2.2F)
- ✅ All components using custom `useTranslation` hook
- ✅ No hardcoded Persian remaining in `src/components/` and `src/pages/`
- ✅ Batch extraction commits are logical and well-documented
- ✅ Type checking passes for all extracted components

**Constants Migration:**

- ✅ All Persian labels extracted from `src/constants/` to i18n JSON
- ✅ Constants files cleaned (keep only values/configs, no labels)
- ✅ Helper utilities created in `src/lib/constants-i18n.ts`
- ✅ All component usages updated to use helpers or `t()` calls
- ✅ No regression in component functionality

**JSON Structure:**

- ✅ All namespace JSON files populated with Persian text
- ✅ Keys follow camelCase, hierarchical structure
- ✅ All keys referenced in components exist in JSON
- ✅ No missing or orphaned keys

**Verification:**

- `bash scripts/validate-i18n.sh` returns "No hardcoded Persian text found"
- `bun run type:check` passes with no errors
- Browser console shows no `i18next::missingKey` warnings
- All components render correctly with translations

---

### Phase 3 Complete: RTL Layout Perfect

- ✅ All components audited for LTR-specific spacing
- ✅ RTL variants added to high-impact components (ml→mr, pl→pr, etc.)
- ✅ LTR content (URLs, IDs, emails) wrapped with `.ltr-text` class
- ✅ All pages tested in RTL view:
  - Text properly right-aligned
  - Spacing and margins correct
  - Form inputs work properly
  - Navigation menus correct
  - Dropdowns/modals positioned correctly
  - No horizontal scrolling
- ✅ Visual design intact and symmetrical in RTL
- ✅ No content bleeding or overflow issues

**Verification:**

- All pages render correctly in RTL view
- Layout matches LTR design but mirrored appropriately
- No visual regressions reported in manual testing
- Responsive design works in RTL on all screen sizes

---

### Phase 4 Complete: Fully Tested & Validated

**Unit Tests:**

- ✅ Test utilities created: `src/test/i18n-utils.ts`
- ✅ i18n configuration tests passing
- ✅ Translation key existence tests passing
- ✅ Custom hook type safety verified

**Component Tests:**

- ✅ Components render with correct translations
- ✅ Dynamic translations (interpolation) work correctly
- ✅ No warnings about missing translation keys
- ✅ All relevant components have test coverage

**E2E Tests:**

- ✅ All pages render in Persian i18n
- ✅ RTL layout verified on all pages
- ✅ Form inputs accept Persian text
- ✅ Form validation messages display in Persian
- ✅ Navigation and interactions work correctly
- ✅ All E2E tests passing

**Validation & Audit:**

- ✅ `scripts/validate-i18n.sh` script created and working
- ✅ Validation script returns clean results (no hardcoded Persian)
- ✅ No `i18next::missingKey` warnings in browser console
- ✅ Manual QA checklist all items passing
- ✅ `bun run check` (type + lint + format) passes

---

### Release Ready: Production Deployment

- ✅ All code quality checks passing: `bun run check`
- ✅ All tests passing: `bun run test:all`
- ✅ Application fully functional in Persian/RTL
- ✅ Performance acceptable (no regressions in load time)
- ✅ Documentation complete:
  - `docs/i18n-setup.md` - Setup guide
  - `docs/i18n-audit.md` - String inventory
  - `src/i18n/README.md` - Module documentation
  - Developer workflow documented in this plan
- ✅ Developer workflow guide created with examples
- ✅ PR checklist for i18n changes documented
- ✅ Common patterns and best practices documented
- ✅ RTL guidelines documented for future development

**Final Checks:**

- Build succeeds: `bun run build`
- App runs in production mode
- All features tested end-to-end
- No console errors or warnings
- Ready for deployment

---

## Developer Workflow After Migration

### Adding New UI Text

1. **Add to appropriate Persian JSON file:**

   ```json
   // src/i18n/locales/fa/namespace.json
   {
     "section": {
       "newFeature": "متن ویژگی جدید"
     }
   }
   ```

2. **Use in component with proper hook:**

   ```tsx
   import { useTranslation } from "@/hooks/use-i18n";

   export function NewFeature() {
     const { t } = useTranslation("namespace");
     return <div>{t("section.newFeature")}</div>;
   }
   ```

3. **For dynamic translations (interpolation):**

   ```json
   // src/i18n/locales/fa/tasks.json
   {
     "messages": {
       "taskAssigned": "کار {{taskName}} به {{userName}} اختصاص داده شد"
     }
   }
   ```

   ```tsx
   const { t } = useTranslation("tasks");
   return (
     <p>
       {t("messages.taskAssigned", {
         taskName: task.name,
         userName: user.name,
       })}
     </p>
   );
   ```

4. **For lists with labels (statuses, priorities, etc.):**

   ```json
   // src/i18n/locales/fa/tasks.json
   {
     "status": {
       "todo": "انجام نشده",
       "inProgress": "در حال انجام",
       "done": "انجام شده"
     }
   }
   ```

   ```tsx
   import { useTranslation } from "@/hooks/use-i18n";
   import { getTaskStatusOptions } from "@/lib/constants-i18n";

   export function StatusSelect() {
     const { t } = useTranslation("tasks");
     const options = getTaskStatusOptions(); // Gets labels from i18n

     return (
       <select>
         {options.map((opt) => (
           <option key={opt.value} value={opt.value}>
             {opt.label}
           </option>
         ))}
       </select>
     );
   }
   ```

5. **Run validation before committing:**
   ```bash
   bun run type:check        # Verify types
   bun run format            # Format code
   bash scripts/validate-i18n.sh  # Verify no hardcoded Persian
   ```

### Best Practices

1. **Key Naming**:
   - Use camelCase for keys
   - Use hierarchical structure: `namespace.section.key`
   - Be descriptive: `buttons.saveDraft` not `buttons.save`
   - Example: `tasks.actions.editTask`, `forms.validation.required`

2. **Never hardcode Persian**:
   - All Persian text must go in JSON files
   - No inline Persian strings in JSX or TypeScript
   - Use `t()` hook for all user-facing text

3. **LTR Content**:
   - Wrap URLs, email addresses, technical IDs with `<span className="ltr-text">`
   - Example: `<span className="ltr-text">user@example.com</span>`
   - Task IDs like `ABC-001` should also be wrapped

4. **Testing**:
   - Test component with new translation
   - Check browser console for missing keys
   - Verify RTL layout if adding form inputs

5. **Commits**:
   - Include both JSON and component changes
   - Use conventional commits: `feat(i18n): add [feature] translations`
   - Reference which namespace was updated

### PR Checklist for i18n Changes

Before submitting a pull request with translation changes:

- [ ] All Persian text added to appropriate JSON file
- [ ] Keys use camelCase and hierarchical structure
- [ ] Custom `useTranslation` hook used (not direct react-i18next)
- [ ] Type checking passes: `bun run type:check`
- [ ] No hardcoded Persian in components: `bash scripts/validate-i18n.sh`
- [ ] Components tested in browser
- [ ] No `i18next::missingKey` warnings in console
- [ ] Validation script passes
- [ ] Commit message describes what was added/changed

### Common Patterns

**Pattern 1: Simple label**

```json
{ "buttons": { "submit": "ارسال" } }
```

```tsx
const { t } = useTranslation("common");
return <button>{t("buttons.submit")}</button>;
```

**Pattern 2: Plural forms** (if needed)

```json
{
  "messages": {
    "tasks_one": "{{count}} کار",
    "tasks_other": "{{count}} کار"
  }
}
```

```tsx
// i18next handles plural forms automatically
t("messages.tasks", { count: 5 });
```

**Pattern 3: Conditional content**

```tsx
const { t } = useTranslation("tasks");
return (
  <span>{task.completed ? t("status.done") : t("status.inProgress")}</span>
);
```

**Pattern 4: Dynamic lists from constants**

```tsx
// Constants file (no labels)
export const PRIORITIES = {
  LOW: { value: "low", color: "blue" },
  MEDIUM: { value: "medium", color: "yellow" },
  HIGH: { value: "high", color: "red" },
};

// i18n utility
export function getPriorityOptions() {
  return Object.entries(PRIORITIES).map(([, config]) => ({
    ...config,
    label: i18n.t(`tasks.priority.${config.value}`),
  }));
}

// Component
const options = getPriorityOptions();
options.map((opt) => <div key={opt.value}>{opt.label}</div>);
```

---

## Dependencies & Prerequisites

### Required Packages

```json
{
  "i18next": "^23.x",
  "react-i18next": "^14.x"
}
```

**Note:** No `i18next-browser-languagedetector` needed (Persian-only, no language switching)

### Dev Dependencies

None required. Validation is done via grep scripts and browser console inspection.

### Existing Dependencies Already in Project

- `date-fns-jalali` - Jalali calendar support
- `@persian-tools/persian-tools` - Persian utilities
- Tailwind CSS - RTL support

### Architecture Note

Since Anjam is a pure Vite SPA (no server-side rendering):

- All i18n logic runs client-side
- No server-side translation API needed
- PocketBase backend is data-only (not involved in i18n)
- All Persian text management is frontend-only
- No need for `i18next-http-backend` (not required for SPA)

---

## Documentation to Create

1. **`docs/i18n-setup.md`**: Setup and installation guide
2. **`docs/i18n-audit.md`**: Complete Persian string inventory
3. **`docs/i18n-extraction-guide.md`**: Step-by-step extraction process
4. **`docs/i18n-glossary.md`**: Persian terminology reference
5. **`src/i18n/README.md`**: i18n module structure

---

## Next Steps

1. **Review & Approve**: Review updated plan with team
   - Verify batched extraction approach is acceptable
   - Confirm type-safe translation implementation
   - Approve timeline and resource allocation

2. **Phase 1 - Setup & Audit** (Start immediately after approval)
   - Install i18next dependencies
   - Create directory structure and config
   - Implement custom `useTranslation` hook
   - Run audit scripts
   - Document findings

3. **Phase 2A - Extract Common & Auth** (After Phase 1 complete)
   - Extract from `src/components/common/*`
   - Extract from `src/components/auth/*`
   - Test batch thoroughly
   - Commit batch

4. **Phase 2B-2F** - Continue extraction by batch
   - Follow same process: extract → test → commit
   - Run validation after each batch
   - Address any issues before moving to next batch

5. **Phase 2.3 - Constants Migration** (Parallel with 2.2)
   - Create helper utilities
   - Extract labels from constants
   - Update component usages

6. **Phase 3 - RTL Configuration** (After most extraction done)
   - Audit spacing in components
   - Add RTL variants
   - Test all pages

7. **Phase 4 - Testing & Validation** (Concurrent throughout)
   - Run tests after each batch
   - Create validation scripts
   - Run comprehensive QA

8. **Release** - Deploy migration
   - Final validation
   - Documentation review
   - Production deployment

---

## Key Changes from Original Plan

This updated plan addresses the following improvements:

1. **Type Safety**: Added custom `useTranslation` hook with TypeScript types to catch errors at compile time rather than runtime

2. **Smaller Batches**: Changed from 3 large phases (50+, 100+, 50+ components) to 6 smaller batches (10-25 components each) for better testing and faster feedback

3. **Constants Handling**: Added helper utility pattern (`src/lib/constants-i18n.ts`) to handle dynamic translations from constants without breaking component logic

4. **RTL Depth**: Expanded RTL section with:
   - Proper `unicode-bidi` handling for mixed LTR/RTL content
   - `.ltr-text` class for isolating URLs, IDs, email addresses
   - Comprehensive CSS utilities for RTL support
   - Detailed testing checklist

5. **Testing Strategy**: Moved testing to be concurrent with extraction rather than final phase:
   - Test each batch as it's extracted
   - Validation script created and used early
   - Catches issues faster

6. **Developer Workflow**: Added extensive documentation on:
   - How to add new strings (with examples)
   - Best practices and naming conventions
   - Common patterns (interpolation, lists, conditionals)
   - PR checklist for i18n changes

7. **Validation Script**: Created `scripts/validate-i18n.sh` with better Persian detection and filtering

8. **Success Criteria**: Detailed criteria for each phase completion with verification steps

9. **Timeline**: Added estimated durations and dependencies between phases

---

**Plan Status**: Updated and Ready for Implementation
**Last Updated**: 2025-12-28
**Version**: 2.0 (Updated with batch extraction and type safety)
**Approval**: [Pending review and team feedback]
