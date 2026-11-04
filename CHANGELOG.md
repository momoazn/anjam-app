# Changelog

All notable changes to Anjam are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- MIT license.
- Convex backend tests (`convex-test`) for tenant isolation and per-project task numbering.

### Changed

- `seed:seedDevData` is now an internal action. Run it with `bunx convex run`.
- `.env.example` lists `SITE_URL` and drops variables that no code reads.
- Docs: removed planning notes and docs that described features that are not built.

### Removed

- The `/audit-logs` route alias. It rendered the Insights page; no audit log exists.

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
