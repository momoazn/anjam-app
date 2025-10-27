# Project Context

## Purpose

Provide a full-stack task management experience for teams, combining a PocketBase-powered backend with a modern React frontend to manage projects, tasks, users, and collaborative workflows with role-aware access control.

## Tech Stack

- TypeScript + React 19 with Vite and Tailwind CSS for the web client
- Go 1.24+ backend embedding PocketBase (SQLite data store) and serving the built frontend
- Bun 1.x for dependency management, tooling, and concurrent dev scripts
- Zustand, TanStack Query, React Hook Form, and Zod for client-side state, data fetching, and forms

## Project Conventions

### Code Style

TypeScript runs in strict mode; prefer explicit types for shared exports. Formatting is enforced by Prettier (with the Tailwind plugin) at 2 spaces and ASCII-only output unless existing files require otherwise. React components export named PascalCase symbols, while shared utilities avoid default exports. File naming follows kebab-case under `src/`, and the `@/` alias is used for absolute imports.

### Architecture Patterns

The Go application embeds static assets from `dist/`, boots PocketBase, and wires event handlers for key collections (projects, tasks, comments, users). Custom REST endpoints under `/api/tm/*` extend PocketBase capabilities. The frontend is a SPA composed of modular components, uses TanStack Query for server state, Zustand for lightweight client state, and React Hook Form + Zod for validation. Radix UI primitives and Tailwind utility classes drive the design system.

### Testing Strategy

Primary checks run through `bun run check`, combining `tsc`, ESLint, and Prettier validation. Automated tests are not yet established; when adding them, prefer Vitest with React Testing Library co-located as `*.test.ts(x)`. Critical business logic in `src/lib` should receive coverage, and manual smoke tests remain the default verification step before release.

### Git Workflow

Use feature branches off the default branch for scoped work. Commits follow Conventional Commit prefixes (feat, fix, refactor, chore, docs). Before opening a PR, run `bun run check` and `bun run build`, and document testing steps plus UI captures when applicable.

## Domain Context

The app models collaborative task management: admins bootstrap the system, supervisors own projects, and participants collaborate through tasks, comments, and status updates. Access rules in PocketBase enforce role-based permissions for creating projects, assigning tasks, and viewing shared work.

## Important Constraints

Default admin credentials are only acceptable in development; production environments must provision secure accounts or set `TM_ALLOW_DEFAULT_ACCOUNTS=true` intentionally. Keep secrets and real production data out of version control. Respect PocketBase collection rules when adding endpoints or mutations, and ensure new functionality does not bypass role checks.

## External Dependencies

PocketBase provides the data layer and authentication. SQLite backs PocketBase persistence in `data/data.db`. Frontend UI leverages Radix UI, Tailwind CSS, and lucide icons, while backend email or notification behavior should integrate with PocketBase hooks as needed.
