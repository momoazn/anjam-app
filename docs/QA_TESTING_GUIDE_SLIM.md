# QA Testing Guide - Task Manager App (AI Agent Optimized)

## Table of Contents
1. [Setup](#setup)
2. [User Roles](#user-roles)
3. [Authentication](#authentication)
4. [Dashboard](#dashboard)
5. [Projects](#projects)
6. [Tasks](#tasks)
7. [Users](#users)
8. [Reports](#reports)
9. [Comments](#comments)
10. [Notifications](#notifications)
11. [Navigation & UI](#navigation--ui)
12. [Validation & Errors](#validation--errors)
13. [Performance](#performance)
14. [Smoke Test](#smoke-test)

---

## Setup

**Required Test Accounts:**
- Admin: username=`admin`, password=`admin123`, role=`admin`
- Supervisor: username=`supervisor1`, password=`supervisor123`, role=`supervisor`
- Employee: username=`employee1`, password=`employee123`, role=`employee`

**Environment:**
- App running (`bun run dev`)
- Database initialized and seeded
- Test data created (tasks, projects, users, comments, notifications)

---

## User Roles

### Admin
**Access:** All pages (Dashboard, Projects, Tasks, Users, Reports, Notifications, Settings)
**Permissions:**
- [ ] Create/edit/delete projects
- [ ] Create/edit/delete users
- [ ] Create/edit/delete any task
- [ ] View all reports
- [ ] Manage all notifications

### Supervisor
**Access:** Dashboard, Projects, Tasks, Reports, Notifications, Settings
**Restrictions:**
- [ ] Cannot delete users
- [ ] Cannot edit users
- [ ] Can only create/edit projects they supervise

### Employee
**Access:** Dashboard, Tasks, Notifications, Settings
**Restrictions:**
- [ ] Cannot access Users page (redirects)
- [ ] Cannot access Reports page (redirects)
- [ ] Cannot access Projects page (redirects)
- [ ] Can only edit assigned tasks

---

## Authentication

### Login Tests
- [ ] Valid credentials → Redirect to dashboard
- [ ] Invalid password → Error displayed
- [ ] Non-existent username → Error displayed
- [ ] Empty username → Validation error
- [ ] Empty password → Validation error
- [ ] Session persists on refresh
- [ ] Session persists on browser close/reopen

### Registration Tests
- [ ] Register with valid data → Account created
- [ ] Duplicate username → Error
- [ ] Duplicate email → Error
- [ ] Weak password (< 8 chars) → Error
- [ ] Invalid email format → Error

### Session Management
- [ ] Logout → Redirect to login, session cleared
- [ ] Unauthorized access → Redirect to login
- [ ] Token expiration → Auto logout

---

## Dashboard

**Tests:**
- [ ] Loads without errors
- [ ] Statistics cards show correct counts (Total, Completed, In Progress, Pending, Overdue)
- [ ] Persian numerals display correctly (۰-۹)
- [ ] Project summary shows completion percentage
- [ ] Recent tasks section displays (max 5)
- [ ] Overdue tasks section appears when tasks overdue
- [ ] Quick action buttons navigate correctly
- [ ] Task status bar chart displays correctly
- [ ] Responsive on mobile/tablet/desktop

---

## Projects

### Listing
- [ ] Projects list loads
- [ ] Project count displays
- [ ] Create button visible (admin/supervisor only)
- [ ] Create button hidden (employee)

### Create
- [ ] Create with valid data → Success
- [ ] Empty name → Validation error
- [ ] Duplicate code → Error
- [ ] No supervisor → Validation error or allowed
- [ ] Cancel creation → No project created

### Edit
- [ ] Edit project → Changes saved
- [ ] Empty name → Validation error
- [ ] Non-supervisor cannot edit

### Delete
- [ ] Delete with confirmation → Removed
- [ ] Cancel delete → Remains
- [ ] Delete project with tasks → Cascade delete
- [ ] Non-admin/supervisor cannot delete

---

## Tasks

### Listing
- [ ] Tasks list loads
- [ ] Tasks grouped by status (Todo, In Progress, Done, Canceled)
- [ ] Task count per status displays
- [ ] Search functionality works
- [ ] All filters work (status, priority, assignee, date, tag)
- [ ] Clear filters restores all tasks
- [ ] Combine multiple filters

### Create
- [ ] Create with all fields → Success
- [ ] Create with minimal fields → Success
- [ ] No title → Validation error
- [ ] No project → Validation error
- [ ] No assignee → Success (optional)
- [ ] Future deadline → Saved
- [ ] Past deadline → Created with warning
- [ ] With tags → Tags attached
- [ ] No tags → Success

### Edit
- [ ] Edit all fields → Changes saved
- [ ] Change status → Moves to correct column
- [ ] Change priority → Priority updates
- [ ] Change assignee → Reassigned
- [ ] Update deadline → New deadline saved
- [ ] Add/remove tags → Tags updated
- [ ] Edit without permission → Disabled

### Delete
- [ ] Delete with confirmation → Removed
- [ ] Cancel delete → Remains
- [ ] Delete with comments → Comments deleted or blocked
- [ ] No permission → Delete disabled

### Actions
- [ ] Mark as done → Status changes
- [ ] Mark as in progress → Status changes
- [ ] Drag & drop (if implemented) → Status updates
- [ ] Assign to me → Assignee updates

---

## Users

### Listing
- [ ] Users list loads (admin/supervisor only)
- [ ] User count displays
- [ ] Employee cannot access → Redirected

### Create (Admin Only)
- [ ] Create with valid data → Success
- [ ] Duplicate username → Error
- [ ] Duplicate email → Error
- [ ] Invalid email → Error
- [ ] Weak password → Error
- [ ] No role → Validation error

### Edit (Admin Only)
- [ ] Edit user → Changes saved
- [ ] Change role → Role updated
- [ ] Duplicate username → Error
- [ ] Supervisor cannot edit → Disabled

### Delete (Admin Only)
- [ ] Delete with confirmation → Removed
- [ ] Cancel delete → Remains
- [ ] Delete with tasks → Tasks unassigned or error
- [ ] Cannot delete self → Prevented or error
- [ ] Supervisor cannot delete → Disabled

---

## Reports

### Overview
- [ ] Reports page loads
- [ ] Date range selector works (7D, 30D, 90D, Custom)
- [ ] Filters work (project, assignee, status, priority)
- [ ] Persian numbers in charts
- [ ] Metric cards show correct totals

### Charts
- [ ] Timeliness donut chart displays
  - [ ] Click slices → Drilldown opens
- [ ] Priority distribution chart displays
  - [ ] Click bars → Drilldown opens
- [ ] Top performers leaderboard
  - [ ] Click user → Drilldown opens

### Team Tab
- [ ] Overtime analysis chart displays
- [ ] Workload distribution chart displays
- [ ] Charts update with filters

### Individuals Tab
- [ ] Employee overview cards display
- [ ] Click card → Shows details
- [ ] Productivity chart displays
- [ ] Bucket selector works (daily/weekly/monthly/quarterly/annual)
- [ ] Comparison chart displays
- [ ] Performance table displays
  - [ ] Click row → Drilldown opens

### Drilldown
- [ ] Click chart element → Drawer opens
- [ ] Drawer shows filtered tasks
- [ ] Close drawer → Drawer closes
- [ ] Task details complete (title, status, priority, deadline, assignee, project, tags)

---

## Comments

### Add
- [ ] Add comment to task → Comment appears
- [ ] Rich text preserved
- [ ] Mentions work (if implemented)
- [ ] Empty comment → Error

### View
- [ ] Comments ordered correctly
- [ ] Author displays
- [ ] Timestamp displays (Persian format)
- [ ] Soft-deleted show as [Deleted]

### Edit
- [ ] Edit own comment → Updated
- [ ] Admin/supervisor edit others' → Updated
- [ ] Employee cannot edit others' → Disabled

### Delete
- [ ] Soft delete own → Marked deleted
- [ ] Admin/supervisor soft delete others' → Marked deleted
- [ ] Employee cannot delete others' → Disabled

### Thread (if implemented)
- [ ] Reply to comment → Indented reply
- [ ] Thread displays correctly

---

## Notifications

### Display
- [ ] Notifications page loads
- [ ] Grouped by date (Today, Yesterday, This Week, Older)
- [ ] Unread highlighted (blue background/dot)
- [ ] Notification count badge in sidebar

### Types
- [ ] Task assigned → Notification received
- [ ] Project updated → Notification received
- [ ] Comment added → Notification received
- [ ] System → Notification received

### Actions
- [ ] Mark single as read → Read status updated
- [ ] Mark all as read → All marked
- [ ] Auto-mark when clicked
- [ ] Delete single → Removed
- [ ] Clear read → Read removed
- [ ] Clear all → All removed

### Filtering
- [ ] Filter "All" → All visible
- [ ] Filter "Unread" → Only unread
- [ ] Filter "Read" → Only read
- [ ] Sort newest → Newest first
- [ ] Sort oldest → Oldest first

---

## Navigation & UI

### Main Navigation
- [ ] Menu items visible based on role
- [ ] Active item highlighted
- [ ] All menu items clickable
- [ ] Sidebar collapse/expand (if implemented)

### User Menu
- [ ] User name/avatar displays
- [ ] Menu opens
- [ ] Logout works

### Responsive
- [ ] Mobile hamburger menu
- [ ] Menu on all screen sizes
- [ ] Touch-friendly targets (44px min)

### Search
- [ ] Global search works
- [ ] Search suggestions (if implemented)
- [ ] Persian characters work

---

## Validation & Errors

### Form Validation
- [ ] Required fields enforced
- [ ] Email format validated
- [ ] Password strength checked
- [ ] Field length limits enforced
- [ ] Unique constraints validated

### Error Handling
- [ ] Clear error messages (Persian)
- [ ] Errors clear after correction
- [ ] Network errors handled
- [ ] Server errors handled (500)
- [ ] Permission errors handled

### Loading States
- [ ] Loading spinners display
- [ ] Buttons show loading state
- [ ] Empty states display
- [ ] No data handled gracefully

---

## Performance

**Benchmarks:**
- [ ] Dashboard loads < 3s
- [ ] Tasks page with 100+ tasks acceptable
- [ ] Charts render without lag
- [ ] API responses < 500ms
- [ ] No memory leaks
- [ ] Works with 100+ tasks, 50+ projects, 100+ users

**Responsive:**
- [ ] Mobile (320-768px): Single column
- [ ] Tablet (768-1024px): Two column
- [ ] Desktop (1024px+): Multi column
- [ ] Large (1440px+): Wide layout

---

## Smoke Test

Run before each release:

**Auth:**
- [ ] Admin login works
- [ ] Invalid login shows error
- [ ] Logout works
- [ ] Session persists on refresh

**Core Features:**
- [ ] Dashboard loads, stats show
- [ ] Create/edit/delete task
- [ ] Create/edit/delete project (admin/supervisor)
- [ ] Create/edit/delete user (admin)
- [ ] Reports page loads, charts display
- [ ] Notifications work

**UI:**
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Persian numerals correct
- [ ] Persian dates correct
- [ ] No console errors
- [ ] No text rectangles

---

## Bug Report Template

**Title:** Clear description
**Steps:** Numbered list
**Expected:** What should happen
**Actual:** What happened
**Environment:**
  - Browser:
  - Device:
  - Resolution:
  - Role:
**Screenshots:** Visual evidence
**Console Errors:** JavaScript errors
**Priority:** Critical/High/Medium/Low

---

## Test Data

Create diverse data:
- Tasks: All statuses, priorities, deadlines (past/future), with/without assignees
- Projects: Active, different supervisors
- Users: All roles, with/without avatars
- Comments: Regular, edited, soft-deleted
- Notifications: Read/unread, different types

---

## Security (Basic)

- [ ] Role restrictions enforced
- [ ] Session timeout works
- [ ] XSS protection (test `<script>` in forms)
- [ ] No sensitive data in client code

---

## Browser Support

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

**Last Updated:** 2025-10-30
**Application:** Task Manager App (React + PocketBase)
**Test Cases:** 500+
