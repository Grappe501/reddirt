import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";

import { resolveLeaderOwnerUserId } from "./resolve-owner-user";

export type LeaderContactSpineRow = {
  id: string;
  displayName: string;
  organizingStatus: string;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  isCoreFive: boolean;
  adminHref: string;
  source: "crm" | "intake" | "field";
};

export type LeaderContactSpineSummary = {
  dbAvailable: boolean;
  ownerUserId: string | null;
  totalContacts: number;
  recent: LeaderContactSpineRow[];
  intakePlacements: number;
  fieldLinked: number;
};

export async function loadLeaderContactSpineSummary(
  leaderSlug: string,
): Promise<LeaderContactSpineSummary> {
  const empty: LeaderContactSpineSummary = {
    dbAvailable: false,
    ownerUserId: null,
    totalContacts: 0,
    recent: [],
    intakePlacements: 0,
    fieldLinked: 0,
  };

  if (!isDatabaseConfigured()) return empty;

  const leader = getVolunteerLeaderBySlug(leaderSlug);
  if (!leader) return { ...empty, dbAvailable: true };

  try {
    const ownerUserId = await resolveLeaderOwnerUserId(leader);

    const [contacts, contactTotal, intakePlacements, fieldLinked] = await Promise.all([
      prisma.relationalContact.findMany({
        where: { ownerUserId },
        orderBy: [{ lastContactedAt: "desc" }, { updatedAt: "desc" }],
        take: 8,
        select: {
          id: true,
          displayName: true,
          organizingStatus: true,
          lastContactedAt: true,
          nextFollowUpAt: true,
          isCoreFive: true,
          metadataJson: true,
        },
      }),
      prisma.relationalContact.count({ where: { ownerUserId } }),
      prisma.workflowIntake.count({
        where: {
          relationalContactId: { not: null },
          metadata: { path: ["placementLeaderSlug"], equals: leader.slug },
        },
      }),
      prisma.electionPlanFieldEntry.count({
        where: {
          operatorInitials: leader.initials.toUpperCase(),
          relationalContactId: { not: null },
        },
      }),
    ]);

    const recent: LeaderContactSpineRow[] = contacts.map((c) => {
      const meta =
        typeof c.metadataJson === "object" && c.metadataJson !== null && !Array.isArray(c.metadataJson)
          ? (c.metadataJson as Record<string, unknown>)
          : {};
      let source: LeaderContactSpineRow["source"] = "crm";
      if (typeof meta.workflowIntakeId === "string") source = "intake";
      else if (typeof meta.fieldEntryId === "string") source = "field";

      return {
        id: c.id,
        displayName: c.displayName,
        organizingStatus: c.organizingStatus,
        lastContactedAt: c.lastContactedAt?.toISOString() ?? null,
        nextFollowUpAt: c.nextFollowUpAt?.toISOString() ?? null,
        isCoreFive: c.isCoreFive,
        adminHref: `/admin/relational-contacts/${c.id}`,
        source,
      };
    });

    return {
      dbAvailable: true,
      ownerUserId,
      totalContacts: contactTotal,
      recent,
      intakePlacements,
      fieldLinked,
    };
  } catch {
    return { ...empty, dbAvailable: true };
  }
}
