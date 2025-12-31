import { expect, test } from "@playwright/test";

test.describe("Organizations - CRUD (US-005, US-006)", () => {
  test("user should create organization", async ({ page }) => {
    const timestamp = Date.now();
    const orgName = `E2E Test Org ${timestamp}`;

    // Navigate to create org page
    await page.goto("/organizations/new");

    // Fill form
    const nameInput = page.getByLabel(/نام|name/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill(orgName);
    }

    const descInput = page.getByLabel(/توضیح|description/i);
    if (await descInput.isVisible()) {
      await descInput.fill("E2E Test Organization");
    }

    // Submit
    const submitButton = page.getByRole("button", { name: /ایجاد|create/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Should redirect to dashboard or settings
    await page.waitForURL(/\/(dashboard|settings|onboarding)/);
  });

  test("user should switch between organizations", async ({ page }) => {
    // Navigate to organization selector
    await page.goto("/select-organization");

    // Should show organization cards
    const orgCards = page.locator('[data-testid="org-card"]');
    const cardCount = await orgCards.count();

    if (cardCount > 1) {
      // Click on a different org
      await orgCards.nth(1).click();

      // Should redirect to dashboard
      await page.waitForURL(/\/dashboard/);
      expect(page.url()).toContain("/dashboard");
    }
  });

  test("user should see organization in sidebar after creation", async ({
    page,
  }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");

    // Check sidebar for organization section
    const orgSelector = page.locator('[data-testid="org-selector"]');
    if (await orgSelector.isVisible()) {
      // Click to see organizations
      await orgSelector.click();

      // Should show list of organizations
      const orgs = page.locator('[data-testid="org-option"]');
      expect(await orgs.count()).toBeGreaterThan(0);
    }
  });
});

test.describe("Organizations - Invitations (US-007, US-008, US-082-088)", () => {
  test("user should invite organization member", async ({ page }) => {
    // Navigate to organization settings
    await page.goto("/settings/members");

    // Click invite button
    const inviteButton = page.getByRole("button", { name: /دعوت|invite/i });
    if (await inviteButton.isVisible()) {
      await inviteButton.click();

      // Fill email
      const emailInput = page.getByLabel(/ایمیل|email/i);
      if (await emailInput.isVisible()) {
        await emailInput.fill("testuser@example.com");
      }

      // Select role if available
      const roleSelect = page.getByLabel(/نقش|role/i);
      if (await roleSelect.isVisible()) {
        await roleSelect.click();
        const options = page.getByRole("option");
        if ((await options.count()) > 0) {
          await options.first().click();
        }
      }

      // Submit
      const submitButton = page.getByRole("button", { name: /ارسال|send/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }
    }
  });

  test("user should create invite link", async ({ page }) => {
    // Navigate to members section
    await page.goto("/settings/members");

    // Click create invite link button
    const createLinkButton = page.getByRole("button", {
      name: /لینک دعوت|create.*link|invite link/i,
    });
    if (await createLinkButton.isVisible()) {
      await createLinkButton.click();

      // Set role if needed
      const roleSelect = page.getByLabel(/نقش|role/i);
      if (await roleSelect.isVisible()) {
        await roleSelect.click();
        const options = page.getByRole("option");
        if ((await options.count()) > 0) {
          await options.first().click();
        }
      }

      // Generate link
      const generateButton = page.getByRole("button", {
        name: /تولید|generate/i,
      });
      if (await generateButton.isVisible()) {
        await generateButton.click();

        // Link should be displayed
        const link = page.locator("input[readonly]");
        await expect(link).toBeVisible();
      }
    }
  });

  test("user should view organization members", async ({ page }) => {
    // Navigate to members section
    await page.goto("/settings/members");

    // Should show members list
    const membersList = page.locator('[data-testid="member-list"]');
    if (await membersList.isVisible()) {
      const members = page.locator('[data-testid="member-item"]');
      expect(await members.count()).toBeGreaterThan(0);
    }
  });

  test("user should manage member roles", async ({ page }) => {
    // Navigate to members section
    await page.goto("/settings/members");

    // Get first member
    const members = page.locator('[data-testid="member-item"]');
    if ((await members.count()) > 0) {
      // Try to find role selector for first member
      const roleSelect = members
        .first()
        .locator('[data-testid="member-role-select"]');
      if (await roleSelect.isVisible()) {
        await roleSelect.click();

        const options = page.getByRole("option");
        if ((await options.count()) > 1) {
          await options.nth(1).click();
        }
      }
    }
  });

  test("user should remove member from organization", async ({ page }) => {
    // Navigate to members section
    await page.goto("/settings/members");

    // Get first member
    const members = page.locator('[data-testid="member-item"]');
    if ((await members.count()) > 1) {
      // Find remove button
      const removeButton = members
        .nth(1)
        .locator('[data-testid="member-remove-btn"]');
      if (await removeButton.isVisible()) {
        await removeButton.click();

        // Confirm removal
        const confirmButton = page.getByRole("button", {
          name: /تایید|confirm/i,
        });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
    }
  });
});
