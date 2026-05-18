import { advancedComplianceAITools } from "../../src/lib/compliance/ai/compliance-agent/advanced-tool-registry";
import { buildComplianceExecutiveScore } from "../../src/lib/compliance/scoring/compliance-score";
import { buildComplianceTasks } from "../../src/lib/compliance/tasks/build-compliance-tasks";
import { buildReconciliationWorkbench } from "../../src/lib/compliance/reconciliation/reconciliation-workbench-storage";
import { buildFilingReadinessReport } from "../../src/lib/compliance/filing-readiness/build-filing-readiness-report";

async function main() {
  const [score, tasks, reconciliation, readiness] = await Promise.all([
    buildComplianceExecutiveScore(),
    buildComplianceTasks(),
    buildReconciliationWorkbench(),
    buildFilingReadinessReport(),
  ]);
  if (advancedComplianceAITools.length !== 25) throw new Error("Expected 25 advanced compliance AI tools.");
  if (advancedComplianceAITools.some((tool) => tool.outputContract.humanApprovalRequired !== true)) throw new Error("AI tool guardrail missing.");
  if (readiness.humanReviewRequired !== true) throw new Error("Filing readiness must require human review.");
  if (score.score < 0 || score.score > 100) throw new Error("Compliance score out of range.");
  console.log(JSON.stringify({
    status: "ok",
    complianceScore: score.score,
    scoreStatus: score.status,
    tasks: tasks.length,
    savedMatches: reconciliation.matches.length,
    aiTools: advancedComplianceAITools.length,
    filingReadiness: readiness.overallStatus,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
