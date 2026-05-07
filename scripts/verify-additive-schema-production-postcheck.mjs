/**
 * Offline verifier for data/additive-schema-production-postcheck-plan.json shape only.
 * Does not connect to any database.
 * REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PLAN = path.join(ROOT, "data/additive-schema-production-postcheck-plan.json");

function main() {
  if (!fs.existsSync(PLAN)) {
    console.error("FAIL missing data/additive-schema-production-postcheck-plan.json — run build script first");
    process.exit(1);
  }
  let j;
  try {
    j = JSON.parse(fs.readFileSync(PLAN, "utf8"));
  } catch {
    console.error("FAIL invalid JSON");
    process.exit(1);
  }
  const ok =
    j.schemaVersion === "1.0" &&
    typeof j.slice === "string" &&
    Array.isArray(j.phases) &&
    j.phases.length > 0 &&
    j.phases.every((p) => p.id && p.title && Array.isArray(p.checks));

  if (!ok) {
    console.error("FAIL postcheck plan shape");
    process.exit(1);
  }
  console.log("PASS verify-additive-schema-production-postcheck.mjs");
  console.log(" ", path.relative(ROOT, PLAN));
  process.exit(0);
}

main();
