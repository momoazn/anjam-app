import { Page } from "@playwright/test";

/**
 * Login helper for tests
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder(/ایمیل|email/i).fill(email);
  await page.getByPlaceholder(/رمز عبور|password/i).fill(password);
  await page.getByRole("button", { name: /ورود|login/i }).click();

  // Wait for navigation
  await page.waitForURL(/\/(dashboard|select-organization|onboarding)/);
}

/**
 * Select organization helper
 */
export async function selectOrganization(page: Page, orgIndex: number = 0) {
  const orgCards = page
    .locator('[role="button"]')
    .filter({ has: page.locator("text=/[A-Z]{3}/") });
  const count = await orgCards.count();

  if (count > orgIndex) {
    await orgCards.nth(orgIndex).click();
    await page.waitForURL(/\/dashboard/);
  }
}

/**
 * Wait for element to be ready for interaction
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 5000,
) {
  await page.waitForSelector(selector, { timeout });
  return page.locator(selector);
}

/**
 * Create a task with given parameters
 */
export async function createTask(
  page: Page,
  title: string,
  options?: { project?: string; priority?: string; description?: string },
) {
  // Open new task dialog
  const newTaskBtn = page.getByRole("button", { name: /تسک جدید|new task/i });
  if (await newTaskBtn.isVisible()) {
    await newTaskBtn.click();
  }

  // Fill title
  const titleInput = page.getByLabel(/عنوان|title/i);
  if (await titleInput.isVisible()) {
    await titleInput.fill(title);
  }

  // Fill description if provided
  if (options?.description) {
    const descInput = page.getByLabel(/توضیح|description/i);
    if (await descInput.isVisible()) {
      await descInput.fill(options.description);
    }
  }

  // Select project if provided
  if (options?.project) {
    const projectSelect = page.getByLabel(/پروژه|project/i);
    if (await projectSelect.isVisible()) {
      await projectSelect.click();
      await page.getByRole("option", { name: options.project }).click();
    }
  }

  // Select priority if provided
  if (options?.priority) {
    const prioritySelect = page.getByLabel(/اولویت|priority/i);
    if (await prioritySelect.isVisible()) {
      await prioritySelect.click();
      await page.getByRole("option", { name: options.priority }).click();
    }
  }

  // Submit
  const submitBtn = page.getByRole("button", { name: /ایجاد|create/i });
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
  }

  return title;
}

/**
 * Create a project with given parameters
 */
export async function createProject(
  page: Page,
  name: string,
  options?: { code?: string; description?: string },
) {
  // Navigate to projects
  await page.goto("/projects");

  // Open new project dialog
  const newProjectBtn = page.getByRole("button", {
    name: /پروژه جدید|new project/i,
  });
  if (await newProjectBtn.isVisible()) {
    await newProjectBtn.click();
  }

  // Fill name
  const nameInput = page.getByLabel(/نام|name/i);
  if (await nameInput.isVisible()) {
    await nameInput.fill(name);
  }

  // Fill code if provided
  if (options?.code) {
    const codeInput = page.getByLabel(/کد|code/i);
    if (await codeInput.isVisible()) {
      await codeInput.fill(options.code);
    }
  }

  // Fill description if provided
  if (options?.description) {
    const descInput = page.getByLabel(/توضیح|description/i);
    if (await descInput.isVisible()) {
      await descInput.fill(options.description);
    }
  }

  // Submit
  const submitBtn = page.getByRole("button", { name: /ایجاد|create/i });
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
  }

  // Wait for navigation to project details
  await page.waitForURL(/\/projects\/[a-z0-9]+/);

  return name;
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(
  page: Page,
  selector: string,
): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }, selector);
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Wait for API response
 */
export async function waitForApiCall(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse((response) => {
    if (typeof urlPattern === "string") {
      return response.url().includes(urlPattern);
    }
    return urlPattern.test(response.url());
  });
}

/**
 * Get toast notification message
 */
export async function getToastMessage(page: Page): Promise<string | null> {
  const toast = page.locator('[data-testid="toast"]');
  if (await toast.isVisible({ timeout: 2000 })) {
    return await toast.textContent();
  }
  return null;
}

/**
 * Dismiss toast notification
 */
export async function dismissToast(page: Page) {
  const closeBtn = page.locator('[data-testid="toast-close"]');
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  }
}
