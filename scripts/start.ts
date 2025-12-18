import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const releaseDir = path.resolve(process.cwd(), "release");

function getBinaryPathForPlatform(): string {
  const platform = process.platform;

  if (platform === "linux") {
    return path.join(releaseDir, "linux", "anjam");
  } else if (platform === "win32") {
    return path.join(releaseDir, "windows", "anjam.exe");
  } else if (platform === "darwin") {
    return path.join(releaseDir, "macos", "anjam-macos");
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

function runBinary(binaryPath: string) {
  console.log(`Starting binary: ${binaryPath}`);

  // Check if binary exists
  if (!fs.existsSync(binaryPath)) {
    throw new Error(
      `Binary not found at ${binaryPath}. Please run 'bun run build' first.`,
    );
  }

  // For Windows, we need to handle the path differently
  if (process.platform === "win32") {
    // Use cmd /c to run the executable on Windows
    const child = spawn("cmd", ["/c", binaryPath], {
      stdio: "inherit",
      shell: true,
    });

    child.on("error", (err) => {
      console.error(`Failed to start binary: ${err.message}`);
      process.exit(1);
    });

    child.on("exit", (code) => {
      process.exit(code || 0);
    });
  } else {
    // On Unix-like systems, make the binary executable first
    try {
      fs.chmodSync(binaryPath, 0o755);
    } catch {
      // Ignore chmod errors, the binary might already be executable
    }

    const child = spawn(binaryPath, [], {
      stdio: "inherit",
      shell: false,
    });

    child.on("error", (err) => {
      console.error(`Failed to start binary: ${err.message}`);
      process.exit(1);
    });

    child.on("exit", (code) => {
      process.exit(code || 0);
    });
  }
}

try {
  const binaryPath = getBinaryPathForPlatform();
  runBinary(binaryPath);
} catch (err: unknown) {
  console.error((err as Error).message);
  process.exit(1);
}
