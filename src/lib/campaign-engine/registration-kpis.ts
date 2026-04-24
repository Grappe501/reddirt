/**
 * COUNTY-INTEL-2 — Registration **aggregate** KPIs (no person-level data).
 */

import { prisma } from "@/lib/db";

export const REGISTRATION_KPI_PACKET = "COUNTY-INTEL-2-REG" as const;

export type CountyRegistrationKpiSummary = {
  packet: typeof REGISTRATION_KPI_PACKET;
  countyName: string;
  firstFileDate: string | null;
  latestFileDate: string | null;
  registeredVotersFirst: number | null;
  registeredVotersLatest: number | null;
  netNewRegistrations: number | null;
  dateRangeLabel: string | null;
  source: string;
  missingDataNotes: string[];
  generatedAt: string;
};

export type StatewideRegistrationProgress = {
  goal: number;
  observedNetNew: number | null;
  percentOfGoal: number | null;
  source: string;
  missingDataNotes: string[];
  generatedAt: string;
};

export type CountyShareGoal = {
  statewideGoal: number;
  countyRegistrationLatest: number | null;
  statewideTotalRegistered: number | null;
  shareOfState: number | null;
  impliedCountyContribution: number | null;
  missingDataNotes: string[];
  generatedAt: string;
};

/**
 * Registration growth from `CountyRegistrationSnapshot` (preferred) or `CountyVoterMetrics.totalRegisteredCount` chain.
 */
export async function getCountyRegistrationSnapshotSummary(countyName: string): Promise<CountyRegistrationKpiSummary> {
  const now = new Date().toISOString();
  const raw = countyName.replace(/county/ig, "").trim();
  const c = await prisma.county.findFirst({
    where: {
      OR: [
        { displayName: { equals: raw, mode: "insensitive" } },
        { displayName: { equals: `${raw} County`, mode: "insensitive" } },
        { slug: { contains: raw.toLowerCase().replace(/\s+/g, "-") } },
      ],
    },
  });
  if (!c) {
    return {
      packet: REGISTRATION_KPI_PACKET,
      countyName: raw,
      firstFileDate: null,
      latestFileDate: null,
      registeredVotersFirst: null,
      registeredVotersLatest: null,
      netNewRegistrations: null,
      dateRangeLabel: null,
      source: "unavailable",
      missingDataNotes: ["County not found — cannot read voter file metrics."],
      generatedAt: now,
    };
  }

  const missing: string[] = [];
  const regSnaps = await prisma.countyRegistrationSnapshot.findMany({
    where: { countyId: c.id },
    orderBy: { snapshotDate: "asc" },
  });
  if (regSnaps.length === 1) {
    const r = regSnaps[0]!;
    return {
      packet: REGISTRATION_KPI_PACKET,
      countyName: c.displayName,
      firstFileDate: r.snapshotDate.toISOString(),
      latestFileDate: r.snapshotDate.toISOString(),
      registeredVotersFirst: r.totalRegistered,
      registeredVotersLatest: r.totalRegistered,
      netNewRegistrations: 0,
      dateRangeLabel: r.snapshotDate.toISOString().slice(0, 10),
      source: "CountyRegistrationSnapshot (single snapshot; add history for net new)",
      missingDataNotes: missing,
      generatedAt: now,
    };
  }
  if (regSnaps.length >= 2) {
    const firstR = regSnaps[0]!;
    const lastR = regSnaps[regSnaps.length - 1]!;
    return {
      packet: REGISTRATION_KPI_PACKET,
      countyName: c.displayName,
      firstFileDate: firstR.snapshotDate.toISOString(),
      latestFileDate: lastR.snapshotDate.toISOString(),
      registeredVotersFirst: firstR.totalRegistered,
      registeredVotersLatest: lastR.totalRegistered,
      netNewRegistrations: lastR.totalRegistered - firstR.totalRegistered,
      dateRangeLabel: `${firstR.snapshotDate.toISOString().slice(0, 10)} → ${lastR.snapshotDate.toISOString().slice(0, 10)}`,
      source: "CountyRegistrationSnapshot (aggregate file totals)",
      missingDataNotes: missing,
      generatedAt: now,
    };
  }

  const snaps = await prisma.countyVoterMetrics.findMany({
    where: { countyId: c.id },
    orderBy: { asOfDate: "asc" },
  });
  if (snaps.length === 0) {
    missing.push("No `CountyVoterMetrics` or `CountyRegistrationSnapshot` for this county — import voter file.");
    return {
      packet: REGISTRATION_KPI_PACKET,
      countyName: c.displayName,
      firstFileDate: null,
      latestFileDate: null,
      registeredVotersFirst: null,
      registeredVotersLatest: null,
      netNewRegistrations: null,
      dateRangeLabel: null,
      source: "unavailable",
      missingDataNotes: missing,
      generatedAt: now,
    };
  }
  const first = snaps[0]!;
  const last = snaps[snaps.length - 1]!;
  const t0 = first.totalRegisteredCount;
  const t1 = last.totalRegisteredCount;
  if (t0 == null && t1 == null) {
    missing.push("totalRegisteredCount is null on metrics — run vendor export that fills `CountyVoterMetrics` totals or add `CountyRegistrationSnapshot` rows.");
  }
  return {
    packet: REGISTRATION_KPI_PACKET,
    countyName: c.displayName,
    firstFileDate: first.asOfDate.toISOString(),
    latestFileDate: last.asOfDate.toISOString(),
    registeredVotersFirst: t0,
    registeredVotersLatest: t1,
    netNewRegistrations: t0 != null && t1 != null ? t1 - t0 : null,
    dateRangeLabel: `${first.asOfDate.toISOString().slice(0, 10)} → ${last.asOfDate.toISOString().slice(0, 10)}`,
    source: "CountyVoterMetrics.totalRegisteredCount",
    missingDataNotes: missing,
    generatedAt: now,
  };
}

/**
 * Sums `newRegistrationsSinceBaseline` (where present) on latest CountyCampaignStats per county as a **rough** statewide signal.
 * Prefer a dedicated state dashboard when you add it.
 */
export async function buildStatewideRegistrationGoalProgress(goal = 50_000): Promise<StatewideRegistrationProgress> {
  const now = new Date().toISOString();
  const stats = await prisma.countyCampaignStats.findMany({
    select: { newRegistrationsSinceBaseline: true, registrationBaselineDate: true },
  });
  const sum = stats.reduce((a, s) => a + (s.newRegistrationsSinceBaseline ?? 0), 0);
  const hasAny = stats.some((s) => s.newRegistrationsSinceBaseline != null);
  const miss: string[] = [];
  if (!hasAny) {
    miss.push("No newRegistrationsSinceBaseline in CountyCampaignStats — backfill from voter file pipeline or set manually for progress tracking.");
  }
  return {
    goal,
    observedNetNew: hasAny ? sum : null,
    percentOfGoal: hasAny && goal > 0 ? Math.min(100, (sum / goal) * 100) : null,
    source: "sum(CountyCampaignStats.newRegistrationsSinceBaseline) — planning estimate, verify SOP",
    missingDataNotes: miss,
    generatedAt: now,
  };
}

/**
 * Proportional “fair share” of a statewide 50K style goal from latest registered totals (if available).
 */
export async function buildCountyRegistrationGoal(countyName: string, statewideGoal = 50_000): Promise<CountyShareGoal> {
  const now = new Date().toISOString();
  const miss: string[] = [];
  const raw = countyName.replace(/county/ig, "").trim();
  const c = await prisma.county.findFirst({
    where: {
      OR: [
        { displayName: { equals: raw, mode: "insensitive" } },
        { displayName: { equals: `${raw} County`, mode: "insensitive" } },
      ],
    },
  });
  if (!c) {
    return {
      statewideGoal,
      countyRegistrationLatest: null,
      statewideTotalRegistered: null,
      shareOfState: null,
      impliedCountyContribution: null,
      missingDataNotes: ["County not found."],
      generatedAt: now,
    };
  }
  const latest = await prisma.countyVoterMetrics.findFirst({
    where: { countyId: c.id },
    orderBy: { asOfDate: "desc" },
  });
  const countyN = latest?.totalRegisteredCount ?? null;
  if (countyN == null) {
    miss.push("Latest CountyVoterMetrics has no totalRegisteredCount — cannot allocate share. Use `CountyRegistrationSnapshot` or backfill.");
  }
  const all = await prisma.countyVoterMetrics.findMany({
    distinct: ["countyId"],
    orderBy: { asOfDate: "desc" },
  });
  const perCounty: { id: string; n: number }[] = [];
  for (const co of await prisma.county.findMany({ select: { id: true } })) {
    const m = await prisma.countyVoterMetrics.findFirst({
      where: { countyId: co.id },
      orderBy: { asOfDate: "desc" },
    });
    if (m?.totalRegisteredCount != null) {
      perCounty.push({ id: co.id, n: m.totalRegisteredCount });
    }
  }
  const totalS = perCounty.reduce((a, p) => a + p.n, 0) || null;
  const share = countyN != null && totalS != null && totalS > 0 ? countyN / totalS : null;
  return {
    statewideGoal,
    countyRegistrationLatest: countyN,
    statewideTotalRegistered: totalS,
    shareOfState: share,
    impliedCountyContribution: share != null ? Math.max(0, Math.floor(statewideGoal * share)) : null,
    missingDataNotes: miss,
    generatedAt: now,
  };
}
