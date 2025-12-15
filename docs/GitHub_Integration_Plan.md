# GitHub Integration Plan

This document outlines the plan for integrating GitHub into the Task Manager Application. The goal is to enhance developer workflow by linking tasks to GitHub issues, synchronizing statuses, and streamlining project management.

## 1. Objectives

- **Authentication**: Allow users to sign in via GitHub.
- **Project Linking**: Link identifying GitHub repositories to Projects.
- **Task Synchronization**:
  - Import GitHub Issues as Tasks (Manual Sync).
  - Sync status changes (closed issue -> done task) via Webhooks.
  - Bi-directional comment syncing (optional/future).
- **Automation**: Automatically update tasks based on Pull Requests.

## 2. Technical Architecture

### 2.1 Backend Changes (Go/PocketBase)

#### Database Schema Updates

We need to extend the schema and add a secure way to store tokens.

1.  **`integrations` Collection (New - Secure)**:

    - Purpose: Store sensitive tokens securely, not accessible via public API.
    - `user` (relation): Link to `users` collection.
    - `provider` (text): e.g., "github".
    - `access_token` (text): Encrypted GitHub Access Token (captured during login).
    - `token_type` (text): e.g., "Bearer".
    - `expiry` (date): Token expiration time.
    - **ACL Rules**: `null` (Admin/Server-side only) to prevent API exposure.

2.  **`projects` Collection**:

    - `github_repo_owner` (text): Owner of the linked repository.
    - `github_repo_name` (text): Name of the linked repository.
    - `github_repo_id` (text): Unique GitHub Repository ID (stable identifier).

3.  **`tasks` Collection**:
    - `github_issue_id` (text): Unique GitHub Issue ID.
    - `github_issue_number` (number): The issue number (e.g., #42).
    - `github_html_url` (url): Link to the issue on GitHub.
    - `github_last_synced` (date): Timestamp of last sync.

#### API Endpoints & Hooks

1.  **OAuth Hook (`OnRecordAuthWithOAuth2Request`)**:

    - Intercept GitHub login.
    - Extract `accessToken` from `meta`.
    - Upsert record in `integrations` collection.

2.  **`POST /api/tm/github/webhook`**:
    - **Security**: Verify `X-Hub-Signature-256` using `github.com/google/go-github/v68/github` library utilities.
    - Events: `issues` (opened, closed, reopened, assigned), `pull_request` (optional).
3.  **`POST /api/tm/projects/:id/github/sync`**:
    - Manual trigger.
    - Retreives user's token from `integrations`.
    - Initialize `github.Client` with OAuth2 token.
    - Fetch open issues using `client.Issues.ListByRepo`.
    - Creates/Updates tasks.

### 2.2 Frontend Changes (React/Vite)

1.  **Project Settings**:
    - UI to input/select GitHub repository (Owner/Repo name).
    - "Sync Issues" button (triggers backend endpoint).
2.  **Task Detail View**:

    - Display GitHub Issue badge/link (e.g., `#123 Open`).
    - Show "Create Branch" button (copy branch name format like `feature/task-id-title`).

3.  **User Profile**:
    - "Connect GitHub" button (initiates OAuth flow if not logged in via GitHub).

## 3. Implementation Steps

### Phase 1: Foundation & Authentication

- [ ] Configure GitHub OAuth2 provider in PocketBase settings.
- [ ] Create `integrations` collection (API Rule: null).
- [ ] Implement `OnRecordAuthWithOAuth2Request` hook in `main.go` to store tokens.
- [ ] Add `github_repo_*` fields to `projects`.
- [ ] Add `github_issue_*` fields to `tasks`.

### Phase 2: Manual Synchronization

- [ ] Install `github.com/google/go-github/v68` and `golang.org/x/oauth2`.
- [ ] Implement Go function to init GitHub client from stored user token.
- [ ] Create `sync` endpoint (`/api/tm/projects/:id/github/sync`).
- [ ] Implement UI in Project Settings to configure Repo (Owner/Name).
- [ ] Implement "Import Issues" feature in frontend.

### Phase 3: Webhooks (Real-time)

- [ ] Define Webhook Secret in environment variables (`GITHUB_WEBHOOK_SECRET`).
- [ ] Implement `/webhook` endpoint with `github.ValidatePayload` verification.
- [ ] Handle `issue.opened` -> Create Task.
- [ ] Handle `issue.closed` -> Move Task to Done.
- [ ] Handle `issue.reopened` -> Move Task to Todo.

### Phase 4: Advanced (Optional)

- [ ] PR Linking ("Fixes #123" automation).
- [ ] Comment syncing.

## 4. Security Considerations

- **Token Security**: Store tokens in server-side only collection (`integrations`).
- **Webhook Verification**: Strictly enforce HMAC SHA-256 signature checks using library functions.
- **Scope**: Request minimum necessary scopes (`repo` or `public_repo`).

## 5. Dependencies

- **GitHub Library**: `github.com/google/go-github/v68`
- **OAuth Library**: `golang.org/x/oauth2`
- Go Standard Lib: `crypto/hmac`, `crypto/sha256` (wrappers provided by go-github).
