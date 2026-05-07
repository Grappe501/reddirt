/**
 * Guarded runner — dry-run by default. Never spawns psql, prisma db execute, migrate deploy/resolve/push/reset.
 * --execute = env gate check only; still NO database commands.
 * REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0";
const PACKET = path.join(ROOT, "data/additive-schema-production-execution-packet.json");
const VALIDATION = path.join(ROOT, "data/additive-schema-production-execution-packet-validation.json");
const GATES = path.join(ROOT, "data/additive-schema-production-approval-gates.json");
const DRY_RUN_REPORT = path.join(ROOT, "data/additive-schema-production-guarded-dry-run.json");

const APPROVAL_PHRASE = "STEVE_APPROVES_REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION";
const STEVE_LINE = "DO NOT RUN SQL ON PRODUCTION UNTIL STEVE EXPLICITLY APPROVES THE OPERATOR COMMAND.";

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  const argv = process.argv.slice(2);
  const wantsExecute = argv.includes("--execute") && !argv.includes("--dry-run");
  const generatedAt = new Date().toISOString();

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log("Usage:");
    console.log("  node scripts/run-additive-schema-production-guarded.mjs           # --dry-run (default)");
    console.log("  node scripts/run-additive-schema-production-guarded.mjs --dry-run");
    console.log("  node scripts/run-additive-schema-production-guarded.mjs --execute");
    console.log("");
    console.log("--execute only checks env + JSON gates; it never runs psql or prisma db execute.");
    process.exit(0);
  }

  const packet = fs.existsSync(PACKET) ? loadJson(PACKET) : null;
  const validation = fs.existsSync(VALIDATION) ? loadJson(VALIDATION) : null;
  const gates = fs.existsSync(GATES) ? loadJson(GATES) : null;

  const base = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: wantsExecute ? "execute_gate_check" : "dry_run",
    productionMutationAttempted: false,
    secretsPrinted: false,
    packetPresent: !!packet,
    validationStatus: validation?.status || null,
    forbiddenCommands: [
      "psql against production",
      "npx prisma db execute",
      "npx prisma migrate deploy",
      "npx prisma migrate resolve",
      "npx prisma db push",
      "npx prisma migrate reset",
    ],
  };

  if (!wantsExecute) {
    const body = {
      ...base,
      outcome: "dry_run_complete",
      message:
        "No database I/O. Apply additive-schema-install-candidate.sql on production only via Supabase SQL editor after Steve approval and maintenance discipline.",
      operatorHint: "Compare candidate file sha256 to packet.candidateSqlSha256 before running.",
    };
    fs.writeFileSync(DRY_RUN_REPORT, JSON.stringify(body, null, 2), "utf8");
    console.log("=== run-additive-schema-production-guarded.mjs — DRY-RUN ===");
    console.log(STEVE_LINE);
    console.log("");
    console.log("Dry-run complete. No psql / prisma db execute / migrate was spawned.");
    console.log("Report:", path.relative(ROOT, DRY_RUN_REPORT));
    process.exit(0);
  }

  const violations = [];
  if (!packet) violations.push("missing data/additive-schema-production-execution-packet.json");
  if (!validation || validation.status !== "pass") {
    violations.push("data/additive-schema-production-execution-packet-validation.json must status pass (run validate script)");
  }
  if (packet?.productionMutationExecutedByThisPacket !== false) violations.push("productionMutationExecutedByThisPacket must be false");
  if (packet?.netlifyRetryApprovedByThisPacket === true) violations.push("netlifyRetryApprovedByThisPacket must not be true");
  if (packet?.liveSendApprovedByThisPacket === true) violations.push("liveSendApprovedByThisPacket must not be true");
  if (packet?.eligibility?.readyForProductionExecutionPacket !== true) {
    violations.push("packet eligibility.readyForProductionExecutionPacket must be true before --execute gate");
  }

  const envApprove = process.env.REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_APPROVED || "";
  if (envApprove !== APPROVAL_PHRASE) {
    violations.push(`REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_APPROVED must equal exact approval phrase`);
  }
  for (const [k, v] of [
    ["REDDIRT_BACKUP_PITR_CONFIRMED", process.env.REDDIRT_BACKUP_PITR_CONFIRMED],
    ["REDDIRT_CORRECT_PRODUCTION_DB_CONFIRMED", process.env.REDDIRT_CORRECT_PRODUCTION_DB_CONFIRMED],
    ["REDDIRT_MAINTENANCE_WINDOW_CONFIRMED", process.env.REDDIRT_MAINTENANCE_WINDOW_CONFIRMED],
    ["REDDIRT_ACKNOWLEDGE_ADDITIVE_CANDIDATE_HASH", process.env.REDDIRT_ACKNOWLEDGE_ADDITIVE_CANDIDATE_HASH],
  ]) {
    if (v !== "YES") violations.push(`${k} must be YES`);
  }

  if (gates?.gates?.length) {
    const bad = gates.gates.filter((g) => g.status !== "pending" && g.status !== "blocked");
    if (bad.length) violations.push("approval gates must be pending or blocked only for automated gate check");
  }

  const out = {
    ...base,
    outcome: violations.length ? "execute_gate_failed" : "execute_gate_ok",
    violations,
    message: violations.length
      ? "Fix violations; this script still does not run SQL."
      : "Gate check OK. Operator runs SQL manually in Supabase — not via this script.",
  };
  fs.writeFileSync(DRY_RUN_REPORT, JSON.stringify(out, null, 2), "utf8");

  console.log("=== run-additive-schema-production-guarded.mjs — EXECUTE (gate check only) ===");
  if (violations.length) {
    console.error("FAIL", violations.join("\n"));
    process.exit(1);
  }
  console.log("PASS gate check (no SQL executed)");
  console.log(" ", path.relative(ROOT, DRY_RUN_REPORT));
  process.exit(0);
}

main();
