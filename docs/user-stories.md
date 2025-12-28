# Anjam Application - User Stories

This document contains user stories for the Anjam task and project management application, organized by user journey and role.

## Table of Contents

1. [Authentication & Initial Setup](#1-authentication--initial-setup)
2. [Organization Setup](#2-organization-setup)
3. [Invitations & Onboarding](#3-invitations--onboarding)
4. [Dashboard & Navigation](#4-dashboard--navigation)
5. [Project Setup](#5-project-setup)
6. [Task Management](#6-task-management)
7. [Task Collaboration](#7-task-collaboration)
8. [Tags Management](#8-tags-management)
9. [Notifications](#9-notifications)
10. [User Management](#10-user-management)
11. [Organization & Project Administration](#11-organization--project-administration)
12. [Settings & Preferences](#12-settings--preferences)
13. [Reports & Audit](#13-reports--audit)
14. [Bulk Operations](#14-bulk-operations)
15. [File Management](#15-file-management)
16. [UI State Actions](#16-ui-state-actions)
17. [Calendar & Scheduling](#17-calendar--scheduling)
18. [Time Tracking & Timesheets](#18-time-tracking--timesheets)
19. [Help & Documentation](#19-help--documentation)
20. [Saved Filters](#20-saved-filters)

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
- User is redirected to onboarding after registration

**How to Test:**

1. Navigate to `/register`
2. Enter a valid email, password, and organization name
3. Click "Register"
4. Verify account is created and you're redirected to onboarding
5. Try registering with invalid email format - verify error message
6. Try registering with short password (<8 chars) - verify error message

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

**How to Test:**

1. Navigate to `/login`
2. Enter valid credentials and click "Login"
3. Verify redirect to dashboard
4. Logout and try invalid password - verify error message
5. Try 5 failed logins - verify account gets blocked
6. As admin, unblock the user and verify login works again

---

### US-003: Password Reset

**As a** user who forgot their password
**I want to** reset my password
**So that** I can regain access to my account

**Acceptance Criteria:**

- Users can change password from Settings → Security (when logged in)
- Admins can reset a user's password via User Management

**Implementation Note:** Self-service password reset via email is not implemented.

**How to Test:**

1. Login and navigate to Settings → Security
2. Enter current password and new password
3. Click "Change Password"
4. Logout and login with new password
5. As admin, edit another user and set a new password

---

### US-004: User Logout

**As a** logged-in user
**I want to** log out of the application
**So that** I can securely end my session

**Acceptance Criteria:**

- User can click logout button in user menu
- Session is terminated
- User is redirected to login page
- User must log in again to access the application

**How to Test:**

1. While logged in, click user avatar in header
2. Click "Logout"
3. Verify redirect to login page
4. Try accessing `/dashboard` directly - verify redirect to login

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

**How to Test:**

1. Navigate to `/organizations/new`
2. Enter organization name and description
3. Click "Create"
4. Verify organization appears in sidebar
5. Verify you are the owner (check Settings → Members)

---

### US-006: Switch Organization

**As a** user who belongs to multiple organizations
**I want to** switch between organizations
**So that** I can work on projects from different organizations

**Acceptance Criteria:**

- User can see all organizations they belong to
- User can select different organization
- Context switches to selected organization
- Projects and tasks filter to selected organization

**How to Test:**

1. Create or join a second organization
2. Navigate to `/select-organization`
3. Click on a different organization card
4. Verify sidebar shows new organization
5. Verify tasks and projects are filtered to new organization

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

**How to Test:**

1. As org admin, invite an existing user by email
2. As the invited user, check for invitation notification
3. Accept the invitation
4. Verify organization appears in organization list
5. Verify assigned role is correct

---

### US-008: Invite Organization Member

**As an** organization owner or admin
**I want to** invite users to join my organization
**So that** I can collaborate with team members

**Acceptance Criteria:**

- User can invite by email address (existing users only)
- User can assign role (owner, admin, member)
- Invitation status is tracked (invited, active, suspended)

**How to Test:**

1. Navigate to Settings → Members
2. Click "Invite Member"
3. Enter email of existing user and select role
4. Click "Send Invitation"
5. Verify invitation appears in pending list

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

**How to Test:**

1. Navigate to Settings → Members
2. View member list with roles and status
3. Change a member's role using dropdown
4. Remove a member and verify they no longer appear
5. Verify removed member loses access to organization

---

## 3. Invitations & Onboarding

### US-082: Create Organization Invite

**As an** organization owner or admin
**I want to** create an invite link
**So that** I can invite new members to join my organization

**Acceptance Criteria:**

- User can generate invite link
- User can set role for invitees (admin/member)
- User can set maximum uses for link
- Invite link is shareable with 7-day expiration

**How to Test:**

1. Navigate to Settings → Members
2. Click "Create Invite Link"
3. Select role and max uses
4. Copy the generated link
5. Verify link appears in invites list with correct settings

---

### US-083: View Organization Invites

**As an** organization owner or admin
**I want to** view all organization invites
**So that** I can track invitation status

**Acceptance Criteria:**

- User can see list of all invites
- User can see invite role, usage count, expiration date
- User can see if invite is revoked
- List is paginated

**How to Test:**

1. Navigate to Settings → Members → Invites tab
2. Create several invite links
3. Verify all invites are listed with correct details
4. Share a link and have someone use it
5. Verify usage count increments

---

### US-084: Revoke Invite

**As an** organization owner or admin
**I want to** revoke an invite link
**So that** I can prevent further use of the link

**Acceptance Criteria:**

- User can revoke invite with confirmation
- Revoked invites are marked and cannot be used
- Revocation is immediate

**How to Test:**

1. Create an invite link
2. Click revoke button on the invite
3. Confirm the action
4. Verify invite shows as revoked
5. Try using the revoked link - verify it fails

---

### US-085: Accept Invite

**As a** new user
**I want to** accept an organization invitation
**So that** I can join the organization

**Acceptance Criteria:**

- User can view invite details (organization name, role)
- User can register with invite link
- User is automatically added to organization with assigned role
- User is logged in after registration

**How to Test:**

1. Open invite link in incognito browser
2. Verify organization name and role are displayed
3. Enter email and password to register
4. Verify automatic login and redirect to dashboard
5. Verify organization membership with correct role

---

### US-086: Register with Organization

**As a** new user
**I want to** register and create an organization at the same time
**So that** I can get started quickly

**Acceptance Criteria:**

- User can provide email, password, and organization name
- User account and organization are created together
- User becomes organization owner
- User is logged in after registration

**How to Test:**

1. Navigate to `/register`
2. Enter email, password, and organization name
3. Click "Register"
4. Verify both account and organization are created
5. Verify you are the organization owner

---

### US-087: Complete Onboarding

**As a** new user
**I want to** complete onboarding
**So that** I can set up my workspace

**Acceptance Criteria:**

- User can upload organization logo (optional)
- User can add organization description (optional)
- User can generate invite link for members (optional)
- User is redirected to dashboard after completion

**How to Test:**

1. After registration, verify onboarding screen appears
2. Upload a logo image
3. Add a description
4. Add team member emails (optional)
5. Click "Complete" and verify redirect to dashboard
6. Verify logo and description are saved

---

### US-088: Skip Onboarding

**As an** invited user
**I want to** skip onboarding
**So that** I can start working immediately

**Acceptance Criteria:**

- Invited users automatically skip onboarding
- User goes directly to dashboard
- User can access all features immediately

**How to Test:**

1. Accept an organization invite as new user
2. Verify you go directly to dashboard (no onboarding)
3. Verify all features are accessible

---

## 4. Dashboard & Navigation

### US-054: View Dashboard

**As a** user
**I want to** view the dashboard
**So that** I can see an overview of my tasks, projects, and activity

**Acceptance Criteria:**

- User can see task statistics (total, completed, in-progress, pending)
- User can see project overview with progress
- User can see recent notifications
- Dashboard shows data for current organization

**How to Test:**

1. Navigate to `/dashboard` or click logo
2. Verify task stats match actual task counts
3. Verify project progress bars are accurate
4. Verify recent notifications are shown
5. Switch organization and verify data updates

---

### US-055: Global Search

**As a** user
**I want to** search for tasks and projects
**So that** I can quickly find what I'm looking for

**Acceptance Criteria:**

- User can search via header search bar or Cmd/Ctrl+K
- Search finds tasks and projects by name/ID
- Results show relevant information (display ID, status)
- User can click result to navigate

**How to Test:**

1. Press Cmd/Ctrl+K to open search
2. Type a task title (min 2 characters)
3. Verify matching tasks appear with display IDs
4. Click a result and verify navigation
5. Search for a project code and verify it appears

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

**How to Test:**

1. Click each sidebar menu item and verify navigation
2. Use breadcrumbs to navigate back
3. Use browser back button and verify it works
4. Click logo from any page and verify return to dashboard

---

## 5. Project Setup

### US-010: Create Project

**As an** admin or supervisor
**I want to** create a new project
**So that** I can organize tasks and collaborate with my team

**Acceptance Criteria:**

- User can create project with name, code, and description
- Project code is 3-letter uppercase (auto-generated if omitted via API)
- Project is associated with current organization
- Default statuses are created automatically

**How to Test:**

1. Navigate to `/projects/new`
2. Enter project name, code (e.g., "ABC"), and description
3. Click "Create"
4. Verify project appears in projects list
5. Verify default statuses exist (todo, in_progress, review, etc.)

---

### US-011: View Project Details

**As a** project member
**I want to** view project details
**So that** I can understand project context and access related information

**Acceptance Criteria:**

- User can see project name, code, description
- User can see project statistics (tasks, completion, time spent)
- User can see project members
- User can navigate to project tasks

**How to Test:**

1. Click a project card to open details
2. Verify name, code, and description are displayed
3. Check task statistics match actual counts
4. View project members list
5. Click "Tasks" to navigate to filtered task list

---

### US-012: Edit Project

**As an** admin or project supervisor
**I want to** edit project information
**So that** I can keep project details up to date

**Acceptance Criteria:**

- User can update name, code, description
- User can upload/delete project files
- Changes are saved and reflected immediately

**How to Test:**

1. Open project details and click "Edit"
2. Change the project name and description
3. Upload a file attachment
4. Save changes
5. Verify changes are persisted after page refresh

---

### US-013: Delete Project

**As an** admin or project supervisor
**I want to** delete a project
**So that** I can remove obsolete projects

**Acceptance Criteria:**

- User can delete project with confirmation dialog
- All related tasks and data are handled appropriately
- Project is removed from list after deletion

**How to Test:**

1. Open project details
2. Click "Delete" button
3. Confirm deletion in dialog
4. Verify project no longer appears in list
5. Verify related tasks are also removed

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

**How to Test:**

1. Open project details → Members tab
2. Click "Add Member"
3. Select an organization member and assign role
4. Click "Add"
5. Verify member appears in list with correct role
6. Verify member received notification

---

### US-015: Manage Project Members

**As a** project owner or admin
**I want to** manage project member roles and permissions
**So that** I can control who can perform what actions

**Acceptance Criteria:**

- User can view all project members
- User can update member roles
- User can remove members from project
- Changes reflect immediately

**How to Test:**

1. Open project details → Members tab
2. Change a member's role using dropdown
3. Verify role change is saved
4. Remove a member from project
5. Verify member no longer has project access

---

## 6. Task Management

### US-016: Create Task

**As a** user
**I want to** create a new task
**So that** I can track work items and assign them to team members

**Acceptance Criteria:**

- User can create task with title, description, project
- User can assign task to team member
- User can set priority, status, due date, tags
- Task display ID is auto-generated (PROJECT-001 format)

**How to Test:**

1. Click "New Task" button in header
2. Fill in title, description, select project
3. Assign to a team member
4. Set priority, status, due date
5. Add tags
6. Click "Create"
7. Verify task appears with auto-generated display ID

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

**How to Test:**

1. Navigate to `/tasks`
2. Verify tasks are grouped by status
3. Click column headers to sort
4. Collapse/expand a status section
5. Login as employee and verify only assigned tasks visible

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

**How to Test:**

1. Navigate to `/tasks/board`
2. Verify tasks are in correct status columns
3. Drag a task to a different column
4. Verify status changed in task details
5. Drag to reorder within a column

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

**How to Test:**

1. Click a task to open details page
2. Verify all task fields are displayed
3. Check comments tab for comments
4. Check subtasks section
5. Check time entries tab
6. Toggle activity feed visibility

---

### US-020: Edit Task

**As a** task creator or assignee
**I want to** edit task details
**So that** I can update information as requirements change

**Acceptance Criteria:**

- User can update task fields (title, description, status, priority, etc.)
- User can change assignee
- User can add/remove tags
- Changes are saved immediately
- Activity is logged in audit trail

**How to Test:**

1. Open task details and click "Edit"
2. Change title, status, priority
3. Change assignee
4. Add/remove tags
5. Save and verify changes persist
6. Check activity stream for change log

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

**How to Test:**

1. Open task details
2. Click "Delete" button
3. Confirm deletion
4. Quickly click "Undo" in toast notification
5. Verify task is restored
6. Delete again and let timeout expire
7. Verify task is gone from list

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

**How to Test:**

1. Open task list
2. Apply filters (status, priority, assignee)
3. Verify filtered results
4. Navigate away and back - verify filters persist
5. Click "Clear Filters"
6. Verify all tasks are shown again

---

## 7. Task Collaboration

### US-023: Add Comment to Task

**As a** user
**I want to** add comments to tasks
**So that** I can communicate with team members about task progress

**Acceptance Criteria:**

- User can add comment with text
- User can attach files to comments (max 5 files, 5MB each)
- User can mention other users with @mention
- Comment appears in task comments list
- Mentioned users receive notifications

**How to Test:**

1. Open task details → Comments tab
2. Type a comment with @mention
3. Attach a file
4. Click "Post"
5. Verify comment appears
6. Verify mentioned user receives notification

---

### US-024: Reply to Comment

**As a** user
**I want to** reply to existing comments
**So that** I can have threaded conversations about tasks

**Acceptance Criteria:**

- User can reply to any comment
- Reply is linked to parent comment (threaded view)
- User can see comment thread structure
- All participants receive notifications

**How to Test:**

1. Open task with existing comments
2. Click "Reply" on a comment
3. Type reply and post
4. Verify reply appears nested under parent
5. Verify thread can be collapsed/expanded

---

### US-025: Edit/Delete Comment

**As a** comment author
**I want to** edit or delete my comments
**So that** I can correct mistakes or remove outdated information

**Acceptance Criteria:**

- User can edit own comments
- User can delete own comments (soft delete)
- Edited comments show "edited" indicator
- Deleted comments are marked as deleted

**How to Test:**

1. Post a comment on a task
2. Click edit icon on your comment
3. Modify text and save
4. Verify "edited" indicator appears
5. Click delete icon
6. Verify comment shows as deleted

---

### US-089: React to Comment

**As a** user
**I want to** add emoji reactions to comments
**So that** I can quickly express feedback without writing a full reply

**Acceptance Criteria:**

- User can add reactions to any comment (👍, 👎, ❤️, 🎉, 😄, 🤔)
- User can remove their own reactions
- Reactions show count and who reacted (tooltip)
- Active reactions are visually highlighted
- Reactions are disabled on deleted comments

**How to Test:**

1. Open task with comments
2. Click reaction button on a comment
3. Select an emoji reaction
4. Verify reaction appears with count
5. Hover to see who reacted
6. Click again to remove reaction
7. Verify deleted comments have no reaction buttons

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
- User can reorder subtasks via drag-and-drop

**How to Test:**

1. Open task details → Subtasks section
2. Click "Add Subtask"
3. Enter title and optionally assign to member
4. Click "Add"
5. Verify subtask appears in checklist
6. Drag to reorder subtasks

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

**How to Test:**

1. Open task with subtasks
2. Click checkbox to mark subtask done
3. Verify visual indication of completion
4. Click again to reopen
5. Delete a subtask and verify removal

---

### US-028: Log Time Entry

**As a** user
**I want to** log time spent on a task
**So that** I can track my work hours and project time

**Acceptance Criteria:**

- User can log time with hours and minutes
- User can add optional note
- Time entry is added to task
- Task time aggregates update automatically

**Implementation Note:** Time entry date selection isn't available; entries use record timestamp.

**How to Test:**

1. Open task details → Time Entries tab
2. Click "Log Time"
3. Enter hours/minutes and optional note
4. Click "Save"
5. Verify entry appears in list
6. Verify task total time updates

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

**How to Test:**

1. Open task with time entries
2. Verify entries are listed with user, duration, notes
3. Verify total time matches sum of entries
4. Check entries are grouped by date

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

**How to Test:**

1. Open task with your time entry
2. Click edit on the entry
3. Modify duration and save
4. Verify changes are saved
5. Delete an entry
6. Verify total time recalculates

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

**How to Test:**

1. Open task details (as assignee or admin)
2. Click edit icon next to time display
3. Enter new hours/minutes
4. Save changes
5. Verify time updates
6. As regular user on unassigned task, verify edit not available

---

## 8. Tags Management

### US-032: Create Tag

**As a** user
**I want to** create tags
**So that** I can categorize and organize tasks

**Acceptance Criteria:**

- User can create tag with name and color
- Tag is associated with organization
- Tag appears in tag selector
- User can use tag immediately after creation

**How to Test:**

1. Navigate to `/tags`
2. Click "New Tag"
3. Enter name and select color
4. Click "Create"
5. Verify tag appears in list
6. Create a task and verify new tag is available

---

### US-033: Edit Tag

**As a** tag creator
**I want to** edit tag name and color
**So that** I can update tag information

**Acceptance Criteria:**

- User can update tag name and color
- Changes reflect in all tasks using the tag
- Tag remains associated with same organization

**How to Test:**

1. Apply a tag to several tasks
2. Edit the tag (change name/color)
3. Verify changes appear on all tagged tasks

---

### US-034: Delete Tag

**As a** tag creator
**I want to** delete tags
**So that** I can remove obsolete tags

**Acceptance Criteria:**

- User can delete tag with confirmation
- Tag is removed from all tasks
- Deletion cannot be undone

**How to Test:**

1. Create a tag and apply to tasks
2. Delete the tag
3. Confirm deletion in dialog
4. Verify tag is removed from tasks
5. Verify tag no longer appears in selectors

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

**How to Test:**

1. Apply different tags to various tasks
2. Open task list and filter by a tag
3. Verify only matching tasks shown
4. Select multiple tags
5. Verify filter persists after navigation

---

## 9. Notifications

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

**How to Test:**

1. Navigate to `/notifications`
2. Verify notifications are listed
3. Filter by "Unread" only
4. Sort by "Oldest"
5. Check unread badge count in header

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

**How to Test:**

1. Open notifications with unread items
2. Click on a notification (marks as read)
3. Verify visual change (read styling)
4. Click "Mark All as Read"
5. Verify all are marked and badge updates

---

### US-038: Delete Notifications

**As a** user
**I want to** delete notifications
**So that** I can clean up my notification list

**Acceptance Criteria:**

- User can delete individual notification (with 5-second undo)
- User can delete all notifications
- User can delete only read notifications

**How to Test:**

1. Delete a single notification
2. Click "Undo" in toast - verify restored
3. Delete again and let timeout pass
4. Use "Clear Read" to delete read notifications
5. Use "Clear All" to delete everything

---

### US-039: Navigate from Notification

**As a** user
**I want to** navigate to the task or comment from a notification
**So that** I can quickly access relevant information

**Acceptance Criteria:**

- User can click notification to navigate
- User is taken to relevant task/comment
- Notification is marked as read when clicked

**How to Test:**

1. Receive a task assignment notification
2. Click the notification
3. Verify navigation to task details
4. Verify notification marked as read

---

## 10. User Management

### US-040: Create User

**As an** admin or manager
**I want to** create new user accounts
**So that** I can add team members to the system

**Acceptance Criteria:**

- User can create account with username and password
- User can assign role (admin, supervisor, manager, employee)
- User appears in users list

**How to Test:**

1. Navigate to `/users` (as admin)
2. Click "Create User"
3. Enter username, password, and select role
4. Click "Create"
5. Verify user appears in list
6. Login as new user to verify account works

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

**How to Test:**

1. Navigate to `/users`
2. Verify user list is displayed
3. Search for a specific user
4. Filter by role
5. Check active/inactive indicators

---

### US-042: Edit User

**As an** admin or the user themselves
**I want to** edit user information
**So that** I can update user details and roles

**Acceptance Criteria:**

- Admin can edit any user
- User can edit own profile
- User can update role and other fields
- Changes are saved immediately

**How to Test:**

1. As admin, edit another user
2. Change their role
3. Save and verify changes persist
4. As regular user, edit own profile
5. Verify role change not available for self

---

### US-043: Toggle User Active Status

**As an** admin
**I want to** activate or deactivate users
**So that** I can control who has access to the system

**Acceptance Criteria:**

- Admin can toggle user active status
- Inactive users cannot log in
- Admin cannot deactivate themselves or other admins
- Status change is logged

**How to Test:**

1. As admin, find a non-admin user
2. Click toggle to deactivate
3. Verify status changes
4. Try to login as deactivated user - verify failure
5. Re-activate and verify login works

---

### US-044: Unblock User

**As an** admin
**I want to** unblock users who were blocked after failed login attempts
**So that** they can regain access to their account

**Acceptance Criteria:**

- Admin can unblock user
- Failed login attempts counter is reset
- User can log in immediately after unblocking

**How to Test:**

1. As regular user, fail login 5 times to get blocked
2. As admin, find user in list (shows blocked status)
3. Click "Unblock"
4. Verify user can now login

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

**How to Test:**

1. Click user's action menu → "Login Logs"
2. Verify log entries with timestamps
3. Check IP and browser info
4. Verify failed attempts are recorded
5. Test pagination with many entries

---

## 11. Organization & Project Administration

### US-046: View Project Tasks

**As a** project member
**I want to** view all tasks for a project
**So that** I can see project progress and task list

**Acceptance Criteria:**

- User can see all tasks in project
- Tasks are filtered by project
- User can create tasks for project
- User can switch to board view

**How to Test:**

1. Open project details
2. Click "Tasks" button
3. Verify only project tasks are shown
4. Create new task - verify it's in project
5. Switch to board view

---

### US-047: Manage Organization Settings

**As an** organization owner or admin
**I want to** manage organization settings
**So that** I can configure organization preferences

**Acceptance Criteria:**

- User can access organization settings
- User can update organization details (name, logo, description)
- User can manage organization members
- Changes affect all organization projects

**How to Test:**

1. Navigate to Settings → Organization
2. Update organization name
3. Upload new logo
4. Save changes
5. Verify changes appear across application

---

## 12. Settings & Preferences

### US-048: Update Profile

**As a** user
**I want to** update my profile information
**So that** my team members can see my current details

**Acceptance Criteria:**

- User can update name, email, and other profile fields
- Changes are saved immediately
- User can see updated information in profile

**How to Test:**

1. Navigate to Settings → Profile
2. Update name and email
3. Upload avatar
4. Save changes
5. Verify changes appear in user menu and comments

---

### US-049: Change Password

**As a** user
**I want to** change my password
**So that** I can maintain account security

**Acceptance Criteria:**

- User can enter current password
- User can set new password (min 8 characters)
- User must confirm new password
- Password is updated after confirmation

**How to Test:**

1. Navigate to Settings → Security
2. Enter current password
3. Enter new password and confirm
4. Click "Change Password"
5. Logout and login with new password

---

### US-050: Change Theme

**As a** user
**I want to** change the application theme
**So that** I can use the interface in my preferred color scheme

**Acceptance Criteria:**

- User can select Light, Dark, or System theme
- Theme changes immediately
- Preference is saved and persists across sessions

**How to Test:**

1. Navigate to Settings → Appearance
2. Select "Dark" theme
3. Verify immediate change
4. Refresh page - verify theme persists
5. Select "System" and test OS theme change

---

### US-051: Configure Timezone

**As a** user
**I want to** set my timezone
**So that** dates and times are displayed in my local time

**Acceptance Criteria:**

- User can select timezone from dropdown
- Preference is saved

**Implementation Note:** Preference is saved but not all date displays are wired to it yet.

**How to Test:**

1. Navigate to Settings → Preferences
2. Select a different timezone
3. Save changes
4. Verify preference is saved (check in subsequent visits)

---

### US-052: Configure Date Format

**As a** user
**I want to** choose my preferred date format
**So that** dates are displayed in a familiar format

**Acceptance Criteria:**

- User can select date format (locale, yyyy/MM/dd, dd/MM/yyyy, MM/dd/yyyy)
- Preference is saved

**Implementation Note:** Preference is saved but not all date displays are wired to it yet.

**How to Test:**

1. Navigate to Settings → Preferences
2. Select different date format
3. Save changes
4. Verify preference persists

---

### US-053: Toggle Activity Feed

**As a** user
**I want to** show or hide the activity feed in task details
**So that** I can customize my task view

**Acceptance Criteria:**

- User can toggle activity feed visibility
- Setting is saved in preferences
- Activity feed shows/hides based on preference

**How to Test:**

1. Navigate to Settings → Preferences
2. Toggle "Show Activity Feed" off
3. Open a task details page
4. Verify activity stream is hidden
5. Toggle back on and verify it appears

---

## 13. Reports & Audit

### US-057: View Audit Logs

**As an** admin
**I want to** view audit logs
**So that** I can track all changes and actions in the system

**Acceptance Criteria:**

- User can see all audit log entries
- Logs show actor, action, resource, timestamp
- User can filter by resource, action, client, and free-text search
- User can view field-level changes
- Logs are paginated

**How to Test:**

1. Navigate to `/audit-logs` (as admin)
2. View log entries
3. Filter by action type (create, update, delete)
4. Filter by resource type (tasks, projects)
5. Click entry to see field-level changes

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

**How to Test:**

1. Open task details → Activity tab
2. Make several changes to the task
3. Verify each change is logged
4. Click to expand and see field-level diffs

---

### US-059: Generate Reports

**As an** admin or supervisor
**I want to** generate reports
**So that** I can analyze productivity and project progress

**Acceptance Criteria:**

- User can filter reports by date range, project, assignee, status, priority
- Reports show comprehensive metrics (task counts, completion rates)
- Reports include charts: timeliness, priority distribution, productivity trends, workload, overtime, employee comparison
- Reports can be exported to Excel
- Reports include drilldown capability (click metrics to see details)
- Reports show leaderboard (top performers)

**How to Test:**

1. Navigate to `/reports` (as admin)
2. Set date range filter
3. Filter by specific project
4. View various charts and metrics
5. Click a metric to see drilldown
6. Export to Excel and verify download

---

### US-090: View Employee Leaderboard

**As an** admin or supervisor
**I want to** view an employee leaderboard
**So that** I can identify top performers and team productivity

**Acceptance Criteria:**

- User can see ranking of employees by task completion
- Leaderboard shows completion counts and rates
- User can filter by time range and project
- Rankings update in real-time with report filters

**How to Test:**

1. Navigate to Reports page
2. Locate the leaderboard component
3. Apply different date range filters
4. Verify rankings update accordingly
5. Filter by project and verify leaderboard reflects it

---

### US-091: Export Reports to Excel

**As an** admin or supervisor
**I want to** export reports to Excel
**So that** I can share analytics data or perform additional analysis

**Acceptance Criteria:**

- User can export current report view to Excel (.xlsx)
- Export includes all filtered data
- Export preserves date/project/assignee context
- Download starts automatically

**How to Test:**

1. Open Reports page
2. Apply some filters
3. Click "Export to Excel"
4. Verify .xlsx file downloads
5. Open file and verify data matches report

---

## 14. Bulk Operations

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

**How to Test:**

1. Open task list
2. Click "Selection Mode" toggle
3. Check several task checkboxes
4. Verify selection count updates
5. Click "Clear Selection"

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

**How to Test:**

1. Enable selection mode
2. Select 3+ tasks
3. Click "Assign" in bulk actions bar
4. Select a user
5. Verify all tasks now assigned to that user

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

**How to Test:**

1. Enable selection mode
2. Select tasks with different statuses
3. Click "Status" in bulk actions bar
4. Select new status
5. Verify all tasks updated

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

**How to Test:**

1. Enable selection mode
2. Select several tasks
3. Click "Priority" in bulk actions bar
4. Select new priority (e.g., "High")
5. Verify all tasks updated

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

**Implementation Note:** Undo for bulk delete isn't implemented.

**How to Test:**

1. Enable selection mode
2. Select multiple tasks
3. Click "Delete" in bulk actions bar
4. Confirm deletion in dialog
5. Verify all selected tasks are removed

---

## 15. File Management

### US-065: Upload Files

**As a** user
**I want to** upload files to tasks, projects, or comments
**So that** I can share documents and assets with my team

**Acceptance Criteria:**

- User can upload files via file picker
- Multiple file types are supported
- File size limits are enforced (5MB for comments, larger for projects)
- Files are attached to projects (assets), comments (attachments), org logo, and user avatar

**Implementation Note:** Task-level attachments aren't implemented; use comment attachments instead.

**How to Test:**

1. Add a comment with file attachment
2. Upload project asset in project edit
3. Upload avatar in profile settings
4. Try uploading oversized file - verify error

---

### US-066: Delete Files

**As a** user
**I want to** delete uploaded files
**So that** I can remove outdated or incorrect files

**Acceptance Criteria:**

- User can delete project assets they uploaded (via project edit)
- Deletion requires confirmation

**Implementation Note:** Deleting comment attachments after posting isn't implemented.

**How to Test:**

1. Open project edit with assets
2. Click delete on an asset
3. Confirm deletion
4. Verify asset is removed

---

### US-067: Preview Files

**As a** user
**I want to** preview uploaded files
**So that** I can view files without downloading them

**Acceptance Criteria:**

- User can click file to preview
- Preview opens in modal or new tab
- Supported file types show preview (images, PDFs)
- User can download file from preview

**How to Test:**

1. Open task with comment attachments
2. Click an image attachment
3. Verify preview opens
4. Click download button
5. Test with PDF file

---

## 16. UI State Actions

### US-068: Toggle Sidebar

**As a** user
**I want to** collapse or expand the sidebar
**So that** I can maximize screen space when needed

**Acceptance Criteria:**

- User can toggle sidebar visibility
- Sidebar state is saved
- Navigation remains accessible when collapsed
- Toggle is smooth and responsive

**How to Test:**

1. Click sidebar toggle button
2. Verify sidebar collapses
3. Refresh page - verify state persists
4. Click again to expand

---

### US-069: Undo Actions

**As a** user
**I want to** undo actions
**So that** I can recover from mistakes

**Acceptance Criteria:**

- User sees undo option in toast notifications
- User can undo within 5 seconds
- Action is reversed when undone
- Undo is available for delete operations (tasks, notifications)

**How to Test:**

1. Delete a task
2. Quickly click "Undo" in toast
3. Verify task is restored
4. Delete notification with undo
5. Test undo timeout (wait 5+ seconds)

---

### US-070: Dismiss Notifications

**As a** user
**I want to** dismiss toast notifications
**So that** they don't clutter my screen

**Acceptance Criteria:**

- User can close toast notifications manually
- Notifications auto-dismiss after timeout
- Dismissed notifications don't reappear

**How to Test:**

1. Trigger a toast notification (e.g., save something)
2. Click X to dismiss
3. Verify immediate dismissal
4. Trigger another and let it auto-dismiss

---

## 17. Calendar & Scheduling

### US-071: View Task Calendar

**As a** user
**I want to** view my tasks in a calendar format
**So that** I can see deadlines and plan my schedule

**Acceptance Criteria:**

- User can see calendar view with monthly layout (Jalali/Persian calendar)
- Tasks with deadlines appear on their due dates
- User can navigate between months
- User can jump to current month
- User can see task count for each day
- Completed tasks are visually distinguished

**How to Test:**

1. Navigate to `/calendar`
2. Create tasks with due dates
3. Verify tasks appear on correct dates
4. Navigate to different months
5. Click "Today" to return to current month

---

### US-072: Navigate Calendar

**As a** user
**I want to** navigate through the calendar
**So that** I can view tasks for different time periods

**Acceptance Criteria:**

- User can go to previous/next month
- User can jump to today
- Current day is highlighted
- Days outside current month are dimmed

**How to Test:**

1. Open calendar view
2. Click previous month arrow
3. Click next month arrow
4. Click "Today" button
5. Verify current day is highlighted

---

### US-073: View Monthly Task Statistics

**As a** user
**I want to** see monthly task statistics
**So that** I can track my productivity

**Acceptance Criteria:**

- User can see total tasks for the month
- User can see completed tasks count
- User can see pending tasks count
- Statistics update in real-time

**How to Test:**

1. Open calendar view
2. Check statistics in header (total, completed, pending)
3. Complete a task with deadline in this month
4. Verify statistics update

---

## 18. Time Tracking & Timesheets

### US-074: View Timesheet

**As a** user
**I want to** view my timesheet
**So that** I can see how much time I've spent on tasks

**Acceptance Criteria:**

- User can see weekly timesheet view
- Each day shows tasks worked on
- User can see time spent per task
- User can see daily totals and weekly total

**How to Test:**

1. Navigate to `/timesheet`
2. Log time on several tasks
3. Verify weekly grid shows entries
4. Check daily totals
5. Check weekly total

---

### US-075: Export Timesheet

**As a** user
**I want to** export my timesheet
**So that** I can share or archive my time records

**Acceptance Criteria:**

- User can export timesheet as CSV
- CSV includes date, task title, project, and minutes
- File name includes date range
- Download starts automatically

**How to Test:**

1. Open timesheet with entries
2. Click "Export CSV"
3. Verify file downloads
4. Open CSV and verify data accuracy

---

### US-076: View Daily Time Breakdown

**As a** user
**I want to** see detailed breakdown of time spent each day
**So that** I can understand my daily productivity

**Acceptance Criteria:**

- User can see tasks for each day of the week
- Each task shows project name and time spent
- Daily totals are calculated
- Empty days show placeholder
- User can click task to view details

**How to Test:**

1. Open timesheet
2. View daily columns with task breakdowns
3. Click on a task entry
4. Verify navigation to task details

---

## 19. Help & Documentation

### US-077: Browse Help Articles

**As a** user
**I want to** browse help articles
**So that** I can learn how to use the application

**Acceptance Criteria:**

- User can see help categories
- User can browse articles by category
- Articles are organized logically
- Help is accessible from navigation

**How to Test:**

1. Navigate to `/help`
2. Browse available categories
3. Click a category to see articles
4. Click an article to read content

---

### US-078: Search Help

**As a** user
**I want to** search for help articles
**So that** I can quickly find answers to my questions

**Implementation Note:** Help search isn't implemented yet.

**How to Test:**

- N/A - Feature not implemented

---

## 20. Saved Filters

### US-079: Save Filter

**As a** user
**I want to** save my current filter configuration
**So that** I can quickly apply it later

**Acceptance Criteria:**

- User can save current filter settings
- User can name the saved filter
- Saved filter appears in dropdown
- Saved filter is stored in browser localStorage
- Multiple filters can be saved

**How to Test:**

1. Apply filters to task list
2. Click "Save Filter"
3. Enter a name
4. Verify filter appears in dropdown
5. Clear filters and apply saved filter

---

### US-080: Apply Saved Filter

**As a** user
**I want to** apply a saved filter
**So that** I can quickly view filtered data

**Acceptance Criteria:**

- User can see list of saved filters
- User can select filter to apply
- Filter settings are applied immediately
- Active filter is indicated
- Saved filters are available on this device/browser only

**How to Test:**

1. Save a filter with multiple criteria
2. Clear filters
3. Click saved filter in dropdown
4. Verify all criteria are applied
5. Check active filter indicator

---

### US-081: Manage Saved Filters

**As a** user
**I want to** manage my saved filters
**So that** I can keep them organized and up to date

**Acceptance Criteria:**

- User can edit saved filter name
- User can delete saved filters
- User can set default filter
- Changes are saved immediately to localStorage

**How to Test:**

1. Click "Manage Filters"
2. Rename a filter
3. Delete a filter
4. Set one as default
5. Refresh and verify default is auto-applied

---

## Implementation Notes

The following features have known limitations:

| Story          | Limitation                                                              |
| -------------- | ----------------------------------------------------------------------- |
| US-003         | Self-service password reset via email is not implemented                |
| US-028         | Time entry date selection isn't available; entries use record timestamp |
| US-051, US-052 | Preferences are saved but not all date displays are wired to them yet   |
| US-064         | Undo for bulk task deletion isn't implemented                           |
| US-065         | Task-level attachments not implemented; use comment attachments         |
| US-066         | Deleting comment attachments after posting isn't implemented            |
| US-078         | Help article search isn't implemented yet                               |

---

_Last updated: 2025-12-29_
