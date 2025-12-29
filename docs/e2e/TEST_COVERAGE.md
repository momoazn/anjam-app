# E2E Test Coverage - User Story Mapping

This document maps all 91 user stories to their corresponding E2E test files.

## Coverage Summary

| Category                       | Total Stories | Implemented | Stubbed | Coverage |
| ------------------------------ | ------------- | ----------- | ------- | -------- |
| Authentication & Initial Setup | 4             | 3           | 1       | 75%      |
| Organization Setup             | 5             | 3           | 2       | 60%      |
| Invitations & Onboarding       | 7             | 3           | 4       | 43%      |
| Dashboard & Navigation         | 3             | 3           | 0       | 100%     |
| Project Setup                  | 6             | 2           | 4       | 33%      |
| Task Management                | 7             | 3           | 4       | 43%      |
| Task Collaboration             | 9             | 0           | 9       | 0%       |
| Tags Management                | 4             | 0           | 4       | 0%       |
| Notifications                  | 4             | 0           | 4       | 0%       |
| User Management                | 6             | 0           | 6       | 0%       |
| Org & Project Admin            | 2             | 1           | 1       | 50%      |
| Settings & Preferences         | 6             | 0           | 6       | 0%       |
| Reports & Audit                | 5             | 0           | 5       | 0%       |
| Bulk Operations                | 5             | 0           | 5       | 0%       |
| File Management                | 3             | 0           | 3       | 0%       |
| UI State Actions               | 3             | 0           | 3       | 0%       |
| Calendar & Scheduling          | 3             | 0           | 3       | 0%       |
| Time Tracking & Timesheets     | 3             | 0           | 3       | 0%       |
| Help & Documentation           | 2             | 0           | 2       | 0%       |
| Saved Filters                  | 3             | 0           | 3       | 0%       |
| **TOTAL**                      | **91**        | **21**      | **70**  | **23%**  |

## Detailed User Story to Test File Mapping

### 1. Authentication & Initial Setup

| Story  | Title             | Test File                         | Status         | Implementation Notes                                                    |
| ------ | ----------------- | --------------------------------- | -------------- | ----------------------------------------------------------------------- |
| US-001 | User Registration | `e2e/specs/auth/register.spec.ts` | ✅ Implemented | Tests valid/invalid registration, duplicate emails, password validation |
| US-002 | User Login        | `e2e/specs/auth/login.spec.ts`    | ✅ Implemented | Tests valid/invalid credentials, error messages, redirect behavior      |
| US-003 | Password Reset    | `e2e/specs/auth/login.spec.ts`    | ⏳ Stubbed     | Feature limitation: Email reset not implemented, only settings panel    |
| US-004 | User Logout       | `e2e/specs/auth/logout.spec.ts`   | ✅ Implemented | Tests logout flow, route protection, session termination                |

### 2. Organization Setup

| Story  | Title                          | Test File                            | Status         |
| ------ | ------------------------------ | ------------------------------------ | -------------- |
| US-005 | Create Organization            | `e2e/specs/organization/org.spec.ts` | ✅ Implemented |
| US-006 | Switch Organization            | `e2e/specs/organization/org.spec.ts` | ✅ Implemented |
| US-007 | Accept Organization Invitation | `e2e/specs/organization/org.spec.ts` | ✅ Implemented |
| US-008 | Invite Organization Member     | `e2e/specs/organization/org.spec.ts` | ✅ Implemented |
| US-009 | Manage Organization Members    | `e2e/specs/organization/org.spec.ts` | ⏳ Stubbed     |

### 3. Invitations & Onboarding

| Story  | Title                      | Test File                            | Status         |
| ------ | -------------------------- | ------------------------------------ | -------------- |
| US-082 | Create Organization Invite | `e2e/specs/organization/org.spec.ts` | ✅ Implemented |
| US-083 | View Organization Invites  | `e2e/specs/organization/org.spec.ts` | ⏳ Stubbed     |
| US-084 | Revoke Invite              | `e2e/specs/organization/org.spec.ts` | ⏳ Stubbed     |
| US-085 | Accept Invite              | `e2e/specs/organization/org.spec.ts` | ⏳ Stubbed     |
| US-086 | Register with Organization | `e2e/specs/auth/register.spec.ts`    | ✅ Implemented |
| US-087 | Complete Onboarding        | `e2e/specs/auth/register.spec.ts`    | ✅ Implemented |
| US-088 | Skip Onboarding            | `e2e/specs/auth/register.spec.ts`    | ⏳ Stubbed     |

### 4. Dashboard & Navigation

| Story  | Title                | Test File                           | Status         |
| ------ | -------------------- | ----------------------------------- | -------------- |
| US-054 | View Dashboard       | `e2e/specs/tasks/dashboard.spec.ts` | ✅ Implemented |
| US-055 | Global Search        | `e2e/specs/tasks/dashboard.spec.ts` | ✅ Implemented |
| US-056 | Navigate Application | `e2e/specs/tasks/dashboard.spec.ts` | ✅ Implemented |

### 5. Project Setup

| Story  | Title                  | Test File                         | Status         |
| ------ | ---------------------- | --------------------------------- | -------------- |
| US-010 | Create Project         | `e2e/specs/projects/crud.spec.ts` | ✅ Implemented |
| US-011 | View Project Details   | `e2e/specs/projects/crud.spec.ts` | ✅ Implemented |
| US-012 | Edit Project           | `e2e/specs/projects/crud.spec.ts` | ✅ Implemented |
| US-013 | Delete Project         | `e2e/specs/projects/crud.spec.ts` | ✅ Implemented |
| US-014 | Add Project Member     | `e2e/specs/projects/crud.spec.ts` | ⏳ Stubbed     |
| US-015 | Manage Project Members | `e2e/specs/projects/crud.spec.ts` | ⏳ Stubbed     |

### 6. Task Management

| Story  | Title                    | Test File                      | Status         |
| ------ | ------------------------ | ------------------------------ | -------------- |
| US-016 | Create Task              | `e2e/specs/tasks/crud.spec.ts` | ✅ Implemented |
| US-017 | View Task List           | `e2e/specs/tasks/crud.spec.ts` | ✅ Implemented |
| US-018 | View Task Board (Kanban) | `e2e/specs/tasks/crud.spec.ts` | ✅ Implemented |
| US-019 | View Task Details        | `e2e/specs/tasks/crud.spec.ts` | ✅ Implemented |
| US-020 | Edit Task                | `e2e/specs/tasks/crud.spec.ts` | ✅ Implemented |
| US-021 | Delete Task              | `e2e/specs/tasks/crud.spec.ts` | ✅ Implemented |
| US-022 | Filter and Sort Tasks    | `e2e/specs/tasks/crud.spec.ts` | ✅ Implemented |

### 7. Task Collaboration

| Story  | Title               | Test File                                  | Status     |
| ------ | ------------------- | ------------------------------------------ | ---------- |
| US-023 | Add Comment to Task | `e2e/specs/collaboration/comments.spec.ts` | ⏳ Stubbed |
| US-024 | Reply to Comment    | `e2e/specs/collaboration/comments.spec.ts` | ⏳ Stubbed |
| US-025 | Edit/Delete Comment | `e2e/specs/collaboration/comments.spec.ts` | ⏳ Stubbed |
| US-026 | Add Subtasks        | `e2e/specs/collaboration/comments.spec.ts` | ⏳ Stubbed |
| US-027 | Manage Subtasks     | `e2e/specs/collaboration/comments.spec.ts` | ⏳ Stubbed |
| US-028 | Log Time Entry      | `e2e/specs/collaboration/comments.spec.ts` | ⏳ Stubbed |
| US-029 | View Time Entries   | `e2e/specs/collaboration/comments.spec.ts` | ⏳ Stubbed |
| US-030 | Edit Time Entry     | `e2e/specs/collaboration/comments.spec.ts` | ⏳ Stubbed |
| US-031 | Manual Time Editing | `e2e/specs/collaboration/comments.spec.ts` | ⏳ Stubbed |
| US-089 | React to Comment    | `e2e/specs/collaboration/comments.spec.ts` | ⏳ Stubbed |

### 8. Tags Management

| Story  | Title          | Test File                     | Status     |
| ------ | -------------- | ----------------------------- | ---------- |
| US-032 | Create Tag     | `e2e/specs/tags/tags.spec.ts` | ⏳ Stubbed |
| US-033 | Edit Tag       | `e2e/specs/tags/tags.spec.ts` | ⏳ Stubbed |
| US-034 | Delete Tag     | `e2e/specs/tags/tags.spec.ts` | ⏳ Stubbed |
| US-035 | Filter by Tags | `e2e/specs/tags/tags.spec.ts` | ⏳ Stubbed |

### 9. Notifications

| Story  | Title                      | Test File                                       | Status     |
| ------ | -------------------------- | ----------------------------------------------- | ---------- |
| US-036 | View Notifications         | `e2e/specs/notifications/notifications.spec.ts` | ⏳ Stubbed |
| US-037 | Mark Notification as Read  | `e2e/specs/notifications/notifications.spec.ts` | ⏳ Stubbed |
| US-038 | Delete Notifications       | `e2e/specs/notifications/notifications.spec.ts` | ⏳ Stubbed |
| US-039 | Navigate from Notification | `e2e/specs/notifications/notifications.spec.ts` | ⏳ Stubbed |

### 10. User Management

| Story  | Title                     | Test File                                 | Status     |
| ------ | ------------------------- | ----------------------------------------- | ---------- |
| US-040 | Create User               | `e2e/specs/users/user-management.spec.ts` | ⏳ Stubbed |
| US-041 | View Users                | `e2e/specs/users/user-management.spec.ts` | ⏳ Stubbed |
| US-042 | Edit User                 | `e2e/specs/users/user-management.spec.ts` | ⏳ Stubbed |
| US-043 | Toggle User Active Status | `e2e/specs/users/user-management.spec.ts` | ⏳ Stubbed |
| US-044 | Unblock User              | `e2e/specs/users/user-management.spec.ts` | ⏳ Stubbed |
| US-045 | View Login Logs           | `e2e/specs/users/user-management.spec.ts` | ⏳ Stubbed |

### 11. Organization & Project Administration

| Story  | Title                        | Test File                            | Status         |
| ------ | ---------------------------- | ------------------------------------ | -------------- |
| US-046 | View Project Tasks           | `e2e/specs/projects/crud.spec.ts`    | ✅ Implemented |
| US-047 | Manage Organization Settings | `e2e/specs/organization/org.spec.ts` | ⏳ Stubbed     |

### 12. Settings & Preferences

| Story  | Title                 | Test File                             | Status     |
| ------ | --------------------- | ------------------------------------- | ---------- |
| US-048 | Update Profile        | `e2e/specs/settings/settings.spec.ts` | ⏳ Stubbed |
| US-049 | Change Password       | `e2e/specs/settings/settings.spec.ts` | ⏳ Stubbed |
| US-050 | Change Theme          | `e2e/specs/settings/settings.spec.ts` | ⏳ Stubbed |
| US-051 | Configure Timezone    | `e2e/specs/settings/settings.spec.ts` | ⏳ Stubbed |
| US-052 | Configure Date Format | `e2e/specs/settings/settings.spec.ts` | ⏳ Stubbed |
| US-053 | Toggle Activity Feed  | `e2e/specs/settings/settings.spec.ts` | ⏳ Stubbed |

### 13. Reports & Audit

| Story  | Title                     | Test File                           | Status     |
| ------ | ------------------------- | ----------------------------------- | ---------- |
| US-057 | View Audit Logs           | `e2e/specs/reports/reports.spec.ts` | ⏳ Stubbed |
| US-058 | View Resource History     | `e2e/specs/reports/reports.spec.ts` | ⏳ Stubbed |
| US-059 | Generate Reports          | `e2e/specs/reports/reports.spec.ts` | ⏳ Stubbed |
| US-090 | View Employee Leaderboard | `e2e/specs/reports/reports.spec.ts` | ⏳ Stubbed |
| US-091 | Export Reports to Excel   | `e2e/specs/reports/reports.spec.ts` | ⏳ Stubbed |

### 14. Bulk Operations

| Story  | Title                     | Test File                                | Status     |
| ------ | ------------------------- | ---------------------------------------- | ---------- |
| US-060 | Select Multiple Tasks     | `e2e/specs/bulk/bulk-operations.spec.ts` | ⏳ Stubbed |
| US-061 | Bulk Assign Tasks         | `e2e/specs/bulk/bulk-operations.spec.ts` | ⏳ Stubbed |
| US-062 | Bulk Change Task Status   | `e2e/specs/bulk/bulk-operations.spec.ts` | ⏳ Stubbed |
| US-063 | Bulk Change Task Priority | `e2e/specs/bulk/bulk-operations.spec.ts` | ⏳ Stubbed |
| US-064 | Bulk Delete Tasks         | `e2e/specs/bulk/bulk-operations.spec.ts` | ⏳ Stubbed |

### 15. File Management

| Story  | Title         | Test File       | Status     | Notes                                                 |
| ------ | ------------- | --------------- | ---------- | ----------------------------------------------------- |
| US-065 | Upload Files  | Not yet created | ⏳ Stubbed | File upload tests                                     |
| US-066 | Delete Files  | Not yet created | ⏳ Stubbed | Feature limitation: Cannot delete comment attachments |
| US-067 | Preview Files | Not yet created | ⏳ Stubbed | File preview tests                                    |

### 16. UI State Actions

| Story  | Title                 | Test File       | Status     | Notes                   |
| ------ | --------------------- | --------------- | ---------- | ----------------------- |
| US-068 | Toggle Sidebar        | Not yet created | ⏳ Stubbed | Sidebar collapse/expand |
| US-069 | Undo Actions          | Not yet created | ⏳ Stubbed | Toast notification undo |
| US-070 | Dismiss Notifications | Not yet created | ⏳ Stubbed | Toast dismissal         |

### 17. Calendar & Scheduling

| Story  | Title                        | Test File                             | Status     |
| ------ | ---------------------------- | ------------------------------------- | ---------- |
| US-071 | View Task Calendar           | `e2e/specs/calendar/calendar.spec.ts` | ⏳ Stubbed |
| US-072 | Navigate Calendar            | `e2e/specs/calendar/calendar.spec.ts` | ⏳ Stubbed |
| US-073 | View Monthly Task Statistics | `e2e/specs/calendar/calendar.spec.ts` | ⏳ Stubbed |

### 18. Time Tracking & Timesheets

| Story  | Title                     | Test File                               | Status     |
| ------ | ------------------------- | --------------------------------------- | ---------- |
| US-074 | View Timesheet            | `e2e/specs/timesheet/timesheet.spec.ts` | ⏳ Stubbed |
| US-075 | Export Timesheet          | `e2e/specs/timesheet/timesheet.spec.ts` | ⏳ Stubbed |
| US-076 | View Daily Time Breakdown | `e2e/specs/timesheet/timesheet.spec.ts` | ⏳ Stubbed |

### 19. Help & Documentation

| Story  | Title                | Test File       | Status     |
| ------ | -------------------- | --------------- | ---------- |
| US-077 | Browse Help Articles | Not yet created | ⏳ Stubbed |
| US-078 | Search Help          | Not yet created | ⏳ Stubbed |

### 20. Saved Filters

| Story  | Title                | Test File       | Status     |
| ------ | -------------------- | --------------- | ---------- |
| US-079 | Save Filter          | Not yet created | ⏳ Stubbed |
| US-080 | Apply Saved Filter   | Not yet created | ⏳ Stubbed |
| US-081 | Manage Saved Filters | Not yet created | ⏳ Stubbed |

## Implementation Roadmap

### Phase 1: Core Features (✅ In Progress)

- [x] Authentication (login, register, logout)
- [x] Organization management
- [x] Projects CRUD
- [x] Tasks CRUD and board view
- [x] Dashboard and navigation

### Phase 2: Collaboration Features (Stubbed, ready for implementation)

- [ ] Comments and reactions
- [ ] Subtasks
- [ ] Time entries
- [ ] Tags

### Phase 3: Admin & Reporting

- [ ] User management
- [ ] Audit logs and reports
- [ ] Notifications

### Phase 4: Advanced Features

- [ ] Bulk operations
- [ ] Calendar view
- [ ] Timesheet
- [ ] Settings and preferences
- [ ] File management
- [ ] Saved filters

## Legend

| Status         | Meaning                                                        |
| -------------- | -------------------------------------------------------------- |
| ✅ Implemented | Full test implementation with real test logic                  |
| ⏳ Stubbed     | Test file created with TODO comments, ready for implementation |
| ❌ Not Created | File not yet created                                           |

## Quick Start

To implement a stubbed test:

1. Find the corresponding `.spec.ts` file
2. Replace the `// TODO:` comment with actual test code
3. Use existing tests as reference (e.g., `login.spec.ts`)
4. Use helper functions from `e2e/utils/helpers.ts`
5. Use Page Objects from `e2e/pages/`
6. Run the test: `bun run test:e2e -- <file-path>`

## Notes

- Tests use Persian/Farsi text matchers to support the localized UI
- All tests use data-testid selectors for stable element identification
- Tests are isolated and can run in any order
- Authentication state is reused via storage state for faster test execution
- See [user-stories.md](../docs/user-stories.md) for implementation limitations
