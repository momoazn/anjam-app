# Task Manager Application

A comprehensive task and project management application built with React, TypeScript, PocketBase, and Go.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.x
- [Go](https://go.dev) 1.24+
- Node.js tooling (installed via Bun)

### Installation

```bash
# Install dependencies
bun install

# Start development server (frontend + backend)
bun run dev

# Or run separately:
bun run dev:client  # Frontend only (Vite on 5173)
bun run dev:server  # Backend only (Air)
```

### Build

```bash
# Build everything (frontend + Linux backend + Windows backend + macOS backend + packaging)
bun run build

# Build the frontend only
bun run build:client

# Build the backend only (Linux binary in release/)
bun run build:server

# Build the Windows backend + package the ZIP
bun run build:windows

# Build only the macOS backend binary
bun run build:mac
```

## 📋 Available Scripts

### Development

- `bun run dev` - Start backend + frontend dev server
- `bun run dev:full` - Start backend (Air) + frontend dev server
- `bun run dev:client` - Start frontend only (Vite dev server)
- `bun run dev:server` - Start backend only (Air live reload)

### Building

- `bun run build` - Run `scripts/build.ts` to orchestrate the frontend build, Linux backend, Windows backend, macOS backend, and release packaging.
- `bun run build:client` - Build frontend for production.
- `bun run build:server` - Build the Linux backend binary into `release/`.
- `bun run build:windows` - Build the Windows backend and zip package.
- `bun run build:mac` - Build the macOS backend binary into `release/`.

### Quality Checks

- `bun run check` - Typecheck + lint + format checks
- `bun run fix` - Fix lint and formatting issues
- `bun run format` - Prettier check
- `bun run format:fix` - Prettier write
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Run ESLint with fixes
- `bun run type:check` - Run TypeScript type checking

### Database

- `bun run data:generate` - Generate seed data
- `bun run data:seed` - Insert seed data into database
- `bun run data:truncate` - Clear all data from database
- `bun run data:reset` - Truncate then seed database

### Testing

- `bun run test` - Run unit tests (watch mode)
- `bun run test:run` - Run unit tests once
- `bun run test:coverage` - Generate coverage report
- `bun run test:e2e` - Run E2E tests
- `bun run test:e2e:ui` - E2E tests with UI
- `bun run test:all` - Run unit + E2E tests

### Utilities

- `bun run types:generate` - Regenerate PocketBase TypeScript types
- `bun run clean` - Clean build artifacts, dependencies, and release

## 🏗️ Project Structure

### Backend (PocketBase)

- `backend/` - Go service module
  - `backend/main.go` - Entry point wiring PocketBase, custom handlers, and middleware
  - `backend/backend_constants.go` - Backend message, collection, and validation constants
  - `backend/pb_schema.json` - Imported PocketBase collection schema
  - `backend/dist/` - Vite production output that gets embedded into the Go binary
- `data/` - SQLite database files (`data.db`)

### Frontend (React + TypeScript)

- `src/` - React application
  - `components/` - Reusable UI components
  - `pages/` - Page components
  - `lib/` - Utilities and business logic
  - `store/` - State management
- `public/` - Static assets
- `backend/dist/` - Vite build output (embedded by Go)

### Infrastructure

- `infra/` - Dockerfile and docker-compose live here so infrastructure configs stay grouped and the repo root focuses on code

### Documentation

- `docs/` - Project documentation
- `scripts/` - Utility scripts
- `data/mock/` - Example data files

## 📝 Coding Style & Conventions

### TypeScript

- Strict mode enabled
- Prefer explicit types for public APIs
- Use path alias `@/` (configured in `tsconfig` and `vite.config.ts`)

### React Components

- PascalCase exports
- Kebab-case file names (e.g., `task-list-item.tsx`)
- Use functional components with hooks

### Formatting

- 2 spaces indentation
- Prettier for code formatting (with Tailwind plugin)
- ESLint for linting (TypeScript + React Hooks)
- Avoid default exports for shared utilities

## 🧪 Testing

### Unit Tests (Vitest + React Testing Library)

- `bun run test` - Run Vitest in watch mode
- `bun run test:run` - Run once
- `bun run test:coverage` - Generate coverage report

Test files are co-located as `*.test.ts(x)`. Coverage thresholds: 60% (lines, functions, branches, statements).

### E2E Tests (Playwright)

- `bun run test:e2e` - Run Playwright tests
- `bun run test:e2e:ui` - Playwright UI mode
- `bun run test:e2e:debug` - Debug E2E tests
- `bun run test:all` - Run unit tests (once) + E2E tests

E2E tests run against `http://localhost:5173`. Test directory: `e2e/`

## 🗄️ Schema & Type Generation

When changing `backend/pb_schema.json`:

1. Update the schema file
2. Run `bun run types:generate` to regenerate types
3. This updates `src/lib/pocketbase-types.ts` used across the app

## 🚀 Deployment

The application serves both API and frontend from a single Go binary. The frontend build is embedded in the Go server.

### Production Checklist

- [ ] Change default admin credentials
- [ ] Configure production database
- [ ] Set environment variables
- [ ] Run `bun run check` - all checks must pass
- [ ] Run `bun run build` - build must succeed
- [ ] Test the application in production mode

## 🔒 Security

- Development seeds create default admin users - **change credentials before production**
- Default account creation is allowed on first bootstrap when no admins exist; set `TM_ALLOW_DEFAULT_ACCOUNTS=true` if you also want to permit creating additional defaults after admins already exist.
- Do not commit real production data
- Keep secrets out of version control
- Frontend proxies `/api` to `http://localhost:8090` (see `vite.config.ts`)

## 🏁 Release Artifacts

- `release/linux/task-manager` is the Linux backend binary produced by `bun run build:server` (or `bun run build`).
- `release/windows/task-manager.exe` plus `release/windows/task-manager-windows.zip` (which also bundles `scripts/dev/run.bat` + `scripts/dev/run-with-env.bat`) are generated by `bun run build:windows`.
- `release/macos/task-manager-macos` is the macOS backend binary created by `bun run build:mac`.
- `release/` is ignored by git and is cleared by `bun run clean`, so rebuilds always recreate the release tree.

## 📚 Documentation

See the `docs/` directory for comprehensive documentation:

- [Project Overview](./docs/PROJECT_OVERVIEW.md) - High-level introduction
- [Development Guide](./docs/DEVELOPMENT_GUIDE.md) - Technical guidance
- [Development Roadmap](./docs/DEVELOPMENT_ROADMAP.md) - Strategic planning
- [Implementation Status](./docs/IMPLEMENTATION_STATUS.md) - Current state
- [QA Testing Guide (SLIM)](./docs/QA_TESTING_GUIDE_SLIM.md) - Testing procedures
- [Root Structure](./docs/ROOT_STRUCTURE.md) - Quick orientation for the repo root and how files are organized

## 🤝 Contributing

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes

Example: `feat(tasks): add drag-and-drop reordering`

### Pull Requests

1. Run `bun run check` - all checks must pass
2. Run `bun run build` - build must succeed
3. Include clear description
4. Link related issues
5. Provide test/QA steps
6. Add screenshots/GIFs for UI changes

## 📄 License

This project is private and confidential.
