import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const releaseDir = path.resolve(process.cwd(), "release");
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const devScriptsPath = path.resolve(scriptDir, "dev");
const runBat = path.join(devScriptsPath, "run.bat");
const runWithEnvBat = path.join(devScriptsPath, "run-with-env.bat");

const args = new Set(process.argv.slice(2));
const skipClient = args.has("--skip-client");
const skipLinux = args.has("--skip-linux");
const skipWindows = args.has("--skip-windows");
const skipMac = args.has("--skip-mac");
const skipZip = args.has("--skip-zip");

type Target = {
  name: "linux" | "windows" | "macos";
  dir: string;
  output: string;
  env: NodeJS.ProcessEnv;
};

const targets: Target[] = [
  {
    name: "linux",
    dir: "linux",
    output: "task-manager",
    env: {
      GOOS: "linux",
      GOARCH: "amd64",
      CGO_ENABLED: "0",
    } as unknown as NodeJS.ProcessEnv,
  },
  {
    name: "windows",
    dir: "windows",
    output: "task-manager.exe",
    env: {
      GOOS: "windows",
      GOARCH: "amd64",
      CGO_ENABLED: "0",
    } as unknown as NodeJS.ProcessEnv,
  },
  {
    name: "macos",
    dir: "macos",
    output: "task-manager-macos",
    env: {
      GOOS: "darwin",
      GOARCH: "amd64",
      CGO_ENABLED: "0",
    } as unknown as NodeJS.ProcessEnv,
  },
];

function run(
  command: string,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    env: { ...process.env, ...options.env },
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with code ${result.status}`,
    );
  }
}

function prepareReleaseTree() {
  rmSync(releaseDir, { force: true, recursive: true });
  mkdirSync(releaseDir, { recursive: true });
  targets.forEach((target) => {
    mkdirSync(path.join(releaseDir, target.dir), { recursive: true });
  });
}

function shouldBuild(targetName: Target["name"]) {
  if (targetName === "linux") return !skipLinux;
  if (targetName === "windows") return !skipWindows;
  if (targetName === "macos") return !skipMac;
  return true;
}

function buildTarget(target: Target) {
  console.log(`Building ${target.name} backend...`);
  const outputPath = path.join(releaseDir, target.dir, target.output);
  run("go", ["-ldflags=-s -w", "-o", outputPath, "./backend"], {
    env: target.env,
  });
}

function main() {
  prepareReleaseTree();

  if (!skipClient) {
    console.log("Building frontend (Vite)...");
    run("bun", ["x", "--bun", "vite", "build"]);
  }

  targets.forEach((target) => {
    if (shouldBuild(target.name)) {
      buildTarget(target);
    }
  });

  if (!skipWindows && !skipZip) {
    console.log("Packaging Windows assets...");
    run("zip", [
      "-j",
      path.join(releaseDir, "windows", "task-manager-windows.zip"),
      path.join(releaseDir, "windows", "task-manager.exe"),
      runBat,
      runWithEnvBat,
    ]);
  }
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
