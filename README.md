# Anjam

A comprehensive task and project management application built with React, TypeScript, and Convex.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.x
- [Convex CLI](https://docs.convex.dev/production/hosting/deployments) - `npm install -g convex` or `bunx convex`
- Node.js tooling (installed via Bun)

### Installation

```bash
# Install dependencies
bun install

# Initialize Convex development deployment
bunx convex dev

# Start development server (runs Convex + Vite)
bun run dev
```

The application will be available at `http://localhost:4112`

### Build

```bash
# Build the frontend for production
bun run build

# Deploy Convex + build frontend in one step (CI recommended)
CONVEX_DEPLOY_KEY=... bun run build:deploy

# Preview production build
bun run start
```

## 📋 Available Scripts

### Development

- `bun run dev` - Start Convex + Vite dev servers (hot reload)

### Building

- `bun run build` - Build frontend for production
- `bun run build:analyze` - Build with bundle analysis
- `bun run build:deploy` - Deploy Convex + build frontend (CI-friendly)
- `bun run start` - Preview production build locally

### Quality Checks

- `bun run check` - Typecheck + lint + format checks (**run this after changes**)
- `bun run fix` - Auto-fix lint and formatting issues
- `bun run format` - Prettier check
- `bun run format:fix` - Prettier write
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Run ESLint with fixes
- `bun run type:check` - Run TypeScript type checking

### Testing

- `bun run test` - Run unit tests (watch mode)
- `bun run test:run` - Run unit tests once
- `bun run test:coverage` - Generate coverage report
- `bun run test:e2e` - Run E2E tests
- `bun run test:e2e:ui` - E2E tests with UI
- `bun run test:e2e:debug` - Debug E2E tests
- `bun run test:all` - Run unit + E2E tests

### Utilities

- `bun run clean` - Clean build artifacts and dependencies

## 🏗️ Project Structure

### Frontend (React + TypeScript)

- `src/` - React application
  - `components/` - Reusable UI components
  - `pages/` - Page components
  - `lib/` - Utilities and business logic
  - `store/` - State management
- `public/` - Static assets

### Backend (Convex)

- `convex/` - Convex backend
  - `schema.ts` - Database schema
  - `*.ts` - Functions (queries, mutations, actions)
  - `_generated/` - Auto-generated types (don't edit)

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

E2E tests run against `http://localhost:4112`. Test directory: `e2e/`

## 🚀 Deployment

### Self-Hosted Convex Runtime

Self-hosted Convex infrastructure is intentionally split out of this app repository and lives in:

- `/Users/mohamadhosein/Workspace/side/anjam-convex-self-hosted`

Run Convex backend + dashboard from that repo, then point this app to it with:

```bash
VITE_CONVEX_URL="http://localhost:3210"
VITE_CONVEX_SITE_URL="http://localhost:3211"
```

From this repo, deploy functions/schema to that runtime with:

```bash
CONVEX_SELF_HOSTED_URL="http://localhost:3210" \
CONVEX_SELF_HOSTED_ADMIN_KEY="<admin-key>" \
bunx convex deploy
```

### Convex Deployment

```bash
# Deploy to Convex Cloud
bunx convex deploy

# You'll be prompted to authenticate and select/create a deployment
```

For production builds:

```bash
# Deploy Convex + build frontend with deployment URL injected
CONVEX_DEPLOY_KEY=... bun run build:deploy

# The dist/ directory contains production-ready static assets
```

### Production Checklist

- [ ] Configure Convex deployment
- [ ] Set environment variables (see `.env.example`)
- [ ] Tune Better Auth rate limits for production (`AUTH_SIGNIN_RATE_LIMIT_*`, `AUTH_SIGNUP_RATE_LIMIT_*`)
- [ ] Run `bun run check` - all checks must pass
- [ ] Run `bun run build` - build must succeed
- [ ] Test the application in production mode
- [ ] Configure custom domain (if needed)

## 🔒 Security

- Keep secrets out of version control
- Use environment variables for sensitive configuration
- Never commit `.env` files

## 📚 Documentation

See the `docs/` directory for comprehensive documentation:

- [System Architecture](./docs/architecture/system-architecture.md) - High-level architecture
- [Frontend Architecture](./docs/development/frontend-architecture.md) - Frontend structure
- [Development Guide](./docs/development/guide.md) - Technical guidance
- [Product Design](./docs/product/design.md) - Product design documentation

## 📋 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes, including the major architectural migration to Convex Cloud.

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
