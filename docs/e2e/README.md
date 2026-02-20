# E2E Test Suite for Anjam

Comprehensive end-to-end test suite using Playwright covering all user stories from the application.

## Test Structure

```
e2e/
├── auth.setup.ts                 # Authentication setup for storage state
├── fixtures/
│   ├── auth.ts                   # Auth fixtures for different user roles
│   └── test-data.ts              # Test credentials and constants
├── pages/
│   ├── login.page.ts             # Login Page Object
│   ├── dashboard.page.ts         # Dashboard Page Object
│   ├── projects.page.ts          # Projects Page Object
│   └── tasks.page.ts             # Tasks Page Object
├── specs/
│   ├── auth/
│   │   ├── login.spec.ts         # US-002: Login tests
│   │   ├── register.spec.ts      # US-001: Registration tests
│   │   └── logout.spec.ts        # US-004: Logout tests
│   ├── organization/
│   │   └── org.spec.ts           # US-005,006,007,008,082-088
│   ├── projects/
│   │   └── crud.spec.ts          # US-010-013: Project CRUD
│   ├── tasks/
│   │   ├── crud.spec.ts          # US-016-022: Task CRUD & filtering
│   │   └── dashboard.spec.ts     # US-054-056: Dashboard & navigation
│   ├── collaboration/            # (To be implemented)
│   │   ├── comments.spec.ts      # US-023-025, US-089
│   │   ├── subtasks.spec.ts      # US-026-027
│   │   └── time-entries.spec.ts  # US-028-031
│   ├── tags/                     # (To be implemented)
│   ├── notifications/            # (To be implemented)
│   ├── users/                    # (To be implemented)
│   ├── settings/                 # (To be implemented)
│   ├── reports/                  # (To be implemented)
│   ├── bulk/                     # (To be implemented)
│   ├── calendar/                 # (To be implemented)
│   └── timesheet/                # (To be implemented)
└── utils/
    └── helpers.ts                # Common helper functions
```

## Setup

### Prerequisites

- Bun package manager
- Playwright browsers installed
- Frontend dev server running on `http://localhost:4112`
- Convex development server running

### Initial Setup

```bash
# Install dependencies (if not already installed)
bun install

# Install Playwright browsers
bun exec playwright install
```

## Running Tests

### Run all tests

```bash
bun run test:e2e
```

### Run specific test file

```bash
bun run test:e2e -- e2e/specs/auth/login.spec.ts
```

### Run tests in a directory

```bash
bun run test:e2e -- e2e/specs/auth/
```

### Run tests matching a pattern

```bash
bun run test:e2e -- --grep "should create"
```

### UI Mode (visual debugging)

```bash
bun run test:e2e:ui
```

### Debug mode

```bash
bun run test:e2e:debug
```

### Generate coverage report

```bash
bun run test:coverage
```

## Test Organization

Tests are organized by feature/user story category:

### Authentication Tests (e2e/specs/auth/)

- **login.spec.ts**: Login functionality (US-002)
  - Valid credentials
  - Invalid credentials
  - Failed attempt blocking
  - Redirect behavior

- **register.spec.ts**: Registration (US-001)
  - Valid registration
  - Email validation
  - Password validation
  - Duplicate email handling

- **logout.spec.ts**: Logout (US-004)
  - Session termination
  - Route protection
  - Re-authentication required

### Organization Tests (e2e/specs/organization/)

- CRUD operations (US-005, US-006)
- Member invitations (US-007, US-008)
- Invite links (US-082-088)
- Member management

### Project Tests (e2e/specs/projects/)

- Create/Read/Update/Delete projects (US-010-013)
- Member management (US-014-015)
- Project details and statistics

### Task Tests (e2e/specs/tasks/)

- Task CRUD operations (US-016-021)
- List and board views (US-017-018)
- Filtering and sorting (US-022)
- Dashboard and navigation (US-054-056)

### Collaboration Tests (e2e/specs/collaboration/) - To be implemented

- Comments and replies (US-023-025)
- Emoji reactions (US-089)
- Subtasks (US-026-027)
- Time entries (US-028-031)

### Additional Features - To be implemented

- Tags management (e2e/specs/tags/) - US-032-035
- Notifications (e2e/specs/notifications/) - US-036-039
- User management (e2e/specs/users/) - US-040-045
- Settings (e2e/specs/settings/) - US-048-053
- Reports (e2e/specs/reports/) - US-057-059, US-090-091
- Bulk operations (e2e/specs/bulk/) - US-060-064
- Calendar (e2e/specs/calendar/) - US-071-073
- Timesheet (e2e/specs/timesheet/) - US-074-076

## Test Fixtures

### Authentication Fixtures (e2e/fixtures/auth.ts)

Predefined authenticated pages with different user roles:

```typescript
import { test } from "@playwright/test";

// Use pre-authenticated page as manager
test("some test", async ({ managerPage }) => {
  await managerPage.goto("/dashboard");
  // managerPage is already logged in
});

// Use pre-authenticated page as admin
test("admin test", async ({ adminPage }) => {
  // adminPage is logged in as admin
});

// Use pre-authenticated page as employee
test("employee test", async ({ employeePage }) => {
  // employeePage is logged in as employee
});
```

### Test Data (e2e/fixtures/test-data.ts)

Access test credentials and UI text constants:

```typescript
import {
  TEST_PROJECT,
  TEST_TASK,
  TEST_USERS,
  UI_TEXT,
} from "../fixtures/test-data";

// Test user accounts
console.log(TEST_USERS.admin.email); // admin@example.com
console.log(TEST_USERS.employee1.email); // employee1@example.com

// Test entities
console.log(TEST_PROJECT.name); // E2E Test Project
console.log(TEST_TASK.title); // E2E Test Task

// UI text in Persian/Farsi
console.log(UI_TEXT.buttons.login); // ورود
```

## Page Object Models

Page objects encapsulate element selectors and actions:

### LoginPage

```typescript
const loginPage = new LoginPage(page);
await loginPage.login(email, password);
await loginPage.expectRedirectToDashboard();
```

### DashboardPage

```typescript
const dashboard = new DashboardPage(page);
await dashboard.goto();
const stats = await dashboard.getTaskStats();
await dashboard.clickLogout();
```

### ProjectsPage

```typescript
const projects = new ProjectsPage(page);
await projects.goto();
await projects.clickNewProject();
await projects.fillProjectForm({ name, code, description });
```

### TasksPage

```typescript
const tasks = new TasksPage(page);
await tasks.goto();
await tasks.clickNewTask();
await tasks.gotoBoard();
await tasks.filterByStatus("todo");
```

## Helper Functions (e2e/utils/helpers.ts)

Reusable utility functions:

```typescript
import {
  createProject,
  createTask,
  getToastMessage,
  loginAs,
  selectOrganization,
  waitForApiCall,
} from "../utils/helpers";

// Login with credentials
await loginAs(page, "user@example.com", "password");

// Select organization
await selectOrganization(page, 0);

// Create task with options
await createTask(page, "My Task", {
  project: "Project Name",
  priority: "high",
  description: "Task description",
});

// Create project
await createProject(page, "My Project", {
  code: "PRJ",
  description: "Project description",
});

// Get toast message
const message = await getToastMessage(page);
```

## Storage State Authentication

Tests use Playwright storage state for faster execution. The `auth.setup.ts` runs once before tests to:

1. Login with test credentials
2. Select an organization
3. Save authentication state to `playwright/.auth/user.json`

Subsequent tests use this saved state to start already authenticated.

## Test Data

### Seed Data

Test users and organizations should be created as needed during test setup.

**Users:**

- Test users with different roles (admin, manager, supervisor, employee)
- Credentials defined in test fixtures

**Organizations:**

- Multiple test organizations with projects and tasks

### Test Isolation

Each test should:

1. Be independent and not rely on other tests
2. Create its own test data with timestamps to avoid conflicts
3. Clean up after itself when needed

## Writing New Tests

### Example Test File

```typescript
import { expect, test } from "@playwright/test";

import { TEST_USERS } from "../fixtures/test-data";
import { LoginPage } from "../pages/login.page";

test.describe("Feature - Description (US-XXX)", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto("/feature-url");
  });

  test("should do something", async ({ page }) => {
    // Arrange
    const element = page.locator('[data-testid="element"]');

    // Act
    await element.click();

    // Assert
    await expect(element).toHaveAttribute("aria-selected", "true");
  });

  test("should handle error case", async ({ page }) => {
    // Test error scenarios
    const input = page.getByLabel(/label/i);
    await input.fill("invalid input");

    // Should show error
    await expect(page.locator("text=/error message/i")).toBeVisible();
  });
});
```

### Best Practices

1. **Use role-based queries**: Prefer `getByRole()` over other selectors
2. **Use data-testid**: Add `data-testid` attributes for stable selectors
3. **Use Persian/Farsi text matchers**: Match localized UI text with regex
4. **Unique test data**: Use timestamps for test data to avoid conflicts
5. **Wait for elements**: Use `waitForURL()`, `waitForLoadState()`, `isVisible()` with timeouts
6. **Descriptive assertions**: Clear test names and assertion messages
7. **Page objects**: Encapsulate UI interactions in page objects
8. **Fixtures**: Use auth fixtures for pre-authenticated pages

## CI/CD Integration

Tests run on CI with:

- 1 worker (sequential execution)
- Retries on failure
- HTML report generation
- Screenshot and trace on failure

## Debugging

### View HTML Report

```bash
bun exec playwright show-report
```

### View Trace

Open `trace.zip` files in Playwright Inspector or use web viewer.

### Screenshots and Videos

Check `playwright-report/` directory for captured artifacts.

### Debug Console Output

Tests print debug information to console. Run with:

```bash
bun run test:e2e -- --verbose
```

## Known Issues & Limitations

- **US-003** (Password Reset): Email-based reset not implemented - uses settings panel only
- **US-028** (Time Entry Date): Date selection not available - uses current timestamp
- **US-064** (Bulk Delete Undo): Undo not implemented for bulk operations
- **US-066** (Delete Attachments): Cannot delete comment attachments after posting
- **US-078** (Help Search): Help search not yet implemented

See [user-stories.md](../docs/user-stories.md#implementation-notes) for full details.

## Contributing

When adding new tests:

1. Follow existing file structure and naming conventions
2. Group related tests with `test.describe()`
3. Use Page Object Models for UI interactions
4. Add meaningful test descriptions with user story IDs
5. Test both happy path and error cases
6. Update this README with new test locations

## Resources

- [Playwright Documentation](https://playwright.dev)
- [User Stories](../docs/user-stories.md)
- [Architecture Documentation](../docs/architecture/system-architecture.md)
