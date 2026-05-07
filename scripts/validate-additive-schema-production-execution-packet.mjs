/**
 * Offline validation of data/additive-schema-production-execution-packet.json
 * REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0";
const PACKET = path.join(ROOT, "data/additive-schema-production-execution-packet.json");
const CANDIDATE = path.join(ROOT, "data/sql/additive-schema-install-candidate.sql");
const OUT = path.join(ROOT, "data/additive-schema-production-execution-packet-validation.json");

function sha256File(p) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(p));
  return h.digest("hex");
}

function main() {
  const generatedAt = new Date().toISOString();
  const checks = [];
  const push = (id, ok, detail) => checks.push({ id, ok, detail: ok ? "ok" : detail });

  if (!fs.existsSync(PACKET)) {
    const out = {
      schemaVersion: "1.0",
      slice: SLICE,
      generatedAt,
      status: "fail",
      checks: [{ id: "packet_exists", ok: false, detail: "missing packet JSON" }],
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
  push("approvalPhrase", typeof packet.approvalPhraseRequired === "string" && packet.approvalPhraseRequired.length > 20, "approval phrase");

  const e = packet.eligibility || {};
  push("eligibilityShape", typeof e.readyForProductionExecutionPacket === "boolean", "eligibility.readyForProductionExecutionPacket");
  push("unsafeRejected", e.unsafeDiffRejected === true, "unsafeDiffRejected");
  push("validationPassed", e.candidateValidationPassed === true, "candidateValidationPassed");
  push("cloneFlagBoolean", typeof e.productionLikeCloneProofPassed === "boolean", "productionLikeCloneProofPassed boolean");

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

  const status = checks.every((c) => c.ok) ? "pass" : "fail";
  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    status,
    checks,
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
