import { writeFilingReadinessReport } from "../../src/lib/compliance/filing-readiness/build-filing-readiness-report";
import { explainFilingReadiness } from "../../src/lib/compliance/ai/compliance-agent/filing-readiness-agent";

async function main() {
  const report = await writeFilingReadinessReport();
  if (!report.id || !report.generatedAt) throw new Error("Filing readiness report is missing identity fields.");
  if (!["green", "yellow", "red"].includes(report.overallStatus)) throw new Error("Invalid filing readiness status.");
  if (report.humanReviewRequired !== true) throw new Error("Filing readiness must require human review.");
  const requiredSections = ["contributions", "expenses", "reimbursements", "cash", "checks", "goodchange", "bank", "receipts", "donor-info", "vendor-w9", "rule-coverage", "filing-period", "human-review"];
  const missingSections = requiredSections.filter((id) => !report.sections.some((section) => section.id === id));
  if (missingSections.length) throw new Error(`Missing filing readiness sections: ${missingSections.join(", ")}`);
  const agent = explainFilingReadiness(report);
  if (agent.humanReviewRequired !== true) throw new Error("Filing readiness agent must require human review.");
  console.log(JSON.stringify({
    status: "ok",
    overallStatus: report.overallStatus,
    blockers: report.blockers.length,
    warnings: report.warnings.length,
    ruleCoverage: report.ruleCoverage,
    agentSummary: agent.summary,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
