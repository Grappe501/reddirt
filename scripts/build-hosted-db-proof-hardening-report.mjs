/**
 * Offline machine report: documents hosted DB proof hardening contract (no DB, no secrets).
 * REDDIRT-HOSTED-DB-PROOF-HARDENING-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROOF_TS = path.join(ROOT, "src/lib/email-command-center/hosted-db-proof.ts");
const OUT_REPORT = path.join(ROOT, "data/hosted-db-proof-hardening-report.json");
const OUT_NEXT = path.join(ROOT, "data/communication-command-center-hosted-proof-next-steps.json");

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function main() {
  try {
  const generatedAt = new Date().toISOString();
  const proof = read(PROOF_TS);
  const ref = (proof.match(/HOSTED_DB_PROOF_REQUIRED_PRODUCTION_PROJECT_REF = "([^"]+)"/) || [])[1];
  const migCount = Number((proof.match(/HOSTED_DB_PROOF_EXPECTED_PRISMA_MIGRATIONS_COUNT = (\d+)/) || [])[1]);

  const report = {
    schemaVersion: "1.0",
    slice: "REDDIRT-HOSTED-DB-PROOF-HARDENING-1.0",
    generatedAt,
    mode: "offline_hosted_db_proof_hardening_report",
    productionMutationByThisScript: false,
    secretsPrinted: false,
    summary:
      "Hosted GET /api/admin/production-readiness/hosted-db proves canonical Supabase ref on DATABASE_URL, legacy + new public tables, auth.users metadata, and _prisma_migrations row count — read-only; no migrate; no secrets in JSON.",
    requiredProductionProjectRef: ref || null,
    expectedPrismaMigrationsRowCount: Number.isFinite(migCount) ? migCount : null,
    envFieldsReported: [
      "DATABASE_URL.present",
      "DATABASE_URL.supabaseProjectRefConfirmed (matches required ref)",
      "DATABASE_URL.parseHint (username_postgres_dot_ref | host_db_dot_ref | ref_unparsed)",
      "DIRECT_URL.present",
      "DIRECT_URL.supabaseProjectRefConfirmed when DIRECT_URL set",
      "DIRECT_URL.parseHint when derivable",
    ],
    payloadSections: [
      "env",
      "database (SELECT 1, optional User count boolean)",
      "productionSchemaContract",
      "proof.readOnly / mutatedData / migrationsRun / productionCanonical",
      "warnings",
      "nextRecommendedStep",
    ],
    operatorDocs: [
      "docs/hosted-db-proof-after-baseline.md",
      "docs/email-hosted-db-proof.md",
      "docs/email-command-center-launch-hardening.md",
    ],
    validationScript: "node scripts/validate-hosted-db-proof-contract.mjs",
    sourcesRead: [path.relative(ROOT, PROOF_TS)],
  };

  const nextSteps = {
    schemaVersion: "1.0",
    slice: "REDDIRT-HOSTED-DB-PROOF-HARDENING-1.0",
    generatedAt,
    mode: "communication_command_center_hosted_proof_next_steps",
    productionMutationByThisScript: false,
    liveSendApprovedByThisScript: false,
    netlifyDeployTriggeredByThisScript: false,
    secretsPrinted: false,
    afterHostedProofOk: [
      "Paste redacted JSON (no tokens) into develop_notes per docs/email-hosted-db-proof.md if claiming operator-hosted verification.",
      "If DIRECT_URL was absent in JSON, set Netlify DIRECT_URL for migrate/introspection discipline per deployment.md.",
      "Continue KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0: prisma migrate status + contact-import gate on the same hosted URLs from an operator shell.",
    ],
    ifHostedProofFails: [
      "Compare env.DATABASE_URL.supabaseProjectRefConfirmed and productionSchemaContract with docs/post-migration-history-deploy-checklist.md.",
      "Regenerate data/migration-history-production-preflight.json only from an operator machine with correct env (never paste DATABASE_URL into chat).",
    ],
    references: [
      "data/post-migration-history-netlify-retry-packet.json",
      "data/hosted-db-proof-contract-validation.json",
      "data/hosted-db-proof-hardening-report.json",
    ],
  };

  fs.mkdirSync(path.dirname(OUT_REPORT), { recursive: true });
  fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(OUT_NEXT, JSON.stringify(nextSteps, null, 2), "utf8");
  console.log("Wrote", path.relative(ROOT, OUT_REPORT));
  console.log("Wrote", path.relative(ROOT, OUT_NEXT));
  } catch (e) {
    console.error("build-hosted-db-proof-hardening-report.mjs failed:", e?.message || e);
    process.exit(1);
  }
}

main();
