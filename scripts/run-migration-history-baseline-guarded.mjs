/**
 * Guarded migration-history baseline runner.
 * Default: --dry-run only (safe). --execute requires env gates; mutates DATABASE_URL target (production if that URL is production).
 * Cursor agents: run --dry-run only.
 * REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0
 * HOTFIX: REDDIRT-MIGRATION-HISTORY-GUARDED-POOLER-REF-PARSE-FIX-1.0 — same ref parse as production preflight (postgres.<ref> userinfo).
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0";
const PACKET = path.join(ROOT, "data/migration-history-baseline-execution-packet.json");
const COMMANDS = path.join(ROOT, "data/migration-history-baseline-command-list.json");
const PREFLIGHT = path.join(ROOT, "data/migration-history-production-preflight.json");
const GUARDED_OUT = path.join(ROOT, "data/migration-history-baseline-guarded-dry-run.json");
const APPROVAL = "STEVE_APPROVES_REDDIRT_MIGRATION_HISTORY_BASELINE_EXECUTION";
const REQUIRED_REF = "giozeoqulfojhxpywjil";

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Supabase project ref from DATABASE_URL without logging secrets.
 * (1) userinfo postgres.<ref> before @ (pooler) (2) host db.<ref>.supabase.co
 * @returns {{ ref: string | null, hint: string | null }}
 */
function extractSupabaseRef(url) {
  if (!url || typeof url !== "string") return { ref: null, hint: null };
  const u = url.trim();

  const authMatch = u.match(/^postgres(?:ql)?:\/\/([^/?#]*)@/i);
  if (authMatch) {
    const userinfo = authMatch[1];
    const colonIdx = userinfo.indexOf(":");
    const userPartRaw = colonIdx === -1 ? userinfo : userinfo.slice(0, colonIdx);
    let userPart = userPartRaw;
    try {
      userPart = decodeURIComponent(userPartRaw);
    } catch {
      /* keep raw */
    }
    const poolerUser = userPart.match(/^postgres\.([a-z0-9]{15,25})$/i);
    if (poolerUser) return { ref: poolerUser[1].toLowerCase(), hint: "username_postgres_dot_ref" };
  }

  const hostMatch = u.match(/db\.([a-z0-9]{15,25})\.supabase\.co/i);
  if (hostMatch) return { ref: hostMatch[1].toLowerCase(), hint: "host_db_dot_ref" };

  return { ref: null, hint: null };
}

function listMigrationsFromDisk() {
  const dir = path.join(ROOT, "prisma/migrations");
  return fs
    .readdirSync(dir)
    .filter((n) => fs.statSync(path.join(dir, n)).isDirectory() && fs.existsSync(path.join(dir, n, "migration.sql")))
    .sort();
}

function runResolve(name, url) {
  return spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", "migrate", "resolve", "--applied", name], {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: process.env.DIRECT_URL || url, PRISMA_DISABLE_WARNINGS: "1" },
  });
}

function main() {
  const argv = process.argv.slice(2);
  const wantsExecute = argv.includes("--execute") && !argv.includes("--dry-run");
  const generatedAt = new Date().toISOString();

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log("Usage:");
    console.log("  node scripts/run-migration-history-baseline-guarded.mjs           # dry-run (default)");
    console.log("  node scripts/run-migration-history-baseline-guarded.mjs --dry-run");
    console.log("  node scripts/run-migration-history-baseline-guarded.mjs --execute  # operator only; mutates DATABASE_URL DB");
    process.exit(0);
  }

  const packet = loadJson(PACKET);
  const cmds = loadJson(COMMANDS);
  const preflight = loadJson(PREFLIGHT);
  const guardedSource = fs.readFileSync(path.join(ROOT, "scripts/run-migration-history-baseline-guarded.mjs"), "utf8");
  const phraseOk = guardedSource.includes(APPROVAL);

  const base = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: wantsExecute ? "execute_gated" : "dry_run",
    productionMutationAttempted: false,
    secretsPrinted: false,
    packetPresent: !!packet,
    commandListPresent: !!(cmds?.commands?.length),
    preflightPresent: !!preflight,
    preflightReady: preflight?.readyForManualBaselineReview === true,
    approvalPhraseInSource: phraseOk,
    violations: [],
  };

  if (!wantsExecute) {
    const body = {
      ...base,
      outcome: "dry_run_complete",
      message:
        "Dry-run only: no migrate resolve/deploy executed. Operator uses --execute only after all env gates + Steve approval.",
    };
    fs.writeFileSync(GUARDED_OUT, JSON.stringify(body, null, 2), "utf8");
    console.log("=== run-migration-history-baseline-guarded.mjs — DRY-RUN ===");
    console.log("No prisma migrate resolve/deploy was spawned.");
    console.log("Report:", path.relative(ROOT, GUARDED_OUT));
    process.exit(0);
  }

  const v = [];
  if (process.env.REDDIRT_MIGRATION_HISTORY_BASELINE_APPROVED !== APPROVAL) v.push("REDDIRT_MIGRATION_HISTORY_BASELINE_APPROVED mismatch");
  for (const [k, val] of [
    ["REDDIRT_BACKUP_PITR_CONFIRMED", process.env.REDDIRT_BACKUP_PITR_CONFIRMED],
    ["REDDIRT_CORRECT_PRODUCTION_DB_CONFIRMED", process.env.REDDIRT_CORRECT_PRODUCTION_DB_CONFIRMED],
    ["REDDIRT_MAINTENANCE_WINDOW_CONFIRMED", process.env.REDDIRT_MAINTENANCE_WINDOW_CONFIRMED],
    ["REDDIRT_POST_ADDITIVE_SCHEMA_CONFIRMED", process.env.REDDIRT_POST_ADDITIVE_SCHEMA_CONFIRMED],
    ["REDDIRT_ACKNOWLEDGE_MIGRATION_HISTORY_WRITE", process.env.REDDIRT_ACKNOWLEDGE_MIGRATION_HISTORY_WRITE],
    ["REDDIRT_ACKNOWLEDGE_NO_DDL_EXECUTION", process.env.REDDIRT_ACKNOWLEDGE_NO_DDL_EXECUTION],
    ["REDDIRT_ACKNOWLEDGE_NETLIFY_SEPARATE", process.env.REDDIRT_ACKNOWLEDGE_NETLIFY_SEPARATE],
    ["REDDIRT_ACKNOWLEDGE_LIVE_SEND_BLOCKED", process.env.REDDIRT_ACKNOWLEDGE_LIVE_SEND_BLOCKED],
  ]) {
    if (val !== "YES") v.push(`${k} must be YES`);
  }

  if (!packet || packet.productionExecutionApprovedByThisPacket === true) v.push("packet must not approve production execution");
  if (packet?.netlifyRetryApprovedByThisPacket === true) v.push("netlifyRetryApprovedByThisPacket must not be true");
  if (packet?.liveSendApprovedByThisPacket === true) v.push("liveSendApprovedByThisPacket must not be true");
  if (!cmds?.commands?.length) v.push("missing command list");
  if (!preflight || preflight.readyForManualBaselineReview !== true) v.push("preflight readyForManualBaselineReview must be true");
  if (!phraseOk) v.push("guarded script must contain approval phrase constant");

  const du = process.env.DATABASE_URL;
  if (!du || !String(du).trim()) v.push("DATABASE_URL required for execute");
  const { ref: parsedRef } = extractSupabaseRef(du);
  if (parsedRef !== REQUIRED_REF) v.push(`DATABASE_URL must be Supabase ref ${REQUIRED_REF}`);

  if (v.length) {
    fs.writeFileSync(
      GUARDED_OUT,
      JSON.stringify({ ...base, outcome: "execute_blocked", violations: v }, null, 2),
      "utf8"
    );
    console.error("FAIL execute gate:", v.join("; "));
    process.exit(1);
  }

  const migrations = listMigrationsFromDisk();
  const results = [];
  base.productionMutationAttempted = true;
  for (const name of migrations) {
    const r = runResolve(name, du);
    results.push({ migrationName: name, exitCode: r.status, ok: r.status === 0 });
    if (r.status !== 0) {
      const msg = `${r.stderr || ""}\n${r.stdout || ""}`;
      if (!/already applied|already recorded/i.test(msg)) {
        fs.writeFileSync(
          GUARDED_OUT,
          JSON.stringify(
            {
              ...base,
              outcome: "execute_failed",
              stoppedAt: name,
              results,
              summary: msg.slice(0, 2000),
            },
            null,
            2
          ),
          "utf8"
        );
        console.error("FAIL migrate resolve at", name);
        process.exit(1);
      }
    }
  }

  fs.writeFileSync(
    GUARDED_OUT,
    JSON.stringify(
      {
        ...base,
        outcome: "execute_resolve_complete_no_deploy",
        results,
        message:
          "migrate resolve --applied completed for all migrations. migrate deploy was NOT run in this script per packet rules.",
      },
      null,
      2
    ),
    "utf8"
  );
  console.log("PASS execute path: resolve complete (no migrate deploy in this script)");
  process.exit(0);
}

main();
