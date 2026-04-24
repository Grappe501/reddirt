/**
 * COUNTY-INTEL-2 — Aggregate turnout drop-off (county and precinct as ratios only).
 * No individual voter lists.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const AGGREGATE_DROPOFF_PACKET = "COUNTY-INTEL-2-DROPOFF" as const;

function isRunoffName(name: string) {
  return /runoff/i.test(name);
}

function isPrimaryName(name: string) {
  return /primary|preferential/i.test(name);
}

function isGeneralName(name: string) {
  return /general|special/i.test(name) && !isPrimaryName(name) && !isRunoffName(name);
}

export type AggregateDropoffRow = {
  electionName: string;
  electionDate: string;
  kind: "general" | "primary" | "runoff" | "other";
  /** Turnout % of registered when both present */
  votePercent: number | null;
  registeredVoters: number | null;
  ballotsCast: number | null;
};

export type AggregateDropoffProfile = {
  packet: typeof AGGREGATE_DROPOFF_PACKET;
  countyLabel: string;
  countyFips: string | null;
  rows: AggregateDropoffRow[];
  /** Latest presidential vs latest midterm general in DB, when both identifiable */
  presVsMidGeneral: {
    presidentialLabel: string | null;
    midtermLabel: string | null;
    presTurnoutPercent: number | null;
    midTurnoutPercent: number | null;
    gapPoints: number | null;
    narrative: string;
  };
  generalVsPrimary: {
    lastGeneral: AggregateDropoffRow | null;
    lastPrimary: AggregateDropoffRow | null;
    gapPoints: number | null;
    narrative: string;
  };
  primaryVsRunoff: {
    lastPrimary: AggregateDropoffRow | null;
    lastRunoff: AggregateDropoffRow | null;
    gapPoints: number | null;
    narrative: string;
  };
  precinctDropOffHighlights: { precinctLabel: string; turnoutPercent: number | null; electionLabel: string }[];
  engagementGapZones: { label: string; note: string }[];
  missingDataWarnings: string[];
  generatedAt: string;
};

function isPresidentialYear(d: Date): boolean {
  return d.getUTCFullYear() % 4 === 0;
}

function isMidtermishYear(d: Date): boolean {
  const y = d.getUTCFullYear();
  return y % 4 !== 0;
}

export async function buildAggregateDropoffProfile(countyName: string, fips?: string): Promise<AggregateDropoffProfile> {
  const now = new Date().toISOString();
  const raw = countyName.replace(/county/ig, "").trim();
  const fips5 = fips?.replace(/\D/g, "").padStart(5, "0");
  const county = await prisma.county.findFirst({
    where: fips5
      ? { OR: [{ fips: fips5 }, { displayName: { contains: raw, mode: "insensitive" } }] }
      : {
          OR: [
            { displayName: { equals: raw, mode: "insensitive" } },
            { displayName: { equals: `${raw} County`, mode: "insensitive" } },
            { slug: { contains: raw.toLowerCase().replace(/\s+/g, "-") } },
          ],
        },
    select: { id: true, displayName: true, fips: true },
  });

  const where: Prisma.ElectionCountyResultWhereInput = county
    ? { countyId: county.id }
    : fips5
      ? { OR: [{ countyFips: fips5 }, { countyNameRaw: { contains: raw, mode: "insensitive" } }] }
      : { countyNameRaw: { contains: raw, mode: "insensitive" } };

  const rows = await prisma.electionCountyResult.findMany({
    where: { ...where, contest: { is: null } },
    take: 200,
    orderBy: { source: { electionDate: "desc" } },
    include: { source: true },
  });

  const missing: string[] = [];
  if (rows.length === 0) {
    missing.push("No election county turnout rows (contest null) in DB for this county — run election ingest.");
  }

  const mapped: AggregateDropoffRow[] = rows.map((r) => {
    const name = r.source.electionName;
    let kind: AggregateDropoffRow["kind"] = "other";
    if (isRunoffName(name)) kind = "runoff";
    else if (isPrimaryName(name)) kind = "primary";
    else if (isGeneralName(name) || /general/i.test(name)) kind = "general";
    return {
      electionName: name,
      electionDate: r.source.electionDate.toISOString(),
      kind,
      votePercent: r.votePercent != null ? Number(r.votePercent) : null,
      registeredVoters: r.registeredVoters,
      ballotsCast: r.ballotsCast,
    };
  });

  const generals = mapped.filter((m) => m.kind === "general");
  const primaries = mapped.filter((m) => m.kind === "primary");
  const runoffs = mapped.filter((m) => m.kind === "runoff");

  const byDate = (a: AggregateDropoffRow, b: AggregateDropoffRow) => b.electionDate.localeCompare(a.electionDate);

  const lastGeneral = generals.sort(byDate)[0] ?? null;
  const lastPrimary = primaries.sort(byDate)[0] ?? null;
  const lastRunoff = runoffs.sort(byDate)[0] ?? null;
  const lastPresG = generals
    .filter((g) => isPresidentialYear(new Date(g.electionDate)))
    .sort(byDate)[0] ?? null;
  const lastMidG = generals
    .filter((g) => isMidtermishYear(new Date(g.electionDate)))
    .sort(byDate)[0] ?? null;

  const gapPm =
    lastPresG?.votePercent != null && lastMidG?.votePercent != null
      ? lastPresG.votePercent - lastMidG.votePercent
      : null;
  const gapGP =
    lastGeneral?.votePercent != null && lastPrimary?.votePercent != null
      ? lastGeneral.votePercent - lastPrimary.votePercent
      : null;
  const gapPr =
    lastPrimary?.votePercent != null && lastRunoff?.votePercent != null
      ? lastPrimary.votePercent - lastRunoff.votePercent
      : null;

  let precHighlights: AggregateDropoffProfile["precinctDropOffHighlights"] = [];
  if (county) {
    const pr = await prisma.electionPrecinctResult.findMany({
      where: { countyId: county.id, contest: { is: null } },
      take: 2000,
      orderBy: { source: { electionDate: "desc" } },
      include: { source: { select: { electionName: true, electionDate: true } } },
    });
    for (const p of pr) {
      const t =
        p.votePercent != null
          ? Number(p.votePercent)
          : p.registeredVoters && p.registeredVoters > 0 && p.ballotsCast != null
            ? (p.ballotsCast / p.registeredVoters) * 100
            : null;
      if (t != null && p.precinctNameRaw) {
        precHighlights.push({
          precinctLabel: p.precinctNameRaw,
          turnoutPercent: Math.round(t * 10) / 10,
          electionLabel: p.source.electionName,
        });
      }
    }
    precHighlights = precHighlights
      .filter((h) => h.turnoutPercent != null)
      .sort((a, b) => (a.turnoutPercent! - b.turnoutPercent!))
      .slice(0, 8);
  } else {
    missing.push("Precinct drop-off list skipped — need mapped County for precinct rows.");
  }

  const lowZones: AggregateDropoffProfile["engagementGapZones"] = precHighlights.map((h) => ({
    label: h.precinctLabel,
    note: `Lower modeled turnout% in one tabulated file (${h.electionLabel}) — not individual voters; verify precinct boundaries / reporting.`,
  }));

  return {
    packet: AGGREGATE_DROPOFF_PACKET,
    countyLabel: county?.displayName ?? raw,
    countyFips: county?.fips ?? fips5 ?? null,
    rows: mapped,
    presVsMidGeneral: {
      presidentialLabel: lastPresG?.electionName ?? null,
      midtermLabel: lastMidG?.electionName ?? null,
      presTurnoutPercent: lastPresG?.votePercent ?? null,
      midTurnoutPercent: lastMidG?.votePercent ?? null,
      gapPoints: gapPm,
      narrative:
        lastPresG && lastMidG
          ? "Compare turnout % of registered between the latest presidential and midterm generals in this county’s ingested data — a positive gap is common; verify definitions match SOS exports."
          : "Need at least one presidential and one midterm general turnout row in DB to show this gap with confidence.",
    },
    generalVsPrimary: {
      lastGeneral,
      lastPrimary,
      gapPoints: gapGP,
      narrative: lastGeneral && lastPrimary
        ? "General elections typically show higher % of registered voters than primaries in Arkansas exports — the gap is a planning input for relational GOTV, not a person score."
        : "Missing primary or general turnout row in sample.",
    },
    primaryVsRunoff: {
      lastPrimary,
      lastRunoff,
      gapPoints: gapPr,
      narrative:
        lastPrimary && lastRunoff
          ? "Primary vs runoff: compare the two most recent such rows. If runoff is rare in file, this may be N/A often."
          : "Runoff or primary not present in recent rows — add runoff file to canonical ingest if needed.",
    },
    precinctDropOffHighlights: precHighlights,
    engagementGapZones: lowZones,
    missingDataWarnings: missing,
    generatedAt: now,
  };
}
