export type ComplianceAgentResult = {
  confidence: "high" | "medium" | "low";
  missingData: string[];
  humanApprovalRequired: true;
  ruleCitations: string[];
  answer: string;
};

export const complianceAgentTools = [
  "Receipt Extraction Tool",
  "Money Movement Classifier",
  "Missing Documentation Detector",
  "Filing Readiness Checker",
  "Arkansas Rule Retrieval Tool",
  "Rule Citation Tool",
  "Reconciliation Assistant",
  "Duplicate Detector",
  "Amendment Impact Analyzer",
  "Candidate Wizard Guide",
  "Cash/Check/GoodChange Intake Helper",
  "Receipt-to-Ledger Converter",
  "Compliance Risk Scorer",
  "Report Generator Assistant",
  "Human Approval Guard",
] as const;

export function humanApprovalGuard(input: { answer: string; citations?: string[]; missingData?: string[] }): ComplianceAgentResult {
  return {
    confidence: input.citations?.length ? "medium" : "low",
    missingData: input.missingData ?? (input.citations?.length ? [] : ["rule citation"]),
    humanApprovalRequired: true,
    ruleCitations: input.citations ?? [],
    answer: input.citations?.length ? input.answer : `${input.answer}\n\nNeeds rule verification. Do not present as legal fact.`,
  };
}
