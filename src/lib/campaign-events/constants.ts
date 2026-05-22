/**
 * Campaign event ledger constants — reimbursement rate is explicit per Steve (May 2026).
 * TODO(policy-align): reconcile with CAMPAIGN_POLICY_V1 mileage (0.725) when treasury approves.
 */
export const CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE = 0.7;

/** Env names for future Google Calendar write/sync (not used this pass). */
export const GOOGLE_CALENDAR_ENV = {
  tentativeCalendarId: "GOOGLE_CALENDAR_TENTATIVE_ID",
  officialCalendarId: "GOOGLE_CALENDAR_OFFICIAL_ID",
} as const;

export const MARCH_2026_LEDGER_PERIOD = "2026-03" as const;
export const APRIL_2026_LEDGER_PERIOD = "2026-04" as const;
export const MAY_2026_LEDGER_PERIOD = "2026-05" as const;

/** Months with travel reimbursement workflow (seed when JSON has rows). */
export const LEDGER_PERIOD_QUICK_LINKS = [
  MARCH_2026_LEDGER_PERIOD,
  APRIL_2026_LEDGER_PERIOD,
  MAY_2026_LEDGER_PERIOD,
] as const;

export const REIMBURSEMENT_CAMPAIGN_NAME = "Kelly Grappe for Secretary of State" as const;
export const REIMBURSEMENT_CANDIDATE_NAME = "Kelly Grappe" as const;

export const EDITABLE_FACT_SECTIONS = ["when", "where", "why", "who", "what", "travel"] as const;
export type EditableFactSectionId = (typeof EDITABLE_FACT_SECTIONS)[number];
