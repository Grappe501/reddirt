/**
 * Server + script pilot validation snapshot (Prisma only — no election plan snapshot).
 */
import { prisma } from "@/lib/db";

import { COMMUNITY_LEADERSHIP_ROLES } from "./constants";
import { COMMUNITY_PILOT_WORKBENCHES } from "./pilot";
import {
  deployReadinessSummary,
  evaluatePilotWorkbench,
  runDeployReadinessChecks,
  type DeployReadinessCheck,
  type PilotWorkbenchValidation,
} from "./pilot-validation";

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
  pilots: PilotWorkbenchValidation[];
  pilotsAllPass: boolean;
  defects: CommunityPilotDefectRow[];
  openDefectCount: number;
};

export async function loadPilotValidationSnapshot(root = process.cwd()): Promise<PilotValidationSnapshot> {
  const deployChecks = runDeployReadinessChecks(root);
  const deploySummary = deployReadinessSummary(deployChecks);

  const pilots: PilotWorkbenchValidation[] = [];
  for (const meta of COMMUNITY_PILOT_WORKBENCHES) {
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
        pilots.push(
          evaluatePilotWorkbench(
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
          ),
        );
      } else {
        pilots.push(
          evaluatePilotWorkbench(
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
          ),
        );
      }
    } catch {
      pilots.push({
        slug: meta.slug,
        name: meta.name,
        context: meta.context,
        steps: [{ id: "workbench", label: "Workbench loads", pass: false, detail: "DB unavailable" }],
        stepsPassed: 0,
        allPass: false,
      });
    }
  }

  let defects: CommunityPilotDefectRow[] = [];
  try {
    const rows = await prisma.communityWorkbenchPilotDefect.findMany({
      where: { workbenchSlug: { in: COMMUNITY_PILOT_WORKBENCHES.map((p) => p.slug) } },
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
    pilotsAllPass: pilots.every((p) => p.allPass),
    defects,
    openDefectCount,
  };
}
