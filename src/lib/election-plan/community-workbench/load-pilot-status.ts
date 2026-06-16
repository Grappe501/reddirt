/**
 * Server + script pilot validation snapshot (Prisma only — no election plan snapshot).
 */
import { prisma } from "@/lib/db";

import { COMMUNITY_LEADERSHIP_ROLES } from "./constants";
import {
  COMMUNITY_PILOT_CITY_WORKBENCHES,
  COMMUNITY_PILOT_EVENT_WORKBENCHES,
  COMMUNITY_PILOT_OPTIONAL_CITY,
} from "./pilot";
import {
  deployReadinessSummary,
  evaluatePilotEvent,
  evaluatePilotWorkbench,
  runDeployReadinessChecks,
  type DeployReadinessCheck,
  type PilotWorkbenchValidation,
} from "./pilot-validation";
import { mapDbEventToRow } from "./map-db-event-row";
import { ensurePilotEventsSeeded } from "./seed-pilot-events";
import { matchEventSlug } from "./pilot-event-seeds";

export type CommunityPilotDefectRow = {
  id: string;
  workbenchSlug: string;
  title: string;
  body: string;
  severity: string;
  status: string;
  operatorInitials: string | null;
  createdAt: string;
};

export type PilotValidationSnapshot = {
  deployChecks: DeployReadinessCheck[];
  deploySummary: ReturnType<typeof deployReadinessSummary>;
  /** Primary gate: Jacksonville city + G&G event */
  pilots: PilotWorkbenchValidation[];
  optionalCityPilot: PilotWorkbenchValidation | null;
  pilotsAllPass: boolean;
  defects: CommunityPilotDefectRow[];
  openDefectCount: number;
};

async function loadCityPilotValidation(
  meta: (typeof COMMUNITY_PILOT_CITY_WORKBENCHES)[number] | typeof COMMUNITY_PILOT_OPTIONAL_CITY,
): Promise<PilotWorkbenchValidation> {
  try {
    const wb = await prisma.communityWorkbench.findUnique({
      where: { slug: meta.slug },
      include: {
        leadership: true,
        events: { orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }] },
      },
    });
    if (wb) {
      const leadership = COMMUNITY_LEADERSHIP_ROLES.map((role) => {
        const row = wb.leadership.find((l) => l.roleKey === role.key);
        return {
          roleKey: role.key,
          roleLabel: role.label,
          personName: row?.personName ?? null,
          contact: row?.contact ?? null,
          notes: row?.notes ?? null,
          operatorInitials: row?.operatorInitials ?? null,
        };
      });
      const validation = evaluatePilotWorkbench(
        {
          slug: wb.slug,
          name: wb.name,
          leadership,
          events: wb.events.map((e) => ({
            id: e.id,
            title: e.title,
            eventDate: e.eventDate?.toISOString() ?? null,
            location: e.location,
            expectedAttendance: e.expectedAttendance,
            actualAttendance: e.actualAttendance,
            leadName: e.leadName,
            status: e.status,
            committeeId: e.committeeId,
            committeeName: null,
            runOfShow: [],
            assignments: [],
            documents: [],
            aarBody: e.aarBody,
            operatorInitials: e.operatorInitials,
            updatedAt: e.updatedAt.toISOString(),
          })),
        },
        meta.context,
      );
      return {
        ...validation,
        kind: meta.isPrimaryGate ? "city" : "optional_city",
      };
    }
  } catch {
    // fall through
  }

  return evaluatePilotWorkbench(
    {
      slug: meta.slug,
      name: meta.name,
      leadership: COMMUNITY_LEADERSHIP_ROLES.map((role) => ({
        roleKey: role.key,
        roleLabel: role.label,
        personName: null,
        contact: null,
        notes: null,
        operatorInitials: null,
      })),
      events: [],
    },
    meta.context,
  );
}

async function loadEventPilotValidation(
  meta: (typeof COMMUNITY_PILOT_EVENT_WORKBENCHES)[number],
): Promise<PilotWorkbenchValidation> {
  await ensurePilotEventsSeeded();
  try {
    const wb = await prisma.communityWorkbench.findUnique({
      where: { slug: meta.workbenchSlug },
      include: {
        events: true,
        committees: true,
      },
    });
    if (wb) {
      const row = wb.events.find((e) => matchEventSlug(e.title) === meta.eventSlug);
      if (row) {
        const committee = row.committeeId
          ? wb.committees.find((c) => c.id === row.committeeId) ?? null
          : null;
        return evaluatePilotEvent(
          {
            workbenchSlug: meta.workbenchSlug,
            eventSlug: meta.eventSlug,
            name: meta.name,
            context: meta.context,
          },
          mapDbEventToRow(
            row,
            committee?.name ?? null,
          ),
          committee
            ? {
                id: committee.id,
                name: committee.name,
                goals: committee.goals,
                membersJson: committee.membersJson,
                notes: committee.notes,
                operatorInitials: committee.operatorInitials,
              }
            : null,
        );
      }
    }
  } catch {
    // fall through
  }

  return evaluatePilotEvent(
    {
      workbenchSlug: meta.workbenchSlug,
      eventSlug: meta.eventSlug,
      name: meta.name,
      context: meta.context,
    },
    {
      id: "missing",
      title: meta.name,
      eventDate: null,
      location: null,
      expectedAttendance: null,
      actualAttendance: null,
      leadName: null,
      status: "idea",
      committeeId: null,
      committeeName: null,
      runOfShow: [],
      assignments: [],
      documents: [],
      aarBody: null,
      operatorInitials: null,
      updatedAt: "",
    },
    null,
  );
}

export async function loadPilotValidationSnapshot(root = process.cwd()): Promise<PilotValidationSnapshot> {
  const deployChecks = runDeployReadinessChecks(root);
  const deploySummary = deployReadinessSummary(deployChecks);

  const cityPilots = await Promise.all(COMMUNITY_PILOT_CITY_WORKBENCHES.map(loadCityPilotValidation));
  const eventPilots = await Promise.all(COMMUNITY_PILOT_EVENT_WORKBENCHES.map(loadEventPilotValidation));
  const optionalCityPilot = await loadCityPilotValidation(COMMUNITY_PILOT_OPTIONAL_CITY);

  const pilots = [...cityPilots, ...eventPilots];
  const pilotsAllPass = pilots.every((p) => p.allPass);

  const defectSlugs = [
    ...COMMUNITY_PILOT_CITY_WORKBENCHES.map((p) => p.slug),
    COMMUNITY_PILOT_OPTIONAL_CITY.slug,
    ...COMMUNITY_PILOT_EVENT_WORKBENCHES.map((p) => p.workbenchSlug),
  ];

  let defects: CommunityPilotDefectRow[] = [];
  try {
    const rows = await prisma.communityWorkbenchPilotDefect.findMany({
      where: { workbenchSlug: { in: defectSlugs } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    defects = rows.map((d) => ({
      id: d.id,
      workbenchSlug: d.workbenchSlug,
      title: d.title,
      body: d.body,
      severity: d.severity,
      status: d.status,
      operatorInitials: d.operatorInitials,
      createdAt: d.createdAt.toISOString(),
    }));
  } catch {
    defects = [];
  }

  const openDefectCount = defects.filter((d) => d.status === "open" || d.status === "triaged").length;

  return {
    deployChecks,
    deploySummary,
    pilots,
    optionalCityPilot,
    pilotsAllPass,
    defects,
    openDefectCount,
  };
}
