# Anjam Application - UI Actions Reference

This document lists all user interface actions available in the Anjam task and project management application, organized by the order of typical usage.

## Table of Contents

1. [Authentication & Initial Setup](#1-authentication--initial-setup)
2. [Organization Setup](#2-organization-setup)
3. [Project Setup](#3-project-setup)
4. [Task Management](#4-task-management)
5. [Task Collaboration](#5-task-collaboration)
6. [Tags Management](#6-tags-management)
7. [Notifications](#7-notifications)
8. [User Management](#8-user-management)
9. [Organization & Project Administration](#9-organization--project-administration)
10. [Settings & Preferences](#10-settings--preferences)
11. [Dashboard & Navigation](#11-dashboard--navigation)
12. [Reports & Audit](#12-reports--audit)
13. [Bulk Operations](#13-bulk-operations)
14. [File Management](#14-file-management)
15. [UI State Actions](#15-ui-state-actions)

---

## 1. Authentication & Initial Setup

### Registration & Login

- **Register** - Create new account
- **Login** - Submit login form to access application
- **Forgot password** - Password reset link
- **Logout** - Sign out button in user menu

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

## 3. Project Setup

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

---

## 4. Task Management

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

## 5. Task Collaboration

### Comments

- **Add comment** - Comment composer to add new comment
- **Post comment** - Submit button to post comment
- **Cancel** - Clear draft and close composer
- **Attach file** - File upload button
- **Mention user** - @mention autocomplete dropdown
- **Reply to comment** - Reply button on comments
- **Edit comment** - Edit own comments
- **Delete comment** - Delete button on own comments (soft delete)

### Subtasks (Checklist)

- **Add subtask** - Add item to checklist/subtasks
- **Mark subtask done** - Check off subtask as completed
- **Reopen subtask** - Uncheck subtask to reopen
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

## 6. Tags Management

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

## 7. Notifications

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

## 8. User Management

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

## 9. Organization & Project Administration

### Project Administration

- **View project tasks** - Tasks button on project card
- **Back to projects** - Navigate back to projects list

### Organization Administration

- **Manage organization members** - See Organization Setup section above
- **View organization settings** - Navigate to organization settings

---

## 10. Settings & Preferences

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

## 11. Dashboard & Navigation

### Dashboard

- **View dashboard** - Navigate to dashboard (logo click or menu)
- **View all tasks** - Navigate to tasks page
- **View all projects** - Navigate to projects page
- **View notifications** - Navigate to notifications page
- **View reports** - Navigate to reports page
- **Quick stats** - Click stats to filter/view details

### Global Search

- **Search** - Search input in header
- **View search results** - Click result to navigate
- **Clear search** - Clear search input

### Navigation

- **Sidebar navigation** - Click menu items to navigate
- **Breadcrumbs** - Navigate via breadcrumb links
- **Back button** - Browser back navigation
- **Logo click** - Navigate to dashboard

---

## 12. Reports & Audit

### Audit Logs

- **View audit logs** - Navigate to audit logs page
- **Filter audit logs** - Apply filters (date, user, action, resource)
- **View resource history** - Click resource to view its audit trail
- **Paginate** - Navigate through pages (next/previous)

### Reports

- **View reports** - Navigate to reports page
- **Generate report** - Export data/report
- **Filter reports** - Apply date/project filters
- **View charts** - Interactive charts and visualizations

---

## 13. Bulk Operations

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

## 14. File Management

### File Operations

- **Upload file** - File picker to upload files (in comments, projects, etc.)
- **Delete file** - Remove uploaded file
- **Preview file** - View file preview

---

## 15. UI State Actions

### General UI Interactions

- **Toggle sidebar** - Collapse/expand sidebar
- **Toggle theme** - Switch between light/dark mode
- **Open/close dialogs** - Modal interactions
- **Undo actions** - Undo via toast notifications
- **Dismiss notifications** - Close toast messages

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
2. **View Dashboard** → Check overview
3. **View Tasks** → See assigned tasks
4. **Update Task Status** → Move tasks through workflow
5. **Add Comments** → Communicate on tasks
6. **Log Time** → Track work hours
7. **View Notifications** → Check updates
8. **Search** → Find specific tasks/projects

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
- File uploads support multiple file types
- All destructive actions (delete, remove) have confirmation dialogs
- Actions can be accessed through multiple entry points (buttons, menus, keyboard shortcuts)

---

_Last updated: 2024_
