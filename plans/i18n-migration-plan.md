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

### Priority 2.1: Extract Hardcoded Strings from Components

**Goal**: Move hardcoded Persian text from components to i18n JSON and replace with `t()` calls

**Process:**

1. **For each component with hardcoded Persian:**
   - Extract string to appropriate namespace JSON
   - Replace with `t('key')` call
   - Add `useTranslation('namespace')` hook
   - Test component renders correctly

2. **Example extraction:**

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
import { useTranslation } from "react-i18next";

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

**Extraction Strategy (Priority Order):**

1. **Phase 2A**: High-impact UI (50+ components)
   - `src/pages/*`
   - `src/components/common/*`
   - `src/components/auth/*`

2. **Phase 2B**: Feature-specific (100+ components)
   - `src/components/tasks/*`
   - `src/components/projects/*`
   - `src/components/users/*`

3. **Phase 2C**: Remaining components (50+ components)
   - `src/components/reports/*`
   - `src/components/sidebar/*`
   - `src/components/forms/*`
   - `src/lib/*`

**Success Metrics:**

- ✅ All hardcoded Persian strings extracted from components
- ✅ All components using `useTranslation()`
- ✅ No hardcoded Persian in JSX
- ✅ JSON files properly structured hierarchically

**Implementation Steps:**

1. Start with Phase 2A components
2. For each component:
   - Extract Persian strings to JSON
   - Add useTranslation hook
   - Replace strings with t() calls
   - Test component
3. Commit in logical feature batches
4. Run type checking after each batch: `bun run type:check`

---

### Priority 2.2: Extract Persian Strings from Constants Files

**Goal**: Migrate Persian text from `src/constants/` to i18n JSON

**Current State:** Persian strings already organized in constants files, need to move to i18n

**Process:**

1. **Review constants files:**
   - `src/constants/tasks.ts`
   - `src/constants/projects.ts`
   - `src/constants/users.ts`
   - `src/constants/core.ts`
   - etc.

2. **For each constant file:**
   - Extract all Persian strings to appropriate namespace JSON
   - Remove from constants file (or convert to keys that reference i18n)
   - Update all imports/usages to use `t()` instead of constant

3. **Example extraction:**

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

**Component usage:**

```tsx
import { useTranslation } from "react-i18next";
import { TASK_STATUSES } from "@/constants/tasks";

export function StatusBadge({ status }) {
  const { t } = useTranslation("tasks");

  return <span>{t(`status.${status}`)}</span>;
}
```

**Success Metrics:**

- ✅ All Persian strings moved from constants to i18n JSON
- ✅ Constants files cleaned of labels (keep only values/configs)
- ✅ All components updated to use i18n
- ✅ No regression in functionality

**Implementation Steps:**

1. Review all `src/constants/` files for Persian strings
2. Extract Persian labels/text to appropriate namespace JSON
3. Update constants files to remove Persian text
4. Find all usages of these constants in components
5. Update components to use `t()` for labels
6. Test all affected components
7. Commit changes

---

## Phase 3: RTL Layout Configuration

### Priority 3.1: Configure RTL & Spacing

**Goal**: Ensure full RTL layout support

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

2. **Update Tailwind CSS for RTL:**
   - Tailwind supports RTL via `dir` attribute
   - Use logical CSS properties where possible
   - Example:
     ```tsx
     <div className="ml-4 rtl:mr-4 rtl:ml-0">Content</div>
     ```

3. **Review spacing in components:**
   - Check all margin/padding classes
   - Update LTR-specific spacing with RTL variants
   - Focus on high-impact components (lists, grids, forms)

**Testing RTL:**

- ✅ All pages render correctly with RTL layout
- ✅ Text right-aligned in Persian
- ✅ Input fields support Persian text
- ✅ Dropdown menus correct in RTL
- ✅ Navigation menus correct in RTL
- ✅ No horizontal scrolling

**Success Metrics:**

- ✅ `dir="rtl"` applied globally
- ✅ Component spacing correct in RTL
- ✅ All input fields accept Persian text
- ✅ Navigation correct in RTL
- ✅ Visual design intact in RTL

**Implementation Steps:**

1. Set `dir="rtl"` in `src/app.tsx`
2. Audit components for LTR-specific spacing
3. Add RTL variants where needed
4. Test all pages in RTL view
5. Fix any layout issues
6. Document RTL guidelines for developers

---

## Phase 4: Testing & Validation

### Priority 4.1: Testing Strategy

**Unit Tests:**

- Translation key existence tests
- i18n configuration tests
- Component translation rendering

**Component Tests:**

- Verify all components use `useTranslation`
- Check no hardcoded Persian in JSX
- Test dynamic translations (interpolation, pluralization)

**E2E Tests:**

- All pages render in Persian i18n
- RTL layout on all pages
- Persian text input in forms
- Form validation messages in Persian

**Success Metrics:**

- ✅ No hardcoded Persian strings in components (grep verification)
- ✅ All translation keys exist
- ✅ Unit tests passing
- ✅ E2E tests passing

**Implementation Steps:**

1. Create test utilities for i18n
2. Add unit tests for i18n integration
3. Create E2E tests for Persian interface
4. Add CI/CD check: no hardcoded Persian in `src/components/`
5. Run full test suite

---

### Priority 4.2: Validation & Audit

**Validation Approach:**

1. **Check for hardcoded Persian in code** (should find nothing):

   ```bash
   # Script to validate no Persian text left in components
   grep -r '[ـ-ي]' src/components src/pages --include="*.tsx" \
     --exclude-dir=__tests__ | grep -v "i18n\|t(" | grep -v "url\|path" || echo "✓ All Persian text extracted"
   ```

2. **Runtime validation** (check browser console):
   - Start dev server: `bun run dev:client`
   - Open browser console (F12)
   - Look for `i18next::missingKey` warnings
   - If none appear, all keys exist

3. **Manual QA Checklist:**
   - [ ] All pages render without missing key warnings
   - [ ] No console errors related to i18n
   - [ ] RTL layout correct on all pages
   - [ ] Form validation messages in Persian
   - [ ] Error messages in Persian
   - [ ] Notification messages in Persian
   - [ ] All dynamic content (interpolation) renders correctly

**Success Metrics:**

- ✅ No hardcoded Persian in code (grep returns nothing)
- ✅ No missing key warnings in browser console
- ✅ All components render correctly
- ✅ All translations populate expected values

**Implementation Steps:**

1. Create validation script: `scripts/validate-i18n.sh`
2. Run grep validation to check for hardcoded Persian
3. Start app in dev mode and review browser console
4. Fix any missing keys or hardcoded strings found
5. Test all pages and features
6. Add validation to pre-commit hook or CI/CD (optional)

---

## Implementation Sequence

### Phase 1: Setup & Audit

- Priority 1.1: i18next infrastructure
- Priority 1.2: Audit existing Persian text
- Create directory structure
- Set RTL globally

### Phase 2: Extract Text

**Phase 2A**: Extract from high-impact components

- Pages and common components
- Auth components

**Phase 2B**: Extract from feature components

- Task, project, user components

**Phase 2C**: Extract from remaining components

- Reports, sidebar, forms, utilities

**Phase 2 Parallel**: Extract from constants

- Review all `src/constants/` files
- Move Persian labels to i18n
- Update component usages

### Phase 3: RTL Configuration

- Set up RTL globally
- Update spacing/layout
- Test all pages

### Phase 4: Testing & Validation

- Unit and E2E tests
- Automated validation
- Manual QA

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

### Phase 1 Complete

- ✅ i18next configured with `fa` locale
- ✅ All Persian text audited and categorized
- ✅ RTL globally applied
- ✅ Directory structure created

### Phase 2 Complete

- ✅ All hardcoded Persian extracted from components
- ✅ All Persian labels extracted from constants
- ✅ All components using `useTranslation()`
- ✅ No hardcoded Persian remaining

### Phase 3 Complete

- ✅ RTL layout correct throughout
- ✅ Spacing/alignment fixed for RTL
- ✅ Visual design intact in RTL

### Phase 4 Complete

- ✅ All tests passing
- ✅ No missing keys
- ✅ No hardcoded Persian strings
- ✅ Application fully functional

### Release Ready

- ✅ Full application tested in Persian/RTL
- ✅ Performance acceptable
- ✅ Documentation updated
- ✅ Developer guide for adding new strings

---

## Developer Workflow After Migration

### Adding New UI Text

1. **Add to Persian JSON:**

   ```json
   // src/i18n/locales/fa/namespace.json
   {
     "newFeature": "متن ویژگی جدید"
   }
   ```

2. **Use in component:**

   ```tsx
   const { t } = useTranslation("namespace");
   return <div>{t("newFeature")}</div>;
   ```

3. **Validate:**
   ```bash
   bun run validate:i18n
   ```

### Best Practices

1. **Key Naming**: Use camelCase, hierarchical structure (`namespace.section.key`)
2. **Never hardcode**: All Persian text must go in JSON
3. **Test**: Test component with new translation
4. **Commit**: Include JSON changes and component updates

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

1. **Review & Approve**: Review plan with team
2. **Setup**: Install dependencies and create structure
3. **Audit**: Run audit scripts and categorize strings
4. **Extract Phase 2A**: High-impact components
5. **Extract Phase 2B-C**: Remaining components
6. **Extract Constants**: Persian labels from constants
7. **RTL Setup**: Configure RTL layout
8. **Test & Validate**: Run tests and validation
9. **Release**: Deploy migration

---

**Plan Status**: Ready for Implementation
**Last Updated**: 2025-12-28
**Approval**: [Pending]
