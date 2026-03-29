import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const isWin = process.platform === "win32";
const buildOnly = process.argv.includes("--build-only");

function resolveBin(name) {
  const suffix = isWin ? ".cmd" : "";
  const candidate = path.join(root, "node_modules", ".bin", `${name}${suffix}`);
  if (!existsSync(candidate)) {
    throw new Error(`Missing local binary: ${candidate}. Run npm install first.`);
  }
  return candidate;
}

function run(bin, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, ...env }
    });

    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${bin} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

const nextBin = resolveBin("next");
await run(nextBin, ["build"], { BUILD_DESKTOP: "true" });

if (!buildOnly) {
  const builderBin = resolveBin("electron-builder");
  await run(builderBin, ["-c", "electron/builder.json"]);
}
