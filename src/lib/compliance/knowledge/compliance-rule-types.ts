export type ComplianceRuleVerificationStatus =
  | "verified_authoritative"
  | "campaign_policy"
  | "needs_legal_review"
  | "placeholder"
  | "missing";

export type ComplianceRuleSource = {
  id: string;
  title: string;
  sourceType:
    | "arkansas_ethics"
    | "arkansas_sos"
    | "arkansas_code"
    | "campaign_policy"
    | "internal_notes";
  url?: string;
  filePath?: string;
  retrievedAt?: string;
  effectiveDate?: string;
  verifiedBy?: string;
  verificationStatus: ComplianceRuleVerificationStatus;
  topics?: ComplianceRuleTopic[];
};

export type ComplianceRuleTopic =
  | "contribution"
  | "expenditure"
  | "cash"
  | "check"
  | "credit_card"
  | "in_kind"
  | "loan"
  | "debt"
  | "filing_deadline"
  | "reporting"
  | "recordkeeping"
  | "amendment"
  | "reimbursement"
  | "unknown";

export type ComplianceRuleChunk = {
  id: string;
  sourceId: string;
  title: string;
  text: string;
  topic: ComplianceRuleTopic;
  citations: string[];
  ruleStatus: "authoritative" | "campaign_policy" | "needs_legal_review";
};

export type ComplianceRuleCorpus = {
  builtAt: string;
  sources: ComplianceRuleSource[];
  chunks: ComplianceRuleChunk[];
};

export type ComplianceRuleCoverageAudit = {
  builtAt: string;
  sourceCounts: Record<ComplianceRuleSource["sourceType"], number>;
  chunksIndexed: number;
  topicsCovered: ComplianceRuleTopic[];
  topicsMissing: ComplianceRuleTopic[];
  topicCoverage: ComplianceRuleTopicCoverage[];
  verifiedSources: number;
  campaignPolicySources: number;
  rulesNeedingVerification: number;
  warning: string;
};

export type ComplianceRuleTopicCoverage = {
  topic: ComplianceRuleTopic;
  label: string;
  status: ComplianceRuleVerificationStatus;
  sourceCount: number;
  chunkCount: number;
  verified: boolean;
  lastUpdated?: string;
  nextAction: string;
};

export const requiredComplianceRuleTopics: ComplianceRuleTopic[] = [
  "contribution",
  "expenditure",
  "cash",
  "check",
  "credit_card",
  "in_kind",
  "loan",
  "debt",
  "filing_deadline",
  "reporting",
  "recordkeeping",
  "amendment",
  "reimbursement",
];

export const complianceRuleTopicLabels: Record<ComplianceRuleTopic, string> = {
  contribution: "Contribution",
  expenditure: "Expenditure",
  cash: "Cash",
  check: "Check",
  credit_card: "Credit card",
  in_kind: "In-kind",
  loan: "Loan",
  debt: "Debt",
  filing_deadline: "Filing deadlines",
  reporting: "Reporting",
  recordkeeping: "Recordkeeping",
  amendment: "Amendment",
  reimbursement: "Reimbursement",
  unknown: "Unknown",
};
