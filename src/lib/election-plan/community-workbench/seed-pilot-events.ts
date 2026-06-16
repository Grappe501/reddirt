import { prisma } from "@/lib/db";

import { matchEventSlug, PILOT_EVENT_SEEDS, type PilotEventSeed } from "./pilot-event-seeds";
import { ensureCommunityWorkbenchesSynced } from "./sync-workbenches";

let seedPromise: Promise<void> | null = null;

async function upsertPilotEvent(seed: PilotEventSeed): Promise<void> {
  const wb = await prisma.communityWorkbench.findUnique({ where: { slug: seed.workbenchSlug } });
  if (!wb) return;

  const existingEvents = await prisma.communityWorkbenchEvent.findMany({
    where: { workbenchId: wb.id },
  });
  const existing = existingEvents.find((e) => matchEventSlug(e.title) === seed.eventSlug);

  let committee = await prisma.communityWorkbenchCommittee.findFirst({
    where: { workbenchId: wb.id, name: seed.committeeName },
  });
  if (!committee) {
    committee = await prisma.communityWorkbenchCommittee.create({
      data: {
        workbenchId: wb.id,
        name: seed.committeeName,
        goals: seed.committeeGoals,
        membersJson: JSON.stringify(seed.committeeMemberSlots),
        operatorInitials: "SYS",
      },
    });
  } else {
    await prisma.communityWorkbenchCommittee.update({
      where: { id: committee.id },
      data: {
        goals: seed.committeeGoals,
        membersJson: JSON.stringify(seed.committeeMemberSlots),
      },
    });
  }

  const payload = {
    title: seed.title,
    eventDate: new Date(seed.eventDateIso),
    location: seed.location,
    expectedAttendance: seed.expectedAttendance,
    leadName: seed.leadName,
    status: seed.status,
    committeeId: committee.id,
    runOfShowJson: JSON.stringify(seed.runOfShow),
    assignmentsJson: JSON.stringify(seed.assignments),
    operatorInitials: "SYS",
  };

  if (existing) {
    await prisma.communityWorkbenchEvent.update({
      where: { id: existing.id },
      data: payload,
    });
    return;
  }

  await prisma.communityWorkbenchEvent.create({
    data: {
      workbenchId: wb.id,
      ...payload,
    },
  });
}

/** Idempotent seed for pilot event workbenches (G&G on Sherwood). */
export async function ensurePilotEventsSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      await ensureCommunityWorkbenchesSynced();
      for (const seed of PILOT_EVENT_SEEDS) {
        await upsertPilotEvent(seed);
      }
    } catch {
      // DB unavailable — pages still render without seeded event
    } finally {
      seedPromise = null;
    }
  })();

  return seedPromise;
}
