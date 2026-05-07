/**
 * Offline validation of additive schema production execution packet artifacts.
 * REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { analyzeCandidateSql, evaluateCloneProofHardened } from "./lib/additive-candidate-sql-guards.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0";
const PACKET = path.join(ROOT, "data/additive-schema-production-execution-packet.json");
const GATES = path.join(ROOT, "data/additive-schema-production-approval-gates.json");
const CLONE = path.join(ROOT, "data/additive-schema-clone-test-result.json");
const CANDIDATE = path.join(ROOT, "data/sql/additive-schema-install-candidate.sql");
const GUARDED = path.join(ROOT, "scripts/run-additive-schema-production-guarded.mjs");
const OUT = path.join(ROOT, "data/additive-schema-production-execution-packet-validation.json");

const REQUIRED_DOCS = [
  "docs/additive-schema-production-execution-packet.md",
  "docs/additive-schema-production-approval-gates.md",
  "docs/additive-schema-production-runbook.md",
  "docs/additive-schema-production-postcheck-plan.md",
  "docs/post-additive-schema-netlify-readiness.md",
  "develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md",
];

const APPROVAL_PHRASE = "STEVE_APPROVES_REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION";

function sha256File(p) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(p));
  return h.digest("hex");
}

function main() {
  const generatedAt = new Date().toISOString();
  const checks = [];
  const violations = [];
  const push = (id, ok, detail) => {
    checks.push({ id, ok, detail: ok ? "ok" : detail });
    if (!ok) violations.push(`${id}: ${detail}`);
  };

  if (!fs.existsSync(PACKET)) {
    const out = {
      schemaVersion: "1.0",
      slice: SLICE,
      generatedAt,
      status: "fail",
      checks: [{ id: "packet_exists", ok: false, detail: "missing packet JSON" }],
      violations: ["missing packet JSON"],
      safeForManualApprovalReview: false,
      safeForAutomaticExecution: false,
      safeForNetlifyRetry: false,
      safeForLiveSend: false,
    };
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
    console.error("FAIL validate-additive-schema-production-execution-packet.mjs — missing packet");
    process.exit(1);
  }

  let packet;
  try {
    packet = JSON.parse(fs.readFileSync(PACKET, "utf8"));
  } catch {
    const out = {
      schemaVersion: "1.0",
      slice: SLICE,
      generatedAt,
      status: "fail",
      checks: [{ id: "packet_json", ok: false, detail: "invalid JSON" }],
      violations: ["invalid packet JSON"],
      safeForManualApprovalReview: false,
      safeForAutomaticExecution: false,
      safeForNetlifyRetry: false,
      safeForLiveSend: false,
    };
    fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
    console.error("FAIL invalid packet JSON");
    process.exit(1);
  }

  push("slice", packet.slice === SLICE, `expected slice ${SLICE}`);
  push("schemaVersion", packet.schemaVersion === "1.0", "schemaVersion must be 1.0");
  push("productionMutationFalse", packet.productionMutationExecutedByThisPacket === false, "must be false");
  push("manualOnly", packet.manualExecutionOnly === true, "manualExecutionOnly");
  push("autoBlocked", packet.automaticExecutionAllowed === false, "automaticExecutionAllowed false");
  push("execNotApproved", packet.productionExecutionApprovedByThisPacket === false, "productionExecutionApprovedByThisPacket false");
  push("netlifyNotApproved", packet.netlifyRetryApprovedByThisPacket === false, "netlifyRetryApprovedByThisPacket false");
  push("liveSendNotApproved", packet.liveSendApprovedByThisPacket === false, "liveSendApprovedByThisPacket false");
  push("approvalPhrase", packet.approvalPhraseRequired === APPROVAL_PHRASE, "approval phrase mismatch");

  const e = packet.eligibility || {};
  push("eligibilityShape", typeof e.readyForProductionExecutionPacket === "boolean", "eligibility.readyForProductionExecutionPacket");
  push("unsafeRejected", e.unsafeDiffRejected === true, "unsafeDiffRejected");
  push("validationPassed", e.candidateValidationPassed === true, "candidateValidationPassed");
  push("clonePassedMeaningful", e.productionLikeCloneProofPassed === true, "productionLikeCloneProofPassed must be true");

  if (e.readyForProductionExecutionPacket === true) {
    push("whenReady_cloneAlso", e.productionLikeCloneProofPassed === true, "clone must pass when packet ready");
    push("whenReady_highValue", e.highValueProtectionPassed === true, "highValue when ready");
  }

  let hashMatch = null;
  if (fs.existsSync(CANDIDATE) && packet.candidateSqlSha256) {
    const disk = sha256File(CANDIDATE);
    hashMatch = disk === packet.candidateSqlSha256;
    push("candidate_sha256_match", hashMatch, "candidate file hash differs from packet");
  } else {
    push("candidate_sha256_present", !!packet.candidateSqlSha256, "packet should record candidateSqlSha256");
  }

  push("candidate_file_exists", fs.existsSync(CANDIDATE), "missing candidate SQL file");
  if (fs.existsSync(CANDIDATE)) {
    const a = analyzeCandidateSql(fs.readFileSync(CANDIDATE, "utf8"));
    push("candidate_no_destructive", a.noDestructiveViolations && a.dropCount === 0 && a.truncateCount === 0, "destructive patterns in candidate");
  }

  let gatesPending = false;
  if (fs.existsSync(GATES)) {
    try {
      const g = JSON.parse(fs.readFileSync(GATES, "utf8"));
      const arr = Array.isArray(g.gates) ? g.gates : [];
      gatesPending = arr.length === 13 && arr.every((x) => x.status === "pending" && x.required === true && typeof x.key === "string");
      push("gates_thirteen_pending", gatesPending, "expected 13 pending gates with key+required");
    } catch {
      push("gates_json", false, "invalid gates JSON");
    }
  } else {
    push("gates_file", false, "missing approval gates JSON");
  }

  let cloneMeaningful = false;
  if (fs.existsSync(CLONE)) {
    try {
      const c = JSON.parse(fs.readFileSync(CLONE, "utf8"));
      cloneMeaningful = evaluateCloneProofHardened(c).passed;
    } catch {
      cloneMeaningful = false;
    }
  }
  push("clone_proof_meaningful", cloneMeaningful, "clone artifact fails hardened gates");

  for (const relDoc of REQUIRED_DOCS) {
    const p = path.join(ROOT, relDoc);
    push(`doc:${relDoc}`, fs.existsSync(p), "missing doc");
  }

  push("guarded_script_exists", fs.existsSync(GUARDED), "missing guarded runner script");
  if (fs.existsSync(GUARDED)) {
    const src = fs.readFileSync(GUARDED, "utf8");
    push("guarded_has_phrase", src.includes(APPROVAL_PHRASE), "guarded runner must embed approval phrase constant");
  }

  const status = checks.every((c) => c.ok) ? "pass" : "fail";
  const safeForManualApprovalReview = status === "pass";

  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    status,
    checks,
    violations,
    safeForManualApprovalReview,
    safeForAutomaticExecution: false,
    safeForNetlifyRetry: false,
    safeForLiveSend: false,
    packetExecutionPacketStatus: packet.executionPacketStatus ?? null,
    packetReadyFlag: e.readyForProductionExecutionPacket ?? null,
    candidateSha256Match: hashMatch,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");

  console.log(status === "pass" ? "PASS validate-additive-schema-production-execution-packet.mjs" : "FAIL validate-additive-schema-production-execution-packet.mjs");
  console.log(" ", path.relative(ROOT, OUT));
  process.exit(status === "pass" ? 0 : 1);
}

main();
