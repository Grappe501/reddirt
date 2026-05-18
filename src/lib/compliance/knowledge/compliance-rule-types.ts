export type ComplianceRuleVerificationStatus =
  | "verified_authoritative"
  | "campaign_policy"
  | "needs_legal_review"
  | "placeholder"
  | "missing"
  | "downloaded_official_source"
  | "official_link_verified"
  | "broken_link"
  | "manual_needed";

export type ComplianceRuleSource = {
  id: string;
  title: string;
  sourceType:
    | "arkansas_ethics"
    | "arkansas_sos"
    | "arkansas_code"
    | "campaign_policy"
    | "internal_notes";
  sourceAgency?:
    | "arkansas_ethics_commission"
    | "arkansas_secretary_of_state"
    | "arkansas_code"
    | "campaign_policy"
    | "internal_notes";
  url?: string;
  filePath?: string;
  retrievedAt?: string;
  effectiveDate?: string;
  sourceFormat?: "html" | "pdf" | "docx" | "csv" | "unknown";
  citationLabel?: string;
  verifiedBy?: string;
  reviewedByInitials?: string;
  reviewedAt?: string;
  reviewNote?: string;
  verificationStatus: ComplianceRuleVerificationStatus;
  topics?: ComplianceRuleTopic[];
  humanReviewStatus?: "pending" | "reviewed" | "stale";
  confidence?: "high" | "medium" | "low";
  linkStatus?: "ok" | "broken" | "unknown";
};

export type ComplianceRuleCitation = {
  sourceId: string;
  title: string;
  url?: string;
  page?: string;
  section?: string;
  quote?: string;
};

export type ComplianceRuleTopic =
  | "contribution"
  | "contribution_limits"
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
  | "donor_information"
  | "treasurer"
  | "certification"
  | "penalties"
  | "candidate_committee_setup"
  | "transfers"
  | "refunds"
  | "anonymous_contributions"
  | "fundraiser_event_receipts"
  | "vendor_documentation"
  | "unknown";

export type ComplianceRuleChunk = {
  id: string;
  sourceId: string;
  title: string;
  text: string;
  topic: ComplianceRuleTopic;
  subtopics?: string[];
  citations: ComplianceRuleCitation[];
  /** @deprecated use citations[].title — kept for backward compatibility */
  legacyCitations?: string[];
  ruleStatus: "authoritative" | "campaign_policy" | "needs_legal_review";
  verificationStatus?: "official_source_loaded" | "needs_legal_review" | "campaign_policy" | "placeholder";
  retrievedAt?: string;
  confidence?: "high" | "medium" | "low";
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
  hasOfficialSource?: boolean;
  legalReviewRequired?: boolean;
  lastUpdated?: string;
  lastRetrieved?: string;
  brokenLinkCount?: number;
  confidence?: "high" | "medium" | "low";
  nextAction: string;
};

export const requiredComplianceRuleTopics: ComplianceRuleTopic[] = [
  "contribution",
  "contribution_limits",
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
  "donor_information",
  "treasurer",
  "certification",
  "penalties",
  "candidate_committee_setup",
  "transfers",
  "refunds",
  "anonymous_contributions",
  "fundraiser_event_receipts",
  "vendor_documentation",
];

export const complianceRuleTopicLabels: Record<ComplianceRuleTopic, string> = {
  contribution: "Contribution",
  contribution_limits: "Contribution limits",
  expenditure: "Expenditure",
  cash: "Cash contributions",
  check: "Check contributions",
  credit_card: "Credit card contributions",
  in_kind: "In-kind contributions",
  loan: "Loans",
  debt: "Debts / obligations",
  filing_deadline: "Filing deadlines",
  reporting: "Reporting requirements",
  recordkeeping: "Recordkeeping",
  amendment: "Amendments",
  reimbursement: "Reimbursements",
  donor_information: "Donor information",
  treasurer: "Treasurer duties",
  certification: "Certification",
  penalties: "Penalties / late filing",
  candidate_committee_setup: "Candidate committee setup",
  transfers: "Transfers",
  refunds: "Refunds / returns",
  anonymous_contributions: "Anonymous contributions",
  fundraiser_event_receipts: "Fundraiser / event receipts",
  vendor_documentation: "Vendor documentation",
  unknown: "Unknown",
};
