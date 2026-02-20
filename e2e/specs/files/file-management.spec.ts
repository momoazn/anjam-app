import { test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Files", () => {
  test("project workspace remains accessible for file workflows", async ({
    page,
  }) => {
    await page.goto("/projects");
    await expectPageReady(page, /\/projects/, '[data-testid="projects-page"]');
  });

  test.skip("direct file upload flow", async () => {
    // File upload UI is not implemented in current product mode.
  });
});
