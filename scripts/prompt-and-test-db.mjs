/**
 * Interactive check: you paste DATABASE_URL in the terminal; we validate shape
 * and run Prisma against that URL (generate + migrate status + SELECT 1).
 *
 * Usage (from RedDirt): npm run test:db:prompt
 *   npm run test:db:prompt -- --skip-generate   # if Windows EPERM on prisma generate
 *
 * Does not write to disk — secrets stay in this shell session only.
 */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function run(label, command, args, extraEnv = {}) {
  console.log(`\n── ${label} ──\n`);
  const r = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...extraEnv },
    encoding: "utf-8",
    shell: true,
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status ?? 1;
}

/** Run and return combined output for error detection (e.g. Windows EPERM). */
function runCapture(command, args, extraEnv = {}) {
  const r = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...extraEnv },
    encoding: "utf-8",
    shell: true,
  });
  const combined = `${r.stdout || ""}${r.stderr || ""}`;
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return { status: r.status ?? 1, combined };
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  RedDirt — paste DATABASE_URL to test Postgres + Prisma locally  ║
║  (Supabase session-pooler URI is OK; no file is written.)        ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const rl = readline.createInterface({ input, output });

  let url = await rl.question(
    "DATABASE_URL (single line, postgresql:// or postgres://): "
  );
  url = url.trim();

  const alsoAdmin = await rl.question(
    "\nOptional — ADMIN_SECRET to verify it is set (press Enter to skip): "
  );

  rl.close();

  if (!url) {
    console.log("\nCancelled (empty DATABASE_URL).");
    process.exit(1);
  }

  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    console.error(
      "\nError: URL must start with postgresql:// or postgres://\n"
    );
    process.exit(1);
  }

  const userinfo = url.match(/^postgres(ql)?:\/\/([^@]+)@/)?.[2];
  if (userinfo && /[\[\]]/.test(userinfo)) {
    console.warn(
      "\nWarning: [brackets] in the user/password part usually mean a Supabase placeholder was left in — remove them unless they are literally in your password. Encode $ as %24 in the password if needed.\n"
    );
  }

  const envDb = { DATABASE_URL: url };
  const skipGenerate =
    process.argv.includes("--skip-generate") ||
    process.argv.includes("--no-generate");

  if (skipGenerate) {
    console.log("\n── skipping prisma generate (--skip-generate) ──\n");
  } else {
    console.log(`\n── prisma generate ──\n`);
    const gen = runCapture("npx", ["prisma", "generate"], envDb);
    if (gen.status !== 0) {
      const isLock =
        /EPERM|operation not permitted|EACCES/i.test(gen.combined) &&
        /rename|query_engine/i.test(gen.combined);
      if (isLock) {
        console.log(`
⚠ prisma generate could not replace query_engine-windows.dll.node (file lock — common on Windows).
  Continuing with your existing generated client. Retry later after closing:
  Next.js dev, Prisma Studio, other Node terminals, or run:
    npm run test:db:prompt -- --skip-generate
`);
      } else {
        process.exit(gen.status);
      }
    }
  }

  let code = 0;
  let pendingMigrations = false;

  console.log(`\n── prisma migrate status ──\n`);
  const st = runCapture("npx", ["prisma", "migrate", "status"], envDb);
  pendingMigrations = /Following migrations have not yet been applied/i.test(
    st.combined
  );
  const unreachable = /P1001|P1000|P1017|Can't reach database server|Authentication failed/i.test(
    st.combined
  );

  if (st.status !== 0 && unreachable) {
    console.log(
      "\n(Connection/auth failed — fix DATABASE_URL, resume Supabase if paused, check password encoding.)\n"
    );
    process.exit(st.status);
  }

  if (st.status !== 0 && pendingMigrations) {
    console.log(`
✓ Database is reachable. Migrations are not applied on this server yet (expected on a fresh Supabase DB).
  Apply once with:  npx prisma migrate deploy
  (Netlify production build runs migrate deploy for you.)
`);
  } else if (st.status !== 0) {
    console.log(
      "\n⚠ migrate status exited non-zero; check output above. Trying SELECT 1 anyway…\n"
    );
  }

  console.log("\n── prisma db execute (SELECT 1) ──\n");
  const exec = spawnSync(
    "npx",
    ["prisma", "db", "execute", "--stdin", "--schema", "prisma/schema.prisma"],
    {
      cwd: root,
      env: { ...process.env, ...envDb },
      input: "SELECT 1;",
      encoding: "utf-8",
      shell: true,
    }
  );
  if (exec.stdout) process.stdout.write(exec.stdout);
  if (exec.stderr) process.stderr.write(exec.stderr);
  code = exec.status ?? 1;
  if (code !== 0) {
    console.log("\n(If db execute is unsupported, migrate status above is still the main check.)\n");
  }

  if (alsoAdmin.trim()) {
    if (alsoAdmin.length < 8) {
      console.log("\nNote: ADMIN_SECRET looks very short — double-check.\n");
    } else {
      console.log(
        "\nADMIN_SECRET: received (length ok); not sent anywhere from this script.\n"
      );
    }
  }

  if (code === 0) {
    if (pendingMigrations) {
      console.log(`
✓ DATABASE_URL works (SELECT 1 OK). Run migrate deploy on this DB when ready:
    npx prisma migrate deploy
`);
    } else {
      console.log(`
✓ DATABASE_URL works with Prisma from this machine.
  If Netlify still fails, compare this exact string (after trimming) with
  the value in Netlify → Environment variables (no extra quotes/spaces).
`);
    }
  }

  process.exit(code);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
