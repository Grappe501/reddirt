/**
 * Offline: ensure hosted-db-proof.ts table lists and production constants match
 * scripts/run-migration-history-production-preflight.mjs (no DB, no secrets).
 * REDDIRT-HOSTED-DB-PROOF-HARDENING-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROOF_TS = path.join(ROOT, "src/lib/email-command-center/hosted-db-proof.ts");
const PREFLIGHT_MJS = path.join(ROOT, "scripts/run-migration-history-production-preflight.mjs");
const OUT = path.join(ROOT, "data/hosted-db-proof-contract-validation.json");

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function extractQuotedArrayEntries(source, anchor) {
  const i = source.indexOf(anchor);
  if (i === -1) throw new Error(`anchor not found: ${anchor}`);
  const from = source.slice(i);
  const open = from.indexOf("[");
  if (open === -1) throw new Error(`[ not found after ${anchor}`);
  let depth = 0;
  let end = -1;
  for (let j = open; j < from.length; j += 1) {
    const ch = from[j];
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        end = j;
        break;
      }
    }
  }
  if (end === -1) throw new Error("unclosed array");
  const inner = from.slice(open + 1, end);
  const out = [];
  for (const m of inner.matchAll(/"([^"]+)"/g)) out.push(m[1]);
  return out;
}

function main() {
  const generatedAt = new Date().toISOString();
  const checks = [];
  const violations = [];

  const proof = read(PROOF_TS);
  const pre = read(PREFLIGHT_MJS);

  const proofRef = (proof.match(/HOSTED_DB_PROOF_REQUIRED_PRODUCTION_PROJECT_REF = "([^"]+)"/) || [])[1];
  const preRef = (pre.match(/const REQUIRED_PRODUCTION_REF = "([^"]+)"/) || [])[1];
  const refOk = proofRef && proofRef === preRef;
  checks.push({ id: "production_ref_constant_parity", ok: refOk, detail: refOk ? "ok" : `proof=${proofRef} preflight=${preRef}` });
  if (!refOk) violations.push("production_ref_mismatch");

  const proofCount = Number((proof.match(/HOSTED_DB_PROOF_EXPECTED_PRISMA_MIGRATIONS_COUNT = (\d+)/) || [])[1]);
  // Optional: last committed preflight artifact should agree with expected count (71).
  const preflightJsonPath = path.join(ROOT, "data/migration-history-production-preflight.json");
  let artifactCount = null;
  if (fs.existsSync(preflightJsonPath)) {
    const j = JSON.parse(read(preflightJsonPath));
    artifactCount = typeof j.prismaMigrationsCount === "number" ? j.prismaMigrationsCount : null;
  }
  const countOk = proofCount === 71 && (artifactCount == null || artifactCount === proofCount);
  checks.push({
    id: "expected_prisma_migrations_count",
    ok: countOk,
    detail: countOk ? "ok" : `proof=${proofCount} artifact=${artifactCount}`,
  });
  if (!countOk) violations.push("prisma_migrations_count_mismatch");

  const proofLegacy = extractQuotedArrayEntries(proof, "HOSTED_DB_PROOF_LEGACY_PUBLIC_TABLES");
  const preLegacy = extractQuotedArrayEntries(pre, "const LEGACY =");
  const legacyOk = JSON.stringify(proofLegacy) === JSON.stringify(preLegacy);
  checks.push({
    id: "legacy_table_list_parity",
    ok: legacyOk,
    detail: legacyOk ? "ok" : "HOSTED_DB_PROOF_LEGACY_PUBLIC_TABLES !== LEGACY in preflight script",
  });
  if (!legacyOk) violations.push("legacy_table_list_mismatch");

  const proofNew = extractQuotedArrayEntries(proof, "HOSTED_DB_PROOF_NEW_APP_PUBLIC_TABLES");
  const preNew = extractQuotedArrayEntries(pre, "const NEW_APP =");
  const newOk = JSON.stringify(proofNew) === JSON.stringify(preNew);
  checks.push({
    id: "new_app_table_list_parity",
    ok: newOk,
    detail: newOk ? "ok" : "HOSTED_DB_PROOF_NEW_APP_PUBLIC_TABLES !== NEW_APP in preflight script",
  });
  if (!newOk) violations.push("new_app_table_list_mismatch");

  const extractFnOk = /export function extractSupabaseProjectRefFromDatabaseUrl/.test(proof);
  checks.push({ id: "exports_ref_parser", ok: extractFnOk, detail: extractFnOk ? "ok" : "missing extractSupabaseProjectRefFromDatabaseUrl" });
  if (!extractFnOk) violations.push("missing_ref_parser_export");

  const status = violations.length === 0 ? "pass" : "fail";
  const payload = {
    schemaVersion: "1.0",
    slice: "REDDIRT-HOSTED-DB-PROOF-HARDENING-1.0",
    generatedAt,
    mode: "offline_hosted_db_proof_contract_validation",
    status,
    checks,
    violations,
    sourcesRead: [path.relative(ROOT, PROOF_TS), path.relative(ROOT, PREFLIGHT_MJS)],
    productionMutationByThisScript: false,
    secretsPrinted: false,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");
  console.log(status === "pass" ? "PASS validate-hosted-db-proof-contract.mjs" : "FAIL validate-hosted-db-proof-contract.mjs");
  console.log(" ", path.relative(ROOT, OUT));
  process.exit(status === "pass" ? 0 : 1);
}

main();
