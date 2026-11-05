# Changelog

All notable changes to Anjam are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- MIT license.
- Convex backend tests (`convex-test`) for tenant isolation and per-project task numbering.
- README screenshots in `docs/screenshots/`.

### Changed

- `seed:seedDevData` is now an internal action. Run it with `bunx convex run`.
- `.env.example` lists `SITE_URL` and drops variables that no code reads.
- Docs: removed planning notes and docs that described features that are not built.
- UI polish across the board, list, inbox, calendar, task details, insights, sidebar, and auth pages.
- The demo seed is in Persian, with spread-out creation and completion dates so the insights charts show data.

### Fixed

- Signing out clears the saved organization.
- Task list pagination, and the tag, due-date, and multi-status filters.
- Overdue checks use the local day.
- Edit and delete actions follow the user's role.
- Failed task actions show an error toast.
- Bulk actions report real counts.
- Owners can delete any comment. Only the author can edit a comment.
- Saved filters are scoped to the organization and the user.
- Accepting an invite switches to that organization. Sign-in returns to the page that sent you there.
- Charts and date labels render correctly right-to-left.

### Removed

- PostHog analytics: the `posthog-js` dependency, its provider, and the `VITE_PUBLIC_POSTHOG_*` variables.
- The `/audit-logs` route alias. It rendered the Insights page; no audit log exists.
- The unused pending-activation page.

## [0.1.0] - 2026-03-09

Rebuild on Convex. The Go/PocketBase backend was removed on 2026-01-07.

### Changed

- Backend moved from Go + PocketBase (SQLite) to Convex. Queries are reactive, so every client sees changes in real time without polling or cache invalidation.
- Authentication moved to Better Auth, running as a Convex component.
- Data fetching moved from TanStack Query to Convex React hooks. Client state is in Zustand stores.
- User model simplified to a single `displayName`.
- Roles simplified to `owner` and `member` per organization.

### Added

- Multi-tenant organizations with invite links (optional expiry and use limit).
- Tenant checks in one place: `convex/lib/auth.ts`.
- Per-project task numbering (`ABC-001`) with a `projectCounters` table.
- Subtasks, threaded comments with `@mentions` and reactions, notifications, and an inbox.
- Saved filters, with auto-apply of a default filter.
- Insights page with weekly throughput, work in progress, and cycle time.
- Password visibility toggle and secret validation on auth pages.

### Removed

- Project favorites.
- The Go/PocketBase server, its generated types, and TanStack Query.

## [0.0.1] - 2025-04-11

First version: a Go + PocketBase backend with a React, TypeScript, and Vite frontend. Tasks, projects, comments, and notifications.
