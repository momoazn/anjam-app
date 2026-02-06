import { rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const targets = [
  ".cache",
  ".playwright-cli",
  ".playwright-mcp",
  "dist",
  "output",
  "playwright/.auth",
  "playwright-report",
  "test-results",
  "vitest-coverage",
  "coverage",
];

for (const target of targets) {
  rmSync(join(root, target), { force: true, recursive: true });
}
