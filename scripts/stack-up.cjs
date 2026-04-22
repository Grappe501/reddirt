/**
 * Bring up Docker Postgres + wait until ready + Prisma generate + migrate deploy.
 * Does NOT run `prisma db pull` (that re-introspects schema and is the wrong tool for "is DB up?").
 *
 * Usage (repo root): npm run stack:up
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { waitForPostgres } = require("./wait-for-postgres.cjs");

const root = path.join(__dirname, "..");
process.chdir(root);

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", shell: true, ...opts });
}

/** Prisma: let `.env` DATABASE_URL win over a machine-level env var. */
function envForPrisma() {
  const env = { ...process.env };
  delete env.DATABASE_URL;
  return env;
}

console.log("\n\x1b[36mRed Dirt — stack up\x1b[0m\n");

if (!fs.existsSync(path.join(root, ".env.local")) && !fs.existsSync(path.join(root, ".env"))) {
  console.warn(
    "\x1b[33m⚠ No .env or .env.local — copy .env.example to .env.local and set DATABASE_URL.\x1b[0m\n",
  );
}

console.log("→ docker compose up -d …");
console.log(
  "  (If nothing happens for a long time: start Docker Desktop and wait until the engine is running, then Ctrl+C and re-run.)\n",
);
try {
  run("docker compose up -d");
} catch (e) {
  console.error(
    "\x1b[31m✗ docker compose failed.\x1b[0m Start Docker Desktop, then run: npm run stack:up\n",
  );
  process.exit(1);
}

if (!waitForPostgres({ cwd: root })) {
  console.error(
    "\x1b[31m✗ Postgres did not become ready.\x1b[0m Is Docker Desktop running? Try: docker compose logs db --tail=80\n",
  );
  process.exit(1);
}

console.log("→ prisma generate …");
run("npx prisma generate", { env: envForPrisma() });

console.log("→ prisma migrate deploy …");
try {
  run("npx prisma migrate deploy", { env: envForPrisma() });
} catch {
  console.warn(
    "\x1b[33m⚠ migrate deploy failed.\x1b[0m On a fresh DB you may need once: npx prisma migrate dev\n",
  );
  process.exit(1);
}

console.log("\n\x1b[32m✓ Stack is up. DATABASE_URL should point at 127.0.0.1:5433 (see .env.example).\x1b[0m");
console.log("  Next: npm run dev   or   npm run dev:full\n");
