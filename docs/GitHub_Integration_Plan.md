# GitHub Integration Plan

This document outlines the plan for integrating GitHub into the Anjam (انجام) Application. The goal is to enhance developer workflow by linking tasks to GitHub issues, synchronizing statuses, and streamlining project management.

**Current Architecture Context**: The application uses an organization-based multi-tenant architecture where:

- `organizations` serve as tenant boundaries
- `organization_members` defines user roles at the organization level (owner, admin, member)
- `projects` belong to organizations and have `project_members` for project-level roles
- All access control is enforced through organization and project membership checks

## 1. Objectives

- **Dual Identity**: Keep existing email/password auth while adding GitHub SSO. GitHub-linked accounts are preferred, but local logins remain supported. First GitHub login provisions a new user if no matching email exists; otherwise the signed-in PocketBase user must explicitly link via "Connect GitHub" to prevent duplicates.
- **Project Linking**: Associate PocketBase projects (within organizations) with GitHub repositories plus installation IDs from a GitHub App installation. Projects are organization-scoped, so GitHub integration must respect organization membership permissions.
- **Task Synchronization**:
  - Manual "Import Issues" that runs with the GitHub App installation token.
  - Real-time webhook syncing (issues opened/closed/reopened) with idempotent upsert rules.
  - Bi-directional comments and PR automation reserved for a later phase.
- **Automation**: Allow tasks to reflect PR references ("Fixes #123") once phase 4 is implemented.

## 2. Technical Architecture

### 2.1 Backend Changes (Go/PocketBase)

#### Database Schema Updates

We need to extend the schema and add a secure way to store linkage metadata.

1.  **`integrations` Collection (New - Server-only)**:
    - Purpose: Store GitHub SSO linkage metadata; PocketBase never stores long-lived OAuth tokens.
    - `user` (relation): Link to `users` collection.
    - `provider` (text): always `github` for now.
    - `github_user_id` (text): Stable GitHub user identifier.
    - `installation_id` (number): GitHub App installation ID granted by the user/org.
    - `github_username` (text) and `github_avatar_url` (url) for UI display.
    - **ACL Rules**: `null` (Admin/Server-side only) to prevent API exposure.

2.  **`projects` Collection** (already has `organization` relation):
    - `github_repo_owner` (text): Owner of the linked repository.
    - `github_repo_name` (text): Name of the linked repository.
    - `github_repo_id` (text): Unique GitHub Repository ID (stable identifier).
    - `github_installation_id` (number): Installation token used for automation.
    - **Note**: Projects are organization-scoped. GitHub integration must verify the user has access to the project's organization via `organization_members` or `project_members`.

3.  **`tasks` Collection**:
    - `github_issue_id` (text): Unique GitHub Issue ID.
    - `github_issue_number` (number): The issue number (e.g., #42).
    - `github_html_url` (url): Link to the issue on GitHub.
    - `github_last_synced` (date): Timestamp of last sync.
    - `github_updated_at` (date): Last `updated_at` from GitHub for conflict detection.

#### API Endpoints & Hooks

1.  **OAuth Hook (`OnRecordAuthWithOAuth2Request`)**:
    - Handle GitHub SSO (first login creates user, subsequent logins attach metadata).
    - Validate GitHub primary email matches PocketBase user email to avoid duplicates.
    - Store `github_user_id`, `installation_id`, and profile metadata in `integrations`.
    - Never persist raw OAuth tokens; backend mints GitHub App JWTs on demand using the app private key stored in environment variables/secret manager.

2.  **`POST /api/v1/github/webhook`**:
    - **Security**: Verify `X-Hub-Signature-256` using `github.com/google/go-github/v68/github` utilities.
    - Events: `issues` (opened, closed, reopened, assigned), `pull_request` (optional future).
    - Route payloads by matching `repository.id` to `projects.github_repo_id` and confirm the GitHub installation ID matches `projects.github_installation_id`.
    - Verify the project's organization exists and is active before processing.
    - Upsert tasks idempotently by `github_issue_id`, comparing `github_updated_at` to avoid overwriting newer local edits.
3.  **`POST /api/v1/projects/:id/github/sync`**:
    - Manual trigger for users with project access; validates permissions via `GetPermissionContext()` (checks both `organization_members` and `project_members`).
    - Requires user to be an organization admin/owner OR a project member/admin/owner.
    - Uses the project's `github_installation_id` to mint a short-lived installation token via the GitHub App private key.
    - Initialize `github.Client` with that token and fetch open issues using `client.Issues.ListByRepo`.
    - Creates/Updates tasks with idempotent matching on `github_issue_id` and updates `github_updated_at`.
    - Tasks are created within the project's organization context.

### 2.2 Frontend Changes (React/Vite)

1.  **Project Settings** (Organization-scoped):
    - UI to input/select GitHub repository (Owner/Repo name).
    - Show GitHub App installation status; block sync button if app isn't installed on that repo.
    - "Sync Issues" button (triggers `POST /api/v1/projects/:id/github/sync`).
    - Only visible to users with organization admin/owner role OR project admin/owner role (use `usePermissions()` hook).
2.  **Task Detail View**:
    - Display GitHub Issue badge/link (e.g., `#123 Open`) if task has `github_issue_id`.
    - Show "Create Branch" button (copy branch name format like `feature/task-id-title`).
    - Link to GitHub issue if available.

3.  **User Profile**:
    - "Connect GitHub" button reuses the OAuth handler but enforces matching emails to avoid duplicate PocketBase users.
    - Display linked GitHub username + avatar sourced from `integrations` metadata.
    - Note: GitHub integration is user-level, but project sync requires organization/project membership permissions.

## 3. Implementation Steps

### Phase 1: Foundation & Authentication

- [ ] Configure a GitHub App + OAuth provider in PocketBase (store app ID + private key via env/secrets).
- [ ] Create `integrations` collection (API Rule: null) with the fields above.
- [ ] Implement `OnRecordAuthWithOAuth2Request` hook in `backend/main.go` to provision PocketBase users, record GitHub IDs/installation IDs, and refuse mismatched emails.
- [ ] Add `github_repo_*` + `github_installation_id` fields to `projects` collection in `backend/pb_schema.json`.
  - **Note**: Projects already have `organization` relation. Ensure GitHub fields are added after the organization field.
- [ ] Add `github_issue_*` + `github_updated_at` fields to `tasks` collection in `backend/pb_schema.json`.
  - **Note**: Tasks already have `project` relation which provides organization context via `project.organization`.
- [ ] After schema changes run `bun run types:generate` and commit the updated `src/lib/pocketbase-types.ts`.
- [ ] Run `bun run check` to ensure backend/frontend compile with the refreshed types.

### Phase 2: Manual Synchronization

- [ ] Install/update `github.com/google/go-github/v68` and `golang.org/x/oauth2` in `backend/go.mod`.
- [ ] Add helper function in `backend/main.go` (or new `backend/github.go`) to mint GitHub App JWTs and exchange them for installation tokens using the project's `github_installation_id`.
- [ ] Create `sync` endpoint (`POST /api/v1/projects/:id/github/sync`) in `backend/main.go` that:
  - Validates user has access via `GetPermissionContext()` (organization admin/owner OR project member/admin/owner)
  - Verifies project exists and belongs to an active organization
  - Runs imports with installation tokens
- [ ] Implement UI in Project Settings (`src/pages/projects/[id]/settings.tsx` or similar) to configure Repo (Owner/Name) and surface installation status/errors.
- [ ] Implement "Import Issues" feature in frontend using TanStack Query hooks (see `src/hooks/projects.ts` for patterns), showing progress + conflicts (based on `github_updated_at`).

### Phase 3: Webhooks (Real-time)

- [ ] Define Webhook Secret in environment variables (`GITHUB_WEBHOOK_SECRET`).
- [ ] Implement `POST /api/v1/github/webhook` endpoint in `backend/main.go` with `github.ValidatePayload` verification and installation ID checks.
- [ ] Route events by matching `repository.id` + `installation.id` to a project; ignore mismatches.
- [ ] Verify project's organization exists and is active before processing events.
- [ ] Handle `issues.opened` -> Create Task (idempotent on `github_issue_id`) within the project's organization context.
- [ ] Handle `issues.closed` -> Move Task to Done status (using project's custom statuses if available) if local `github_updated_at` <= payload timestamp; otherwise log conflict.
- [ ] Handle `issues.reopened` -> Move Task to appropriate "in progress" or "todo" status following the same conflict guard.

### Phase 4: Advanced (Optional)

- [ ] PR Linking ("Fixes #123" automation) using pull_request events + cross references.
- [ ] Comment syncing (bi-directional) with explicit ownership rules to prevent loops.

## 4. Security Considerations

- **Credential Model**: No long-lived user tokens are stored. GitHub App private key is loaded from environment or secret manager, and installation tokens are minted in-memory per request. If the key must be persisted locally (dev), encrypt it at rest using PocketBase's `security.Encrypt` utilities.
- **Token Storage**: `integrations` only holds linkage metadata (user ID, installation ID). Access is server-only (API Rule: null) to avoid metadata leakage.
- **Permission Checks**: All GitHub sync operations must validate user permissions via `GetPermissionContext()` to ensure users can only sync projects they have access to through `organization_members` or `project_members`.
- **Organization Isolation**: Projects are organization-scoped. Webhook handlers must verify the project's organization is active and that operations respect tenant boundaries.
- **Webhook Verification**: Strictly enforce HMAC SHA-256 signature checks using `github.ValidatePayload`, compare constant time, and reject requests where `repository.id` or `installation.id` do not match a stored project.
- **Scope**: GitHub App requests the minimum scopes (`metadata:read`, `issues:write`, `pull_requests:read`). No code/scm scopes are granted, reducing blast radius.
- **Schema Discipline**: Every schema change must be followed by `bun run types:generate` and `bun run check` to keep backend, generated types, and frontend aligned.

## 5. Dependencies

- **GitHub Library**: `github.com/google/go-github/v68`
- **OAuth Library**: `golang.org/x/oauth2`
- Go Standard Lib: `crypto/hmac`, `crypto/sha256` (wrappers provided by go-github).
