# QA Testing Guide (SLIM)

A concise guide for testing the task manager application locally and validating key flows.

## Quick Test Commands

```bash
# Run all tests
bun run test:all

# Unit tests only
bun run test:run

# E2E tests only
bun run test:e2e

# Quality checks (typecheck + lint + format)
bun run check
```

## Unit Testing

### Running Tests

```bash
bun run test         # Watch mode (recommended during development)
bun run test:run     # Single run (for CI/verification)
bun run test:coverage # Generate coverage report
```

### Test Structure

- Test files: `*.test.ts(x)` co-located with source files
- Framework: Vitest + React Testing Library
- Setup: `src/test/setup.ts` configures test environment
- Coverage target: 60% (lines, functions, branches, statements)

### Key Test Areas

Focus testing on:

- Business logic in `src/lib/*` (utilities, permissions, date handling)
- Critical components (forms, status handling, filtering)
- Custom hooks (data fetching, state management)

### Example: Testing Status Utils

```typescript
// src/lib/status-utils.test.ts
import { getTaskStatus } from "./status-utils";

it("should return default todo status when task status is undefined", () => {
  const task = createMockTask({ status: undefined });
  const result = getTaskStatus(task);
  expect(result.key).toBe("todo");
  expect(result.isCompleted).toBe(false);
});
```

## E2E Testing

### Running E2E Tests

```bash
bun run test:e2e         # Run all E2E tests
bun run test:e2e:ui      # Playwright UI mode (interactive)
bun run test:e2e:debug   # Debug mode with browser DevTools
```

### Test Configuration

- Framework: Playwright
- Test directory: `e2e/`
- Target: `http://localhost:5173` (dev client)
- Auto-starts dev server via `webServer` config

### Key Test Flows

Current E2E tests cover:

- Authentication (login, logout)
- Basic navigation

**Recommended additional flows to test:**

1. **Task Management**
   - Create task
   - Edit task
   - Change task status
   - Assign task to user
   - Add comment to task

2. **Project Management**
   - Create project
   - Edit project
   - View project details
   - Filter tasks by project

3. **Filtering & Search**
   - Apply filters (status, assignee, tags)
   - Save filter
   - Use saved filter
   - Clear filters

## Manual Testing Checklist

### Authentication

- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Failed login attempts (should block after 5 attempts)
- [ ] Logout
- [ ] Session persistence (refresh page, should stay logged in)

### Task Management

- [ ] Create new task
- [ ] Edit existing task
- [ ] Delete task (if implemented)
- [ ] Change task status through workflow
- [ ] Assign task to user
- [ ] Set task priority
- [ ] Set task deadline
- [ ] Add tags to task
- [ ] Add comment to task
- [ ] View task details

### Project Management

- [ ] Create new project
- [ ] Edit project
- [ ] View project details
- [ ] See task list for project
- [ ] Project code auto-generation (should be 3-letter uppercase)

### Filtering & Views

- [ ] Filter tasks by status
- [ ] Filter tasks by assignee
- [ ] Filter tasks by project
- [ ] Filter tasks by tags
- [ ] Filter tasks by date range
- [ ] Save filter combination
- [ ] Use saved filter
- [ ] Clear all filters
- [ ] Switch between list/kanban view (if implemented)

### Calendar & Timesheet

- [ ] View calendar with tasks
- [ ] Navigate calendar (previous/next month)
- [ ] View timesheet
- [ ] Filter timesheet by date range
- [ ] Export timesheet to CSV

### User Management (Admin)

- [ ] View user list
- [ ] Create new user
- [ ] Edit user
- [ ] Activate/deactivate user
- [ ] Unblock user (after failed logins)
- [ ] View user login logs

### Notifications

- [ ] Receive notification for task assignment
- [ ] Receive notification for task status change
- [ ] Receive notification for comment
- [ ] Mark notification as read
- [ ] Notification badge shows unread count

### Permissions

- [ ] Admin can access all features
- [ ] Manager has appropriate permissions
- [ ] Employee has limited permissions
- [ ] Unauthorized actions show proper error

## Quality Checks

Before committing code, always run:

```bash
bun run check
```

This runs:

1. TypeScript type checking (`type:check`)
2. ESLint (`lint`)
3. Prettier format check (`format`)

All checks must pass before committing.

## Test Data

### Development Data

```bash
# Generate mock data
bun run data:generate

# Seed database with test data
bun run data:seed

# Reset database (truncate + seed)
bun run data:reset

# Clear all data
bun run data:truncate
```

### Default Test Accounts

⚠️ **For development only** - change in production:

- Admin: `admin@example.com` / `admin12345`
- Admin (alternative): `admin` / `admin12345`

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
bun run test:run src/lib/status-utils.test.ts

# Run tests matching pattern
bun run test:run -- -t "getTaskStatus"

# Debug in VS Code: Set breakpoints and use debugger
```

### E2E Tests

```bash
# Debug mode (opens browser with DevTools)
bun run test:e2e:debug

# UI mode (interactive test runner)
bun run test:e2e:ui

# Run specific test file
bun run test:e2e e2e/auth.spec.ts
```

## CI/CD Testing

For CI/CD pipelines, use:

```bash
# Single run of all tests (no watch mode)
bun run test:all

# Quality checks (must pass)
bun run check

# Build verification
bun run build
```

## Common Issues

### Tests Failing After Schema Changes

```bash
# Regenerate TypeScript types
bun run types:generate

# Re-run tests
bun run test:run
```

### Port Conflicts

- Backend: Port 8090
- Frontend dev: Port 5173
- E2E: Uses 5173 (dev client)

If ports are in use, kill processes or change port configuration.

### Database State Issues

```bash
# Reset database to clean state
bun run data:reset
```

## Related Documentation

- [Development Guide](./DEVELOPMENT_GUIDE.md) - Technical development guidance
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Current feature status
- [Bugs, Issues, and Shortcomings](./BUGS_ISSUES_AND_SHORTCOMINGS.md) - Known issues
