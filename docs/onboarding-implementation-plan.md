# User Onboarding Implementation Plan

## Overview

Implement two user registration flows:

1. **Direct Registration**: User registers with email/password AND creates an organization simultaneously
2. **Invite Link Registration**: User registers via shareable invite link with simplified form (email/password only)

## Requirements Summary

| Feature       | Direct Registration                 | Invite Registration                  |
| ------------- | ----------------------------------- | ------------------------------------ |
| Email         | Required                            | Required                             |
| Username      | Auto-generated from email           | Auto-generated from email            |
| Password      | Required                            | Required                             |
| Organization  | Created with user-provided name     | Pre-assigned from invite             |
| User Role     | `employee` (system) + `owner` (org) | `employee` (system) + `member` (org) |
| Post-Register | Welcome/setup screen                | Dashboard                            |
| Link Expiry   | N/A                                 | 7 days                               |
| Usage Limit   | N/A                                 | Configurable                         |

## Edge Cases & Decisions

| Scenario                         | Behavior                                             |
| -------------------------------- | ---------------------------------------------------- |
| Existing user clicks invite link | Show error: "Email already registered, please login" |
| Org name uniqueness              | Allow duplicates (slug will be unique)               |
| Organizations per user           | No limit                                             |
| Welcome notification (invite)    | Yes, send system notification                        |
| Invite link format               | Full URL with domain for easy sharing                |
| Invite management location       | Under Members settings tab                           |
| Onboarding completion            | Track flag so users see it only once                 |

---

## Implementation Steps

### Step 1: Database Schema

**File:** `backend/pb_schema.json`

**1a. Add `organization_invites` collection:**

- `token` (text, unique, 32 chars) - secure random token
- `organization` (relation) - target organization
- `role` (select: admin/member) - role to assign, default "member"
- `max_uses` (number) - configurable usage limit
- `uses_count` (number) - current usage count
- `expires_at` (date) - 7 days from creation
- `created_by` (relation) - user who created the invite
- `revoked` (bool) - soft delete for revocation

Access rules: Only org owners/admins can list/create/revoke invites.

**1b. Add `onboarding_completed` field to `organization_members` collection:**

- `onboarding_completed` (bool, default: false) - tracks if owner completed onboarding for this org

### Step 2: Backend Constants

**File:** `backend/backend_constants.go`

Add constants:

```go
const CollectionOrgInvites = "organization_invites"
const InviteTokenLength = 32
const InviteExpirationDays = 7
const InviteDefaultMaxUses = 50
```

Add Persian error messages for invites.

### Step 3: Backend Invite Endpoints

**New file:** `backend/invites.go`

Create API endpoints:

| Method | Path                                            | Auth        | Description                      |
| ------ | ----------------------------------------------- | ----------- | -------------------------------- |
| POST   | `/api/v1/organizations/{id}/invites`            | Owner/Admin | Create invite link               |
| GET    | `/api/v1/organizations/{id}/invites`            | Owner/Admin | List org invites                 |
| DELETE | `/api/v1/organizations/{id}/invites/{inviteId}` | Owner/Admin | Revoke invite                    |
| GET    | `/api/v1/invites/{token}`                       | Public      | Get invite info (org name, role) |
| POST   | `/api/v1/invites/{token}/accept`                | Public      | Register via invite              |
| POST   | `/api/v1/register-with-org`                     | Public      | Direct registration with org     |

Key logic:

- `handleRegisterWithOrg`: Creates user + organization + membership in a transaction
- `handleAcceptInvite`: Validates invite, creates user + membership, increments usage count
- `findValidInvite`: Checks token exists, not revoked, not expired, not exhausted

**File:** `backend/main.go`

Register invite endpoints in `main()`:

```go
registerInviteEndpoints(app)
```

### Step 4: Type Generation

Run `bun run types:generate` to regenerate `src/lib/pocketbase-types.ts` with new collection types.

### Step 5: Frontend Constants

**File:** `src/constants/auth.ts`

Add invite-related Persian strings:

- `invite.title`, `invite.joining`, `invite.joinButton`, `invite.welcomeMessage`
- `invite.errors.inviteNotFound`, `invite.errors.inviteExpired`, etc.
- `registerWithOrg.organizationName`, `registerWithOrg.organizationNamePlaceholder`

**File:** `src/constants/organization.ts`

Add invite management strings (for settings page):

- `invites.title`, `invites.create`, `invites.copy`, `invites.revoke`, etc.

### Step 6: Frontend Query Keys

**File:** `src/hooks/query-keys.ts`

Add:

```typescript
orgInvites: {
  all: ["organization_invites"],
  lists: () => ["organization_invites", "list"],
  list: (orgId: string | undefined) => ["organization_invites", "list", orgId],
  byToken: (token: string) => ["organization_invites", "token", token],
}
```

### Step 7: Frontend Hooks

**New file:** `src/hooks/organization-invites.ts`

Create hooks:

- `useOrganizationInvites()` - List invites for current org
- `useInviteByToken(token)` - Get invite info (public)
- `useCreateOrgInvite()` - Create invite link
- `useRevokeOrgInvite()` - Revoke invite
- `useAcceptInvite()` - Register via invite
- `useRegisterWithOrg()` - Direct registration with org

### Step 8: Update Registration Page

**File:** `src/pages/register.tsx`

Modifications:

1. Add `organizationName` state
2. Add organization name input field after password confirmation
3. Replace `pb.collection("users").create()` with `useRegisterWithOrg` mutation
4. Auto-login after successful registration and redirect to `/onboarding`

### Step 9: Create Welcome/Setup Screen

**New file:** `src/pages/onboarding.tsx`

Create onboarding page with skippable steps:

- **Step 1**: Upload organization logo (optional)
- **Step 2**: Add organization description (optional)
- **Step 3**: Invite team members by email (optional)
- **Skip button**: Always visible, sets `onboarding_completed=true` and redirects to `/dashboard`
- **Finish button**: After completing steps, sets `onboarding_completed=true` and redirects to `/dashboard`

Components needed:

- Logo upload with preview
- Rich text editor for description (reuse existing)
- Email input for inviting members (can add multiple)

**Redirect logic (in router or auth store):**

- After login, check if user's current org membership has `onboarding_completed=false` AND `role=owner`
- If true, redirect to `/onboarding`
- Otherwise, redirect to `/dashboard`

### Step 10: Create Invite Accept Page

**New file:** `src/pages/invite/[token].tsx`

Create page with:

- Fetch invite info via `useInviteByToken(token)`
- Show organization name and logo (read-only)
- Simplified form: email, password, confirm password only
- Submit via `useAcceptInvite` mutation
- Auto-login and redirect to `/dashboard` on success
- Send welcome notification to user
- Error states:
  - Invalid/not found token
  - Expired invite (7 days passed)
  - Exhausted invite (max uses reached)
  - Email already registered (show "already have account?" with login link)

### Step 11: Update Router

**File:** `src/router.tsx`

Add routes:

```typescript
{
  path: "/invite/:token",
  element: <InviteAccept />,
  // Public route (no auth required)
},
{
  path: "/onboarding",
  element: <Onboarding />,
  // Protected route (requires auth)
}
```

### Step 12: Add Invite Management to Members Settings

**File:** `src/pages/settings/members.tsx` (modify existing)

Add "Invite Links" section with:

- Table columns: Link (truncated), Role, Uses (X/max), Expiry date, Status, Actions
- "Create Invite Link" button opening dialog:
  - Role dropdown (admin/member, default: member)
  - Max uses input (default: 50)
- Copy full URL button (`window.location.origin + /invite/{token}`)
- Revoke button with confirmation dialog
- Status badges: Active, Expired, Exhausted, Revoked

---

## Critical Files

### Backend (Create/Modify)

- `backend/pb_schema.json` - Add organization_invites collection
- `backend/backend_constants.go` - Add invite constants
- `backend/invites.go` - NEW: Invite API endpoints
- `backend/main.go` - Register invite endpoints

### Frontend (Create/Modify)

- `src/lib/pocketbase-types.ts` - Auto-generated (run types:generate)
- `src/constants/auth.ts` - Add invite strings
- `src/constants/organization.ts` - Add invite management strings
- `src/hooks/query-keys.ts` - Add invite query keys
- `src/hooks/organization-invites.ts` - NEW: Invite hooks
- `src/pages/register.tsx` - Add organization name field
- `src/pages/onboarding.tsx` - NEW: Welcome/setup screen
- `src/pages/invite/[token].tsx` - NEW: Invite accept page
- `src/pages/settings/members.tsx` - Add invite links section
- `src/router.tsx` - Add invite + onboarding routes

---

## Flow Diagrams

### Flow 1: Direct Registration

```
User -> /register -> Fill form (email, password, org name)
  -> POST /api/v1/register-with-org
  -> [Transaction: Create user + Create org + Create membership as owner]
  -> Auto-login -> Redirect to /onboarding
  -> (Optional) Upload logo, add description, invite members
  -> Skip or Finish -> Redirect to /dashboard
```

### Flow 2: Invite Link Registration

```
Admin -> /settings/members -> "Invite Links" section -> Create invite link
  -> POST /api/v1/organizations/{id}/invites
  -> Copy full URL: https://domain.com/invite/{token}

User -> /invite/{token} -> GET /api/v1/invites/{token}
  -> Show org name/logo + simplified form (email, password)
  -> POST /api/v1/invites/{token}/accept
  -> [Transaction: Create user + Create membership + Increment uses_count + Send welcome notification]
  -> Auto-login -> Redirect to /dashboard
```

### Flow 3: Existing User Clicks Invite Link

```
User -> /invite/{token} -> Enters existing email
  -> POST /api/v1/invites/{token}/accept
  -> Error: "Email already registered"
  -> Show link to /login
```

---

## Validation Checklist

After implementation:

- [ ] `bun run check` passes (types, lint, format)
- [ ] `bun run build` succeeds
- [ ] Direct registration creates user + org + membership correctly
- [ ] Onboarding screen shows after direct registration
- [ ] Onboarding can be skipped
- [ ] Invite link registration works with valid token
- [ ] Expired/revoked/exhausted invites show proper errors
- [ ] Existing email shows error with login link
- [ ] Auto-login works after both registration flows
- [ ] Welcome notification is created for invite registrations
- [ ] Full invite URL is copied to clipboard
- [ ] Invite management UI shows correct status badges
