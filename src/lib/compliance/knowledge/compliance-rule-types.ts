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
  verificationStatus: "unverified" | "verified" | "needs_review";
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
  rulesNeedingVerification: number;
  warning: string;
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
