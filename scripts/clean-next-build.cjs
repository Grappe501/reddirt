/**
 * Remove `.next` before production build. Prevents ENOENT / PageNotFoundError when
 * `next dev` and `next build` share the same output directory.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const nextDir = path.join(process.cwd(), ".next");
if (!fs.existsSync(nextDir)) return;

function rmNext() {
  fs.rmSync(nextDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

try {
  rmNext();
} catch {
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Remove-Item -LiteralPath '${nextDir.replace(/'/g, "''")}' -Recurse -Force -ErrorAction Stop"`,
      { stdio: "inherit" },
    );
  } else {
    throw new Error("Failed to remove .next; stop `next dev` and retry.");
  }
}
console.log("[build:clean] removed .next");
