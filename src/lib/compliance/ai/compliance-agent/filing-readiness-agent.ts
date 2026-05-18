import type { FilingReadinessReport } from "../../filing-readiness/filing-readiness-types";

export type FilingReadinessAgentResult = {
  summary: string;
  blockers: string[];
  warnings: string[];
  nextActions: string[];
  questionsForComplianceOfficer: string[];
  ruleCitationGaps: string[];
  humanReviewRequired: true;
};

export function explainFilingReadiness(report: FilingReadinessReport): FilingReadinessAgentResult {
  const redSections = report.sections.filter((section) => section.status === "red");
  const yellowSections = report.sections.filter((section) => section.status === "yellow");
  return {
    summary:
      report.overallStatus === "green"
        ? "Filing readiness checks are green, but final filing still requires human compliance approval."
        : `Filing readiness is ${report.overallStatus}. Resolve blockers and review warnings before any final filing workflow.`,
    blockers: report.blockers,
    warnings: report.warnings,
    nextActions: [
      ...redSections.map((section) => section.nextAction ?? `Resolve ${section.label}.`),
      ...yellowSections.map((section) => section.nextAction ?? `Review ${section.label}.`),
      "Compliance officer must approve any override and final filing decision.",
    ],
    questionsForComplianceOfficer: [
      "Which filing period and due date should this readiness report use?",
      "Which rule topics have been verified against authoritative Arkansas sources?",
      "Are any red/yellow categories approved for documented override?",
    ],
    ruleCitationGaps: [...report.ruleCoverage.missingTopics, ...report.ruleCoverage.needsLegalReviewTopics],
    humanReviewRequired: true,
  };
}
