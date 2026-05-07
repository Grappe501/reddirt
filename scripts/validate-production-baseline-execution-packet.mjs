/**
 * Validates data/production-baseline-execution-packet.json + approval gates (offline).
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
const OUT = path.join(ROOT, "data/production-baseline-execution-packet-validation.json");
const GUARDED = path.join(ROOT, "scripts/run-production-baseline-execution-guarded.mjs");
const CHECKLIST = path.join(ROOT, "data/production-baseline-command-checklist.json");

const APPROVAL_PHRASE = "STEVE_APPROVES_REDDIRT_PRODUCTION_BASELINE_EXECUTION";

const FORBIDDEN = [
  "npx prisma migrate deploy",
  "npx prisma migrate resolve",
  "npx prisma db push",
  "npx prisma migrate reset",
];

const DOC_PATHS = [
  "docs/production-baseline-execution-packet.md",
  "docs/production-baseline-approval-gates.md",
  "docs/production-baseline-execution-runbook.md",
  "docs/post-baseline-netlify-test-plan.md",
  "docs/hosted-db-proof-after-baseline.md",
];

function walkStrings(obj, fn) {
  if (obj === null || obj === undefined) return;
  if (typeof obj === "string") fn(obj);
  else if (Array.isArray(obj)) obj.forEach((x) => walkStrings(x, fn));
  else if (typeof obj === "object") Object.values(obj).forEach((x) => walkStrings(x, fn));
}

function main() {
  const checks = [];
  const violations = [];
  const push = (id, ok, detail) => checks.push({ id, ok, detail: ok ? "ok" : detail });

  let p = null;
  let g = null;
  try {
    p = JSON.parse(fs.readFileSync(PACKET, "utf8"));
  } catch (e) {
    violations.push(`packet: ${e}`);
  }
  try {
    g = JSON.parse(fs.readFileSync(GATES, "utf8"));
  } catch (e) {
    violations.push(`gates: ${e}`);
  }

  if (!p) {
    push("packet_readable", false, "missing or invalid packet JSON");
  } else {
    push("slice", p.slice === SLICE, String(p?.slice));
    push("mode", p.mode === "approval_gated_execution_packet", String(p?.mode));
    push("productionMutationExecutedByThisPacket_false", p.productionMutationExecutedByThisPacket === false, "must be false");
    push("readyForAutomaticExecution_false", p.eligibility?.readyForAutomaticExecution === false, "automatic must be false");
    push("live_send_false", p.emailCommandCenterProofPlan?.liveSendApproved === false, "liveSendApproved must be false");
    push("backup_pitr_required", p.backupAndApprovalRequirements?.backupPitrProofRequired === true, "backupPitrProofRequired");
    push("steve_required", p.backupAndApprovalRequirements?.steveApprovalRequired === true, "steveApprovalRequired");
    push("forbidden_list", JSON.stringify(p.absoluteDoNotRunUntilApproved) === JSON.stringify(FORBIDDEN), "absoluteDoNotRunUntilApproved must match spec");
    push("approval_phrase_field", p.approvalPhraseRequired === APPROVAL_PHRASE, "approvalPhraseRequired");

    const blocked = p.executionPacketStatus === "blocked_missing_required_artifact";
    if (blocked) {
      push("blocked_lists_missing", Array.isArray(p.missingArtifacts) && p.missingArtifacts.length > 0, "missingArtifacts when blocked");
      push("readyForExecutionPacket_false_when_blocked", p.eligibility?.readyForExecutionPacket === false, "readyForExecutionPacket must be false when blocked");
    } else {
      push("executionPacketStatus_ready", p.executionPacketStatus === "ready", `expected ready, got ${p.executionPacketStatus}`);
      push("readyForExecutionPacket_true", p.eligibility?.readyForExecutionPacket === true, "readyForExecutionPacket");
      push("proof_summary", p.proofSummary?.shadowProofPassed === true && p.proofSummary?.productionBaselineReviewValidated === true, "proofSummary");
    }

    let steveLabeled = true;
    walkStrings(p.commandTemplatesForReviewOnly, (s) => {
      if (typeof s === "string" && /npx\s+prisma/i.test(s) && !s.trim().startsWith("#")) {
        steveLabeled = false;
      }
    });
    push("command_templates_prisma_commented", steveLabeled, "npx prisma lines must be # commented in templates");

    let hasSteveLabel = false;
    walkStrings(p.commandTemplatesForReviewOnly, (s) => {
      if (typeof s === "string" && s.includes("DO NOT RUN UNTIL STEVE EXPLICITLY APPROVES")) hasSteveLabel = true;
    });
    push("command_templates_steve_label", hasSteveLabel || (p.commandTemplatesForReviewOnly?.length === 0 && blocked), "templates need STEVE DO NOT RUN line (or blocked empty)");

    walkStrings(p, (s) => {
      if (typeof s === "string" && /postgres(ql)?:\/\//i.test(s)) violations.push("connection string pattern leaked in packet JSON");
    });
  }

  if (!g) {
    push("gates_readable", false, "missing gates JSON");
  } else {
    push("gates_all_pending", Array.isArray(g.gates) && g.gates.every((x) => x.status === "pending"), "every gate.status must be pending");
    push("gates_have_keys", Array.isArray(g.gates) && g.gates.length >= 12, `expected at least 12 gates, got ${g.gates?.length}`);
    push("gates_approval_phrase", g.approvalPhraseRequired === APPROVAL_PHRASE, "gates file approvalPhraseRequired");
  }

  for (const rel of DOC_PATHS) {
    const ok = fs.existsSync(path.join(ROOT, rel));
    push(`doc_${rel.replace(/[^\w]+/g, "_")}`, ok, rel);
  }

  push("checklist_exists", fs.existsSync(CHECKLIST), "data/production-baseline-command-checklist.json");
  push("guarded_script_exists", fs.existsSync(GUARDED), GUARDED);
  if (fs.existsSync(GUARDED)) {
    const gs = fs.readFileSync(GUARDED, "utf8");
    push("guarded_contains_phrase", gs.includes(APPROVAL_PHRASE), "guarded runner must reference approval phrase");
    push("guarded_default_dry_run", gs.includes("--dry-run") && gs.includes("DRY_RUN"), "guarded runner must document dry-run default");
  }

  const status = checks.every((c) => c.ok) && violations.length === 0 ? "pass" : "fail";
  const packetReady = p?.executionPacketStatus === "ready" && !violations.length && status === "pass";

  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    status,
    checks,
    violations,
    safeForManualApprovalReview: status === "pass" && !!packetReady,
    safeForAutomaticExecution: false,
    safeForNetlifyRetry: false,
    safeForLiveSend: false,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");

  console.log("=== validate-production-baseline-execution-packet.mjs ===");
  console.log(status === "pass" ? "PASS" : "FAIL");
  if (violations.length) violations.forEach((v) => console.error(" violation:", v));
  checks.filter((c) => !c.ok).forEach((c) => console.error(" ", c.id, "→", c.detail));
  if (status === "fail") process.exit(1);
}

main();
