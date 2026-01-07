# Convex Migration QA Smoke (2026-01-07)

Branch: `feat/convex-migration`

## Environment

- Dev command: `bun run dev`
- Vite: `http://127.0.0.1:5173` (strict port)
- Convex: `bunx convex dev` (runs alongside Vite via `concurrently`)

## Goal

Validate core flows after Convex migration:

- Create project + tasks
- Update task status + priority
- Task board
- Comments + mentions + reactions
- Tags + assign tags to tasks
- Task list filters

## Data created during this run

- Organization: `Cloud Org 1` (existing)
- Project: `QA Project` (code `XQQ`)
- Tasks:
  - `QA Task 1` (display `XQQ-001`) — status changed to `in_progress`, priority changed to `urgent`
  - `QA Task 2` (display `XQQ-002`) — status `todo`, priority `low`, tag `QA`
- Tags:
  - `QA` (created) — blue
  - `Bug` (existing)

## Steps taken (reproducible)

1. Start dev servers:
   - `bun run dev`
   - Open `http://127.0.0.1:5173/`
2. Go to Projects:
   - Sidebar → `همه پروژه‌ها` → `تعریف پروژه جدید`
   - Create project:
     - Name: `QA Project`
     - Description: `Project created during Convex QA smoke.`
3. Open the project:
   - Click `QA Project`
4. Create Task 1:
   - `تسک جدید برای این پروژه`
   - Title: `QA Task 1`
   - Description: `First QA task description.`
   - Priority: set to `بالا`
   - Create task
5. Add comment + mention to Task 1:
   - Comment text: `QA comment 1 mentioning @clouduser1`
   - Click `ارسال`
6. Add a reaction to the comment:
   - Click `👍`
7. Edit Task 1:
   - Click `ویرایش`
   - Change Status: `در دست اجرا`
   - Change Priority: `فوری`
   - (Optional) Assign tag via tags combobox (attempted in edit flow)
   - Click `ذخیره`
8. Create Tag:
   - Sidebar → `تگ‌ها` → `افزودن برچسب`
   - Name: `QA`
   - Color: `آبی`
   - Click `ایجاد`
9. Create Task 2:
   - Navigate back to `QA Project` → `تسک جدید برای این پروژه`
   - Title: `QA Task 2`
   - Description: `Second QA task. Should be TODO low priority.`
   - Priority: `پایین`
   - Tags: select `QA`
   - Create task
10. Validate task filtering:

- Navigate to `/tasks`
- Set filter Status: `در دست اجرا` → expect `QA Task 1` only
- Set filter Priority: `فوری` → still expect `QA Task 1` only
- Set filter Tag: `QA` (id in URL) → still expect `QA Task 1` only (works for Task 1 once tagged; otherwise filter still shows `QA Task 1` because it has tag in current dataset)
- Click `بازنشانی` to clear filters

11. Attempt to open Task Board:

- From Project page → click `برد تسک‌ها` (navigates to `/projects/:id/board`)

## Issues found

### 1) Project board crashes with infinite update loop

- Where: Project board route (example: `/projects/ks781z41gxfdm0z34xctxemzsh7yr74x/board`)
- Symptom: Error boundary shows:
  - `Maximum update depth exceeded...`
- Impact: Task board is unusable for projects.
- Notes: Reproduces consistently (even after clicking `تلاش مجدد`).

### 2) Comment reactions show UI change but backend update not implemented

- Where: Task details → comment reaction buttons (e.g. `👍`)
- Symptom:
  - UI toggles the reaction state
  - Console warning: `Update comment not implemented in Convex yet` (from `src/hooks/comments.ts`)
- Impact: Reactions likely not persisted / inconsistent across reloads.

### 3) Mentions do not produce notification / “mentions” list stays empty

- Where:
  - Add comment mentioning `@clouduser1`
  - Navigate to `/notifications`
- Symptom:
  - Notifications show `کل اعلان‌ها: ۰`
  - Mentions section shows `۰`
- Expected: Mention should generate a notification/mention entry for the mentioned user (or at least appear in mentions list).

### 4) Projects page still logs nested button hydration warnings

- Where: `/projects`
- Symptom (console):
  - `In HTML, <button> cannot be a descendant of <button>... hydration error`
- Notes: Seen when clicking `همه پروژه‌ها` in the sidebar and loading `/projects`.

## Gaps / Not tested in this run

- Drag-and-drop on board (blocked by board crash).
- Saved filters persistence UX (just basic filters via URL were validated).
- Email verification (explicitly skipped).

## Re-test (later same day)

### Result summary

- ✅ Project board no longer crashes on `/projects/:id/board`.
- ✅ `/projects` no longer logs nested `<button>` hydration warnings (no warnings observed in console during navigation).
- ⚠️ Drag-and-drop behavior was not reliably validated via Playwright (needs manual QA).
- ⚠️ Mentions/notifications behavior still needs a dedicated multi-user test (invite a second user and verify mention notifications for that user).

### Notes

- Playwright navigation across multiple pages logs Chromium warnings like:
  - `Blocked attempt to show a 'beforeunload' confirmation panel...`
    These appear to be browser/automation related and were not correlated with an in-app error boundary.
