/**
 * Guarded additive schema runner — **dry-run by default**.
 * `--execute` applies candidate SQL via Prisma `$executeRawUnsafe` per statement (operator-only).
 * Never prints DATABASE_URL or password. No prisma migrate deploy/resolve/push/reset.
 * REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import {
  analyzeCandidateSql,
  evaluateCloneProofHardened,
  extractSupabaseRef,
  findForbiddenCreateTableHits,
  liveSendApprovalHeuristic,
  PRODUCTION_SUPABASE_PROJECT_REF,
  splitSqlStatements,
  stripLeadingLineComments,
} from "./lib/additive-candidate-sql-guards.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0";
const PACKET = path.join(ROOT, "data/additive-schema-production-execution-packet.json");
const VALIDATION = path.join(ROOT, "data/additive-schema-production-execution-packet-validation.json");
const PREFLIGHT = path.join(ROOT, "data/additive-schema-production-preflight.json");
const CLONE = path.join(ROOT, "data/additive-schema-clone-test-result.json");
const INSTALL_VALIDATION = path.join(ROOT, "data/additive-schema-install-validation.json");
const CANDIDATE = path.join(ROOT, "data/sql/additive-schema-install-candidate.sql");
const DRY_RUN_REPORT = path.join(ROOT, "data/additive-schema-production-guarded-dry-run.json");
const EXEC_RESULT = path.join(ROOT, "data/additive-schema-production-guarded-execute-result.json");

const APPROVAL_PHRASE = "STEVE_APPROVES_REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION";
const STEVE_LINE = "DO NOT RUN SQL ON PRODUCTION UNTIL STEVE EXPLICITLY APPROVES THE OPERATOR COMMAND.";

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function sha256File(p) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(p));
  return h.digest("hex");
}

function collectExecuteViolations(packet, validation, preflight, wantsExecute) {
  const violations = [];
  if (!packet) violations.push("missing data/additive-schema-production-execution-packet.json");
  if (!validation || validation.status !== "pass") {
    violations.push("data/additive-schema-production-execution-packet-validation.json must status pass");
  }
  if (packet?.productionMutationExecutedByThisPacket !== false) violations.push("productionMutationExecutedByThisPacket must be false");
  if (packet?.netlifyRetryApprovedByThisPacket === true) violations.push("netlifyRetryApprovedByThisPacket must not be true");
  if (packet?.liveSendApprovedByThisPacket === true) violations.push("liveSendApprovedByThisPacket must not be true");
  if (packet?.eligibility?.readyForProductionExecutionPacket !== true) {
    violations.push("packet eligibility.readyForProductionExecutionPacket must be true before --execute");
  }

  const live = liveSendApprovalHeuristic();
  if (live.length) violations.push(...live);

  if (wantsExecute) {
    const envPairs = [
      ["REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_APPROVED", process.env.REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_APPROVED],
      ["REDDIRT_BACKUP_PITR_CONFIRMED", process.env.REDDIRT_BACKUP_PITR_CONFIRMED],
      ["REDDIRT_CORRECT_PRODUCTION_DB_CONFIRMED", process.env.REDDIRT_CORRECT_PRODUCTION_DB_CONFIRMED],
      ["REDDIRT_MAINTENANCE_WINDOW_CONFIRMED", process.env.REDDIRT_MAINTENANCE_WINDOW_CONFIRMED],
      ["REDDIRT_CLONE_PROOF_CONFIRMED", process.env.REDDIRT_CLONE_PROOF_CONFIRMED],
      ["REDDIRT_ACKNOWLEDGE_SCHEMA_MUTATION", process.env.REDDIRT_ACKNOWLEDGE_SCHEMA_MUTATION],
      ["REDDIRT_ACKNOWLEDGE_NETLIFY_SEPARATE", process.env.REDDIRT_ACKNOWLEDGE_NETLIFY_SEPARATE],
      ["REDDIRT_ACKNOWLEDGE_LIVE_SEND_BLOCKED", process.env.REDDIRT_ACKNOWLEDGE_LIVE_SEND_BLOCKED],
    ];
    for (const [k, v] of envPairs) {
      if (k === "REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_APPROVED") {
        if (v !== APPROVAL_PHRASE) violations.push(`${k} must equal exact approval phrase`);
      } else if (v !== "YES") {
        violations.push(`${k} must be YES`);
      }
    }

    const du = process.env.DATABASE_URL;
    if (!du || !String(du).trim()) violations.push("DATABASE_URL required for --execute");
    const ref = extractSupabaseRef(du || "");
    if (ref !== PRODUCTION_SUPABASE_PROJECT_REF) {
      violations.push(`DATABASE_URL must resolve to production ref ${PRODUCTION_SUPABASE_PROJECT_REF}`);
    }

    const pf = loadJson(PREFLIGHT);
    if (!pf || pf.readyForManualExecution !== true) {
      violations.push("data/additive-schema-production-preflight.json must show readyForManualExecution true (re-run preflight)");
    }

    const iv = loadJson(INSTALL_VALIDATION);
    if (!iv || iv.status !== "pass" || iv.safeForCloneTest !== true || iv.safeForProduction !== false) {
      violations.push("additive-schema-install-validation.json must pass with safeForCloneTest true and safeForProduction false");
    }

    const clone = loadJson(CLONE);
    if (!evaluateCloneProofHardened(clone).passed) {
      violations.push("clone proof hardened gates failed");
    }

    if (!fs.existsSync(CANDIDATE)) violations.push("candidate SQL missing");
    else {
      const raw = fs.readFileSync(CANDIDATE, "utf8");
      const a = analyzeCandidateSql(raw);
      if (!a.noDestructiveViolations || a.dropCount || a.truncateCount || a.deleteCount || a.insertCount || a.updateCount) {
        violations.push("candidate SQL failed destructive / extension-schema scan");
      }
      const badCreates = findForbiddenCreateTableHits(a.statements);
      if (badCreates.length) violations.push(`candidate attempts CREATE on protected tables: ${badCreates.join(", ")}`);
    }
  }

  return violations;
}

async function executeCandidateStatements() {
  const raw = fs.readFileSync(CANDIDATE, "utf8");
  const stmts = splitSqlStatements(raw).map(stripLeadingLineComments).filter((s) => s.length > 0);
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
  const executed = [];
  try {
    for (let i = 0; i < stmts.length; i++) {
      const sql = stmts[i];
      await prisma.$executeRawUnsafe(sql);
      executed.push({ idx: i, ok: true, preview: sql.slice(0, 80) });
    }
    return { ok: true, executedStatementCount: stmts.length, executed };
  } catch (e) {
    return {
      ok: false,
      error: String(e.message || e),
      executedStatementCount: executed.length,
      executed,
    };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const wantsExecute = argv.includes("--execute") && !argv.includes("--dry-run");
  const generatedAt = new Date().toISOString();

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log("Usage:");
    console.log("  node scripts/run-additive-schema-production-guarded.mjs           # dry-run (default)");
    console.log("  node scripts/run-additive-schema-production-guarded.mjs --dry-run");
    console.log("  node scripts/run-additive-schema-production-guarded.mjs --execute   # operator-only; all env gates required");
    process.exit(0);
  }

  const packet = fs.existsSync(PACKET) ? loadJson(PACKET) : null;
  const validation = fs.existsSync(VALIDATION) ? loadJson(VALIDATION) : null;
  const preflight = fs.existsSync(PREFLIGHT) ? loadJson(PREFLIGHT) : null;

  const violationsExecute = collectExecuteViolations(packet, validation, preflight, wantsExecute);

  const base = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: wantsExecute ? "execute_attempt" : "dry_run",
    productionMutationAttempted: wantsExecute && violationsExecute.length === 0,
    secretsPrinted: false,
    packetPresent: !!packet,
    validationStatus: validation?.status || null,
    preflightReadyForManualExecution: preflight?.readyForManualExecution === true,
    forbiddenCommands: [
      "npx prisma migrate deploy",
      "npx prisma migrate resolve",
      "npx prisma db push",
      "npx prisma migrate reset",
      "npx prisma db execute (CLI — not used here)",
    ],
  };

  if (!wantsExecute) {
    const body = {
      ...base,
      outcome: "dry_run_complete",
      violations: [],
      message:
        "Dry-run: no database mutation. Operator may use Supabase SQL editor or re-run with --execute after all human + env gates (never from unsupervised CI).",
      operatorHint: "Compare candidate sha256 to packet.candidateSqlSha256; run preflight first.",
    };
    fs.writeFileSync(DRY_RUN_REPORT, JSON.stringify(body, null, 2), "utf8");
    console.log("=== run-additive-schema-production-guarded.mjs — DRY-RUN ===");
    console.log(STEVE_LINE);
    console.log("Dry-run complete. Report:", path.relative(ROOT, DRY_RUN_REPORT));
    process.exit(0);
  }

  if (violationsExecute.length) {
    const body = {
      ...base,
      outcome: "execute_gate_failed",
      violations: violationsExecute,
      message: "Gate check failed; no SQL executed.",
      operatorHint: "Fix violations and re-run preflight + validation.",
    };
    fs.writeFileSync(DRY_RUN_REPORT, JSON.stringify(body, null, 2), "utf8");
    console.log("=== run-additive-schema-production-guarded.mjs — EXECUTE (blocked) ===");
    console.error("FAIL gate:", violationsExecute.join("\n"));
    process.exit(1);
  }

  const candidateSha256 = sha256File(CANDIDATE);
  if (packet?.candidateSqlSha256 && candidateSha256 !== packet.candidateSqlSha256) {
    const body = {
      ...base,
      outcome: "execute_aborted_hash_mismatch",
      violations: ["candidate sha256 does not match packet — refusing execute"],
      productionMutationAttempted: false,
    };
    fs.writeFileSync(DRY_RUN_REPORT, JSON.stringify(body, null, 2), "utf8");
    console.error("FAIL hash mismatch");
    process.exit(1);
  }

  const execOutcome = await executeCandidateStatements();
  const out = {
    ...base,
    productionMutationAttempted: execOutcome.ok === true,
    outcome: execOutcome.ok ? "execute_complete" : "execute_failed",
    candidateSqlSha256: candidateSha256,
    statementCount: execOutcome.executedStatementCount,
    detail: execOutcome,
    postcheckRecommendation: "node scripts/verify-additive-schema-production-postcheck.mjs",
  };
  fs.writeFileSync(EXEC_RESULT, JSON.stringify(out, null, 2), "utf8");
  fs.writeFileSync(
    DRY_RUN_REPORT,
    JSON.stringify({ ...base, outcome: out.outcome, mirrorPath: path.relative(ROOT, EXEC_RESULT) }, null, 2),
    "utf8"
  );

  console.log("=== run-additive-schema-production-guarded.mjs — EXECUTE ===");
  if (!execOutcome.ok) {
    console.error("FAIL SQL execution:", execOutcome.error);
    process.exit(1);
  }
  console.log("PASS execute. Result:", path.relative(ROOT, EXEC_RESULT));
  console.log("Run:", out.postcheckRecommendation);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
