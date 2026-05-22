/**
 * Structured Arkansas campaign finance knowledge for the compliance AI expert.
 * NOT legal advice. Humans must verify official sources on /admin/compliance/rules.
 */

export type RuleKnowledgeStatus =
  | "source_backed"
  | "confirmed_in_app"
  | "app_policy"
  | "campaign_policy"
  | "needs_human_verification"
  | "legal_review_needed";

export type ArkansasKnowledgeTopic = {
  id: string;
  title: string;
  summary: string;
  status: RuleKnowledgeStatus;
  mapsToAppChecks: string[];
  humanBoundary: string;
  officialSourcePlaceholder?: string;
};

export const OFFICIAL_ARKANSAS_SOURCES_TO_REVIEW = [
  "Arkansas Ethics Commission — campaign finance reporting guidance (verify current URL on Rules page)",
  "Arkansas campaign finance contribution limits and disclosure rules (human verification required)",
  "Filing deadlines and amendment rules for the active reporting period",
  "In-kind contribution valuation and reporting requirements",
  "Expenditure documentation and reimbursement rules",
  "Recordkeeping and bank reconciliation expectations for committees",
] as const;

export const ARKANSAS_COMPLIANCE_TOPICS: ArkansasKnowledgeTopic[] = [
  {
    id: "contributions",
    title: "Contributions",
    summary: "Track donor/source identity, amount, date, and medium. GoodChange and check/cash intakes feed approval queues.",
    status: "needs_human_verification",
    mapsToAppChecks: ["goodchange_contribution approval", "check_contribution approval", "cash intake", "confidence scoring"],
    humanBoundary: "Treasurer confirms donor identity and legality before filing export.",
    officialSourcePlaceholder: "Link official ACE contribution rules in rules corpus",
  },
  {
    id: "expenditures",
    title: "Expenditures",
    summary: "Receipt-backed expenses with vendor, amount, purpose. Tips and payment method affect classification.",
    status: "needs_human_verification",
    mapsToAppChecks: ["receipt_expense approval", "receipt AI intake", "category classifier"],
    humanBoundary: "Human approves business purpose and documentation adequacy.",
    officialSourcePlaceholder: "Link official expenditure reporting rules",
  },
  {
    id: "in_kind",
    title: "In-kind contributions",
    summary: "Non-cash items require fair market value and donor attribution on staged pages/images.",
    status: "needs_human_verification",
    mapsToAppChecks: ["in_kind_contribution approval", "in-kind image intake"],
    humanBoundary: "Valuation and donor ID require human sign-off.",
  },
  {
    id: "reconciliation",
    title: "Bank reconciliation",
    summary: "Bank credits should match GoodChange payout batches with documented ambiguous/unmatched resolution.",
    status: "app_policy",
    mapsToAppChecks: ["bank CSV readiness", "reconciliation workbench", "bank rehearsal matcher"],
    humanBoundary: "Treasurer locks matches; AI suggests only.",
  },
  {
    id: "reporting_readiness",
    title: "Reporting / filing readiness",
    summary: "Filing page aggregates hard gates: approvals, rules, storage, reconciliation — red until source-backed green.",
    status: "confirmed_in_app",
    mapsToAppChecks: ["filing-readiness hard gates", "filing blocker burn-down"],
    humanBoundary: "Filing export requires compliance officer — not legal certification.",
  },
  {
    id: "rule_review",
    title: "Rule topic review",
    summary: "Corpus topics must be marked reviewed for campaign workflow before relying on automated rule_review clears.",
    status: "confirmed_in_app",
    mapsToAppChecks: ["rules page review state", "rule_review queue guard", "rule topic packet"],
    humanBoundary: "No batch approval of rule_review items; override requires documented review.",
  },
  {
    id: "recordkeeping",
    title: "Recordkeeping",
    summary: "Evidence images and imports stay private; JSON/DB holds metadata; exports are gated.",
    status: "app_policy",
    mapsToAppChecks: ["storage health", "gitignore PII paths", "operator redacted exports"],
    humanBoundary: "Do not commit donor JSON or bank CSV to git.",
  },
];

export function getArkansasKnowledgeSummary(): {
  topicCount: number;
  needsVerification: number;
  officialSourcesListed: number;
} {
  return {
    topicCount: ARKANSAS_COMPLIANCE_TOPICS.length,
    needsVerification: ARKANSAS_COMPLIANCE_TOPICS.filter((t) => t.status === "needs_human_verification" || t.status === "legal_review_needed").length,
    officialSourcesListed: OFFICIAL_ARKANSAS_SOURCES_TO_REVIEW.length,
  };
}
