/**
 * Validates post–migration-history Netlify retry packet vs preflight truth.
 * REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0";
const PACKET = path.join(ROOT, "data/post-migration-history-netlify-retry-packet.json");
const PREFLIGHT = path.join(ROOT, "data/migration-history-production-preflight.json");
const CHECKLIST = path.join(ROOT, "data/post-migration-history-deploy-checklist.json");
const UNLOCK = path.join(ROOT, "data/communication-command-center-next-unlock.json");
const OUT = path.join(ROOT, "data/post-migration-history-netlify-retry-validation.json");
const DOCS = [
  path.join(ROOT, "docs/post-migration-history-netlify-retry-packet.md"),
  path.join(ROOT, "docs/post-migration-history-deploy-checklist.md"),
];

function load(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function evaluatePreflight(pf) {
  if (!pf || typeof pf !== "object") return { ok: false };
  const summary = String(pf.migrateStatusSummary || "");
  const statusUpToDate = /database schema is up to date/i.test(summary);
  const checks = {
    productionProjectRefConfirmed: pf.productionProjectRefConfirmed === true,
    requiredLegacyTablesPresent: pf.requiredLegacyTablesPresent === true,
    requiredNewAppTablesPresent: pf.requiredNewAppTablesPresent === true,
    authUsersPresent: pf.authUsersPresent === true,
    prismaMigrationsTableExists: pf.prismaMigrationsTableExists === true,
    prismaMigrationsCount71: pf.prismaMigrationsCount === 71,
    pendingMigrationCountZero: pf.pendingMigrationCount === 0,
    migrateStatusExitCodeZero: pf.migrateStatusExitCode === 0,
    migrateStatusSummaryUpToDate: statusUpToDate,
    readyForManualBaselineReview: pf.readyForManualBaselineReview === true,
  };
  const ok = Object.values(checks).every(Boolean);
  return { ok, checks };
}

function main() {
  const generatedAt = new Date().toISOString();
  const checks = [];
  const violations = [];
  const push = (id, ok, detail) => checks.push({ id, ok, detail: ok ? "ok" : detail });

  const packet = load(PACKET);
  const preflight = load(PREFLIGHT);
  const checklist = load(CHECKLIST);
  const unlock = load(UNLOCK);

  push("packet_exists", !!packet, "missing post-migration-history-netlify-retry-packet.json");
  push("packet_slice", packet?.slice === SLICE, "slice mismatch");
  push("production_mutation_false", packet?.productionMutationExecutedByThisPacket === false, "productionMutationExecutedByThisPacket");
  push("netlify_not_triggered", packet?.netlifyDeployTriggeredByThisPacket === false, "netlifyDeployTriggeredByThisPacket");
  push("live_send_not_approved", packet?.liveSendApprovedByThisPacket === false, "liveSendApprovedByThisPacket");
  push("automatic_deploy_false", packet?.eligibility?.readyForAutomaticDeploy === false, "readyForAutomaticDeploy must be false");
  push("live_send_false", packet?.eligibility?.readyForLiveSend === false, "readyForLiveSend must be false");
  push("db_push_forbidden", packet?.deploymentRules?.dbPushForbidden === true, "dbPushForbidden");
  push("migrate_reset_forbidden", packet?.deploymentRules?.migrateResetForbidden === true, "migrateResetForbidden");
  push("next_slice", packet?.nextRecommendedSlice === "REDDIRT-NETLIFY-OPERATOR-RETRY-1.0", "nextRecommendedSlice");

  const ev = evaluatePreflight(preflight);
  push("preflight_eval_ok", ev.ok, "preflight does not satisfy retry gates");

  const expectedReady = ev.ok && packet?.netlifyBuildInspection?.invokesPrismaMigrateDeploy === true;
  push(
    "eligibility_ready_matches_truth",
    packet?.eligibility?.readyForOperatorNetlifyRetry === expectedReady,
    `readyForOperatorNetlifyRetry should be ${expectedReady}`
  );

  push("checklist_exists", !!checklist?.items?.length, "deploy checklist JSON");
  push("unlock_exists", !!unlock && unlock.liveSendBlocked === true, "unlock JSON + liveSendBlocked");

  for (const d of DOCS) {
    push(`doc_${path.basename(d)}`, fs.existsSync(d), `missing ${path.relative(ROOT, d)}`);
  }

  if (packet && ev.ok) {
    const e = packet.eligibility || {};
    if (e.migrationHistoryAligned !== true) violations.push({ rule: "migrationHistoryAligned", detail: "expected true when preflight ok" });
    if (e.pendingMigrationCountZero !== true) violations.push({ rule: "pendingMigrationCountZero" });
    if (e.prismaMigrateStatusClean !== true) violations.push({ rule: "prismaMigrateStatusClean" });
  }

  const status = checks.every((c) => c.ok) && violations.length === 0 ? "pass" : "fail";
  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    status,
    checks,
    violations,
    safeForOperatorNetlifyRetryReview: status === "pass" && packet?.eligibility?.readyForOperatorNetlifyRetry === true,
    safeForAutomaticNetlifyDeploy: false,
    safeForLiveSend: false,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");

  console.log(status === "pass" ? "PASS validate-post-migration-history-netlify-retry-packet.mjs" : "FAIL validate-post-migration-history-netlify-retry-packet.mjs");
  console.log(" ", path.relative(ROOT, OUT));
  process.exit(status === "pass" ? 0 : 1);
}

main();
