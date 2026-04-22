/**
 * Wait until the Compose Postgres service accepts connections (pg_isready).
 * @param {{ cwd?: string; maxAttempts?: number; intervalSec?: number; silent?: boolean }} opts
 */
const { execSync } = require("child_process");
const path = require("path");

const defaultRoot = path.join(__dirname, "..");

function sleepSync(seconds) {
  if (process.platform === "win32") {
    execSync(`powershell -NoProfile -Command "Start-Sleep -Seconds ${seconds}"`, { stdio: "ignore" });
  } else {
    execSync(`sleep ${seconds}`, { stdio: "ignore" });
  }
}

function pgReady(cwd) {
  try {
    execSync("docker compose exec -T db pg_isready -U reddirt -d reddirt", {
      stdio: "pipe",
      cwd,
      shell: true,
    });
    return true;
  } catch {
    return false;
  }
}

function waitForPostgres(opts = {}) {
  const cwd = opts.cwd ?? defaultRoot;
  const maxAttempts = opts.maxAttempts ?? 45;
  const intervalSec = opts.intervalSec ?? 2;
  const silent = opts.silent ?? false;

  if (!silent) process.stdout.write("Waiting for Postgres (pg_isready)");
  for (let i = 0; i < maxAttempts; i++) {
    if (pgReady(cwd)) {
      if (!silent) process.stdout.write(" — ready.\n");
      return true;
    }
    if (!silent) process.stdout.write(".");
    sleepSync(intervalSec);
  }
  if (!silent) process.stdout.write("\n");
  return false;
}

module.exports = { waitForPostgres, pgReady, sleepSync };
