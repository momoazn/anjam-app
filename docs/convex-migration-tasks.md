# Convex Migration Task List (Ready to Start)

This is the actionable work tracker derived from `docs/convex-migration-plan.md`.

All blocking decisions have been resolved. See §14 of the migration plan for details.

---

## A) Repo + Branching

1. Create `operations-stable` branch from a known-good commit.
   - Done when: branch exists and builds; stakeholder release tag created (e.g. `ops-v1.0.0`).

2. Document freeze policy for `operations-stable` (bugfix/security only).
   - Done when: short note added to release notes or `docs/` and shared with team.

3. Create `feat/convex-migration` branch from `main`.
   - Rule: no Convex migration commits go directly to `main`.
   - Rule: `operations-stable` is never merged back into `main`.
   - Done when: branch exists and is the only target branch for Convex migration PRs.

---

## B) Main: Remove Operations Mode + Global Roles (Preparatory)

4. Remove operations-only routes from `src/router.tsx` and nav entry points.
   - Remove: `/dashboard`, `/my-tasks`, `/users*`, `/timesheet`, `/audit-logs`, `/reports`, `/issues`, `/projects/:id/users`.
   - Add: `/organizations/:id/users` (org users route).
   - Done when: app builds; no links to removed routes; `rg` finds no references to removed pages.

5. Remove global role logic from frontend.
   - Replace all `UsersRoleOptions.*` and `user.role` checks with org role checks (`owner|member`) or remove gating.
   - Done when: no `UsersRoleOptions` usage in `src/`.

6. Replace project-member dependencies with org-member sources.
   - Assignee dropdowns: `TaskFields`, subtasks assignee, etc. must use org members.
   - Mention autocomplete must use org members.
   - Done when: no runtime dependency on `project_members` for product v1 UI flows.

---

## C) Main: Remove File Upload UX (v1 scope cut)

7. Remove/disable file upload UI and related data paths.
   - Project assets UI, org logo/avatar UI, comment attachments UI.
   - Done when: no upload components used; no PB file URLs referenced in product flows.

---

## D) Main: Convex Bootstrap

8. Initialize Convex in repo and connect to Convex Cloud project.
   - Run `npx convex init` and configure project.
   - Done when: `convex/` exists, dev config works, and a basic query runs.

9. Add env/config scaffolding.
   - Required variables: `CONVEX_DEPLOYMENT`, `RESEND_API_KEY`, `AUTH_RESEND_FROM`.
   - Done when: documented required env vars + example `.env.local.example` (no secrets committed).

10. Implement Convex schema + indexes for v1 tables.
    - Tables: `users`, `organizations`, `organizationMembers`, `projects`, `tasks`, `tags`, `comments`, `mentions`, `notifications`, `invites`, `projectCounters`.
    - Unique constraints: org slug, username (case-insensitive), project code, `(orgId,userId)` membership, task `(projectId,taskNumber)`, tag `(orgId,name)`.
    - Note: `project_statuses` table is NOT included (deferred to post-v1).
    - Done when: schema deploy succeeds.

11. Implement uniqueness + counter primitives.
    - Username: add `usernameNormalized` + index `by_usernameNormalized`; enforce uniqueness in mutation.
    - Tasks: `projectCounters` table + index `by_projectId`; allocate `taskNumber` transactionally in `tasks.create`.
    - Done when: concurrency tests confirm no collisions.

---

## E) Main: Auth + Identity (Convex Auth + Resend)

12. Implement Convex Auth email+password with required verification.
    - Use `@convex-dev/auth` package.
    - Integrate Resend for verification emails.
    - Done when: register → email → verify → login works.

13. Implement username rules.
    - Required, unique (case-insensitive), normalized (trim/lowercase).
    - Auto-generate username on signup/invite-accept from email; suffix on collision.
    - Done when: cannot create duplicates; collisions handled automatically.

14. Wire Convex client + provider into the React app.
    - Add `ConvexProvider` and auth provider at app root (`src/main.tsx`).
    - Verify `useQuery/useMutation/useAction` work from a simple page.
    - Done when: frontend can call a trivial Convex query and render the result.

---

## F) Main: Organizations + Org Members + Invites

15. Organizations (Convex functions + frontend wiring).
    - Create org (slugify + collision handling), list orgs for user, select org, onboarding-completed flag.
    - Convex surfaces:
      - `organizations.create` (mutation)
      - `organizations.listMine` (query)
      - `organizations.update` (mutation, owner-only)
      - `organizations.setOnboardingCompleted` (mutation)
    - Done when: onboarding flow works end-to-end and org switching works.

16. Org members page and authorization.
    - Route: `/organizations/:id/users`.
    - Member list + owner-only management (remove members).
    - Convex surfaces:
      - `orgMembers.listByOrg` (query)
      - `orgMembers.remove` (mutation, owner-only)
    - Done when: owner can see/manage members; members have appropriate access.

17. Invites (member-only).
    - Owner can create/revoke invite links (token, expiry, max uses if desired).
    - Accept invite supports both:
      - existing user joins org as member
      - new user signs up via token and joins org as member
    - Convex surfaces:
      - `invites.createLink` (mutation, owner-only)
      - `invites.revoke` (mutation, owner-only)
      - `invites.getByToken` (query, public)
      - `invites.acceptExistingUser` (mutation)
      - `invites.acceptNewUser` (action; orchestrates auth + membership)
    - Done when: both flows verified; invite cannot grant owner role.

---

## G) Main: Projects

18. Projects CRUD.
    - Create/list/edit/view scoped to org.
    - Project `code` generation (3-letter style, unique).
    - Any org member can create projects; only owners can delete.
    - Supervisor field: informational display only (no special permissions).
    - Convex surfaces:
      - `projects.create` (mutation)
      - `projects.listByOrg` (query)
      - `projects.get` (query)
      - `projects.update` (mutation)
      - `projects.delete` (mutation, owner-only)
    - Done when: projects pages function without PocketBase.

---

## H) Main: Tasks + Board + Tags + Comments + Mentions

19. Tasks CRUD with permission rules.
    - `displayId` + per-project `taskNumber` sequencing.
    - Fixed status set: `todo`, `in_progress`, `in_review`, `done`, `cancelled`.
    - Soft delete (`deletedAt`); all list queries filter `deletedAt == null`.
    - Permissions:
      - Members can create any task.
      - Members can edit tasks they created OR are assigned to.
      - Members can soft-delete tasks they created only.
      - Owners can edit/delete any task.
    - Convex surfaces:
      - `tasks.create` (mutation; uses `projectCounters`)
      - `tasks.get` (query)
      - `tasks.list` (query; cursor-based pagination, supports filters)
      - `tasks.update` (mutation)
      - `tasks.softDelete` (mutation)
    - Done when: tasks list/detail/create/edit work with correct permissions.

20. Task board.
    - Query tasks by project, sort by `order`, group by `status`.
    - Persist drag-and-drop updates to `status` and `order`.
    - Convex surface:
      - `tasks.updateBoardPosition` (mutation)
    - Done when: board reorder persists and updates other views.

21. Tags.
    - Org-scoped tags CRUD.
    - Task tag selection works.
    - Convex surfaces:
      - `tags.listByOrg` (query)
      - `tags.create/update/delete` (mutations)
    - Done when: tags page + tag picker work.

22. Comments.
    - Create/list/reply/soft-delete.
    - No attachments in v1.
    - Soft delete (`deletedAt`); list queries filter `deletedAt == null`.
    - Convex surfaces:
      - `comments.listByTask` (query)
      - `comments.create` (mutation; triggers mention parsing)
      - `comments.softDelete` (mutation)
    - Done when: task details comments section works.

23. Mentions.
    - Parse `@username` on comment creation; create mention records.
    - Mention autocomplete uses org members.
    - Convex surface:
      - `mentions.listForMe` (query)
    - Done when: mentioned users see inbox/mentions updates.

---

## I) Main: Notifications + Inbox + Insights + Search

24. Notifications.
    - Generate notifications for: task assigned, comment added, mention created.
    - User actions: mark read, mark all read, delete, clear read, clear all.
    - Convex surfaces:
      - `notifications.listForMe` (query)
      - `notifications.markRead/markAllRead/delete/clearRead/clearAll` (mutations)
    - Done when: notifications page behavior matches current UX.

25. Inbox.
    - Provide sections: assigned, mentioned, recently updated.
    - Convex surface:
      - `inbox.getForMe` (query)
    - Done when: inbox loads and updates in realtime.

26. Insights.
    - Rewire `src/pages/insights.tsx` data sources to org-scoped Convex queries.
    - Convex surface:
      - `insights.getForOrg` (query)
    - Done when: metrics render correctly for an org.

27. Search.
    - Simple fuzzy/contains search over projects + tasks, min query length 2, org-scoped.
    - Convex surface:
      - `search.global` (query)
    - Done when: search UI works and respects org membership.

---

## J) PocketBase Removal on `main` (Final Cleanup)

28. Replace PocketBase hooks with Convex equivalents.
    - Done when: no `pb.collection(...)` calls remain for product v1.

29. Remove PocketBase client/types and `/api/v1/*` dependencies.
    - Remove: `src/lib/pocketbase.ts`, `src/lib/pocketbase-types.ts`, and codegen scripts.
    - Done when: `rg pocketbase` in `src/` finds none (excluding docs).

30. Remove Go backend coupling from `main` build/deploy path.
    - Done when: product can run/build without `backend/` PocketBase server.

---

## K) Verification

31. Manual acceptance run (checklist from §11.1).
    - Auth (register/verify/login)
    - Org create/switch
    - Invite (new + existing user)
    - Projects CRUD
    - Tasks CRUD with permissions
    - Board reorder
    - Tags
    - Comments + mentions
    - Notifications actions
    - Inbox
    - Insights
    - Search

32. Run `bun run check` and fix any regressions.
    - Done when: checks pass.

33. Confirm Definition of Done (§11.3).
    - No PocketBase runtime usage in `src/`.
    - No `/api/v1/*` usage in product v1 flows.
    - All v1 features work via Convex queries/mutations/actions.

---

## Summary of Resolved Decisions

| Decision                | Resolution                                                                 |
| ----------------------- | -------------------------------------------------------------------------- |
| Org users route         | `/organizations/:id/users`                                                 |
| Member task permissions | Edit tasks they created or are assigned to; delete only tasks they created |
| Project creation        | Members allowed; only owners can delete                                    |
| Per-project statuses    | Deferred to post-v1; use fixed global status set                           |
| Supervisor field        | Keep as informational display only                                         |
| Testing                 | Deferred to post-v1; manual verification only                              |
