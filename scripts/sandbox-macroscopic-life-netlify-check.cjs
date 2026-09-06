/**
 * Sandbox check that the Macroscopic Life slug will survive a Netlify-shaped Next build.
 * Does not print secrets. Exits non-zero if manuscripts or routes fail.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const wrapper = path.join(root, "scripts", "run-with-h-drive-env.cjs");

function run(args, extraEnv) {
  const result = spawnSync(process.execPath, [wrapper, ...args], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function assertExists(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error(`missing build artifact: ${rel}`);
    process.exit(1);
  }
}

console.log("sandbox: manuscript verify");
run(["node", path.join(root, "node_modules", "tsx", "dist", "cli.mjs"), "scripts/verify-macroscopic-life-manuscripts.ts"]);

console.log("sandbox: next build (Netlify-shaped slim trace)");
run(["npm", "run", "build"], {
  NETLIFY: "true",
  NEXT_TELEMETRY_DISABLED: "1",
});

const routes = [
  ".next/server/app/(macroscopic-life)/macroscopic-life/page.js",
  ".next/server/app/(macroscopic-life)/macroscopic-life/book/page.js",
  ".next/server/app/(macroscopic-life)/macroscopic-life/tests/page.js",
  ".next/server/app/(macroscopic-life)/macroscopic-life/figures/page.js",
  ".next/server/app/macroscopic-life.html",
  ".next/server/app/macroscopic-life/book.html",
  ".next/server/app/macroscopic-life/tests.html",
  ".next/server/app/macroscopic-life/figures.html",
];
for (const route of routes) assertExists(route);

console.log("sandbox: macroscopic-life Netlify-shaped build passed");
