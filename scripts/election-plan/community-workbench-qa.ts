/**
 * Community Workbench v1.2 — field validation QA
 * Run: npm run election-plan:community-workbench:qa
 */
import {
  allFieldQAPassed,
  runCommunityWorkbenchFieldQA,
} from "../../src/lib/election-plan/community-workbench/field-qa";

const checks = runCommunityWorkbenchFieldQA();
let failed = 0;

for (const check of checks) {
  const mark = check.pass ? "PASS" : "FAIL";
  console.log(`${mark} — ${check.label}${check.detail ? `: ${check.detail}` : ""}`);
  if (!check.pass) failed += 1;
}

console.log("");
console.log(`Community Workbench field QA: ${checks.length - failed}/${checks.length} passed`);

if (!allFieldQAPassed(checks)) {
  process.exit(1);
}
