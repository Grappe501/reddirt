/**
 * Validates migration history baseline execution packet artifacts.
 * REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0";
const PACKET = path.join(ROOT, "data/migration-history-baseline-execution-packet.json");
const GATES = path.join(ROOT, "data/migration-history-baseline-approval-gates.json");
const COMMANDS = path.join(ROOT, "data/migration-history-baseline-command-list.json");
const PREFLIGHT = path.join(ROOT, "data/migration-history-production-preflight.json");
const CLONE = path.join(ROOT, "data/migration-history-baseline-clone-proof.json");
const DRY = path.join(ROOT, "data/migration-history-baseline-guarded-dry-run.json");
const GUARDED_SRC = path.join(ROOT, "scripts/run-migration-history-baseline-guarded.mjs");
const OUT = path.join(ROOT, "data/migration-history-baseline-execution-packet-validation.json");
const DOCS = [
  path.join(ROOT, "docs/migration-history-baseline-execution-packet.md"),
  path.join(ROOT, "docs/migration-history-baseline-approval-gates.md"),
  path.join(ROOT, "docs/migration-history-baseline-runbook.md"),
  path.join(ROOT, "docs/migration-history-postcheck-plan.md"),
  path.join(ROOT, "docs/post-migration-history-netlify-readiness.md"),
];

function load(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  const generatedAt = new Date().toISOString();
  const checks = [];
  const violations = [];
  const push = (id, ok, detail) => checks.push({ id, ok, detail: ok ? "ok" : detail });

  const packet = load(PACKET);
  const gates = load(GATES);
  const cmds = load(COMMANDS);
  const preflight = load(PREFLIGHT);
  const clone = fs.existsSync(CLONE) ? load(CLONE) : null;
  const dry = load(DRY);
  const guardedSrc = fs.existsSync(GUARDED_SRC) ? fs.readFileSync(GUARDED_SRC, "utf8") : "";

  push("packet_exists", !!packet, "missing packet JSON");
  push("packet_slice", packet?.slice === SLICE, "slice");
  push("production_mutation_false", packet?.productionMutationExecutedByThisPacket === false, "productionMutationExecutedByThisPacket");
  push("history_mutate_false", packet?.productionMigrationHistoryMutatedByThisPacket === false, "productionMigrationHistoryMutatedByThisPacket");
  push("auto_exec_false", packet?.automaticExecutionAllowed === false, "automaticExecutionAllowed");
  push("prod_not_approved", packet?.productionExecutionApprovedByThisPacket === false, "productionExecutionApprovedByThisPacket");
  push("netlify_not_approved", packet?.netlifyRetryApprovedByThisPacket === false, "netlifyRetryApprovedByThisPacket");
  push("live_send_not_approved", packet?.liveSendApprovedByThisPacket === false, "liveSendApprovedByThisPacket");

  push("gates_exist", !!(gates?.gates?.length >= 10), "approval gates");
  push("gates_pending", (gates?.gates || []).every((g) => g.status === "pending"), "all gates pending");

  push("commands_exist", !!(cmds?.commands?.length), "command list");
  push("commands_gated", (cmds?.commands || []).every((c) => c.executionStatus === "DO_NOT_RUN_YET"), "DO_NOT_RUN_YET");

  push("preflight_exists", !!preflight, "preflight json");

  push("dry_run_exists", !!dry, "migration-history-baseline-guarded-dry-run.json");
  push("guarded_has_phrase", guardedSrc.includes("STEVE_APPROVES_REDDIRT_MIGRATION_HISTORY_BASELINE_EXECUTION"), "approval phrase in guarded script");

  for (const d of DOCS) {
    push(`doc_${path.basename(d)}`, fs.existsSync(d), `missing ${path.relative(ROOT, d)}`);
  }

  if (clone && clone.configured === true && clone.attempted === true && clone.ok !== true) {
    violations.push({ rule: "clone_proof_not_ok", detail: "clone proof attempted but ok is not true" });
  }

  const status = checks.every((c) => c.ok) && violations.length === 0 ? "pass" : "fail";
  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    status,
    checks,
    violations,
    safeForManualApprovalReview: status === "pass",
    safeForAutomaticExecution: false,
    safeForNetlifyRetry: false,
    safeForLiveSend: false,
    cloneProofOk: clone?.ok === true,
    cloneProofPresent: !!clone,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");

  console.log(status === "pass" ? "PASS validate-migration-history-baseline-execution-packet.mjs" : "FAIL validate-migration-history-baseline-execution-packet.mjs");
  console.log(" ", path.relative(ROOT, OUT));
  process.exit(status === "pass" ? 0 : 1);
}

main();
