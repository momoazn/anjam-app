# Development Guide

This guide provides technical guidance for developers working on the Anjam application.

## Prerequisites

- [Bun](https://bun.sh) 1.x
- [Go](https://go.dev) 1.24+
- Node.js tooling (installed via Bun)

## Development Workflow

### Starting Development

```bash
# Install dependencies
bun install

# Start both backend and frontend in development mode
bun run dev

# Or run separately:
bun run dev:client  # Frontend only (Vite on port 5173)
bun run dev:server  # Backend only (Air with live reload)
```

### Development Commands

- `bun run dev` - Start backend + frontend dev server
- `bun run dev:full` - Backend (Air) + frontend dev server
- `bun run dev:client` - Frontend only (Vite dev server with HMR)
- `bun run dev:server` - Backend only (Air live-reload)

## Code Quality

### Quality Checks

After making changes, always run quality checks before committing:

```bash
# Run all quality checks (typecheck + lint + format)
bun run check

# Individual checks
bun run type:check    # TypeScript type checking
bun run lint          # ESLint check
bun run format        # Prettier check

# Auto-fix issues
bun run fix           # Fix linting and formatting
bun run lint:fix      # Fix linting only
bun run format:fix    # Fix formatting only
```

### Coding Style

- **TypeScript**: Strict mode enabled, prefer explicit types for public APIs
- **React Components**: PascalCase exports, kebab-case file names
- **Formatting**: 2 spaces indentation, Prettier + Tailwind plugin
- **Linting**: ESLint (TypeScript + React Hooks)
- **Path Aliases**: Use `@/` to reference `src/` directory

## Testing

### Unit Tests

Unit tests use Vitest + React Testing Library:

```bash
bun run test         # Watch mode
bun run test:run     # Run once
bun run test:coverage # Generate coverage report
```

- Test files are co-located as `*.test.ts(x)` next to source files
- Coverage thresholds: 60% (lines, functions, branches, statements)
- Focus on business logic in `src/lib/*` and critical components

### E2E Tests

E2E tests use Playwright:

```bash
bun run test:e2e         # Run Playwright tests
bun run test:e2e:ui      # Playwright UI mode
bun run test:e2e:debug   # Debug E2E tests
bun run test:all         # Run unit (once) + E2E tests
```

- Test directory: `e2e/`
- Runs against `http://localhost:5173` (dev client)
- Auto-starts dev server via `webServer` config

## Building

### Production Builds

```bash
# Build everything (frontend + all platform backends + packaging)
bun run build

# Individual builds
bun run build:client     # Frontend only
bun run build:server     # Linux backend only
bun run build:windows    # Windows backend + ZIP package
bun run build:mac        # macOS backend only
```

Build outputs are in `release/` directory:

- `release/linux/anjam` - Linux binary
- `release/windows/anjam.exe` + `anjam-windows.zip`
- `release/macos/anjam-macos` - macOS binary

## Database & Schema

### Schema Management

When modifying `backend/pb_schema.json`:

1. Edit the schema file
2. Run `bun run types:generate` to regenerate TypeScript types
3. This updates `src/lib/pocketbase-types.ts` used across the app
4. **Never manually edit** `src/lib/pocketbase-types.ts` - it's auto-generated

### Data Management

```bash
bun run data:generate    # Generate mock data files
bun run data:seed        # Insert seed data into database
bun run data:truncate    # Clear all data from database
bun run data:reset       # Truncate then seed database
```

## Project Structure

### Backend

- `backend/main.go` - Entry point, custom handlers, event handlers
- `backend/backend_constants.go` - Backend constants
- `backend/pb_schema.json` - PocketBase collection schema
- `backend/dist/` - Vite build output (embedded by Go)

### Frontend

- `src/components/` - Reusable UI components
- `src/pages/` - Route-level page components
- `src/lib/` - Business logic, utilities, PocketBase client
- `src/store/` - Zustand stores (auth, sidebar) with persistence
- `src/hooks/` - Custom React hooks
- `src/constants/` - Application constants

### Key Patterns

- **PocketBase Client**: `src/lib/pocketbase.ts` exports singleton `pb`
- **Data Fetching**: Use TanStack Query hooks with PocketBase SDK
- **Authentication**: Zustand store (`src/store/auth-store.ts`) syncs with `pb.authStore`
- **Type Safety**: Auto-generated types from schema via `pocketbase-typegen`

## Custom API Endpoints

The backend exposes custom endpoints at `/api/tm/*`:

- `PATCH /api/tm/users/{id}/toggle-active` - Activate/deactivate user (admin only)
- `PATCH /api/tm/users/{id}/unblock` - Unblock user after failed logins (admin only)
- `GET /api/tm/users/{id}/login-logs` - Retrieve user's login history

See `backend/main.go` for implementation details.

## Event Handlers

Backend event handlers in `backend/main.go`:

- `OnRecordCreateExecute`: Runs before record creation (can modify record)
- `OnRecordAfterCreateSuccess`: Runs after successful creation (notifications, etc.)
- `OnRecordAfterUpdateSuccess`: Runs after updates (status change notifications, etc.)

Used for:

- Auto-generating project codes (3-letter uppercase)
- Auto-generating task display IDs (format: `{PROJECT_CODE}-{NUMBER}`)
- Creating notifications for task assignments and updates

## Troubleshooting

### Common Issues

1. **Type errors after schema changes**: Run `bun run types:generate`
2. **Build failures**: Run `bun run clean` and rebuild
3. **Database issues**: Reset with `bun run data:reset`
4. **Port conflicts**: Backend uses 8090, frontend dev uses 5173

### Debug Mode

- Frontend: Use React DevTools and browser devtools
- Backend: Check Go logs in terminal, PocketBase admin UI at `/_/`
- E2E: Use `bun run test:e2e:debug` for Playwright debugging

## Related Documentation

- [Project Overview](./PROJECT_OVERVIEW.md) - High-level introduction
- [Development Roadmap](./DEVELOPMENT_ROADMAP.md) - Strategic planning
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Current state
- [QA Testing Guide](./QA_TESTING_GUIDE_SLIM.md) - Testing procedures
- [Root Structure](./ROOT_STRUCTURE.md) - Repository organization
