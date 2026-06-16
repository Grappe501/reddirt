/**
 * Community Workbench v1.3 — pilot preflight (deploy readiness file checks)
 * Run: npm run election-plan:community-workbench:pilot-preflight
 */
import {
  deployReadinessSummary,
  runDeployReadinessChecks,
} from "../../src/lib/election-plan/community-workbench/pilot-validation";

const checks = runDeployReadinessChecks();
const summary = deployReadinessSummary(checks);
let failed = 0;

console.log("Community Workbench pilot preflight (deploy readiness)\n");

for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"} — ${check.label}${check.detail ? `: ${check.detail}` : ""}`);
  if (!check.pass) failed += 1;
}

console.log(`\nDeploy readiness: ${summary.passed}/${summary.total}`);
console.log("\nNext: apply Netlify env scoping in UI — docs/COMMUNITY_WORKBENCH_V1_3_PILOT.md §1");

if (failed > 0) {
  process.exit(1);
}
