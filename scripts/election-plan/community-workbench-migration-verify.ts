/**
 * Community Workbench — migration verification for production pilot
 * Run: npm run election-plan:community-workbench:migration-verify
 */
import { execSync } from "node:child_process";

import { verifyMigrationFilesOnDisk } from "../../src/lib/election-plan/community-workbench/pilot-validation";
import { COMMUNITY_WORKBENCH_MIGRATIONS } from "../../src/lib/election-plan/community-workbench/pilot";

const fileCheck = verifyMigrationFilesOnDisk();
let failed = 0;

console.log("Community Workbench migration verification\n");

for (const name of COMMUNITY_WORKBENCH_MIGRATIONS) {
  const pass = !fileCheck.missing.includes(name);
  console.log(`${pass ? "PASS" : "FAIL"} — migration file: ${name}`);
  if (!pass) failed += 1;
}

if (fileCheck.missing.length > 0 && fileCheck.missing[0] !== "prisma/migrations") {
  console.log(`\nMissing: ${fileCheck.missing.join(", ")}`);
}

let dbStatus = "skipped";
try {
  const out = execSync("npx prisma migrate status", {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  dbStatus = out.includes("Database schema is up to date") ? "up to date" : "review needed";
  console.log(`\nDB migrate status: ${dbStatus}`);
  if (!out.includes("Database schema is up to date")) {
    console.log(out.slice(0, 800));
  }
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("DATABASE_URL")) {
    console.log("\nDB migrate status: skipped (DATABASE_URL not set — file check only)");
  } else {
    console.log(`\nDB migrate status: review needed`);
    failed += 1;
  }
}

console.log("");
if (failed > 0 || !fileCheck.pass) {
  console.log("Migration verification: FAILED");
  process.exit(1);
}
console.log("Migration verification: PASSED (files on disk)");
