import type { CommunityWorkbenchKind } from "@prisma/client";

import { prisma } from "@/lib/db";

import { buildCommunityWorkbenchRegistry } from "./build-registry";
import { COMMUNITY_LEADERSHIP_ROLES } from "./constants";
import { computeCommunityReadiness } from "./compute-readiness";
import { collectOwnershipWarnings, readinessBand } from "./ownership-warnings";
import { ensureCommunityWorkbenchesSynced } from "./sync-workbenches";
import type { CommunityWorkbenchHubSummary } from "./types";

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function hasUpcomingEvent(
  events: Array<{ eventDate: Date | null; status: string }>,
  now = new Date(),
): boolean {
  return events.some((e) => {
    if (e.status === "cancelled" || e.status === "aar_complete") return false;
    if (!e.eventDate) return e.status === "planned" || e.status === "confirmed";
    return e.eventDate >= now;
  });
}

export async function listCommunityWorkbenchHubSummaries(): Promise<CommunityWorkbenchHubSummary[]> {
  await ensureCommunityWorkbenchesSynced();

  const registry = buildCommunityWorkbenchRegistry();

  try {
    const rows = await prisma.communityWorkbench.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        leadership: true,
        missions: { select: { id: true } },
        committees: { select: { id: true, name: true, membersJson: true } },
        events: {
          select: {
            id: true,
            title: true,
            eventDate: true,
            status: true,
            leadName: true,
            runOfShowJson: true,
            assignmentsJson: true,
            location: true,
            committeeId: true,
            actualAttendance: true,
            aarBody: true,
          },
        },
        intelPages: { select: { id: true } },
        relationships: { select: { id: true } },
      },
    });

    if (rows.length > 0) {
      return rows.map((wb) => {
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
        const communityLead = leadership.find((l) => l.roleKey === "community_lead")?.personName?.trim() ?? null;
        const events = wb.events.map((e) => ({
          id: e.id,
          title: e.title,
          eventDate: e.eventDate?.toISOString() ?? null,
          location: null,
          expectedAttendance: null,
          actualAttendance: e.actualAttendance,
          leadName: e.leadName,
          status: e.status,
          committeeId: e.committeeId,
          committeeName: null,
          runOfShow: parseJsonArray<{ time: string; label: string }>(e.runOfShowJson, []),
          assignments: parseJsonArray<{ role: string; assignee: string }>(e.assignmentsJson, []),
          documents: [],
          aarBody: e.aarBody,
          operatorInitials: null,
          updatedAt: "",
        }));
        const committees = wb.committees.map((c) => ({
          id: c.id,
          name: c.name,
          goals: null,
          membersJson: c.membersJson,
          notes: null,
          operatorInitials: null,
        }));
        const readiness = computeCommunityReadiness({
          leadership,
          missions: wb.missions.map((m) => ({ id: m.id, title: "", status: "open", priority: 0, operatorInitials: null })),
          events,
          relationships: wb.relationships.map((r) => ({
            id: r.id,
            personName: "",
            roleLabel: null,
            strength: 0,
            lastContact: null,
            nextFollowUp: null,
            knowsWho: null,
            notes: null,
            operatorInitials: null,
          })),
          intel: wb.intelPages.map((i) => ({
            id: i.id,
            sectionKey: "",
            title: "",
            body: "",
            operatorInitials: null,
          })),
          committees,
          fieldEntry: { entries: [], rollups: [], totalQuantity: 0 },
        });
        const band = readinessBand(readiness.overallPct);
        const warnings = collectOwnershipWarnings({
          workbenchName: wb.name,
          leadership,
          events,
          committees,
        });

        return {
          slug: wb.slug,
          name: wb.name,
          kind: wb.kind,
          countySlug: wb.countySlug,
          tagline: wb.tagline,
          communityLead,
          hasOwner: Boolean(communityLead),
          hasUpcomingEvent: hasUpcomingEvent(wb.events),
          readinessPct: readiness.overallPct,
          readinessBand: band,
          warningCount: warnings.length,
        };
      });
    }
  } catch {
    // fall through to registry-only summaries
  }

  return registry.map((e) => ({
    slug: e.slug,
    name: e.name,
    kind: e.kind,
    countySlug: e.countySlug,
    tagline: e.tagline,
    communityLead: null,
    hasOwner: false,
    hasUpcomingEvent: false,
    readinessPct: 0,
    readinessBand: "red" as const,
    warningCount: 1,
  }));
}

export type HubFilterParams = {
  q?: string;
  kind?: CommunityWorkbenchKind | "all";
  owner?: "has" | "missing" | "all";
  events?: "upcoming" | "none" | "all";
  readiness?: "green" | "yellow" | "red" | "all";
};

export function filterHubSummaries(
  summaries: CommunityWorkbenchHubSummary[],
  filters: HubFilterParams,
): CommunityWorkbenchHubSummary[] {
  const term = filters.q?.trim().toLowerCase() ?? "";
  return summaries.filter((wb) => {
    if (filters.kind && filters.kind !== "all" && wb.kind !== filters.kind) return false;
    if (filters.owner === "has" && !wb.hasOwner) return false;
    if (filters.owner === "missing" && wb.hasOwner) return false;
    if (filters.events === "upcoming" && !wb.hasUpcomingEvent) return false;
    if (filters.events === "none" && wb.hasUpcomingEvent) return false;
    if (filters.readiness && filters.readiness !== "all" && wb.readinessBand !== filters.readiness) return false;
    if (term) {
      const blob = [wb.name, wb.tagline ?? "", wb.kind, wb.countySlug ?? "", wb.communityLead ?? ""]
        .join(" ")
        .toLowerCase();
      if (!blob.includes(term) && !wb.slug.includes(term.replace(/\s+/g, "-"))) return false;
    }
    return true;
  });
}
