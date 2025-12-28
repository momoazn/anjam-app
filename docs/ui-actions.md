# Anjam Application - UI Actions Reference

This document lists all user interface actions available in the Anjam task and project management application, organized by the order of typical usage.

## Table of Contents

1. [Authentication & Initial Setup](#1-authentication--initial-setup)
2. [Organization Setup](#2-organization-setup)
3. [Invitations & Onboarding](#3-invitations--onboarding)
4. [Dashboard & Navigation](#4-dashboard--navigation)
5. [Project Setup](#5-project-setup)
6. [Task Management](#6-task-management)
7. [Calendar & Scheduling](#7-calendar--scheduling)
8. [Task Collaboration](#8-task-collaboration)
9. [Time Tracking & Timesheets](#9-time-tracking--timesheets)
10. [Tags Management](#10-tags-management)
11. [Saved Filters](#11-saved-filters)
12. [Bulk Operations](#12-bulk-operations)
13. [Notifications](#13-notifications)
14. [User Management](#14-user-management)
15. [Organization & Project Administration](#15-organization--project-administration)
16. [Reports & Audit](#16-reports--audit)
17. [Settings & Preferences](#17-settings--preferences)
18. [Help & Documentation](#18-help--documentation)
19. [File Management](#19-file-management)
20. [UI State Actions](#20-ui-state-actions)

---

## 1. Authentication & Initial Setup

### Registration & Login

- **Register** - Create new account (with organization creation)
- **Register with invite** - Create account using invite link
- **Login** - Submit login form to access application
- **Logout** - Sign out button in user menu

_Note: Self-service password reset is not implemented. Users can change password from Settings → Security when logged in._

---

## 2. Organization Setup

### Organization Creation & Selection

- **Create organization** - New organization button
- **Switch organization** - Organization selector in sidebar
- **Accept invitation** - Accept organization invitation (for invited users)

### Organization Members Management

- **View organization members** - Navigate to members page
- **Invite member** - Invite user by email
- **Update member role** - Change role dropdown (owner, admin, member)
- **Remove member** - Remove member from organization

---

## 3. Invitations & Onboarding

### Organization Invitations

- **Create invite link** - Generate invite link for organization
- **Set invite role** - Assign role for invited users (admin/member)
- **Set max uses** - Set maximum number of uses for invite link
- **View invites** - List all organization invites
- **Revoke invite** - Deactivate invite link
- **Accept invite** - Register using invite link
- **View invite details** - See invite organization and role

### Onboarding

- **Complete onboarding** - Finish initial setup flow
- **Skip onboarding** - Skip onboarding (for invited users)
- **View pending activation** - See activation pending state

---

## 4. Dashboard & Navigation

### Dashboard

- **View dashboard** - Navigate to dashboard (logo click or menu)
- **View task stats** - See total, completed, in-progress, pending tasks
- **View overdue tasks** - See overdue tasks widget
- **View due today** - See tasks due today count
- **View this week completed** - See weekly completion stats
- **View completion rate** - See percentage completion
- **View recent tasks** - See 5 latest tasks
- **View project stats** - See project progress bars
- **View status distribution** - See pie chart of task statuses
- **View productivity trends** - See 7-day trend chart
- **View recent notifications** - See unread notifications first
- **Quick navigate** - Click any stat/item to navigate to details

### Global Search

- **Open search** - Click search or use keyboard shortcut (Cmd/Ctrl+K)
- **Search tasks and projects** - Type to search (min 2 characters)
- **View search results** - See tasks with display ID, status; projects with code
- **Navigate to result** - Click result or use Enter key
- **Close search** - Press Escape or click outside
- **Clear search** - Clear search input

### Navigation

- **Sidebar navigation** - Click menu items to navigate
- **Breadcrumbs** - Navigate via breadcrumb links
- **Back button** - Browser back navigation
- **Logo click** - Navigate to dashboard

---

## 5. Project Setup

### Project Creation

- **Create project** - Button in header (admin/supervisor only)
- **Save project** - Submit form to create project
- **Cancel** - Navigate back without saving

### Project Configuration

- **View project details** - Click project card to view details
- **Edit project** - Enter inline editing mode
- **Save changes** - Save button to commit edits
- **Cancel edit** - Cancel button to exit edit mode
- **Delete project** - Delete button with confirmation
- **Edit description** - Rich text editor for project description
- **Upload files** - Add project assets/files
- **Delete files** - Remove project assets

### Project Members

- **View project users** - Users button on project card or navigate to project users page
- **Add member** - Add user to project
- **Update member role** - Change role dropdown (owner, admin, member, viewer)
- **Remove member** - Remove member from project
- **View member details** - Click member to view details

### Project Statuses

- **View project statuses** - Navigate to project status settings
- **Add custom status** - Create new status for project workflow
- **Edit status** - Modify status name and color
- **Reorder statuses** - Drag and drop to change status order
- **Set default status** - Mark status as default for new tasks
- **Mark as done status** - Mark status as completion state
- **Delete status** - Remove status (only if no tasks use it)

---

## 6. Task Management

### Task Creation

- **Create new task** - Button in header to create a new task
- **Create task for project** - New task button specific to project
- **Save task** - Submit form to create task
- **Cancel** - Navigate back without saving

### Task Form Fields

- **Change project** - Project selector dropdown
- **Change assignee** - User selector dropdown
- **Change status** - Status dropdown
- **Change priority** - Priority dropdown (low, medium, high, urgent)
- **Add tags** - Tag selector with multi-select
- **Set due date** - Date picker for due date
- **Add description** - Rich text editor for task description

### Task List View

- **View list** - Switch to list view
- **Click task** - Navigate to task details page
- **Select/deselect tasks** - Checkbox selection for individual tasks
- **Toggle selection mode** - Enable/disable multi-select checkbox mode
- **Sort tasks** - Change sort order (default, date, priority)
- **Collapse/expand status sections** - Toggle visibility of status groups
- **Filter tasks** - Apply filters to tasks

### Task Board (Kanban) View

- **View board** - Switch to kanban board view
- **Drag and drop tasks** - Move tasks between status columns
- **Reorder within column** - Drag to reorder tasks in same column
- **Click task card** - Open task details modal/page
- **Create task** - Button in header to create new task

### Task Details Page

- **View task details** - Navigate to task details page
- **Edit task** - Button in header/sidebar to edit task
- **Delete task** - Delete button with confirmation dialog
- **Back to list** - Navigate back to task list
- **View activity stream** - View audit log tab
- **View comments** - Switch to comments tab
- **View subtasks** - Switch to subtasks tab
- **View time entries** - Switch to time entries tab

### Task Editing

- **Save task** - Submit form to update task
- **Cancel** - Navigate back without saving

---

## 8. Task Collaboration

### Comments

- **Add comment** - Comment composer to add new comment
- **Post comment** - Submit button to post comment
- **Cancel** - Clear draft and close composer
- **Attach file** - File upload button (max 5 files, 5MB each)
- **Mention user** - @mention autocomplete dropdown
- **Reply to comment** - Reply button on comments
- **Edit comment** - Edit own comments (shows "edited" indicator)
- **Delete comment** - Delete button on own comments (soft delete)
- **Expand/collapse thread** - Toggle nested replies visibility

### Comment Reactions

- **Add reaction** - Click reaction emoji to add (👍, 👎, ❤️, 🎉, 😄, 🤔)
- **Remove reaction** - Click active reaction to remove
- **View reactors** - Hover reaction to see who reacted

### Subtasks (Checklist)

- **Add subtask** - Add item to checklist/subtasks
- **Assign subtask** - Assign subtask to team member
- **Mark subtask done** - Check off subtask as completed
- **Reopen subtask** - Uncheck subtask to reopen
- **Reorder subtasks** - Drag and drop to reorder subtasks
- **Delete subtask** - Remove subtask from checklist

### Time Tracking

- **Log time entry** - Open time entry dialog to log time
- **Log time** - Submit time entry
- **Cancel** - Close dialog without saving
- **Set duration** - Hours/minutes input fields
- **Add note** - Optional note field
- **Select date** - Date picker for time entry date
- **View time entries** - List of logged time entries
- **Edit time entry** - Update existing time entry
- **Delete time entry** - Remove time entry
- **Edit time spent** - Manual time editing (admin/supervisor/assignee only)
- **Save time** - Save manual time changes
- **Cancel time edit** - Cancel time editing mode

---

## 10. Tags Management

### Tags Creation & Management

- **Create tag** - New tag button
- **Save tag** - Submit form to create/update tag
- **Cancel** - Close dialog without saving
- **Set tag name** - Name input field
- **Set tag color** - Color picker for tag color
- **Edit tag** - Edit button on tag
- **Delete tag** - Delete button with confirmation
- **Filter tags** - Search/filter tags

---

## 13. Notifications

### Notifications Viewing & Management

- **View notifications** - Navigate to notifications page
- **Mark as read** - Mark individual notification as read
- **Mark all as read** - Bulk action button to mark all as read
- **Delete notification** - Delete individual notification (with undo)
- **Clear all** - Delete all notifications
- **Clear read** - Delete all read notifications
- **Filter notifications** - Filter by All/Unread/Read
- **Sort notifications** - Sort by Newest/Oldest
- **Select notifications** - Multi-select mode for bulk actions
- **Bulk mark read** - Mark selected notifications as read
- **Bulk delete** - Delete selected notifications
- **View mention** - Navigate to mentioned task/comment

---

## 14. User Management

_Note: Admin/Manager only_

### User Creation & Management

- **Create user** - New user button in header
- **View users** - Navigate to users list
- **Edit user** - Edit button on user row
- **Delete user** - Delete button with confirmation dialog
- **Toggle user active** - Activate/deactivate user status
- **Unblock user** - Unblock user after failed login attempts
- **View login logs** - View user's login history

### User Edit Form

- **Save changes** - Submit form to update user
- **Cancel** - Navigate back without saving
- **Change role** - Role selector (admin, supervisor, manager, employee)
- **Change group** - Group selector dropdown

---

## 15. Organization & Project Administration

### Project Administration

- **View project tasks** - Tasks button on project card
- **Back to projects** - Navigate back to projects list

### Organization Administration

- **Manage organization members** - See Organization Setup section above
- **View organization settings** - Navigate to organization settings

---

## 17. Settings & Preferences

### Settings Navigation

- **View settings** - Navigate to settings page
- **Switch tabs** - Navigate between Profile/Appearance/Security/Preferences/About

### Profile Settings

- **Update profile** - Save profile changes
- **Change password** - Update password form

### Appearance & Preferences

- **Change theme** - Toggle between Light/Dark/System
- **Change timezone** - Timezone selector dropdown
- **Change date format** - Date format selector
- **Update preferences** - Save user preferences
- **Toggle activity feed** - Show/hide activity feed in task details

---

## 16. Reports & Audit

### Audit Logs

- **View audit logs** - Navigate to audit logs page
- **Filter audit logs** - Apply filters (date, user, action, resource)
- **View resource history** - Click resource to view its audit trail
- **Paginate** - Navigate through pages (next/previous)

### Reports

- **View reports** - Navigate to reports page
- **Filter by date range** - Select time period for report
- **Filter by project** - Filter report by specific project
- **Filter by assignee** - Filter report by team member
- **Filter by status** - Filter report by task status
- **Filter by priority** - Filter report by task priority
- **View metric cards** - See summary statistics (tasks, completion rates)
- **View timeliness chart** - See on-time vs late vs pending analysis
- **View priority distribution** - See tasks by priority chart
- **View productivity trends** - See 7-day productivity line chart
- **View workload distribution** - See tasks per employee chart
- **View overtime analysis** - See overtime hours chart
- **View employee comparison** - See employee performance comparison
- **View leaderboard** - See top performers ranking
- **Click metric for drilldown** - View detailed data for clicked metric
- **Export to Excel** - Download report as Excel file (.xlsx)

---

## 12. Bulk Operations

_Available when tasks are in selection mode_

### Task Selection

- **Toggle selection mode** - Enable/disable multi-select checkbox mode
- **Select/deselect tasks** - Checkbox selection for individual tasks
- **Clear selection** - Deselect all tasks

### Bulk Task Actions

- **Bulk assign** - Assign all selected tasks to a user
- **Bulk status change** - Change status of all selected tasks
- **Bulk priority change** - Change priority of all selected tasks
- **Bulk delete** - Delete all selected tasks

---

## 19. File Management

### File Operations

- **Upload file** - File picker to upload files (in comments, projects, etc.)
- **Delete file** - Remove uploaded file
- **Preview file** - View file preview

---

## 20. UI State Actions

### General UI Interactions

- **Toggle sidebar** - Collapse/expand sidebar
- **Toggle theme** - Switch between light/dark mode
- **Open/close dialogs** - Modal interactions
- **Undo actions** - Undo via toast notifications
- **Dismiss notifications** - Close toast messages

---

## 7. Calendar & Scheduling

### Calendar View

- **View task calendar** - Navigate to calendar page
- **Navigate months** - Previous/next month buttons
- **Go to today** - Jump to current month
- **View monthly stats** - See total, completed, and pending tasks
- **View task details** - Click task to navigate to task details
- **View task count** - See number of tasks per day
- **View month overview** - See all tasks with deadlines for the month

---

## 9. Time Tracking & Timesheets

### Timesheet View

- **View timesheet** - Navigate to timesheet page
- **View weekly breakdown** - See time spent per day for current week
- **View daily tasks** - See tasks worked on each day
- **View daily totals** - See total time spent per day
- **View weekly total** - See total time spent for the week
- **Export timesheet** - Download timesheet as CSV
- **Navigate to task** - Click task to view details

### Time Entry Management

- **Log time entry** - Open time entry dialog to log time
- **Log time** - Submit time entry
- **Cancel** - Close dialog without saving
- **Set duration** - Hours/minutes input fields
- **Add note** - Optional note field
- **Select date** - Date picker for time entry date
- **View time entries** - List of logged time entries
- **Edit time entry** - Update existing time entry
- **Delete time entry** - Remove time entry
- **Edit time spent** - Manual time editing (admin/supervisor/assignee only)
- **Save time** - Save manual time changes
- **Cancel time edit** - Cancel time editing mode

---

## 18. Help & Documentation

### Help Center

- **View help articles** - Navigate to help page
- **Browse categories** - View help categories
- **Read article** - View detailed help content

_Note: Help search is not yet implemented._

---

## 11. Saved Filters

### Filter Management

- **Save current filter** - Save current filter configuration
- **Name filter** - Provide name for saved filter
- **View saved filters** - Access saved filters dropdown
- **Apply saved filter** - Select saved filter to apply
- **Manage saved filters** - Open manage filters dialog
- **Edit saved filter** - Modify existing saved filter
- **Delete saved filter** - Remove saved filter
- **Set as default** - Set filter as default for current view

---

## Usage Flow Summary

### Typical New User Journey

1. **Register** → Create account
2. **Login** → Access application
3. **Create/Select Organization** → Set up or join organization
4. **Invite Members** → Add team members to organization
5. **Create Project** → Set up new project
6. **Add Project Members** → Assign users to project
7. **Create Tags** → Set up tags for categorization
8. **Create Task** → Add tasks to project
9. **Assign Tasks** → Assign tasks to team members
10. **Add Comments** → Collaborate on tasks
11. **Log Time** → Track time spent on tasks
12. **View Notifications** → Stay updated on activity
13. **Configure Settings** → Customize preferences

### Daily Workflow

1. **Login** → Access application
2. **View Dashboard** → Check overview and stats
3. **View Tasks** → See assigned tasks (list or board view)
4. **Update Task Status** → Move tasks through workflow
5. **Add Comments** → Communicate on tasks
6. **React to Comments** → Quick feedback with emoji reactions
7. **Log Time** → Track work hours
8. **View Notifications** → Check updates
9. **Search** → Find specific tasks/projects (Cmd/Ctrl+K)

### Administrative Workflow

1. **Create Users** → Add new team members
2. **Manage Organization** → Configure organization settings
3. **Manage Projects** → Create and configure projects
4. **Assign Members** → Add users to projects
5. **View Reports** → Analyze productivity
6. **View Audit Logs** → Track system activity

---

## Notes

- Most actions are role-based and may not be available to all users
- Some actions require confirmation dialogs for safety
- Bulk operations are only available when items are selected
- Time tracking actions have permission restrictions (admin/supervisor/assignee)
- File uploads support multiple file types (images, PDFs, documents)
- Comment attachments: max 5 files, 5MB each
- All destructive actions (delete, remove) have confirmation dialogs
- Actions can be accessed through multiple entry points (buttons, menus, keyboard shortcuts)
- Invite links have expiration dates (7 days) and usage limits (default 50)
- Timesheet exports are in CSV format
- Calendar view shows tasks with deadlines only (uses Jalali/Persian calendar)
- Saved filters are user-specific and persist in browser localStorage
- Task deletion has 5-second undo via toast notification
- Notification deletion has 5-second undo via toast notification

### Not Yet Implemented

- Self-service password reset via email
- Time entry date selection (uses record timestamp)
- Bulk delete undo for tasks
- Delete comment attachments after posting
- Help article search

---

_Last updated: 2025-12-29_
