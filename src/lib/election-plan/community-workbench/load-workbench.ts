import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { getCountyByName } from "@/lib/election-plan/load-county";
import { loadFieldEntriesForLocation } from "@/lib/election-plan/field-entry/load-field-entries";

import { buildCommunityWorkbenchRegistry } from "./build-registry";
import {
  COMMUNITY_KPI_SLUG_OVERRIDES,
  COMMUNITY_LEADERSHIP_ROLES,
} from "./constants";
import { computeCommunityReadiness } from "./compute-readiness";
import type { CoalitionWorkbenchProfile } from "./load-coalition-workbench-profile";
import { getCoalitionWorkbenchProfile } from "./load-coalition-workbench-profile";
import { getSmosWorkbenchProfile } from "./load-smos-workbench-profile";
import { getCchWorkbenchProfile } from "./load-cch-workbench-profile";
import { getSpecialKpiGoalForCity } from "@/lib/election-plan/load-special-kpi-goals";
import {
  planningGoalsForSlug,
  recordCountsForWorkbench,
} from "./load-community-kpi-targets";
import { ensureCommunityWorkbenchesSynced } from "./sync-workbenches";
import { computeVoteCushionView, type VoteCushionView } from "./vote-cushion";
import type {
  CommunityWorkbenchEventRow,
  CommunityWorkbenchRegistryEntry,
  CommunityWorkbenchView,
} from "./types";

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function registryEntryForSlug(slug: string): CommunityWorkbenchRegistryEntry | undefined {
  return buildCommunityWorkbenchRegistry().find((e) => e.slug === slug);
}

export async function listCommunityWorkbenches(): Promise<
  Array<Pick<CommunityWorkbenchView, "slug" | "name" | "kind" | "countySlug" | "tagline">>
> {
  await ensureCommunityWorkbenchesSynced();
  try {
    const rows = await prisma.communityWorkbench.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { slug: true, name: true, kind: true, countySlug: true, tagline: true },
    });
    if (rows.length > 0) return rows;
  } catch {
    // fall through
  }
  return buildCommunityWorkbenchRegistry().map((e) => ({
    slug: e.slug,
    name: e.name,
    kind: e.kind,
    countySlug: e.countySlug,
    tagline: e.tagline,
  }));
}

type WorkbenchRecord = Prisma.CommunityWorkbenchGetPayload<{
  include: {
    leadership: true;
    missions: true;
    committees: true;
    events: { include: { committee: { select: { id: true; name: true } } } };
    intelPages: true;
    relationships: true;
    notes: true;
  };
}>;

export async function loadCommunityWorkbench(slug: string): Promise<CommunityWorkbenchView | null> {
  await ensureCommunityWorkbenchesSynced();
  const registry = registryEntryForSlug(slug);
  if (!registry) return null;

  const data = loadElectionPlanSnapshot();
  const city = registry.citySlug ? data.cities.find((c) => c.slug === registry.citySlug) : undefined;
  const countyName = city?.county ?? null;

  let wb: WorkbenchRecord | null = null;

  try {
    wb = await prisma.communityWorkbench.findUnique({
      where: { slug },
      include: {
        leadership: true,
        missions: { orderBy: [{ priority: "desc" }, { createdAt: "desc" }] },
        committees: { orderBy: { name: "asc" } },
        events: {
          orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
          include: { committee: { select: { id: true, name: true } } },
        },
        intelPages: { orderBy: [{ sectionKey: "asc" }, { title: "asc" }] },
        relationships: { orderBy: { personName: "asc" } },
        notes: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
  } catch {
    wb = null;
  }

  const countySlug = registry.countySlug ?? wb?.countySlug ?? null;
  const fieldEntry = countySlug
    ? await loadFieldEntriesForLocation({
        countySlug,
        citySlug: registry.citySlug,
      })
    : { entries: [], rollups: [], totalQuantity: 0 };

  const kpiTemplate =
    wb?.kpiTemplate ?? registry.kpiTemplate ?? COMMUNITY_KPI_SLUG_OVERRIDES[slug] ?? "default_city";

  const leadership = COMMUNITY_LEADERSHIP_ROLES.map((role) => {
    const row = wb?.leadership.find((l) => l.roleKey === role.key);
    return {
      roleKey: role.key,
      roleLabel: role.label,
      personName: row?.personName ?? null,
      contact: row?.contact ?? null,
      notes: row?.notes ?? null,
      operatorInitials: row?.operatorInitials ?? null,
    };
  });

  const missions =
    wb?.missions.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      priority: m.priority,
      operatorInitials: m.operatorInitials,
    })) ?? [];

  const committees =
    wb?.committees.map((c) => ({
      id: c.id,
      name: c.name,
      goals: c.goals,
      membersJson: c.membersJson,
      notes: c.notes,
      operatorInitials: c.operatorInitials,
    })) ?? [];

  const events: CommunityWorkbenchEventRow[] =
    wb?.events.map((e) => ({
      id: e.id,
      title: e.title,
      eventDate: e.eventDate?.toISOString() ?? null,
      location: e.location,
      expectedAttendance: e.expectedAttendance,
      actualAttendance: e.actualAttendance,
      leadName: e.leadName,
      status: e.status,
      committeeId: e.committeeId,
      committeeName: e.committee?.name ?? null,
      runOfShow: parseJsonArray<{ time: string; label: string; owner?: string }>(e.runOfShowJson, []),
      assignments: parseJsonArray<{ role: string; assignee: string; notes?: string }>(e.assignmentsJson, []),
      documents: parseJsonArray<{ label: string; url?: string }>(e.documentsJson, []),
      aarBody: e.aarBody,
      operatorInitials: e.operatorInitials,
      updatedAt: e.updatedAt.toISOString(),
    })) ?? [];

  const intel =
    wb?.intelPages.map((i) => ({
      id: i.id,
      sectionKey: i.sectionKey,
      title: i.title,
      body: i.body,
      operatorInitials: i.operatorInitials,
    })) ?? [];

  const relationships =
    wb?.relationships.map((r) => ({
      id: r.id,
      personName: r.personName,
      roleLabel: r.roleLabel,
      strength: r.strength,
      lastContact: r.lastContact,
      nextFollowUp: r.nextFollowUp,
      knowsWho: r.knowsWho,
      notes: r.notes,
      operatorInitials: r.operatorInitials,
    })) ?? [];

  const notes =
    wb?.notes.map((n) => ({
      id: n.id,
      noteType: n.noteType,
      title: n.title,
      body: n.body,
      operatorInitials: n.operatorInitials,
      createdAt: n.createdAt.toISOString(),
    })) ?? [];

  const partial: CommunityWorkbenchView = {
    id: wb?.id ?? slug,
    slug,
    name: wb?.name ?? registry.name,
    kind: wb?.kind ?? registry.kind,
    countySlug,
    citySlug: registry.citySlug,
    countyName,
    tagline: wb?.tagline ?? registry.tagline,
    population: wb?.population ?? registry.population,
    kpiTemplate,
    recordCounts: [],
    planningGoals: [],
    kpiMetrics: [],
    leadership,
    missions,
    committees,
    events,
    intel,
    relationships,
    notes,
    fieldEntry,
    readiness: { dimensions: [], overallPct: 0 },
    voteTarget: city?.targetVotes,
    voteGain: city?.voteGain,
  };

  partial.recordCounts = recordCountsForWorkbench({
    leadership: partial.leadership,
    events: partial.events,
    relationships: partial.relationships,
    fieldEntry: partial.fieldEntry,
  });
  partial.planningGoals = planningGoalsForSlug(slug);
  partial.kpiMetrics = partial.recordCounts.map((r) => ({
    key: r.key,
    label: r.label,
    current: r.count,
  }));
  partial.readiness = computeCommunityReadiness(partial);

  partial.coalitionProfile = getCoalitionWorkbenchProfile(slug);
  partial.smosProfile = getSmosWorkbenchProfile(slug);
  partial.cchProfile = getCchWorkbenchProfile(slug);

  if (city?.targetVotes != null) {
    const globalBaseline = city.targetVotes - (city.voteGain ?? 0);
    let cushionRecord = null;
    try {
      const row = await prisma.communityWorkbenchVoteCushion.findUnique({ where: { workbenchSlug: slug } });
      if (row) {
        cushionRecord = {
          label: row.label,
          targetIncreasePct: row.targetIncreasePct,
          targetVotes: row.targetVotes,
          notes: row.notes,
          operatorInitials: row.operatorInitials,
          updatedAt: row.updatedAt.toISOString(),
        };
      }
    } catch {
      cushionRecord = null;
    }
    partial.voteCushion = {
      ...computeVoteCushionView(globalBaseline, city.targetVotes, cushionRecord),
      planningHint: buildVoteCushionPlanningHint(registry.citySlug ?? slug),
    };
  }

  return partial;
}

function buildVoteCushionPlanningHint(citySlug: string | null | undefined): VoteCushionView["planningHint"] {
  if (!citySlug) return undefined;
  const special = getSpecialKpiGoalForCity(citySlug);
  if (!special) return undefined;
  return {
    label: special.eventLabel ? `${special.label} · ${special.eventLabel}` : special.label,
    targetIncreasePct: special.targetIncreasePct,
    targetVotes: special.targetSosVotes,
    notes: special.baselineSource,
  };
}

export async function getCommunityWorkbenchCount(): Promise<number> {
  await ensureCommunityWorkbenchesSynced();
  try {
    return await prisma.communityWorkbench.count({ where: { active: true } });
  } catch {
    return buildCommunityWorkbenchRegistry().length;
  }
}
