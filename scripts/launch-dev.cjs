/**
 * Cross-platform one-step dev launcher (Node).
 * Prepares DB stack + Prisma, then starts Next.js dev server.
 *
 * Usage: npm run dev:full
 * Windows (native): scripts/dev.ps1
 * Unix: scripts/dev.sh
 */
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
process.chdir(root);

function hasEnvFile() {
  return fs.existsSync(path.join(root, ".env.local")) || fs.existsSync(path.join(root, ".env"));
}

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", shell: true, ...opts });
}

/** Prisma loads `.env`, but a machine-level DATABASE_URL overrides it — strip for subprocess so `.env` wins. */
function envForPrisma() {
  const env = { ...process.env };
  delete env.DATABASE_URL;
  return env;
}

console.log("\n\x1b[36mRed Dirt — dev launcher\x1b[0m\n");

if (!hasEnvFile()) {
  console.warn(
    "\x1b[33m⚠ No .env.local or .env found.\x1b[0m Copy .env.example → .env.local and set DATABASE_URL (and optional OPENAI_*).\n",
  );
} else {
  console.log("✓ Environment file present\n");
}

console.log("→ Docker Compose (database)…");
try {
  run("docker compose up -d");
  console.log("✓ Compose services up\n");
} catch {
  console.warn(
    "\x1b[33m⚠ docker compose failed — start Docker Desktop or run: npm run dev:db\x1b[0m\n",
  );
}

console.log("→ prisma generate…");
try {
  run("npx prisma generate", { env: envForPrisma() });
  console.log("✓ Prisma client generated\n");
} catch {
  console.error("\x1b[31m✗ prisma generate failed\x1b[0m\n");
  process.exit(1);
}

console.log("→ prisma migrate deploy…");
try {
  run("npx prisma migrate deploy", { env: envForPrisma() });
  console.log("✓ Migrations applied (deploy mode)\n");
} catch {
  console.warn(
    "\x1b[33m⚠ migrate deploy failed.\x1b[0m If this is a fresh dev DB, run once: npx prisma migrate dev\n",
  );
}

console.log("→ prisma db seed…");
try {
  run("npx prisma db seed", { env: envForPrisma() });
  console.log("✓ Seed finished\n");
} catch {
  console.warn("\x1b[33m⚠ prisma db seed failed (may be OK if DB unreachable)\x1b[0m\n");
}

console.log("→ Starting Next.js (Ctrl+C to stop)…\n");
const child = spawn("npx", ["next", "dev"], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
