# Project Context

## Purpose
A comprehensive task management application built with React frontend and PocketBase backend. The app provides project-based task management with role-based access control, supporting multiple user roles (admin, supervisor, participant) and features like task assignment, project management, user administration, and reporting dashboards.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4.x
- **Backend**: Go with PocketBase (embedded database, authentication, API)
- **Database**: SQLite (via PocketBase)
- **State Management**: Zustand for auth, TanStack Query for server state
- **UI Components**: ShadCN UI based on Radix UI and Tailwind CSS
- **Build Tools**: Bun (package manager), Air (Go hot reload)
- **Development**: ESLint, Prettier, TypeScript strict mode

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled, explicit types for public APIs
- **React**: Functional components with hooks, PascalCase for components
- **File Naming**: kebab-case for files (e.g., `task-list-item.tsx`)
- **Path Aliases**: Use `@/` for src imports (configured in tsconfig and vite)
- **Formatting**: Prettier with Tailwind plugin, 2-space indentation
- **Linting**: ESLint with TypeScript and React Hooks rules

### Architecture Patterns
- **Frontend Architecture**: Component-based with custom hooks for data fetching
- **State Management**: 
  - Zustand for client-side auth state (persisted)
  - TanStack Query for server state and caching
- **Data Flow**: PocketBase collections with typed responses
- **Component Structure**: 
  - `components/` - Reusable UI components
  - `hooks/` - Custom React hooks for data and business logic
  - `lib/` - Utilities, PocketBase client, type definitions
  - `pages/` - Route components
  - `store/` - Zustand stores
- **Backend**: PocketBase with custom Go handlers for business logic

### Testing Strategy
- No formal test runner configured yet
- Manual testing and smoke tests
- Future: Prefer Vitest + React Testing Library for component tests
- Focus on business logic in `src/lib/` and critical components

### Git Workflow
- **Branching**: Feature branches from main
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)
- **PR Requirements**: Clear descriptions, linked issues, test steps, UI screenshots/GIFs
- **Pre-commit**: Run `bun run web:check` and `bun run build:all`

## Domain Context
- **User Roles**: Admin (full access), Supervisor (project management), Participant (task assignment)
- **Core Entities**: Projects, Tasks, Users, User-Project relationships
- **Task Management**: Status tracking (todo, in_progress, done), priority levels, assignment
- **Project Features**: Unique project codes, supervisor assignment, participant management
- **Localization**: Persian/Farsi support with Jalali calendar integration
- **UI/UX**: Modern sidebar layout, responsive design, dark/light theme support

## Important Constraints
- **Development**: Default admin credentials only in dev mode (`TM_ALLOW_DEFAULT_ACCOUNTS` env var)
- **Security**: Role-based access control enforced at API level
- **Data**: SQLite database in `./data/` directory
- **Build**: Frontend embedded in Go binary for production deployment
- **Browser Support**: Modern browsers (ES2020+)

## External Dependencies
- **PocketBase**: Backend framework with embedded SQLite, authentication, and API
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management and caching
- **Date-fns**: Date manipulation with Jalali calendar support
- **Recharts**: Data visualization for reports
- **Persian Tools**: Persian/Farsi text processing
