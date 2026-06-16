import { prisma } from "@/lib/db";

import { COMMUNITY_LEADERSHIP_ROLES } from "./constants";
import { matchEventSlug, getPilotEventSeed } from "./pilot-event-seeds";
import { ensurePilotEventsSeeded } from "./seed-pilot-events";
import type { CommunityWorkbenchCommitteeRow, CommunityWorkbenchEventRow, CommunityWorkbenchView } from "./types";
import { loadCommunityWorkbench } from "./load-workbench";

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export type CommunityEventWorkbenchView = {
  workbench: CommunityWorkbenchView;
  event: CommunityWorkbenchEventRow;
  eventSlug: string;
  committee: CommunityWorkbenchCommitteeRow | null;
  pilotSeed: ReturnType<typeof getPilotEventSeed>;
};

export async function loadCommunityWorkbenchEvent(
  workbenchSlug: string,
  eventSlug: string,
): Promise<CommunityEventWorkbenchView | null> {
  await ensurePilotEventsSeeded();

  const workbench = await loadCommunityWorkbench(workbenchSlug);
  if (!workbench) return null;

  const event = workbench.events.find((e) => matchEventSlug(e.title) === eventSlug);
  if (!event) return null;

  const committee = event.committeeId
    ? workbench.committees.find((c) => c.id === event.committeeId) ?? null
    : null;

  return {
    workbench,
    event,
    eventSlug,
    committee,
    pilotSeed: getPilotEventSeed(eventSlug),
  };
}

/** Resolve event by slug directly from DB when workbench cache is stale. */
export async function findEventBySlug(
  workbenchSlug: string,
  eventSlug: string,
): Promise<{ eventId: string } | null> {
  await ensurePilotEventsSeeded();
  try {
    const wb = await prisma.communityWorkbench.findUnique({
      where: { slug: workbenchSlug },
      include: { events: true },
    });
    if (!wb) return null;
    const row = wb.events.find((e) => matchEventSlug(e.title) === eventSlug);
    return row ? { eventId: row.id } : null;
  } catch {
    return null;
  }
}

export function mapDbEventToRow(
  e: {
    id: string;
    title: string;
    eventDate: Date | null;
    location: string | null;
    expectedAttendance: number | null;
    actualAttendance: number | null;
    leadName: string | null;
    status: string;
    committeeId: string | null;
    runOfShowJson: string | null;
    assignmentsJson: string | null;
    documentsJson: string | null;
    aarBody: string | null;
    operatorInitials: string | null;
    updatedAt: Date;
  },
  committeeName: string | null,
): CommunityWorkbenchEventRow {
  return {
    id: e.id,
    title: e.title,
    eventDate: e.eventDate?.toISOString() ?? null,
    location: e.location,
    expectedAttendance: e.expectedAttendance,
    actualAttendance: e.actualAttendance,
    leadName: e.leadName,
    status: e.status,
    committeeId: e.committeeId,
    committeeName,
    runOfShow: parseJsonArray(e.runOfShowJson, []),
    assignments: parseJsonArray(e.assignmentsJson, []),
    documents: parseJsonArray(e.documentsJson, []),
    aarBody: e.aarBody,
    operatorInitials: e.operatorInitials,
    updatedAt: e.updatedAt.toISOString(),
  };
}

export async function loadEventForPilotValidation(
  workbenchSlug: string,
  eventSlug: string,
): Promise<Pick<CommunityEventWorkbenchView, "event" | "committee" | "eventSlug"> | null> {
  const view = await loadCommunityWorkbenchEvent(workbenchSlug, eventSlug);
  if (!view) return null;
  return {
    event: view.event,
    committee: view.committee,
    eventSlug: view.eventSlug,
  };
}
