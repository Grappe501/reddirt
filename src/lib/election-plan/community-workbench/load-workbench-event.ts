import { prisma } from "@/lib/db";

import { COMMUNITY_LEADERSHIP_ROLES } from "./constants";
import { matchEventSlug, getPilotEventSeed } from "./pilot-event-seeds";
import { ensurePilotEventsSeeded } from "./seed-pilot-events";
import type { CommunityWorkbenchCommitteeRow, CommunityWorkbenchEventRow, CommunityWorkbenchView } from "./types";
import { loadCommunityWorkbench } from "./load-workbench";
import { mapDbEventToRow } from "./map-db-event-row";

export { mapDbEventToRow } from "./map-db-event-row";

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
