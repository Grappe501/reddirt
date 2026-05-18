export type ComplianceAIToolOutput = {
  confidence: "high" | "medium" | "low";
  missingData: string[];
  warnings: string[];
  nextAction: string;
  humanApprovalRequired: true;
  citations?: string[];
};

export type ComplianceAIToolDefinition = {
  id: string;
  name: string;
  purpose: string;
  requiresCitationForRuleClaims: boolean;
  outputContract: ComplianceAIToolOutput;
};

const baseOutput: ComplianceAIToolOutput = {
  confidence: "low",
  missingData: [],
  warnings: ["Human review required. AI cannot approve, certify, reconcile, or file."],
  nextAction: "Route to human compliance review.",
  humanApprovalRequired: true,
};

export const advancedComplianceAITools: ComplianceAIToolDefinition[] = [
  ["receipt-ocr-extractor", "Receipt OCR Extractor"],
  ["cash-slip-ocr-extractor", "Cash Slip OCR Extractor"],
  ["check-ocr-extractor", "Check OCR Extractor"],
  ["column-mapper", "Column Mapper"],
  ["money-classifier", "Money Classifier"],
  ["duplicate-detector", "Duplicate Detector"],
  ["missing-documentation-detector", "Missing Documentation Detector"],
  ["w9-requirement-checker", "W-9 Requirement Checker"],
  ["1099-risk-detector", "1099 Risk Detector"],
  ["bank-match-assistant", "Bank Match Assistant"],
  ["variance-analyzer", "Variance Analyzer"],
  ["filing-readiness-advisor", "Filing Readiness Advisor"],
  ["rule-retrieval-tool", "Rule Retrieval Tool"],
  ["citation-generator", "Citation Generator"],
  ["amendment-impact-analyzer", "Amendment Impact Analyzer"],
  ["compliance-risk-scorer", "Compliance Risk Scorer"],
  ["task-prioritizer", "Task Prioritizer"],
  ["report-narrative-writer", "Report Narrative Writer"],
  ["candidate-guidance-assistant", "Candidate Guidance Assistant"],
  ["treasurer-checklist-generator", "Treasurer Checklist Generator"],
  ["audit-packet-builder", "Audit Packet Builder"],
  ["goodchange-fee-analyzer", "GoodChange Fee Analyzer"],
  ["contribution-completeness-checker", "Contribution Completeness Checker"],
  ["reimbursement-eligibility-checker", "Reimbursement Eligibility Checker"],
  ["human-approval-guard", "Human Approval Guard"],
].map(([id, name]) => ({
  id,
  name,
  purpose: `${name} supports compliance staff with extraction, classification, review, reporting, or decision support.`,
  requiresCitationForRuleClaims: true,
  outputContract: baseOutput,
}));

export function validateComplianceAIToolOutput(output: ComplianceAIToolOutput): ComplianceAIToolOutput {
  return {
    ...output,
    humanApprovalRequired: true,
    warnings: [...new Set([...output.warnings, "Human approval required before operational or filing action."])],
  };
}
