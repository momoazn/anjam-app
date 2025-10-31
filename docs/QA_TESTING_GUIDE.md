# QA Testing Guide - Task Manager App

## Table of Contents
1. [Test Environment Setup](#test-environment-setup)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Authentication & Authorization](#authentication--authorization)
4. [Dashboard](#dashboard)
5. [Projects Management](#projects-management)
6. [Tasks Management](#tasks-management)
7. [Users Management](#users-management)
8. [Reports & Analytics](#reports--analytics)
9. [Comments System](#comments-system)
10. [Notifications](#notifications)
11. [Navigation & UI](#navigation--ui)
12. [Data Validation & Error Handling](#data-validation--error-handling)
13. [Performance & Responsive Design](#performance--responsive-design)
14. [Accessibility](#accessibility)
15. [Smoke Test Checklist](#smoke-test-checklist)

---

## Test Environment Setup

### Prerequisites
- [ ] Application is running (`bun run dev`)
- [ ] Database is initialized and seeded
- [ ] Test users are created with different roles

### Required Test Accounts
Create the following test accounts:

**Admin User:**
- Username: `admin`
- Password: `admin123`
- Role: `admin`
- Permissions: Full access to all features

**Supervisor User:**
- Username: `supervisor1`
- Password: `supervisor123`
- Role: `supervisor`
- Permissions: Manage projects and tasks in their scope

**Employee Users:**
- Username: `employee1`, `employee2`, `employee3`
- Password: `employee123`
- Role: `employee`
- Permissions: View and update assigned tasks

---

## User Roles & Permissions

### Admin Role
**Expected Behavior:**
- [ ] Can access all pages (Dashboard, Projects, Tasks, Users, Reports, Notifications, Settings)
- [ ] Can create, edit, and delete projects
- [ ] Can create, edit, and delete users
- [ ] Can create, edit, and delete any task
- [ ] Can view all reports and analytics
- [ ] Can manage all notifications

**Testing Steps:**
1. Login as admin
2. Navigate through all menu items
3. Verify all actions are enabled
4. Attempt operations and confirm success

### Supervisor Role
**Expected Behavior:**
- [ ] Can access Dashboard, Projects, Tasks, Reports, Notifications, Settings
- [ ] Can create and edit projects they supervise
- [ ] Cannot delete projects (unless assigned as supervisor)
- [ ] Can create, edit, and delete tasks in their projects
- [ ] Can view users page (read-only)
- [ ] Can view reports for their projects
- [ ] Cannot create, edit, or delete users
- [ ] Can view and manage their notifications

**Testing Steps:**
1. Login as supervisor
2. Navigate to Users page - should be read-only
3. Try to create a project - should succeed
4. Try to delete a project - should fail if not supervisor of that project
5. Try to delete a user - should fail

### Employee Role
**Expected Behavior:**
- [ ] Can access Dashboard, Tasks, Notifications, Settings
- [ ] Cannot access Projects page (shows 404 or redirects)
- [ ] Cannot access Users page (shows 404 or redirects)
- [ ] Cannot access Reports page (shows 404 or redirects)
- [ ] Can view and update tasks assigned to them
- [ ] Can view and update their notifications

**Testing Steps:**
1. Login as employee
2. Navigate to Users - should redirect to Dashboard
3. Navigate to Reports - should redirect to Dashboard
4. Navigate to Projects - should redirect to Dashboard
5. Try to edit another user's task - should fail
6. Can view and update their own tasks - should succeed

---

## Authentication & Authorization

### Login
**Test Cases:**

**Valid Credentials:**
- [ ] Login with correct username and password
  - **Steps:** Enter valid credentials and click login
  - **Expected:** User is redirected to dashboard
  - **Verify:** User name appears in sidebar

- [ ] Login persists after page refresh
  - **Steps:** Login, then refresh page
  - **Expected:** User remains logged in

- [ ] Login persists after closing and reopening browser
  - **Steps:** Login, close browser tab, reopen app
  - **Expected:** User remains logged in

**Invalid Credentials:**
- [ ] Login with wrong password
  - **Steps:** Enter valid username, wrong password
  - **Expected:** Error message displayed, user stays on login page
  - **Verify:** "Invalid credentials" or similar error message

- [ ] Login with non-existent username
  - **Steps:** Enter non-existent username
  - **Expected:** Error message displayed

- [ ] Login with empty username
  - **Steps:** Leave username empty, enter password
  - **Expected:** Validation error for required field

- [ ] Login with empty password
  - **Steps:** Enter username, leave password empty
  - **Expected:** Validation error for required field

### Registration
**Test Cases:**
- [ ] Register new user successfully
  - **Steps:** Click "Register" on login page, fill form, submit
  - **Expected:** User account created, redirected to login or dashboard

- [ ] Register with duplicate username
  - **Steps:** Try to register with existing username
  - **Expected:** Error message about username already exists

- [ ] Register with duplicate email
  - **Steps:** Try to register with existing email
  - **Expected:** Error message about email already exists

- [ ] Register with weak password
  - **Steps:** Enter password less than 8 characters
  - **Expected:** Validation error for password length

### Session Management
**Test Cases:**
- [ ] Logout functionality
  - **Steps:** Click logout from user menu
  - **Expected:** User redirected to login page, session cleared

- [ ] Unauthorized access protection
  - **Steps:** Logout, try to navigate directly to protected routes (e.g., /dashboard, /tasks)
  - **Expected:** Redirected to login page

- [ ] Token expiration
  - **Steps:** Wait for auth token to expire (if testing token expiration)
  - **Expected:** User should be logged out or prompted to re-login

---

## Dashboard

### Dashboard Overview
**Test Cases:**
- [ ] Dashboard loads without errors
  - **Steps:** Login and navigate to dashboard
  - **Expected:** All sections load properly

- [ ] Statistics cards display correct data
  - **Expected:** Total Tasks, Completed, In Progress, Pending, Overdue counts match actual task data

- [ ] Persian numerals display correctly
  - **Expected:** All numbers display in Persian (۰-۹)

- [ ] Project summary section shows projects with progress
  - **Expected:** Each project shows completion percentage and task counts

- [ ] Recent tasks section shows latest tasks
  - **Expected:** Up to 5 most recent tasks are displayed with status indicators

- [ ] Overdue tasks section appears when there are overdue tasks
  - **Expected:** Shows list of overdue tasks with deadlines

- [ ] Quick action buttons work correctly
  - **Steps:** Click "View All Tasks", "Manage Projects", "View Reports"
  - **Expected:** Redirected to corresponding pages

### Charts and Visualizations
**Test Cases:**
- [ ] Task status bar chart displays correctly
  - **Expected:** Chart shows distribution of tasks across statuses
  - **Verify:** Bars use correct colors for each status

- [ ] Project progress bars update in real-time
  - **Steps:** Complete tasks, return to dashboard
  - **Expected:** Progress percentages update

### Responsive Design
**Test Cases:**
- [ ] Dashboard layout on mobile (320px - 768px)
  - **Expected:** Stats cards stack vertically, text remains readable

- [ ] Dashboard layout on tablet (768px - 1024px)
  - **Expected:** Mixed layout, cards arrange in grid

- [ ] Dashboard layout on desktop (1024px+)
  - **Expected:** Full multi-column layout with all elements visible

---

## Projects Management

### Project Listing
**Test Cases:**
- [ ] Projects list loads correctly
  - **Steps:** Navigate to Projects page
  - **Expected:** All projects visible with correct data

- [ ] Project count displays correctly
  - **Expected:** Badge shows total number of projects

- [ ] Projects sorted by creation date (newest first)
  - **Expected:** Most recently created projects appear first

- [ ] Create button visible for admin/supervisor
  - **Expected:** Admin and supervisor users see "Create Project" button

- [ ] Create button hidden for employee role
  - **Expected:** Employee users don't see create button

### Create Project
**Test Cases:**
- [ ] Create project with valid data
  - **Steps:** Click Create Project, fill name and code, select supervisor, submit
  - **Expected:** Project created, dialog closes, project appears in list

- [ ] Create project with empty name
  - **Steps:** Submit form with empty name field
  - **Expected:** Validation error displayed

- [ ] Create project with duplicate code
  - **Steps:** Submit form with existing project code
  - **Expected:** Error about duplicate code

- [ ] Create project without supervisor
  - **Steps:** Submit form without selecting supervisor
  - **Expected:** Validation error or project created (depending on requirements)

- [ ] Cancel project creation
  - **Steps:** Click Cancel or X button
  - **Expected:** Dialog closes, no project created

### Edit Project
**Test Cases:**
- [ ] Edit project information
  - **Steps:** Click edit, modify fields, save
  - **Expected:** Changes saved, project updates in list

- [ ] Edit project with empty name
  - **Steps:** Clear name and try to save
  - **Expected:** Validation error

- [ ] Edit project as non-supervisor
  - **Steps:** Login as employee, try to edit project
  - **Expected:** No edit option available

### Delete Project
**Test Cases:**
- [ ] Delete project with confirmation
  - **Steps:** Click delete, confirm in dialog
  - **Expected:** Project removed from database and list

- [ ] Cancel delete operation
  - **Steps:** Click delete, then cancel
  - **Expected:** Project remains in list

- [ ] Delete project with tasks
  - **Steps:** Delete project containing tasks
  - **Expected:** Tasks also deleted (cascade delete) or error message

- [ ] Delete project without permission
  - **Steps:** Login as employee, try to delete
  - **Expected:** Delete button not visible or disabled

### Project Details
**Test Cases:**
- [ ] Project displays correct information
  - **Expected:** Name, code, supervisor, creation date all correct

- [ ] Project shows task count
  - **Expected:** Number of tasks in project displayed

- [ ] Navigate to project tasks
  - **Steps:** Click on project or "View Tasks"
  - **Expected:** Redirected to tasks filtered by project

---

## Tasks Management

### Task Listing
**Test Cases:**
- [ ] Tasks list loads without errors
  - **Steps:** Navigate to Tasks page
  - **Expected:** All tasks visible with correct data

- [ ] Tasks grouped by status
  - **Expected:** Tasks organized into columns: Todo, In Progress, Done, Canceled

- [ ] Task count per status displays correctly
  - **Expected:** Badge shows correct count for each status group

- [ ] Tasks sorted by order field or creation date
  - **Expected:** Tasks appear in logical order within each group

### Create Task
**Test Cases:**
- [ ] Create task with all fields
  - **Steps:** Click New Task, fill all required fields (title, project, status, priority), submit
  - **Expected:** Task created and appears in correct status group

- [ ] Create task with minimal data
  - **Steps:** Fill only required fields (title, project, status, priority)
  - **Expected:** Task created successfully

- [ ] Create task without title
  - **Steps:** Submit form with empty title
  - **Expected:** Validation error displayed

- [ ] Create task without project
  - **Steps:** Submit form without selecting project
  - **Expected:** Validation error (project is required)

- [ ] Create task without assignee
  - **Steps:** Submit form without selecting assignee
  - **Expected:** Task created successfully (assignee optional)

- [ ] Create task with future deadline
  - **Steps:** Set deadline to future date
  - **Expected:** Task created, deadline saved

- [ ] Create task with past deadline
  - **Steps:** Set deadline to past date
  - **Expected:** Task created (or warning about past deadline)

- [ ] Create task with tags
  - **Steps:** Select one or more tags
  - **Expected:** Tags attached to task

- [ ] Create task without tags
  - **Steps:** Submit form without tags
  - **Expected:** Task created successfully

- [ ] Create task in different projects
  - **Steps:** Create tasks in different projects
  - **Expected:** Each task appears in correct project

### Edit Task
**Test Cases:**
- [ ] Edit all task fields
  - **Steps:** Click edit, modify fields, save
  - **Expected:** Changes saved, task updates

- [ ] Edit task status
  - **Steps:** Change status from "Todo" to "In Progress"
  - **Expected:** Task moves to different status group

- [ ] Edit task priority
  - **Steps:** Change priority level
  - **Expected:** Priority indicator updates

- [ ] Edit task assignee
  - **Steps:** Change assignee
  - **Expected:** Task reassigned

- [ ] Edit task deadline
  - **Steps:** Update deadline date
  - **Expected:** New deadline saved

- [ ] Edit task tags
  - **Steps:** Add/remove tags
  - **Expected:** Tags updated correctly

- [ ] Edit without permission
  - **Steps:** Login as employee, try to edit task not assigned to you
  - **Expected:** Edit option not available or disabled

### Delete Task
**Test Cases:**
- [ ] Delete task with confirmation
  - **Steps:** Click delete, confirm
  - **Expected:** Task removed from database and list

- [ ] Cancel delete operation
  - **Steps:** Click delete, then cancel
  - **Expected:** Task remains in list

- [ ] Delete task with comments
  - **Steps:** Delete task that has comments
  - **Expected:** Comments also deleted or task deletion blocked

- [ ] Delete without permission
  - **Steps:** Employee tries to delete task
  - **Expected:** Delete option not available

### Task Filters
**Test Cases:**
- [ ] Filter by search term
  - **Steps:** Type in search box
  - **Expected:** Tasks filtered to match search term

- [ ] Filter by status
  - **Steps:** Select status filter
  - **Expected:** Only tasks with selected status shown

- [ ] Filter by priority
  - **Steps:** Select priority filter
  - **Expected:** Only tasks with selected priority shown

- [ ] Filter by assignee
  - **Steps:** Select assignee filter
  - **Expected:** Only tasks assigned to selected user shown

- [ ] Filter by date range
  - **Steps:** Select date range filter
  - **Expected:** Only tasks within date range shown

- [ ] Filter by tag
  - **Steps:** Select tag filter
  - **Expected:** Only tasks with selected tag shown

- [ ] Combine multiple filters
  - **Steps:** Apply multiple filters simultaneously
  - **Expected:** All filters applied correctly

- [ ] Clear all filters
  - **Steps:** Click "Clear Filters" or reset
  - **Expected:** All tasks visible again

### Task Details
**Test Cases:**
- [ ] Task displays correct information
  - **Expected:** Title, project, assignee, status, priority, deadline all correct

- [ ] Task shows correct status indicator
  - **Expected:** Color-coded status badge displays

- [ ] Task shows correct priority indicator
  - **Expected:** Priority badge displays

- [ ] Task shows deadline correctly
  - **Expected:** Date displays in Persian calendar format

- [ ] Task shows tags
  - **Expected:** Tag badges display with correct colors

- [ ] Task shows creation and update dates
  - **Expected:** Timestamps display correctly

### Task Actions
**Test Cases:**
- [ ] Mark task as done
  - **Steps:** Click mark as done button
  - **Expected:** Task status changes to "Done"

- [ ] Mark task as in progress
  - **Steps:** Change status to "In Progress"
  - **Expected:** Task moves to In Progress column

- [ ] Drag and drop task (if implemented)
  - **Steps:** Drag task between columns
  - **Expected:** Task status updates

- [ ] Assign task to yourself
  - **Steps:** Click "Assign to me"
  - **Expected:** Task assignee updates to current user

---

## Users Management

### User Listing
**Test Cases:**
- [ ] Users list loads correctly (admin/supervisor only)
  - **Steps:** Navigate to Users page
  - **Expected:** All users visible with correct data

- [ ] User count displays correctly
  - **Expected:** Badge shows total number of users

- [ ] Users sorted by creation date
  - **Expected:** Most recently created users appear first

- [ ] Employee cannot access Users page
  - **Steps:** Login as employee, navigate to /users
  - **Expected:** Redirected to dashboard

### Create User
**Test Cases:**
- [ ] Create user with all fields
  - **Steps:** Click Create User, fill all fields (username, first name, last name, email, role), submit
  - **Expected:** User created successfully

- [ ] Create user with minimal data
  - **Steps:** Fill only required fields
  - **Expected:** User created successfully

- [ ] Create user with duplicate username
  - **Steps:** Use existing username
  - **Expected:** Error about duplicate username

- [ ] Create user with duplicate email
  - **Steps:** Use existing email
  - **Expected:** Error about duplicate email

- [ ] Create user with invalid email
  - **Steps:** Enter malformed email
  - **Expected:** Validation error

- [ ] Create user with weak password
  - **Steps:** Enter password less than 8 characters
  - **Expected:** Validation error

- [ ] Create user with different roles
  - **Steps:** Create users with admin, supervisor, and employee roles
  - **Expected:** Users created with correct roles

- [ ] Create user without role
  - **Steps:** Submit form without selecting role
  - **Expected:** Validation error (role required)

### Edit User
**Test Cases:**
- [ ] Edit user information (admin only)
  - **Steps:** Edit user, modify fields, save
  - **Expected:** Changes saved successfully

- [ ] Edit user role
  - **Steps:** Change role from employee to supervisor
  - **Expected:** Role updated

- [ ] Edit user with duplicate username
  - **Steps:** Change to existing username
  - **Expected:** Error about duplicate

- [ ] Supervisor cannot edit users
  - **Steps:** Login as supervisor, try to edit user
  - **Expected:** Edit option not available

- [ ] Employee cannot access edit
  - **Steps:** Employee user tries to access edit
  - **Expected:** Page not accessible

### Delete User
**Test Cases:**
- [ ] Delete user with confirmation (admin only)
  - **Steps:** Click delete, confirm
  - **Expected:** User removed from database and list

- [ ] Cancel delete operation
  - **Steps:** Click delete, cancel
  - **Expected:** User remains in list

- [ ] Delete user with assigned tasks
  - **Steps:** Delete user who has tasks assigned
  - **Expected:** Tasks unassigned or error displayed

- [ ] Cannot delete own account (if implemented)
  - **Steps:** Admin tries to delete own account
  - **Expected:** Prevention or error message

- [ ] Supervisor cannot delete users
  - **Steps:** Login as supervisor, try to delete
  - **Expected:** Delete option not available

### User Profile
**Test Cases:**
- [ ] User displays correctly in list
  - **Expected:** All fields display correctly (username, name, email, role)

- [ ] Role badge displays
  - **Expected:** Color-coded badge for role (admin, supervisor, employee)

- [ ] Avatar displays (if set)
  - **Expected:** User avatar shows in list

- [ ] Email visibility (if configured)
  - **Expected:** Email shown/hidden based on settings

### Bulk Actions
**Test Cases:**
- [ ] Select multiple users
  - **Steps:** Check checkboxes on multiple users
  - **Expected:** Bulk action toolbar appears

- [ ] Bulk delete users
  - **Steps:** Select users, click delete
  - **Expected:** All selected users deleted

- [ ] Bulk change role
  - **Steps:** Select users, change role
  - **Expected:** All selected users updated

---

## Reports & Analytics

### Reports Overview
**Test Cases:**
- [ ] Reports page loads without errors
  - **Steps:** Navigate to Reports page
  - **Expected:** All charts and metrics load

- [ ] Date range selector works
  - **Steps:** Change time range (7D, 30D, 90D, custom)
  - **Expected:** Data updates based on selected range

- [ ] Filters work correctly
  - **Steps:** Filter by project, assignee, status, priority
  - **Expected:** Data filters in real-time

- [ ] Persian numbers in charts
  - **Expected:** All numbers display in Persian

### Overview Tab
**Test Cases:**
- [ ] Metric cards display correct totals
  - **Expected:** Total Tasks, Completed, In Progress, Pending, Overdue, WIP counts

- [ ] Timeliness donut chart displays
  - **Expected:** Shows on-time vs overdue vs no-deadline tasks
  - **Verify:** Click on slices to drill down

- [ ] Priority distribution chart displays
  - **Expected:** Shows count of tasks by priority
  - **Verify:** Click on bars to drill down

- [ ] Top performers leaderboard
  - **Expected:** Shows users ranked by performance
  - **Verify:** Click on user to see their tasks

### Team Tab
**Test Cases:**
- [ ] Overtime analysis chart displays
  - **Expected:** Shows overtime hours by employee

- [ ] Workload distribution chart displays
  - **Expected:** Shows task distribution across team

- [ ] Charts update with filters
  - **Steps:** Apply filters
  - **Expected:** Charts update to reflect filtered data

### Individuals Tab
**Test Cases:**
- [ ] Employee overview cards display
  - **Expected:** Shows summary for each employee

- [ ] Click employee card shows details
  - **Steps:** Click on employee card
  - **Expected:** Productivity chart updates for selected employee

- [ ] Employee productivity chart displays
  - **Expected:** Shows tasks completed over time

- [ ] Bucket selector (daily/weekly/monthly/quarterly/annual)
  - **Steps:** Change bucket size
  - **Expected:** Chart updates data granularity

- [ ] Employee comparison chart
  - **Expected:** Compares selected employee to team average

- [ ] Productivity trends chart
  - **Expected:** Shows historical and projected productivity

- [ ] Employee performance table
  - **Expected:** Detailed metrics for all employees
  - **Verify:** Click row to drill down

### Insights Tab
**Test Cases:**
- [ ] Charts display correctly
  - **Expected:** Overtime and workload charts visible

- [ ] Data consistency with Team tab
  - **Expected:** Same data as Team tab

### Drilldown Functionality
**Test Cases:**
- [ ] Click on chart element opens drilldown
  - **Steps:** Click on donut slice, bar chart bar, etc.
  - **Expected:** Drawer opens with filtered task list

- [ ] Drilldown shows correct tasks
  - **Expected:** Only tasks matching clicked element

- [ ] Drilldown drawer can be closed
  - **Steps:** Click X or outside drawer
  - **Expected:** Drawer closes

- [ ] Drilldown shows task details
  - **Expected:** Title, status, priority, deadline, assignee, project, tags

### Export Functionality (if implemented)
**Test Cases:**
- [ ] Export reports to PDF
  - **Steps:** Click export button
  - **Expected:** PDF file downloaded

- [ ] Export reports to CSV
  - **Steps:** Click export button
  - **Expected:** CSV file downloaded

---

## Comments System

### Add Comment
**Test Cases:**
- [ ] Add comment to task
  - **Steps:** Open task, add comment text, submit
  - **Expected:** Comment appears in task

- [ ] Add comment with rich text
  - **Steps:** Add formatted text (bold, italic, etc.)
  - **Expected:** Formatting preserved

- [ ] Add comment with mentions (if implemented)
  - **Steps:** Use @username syntax
  - **Expected:** Mention highlighted or notification sent

- [ ] Add comment without text
  - **Steps:** Submit empty comment
  - **Expected:** Validation error

### View Comments
**Test Cases:**
- [ ] Comments display in chronological order
  - **Expected:** Oldest first or newest first (as designed)

- [ ] Comment author displays
  - **Expected:** Username and avatar of comment author shown

- [ ] Comment timestamp displays
  - **Expected:** Date and time in Persian format

- [ ] View soft-deleted comments
  - **Expected:** Deleted comments show as "[Deleted]" or similar

### Edit Comment
**Test Cases:**
- [ ] Edit own comment
  - **Steps:** Click edit on comment, modify text, save
  - **Expected:** Comment updates with edit indicator

- [ ] Edit someone else's comment (admin/supervisor)
  - **Steps:** Admin/supervisor edits another user's comment
  - **Expected:** Comment updates

- [ ] Cannot edit others' comments (employee)
  - **Steps:** Employee tries to edit another user's comment
  - **Expected:** Edit option not available

### Delete Comment
**Test Cases:**
- [ ] Soft delete own comment
  - **Steps:** Delete comment
  - **Expected:** Comment marked as deleted, not removed

- [ ] Soft delete others' comment (admin/supervisor)
  - **Steps:** Admin/supervisor deletes another user's comment
  - **Expected:** Comment marked as deleted

- [ ] Cannot delete others' comments (employee)
  - **Steps:** Employee tries to delete another user's comment
  - **Expected:** Delete option not available

### Comment Thread
**Test Cases:**
- [ ] Reply to comment (if threaded)
  - **Steps:** Click reply, add text
  - **Expected:** Reply appears indented under parent

- [ ] View comment thread
  - **Expected:** Replies appear in logical order

---

## Notifications

### Notification Display
**Test Cases:**
- [ ] Notifications page loads correctly
  - **Steps:** Navigate to Notifications page
  - **Expected:** All user notifications visible

- [ ] Notifications grouped by date
  - **Expected:** Groups: Today, Yesterday, This Week, Older

- [ ] Unread notifications highlighted
  - **Expected:** Blue background or dot indicator for unread

- [ ] Notification count in sidebar
  - **Expected:** Badge shows unread count

### Notification Types
**Test Cases:**
- [ ] Task assigned notification
  - **Expected:** Notification when task assigned to user

- [ ] Project updated notification
  - **Expected:** Notification when project modified

- [ ] Comment notification
  - **Expected:** Notification when comment added to task

- [ ] System notification
  - **Expected:** General system announcements

### Mark as Read
**Test Cases:**
- [ ] Mark single notification as read
  - **Steps:** Click mark as read button
  - **Expected:** Notification marked as read, highlight removed

- [ ] Mark all as read
  - **Steps:** Click "Mark All as Read" button
  - **Expected:** All notifications marked as read

- [ ] Auto-mark as read when clicked
  - **Steps:** Click on notification
  - **Expected:** Notification marked as read

### Delete Notification
**Test Cases:**
- [ ] Delete single notification
  - **Steps:** Click delete button
  - **Expected:** Notification removed from list

- [ ] Clear read notifications
  - **Steps:** Click "Clear Read" button
  - **Expected:** All read notifications removed

- [ ] Clear all notifications
  - **Steps:** Click "Clear All" button
  - **Expected:** All notifications removed

### Notification Filtering
**Test Cases:**
- [ ] Filter by all/notifications
  - **Steps:** Click "All" tab
  - **Expected:** All notifications visible

- [ ] Filter by unread only
  - **Steps:** Click "Unread" tab
  - **Expected:** Only unread notifications visible

- [ ] Filter by read only
  - **Steps:** Click "Read" tab
  - **Expected:** Only read notifications visible

- [ ] Sort by newest
  - **Steps:** Select "Newest" sort option
  - **Expected:** Newest notifications first

- [ ] Sort by oldest
  - **Steps:** Select "Oldest" sort option
  - **Expected:** Oldest notifications first

### Notification Badge
**Test Cases:**
- [ ] Badge shows unread count
  - **Expected:** Number badge updates in real-time

- [ ] Badge disappears when no unread
  - **Expected:** Badge hidden or shows 0

- [ ] Badge accessible on all pages
  - **Expected:** Notification badge visible in sidebar on all pages

---

## Navigation & UI

### Main Navigation
**Test Cases:**
- [ ] All menu items visible based on role
  - **Expected:** Menu shows appropriate items for user role

- [ ] Active menu item highlighted
  - **Expected:** Current page menu item highlighted

- [ ] Menu items clickable
  - **Steps:** Click each menu item
  - **Expected:** Redirects to correct page

- [ ] Sidebar collapses/expands (if implemented)
  - **Steps:** Click collapse button
  - **Expected:** Sidebar hides/shows

### Breadcrumbs (if implemented)
**Test Cases:**
- [ ] Breadcrumbs display correctly
  - **Expected:** Shows current page location

- [ ] Breadcrumbs clickable
  - **Steps:** Click breadcrumb link
  - **Expected:** Navigate to that page

### Search Functionality
**Test Cases:**
- [ ] Global search works
  - **Steps:** Type in search box
  - **Expected:** Results appear or filtered

- [ ] Search suggestions (if implemented)
  - **Expected:** Suggestions appear as typing

- [ ] Search with special characters
  - **Steps:** Search with Persian characters, emojis, etc.
  - **Expected:** Search works correctly

### User Menu
**Test Cases:**
- [ ] User avatar/name displays
  - **Expected:** User's name or avatar in top-right

- [ ] User menu opens
  - **Steps:** Click user menu
  - **Expected:** Dropdown menu appears

- [ ] Logout option works
  - **Steps:** Click logout
  - **Expected:** User logged out and redirected

### Responsive Navigation
**Test Cases:**
- [ ] Mobile hamburger menu
  - **Steps:** On mobile, click hamburger icon
  - **Expected:** Menu slides in or opens

- [ ] Menu accessible on all screen sizes
  - **Expected:** Navigation works on mobile, tablet, desktop

---

## Data Validation & Error Handling

### Form Validation
**Test Cases:**
- [ ] Required field validation
  - **Steps:** Submit form with empty required field
  - **Expected:** Error message for field

- [ ] Email format validation
  - **Steps:** Enter invalid email format
  - **Expected:** Email format error

- [ ] Password strength validation
  - **Steps:** Enter weak password
  - **Expected:** Password strength error

- [ ] Field length limits
  - **Steps:** Enter text exceeding max length
  - **Expected:** Character limit enforced or error

- [ ] Unique constraint validation
  - **Steps:** Create duplicate username/email
  - **Expected:** Duplicate error message

### Error Messages
**Test Cases:**
- [ ] Clear error messages
  - **Expected:** Error messages in Persian, clear and actionable

- [ ] Error messages disappear after correction
  - **Steps:** Fix validation error
  - **Expected:** Error message clears

- [ ] Network error handling
  - **Steps:** Disconnect internet, perform action
  - **Expected:** Error message about connection

- [ ] Server error handling
  - **Steps:** Trigger server error (500)
  - **Expected:** User-friendly error message

- [ ] Permission error handling
  - **Steps:** Access restricted resource
  - **Expected:** Clear message about lack of permission

### Loading States
**Test Cases:**
- [ ] Loading spinners display
  - **Expected:** Spinners or skeletons during data fetch

- [ ] Buttons show loading state
  - **Steps:** Click button with async action
  - **Expected:** Button disabled with loading indicator

- [ ] Empty states display
  - **Expected:** Friendly message when no data available

- [ ] No data scenarios handled
  - **Expected:** Graceful handling of empty lists

---

## Performance & Responsive Design

### Page Load Performance
**Test Cases:**
- [ ] Dashboard loads in < 3 seconds
  - **Steps:** Measure load time
  - **Expected:** Initial page load under 3 seconds

- [ ] Tasks page loads with many tasks
  - **Steps:** Load page with 100+ tasks
  - **Expected:** Acceptable load time with pagination or virtualization

- [ ] Reports page charts render efficiently
  - **Steps:** Load reports with many data points
  - **Expected:** Charts render without lag

### Responsive Breakpoints
**Test Cases:**
- [ ] Mobile (320px - 768px)
  - **Expected:** Single column layout, touch-friendly, no horizontal scroll

- [ ] Tablet (768px - 1024px)
  - **Expected:** Two-column layout where appropriate

- [ ] Desktop (1024px+)
  - **Expected:** Full multi-column layout

- [ ] Large Desktop (1440px+)
  - **Expected:** Wide layout with proper spacing

### Touch Interaction
**Test Cases:**
- [ ] Buttons easily tappable on mobile
  - **Expected:** Touch targets at least 44px

- [ ] Swipe gestures (if implemented)
  - **Expected:** Natural swipe behavior

- [ ] Keyboard accessibility
  - **Expected:** All functions accessible via keyboard

---

## Accessibility

### Keyboard Navigation
**Test Cases:**
- [ ] Tab order is logical
  - **Expected:** Navigate with Tab key follows visual flow

- [ ] All interactive elements keyboard accessible
  - **Expected:** Buttons, links, inputs accessible with keyboard

- [ ] Skip links (if implemented)
  - **Expected:** Can skip to main content

- [ ] Escape key closes modals/dialogs
  - **Steps:** Open dialog, press Escape
  - **Expected:** Dialog closes

### Screen Reader Support
**Test Cases:**
- [ ] ARIA labels on buttons and icons
  - **Expected:** Buttons with icons have aria-label

- [ ] Form labels associated with inputs
  - **Expected:** All inputs have labels

- [ ] Heading hierarchy is logical
  - **Expected:** h1 > h2 > h3 structure

- [ ] Alt text on images
  - **Expected:** Meaningful alt text for all images

### Visual Accessibility
**Test Cases:**
- [ ] Sufficient color contrast
  - **Expected:** WCAG AA compliance (4.5:1 ratio)

- [ ] Status indicators work with colorblind users
  - **Expected:** Icons or patterns accompany colors

- [ ] Text scales with browser zoom
  - **Expected:** Layout remains functional at 200% zoom

- [ ] Focus indicators visible
  - **Expected:** Clear focus outline on focused elements

---

## Smoke Test Checklist

Run this quick checklist before each release:

### Authentication
- [ ] Login with admin account works
- [ ] Login with invalid credentials shows error
- [ ] Logout works
- [ ] Session persists on page refresh

### Dashboard
- [ ] Dashboard loads without errors
- [ ] Statistics cards show numbers
- [ ] Charts render correctly
- [ ] Quick action buttons navigate correctly

### Tasks
- [ ] Can create a new task
- [ ] Can edit an existing task
- [ ] Can delete a task
- [ ] Filters work correctly
- [ ] Task moves between status columns

### Projects
- [ ] Can view projects list
- [ ] Can create a new project (admin/supervisor)
- [ ] Can edit a project
- [ ] Can delete a project (admin/supervisor)

### Users
- [ ] Can view users list (admin/supervisor)
- [ ] Can create a new user (admin)
- [ ] Can edit a user (admin)
- [ ] Can delete a user (admin)

### Reports
- [ ] Reports page loads
- [ ] Charts display
- [ ] Filters work
- [ ] Date range selector works

### Notifications
- [ ] Can view notifications
- [ ] Can mark as read
- [ ] Can delete notifications
- [ ] Unread count displays correctly

### Responsive
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] No horizontal scroll on small screens

### General
- [ ] Persian numerals display correctly
- [ ] Persian date formats correct
- [ ] No JavaScript errors in console
- [ ] All Persian text displays correctly (no rectangles)
- [ ] Performance is acceptable

---

## Bug Reporting Template

When reporting bugs, include:

1. **Title:** Clear, concise description
2. **Steps to Reproduce:** Numbered list of actions
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happened
5. **Environment:**
   - Browser and version
   - Device (mobile/tablet/desktop)
   - Screen resolution
   - User role
6. **Screenshots:** Visual evidence
7. **Console Errors:** Any JavaScript errors
8. **Priority:** Critical/High/Medium/Low
9. **Additional Notes:** Any other relevant information

---

## Test Data Recommendations

Create diverse test data including:

- **Tasks:** Various statuses, priorities, deadlines (past, present, future), with and without assignees
- **Projects:** Active, archived, with different supervisors
- **Users:** All three roles (admin, supervisor, employee), with and without avatars
- **Comments:** Regular comments, edited comments, soft-deleted comments
- **Notifications:** Read/unread, different types, various timestamps

---

## Security Testing (Basic)

While this is not a comprehensive security test, verify:

- [ ] Users cannot access other users' private data
- [ ] Role restrictions enforced (employees can't access admin features)
- [ ] Session timeout works
- [ ] XSS protection (try entering `<script>` in forms)
- [ ] CSRF protection in place
- [ ] Sensitive data not exposed in client-side code

---

## Performance Testing

- [ ] Page load times under 3 seconds
- [ ] API responses under 500ms
- [ ] Charts render smoothly
- [ ] No memory leaks during navigation
- [ ] Works with 100+ tasks
- [ ] Works with 50+ projects
- [ ] Works with 100+ users

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Final Notes

This testing guide covers the complete feature set of the Task Manager application. Prioritize testing based on:
1. **User Impact:** Features used by most users
2. **Business Critical:** Core functionality that cannot fail
3. **Risk Areas:** Complex features or recent changes

Remember to test with real data scenarios and different user workflows, not just isolated features.

---

**Created:** 2025-10-30
**Version:** 1.0
**Application:** Task Manager App (React + PocketBase)
