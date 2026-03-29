import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const port = process.env.ELECTRON_DEV_PORT || "3000";
const url = process.env.ELECTRON_START_URL || `http://127.0.0.1:${port}`;
const isWin = process.platform === "win32";

function resolveBin(name) {
  const suffix = isWin ? ".cmd" : "";
  const candidate = path.join(root, "node_modules", ".bin", `${name}${suffix}`);
  if (!existsSync(candidate)) {
    throw new Error(`Missing local binary: ${candidate}. Run npm install first.`);
  }
  return candidate;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(target, attempts = 120) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(target);
      if (response.ok) return;
    } catch {
      // retry
    }
    await wait(1000);
  }
  throw new Error(`Next dev server did not start in time: ${target}`);
}

const nextBin = resolveBin("next");
const electronBin = resolveBin("electron");

const nextDev = spawn(nextBin, ["dev", "-p", String(port)], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env }
});

let electronApp;

try {
  await waitForServer(url);

  electronApp = spawn(electronBin, [path.join(root, "electron", "main.cjs")], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      ELECTRON_START_URL: url,
      ELECTRON_DEV_PORT: String(port)
    }
  });

  await once(electronApp, "exit");
} finally {
  if (electronApp && !electronApp.killed) {
    electronApp.kill("SIGTERM");
  }
  if (!nextDev.killed) {
    nextDev.kill("SIGTERM");
  }
}
