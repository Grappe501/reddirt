/**
 * Validates data/shadow-db-migration-proof.json (no secrets, required fields).
 * REDDIRT-SHADOW-PROOF-ARTIFACT-CONSOLIDATION-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-SHADOW-PROOF-ARTIFACT-CONSOLIDATION-1.0";
const PROOF = path.join(ROOT, "data/shadow-db-migration-proof.json");
const OUT = path.join(ROOT, "data/shadow-db-migration-proof-validation.json");

function containsSecretLike(s) {
  if (typeof s !== "string") return false;
  if (/postgres(ql)?:\/\//i.test(s)) return true;
  if (/password\s*=\s*[^\s]+/i.test(s) && s.length > 20) return true;
  return false;
}

function walkStrings(obj, fn) {
  if (obj === null || obj === undefined) return;
  if (typeof obj === "string") fn(obj);
  else if (Array.isArray(obj)) obj.forEach((x) => walkStrings(x, fn));
  else if (typeof obj === "object") Object.values(obj).forEach((x) => walkStrings(x, fn));
}

function main() {
  const checks = [];
  const violations = [];
  let data = null;
  try {
    data = JSON.parse(fs.readFileSync(PROOF, "utf8"));
  } catch (e) {
    violations.push(String(e.message || e));
  }

  const push = (id, ok, detail) => checks.push({ id, ok, detail: ok ? "ok" : detail });

  if (!data) {
    push("file_readable", false, "missing or invalid JSON");
  } else {
    push("slice", data.slice === SLICE, `expected ${SLICE}`);
    push("status_pass", data.status === "pass", `status ${data.status}`);
    push("productionMutationAttempted_false", data.productionMutationAttempted === false, "must be false");
    push("migrateDeploy_success", data.migrateDeploy?.success === true, "migrateDeploy.success");
    push("applied_count_71", data.migrateDeploy?.appliedMigrationsCount === 71, `count ${data.migrateDeploy?.appliedMigrationsCount}`);
    push("diff_clean", data.diffFromMigrationsToUrl?.clean === true, "diff clean");
    if (data.offlineConsolidatedAttestation === true) {
      push("offline_flag_consistent", data.mode === "offline_consolidated_attestation", "mode must match offline consolidation");
    }
    walkStrings(data, (s) => {
      if (containsSecretLike(s)) violations.push("secret-like substring in JSON value");
    });
  }

  const status = checks.every((c) => c.ok) && violations.length === 0 ? "pass" : "fail";
  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    status,
    checks,
    violations,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");

  console.log(status === "pass" ? "PASS validate-shadow-db-migration-proof.mjs" : "FAIL validate-shadow-db-migration-proof.mjs");
  console.log(" ", path.relative(ROOT, OUT));
  if (status === "fail") {
    violations.forEach((v) => console.error(" violation:", v));
    checks.filter((c) => !c.ok).forEach((c) => console.error(" ", c.id, c.detail));
    process.exit(1);
  }
}

main();
