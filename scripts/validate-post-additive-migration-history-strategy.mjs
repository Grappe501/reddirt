/**
 * Offline validation for post-additive migration history strategy artifacts.
 * REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0";
const STRATEGY = path.join(ROOT, "data/post-additive-migration-history-strategy.json");
const NETLIFY = path.join(ROOT, "data/post-additive-netlify-readiness-decision.json");
const OUT = path.join(ROOT, "data/post-additive-migration-history-strategy-validation.json");

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
  const push = (id, ok, detail) => checks.push({ id, ok, detail: ok ? "ok" : detail });

  const s = fs.existsSync(STRATEGY) ? load(STRATEGY) : null;
  const n = fs.existsSync(NETLIFY) ? load(NETLIFY) : null;

  push("strategy_exists", !!s, "missing data/post-additive-migration-history-strategy.json");
  push("strategy_slice", s?.slice === SLICE, "slice mismatch");
  push("strategy_no_mutate", s?.productionMutationByThisScript === false, "productionMutationByThisScript must be false");
  push("netlify_exists", !!n, "missing data/post-additive-netlify-readiness-decision.json");
  push("netlify_retry_false", n?.retryNetlifyProductionBuildNow === false, "retry must be false");
  push("netlify_not_approved", n?.retryApprovedByThisPacket === false, "retryApprovedByThisPacket false");
  push("live_send_blocked", n?.liveSendApprovedByThisPacket === false, "live send not approved");

  const status = checks.every((c) => c.ok) ? "pass" : "fail";
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        schemaVersion: "1.0",
        slice: SLICE,
        generatedAt,
        status,
        checks,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(status === "pass" ? "PASS validate-post-additive-migration-history-strategy.mjs" : "FAIL validate-post-additive-migration-history-strategy.mjs");
  console.log(" ", path.relative(ROOT, OUT));
  process.exit(status === "pass" ? 0 : 1);
}

main();
