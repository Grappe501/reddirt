/**
 * Calendar Requests lane — classify WorkflowIntake rows without widening into generic CRM.
 */

/** Primary DB `WorkflowIntake.source` values used in calendar lane queries before payload classification. */
export const CALENDAR_REQUEST_SOURCE_TYPES = ["host_gathering", "analytics"] as const;

export type CalendarRequestKind =
  | "host_gathering"
  | "analytics_event"
  | "unknown_event_like"
  | "excluded";

type IntakeLike = {
  source: string | null;
  metadata: unknown;
  submission?: { type: string | null; structuredData: unknown } | null;
};

function asObj(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function analyticsEventId(metadata: unknown): string | null {
  const m = asObj(metadata);
  if (!m) return null;
  const prov = asObj(m.analyticsProvenance);
  if (!prov) return null;
  const id = prov.eventId;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

/** Sources that must never appear in Calendar Requests (Prisma `notIn` + classifier). */
export const EXCLUDED_WORKFLOW_INTAKE_SOURCES = [
  "ask_kelly_beta",
  "ask_kelly_beta_feedback",
  "conversation_monitoring",
  "story",
  "story_submission",
] as const;

const EXCLUDED_SOURCES = new Set<string>(EXCLUDED_WORKFLOW_INTAKE_SOURCES);

/**
 * True when this intake should appear on Calendar Requests.
 * Today: host_gathering forms, plus analytics intakes tied to a CampaignEvent id.
 */
export function isCalendarLikeWorkflowIntake(row: IntakeLike): boolean {
  const src = row.source?.trim() ?? "";
  if (!src) return false;
  if (EXCLUDED_SOURCES.has(src)) return false;
  if (src === "host_gathering") return true;
  if (src === "analytics") return Boolean(analyticsEventId(row.metadata));
  return false;
}

export function getCalendarRequestKind(row: IntakeLike): CalendarRequestKind {
  if (!isCalendarLikeWorkflowIntake(row)) return "excluded";
  const src = row.source?.trim() ?? "";
  if (src === "host_gathering") return "host_gathering";
  if (src === "analytics") return "analytics_event";
  return "unknown_event_like";
}

const KIND_LABELS: Record<CalendarRequestKind, string> = {
  host_gathering: "Host gathering",
  analytics_event: "Event request (analytics)",
  unknown_event_like: "Unknown event-like",
  excluded: "Excluded",
};

export function getCalendarRequestKindLabel(kind: CalendarRequestKind): string {
  return KIND_LABELS[kind] ?? kind;
}

export function parseCalendarRequestPayload(row: IntakeLike): {
  community: string | null;
  gatheringType: string | null;
  preferredTiming: string | null;
  analyticsEventId: string | null;
} {
  const sd = asObj(row.submission?.structuredData);
  const meta = asObj(row.metadata);
  return {
    community: typeof sd?.community === "string" ? sd.community : null,
    gatheringType: typeof sd?.gatheringType === "string" ? sd.gatheringType : null,
    preferredTiming: typeof sd?.preferredTiming === "string" ? sd.preferredTiming : null,
    analyticsEventId: analyticsEventId(row.metadata),
  };
}
