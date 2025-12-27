# Anjam Application - User Stories

This document contains user stories for the Anjam task and project management application, organized by user journey and role.

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

### US-001: User Registration

**As a** new user  
**I want to** register for an account  
**So that** I can access the application and start managing tasks and projects

**Acceptance Criteria:**

- User can enter email/username and password
- System validates input fields
- User receives confirmation upon successful registration
- User is redirected to login page after registration

---

### US-002: User Login

**As a** registered user  
**I want to** log in to the application  
**So that** I can access my tasks, projects, and organization data

**Acceptance Criteria:**

- User can enter credentials (username/email and password)
- System validates credentials
- User is redirected to dashboard upon successful login
- Failed login attempts are tracked (max 5 before blocking)
- User sees appropriate error messages for invalid credentials

---

### US-003: Password Reset

**As a** user who forgot their password  
**I want to** reset my password  
**So that** I can regain access to my account

**Acceptance Criteria:**

- User can request password reset via email
- User receives password reset link
- User can set a new password
- User can log in with new password

---

### US-004: User Logout

**As a** logged-in user  
**I want to** log out of the application  
**So that** I can securely end my session

**Acceptance Criteria:**

- User can click logout button
- Session is terminated
- User is redirected to login page
- User must log in again to access the application

---

## 2. Organization Setup

### US-005: Create Organization

**As a** user  
**I want to** create a new organization  
**So that** I can organize my team and projects under a single entity

**Acceptance Criteria:**

- User can create organization with name and description
- User automatically becomes organization owner
- Organization slug is auto-generated
- User can see organization in sidebar after creation

---

### US-006: Switch Organization

**As a** user who belongs to multiple organizations  
**I want to** switch between organizations  
**So that** I can work on projects from different organizations

**Acceptance Criteria:**

- User can see all organizations they belong to in sidebar
- User can select different organization
- Context switches to selected organization
- Projects and tasks filter to selected organization

---

### US-007: Accept Organization Invitation

**As a** user who received an organization invitation  
**I want to** accept the invitation  
**So that** I can join the organization and access its projects

**Acceptance Criteria:**

- User can see pending invitations
- User can accept invitation
- User is added to organization with specified role
- User can access organization after acceptance

---

### US-008: Invite Organization Member

**As an** organization owner or admin  
**I want to** invite users to join my organization  
**So that** I can collaborate with team members

**Acceptance Criteria:**

- User can invite by email address
- User can assign role (owner, admin, member)
- Invited user receives notification
- Invitation status is tracked (invited, active, suspended)

---

### US-009: Manage Organization Members

**As an** organization owner or admin  
**I want to** view and manage organization members  
**So that** I can control access and permissions

**Acceptance Criteria:**

- User can view all organization members
- User can filter by status (invited, active, suspended)
- User can update member roles
- User can remove members from organization

---

## 3. Project Setup

### US-010: Create Project

**As an** admin or supervisor  
**I want to** create a new project  
**So that** I can organize tasks and collaborate with my team

**Acceptance Criteria:**

- User can create project with name, code, and description
- Project code is auto-generated (3-letter uppercase)
- Project is associated with current organization
- User can assign supervisor to project
- Default statuses are created for the project

---

### US-011: View Project Details

**As a** project member  
**I want to** view project details  
**So that** I can understand project context and access related information

**Acceptance Criteria:**

- User can see project name, code, description
- User can see project statistics (tasks, completion, time spent)
- User can see project members
- User can navigate to project tasks and users

---

### US-012: Edit Project

**As an** admin or project supervisor  
**I want to** edit project information  
**So that** I can keep project details up to date

**Acceptance Criteria:**

- User can enter edit mode
- User can update name, code, description
- User can upload/delete project files
- Changes are saved and reflected immediately

---

### US-013: Delete Project

**As an** admin or project supervisor  
**I want to** delete a project  
**So that** I can remove obsolete projects

**Acceptance Criteria:**

- User can delete project with confirmation dialog
- All related tasks and data are handled appropriately
- User sees confirmation before deletion
- Project is removed from list after deletion

---

### US-014: Add Project Member

**As a** project owner or admin  
**I want to** add members to a project  
**So that** they can work on project tasks

**Acceptance Criteria:**

- User can add existing organization members to project
- User can assign project role (owner, admin, member, viewer)
- Added member receives notification
- Member appears in project members list

---

### US-015: Manage Project Members

**As a** project owner or admin  
**I want to** manage project member roles and permissions  
**So that** I can control who can perform what actions

**Acceptance Criteria:**

- User can view all project members
- User can update member roles
- User can remove members from project
- Changes reflect immediately in project

---

## 4. Task Management

### US-016: Create Task

**As a** user  
**I want to** create a new task  
**So that** I can track work items and assign them to team members

**Acceptance Criteria:**

- User can create task with title, description, project
- User can assign task to team member
- User can set priority, status, due date
- User can add tags to task
- Task display ID is auto-generated (PROJECT-001 format)

---

### US-017: View Task List

**As a** user  
**I want to** view my tasks in a list  
**So that** I can see all tasks and their status

**Acceptance Criteria:**

- User can see tasks grouped by status
- User can sort tasks (default, date, priority)
- User can filter tasks
- User can collapse/expand status sections
- Employee role sees only assigned tasks

---

### US-018: View Task Board (Kanban)

**As a** user  
**I want to** view tasks in a kanban board  
**So that** I can visualize workflow and move tasks between statuses

**Acceptance Criteria:**

- User can see tasks organized in columns by status
- User can drag and drop tasks between columns
- User can reorder tasks within columns
- Task status updates when moved to different column

---

### US-019: View Task Details

**As a** user  
**I want to** view detailed information about a task  
**So that** I can understand requirements and see all related information

**Acceptance Criteria:**

- User can see task title, description, status, priority
- User can see assignee, project, due date
- User can see comments, subtasks, time entries
- User can see activity stream/audit log
- User can navigate between tabs

---

### US-020: Edit Task

**As a** task creator or assignee  
**I want to** edit task details  
**So that** I can update information as requirements change

**Acceptance Criteria:**

- User can update task fields (title, description, status, priority, etc.)
- User can change assignee
- User can add/remove tags
- Changes are saved and reflected immediately
- Activity is logged in audit trail

---

### US-021: Delete Task

**As a** task creator or admin  
**I want to** delete a task  
**So that** I can remove obsolete or duplicate tasks

**Acceptance Criteria:**

- User can delete task with confirmation dialog
- Task is soft-deleted (deleted_at timestamp)
- User can undo deletion within 5 seconds
- Task disappears from lists after deletion

---

### US-022: Filter and Sort Tasks

**As a** user  
**I want to** filter and sort tasks  
**So that** I can find specific tasks quickly

**Acceptance Criteria:**

- User can filter by project, assignee, status, priority, tags
- User can sort by date, priority, status
- Filters persist across page navigation
- User can clear filters easily

---

## 5. Task Collaboration

### US-023: Add Comment to Task

**As a** user  
**I want to** add comments to tasks  
**So that** I can communicate with team members about task progress

**Acceptance Criteria:**

- User can add comment with text
- User can attach files to comments
- User can mention other users with @mention
- Comment appears in task comments list
- Mentioned users receive notifications

---

### US-024: Reply to Comment

**As a** user  
**I want to** reply to existing comments  
**So that** I can have threaded conversations about tasks

**Acceptance Criteria:**

- User can reply to any comment
- Reply is linked to parent comment
- User can see comment thread structure
- All participants receive notifications

---

### US-025: Edit/Delete Comment

**As a** comment author  
**I want to** edit or delete my comments  
**So that** I can correct mistakes or remove outdated information

**Acceptance Criteria:**

- User can edit own comments
- User can delete own comments (soft delete)
- Edited comments show edit indicator
- Deleted comments are marked as deleted

---

### US-026: Add Subtasks

**As a** user  
**I want to** add subtasks to a task  
**So that** I can break down complex tasks into smaller actionable items

**Acceptance Criteria:**

- User can add subtask with title
- User can assign subtask to team member
- Subtasks appear in checklist format
- User can mark subtasks as done
- User can reorder subtasks

---

### US-027: Manage Subtasks

**As a** user  
**I want to** mark subtasks as done or reopen them  
**So that** I can track progress on task breakdown

**Acceptance Criteria:**

- User can check off completed subtasks
- User can reopen completed subtasks
- User can delete subtasks
- Subtask completion status is visible

---

### US-028: Log Time Entry

**As a** user  
**I want to** log time spent on a task  
**So that** I can track my work hours and project time

**Acceptance Criteria:**

- User can log time with hours and minutes
- User can add optional note
- User can select date for time entry
- Time entry is added to task
- Task time aggregates update automatically

---

### US-029: View Time Entries

**As a** user  
**I want to** view all time entries for a task  
**So that** I can see how much time has been spent

**Acceptance Criteria:**

- User can see list of all time entries
- User can see who logged each entry
- User can see date, duration, and notes
- Total time is displayed

---

### US-030: Edit Time Entry

**As a** user (or admin/supervisor)  
**I want to** edit or delete time entries  
**So that** I can correct mistakes in time logging

**Acceptance Criteria:**

- User can edit own time entries
- Admin/supervisor can edit any time entry
- User can delete time entries
- Task time aggregates update after changes

---

### US-031: Manual Time Editing

**As an** admin, supervisor, or task assignee  
**I want to** manually edit total time spent on a task  
**So that** I can adjust time for corrections or estimates

**Acceptance Criteria:**

- User can enter hours and minutes directly
- Changes are saved and reflected in task
- Only authorized users can edit time
- Activity is logged

---

## 6. Tags Management

### US-032: Create Tag

**As a** user  
**I want to** create tags  
**So that** I can categorize and organize tasks

**Acceptance Criteria:**

- User can create tag with name and color
- Tag is associated with user's organization
- Tag appears in tag selector
- User can use tag immediately after creation

---

### US-033: Edit Tag

**As a** tag creator  
**I want to** edit tag name and color  
**So that** I can update tag information

**Acceptance Criteria:**

- User can update tag name
- User can change tag color
- Changes reflect in all tasks using the tag
- Tag remains associated with same organization

---

### US-034: Delete Tag

**As a** tag creator  
**I want to** delete tags  
**So that** I can remove obsolete tags

**Acceptance Criteria:**

- User can delete tag with confirmation
- Tag is removed from all tasks
- User sees confirmation dialog
- Deletion cannot be undone

---

### US-035: Filter by Tags

**As a** user  
**I want to** filter tasks by tags  
**So that** I can find tasks with specific categories

**Acceptance Criteria:**

- User can select tags to filter by
- Tasks matching selected tags are shown
- Multiple tags can be selected
- Filter persists across navigation

---

## 7. Notifications

### US-036: View Notifications

**As a** user  
**I want to** view my notifications  
**So that** I can stay updated on task assignments, comments, and mentions

**Acceptance Criteria:**

- User can see all notifications
- Notifications show type, title, message, and timestamp
- User can filter by All/Unread/Read
- User can sort by Newest/Oldest
- Unread count is displayed

---

### US-037: Mark Notification as Read

**As a** user  
**I want to** mark notifications as read  
**So that** I can track which notifications I've seen

**Acceptance Criteria:**

- User can mark individual notification as read
- User can mark all notifications as read
- Read status is saved
- Unread count updates immediately

---

### US-038: Delete Notifications

**As a** user  
**I want to** delete notifications  
**So that** I can clean up my notification list

**Acceptance Criteria:**

- User can delete individual notification (with undo)
- User can delete all notifications
- User can delete only read notifications
- Deletion can be undone within 5 seconds

---

### US-039: Navigate from Notification

**As a** user  
**I want to** navigate to the task or comment from a notification  
**So that** I can quickly access relevant information

**Acceptance Criteria:**

- User can click notification to navigate
- User is taken to relevant task/comment
- Notification is marked as read when clicked
- User can navigate to mentioned items

---

## 8. User Management

### US-040: Create User

**As an** admin or manager  
**I want to** create new user accounts  
**So that** I can add team members to the system

**Acceptance Criteria:**

- User can create account with username, email, password
- User can assign role (admin, supervisor, manager, employee)
- User can assign to group
- New user receives credentials
- User appears in users list

---

### US-041: View Users

**As an** admin, supervisor, or manager  
**I want to** view all users  
**So that** I can manage team members

**Acceptance Criteria:**

- User can see list of all users
- User can see user details (name, role, status)
- User can filter and search users
- List shows active/inactive status

---

### US-042: Edit User

**As an** admin or the user themselves  
**I want to** edit user information  
**So that** I can update user details and roles

**Acceptance Criteria:**

- Admin can edit any user
- User can edit own profile
- User can update role, group, and other fields
- Changes are saved and reflected immediately

---

### US-043: Toggle User Active Status

**As an** admin  
**I want to** activate or deactivate users  
**So that** I can control who has access to the system

**Acceptance Criteria:**

- Admin can toggle user active status
- Inactive users cannot log in
- Admin cannot deactivate themselves
- Admin cannot deactivate other admins
- Status change is logged

---

### US-044: Unblock User

**As an** admin  
**I want to** unblock users who were blocked after failed login attempts  
**So that** they can regain access to their account

**Acceptance Criteria:**

- Admin can unblock user
- Failed login attempts counter is reset
- User can log in immediately after unblocking
- Block reason is cleared

---

### US-045: View Login Logs

**As an** admin or the user themselves  
**I want to** view login history  
**So that** I can monitor account security

**Acceptance Criteria:**

- User can see own login logs
- Admin can see any user's login logs
- Logs show IP address, user agent, success/failure
- Logs are paginated and sortable

---

## 9. Organization & Project Administration

### US-046: View Project Tasks

**As a** project member  
**I want to** view all tasks for a project  
**So that** I can see project progress and task list

**Acceptance Criteria:**

- User can see all tasks in project
- Tasks are filtered by project
- User can create tasks for project
- User can switch to board view

---

### US-047: Manage Organization Settings

**As an** organization owner or admin  
**I want to** manage organization settings  
**So that** I can configure organization preferences

**Acceptance Criteria:**

- User can access organization settings
- User can update organization details
- User can manage organization members
- Changes affect all organization projects

---

## 10. Settings & Preferences

### US-048: Update Profile

**As a** user  
**I want to** update my profile information  
**So that** my team members can see my current details

**Acceptance Criteria:**

- User can update name, email, and other profile fields
- Changes are saved and reflected immediately
- User can see updated information in profile

---

### US-049: Change Password

**As a** user  
**I want to** change my password  
**So that** I can maintain account security

**Acceptance Criteria:**

- User can enter current password
- User can set new password
- System validates password strength
- User must confirm new password
- Password is updated after confirmation

---

### US-050: Change Theme

**As a** user  
**I want to** change the application theme  
**So that** I can use the interface in my preferred color scheme

**Acceptance Criteria:**

- User can select Light, Dark, or System theme
- Theme changes immediately
- Preference is saved
- Theme persists across sessions

---

### US-051: Configure Timezone

**As a** user  
**I want to** set my timezone  
**So that** dates and times are displayed in my local time

**Acceptance Criteria:**

- User can select timezone from dropdown
- Dates and times display in selected timezone
- Preference is saved
- Timezone affects all date displays

---

### US-052: Configure Date Format

**As a** user  
**I want to** choose my preferred date format  
**So that** dates are displayed in a familiar format

**Acceptance Criteria:**

- User can select date format (locale, yyyy/MM/dd, dd/MM/yyyy, MM/dd/yyyy)
- Dates display in selected format
- Preference is saved
- Format applies to all date displays

---

### US-053: Toggle Activity Feed

**As a** user  
**I want to** show or hide the activity feed in task details  
**So that** I can customize my task view

**Acceptance Criteria:**

- User can toggle activity feed visibility
- Setting is saved in preferences
- Activity feed shows/hides based on preference
- Change applies to all task detail views

---

## 11. Dashboard & Navigation

### US-054: View Dashboard

**As a** user  
**I want to** view the dashboard  
**So that** I can see an overview of my tasks, projects, and activity

**Acceptance Criteria:**

- User can see task statistics
- User can see project overview
- User can see recent notifications
- User can navigate to different sections from dashboard
- Dashboard shows data for current organization

---

### US-055: Global Search

**As a** user  
**I want to** search for tasks and projects  
**So that** I can quickly find what I'm looking for

**Acceptance Criteria:**

- User can search from header search bar
- Search finds tasks and projects by name/ID
- Results show relevant information
- User can click result to navigate
- Search respects user permissions

---

### US-056: Navigate Application

**As a** user  
**I want to** navigate between different sections  
**So that** I can access all features of the application

**Acceptance Criteria:**

- User can navigate via sidebar menu
- User can navigate via breadcrumbs
- User can use browser back button
- User can click logo to return to dashboard
- Navigation is intuitive and consistent

---

## 12. Reports & Audit

### US-057: View Audit Logs

**As an** admin  
**I want to** view audit logs  
**So that** I can track all changes and actions in the system

**Acceptance Criteria:**

- User can see all audit log entries
- Logs show actor, action, resource, timestamp
- User can filter by date, user, action, resource
- User can view field-level changes
- Logs are paginated

---

### US-058: View Resource History

**As an** admin  
**I want to** view audit history for a specific resource  
**So that** I can see all changes made to a task or project

**Acceptance Criteria:**

- User can click resource to view its history
- History shows all create/update/delete operations
- History shows field-level changes
- History is chronologically ordered

---

### US-059: Generate Reports

**As an** admin or supervisor  
**I want to** generate reports  
**So that** I can analyze productivity and project progress

**Acceptance Criteria:**

- User can generate various report types
- User can filter reports by date, project
- Reports can be exported
- Reports show charts and visualizations
- Reports respect user permissions

---

## 13. Bulk Operations

### US-060: Select Multiple Tasks

**As a** user  
**I want to** select multiple tasks  
**So that** I can perform bulk actions on them

**Acceptance Criteria:**

- User can enable selection mode
- User can select/deselect individual tasks
- Selected tasks are highlighted
- User can see count of selected tasks
- User can clear selection

---

### US-061: Bulk Assign Tasks

**As a** user  
**I want to** assign multiple tasks to a user at once  
**So that** I can efficiently manage task assignments

**Acceptance Criteria:**

- User can select multiple tasks
- User can assign all selected tasks to a user
- All tasks are updated simultaneously
- User sees confirmation message
- Activity is logged for each task

---

### US-062: Bulk Change Task Status

**As a** user  
**I want to** change the status of multiple tasks at once  
**So that** I can quickly update task progress

**Acceptance Criteria:**

- User can select multiple tasks
- User can change status for all selected tasks
- All tasks are updated simultaneously
- User sees confirmation message
- Status transitions are validated

---

### US-063: Bulk Change Task Priority

**As a** user  
**I want to** change the priority of multiple tasks at once  
**So that** I can quickly reprioritize work

**Acceptance Criteria:**

- User can select multiple tasks
- User can change priority for all selected tasks
- All tasks are updated simultaneously
- User sees confirmation message

---

### US-064: Bulk Delete Tasks

**As a** user  
**I want to** delete multiple tasks at once  
**So that** I can efficiently clean up obsolete tasks

**Acceptance Criteria:**

- User can select multiple tasks
- User can delete all selected tasks
- Confirmation dialog shows count of tasks to delete
- All tasks are soft-deleted
- User can undo deletion

---

## 14. File Management

### US-065: Upload Files

**As a** user  
**I want to** upload files to tasks, projects, or comments  
**So that** I can share documents and assets with my team

**Acceptance Criteria:**

- User can upload files via file picker
- Multiple file types are supported
- File size limits are enforced
- Files are attached to task/project/comment
- Upload progress is shown

---

### US-066: Delete Files

**As a** user  
**I want to** delete uploaded files  
**So that** I can remove outdated or incorrect files

**Acceptance Criteria:**

- User can delete files they uploaded
- Admin/supervisor can delete any file
- Deletion requires confirmation
- File is removed from task/project/comment

---

### US-067: Preview Files

**As a** user  
**I want to** preview uploaded files  
**So that** I can view files without downloading them

**Acceptance Criteria:**

- User can click file to preview
- Preview opens in modal or new tab
- Supported file types show preview
- User can download file from preview

---

## 15. UI State Actions

### US-068: Toggle Sidebar

**As a** user  
**I want to** collapse or expand the sidebar  
**So that** I can maximize screen space when needed

**Acceptance Criteria:**

- User can toggle sidebar visibility
- Sidebar state is saved
- Navigation remains accessible when collapsed
- Toggle is smooth and responsive

---

### US-069: Undo Actions

**As a** user  
**I want to** undo actions  
**So that** I can recover from mistakes

**Acceptance Criteria:**

- User sees undo option in toast notifications
- User can undo within 5 seconds
- Action is reversed when undone
- Undo is available for delete operations

---

### US-070: Dismiss Notifications

**As a** user  
**I want to** dismiss toast notifications  
**So that** they don't clutter my screen

**Acceptance Criteria:**

- User can close toast notifications
- Notifications auto-dismiss after timeout
- User can dismiss manually
- Dismissed notifications don't reappear

---

## User Story Summary by Role

### New User Journey

1. US-001: Register for account
2. US-002: Login to application
3. US-005: Create or join organization
4. US-010: Create first project
5. US-016: Create first task
6. US-023: Add comment to task
7. US-028: Log time on task

### Daily User Workflow

1. US-002: Login
2. US-054: View dashboard
3. US-017: View task list
4. US-020: Update task status
5. US-023: Add comments
6. US-028: Log time
7. US-036: Check notifications

### Administrator Workflow

1. US-040: Create users
2. US-005: Create organizations
3. US-010: Create projects
4. US-014: Add project members
5. US-057: View audit logs
6. US-059: Generate reports

---

## Notes

- User stories are written from the perspective of different user roles
- Acceptance criteria define what "done" means for each story
- Stories are organized by typical usage flow
- Some stories may have dependencies on others
- Role-based permissions affect story availability
- Stories can be prioritized and estimated for sprint planning

---

_Last updated: 2024_
