/**
 * BUDGET-1 + FIN-1: Budget / spend governance and **category → wire** mapping for ledger lines.
 * No vendor APIs, no ad platform hooks in this packet.
 * @see docs/budget-and-spend-governance-foundation.md
 * @see docs/budget-agent-ingest-map.md
 * @see docs/financial-ledger-foundation.md
 */

export const BUDGET1_PACKET = "BUDGET-1" as const;

/** Cost-bearing areas every future wire should eventually tag (governance + variance). */
export const CostBearingWireKind = {
  FUNDRAISING_VENDOR: "fundraising_vendor",
  DIGITAL_ADVERTISING: "digital_advertising",
  TEXT_CALL_EMAIL_VENDOR: "text_call_email_vendor",
  EVENT_COST: "event_cost",
  TRAVEL_MILEAGE_REIMBURSEMENT: "travel_mileage_reimbursement",
  CONTENT_MEDIA: "content_media",
  SOFTWARE_PLATFORM: "software_platform",
  CONSULTANT_CONTRACTOR: "consultant_contractor",
  PRINT_MAIL: "print_mail",
  OTHER: "other",
} as const;
export type CostBearingWireKindId =
  (typeof CostBearingWireKind)[keyof typeof CostBearingWireKind];

/** Conceptual planning vs execution — persistence later. */
export const BudgetEnforcementStage = {
  PLAN: "plan",
  COMMITMENT: "commitment",
  ACTUAL: "actual",
} as const;
export type BudgetEnforcementStageId =
  (typeof BudgetEnforcementStage)[keyof typeof BudgetEnforcementStage];

/**
 * Default mapping from `FinancialTransaction.category` (normalized slug) to spend rail.
 * Staff can use free-form categories; unmapped values fall back to `OTHER` (governance-safe).
 * @see docs/financial-ledger-foundation.md
 */
export const DEFAULT_LEDGER_CATEGORY_TO_WIRE: Record<string, CostBearingWireKindId> = {
  // Events / field
  event: CostBearingWireKind.EVENT_COST,
  event_cost: CostBearingWireKind.EVENT_COST,
  festival: CostBearingWireKind.EVENT_COST,
  // Comms & ads
  digital_ad: CostBearingWireKind.DIGITAL_ADVERTISING,
  digital_ads: CostBearingWireKind.DIGITAL_ADVERTISING,
  advertising: CostBearingWireKind.DIGITAL_ADVERTISING,
  email_vendor: CostBearingWireKind.TEXT_CALL_EMAIL_VENDOR,
  sms_vendor: CostBearingWireKind.TEXT_CALL_EMAIL_VENDOR,
  // Fundraising tools
  fundraising: CostBearingWireKind.FUNDRAISING_VENDOR,
  processor_fee: CostBearingWireKind.FUNDRAISING_VENDOR,
  // Media / content
  content: CostBearingWireKind.CONTENT_MEDIA,
  media: CostBearingWireKind.CONTENT_MEDIA,
  // Ops
  software: CostBearingWireKind.SOFTWARE_PLATFORM,
  saas: CostBearingWireKind.SOFTWARE_PLATFORM,
  contractor: CostBearingWireKind.CONSULTANT_CONTRACTOR,
  consultant: CostBearingWireKind.CONSULTANT_CONTRACTOR,
  print: CostBearingWireKind.PRINT_MAIL,
  mail: CostBearingWireKind.PRINT_MAIL,
  // Travel
  mileage: CostBearingWireKind.TRAVEL_MILEAGE_REIMBURSEMENT,
  travel: CostBearingWireKind.TRAVEL_MILEAGE_REIMBURSEMENT,
  reimbursement: CostBearingWireKind.TRAVEL_MILEAGE_REIMBURSEMENT,
};

export function normalizeLedgerCategoryKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Map a persisted or draft ledger row to a `CostBearingWireKind` for dashboards and agent narration.
 * Accepts any object with a `category` string (e.g. Prisma `FinancialTransaction`).
 */
export function getBudgetWireForTransaction(t: { category: string }): CostBearingWireKindId {
  const k = normalizeLedgerCategoryKey(t.category);
  return DEFAULT_LEDGER_CATEGORY_TO_WIRE[k] ?? CostBearingWireKind.OTHER;
}
