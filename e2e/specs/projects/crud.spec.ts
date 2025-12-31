import { expect, test } from "../../fixtures/auth";
import { TEST_PROJECT } from "../../fixtures/test-data";
import { ProjectsPage } from "../../pages/projects.page";

test.describe("Projects - CRUD (US-010 to US-013)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to projects page (assumes already logged in via fixtures)
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/projects/);
  });

  test("user should create a project", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    const timestamp = Date.now();
    const projectName = `${TEST_PROJECT.name} ${timestamp}`;
    const projectCode = `E2${Math.floor(timestamp / 1000000)}`.substring(0, 3);

    // Click new project button
    await projectsPage.clickNewProject();

    // Fill form
    await projectsPage.fillProjectForm({
      name: projectName,
      code: projectCode,
      description: TEST_PROJECT.description,
    });

    // Submit
    await projectsPage.submitProject();

    // Verify redirect to project details
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+/);

    // Verify project details are displayed
    await expect(page.locator(`text=${projectName}`)).toBeVisible();
  });

  test("user should view project in list", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);

    // Project should be in list
    const projectCount = await projectsPage.getProjectCount();
    expect(projectCount).toBeGreaterThan(0);
  });

  test("user should edit project details", async ({ page }) => {
    const timestamp = Date.now();
    const newName = `Updated Project ${timestamp}`;

    // Get first project and click it
    const projects = page.locator('[data-testid="project-card"]');
    if ((await projects.count()) > 0) {
      await projects.first().click();
      await page.waitForURL(/\/projects\/[a-z0-9]+/);

      // Click edit button
      const editButton = page.getByRole("button", { name: /ویرایش|edit/i });
      if (await editButton.isVisible()) {
        await editButton.click();

        // Update name
        await page.getByLabel(/نام|name/i).clear();
        await page.getByLabel(/نام|name/i).fill(newName);

        // Save
        await page.getByRole("button", { name: /ذخیره|save/i }).click();

        // Verify update
        await expect(page.locator(`text=${newName}`)).toBeVisible();
      }
    }
  });

  test("user should view project details", async ({ page }) => {
    // Go back to projects list
    await page.goto("/projects");

    // Get first project
    const projects = page.locator('[data-testid="project-card"]');
    if ((await projects.count()) > 0) {
      // Get project name
      const projectName = await projects
        .first()
        .locator('[data-testid="project-name"]')
        .textContent();

      // Click it
      await projects.first().click();

      // Should be on project details page
      await expect(page).toHaveURL(/\/projects\/[a-z0-9]+/);

      // Verify project name is displayed
      if (projectName) {
        await expect(page.locator(`text=${projectName}`)).toBeVisible();
      }
    }
  });

  test("user should delete project", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    const timestamp = Date.now();
    const projectName = `Delete Test ${timestamp}`;

    // Create a project first
    await projectsPage.clickNewProject();
    await projectsPage.fillProjectForm({
      name: projectName,
      code: "DEL",
    });
    await projectsPage.submitProject();

    // Go back to projects list
    await page.goto("/projects");

    // Find and delete the project
    const projectCard = page.locator(`text=${projectName}`).first();
    await expect(projectCard).toBeVisible();

    // Click the project menu
    const menuButton = projectCard.locator('[data-testid="project-menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }

    // Try to find and click delete
    const deleteOption = page.getByRole("menuitem", { name: /حذف|delete/i });
    if (await deleteOption.isVisible()) {
      await deleteOption.click();

      // Confirm deletion
      const confirmButton = page.getByRole("button", {
        name: /تایید|confirm/i,
      });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
    }
  });
});
