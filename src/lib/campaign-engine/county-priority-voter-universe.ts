/**
 * COUNTY-PRIORITY-1: internal governed use only. **Not** for public static / county briefing zips
 * (COUNTY-INTEL-2: aggregate-only on static exports; no individual labels in public materials).
 * — Dem-lean is **not** party registration; it comes from VoterModelClassification and signals.
 * — Participation is **Y/N** per `VoterElectionParticipation.contestKey` (import from vendor/CSV), not vote choice.
 * — `primaryBallotParty` = `D` | `R` when the file provides it; otherwise "primary participation" is not labeled Democratic.
 *
 * No automated outreach, no support prediction; transparent assumptions on every field.
 */

import {
  VoterClassification,
  VoterSignalKind,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeWinNumberFromTotal } from "./county-political-profile";

export const COUNTY_PRIORITY_1_PACKET = "COUNTY-PRIORITY-1" as const;

/** Contest keys should align with your ingest labels, e.g. `2022_GENERAL`, `2020_PREFERENTIAL_PRIMARY`, `2024_PRIMARY`. */
export type VoterParticipationMap = ReadonlyMap<string, { participated: boolean; primaryBallotParty: string | null }>;

export type CountyPriorityVoterUniverseParams = {
  countyId: string;
  /**
   * Expected ballots in comparable general (for win # + 10% outreach goal). If omitted, derived from
   * `expectedGeneralBallots` or set null with a warning.
   */
  expectedGeneralBallots?: number | null;
  /** Default 8000; cap in-memory work for very large files. */
  maxVoterRows?: number;
  /** Rows returned per “top list” in API/UI (capped 5000). */
  listTake?: number;
};

export type CountyPriorityPlanMeta = {
  countyId: string;
  voterOnRollCount: number;
  participationCellCount: number;
  targetMajorityWinNumber: number | null;
  outreachListGoal: number | null;
  dataWarnings: string[];
};

/** Fast counts for **public** pages — no per-voter scoring, no PII. */
export async function getCountyPriorityPlanMeta(
  params: { countyId: string; expectedGeneralBallots?: number | null },
): Promise<CountyPriorityPlanMeta> {
  const countyId = params.countyId.trim();
  const expected = params.expectedGeneralBallots ?? null;
  const wn = expected != null && expected > 0 ? computeWinNumberFromTotal(expected) : null;
  const target = wn?.value ?? null;
  const [voterOnRollCount, participationCellCount] = await Promise.all([
    prisma.voterRecord.count({ where: { countyId, inLatestCompletedFile: true } }),
    prisma.voterElectionParticipation.count({ where: { voterRecord: { countyId, inLatestCompletedFile: true } } }),
  ]);
  const dataWarnings: string[] = [];
  if (participationCellCount === 0) {
    dataWarnings.push(
      "No participation history in database yet — pattern tags (e.g. midterm dropoff) will activate after vendor/CSV backfill to VoterElectionParticipation.",
    );
  }
  return {
    countyId,
    voterOnRollCount,
    participationCellCount,
    targetMajorityWinNumber: target,
    outreachListGoal: target != null ? Math.ceil(target * 1.1) : null,
    dataWarnings,
  };
}

export type CountyPriorityVoterRow = {
  voterRecordId: string;
  voterFileKey: string;
  displayNameMasked: string;
  precinct: string | null;
  demLeanScore: number;
  demLeanAssumptions: string[];
  leanBand: "solid_lean" | "persuadable" | "opposed_lean" | "unknown";
  /** Plain-language: solid vs persuadable from classification + history signals only. */
  solidVsPersuadable: string;
  gotvUrgencyScore: number;
  gotvUrgencyReasons: string[];
  gotvEfficiencyScore: number;
  gotvEfficiencyReasons: string[];
  involvementLikelihoodScore: number;
  involvementReasons: string[];
  /** High-level pattern flags (e.g. midterm dropoff). */
  participationTags: string[];
  participationDataPresent: boolean;
  /** Whether recent generals (when keys exist) suggest a “always / usually votes” nudge list. */
  reliableNudge: boolean;
};

export type CountyPrioritySegmentCount = {
  key: string;
  label: string;
  count: number;
};

export type CountyPriorityVoterUniverseResult = {
  packet: typeof COUNTY_PRIORITY_1_PACKET;
  generatedAt: string;
  countyId: string;
  targetMajorityWinNumber: number | null;
  expectedGeneralBallots: number | null;
  /** floor(win/2)+1 * 1.1 — “planning outreach universe size” */
  outreachListGoal: number | null;
  outreachListGoalAssumption: string;
  participationRowCount: number;
  voterScopeCount: number;
  dataWarnings: string[];
  /** Segment breakdown for tables (aggregates). */
  segmentCounts: CountyPrioritySegmentCount[];
  gotvUrgencyTop: CountyPriorityVoterRow[];
  gotvEfficiencyTop: CountyPriorityVoterRow[];
  involvementTop: CountyPriorityVoterRow[];
  /** Capped to outreachListGoal (or listTake) by urgency ordering — the “names toward target+10%” list. */
  planSliceByUrgency: CountyPriorityVoterRow[];
  allScored: CountyPriorityVoterRow[];
};

function isPresidentialYear(y: number): boolean {
  return y >= 2000 && y % 4 === 0;
}

function parseContestKey(key: string): { year: number; isGeneral: boolean; isPrimary: boolean } | null {
  const u = key.trim().toUpperCase();
  const y = parseInt(u.slice(0, 4), 10);
  if (Number.isNaN(y) || y < 1990) return null;
  return {
    year: y,
    isGeneral: u.includes("GENERAL") && !u.includes("SPECIAL"),
    isPrimary: u.includes("PRIMARY") || u.includes("PREFERENTIAL") || u.includes("RUNOFF"),
  };
}

function buildParticipationMap(
  rows: { contestKey: string; participated: boolean; primaryBallotParty: string | null }[],
): VoterParticipationMap {
  const m = new Map<string, { participated: boolean; primaryBallotParty: string | null }>();
  for (const r of rows) {
    m.set(r.contestKey.toUpperCase(), {
      participated: r.participated,
      primaryBallotParty: r.primaryBallotParty,
    });
  }
  return m;
}

function participatedGeneralInYear(m: VoterParticipationMap, y: number): boolean {
  for (const [k, v] of m) {
    const p = parseContestKey(k);
    if (p && p.isGeneral && p.year === y && v.participated) return true;
  }
  return false;
}

function participatedDemPrimaryPresYear(m: VoterParticipationMap): boolean {
  for (const [k, v] of m) {
    const p = parseContestKey(k);
    if (!p || !p.isPrimary || v.primaryBallotParty?.toUpperCase() !== "D") continue;
    if (isPresidentialYear(p.year) && v.participated) return true;
  }
  return false;
}

function participatedPresidentialGeneral(m: VoterParticipationMap, y: number): boolean {
  const k = `${y}_GENERAL`.toUpperCase();
  return m.get(k)?.participated === true;
}

/** Midterm off-cycle generals in our ingest (adjust if vendor uses different `contestKey` strings). */
const MIDTERM_GENERAL_KEYS = ["2014_GENERAL", "2018_GENERAL", "2022_GENERAL"] as const;

function hasExplicitNoMidtermGeneral(m: VoterParticipationMap): boolean {
  for (const k of MIDTERM_GENERAL_KEYS) {
    const v = m.get(k);
    if (v && v.participated === false) return true;
  }
  return false;
}

function hasAnyMidtermGeneralKey(m: VoterParticipationMap): boolean {
  return MIDTERM_GENERAL_KEYS.some((k) => m.has(k));
}

function participatedAnyMidtermGeneral(m: VoterParticipationMap): boolean {
  for (const k of MIDTERM_GENERAL_KEYS) {
    if (m.get(k)?.participated === true) return true;
  }
  for (const [key, v] of m) {
    const p = parseContestKey(key);
    if (p && p.isGeneral && !isPresidentialYear(p.year) && v.participated) return true;
  }
  return false;
}

/** Voted 2022 general and 2024 general when those keys exist — “reliable nudge” segment. */
function isReliableRecentNudge(m: VoterParticipationMap): boolean {
  const a = participatedGeneralInYear(m, 2022);
  const b = participatedGeneralInYear(m, 2024);
  if (!m.size) return false;
  const has22 = [...m.keys()].some((k) => k.startsWith("2022") && k.includes("GENERAL"));
  const has24 = [...m.keys()].some((k) => k.startsWith("2024") && k.includes("GENERAL"));
  if (has22 && has24) return a && b;
  if (has22 && !has24) return a;
  return false;
}

function demLeanFromClassification(c: VoterClassification | undefined): { score: number; lines: string[] } {
  if (!c) {
    return { score: 32, lines: ["No current VoterModelClassification — using neutral lean prior."] };
  }
  const table: Record<VoterClassification, number> = {
    [VoterClassification.STRONG_BASE]: 90,
    [VoterClassification.LIKELY_SUPPORTER]: 78,
    [VoterClassification.LEANING_SUPPORTER]: 64,
    [VoterClassification.PERSUADABLE]: 45,
    [VoterClassification.LOW_PROPENSITY_SUPPORTER]: 42,
    [VoterClassification.UNKNOWN]: 35,
    [VoterClassification.UNLIKELY_OR_OPPOSED]: 14,
  };
  return { score: table[c] ?? 35, lines: [`VoterModelClassification: ${c}`] };
}

function leanBandFromClassification(
  c: VoterClassification | undefined,
): "solid_lean" | "persuadable" | "opposed_lean" | "unknown" {
  if (!c) return "unknown";
  if (c === VoterClassification.STRONG_BASE || c === VoterClassification.LIKELY_SUPPORTER) return "solid_lean";
  if (c === VoterClassification.PERSUADABLE || c === VoterClassification.LEANING_SUPPORTER) return "persuadable";
  if (c === VoterClassification.UNLIKELY_OR_OPPOSED) return "opposed_lean";
  return "unknown";
}

function solidPersuadableNarrative(b: CountyPriorityVoterRow["leanBand"]): string {
  switch (b) {
    case "solid_lean":
      return "Treated as solid / likely alignment from model tier (not a vote history party ID).";
    case "persuadable":
      return "Treated as persuadable or soft — prioritize message testing and contact discipline.";
    case "opposed_lean":
      return "Treated as unlikely/opposed in model — not a GOTV target unless staff overrides.";
    case "unknown":
    default:
      return "Model unknown — do not treat as base until additional signals or history land.";
  }
}

function maskName(first: string | null, last: string | null, voterFileKey: string): string {
  const fi = first?.trim().charAt(0);
  const li = last?.trim().charAt(0);
  if (fi && li) return `${fi.toUpperCase()}. ${li.toUpperCase()}.`;
  if (voterFileKey.length >= 4) return `Voter ID …${voterFileKey.slice(-4)}`;
  return "—";
}

function adjustLeanFromSignals(
  kinds: VoterSignalKind[],
  base: number,
): { score: number; extra: string[] } {
  let s = base;
  const ex: string[] = [];
  if (kinds.includes(VoterSignalKind.VOLUNTEER)) {
    s += 6;
    ex.push("VOLUNTEER signal +6");
  }
  if (kinds.includes(VoterSignalKind.DONOR)) {
    s += 4;
    ex.push("DONOR signal +4");
  }
  if (kinds.includes(VoterSignalKind.EVENT_ATTENDEE)) {
    s += 3;
    ex.push("EVENT_ATTENDEE +3");
  }
  if (kinds.includes(VoterSignalKind.INITIATIVE_SIGNER)) {
    s += 3;
    ex.push("INITIATIVE_SIGNER +3");
  }
  if (kinds.includes(VoterSignalKind.VOTER_HISTORY)) {
    s += 2;
    ex.push("VOTER_HISTORY (metadata in signals) +2");
  }
  s = Math.min(100, Math.max(0, s));
  return { score: s, extra: ex };
}

/**
 * County-scoped priority universe: participation-driven GOTV, efficiency list, and involvement list.
 * When **no** `VoterElectionParticipation` rows exist, `participationDataPresent` is false and
 * urgency/efficiency use relational + interaction + model tier only.
 */
export async function buildCountyPriorityVoterUniverse(
  params: CountyPriorityVoterUniverseParams,
): Promise<CountyPriorityVoterUniverseResult> {
  const countyId = params.countyId.trim();
  const maxVoterRows = Math.min(Math.max(params.maxVoterRows ?? 8_000, 1), 50_000);
  const listTake = Math.min(Math.max(params.listTake ?? 400, 1), 5_000);

  const dataWarnings: string[] = [];
  const expected = params.expectedGeneralBallots ?? null;
  const wn = expected != null && expected > 0 ? computeWinNumberFromTotal(expected) : null;
  const targetMajority = wn?.value ?? null;
  const outreachListGoal = targetMajority != null ? Math.ceil(targetMajority * 1.1) : null;

  const [partRowCount, voterCount] = await Promise.all([
    prisma.voterElectionParticipation.count({
      where: { voterRecord: { countyId, inLatestCompletedFile: true } },
    }),
    prisma.voterRecord.count({ where: { countyId, inLatestCompletedFile: true } }),
  ]);

  if (voterCount === 0) {
    dataWarnings.push("No VoterRecord rows in this county’s latest file — import voter file before lists populate.");
  }
  if (partRowCount === 0) {
    dataWarnings.push(
      "No VoterElectionParticipation rows — urgency/efficiency are provisional from relational, interactions, and model tier only. Import participation columns into this table to unlock midterm / presidential pattern tags.",
    );
  } else {
    const hasExplicitNo = await prisma.voterElectionParticipation.count({
      where: { voterRecord: { countyId, inLatestCompletedFile: true }, participated: false },
    });
    if (hasExplicitNo === 0) {
      dataWarnings.push(
        "All participation cells are `participated: true` (or the file never encodes `false` for skipped elections) — “midterm = no” pattern tags will not fire until the import includes explicit non-vote rows for those contests.",
      );
    }
  }

  const voters = await prisma.voterRecord.findMany({
    where: { countyId, inLatestCompletedFile: true },
    take: maxVoterRows,
    orderBy: { voterFileKey: "asc" },
    include: {
      electionParticipations: true,
      voterModelClassifications: {
        where: { isCurrent: true },
        take: 1,
        orderBy: { generatedAt: "desc" },
      },
      voterSignals: { select: { signalKind: true } },
      _count: {
        select: { voterInteractions: true, relationalContacts: true },
      },
    },
  });

  const segmentTally = new Map<string, { label: string; n: number }>();

  const allScored: CountyPriorityVoterRow[] = [];

  for (const v of voters) {
    const pMap = buildParticipationMap(v.electionParticipations);
    const hasPart = pMap.size > 0;
    const cls = v.voterModelClassifications[0]?.classification;
    const { score: bLean, lines: leanLines } = demLeanFromClassification(cls);
    const kinds = v.voterSignals.map((s) => s.signalKind);
    const { score: demLean, extra: sigExtra } = adjustLeanFromSignals(kinds, bLean);
    const band = leanBandFromClassification(cls);

    const tags: string[] = [];
    if (hasPart) {
      const presGenVoted = [2016, 2020, 2024].some((y) => participatedPresidentialGeneral(pMap, y));
      const midMissing = hasAnyMidtermGeneralKey(pMap) === false;
      const dPrim =
        participatedDemPrimaryPresYear(pMap) && hasExplicitNoMidtermGeneral(pMap) && !participatedAnyMidtermGeneral(pMap);
      const anyPresNotMid = presGenVoted && hasExplicitNoMidtermGeneral(pMap) && !participatedAnyMidtermGeneral(pMap);
      if (dPrim) {
        tags.push("dem_primary_pres_not_midterm_general");
        const cur = segmentTally.get("dem_primary_pres") ?? {
          label: "D primary in pres. year (file) + explicit midterm general = no in file",
          n: 0,
        };
        cur.n += 1;
        segmentTally.set("dem_primary_pres", cur);
      }
      if (anyPresNotMid) {
        tags.push("presidential_general_yes_no_midterm_general");
        const cur2 = segmentTally.get("pres_not_mid") ?? {
          label: "Voted a pres. general (file) + explicit midterm = no, never mid in file",
          n: 0,
        };
        cur2.n += 1;
        segmentTally.set("pres_not_mid", cur2);
      }
      if (midMissing && hasPart) {
        tags.push("midterm_contest_gaps");
      }
    }

    const rel = v._count.relationalContacts;
    const ixc = v._count.voterInteractions;
    if (rel > 0) {
      const c = segmentTally.get("has_relational") ?? { label: "At least one relational link", n: 0 };
      c.n += 1;
      segmentTally.set("has_relational", c);
    }

    const reliableN = hasPart && isReliableRecentNudge(pMap);
    if (reliableN) {
      tags.push("reliable_recent_general_nudge");
      const c = segmentTally.get("reliable_nudge") ?? { label: "Voted 2022 & 2024 generals (when both keys in file)", n: 0 };
      c.n += 1;
      segmentTally.set("reliable_nudge", c);
    }

    if (!hasPart) {
      const c = segmentTally.get("no_participation") ?? { label: "No per-election participation in DB", n: 0 };
      c.n += 1;
      segmentTally.set("no_participation", c);
    }

    /** Urgency: dropoff and unknown-contact first; boost dem-primary pattern. */
    let gotvUrgency = 40;
    const uReasons: string[] = [];
    if (tags.includes("dem_primary_pres_not_midterm_general")) {
      gotvUrgency += 40;
      uReasons.push("Pattern: D-primary (file) in presidential cycle, no midterm general in data (+40).");
    } else if (tags.includes("presidential_general_yes_no_midterm_general")) {
      gotvUrgency += 32;
      uReasons.push("Pattern: presidential general yes, no midterm general in data (+32).");
    }
    if (ixc === 0) {
      gotvUrgency += 12;
      uReasons.push("No interactions logged — needs contact (+12).");
    } else if (ixc < 3) {
      gotvUrgency += 5;
      uReasons.push("Sparse interaction log (+5).");
    }
    if (rel > 0) {
      gotvUrgency += 6;
      uReasons.push("Relational link exists — reachable (+6).");
    }
    if (band === "persuadable" || band === "unknown") {
      gotvUrgency += 4;
    }
    gotvUrgency = Math.min(100, gotvUrgency);

    /** Efficiency: reliable voters and solid lean — good confirm/nudge list. */
    let gotvEff = 35;
    const eReasons: string[] = [];
    if (reliableN) {
      gotvEff += 35;
      eReasons.push("Recent generals in file — nudge/confirm list (+35).");
    }
    if (band === "solid_lean") {
      gotvEff += 22;
      eReasons.push("Solid-lean model tier (+22).");
    }
    if (rel > 0) {
      gotvEff += 10;
      eReasons.push("Relational (+10).");
    }
    if (ixc > 0) {
      gotvEff += 8;
    }
    gotvEff = Math.min(100, gotvEff);

    let inv = 20;
    const inReasons: string[] = [];
    if (kinds.includes(VoterSignalKind.VOLUNTEER)) {
      inv += 35;
      inReasons.push("Volunteer signal (+35).");
    }
    if (kinds.includes(VoterSignalKind.DONOR)) {
      inv += 18;
      inReasons.push("Donor signal (+18).");
    }
    if (kinds.includes(VoterSignalKind.EVENT_ATTENDEE)) {
      inv += 15;
      inReasons.push("Event signal (+15).");
    }
    if (kinds.includes(VoterSignalKind.INITIATIVE_SIGNER)) {
      inv += 12;
    }
    if (rel > 0) {
      inv += 8 + Math.min(10, rel * 2);
      inReasons.push("Relational network (+8..).");
    }
    inv = Math.min(100, inv);

    const assumptions = [...leanLines, ...sigExtra, ...(hasPart ? [] : ["Participation pattern unknown — not using vote history."])];

    allScored.push({
      voterRecordId: v.id,
      voterFileKey: v.voterFileKey,
      displayNameMasked: maskName(v.firstName, v.lastName, v.voterFileKey),
      precinct: v.precinct,
      demLeanScore: demLean,
      demLeanAssumptions: assumptions,
      leanBand: band,
      solidVsPersuadable: solidPersuadableNarrative(band),
      gotvUrgencyScore: gotvUrgency,
      gotvUrgencyReasons: uReasons,
      gotvEfficiencyScore: gotvEff,
      gotvEfficiencyReasons: eReasons,
      involvementLikelihoodScore: inv,
      involvementReasons: inReasons,
      participationTags: tags,
      participationDataPresent: hasPart,
      reliableNudge: reliableN,
    });
  }

  const byUrgency = [...allScored].sort((a, b) => {
    if (b.gotvUrgencyScore !== a.gotvUrgencyScore) return b.gotvUrgencyScore - a.gotvUrgencyScore;
    return a.voterFileKey.localeCompare(b.voterFileKey);
  });
  const byEff = [...allScored].sort((a, b) => {
    if (b.gotvEfficiencyScore !== a.gotvEfficiencyScore) return b.gotvEfficiencyScore - a.gotvEfficiencyScore;
    return a.voterFileKey.localeCompare(b.voterFileKey);
  });
  const byInv = [...allScored].sort((a, b) => {
    if (b.involvementLikelihoodScore !== a.involvementLikelihoodScore) return b.involvementLikelihoodScore - a.involvementLikelihoodScore;
    return a.voterFileKey.localeCompare(b.voterFileKey);
  });

  const nGoal = outreachListGoal ?? listTake;
  const planSlice = byUrgency.slice(0, Math.min(nGoal, listTake, byUrgency.length));

  const segmentCounts: CountyPrioritySegmentCount[] = [
    ...[...segmentTally.entries()].map(([key, v]) => ({ key, label: v.label, count: v.n })),
  ];

  if (voters.length >= maxVoterRows) {
    dataWarnings.push(`Scored first ${maxVoterRows} voters only — increase maxVoterRows for full roll.`);
  }

  return {
    packet: COUNTY_PRIORITY_1_PACKET,
    generatedAt: new Date().toISOString(),
    countyId,
    targetMajorityWinNumber: targetMajority,
    expectedGeneralBallots: expected,
    outreachListGoal,
    outreachListGoalAssumption:
      "outreachListGoal = ceil(majorityWinNumber × 1.1) when expected general ballots are supplied; use as **planning** contact universe size, not a guarantee of votes.",
    participationRowCount: partRowCount,
    voterScopeCount: voterCount,
    dataWarnings,
    segmentCounts,
    gotvUrgencyTop: byUrgency.slice(0, listTake),
    gotvEfficiencyTop: byEff.slice(0, listTake),
    involvementTop: byInv.slice(0, listTake),
    planSliceByUrgency: planSlice,
    allScored,
  };
}

/**
 * Resolves **Pope** (`05115`) and pulls expected general ballots from `buildCountyPoliticalProfile` if not provided.
 */
export async function buildPopeCountyPriorityVoterUniverse(
  expectedGeneralBallotsOverride?: number | null,
): Promise<CountyPriorityVoterUniverseResult | null> {
  const c = await prisma.county.findFirst({
    where: { OR: [{ fips: "05115" }, { slug: { equals: "pope", mode: "insensitive" } }] },
    select: { id: true },
  });
  if (!c) {
    return null;
  }
  let expected = expectedGeneralBallotsOverride;
  if (expected == null) {
    const { buildCountyPoliticalProfile } = await import("./county-political-profile");
    const p = await buildCountyPoliticalProfile({ countyName: "Pope", fips: "05115" });
    expected = p.winNumberModel.expectedTotalVotes ?? null;
  }
  return buildCountyPriorityVoterUniverse({
    countyId: c.id,
    expectedGeneralBallots: expected,
  });
}
