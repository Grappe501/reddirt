import { CampaignEventType, EventWorkflowState, Prisma } from "@prisma/client";

export type CalendarHqFilters = {
  sourceIds: string[] | null;
  countyId: string | null;
  eventType: CampaignEventType | null;
  eventWorkflowState: EventWorkflowState | null;
  ownerUserId: string | null;
};

const TYPE_SET = new Set<string>(Object.values(CampaignEventType));
const STAGE_SET = new Set<string>(Object.values(EventWorkflowState));

export function emptyCalendarFilters(): CalendarHqFilters {
  return { sourceIds: null, countyId: null, eventType: null, eventWorkflowState: null, ownerUserId: null };
}

export function parseCalendarFilters(sp: { src?: string; countyId?: string; type?: string; stage?: string; owner?: string }): CalendarHqFilters {
  const sourceIds = sp.src
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    sourceIds: sourceIds && sourceIds.length > 0 ? sourceIds : null,
    countyId: sp.countyId?.trim() || null,
    eventType: sp.type && TYPE_SET.has(sp.type) ? (sp.type as CampaignEventType) : null,
    eventWorkflowState: sp.stage && STAGE_SET.has(sp.stage) ? (sp.stage as EventWorkflowState) : null,
    ownerUserId: sp.owner?.trim() || null,
  };
}

export function calendarFiltersToSearchParams(
  f: CalendarHqFilters,
  o: { week: string; view: string; event?: string | null; q?: string; month?: string }
): string {
  const p = new URLSearchParams();
  p.set("week", o.week);
  p.set("view", o.view);
  if (o.event) p.set("event", o.event);
  if (o.q) p.set("q", o.q);
  if (o.month) p.set("month", o.month);
  if (f.countyId) p.set("countyId", f.countyId);
  if (f.eventType) p.set("type", f.eventType);
  if (f.eventWorkflowState) p.set("stage", f.eventWorkflowState);
  if (f.ownerUserId) p.set("owner", f.ownerUserId);
  if (f.sourceIds?.length) p.set("src", f.sourceIds.join(","));
  return p.toString();
}

function sourceIdWhere(f: CalendarHqFilters): Prisma.CampaignEventWhereInput {
  if (f.sourceIds && f.sourceIds.length > 0) return { calendarSourceId: { in: f.sourceIds } };
  return {};
}

export function whereForCalendar(f: CalendarHqFilters): Prisma.CampaignEventWhereInput {
  const w: Prisma.CampaignEventWhereInput = { ...sourceIdWhere(f) };
  if (f.countyId) w.countyId = f.countyId;
  if (f.eventType) w.eventType = f.eventType;
  if (f.eventWorkflowState) w.eventWorkflowState = f.eventWorkflowState;
  if (f.ownerUserId) w.ownerUserId = f.ownerUserId;
  return w;
}
