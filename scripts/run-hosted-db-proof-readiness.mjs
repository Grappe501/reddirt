/**
 * Writes hosted DB proof readiness summary (no DB connections, no secrets).
 * Reads migration-history preflight + post-migration-history Netlify retry packet when present.
 * REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0";
const PREFLIGHT = path.join(ROOT, "data/migration-history-production-preflight.json");
const RETRY_PACKET = path.join(ROOT, "data/post-migration-history-netlify-retry-packet.json");
const OUT = path.join(ROOT, "data/hosted-db-proof-readiness.json");

function load(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  const generatedAt = new Date().toISOString();
  const pf = load(PREFLIGHT);
  const retry = load(RETRY_PACKET);

  const preflightOk =
    !!pf &&
    pf.productionProjectRefConfirmed === true &&
    pf.readyForManualBaselineReview === true &&
    pf.pendingMigrationCount === 0;

  const packetReady = retry?.eligibility?.readyForOperatorNetlifyRetry === true;

  const body = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "hosted_db_proof_readiness_summary",
    productionMutationByThisScript: false,
    secretsPrinted: false,
    sources: {
      migrationHistoryProductionPreflight: "data/migration-history-production-preflight.json",
      postMigrationHistoryNetlifyRetryPacket: fs.existsSync(RETRY_PACKET)
        ? "data/post-migration-history-netlify-retry-packet.json"
        : null,
    },
    preflightSummaryPresent: !!pf,
    netlifyRetryPacketPresent: !!retry,
    recommendedAfterNetlifyGreenDeploy: [
      "Confirm build logs: prisma migrate deploy ran with no new migrations applied (pending was 0 pre-deploy).",
      "Run npm run email:db:diagnose from an operator shell with hosted DATABASE_URL (never paste the URI into chat or tickets).",
      "Optional HTTP proof: GET /api/admin/production-readiness/hosted-db with diagnostics bearer token — see docs/email-hosted-db-proof.md.",
      "Record attestation in operator-controlled develop_notes or ticket — booleans and counts only, no PII export.",
    ],
    operatorDocs: [
      "docs/hosted-db-proof-after-baseline.md",
      "docs/email-hosted-db-proof.md",
      "docs/email-command-center-launch-hardening.md",
    ],
    gates: {
      migrationHistoryPreflightClean: preflightOk,
      netlifyRetryPacketEligible: packetReady,
      readyForPostDeployHostedProofChecklist: preflightOk,
    },
    liveSendBlocked: true,
    note: "This JSON is planning-only; it does not call production or print DATABASE_URL.",
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(body, null, 2), "utf8");
  console.log("PASS run-hosted-db-proof-readiness.mjs");
  console.log(" ", path.relative(ROOT, OUT));
  process.exit(0);
}

main();
