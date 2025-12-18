# Comprehensive UI/UX Audit & Actionable Improvement Plan

This living document integrates findings from the **[UI/UX Audit Report](./UI_UX_AUDIT_REPORT.md)** and previous system reviews. It provides a roadmap for modernizing the Task Management System (Persian/RTL), prioritizing critical fixes, structural improvements, and strategic design overhauls.

---

## Phase 1: Critical Bug Fixes & Stability

**Goal:** Stop the bleeding. Resolve blocking issues, crashes, and data integrity gaps immediately.
**Timeline:** Sprint 0-1

### 1.1 Form Validation & Logic Issues

- [x] **Fix `CreateGroup` Form Validation** (High Priority)
  - **Issue:** Form fails submission regardless of "Existing" or "New" manager selection due to incorrect Zod schema logic.
  - **Action:** Refactor `src/pages/create-group.tsx` schema to conditionally require fields based on `managerMode`.
- [x] **Enforce Mandatory Fields in `CreateTask`**
  - **Issue:** Users can create "ghost tasks" without Titles or Due Dates.
  - **Action:** Update `src/components/forms/task-fields.tsx` to require Title and Due Date. Add inline error messages (e.g., "عنوان الزامی است").

### 1.2 System Stability

- [x] **Fix `EditUser` Page Crash**
  - **Issue:** White-screen crash (`Cannot destructure property...`) when editing users.
  - **Action:** Implement a `try/catch` block or Error Boundary in `src/pages/edit-user.tsx` and ensure `useUser` data is loaded before destructuring.

### 1.3 Data Integrity & Visibility

- [x] **Synchronization of Dashboard KPIs**
  - **Issue:** Metric mismatch (e.g., "Overdue: 20" vs. List Count: 3).
  - **Action:** Audit backend queries for dashboard cards and list views to ensure identical filtering logic (e.g., `deadline < NOW()` alignment).
- [x] **Clarify Metrics Context**
  - **Action:** Add tooltips or subtitles to KPI cards defining the scope (e.g., "Based on all time" or "This Week").

---

## Phase 2: Quick Wins (UI/UX & Heuristics)

**Goal:** Align with real-world mental models and Nielsen’s heuristics.
**Timeline:** Sprint 1-3

### 2.1 Terminology & Mental Models (Match between System & World)

- [x] **Standardize Terminology**
  - **Decision:** Use **"تسک" (Task)** exclusively. Remove "وظیفه".
  - **Action:** Global find/replace in localization files/constants.
- [x] **Mental Model Alignment**
  - **Issue:** Navigation mixes Status (To-Do), Time (Due Today), and Ownership (My Tasks).
  - **Action:** Visually distinguish these filters in the UI (e.g., use Chips for Status, toggle for Ownership) rather than treating them as identical navigation links.

### 2.2 User Control & Error Prevention

- [x] **Undo / Soft Delete**
  - **Issue:** Destructive actions are instant.
  - **Action:** Implement a standard "Toast with Undo" (5-second duration) for deleting Tasks and Notifications.
- [x] **Theme Toggle Clarity**
  - **Action:** Update the theme switcher to clearly indicate the current state (Light / Dark / System) with icons/labels.
- [x] **Friendly Empty States**
  - **Action:** Replace blank screens in **Timesheet** and **Calendar** with illustrated empty states and a clear "Create" CTA.

### 2.3 Visual Modernization (Basics)

- [ ] **Consistent Typography Scale**
  - **Action:** Enforce a strict scale:
    - Page Titles: **24–28pt** (Bold)
    - Section Headers: **16–18pt** (Medium)
    - Body Text: **14–16pt** (Regular)
- [ ] **Number Formatting**
  - **Action:** Ensure all numerals use Persian digits (۰-۹) consistently.
- [x] **Metadata scanning**
  - **Action:** Update list items (Recent Activity, Overdue) to show **Assignee Avatar**, **Priority Pill**, and **Due Date colors** to aid recognition rather than recall.

---

## Phase 3: Structural Improvements (IA & Features)

**Goal:** Clean up the Information Architecture and empower power users.
**Timeline:** Sprint 2-6

### 3.1 Navigation & Layout Overhaul

- [x] **Split Navigation (Workspace vs. Admin)**
  - **Action:** Create two distinct sections in the Sidebar:
    - **Workspace:** Dashboard, Projects, Tasks, Calendar, My Tasks.
    - **Admin:** Users, Groups, Tags, Reports, Timesheet, Settings.
- [x] **Collapsible Sidebar**
  - **Action:** Implement a toggle to collapse the sidebar to an icons-only rail to maximize workspace.

### 3.2 Efficiency & Flexibility

- [x] **Global Search**
  - **Action:** Implement a header search bar querying Tasks, Projects, and Users simultaneously.
- [x] **Smart Quick Actions**
  - **Action:** Update the Dashboard "Quick Actions" to be context-aware (e.g., "Review Overdue" if overdue > 0, "Assign Unassigned").
- [x] **Saved Filters / Views**
  - **Action:** Allow users to save properties (e.g., "My High Priority Tasks") as a preset filter tab.

### 3.3 Bulk Actions

- [ ] **Batch Operations**
  - **Action:** Add checkboxes to Task, Notification, and User lists. Show a floating action bar for "Bulk Delete", "Mark Read", or "Change Status".

---

## Phase 4: Strategic Design & Tech Overhaul (Long Term)

**Goal:** Enterprise-grade maturity, accessibility, and visual supremacy.
**Timeline:** Sprint 6+

### 4.1 Design System 2.0 (RTL-First)

- [ ] **Component Library Refactor**
  - **Action:** Build a cohesive library using tokens for Spacing (8pt grid), Colors (Semantic Success/Warning/Error), and Typography.
  - **Action:** Ensure all components use logical CSS properties (e.g., `margin-inline-start`) for native RTL support.
- [ ] **Accessibility (WCAG 2.1 AA)**
  - **Contrast:** Ensure 4.5:1 text contrast ratio (fix gray text on dark cards).
  - **Touch Targets:** Minimum 44x44px for all mobile interactive elements.
  - **Focus States:** High-visibility focus rings for keyboard navigation.
  - **Screen Reader:** ARIA labels on all icon-only buttons (Sidebar, Actions).

### 4.2 Advanced Analytics & Reporting

- [ ] **Interactive Insights**
  - **Action:** Replace static "Report" tables with interactive charts (Recharts) that allow clicking to drill down into data.
- [ ] **Insights over Raw Data**
  - **Action:** Instead of just charts, provide text insights (e.g., "Productivity is up 20% this week").

### 4.3 Onboarding & Contextual Help

- [ ] **First-Run Experience**
  - **Action:** specific onboarding flow for Admins vs. Members.
- [ ] **Contextual Tooltips**
  - **Action:** Add "Helper" icons (?) to complex forms explaining fields like "Weight" or "Priority logic".

### 4.4 Role-Based Experiences

- [ ] **Adaptive Dashboards**
  - **Action:** Tailor Dashboard widgets based on user role (e.g., Admins see System Health/User stats; Members see My Tasks/Due Today).
- [ ] **Permission-Aware Navigation**
  - **Action:** Dynamic Sidebar that hides "Admin" sections completely for non-admin users to reduce noise.

---

## Testing & Validation Strategy

- **Automated A11y Tests:** Weekly runs of Lighthouse/Axe to catch contrast/ARIA regressions.
- **User Heuristic Checks:** Validate "Undo", "Error Recovery", and "Navigation Logic" with internal testing sessions.
- **Performance:** Monitor Dashboard TTI (Time to Interactive) with heavy data loads.
