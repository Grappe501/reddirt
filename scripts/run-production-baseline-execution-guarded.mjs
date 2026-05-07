/**
 * Guarded runner — **dry-run by default**. Does **not** spawn Prisma migrate/deploy/resolve/db push/reset.
 * With `--execute` + all env flags + validation PASS + checklist present: prints operator message only.
 * REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0";
const PACKET = path.join(ROOT, "data/production-baseline-execution-packet.json");
const GATES = path.join(ROOT, "data/production-baseline-approval-gates.json");
const VALIDATION = path.join(ROOT, "data/production-baseline-execution-packet-validation.json");
const CHECKLIST = path.join(ROOT, "data/production-baseline-command-checklist.json");
const DRY_RUN_REPORT = path.join(ROOT, "data/production-baseline-execution-guarded-dry-run.json");

/** DRY_RUN: default behavior when --execute is not passed */
const APPROVAL_PHRASE = "STEVE_APPROVES_REDDIRT_PRODUCTION_BASELINE_EXECUTION";
const STEVE_LINE = "DO NOT RUN UNTIL STEVE EXPLICITLY APPROVES PRODUCTION BASELINE EXECUTION.";

function urlPresentNonPrinting(name) {
  const v = process.env[name === "DATABASE_URL" ? "DATABASE_URL" : "DIRECT_URL"];
  return !!(v && String(v).trim());
}

function writeDryRunReport(body) {
  fs.writeFileSync(DRY_RUN_REPORT, JSON.stringify(body, null, 2), "utf8");
}

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  const argv = process.argv.slice(2);
  // If both flags appear, dry-run wins (safer).
  const wantsExecute = argv.includes("--execute") && !argv.includes("--dry-run");
  const wantsDry = !wantsExecute;

  const generatedAt = new Date().toISOString();

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log("Usage:");
    console.log("  node scripts/run-production-baseline-execution-guarded.mjs           # same as --dry-run");
    console.log("  node scripts/run-production-baseline-execution-guarded.mjs --dry-run");
    console.log("  node scripts/run-production-baseline-execution-guarded.mjs --execute # gate check only; still NO Prisma spawn");
    process.exit(0);
  }

  const packet = fs.existsSync(PACKET) ? loadJson(PACKET) : null;
  const validation = fs.existsSync(VALIDATION) ? loadJson(VALIDATION) : null;
  const gates = fs.existsSync(GATES) ? loadJson(GATES) : null;

  const baseReport = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: wantsDry ? "dry_run" : "execute_gate_check",
    productionMutationAttempted: false,
    secretsPrinted: false,
    packetPresent: !!packet,
    validationStatus: validation?.status || null,
    checklistPresent: fs.existsSync(CHECKLIST),
  };

  if (wantsDry) {
    writeDryRunReport({
      ...baseReport,
      outcome: "dry_run_complete",
      message:
        "Dry-run only: no database commands executed. For real execution, use a separate operator terminal after Steve approval.",
      liveSendApprovedInPacket: packet?.emailCommandCenterProofPlan?.liveSendApproved ?? null,
    });
    console.log("=== run-production-baseline-execution-guarded.mjs — DRY-RUN ===");
    console.log(STEVE_LINE);
    console.log("");
    console.log("Dry-run complete. No Prisma migrate/deploy/resolve/db push/reset was run.");
    console.log("Report:", path.relative(ROOT, DRY_RUN_REPORT));
    console.log("");
    console.log("Execution requires a separate operator terminal command after Steve approval.");
    process.exit(0);
  }

  // --execute path (still no Prisma)
  const violations = [];
  if (!fs.existsSync(CHECKLIST)) violations.push("missing data/production-baseline-command-checklist.json");
  if (!validation || validation.status !== "pass") violations.push("data/production-baseline-execution-packet-validation.json must status pass (run validate script first)");
  if (!packet) violations.push("missing execution packet JSON");
  if (packet?.emailCommandCenterProofPlan?.liveSendApproved === true) violations.push("liveSendApproved must be false");
  if (packet?.productionMutationExecutedByThisPacket !== false) violations.push("productionMutationExecutedByThisPacket must be false");
  if (packet?.executionPacketStatus === "blocked_missing_required_artifact") violations.push("packet is blocked — rebuild inputs");

  if (!urlPresentNonPrinting("DATABASE_URL")) violations.push("DATABASE_URL missing in environment");
  if (!urlPresentNonPrinting("DIRECT_URL")) violations.push("DIRECT_URL missing in environment");

  const envApprove = process.env.REDDIRT_PRODUCTION_BASELINE_EXECUTION_APPROVED || "";
  const envBackup = process.env.REDDIRT_BACKUP_PITR_CONFIRMED || "";
  const envDb = process.env.REDDIRT_CORRECT_PRODUCTION_DB_CONFIRMED || "";
  const envMaint = process.env.REDDIRT_MAINTENANCE_WINDOW_CONFIRMED || "";
  const envShadow = process.env.REDDIRT_SHADOW_PROOF_CONFIRMED || "";
  const envChecksum = process.env.REDDIRT_ACKNOWLEDGE_CHECKSUM_RISK || "";

  if (envApprove !== APPROVAL_PHRASE) violations.push(`REDDIRT_PRODUCTION_BASELINE_EXECUTION_APPROVED must equal ${APPROVAL_PHRASE}`);
  for (const [k, v] of [
    ["REDDIRT_BACKUP_PITR_CONFIRMED", envBackup],
    ["REDDIRT_CORRECT_PRODUCTION_DB_CONFIRMED", envDb],
    ["REDDIRT_MAINTENANCE_WINDOW_CONFIRMED", envMaint],
    ["REDDIRT_SHADOW_PROOF_CONFIRMED", envShadow],
    ["REDDIRT_ACKNOWLEDGE_CHECKSUM_RISK", envChecksum],
  ]) {
    if (v !== "YES") violations.push(`${k} must be YES`);
  }

  if (gates?.gates?.length && !gates.gates.every((g) => g.status === "pending")) {
    violations.push("all approval gates must remain pending in JSON for this packet phase");
  }

  if (violations.length) {
    writeDryRunReport({
      ...baseReport,
      mode: "execute_blocked",
      outcome: "blocked",
      violations,
    });
    console.error("=== run-production-baseline-execution-guarded.mjs — EXECUTE BLOCKED ===");
    violations.forEach((v) => console.error(" -", v));
    console.error("");
    console.error("No database commands were run.");
    process.exit(1);
  }

  writeDryRunReport({
    ...baseReport,
    mode: "execute_gates_ok_no_prisma_spawn",
    outcome: "operator_handoff",
    message:
      "All execute-mode env gates satisfied and validation passed. This script still does NOT run Prisma. Execution requires a separate operator terminal command after Steve approval.",
  });

  console.log("=== run-production-baseline-execution-guarded.mjs — EXECUTE MODE (no Prisma) ===");
  console.log(STEVE_LINE);
  console.log("");
  console.log("Gate checks passed. This script does NOT spawn npx prisma migrate deploy.");
  console.log("");
  console.log("Execution requires a separate operator terminal command after Steve approval.");
  console.log("Suggested operator sequence (manual): prisma validate → migrate status → migrate deploy → migrate status → email diagnostics → hosted DB proof.");
  console.log("Dry-run report:", path.relative(ROOT, DRY_RUN_REPORT));
  process.exit(0);
}

main();
