# Testing Guide

This document describes the testing setup and guidelines for the task manager application.

## Test Stack

- **Unit/Integration Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Code Coverage**: Vitest Coverage (v8)

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests in watch mode
bun run test

# Run all tests once
bun run test:run

# Run tests with UI
bun run test:ui

# Generate coverage report
bun run test:coverage
```

### End-to-End Tests

```bash
# Run E2E tests
bun run test:e2e

# Run E2E tests with UI
bun run test:e2e:ui

# Debug E2E tests
bun run test:e2e:debug
```

### Run All Tests

```bash
# Run both unit and E2E tests
bun run test:all
```

## Test Coverage

Current test coverage includes:

### Utility Functions ✅

- **utils.ts**: Class name utilities, user initials, user name formatting (19 tests)
- **permissions.ts**: Role-based access control, permission checks (41 tests)
- **time-utils.ts**: Time formatting and parsing utilities (37 tests)

### UI Components ✅

- **badge.tsx**: Badge component variants and rendering (8 tests)

### E2E Tests ✅

- **auth.spec.ts**: Authentication flow and protected routes

**Total**: 105 unit tests passing

## Coverage Goals

- **Target**: 60%+ for lines, functions, branches, and statements
- **Current Focus**: Business logic in `src/lib/*` and critical components

## Writing Tests

### Unit Tests

Unit tests should be co-located with the file they test:

```
src/lib/utils.ts
src/lib/utils.test.ts
```

Example test structure:

```typescript
import { describe, it, expect } from "vitest";
import { functionToTest } from "./module";

describe("functionName", () => {
  it("should handle normal case", () => {
    expect(functionToTest("input")).toBe("output");
  });

  it("should handle edge case", () => {
    expect(functionToTest(null)).toBe("default");
  });
});
```

### Component Tests

Component tests use React Testing Library:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from './component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### E2E Tests

E2E tests are located in the `/e2e` directory:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature", () => {
  test("should perform user action", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /click me/i }).click();
    await expect(page).toHaveURL(/\/success/);
  });
});
```

## Test Helpers

### Test Utilities

Use the custom render function for components that need providers:

```typescript
import { render, screen } from '@/test/test-utils';

// This includes QueryClient and Router providers
render(<YourComponent />);
```

### Mock Data

Use the mock data factories for consistent test data:

```typescript
import { createMockUser, createMockTask, mockUsers } from "@/test/mock-data";

const user = createMockUser({ role: "admin" });
const task = createMockTask({ assignee: user.id });
```

## Best Practices

1. **Test Behavior, Not Implementation**

   - Focus on what the component does, not how it does it
   - Avoid testing internal state or implementation details

2. **Use Descriptive Test Names**

   ```typescript
   // Good
   it("should show error message when username is empty", () => {});

   // Bad
   it("validates input", () => {});
   ```

3. **Arrange, Act, Assert Pattern**

   ```typescript
   it("should format user name correctly", () => {
     // Arrange
     const firstName = "John";
     const lastName = "Doe";

     // Act
     const result = formatUserName(firstName, lastName);

     // Assert
     expect(result).toBe("John Doe");
   });
   ```

4. **Test Edge Cases**

   - Null/undefined values
   - Empty strings/arrays
   - Boundary conditions
   - Error states

5. **Keep Tests Isolated**

   - Each test should be independent
   - Don't rely on test execution order
   - Clean up after each test (handled automatically by `afterEach`)

6. **Mock External Dependencies**
   - Use `vi.mock()` for module mocks
   - Mock API calls and external services
   - Keep mocks close to the test

## Coverage Reports

After running `bun run test:coverage`, view the HTML report:

```bash
# Coverage reports are generated in ./coverage
open coverage/index.html
```

Coverage thresholds are configured in `vitest.config.ts`:

- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

## Continuous Integration

Tests should run in CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    bun install
    bun run test:run
    bun run test:coverage
```

## Debugging Tests

### Debugging Unit Tests

```bash
# Run specific test file
bun run test src/lib/utils.test.ts

# Run tests matching pattern
bun run test -t "should handle edge case"

# Run with UI for debugging
bun run test:ui
```

### Debugging E2E Tests

```bash
# Debug mode (opens browser with DevTools)
bun run test:e2e:debug

# Run specific test file
bun run test:e2e e2e/auth.spec.ts

# Run headed mode
bunx playwright test --headed
```

## Future Improvements

- [ ] Increase coverage to 80%+
- [ ] Add visual regression testing
- [ ] Add API integration tests
- [ ] Add performance testing
- [ ] Set up mutation testing
- [ ] Add accessibility testing with axe-core

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
