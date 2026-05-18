import type { ComplianceRuleTopic } from "./compliance-rule-types";

export type ArkansasRuleSourceAgency =
  | "arkansas_ethics_commission"
  | "arkansas_secretary_of_state"
  | "arkansas_code"
  | "campaign_policy"
  | "internal_notes";

export type ArkansasRuleSourceFormat = "html" | "pdf" | "docx" | "csv" | "unknown";

export type ArkansasRuleSourceVerificationStatus =
  | "downloaded_official_source"
  | "official_link_verified"
  | "needs_legal_review"
  | "broken_link"
  | "manual_needed";

export type ArkansasRuleSourceRecord = {
  id: string;
  title: string;
  sourceAgency: ArkansasRuleSourceAgency;
  url: string;
  filePath?: string;
  retrievedAt: string;
  effectiveDate?: string;
  sourceFormat: ArkansasRuleSourceFormat;
  topics: ComplianceRuleTopic[];
  verificationStatus: ArkansasRuleSourceVerificationStatus;
  citationLabel: string;
  reviewedByInitials?: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export const arkansasOfficialRuleSources: ArkansasRuleSourceRecord[] = [
  {
    id: "aec-candidate-information",
    title: "Arkansas Ethics — Candidate Information",
    sourceAgency: "arkansas_ethics_commission",
    url: "https://www.arkansasethics.com/for-candidates-campaigns-and-committees/",
    retrievedAt: "2026-05-18",
    sourceFormat: "html",
    topics: ["contribution", "expenditure", "reporting", "filing_deadline", "recordkeeping", "donor_information", "contribution_limits", "treasurer"],
    verificationStatus: "official_link_verified",
    citationLabel: "Arkansas Ethics Commission — Candidates",
  },
  {
    id: "aec-reporting-calendars",
    title: "Arkansas Ethics — Reporting Calendars",
    sourceAgency: "arkansas_ethics_commission",
    url: "https://www.arkansasethics.com/reporting-calendars/",
    retrievedAt: "2026-05-18",
    sourceFormat: "html",
    topics: ["filing_deadline", "reporting"],
    verificationStatus: "official_link_verified",
    citationLabel: "Arkansas Ethics Commission — Reporting Calendars",
  },
  {
    id: "aec-campaign-finance-forms",
    title: "Arkansas Ethics — Forms and Instructions",
    sourceAgency: "arkansas_ethics_commission",
    url: "https://www.arkansasethics.com/forms/",
    retrievedAt: "2026-05-18",
    sourceFormat: "html",
    topics: ["contribution", "expenditure", "reporting", "recordkeeping", "amendment", "donor_information", "vendor_documentation", "fundraiser_event_receipts"],
    verificationStatus: "official_link_verified",
    citationLabel: "Arkansas Ethics Commission — Forms",
  },
  {
    id: "aec-campaign-finance-manual",
    title: "Arkansas Ethics — Campaign Finance Manual (PDF)",
    sourceAgency: "arkansas_ethics_commission",
    url: "https://www.arkansasethics.com/wp-content/uploads/2025/03/Campaign-Finance-Manual.pdf",
    retrievedAt: "2026-05-18",
    sourceFormat: "pdf",
    topics: ["contribution", "contribution_limits", "expenditure", "cash", "credit_card", "in_kind", "loan", "debt", "reporting", "recordkeeping", "reimbursement", "amendment", "donor_information", "treasurer", "transfers", "refunds", "anonymous_contributions", "fundraiser_event_receipts", "vendor_documentation"],
    verificationStatus: "manual_needed",
    citationLabel: "Arkansas Ethics Commission — Campaign Finance Manual",
  },
  {
    id: "aec-rules-campaign-finance-disclosure",
    title: "Arkansas Ethics Rules — Campaign Finance and Disclosure (CAR-RCFD)",
    sourceAgency: "arkansas_ethics_commission",
    url: "https://www.arkansasethics.com/laws-and-rules/",
    retrievedAt: "2026-05-18",
    sourceFormat: "html",
    topics: ["contribution", "contribution_limits", "expenditure", "reporting", "recordkeeping", "donor_information", "transfers", "refunds", "anonymous_contributions"],
    verificationStatus: "official_link_verified",
    citationLabel: "Arkansas Ethics Commission — CAR-RCFD Rules",
  },
  {
    id: "aec-rules-campaign-finance-disclosure-pdf",
    title: "CAR-RCFD-1 PDF (manual download target)",
    sourceAgency: "arkansas_ethics_commission",
    url: "http://www.arkansasethics.com/wp-content/uploads/2025/03/CAR-RCFD-1.pdf",
    retrievedAt: "2026-05-18",
    sourceFormat: "pdf",
    topics: ["contribution", "expenditure", "cash", "credit_card", "in_kind", "loan", "debt", "reporting", "recordkeeping", "reimbursement"],
    verificationStatus: "manual_needed",
    citationLabel: "Arkansas Ethics Commission — CAR-RCFD-1 PDF",
  },
  {
    id: "sos-financial-disclosure",
    title: "Arkansas SOS — Financial Disclosure",
    sourceAgency: "arkansas_secretary_of_state",
    url: "https://www.sos.arkansas.gov/elections/financial-disclosure/",
    retrievedAt: "2026-05-18",
    sourceFormat: "html",
    topics: ["filing_deadline", "reporting", "recordkeeping", "certification", "treasurer"],
    verificationStatus: "official_link_verified",
    citationLabel: "Arkansas Secretary of State — Financial Disclosure",
  },
  {
    id: "sos-candidate-filing",
    title: "Arkansas SOS — Candidate Filing",
    sourceAgency: "arkansas_secretary_of_state",
    url: "https://www.sos.arkansas.gov/elections/",
    retrievedAt: "2026-05-18",
    sourceFormat: "html",
    topics: ["filing_deadline", "reporting", "candidate_committee_setup"],
    verificationStatus: "official_link_verified",
    citationLabel: "Arkansas Secretary of State — Candidate Filing",
  },
  {
    id: "sos-ethics-commission-link",
    title: "Arkansas SOS — Ethics Commission",
    sourceAgency: "arkansas_secretary_of_state",
    url: "https://www.arkansasethics.com/",
    retrievedAt: "2026-05-18",
    sourceFormat: "html",
    topics: ["reporting", "filing_deadline"],
    verificationStatus: "official_link_verified",
    citationLabel: "Arkansas Secretary of State — Ethics Commission",
  },
  {
    id: "arkansas-code-title-7-ch21",
    title: "Arkansas Code Title 7 Chapter 21 (reference)",
    sourceAgency: "arkansas_code",
    url: "https://www.arkleg.state.ar.us/Home/FTPDocument?path=%2FElections%2F",
    retrievedAt: "2026-05-18",
    sourceFormat: "html",
    topics: ["contribution", "expenditure", "reporting", "penalties", "contribution_limits", "donor_information", "transfers", "refunds", "anonymous_contributions"],
    verificationStatus: "needs_legal_review",
    citationLabel: "Arkansas Legislature — Elections / Title 7 reference (verify current statute text)",
  },
  {
    id: "campaign-cash-policy-internal",
    title: "Campaign cash handling policy (internal)",
    sourceAgency: "campaign_policy",
    url: "",
    filePath: "docs/compliance/rules/cash.md",
    retrievedAt: "2026-05-18",
    sourceFormat: "unknown",
    topics: ["cash", "contribution"],
    verificationStatus: "needs_legal_review",
    citationLabel: "Campaign policy — cash intake",
  },
];

export const extendedRuleTopicKeywords: Record<ComplianceRuleTopic, string[]> = {
  contribution: ["contribution", "contribution limits", "anonymous contributions", "refunds", "returns", "transfers"],
  cash: ["cash", "cash contributions"],
  check: ["check", "check contributions"],
  credit_card: ["credit_card", "credit card contributions", "processor fee"],
  in_kind: ["in_kind", "in-kind contributions"],
  loan: ["loan", "loans", "candidate personal funds"],
  debt: ["debt", "debts", "obligations", "debt retirement"],
  expenditure: ["expenditure", "expenses", "vendor payments"],
  reimbursement: ["reimbursement", "staff reimbursement", "travel reimbursement"],
  filing_deadline: ["filing deadline", "filing deadlines", "reporting calendar", "due dates"],
  reporting: ["reporting", "reporting requirements", "campaign finance report"],
  recordkeeping: ["recordkeeping", "records", "documentation"],
  amendment: ["amendment", "amended report", "correction"],
  contribution_limits: ["contribution", "limits"],
  donor_information: ["contribution", "donor", "employer", "occupation", "address"],
  treasurer: ["treasurer", "certification", "duties"],
  penalties: ["penalty", "late filing", "filing_deadline"],
  certification: ["certification", "treasurer", "candidate committee setup"],
  transfers: ["transfer", "contribution", "expenditure"],
  refunds: ["refund", "returned contribution", "contribution"],
  anonymous_contributions: ["anonymous", "contribution"],
  fundraiser_event_receipts: ["contribution", "event", "fundraiser", "receipt"],
  vendor_documentation: ["expenditure", "vendor", "w-9", "contract", "invoice"],
  candidate_committee_setup: ["reporting", "committee", "setup"],
  unknown: [],
};

export function inferTopicsFromText(text: string): ComplianceRuleTopic[] {
  const lower = text.toLowerCase();
  const found = new Set<ComplianceRuleTopic>();
  for (const [topic, keywords] of Object.entries(extendedRuleTopicKeywords)) {
    if (keywords.some((keyword) => lower.includes(keyword))) found.add(topic as ComplianceRuleTopic);
  }
  if (!found.size) found.add("unknown");
  return [...found];
}