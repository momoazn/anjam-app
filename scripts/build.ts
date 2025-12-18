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
const currentPlatform = args.has("--current-platform");
const shouldRun = args.has("--run");
const useLegacyNames = args.has("--legacy-names");

// Auto-detect current platform if flag is set
if (currentPlatform) {
  if (process.platform === "linux") {
    args.add("--skip-windows");
    args.add("--skip-mac");
  } else if (process.platform === "win32") {
    args.add("--skip-linux");
    args.add("--skip-mac");
  } else if (process.platform === "darwin") {
    args.add("--skip-linux");
    args.add("--skip-windows");
  }
}

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

function getTargets(): Target[] {
  const legacyNames = {
    linux: "task-manager",
    windows: "task-manager.exe",
    macos: "task-manager-macos",
    windowsZip: "task-manager-windows.zip",
  };

  const newNames = {
    linux: "anjam",
    windows: "anjam.exe",
    macos: "anjam-macos",
    windowsZip: "anjam-windows.zip",
  };

  const names = useLegacyNames ? legacyNames : newNames;

  return [
    {
      name: "linux",
      dir: "linux",
      output: names.linux,
      env: {
        GOOS: "linux",
        GOARCH: "amd64",
        CGO_ENABLED: "0",
      } as unknown as NodeJS.ProcessEnv,
    },
    {
      name: "windows",
      dir: "windows",
      output: names.windows,
      env: {
        GOOS: "windows",
        GOARCH: "amd64",
        CGO_ENABLED: "0",
      } as unknown as NodeJS.ProcessEnv,
    },
    {
      name: "macos",
      dir: "macos",
      output: names.macos,
      env: {
        GOOS: "darwin",
        GOARCH: "amd64",
        CGO_ENABLED: "0",
      } as unknown as NodeJS.ProcessEnv,
    },
  ];
}

const targets = getTargets();

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
  run("go", ["build", "-ldflags=-s -w", "-o", outputPath, "."], {
    env: target.env,
    cwd: path.join(process.cwd(), "backend"),
  });
  return outputPath;
}

function main() {
  prepareReleaseTree();

  if (!skipClient) {
    console.log("Building frontend (Vite)...");
    run("bun", ["x", "--bun", "vite", "build"]);
  }

  let builtBinaryPath: string | null = null;

  targets.forEach((target) => {
    if (shouldBuild(target.name)) {
      builtBinaryPath = buildTarget(target);
    }
  });

  if (!skipWindows && !skipZip) {
    console.log("Packaging Windows assets...");
    const windowsTarget = targets.find((t) => t.name === "windows");
    const zipName = useLegacyNames
      ? "task-manager-windows.zip"
      : "anjam-windows.zip";
    run("zip", [
      "-j",
      path.join(releaseDir, "windows", zipName),
      path.join(releaseDir, "windows", windowsTarget?.output || "anjam.exe"),
      runBat,
      runWithEnvBat,
    ]);
  }

  // Run the binary if --run flag is provided
  if (shouldRun && builtBinaryPath) {
    // For Windows, we need to handle the path differently
    if (process.platform === "win32") {
      // Use cmd /c to run the executable on Windows
      run("cmd", ["/c", builtBinaryPath]);
    } else {
      // On Unix-like systems, make the binary executable first
      run("chmod", ["+x", builtBinaryPath]);
      run(builtBinaryPath, []);
    }
  }
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
