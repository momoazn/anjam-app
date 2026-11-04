# Development Guide

This guide provides technical guidance for developers working on the Anjam application.

## Prerequisites

- [Bun](https://bun.sh) 1.x
- [Convex CLI](https://docs.convex.dev/production/hosting/deployments) - `npm install -g convex` or `bunx convex`
- Node.js tooling (installed via Bun)

## Development Workflow

### Starting Development

```bash
# Install dependencies
bun install

# Configure environment (see .env.example)
cp .env.example .env.local

# Start Convex and Vite together
bun run dev
```

The first `bunx convex dev` run creates a Convex deployment and fills `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL`. Set the Convex-side variables once:

```bash
bunx convex env set SITE_URL http://localhost:4112
bunx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
```

`convex/auth.ts` throws if `SITE_URL` or `BETTER_AUTH_SECRET` is missing.

The application will be available at `http://localhost:4112`

### Development Commands

- `bun run dev` - Start Convex and the Vite dev server together
- `bun run dev:vite` - Start only the Vite dev server (port 4112)
- `bun run dev:convex` - Start only the Convex dev server

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
- Coverage thresholds are set in `vitest.config.ts`
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
- Runs against `http://localhost:4112` (dev client)
- Starts the dev server through the `webServer` config in `playwright.config.ts`

## Building

### Production Builds

```bash
# Build frontend for production
bun run build

# Preview production build
bun run start

# Deploy Convex functions, then build the frontend with the new URL
bun run build:deploy
```

Build outputs are in `dist/` directory. For Docker and hosting, see the [runbook](../operations/runbook.md).

## Database & Schema

### Schema Management

The schema is defined in `convex/schema.ts`. When modifying the schema:

1. Edit the schema file
2. Convex automatically regenerates types in `convex/_generated/` on save
3. Import types from `convex/_generated/dataModel.d.ts` for data models
4. Import types from `convex/_generated/server.d.ts` for backend functions

### Convex Functions

Convex functions are organized in `convex/`:

- **Queries**: Read-only data fetching
- **Mutations**: Data modifications
- **HTTP routes**: `convex/http.ts` registers the Better Auth routes

## Project Structure

### Backend (Convex)

- `convex/schema.ts` - Database schema definition
- `convex/*.ts` - Query, mutation, and action functions
- `convex/_generated/` - Auto-generated types (don't edit)

### Frontend

- `src/components/` - Reusable UI components
- `src/pages/` - Route-level page components
- `src/lib/` - Business logic, utilities, Convex client
- `src/store/` - Zustand stores (app context, filters, modals, preferences)
- `src/hooks/` - Custom React hooks that wrap Convex queries and mutations
- `src/constants/` - Application constants

### Key Patterns

- **Convex API**: `src/lib/convex.ts` re-exports the generated `api`, `Doc`, and `Id`
- **Data Fetching**: Custom hooks call `useQuery` and `useMutation` from `convex/react`
- **Authentication**: Better Auth client (`src/lib/auth-client.ts`); session and organization state live in `src/store/app-context-store.ts`
- **Type Safety**: Auto-generated types from the Convex schema

## Real-time Updates

Convex provides automatic real-time synchronization:

- Query results update automatically when data changes
- No manual SSE subscriptions needed
- Convex handles all connection management

## Troubleshooting

### Common Issues

1. **Type errors after schema changes**: Wait for Convex to regenerate types or run `bunx convex dev`
2. **Build failures**: Run `bun run clean` and rebuild
3. **Convex connection issues**: Ensure `bunx convex dev` is running
4. **Port conflicts**: Frontend dev uses 4112

### Debug Mode

- Frontend: Use React DevTools and browser devtools
- Convex: Run `bunx convex dashboard` to open logs and data for your dev deployment
- E2E: Use `bun run test:e2e:debug` for Playwright debugging

## Related Documentation

- [Frontend Architecture](./frontend-architecture.md) - Frontend structure
- [Runbook](../operations/runbook.md) - Deployment and operations
