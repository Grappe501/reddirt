/**
 * Validates data/production-baseline-execution-review.json + companion artifacts (offline).
 * Prints PASS / FAIL summary. Writes production-baseline-execution-review-validation.json.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRODUCTION-BASELINE-EXECUTION-REVIEW-1.0";
const REVIEW_PATH = path.join(ROOT, "data/production-baseline-execution-review.json");
const CHECKLIST_PATH = path.join(ROOT, "data/production-baseline-command-checklist.json");
const OUT_PATH = path.join(ROOT, "data/production-baseline-execution-review-validation.json");

const DO_NOT_PHRASE = "DO NOT RUN UNTIL EXECUTION PACKET IS APPROVED.";

const REQUIRED_DOCS = [
  "docs/production-baseline-execution-review.md",
  "docs/production-baseline-command-checklist.md",
  "docs/netlify-production-retry-readiness.md",
  "develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_REVIEW_1_0_REPORT.md",
];

const DECISIONS = new Set([
  "not_ready_shadow_failed",
  "not_ready_schema_map_unresolved",
  "ready_for_human_review_only",
  "ready_for_execution_packet_after_backup_confirmation",
  "blocked_requires_dba",
]);

function push(checks, id, ok, detail) {
  checks.push({ id, ok, detail: ok ? "ok" : detail });
  return ok;
}

function main() {
  const checks = [];
  const violations = [];

  let review = null;
  try {
    review = JSON.parse(fs.readFileSync(REVIEW_PATH, "utf8"));
  } catch (e) {
    violations.push(`Cannot read or parse ${REVIEW_PATH}: ${e}`);
  }

  if (!review) {
    const out = {
      schemaVersion: "1.0",
      slice: SLICE,
      generatedAt: new Date().toISOString(),
      status: "fail",
      checks: [],
      violations,
      safeForExecutionPacketDraft: false,
      safeForNetlifyRetry: false,
      safeForLiveSend: false,
    };
    fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), "utf8");
    console.error("FAIL — review JSON missing or invalid");
    process.exit(1);
  }

  push(checks, "slice", review.slice === SLICE, `got ${review.slice}`);
  push(checks, "schemaVersion", review.schemaVersion === "1.0", `got ${review.schemaVersion}`);
  push(checks, "mode", review.mode === "offline_execution_review_only", `got ${review.mode}`);
  push(checks, "productionMutationAttempted_false", review.productionMutationAttempted === false, "must be false");

  const e = review.eligibility;
  push(checks, "eligibility_decision", DECISIONS.has(e?.decision), `got ${e?.decision}`);
  push(
    checks,
    "readyForAutomaticExecution_false",
    e?.readyForAutomaticExecution === false,
    "automatic execution must remain false"
  );
  push(checks, "eligibility_reason", typeof e?.reason === "string" && e.reason.length > 0, "missing reason");

  const abs = review.absoluteDoNotRunYet;
  const four = ["npx prisma migrate deploy", "npx prisma migrate resolve", "npx prisma db push", "npx prisma migrate reset"];
  const absOk = Array.isArray(abs) && four.every((c) => abs.includes(c));
  push(checks, "absoluteDoNotRunYet_four_commands", absOk, `need all four Prisma commands, got ${JSON.stringify(abs)}`);

  const em = review.emailCommandCenterReadiness;
  push(checks, "live_send_not_approved", em?.readyForLiveSend === false && em?.liveSendExplicitlyApproved === false, "live send must not be approved");

  const n = review.netlifyReadiness;
  if (n?.readyToRetryNow === true && !n?.productionBaselineMigrationHistoryAligned) {
    violations.push("Netlify marked ready but migration history not aligned");
  }
  push(
    checks,
    "netlify_not_ready_or_gated",
    n?.readyToRetryNow === false || (n?.readyToRetryNow === true && n?.productionBaselineMigrationHistoryAligned === true),
    "readyToRetryNow must be false unless migration history aligned (not expected in this slice)"
  );

  const gov = review.governance;
  push(
    checks,
    "governance_flags_false",
    gov &&
      gov.thisPacketApprovesProductionMigrate === false &&
      gov.thisPacketApprovesProductionBaselineExecution === false &&
      gov.thisPacketApprovesProductionMigrateResolve === false &&
      gov.thisPacketApprovesProductionDbPush === false &&
      gov.thisPacketApprovesProductionReset === false &&
      gov.thisPacketApprovesNetlifyRetry === false &&
      gov.thisPacketApprovesLiveSend === false &&
      gov.productionBaselineExecutionReadyForAutomaticRun === false,
    "governance block must explicitly deny approvals"
  );

  push(
    checks,
    "recommendedPath_option_D",
    review.recommendedPath?.recommendedBaselineOptionId === "D" && typeof review.recommendedPath?.strategy === "string",
    "recommendedPath must recommend Option D id and strategy string"
  );

  for (const rel of REQUIRED_DOCS) {
    const p = path.join(ROOT, rel);
    const ok = fs.existsSync(p);
    push(checks, `doc_exists:${rel}`, ok, `missing ${rel}`);
  }

  let checklist = null;
  try {
    checklist = JSON.parse(fs.readFileSync(CHECKLIST_PATH, "utf8"));
  } catch (err) {
    violations.push(`Checklist JSON unreadable: ${err}`);
  }
  const checklistText = checklist ? JSON.stringify(checklist) : "";
  const phraseOk =
    checklist?.globalDisclaimer === DO_NOT_PHRASE &&
    checklistText.includes(DO_NOT_PHRASE) &&
    Array.isArray(checklist?.preFlightRequirements) &&
    checklist.preFlightRequirements.length >= 10;
  push(checks, "command_checklist_disclaimer", phraseOk, "checklist must include global disclaimer and pre-flight list");

  const status = checks.every((c) => c.ok) && violations.length === 0 ? "pass" : "fail";

  const safeForExecutionPacketDraft = false;
  const safeForNetlifyRetry = false;
  const safeForLiveSend = false;

  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    status,
    checks,
    violations,
    safeForExecutionPacketDraft,
    safeForNetlifyRetry,
    safeForLiveSend,
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), "utf8");

  const failed = checks.filter((c) => !c.ok);
  console.log("");
  console.log(status === "pass" ? "PASS — production baseline execution review validation" : "FAIL — production baseline execution review validation");
  console.log(`Checks: ${checks.length - failed.length}/${checks.length} ok`);
  if (failed.length) {
    for (const c of failed) console.error(`  ✗ ${c.id}: ${c.detail}`);
  }
  if (violations.length) {
    for (const v of violations) console.error(`  violation: ${v}`);
  }
  console.log("");

  if (status === "fail") process.exit(1);
}

main();
