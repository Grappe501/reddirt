/**
 * Campaign Event Fact Card — portable types for JSON-backed ledger and future `CampaignEvent` persistence.
 * @see prisma/schema.prisma `CampaignEvent` (DB-backed OS path; not wired in March 2026 read-only pass)
 */
import type { CampaignCalendarItem, CampaignCalendarEventType } from "@/lib/calendar/campaign-calendar-item";

/** First-class operations classification (may differ from raw `eventType` on import). */
export type CampaignEventClassification =
  | CampaignCalendarEventType
  | "house_meet_greet"
  | "unknown";

export type FactFieldStatus = "known" | "missing" | "suggested";

export type FactField = {
  key: string;
  label: string;
  value?: string;
  status: FactFieldStatus;
  helper?: string;
  /** Shown as AI suggestion row (Accept / Edit / Ignore) when status is suggested */
  suggestion?: string;
};

export type FactCardSectionId =
  | "when"
  | "where"
  | "why"
  | "who"
  | "what"
  | "how"
  | "travel"
  | "cost_budget"
  | "run_of_show"
  | "hot_wash";

export type FactCardSection = {
  id: FactCardSectionId;
  title: string;
  helper: string;
  defaultCollapsed: boolean;
  fields: FactField[];
  /** House Meet & Greet emphasis block */
  emphasis?: "house_meet_greet";
  placeholderRows?: Array<{ label: string; hint: string }>;
};

export type WorkHoursWarning = {
  show: boolean;
  badge: string;
  detail: string;
};

export type TravelOriginHint = {
  originCity: string;
  originLabel: string;
  rule: "rose_bud_home" | "little_rock_tue_fri" | "calendar_overnight";
  note: string;
};

export type AiSuggestionStub = {
  id: string;
  label: string;
  suggestion: string;
  confidence: "low" | "medium" | "high";
};

export type CampaignEventLedgerRow = {
  calendar: CampaignCalendarItem;
  dateYmd: string;
  classification: CampaignEventClassification;
  classificationLabel: string;
  likelyCity?: string;
  likelyCitySource?: string;
  sourceCalendarId: string;
  missingInfoCount: number;
  workHours: WorkHoursWarning;
  travelOrigin: TravelOriginHint;
  sections: FactCardSection[];
  aiSuggestions: AiSuggestionStub[];
};

export type { PersistedMarchEventRow, WorkbenchEventRow } from "./merge-persisted-row";
