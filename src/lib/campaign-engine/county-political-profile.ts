/**
 * COUNTY-PROFILE-ENGINE-1 — Reusable county political profile (read-only).
 * No fabrication: missing data is explicit. Party registration is not inferred.
 */
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import hammerDryRun from "../../../data/intelligence/generated/arkleg-hammer-ingest-summary.dryrun.json";

export const COUNTY_PROFILE_ENGINE_PACKET = "COUNTY-PROFILE-ENGINE-1" as const;

export type CountyProfileDataStatus = {
  hasCounty: boolean;
  electionCountyRowCount: number;
  electionPrecinctRowCount: number;
  hasPartyRegistrationField: boolean;
  lastSyncedAt: string | null;
  notes: string[];
};

export type CountyProfileRow = {
  sourceId: string;
  electionName: string;
  electionDate: string;
  isOfficial: boolean | null;
  registeredVoters: number | null;
  ballotsCast: number | null;
  votePercent: number | null;
  contestName: string | null;
  contestTotalVotes: number | null;
};

export type PluralityScenario = {
  label: string;
  /** Share of *all ballots cast* (e.g. 0.5 for majority) */
  voteShare: number;
  /** Minimum votes to reach threshold if everyone votes */
  minVotes: number;
  /** Same formula, transparent */
  formula: string;
  confidence: "planning-estimate" | "math-only";
};

export type WinNumberModel = {
  expectedTotalVotes: number | null;
  majorityWinNumber: number | null;
  /** floor(expected/2) + 1 for integer ballots */
  formula: string;
  basis: string;
  confidence: "db-derived" | "planning-estimate" | "unavailable";
  assumptions: string[];
};

export type PluralityModel = {
  scenarios: PluralityScenario[];
  threeWayNarrative: string;
  /** Campaign assessment — not in election JSON; verify with public reporting. */
  competitiveContextNotes: { label: string; text: string; confidence: "public-reporting-needed" }[];
  assumptions: string[];
};

export type RelationalAndPowerOfFive = {
  summary: string;
  powerOfFiveDefinition: string;
  /** Aggregate counts only — no PII */
  aggregateRelationalCount: number | null;
  aggregateCoreFiveCount: number | null;
  aggregateFollowUpCount: number | null;
  technicalCapabilities: string[];
  howItHelpsWin: string;
  confidence: "db-derived" | "unavailable";
};

export type CensusAcsBlsDataBlock = {
  censusPopulation: number | null;
  acsMedianIncome: number | null;
  acsPovertyRate: number | null;
  acsEducation: { bachelorsOrHigherPercent: number | null; note: string } | null;
  acsAgeBands: unknown | null;
  acsRaceEthnicity: unknown | null;
  blsUnemployment: number | null;
  blsIndustryMix: unknown | null;
  dataStatus: Record<string, "present" | "missing">;
  missingDataWarnings: string[];
};

export type CountyPoliticalProfileResult = {
  county: { id: string; slug: string; fips: string; displayName: string } | null;
  dataStatus: CountyProfileDataStatus;
  censusAcsBls: CensusAcsBlsDataBlock;
  electionHistory: CountyProfileRow[];
  primaryHistory: CountyProfileRow[];
  turnoutProfile: {
    lastGeneral: CountyProfileRow | null;
    lastPrimary: CountyProfileRow | null;
    lowTurnoutPrimary: CountyProfileRow | null;
    dropOffNarrative: string | null;
  };
  precinctMapData: {
    topPrecinctsByBallots: { label: string; ballots: number; source: string }[];
    lowTurnoutOpportunities: { label: string; note: string }[];
    confidence: "db-derived" | "unavailable";
  };
  registrationProfile: {
    note: string;
    lastKnownRegisteredFromResults: number | null;
  };
  estimatedDemocraticUniverse: {
    observedDemocraticVoteFloor: number | null;
    note: string;
    confidence: "unavailable" | "needs-contest-data";
  };
  winNumberModel: WinNumberModel;
  pluralityModel: PluralityModel;
  volunteerAndContactProfile: {
    knownContactsCount: number | null;
    relationalContactsCount: number | null;
    volunteerAsksCount: number | null;
    followUpNeededCount: number | null;
    confidence: "db-derived" | "unavailable";
  };
  oppositionHighlights: {
    category: string;
    billNumber: string;
    session: string;
    title: string;
    titleConfidence: "title-metadata-only";
  }[];
  talkingPoints: { strong: string[]; questions: string[]; avoid: string[]; countyAsks: string[] };
  pathToVictory: string;
  engagementPlan: {
    relationalOrganizing: RelationalAndPowerOfFive;
    thisWeek: string[];
    kellyGrappeCom: string;
    engineRoadmap: string;
  };
  missingDataWarnings: string[];
  sources: { id: string; label: string; type: string; pathOrNote: string }[];
  generatedAt: string;
  office: string;
};

function emptyAcsBls(notes: string[] = []): CensusAcsBlsDataBlock {
  return {
    censusPopulation: null,
    acsMedianIncome: null,
    acsPovertyRate: null,
    acsEducation: null,
    acsAgeBands: null,
    acsRaceEthnicity: null,
    blsUnemployment: null,
    blsIndustryMix: null,
    dataStatus: {
      censusPopulation: "missing",
      acsMedianIncome: "missing",
      acsPovertyRate: "missing",
      acsEducation: "missing",
      acsAgeBands: "missing",
      acsRaceEthnicity: "missing",
      blsUnemployment: "missing",
      blsIndustryMix: "missing",
    },
    missingDataWarnings: notes,
  };
}

function acsBlsFromDb(
  d: {
    population: number | null;
    votingAgePopulation: number | null;
    medianHouseholdIncome: number | null;
    povertyRatePercent: number | null;
    bachelorsOrHigherPercent: number | null;
    ageBandsJson: unknown;
    raceEthnicityJson: unknown;
    educationJson: unknown;
    employmentJson: unknown;
    unemploymentRatePercent: number | null;
    blsIndustryMixJson: unknown;
  } | null
): CensusAcsBlsDataBlock {
  if (!d) {
    return emptyAcsBls([
      "No CountyPublicDemographics row — import `data/county-intelligence/acs-bls-import-template.csv` (dry-run) or use Census/BLS public exports.",
    ]);
  }
  const w: string[] = [];
  const st = (present: boolean) => (present ? "present" as const : "missing" as const);
  if (d.population == null) w.push("population not stored");
  if (d.medianHouseholdIncome == null) w.push("median income not stored");
  if (d.unemploymentRatePercent == null && d.employmentJson == null) w.push("BLS unemployment / industry mix optional — not yet in row");

  return {
    censusPopulation: d.population ?? d.votingAgePopulation ?? null,
    acsMedianIncome: d.medianHouseholdIncome,
    acsPovertyRate: d.povertyRatePercent,
    acsEducation: {
      bachelorsOrHigherPercent: d.bachelorsOrHigherPercent,
      note: "Bachelor+ share from public demographics when supplied — not a voter propensity model.",
    },
    acsAgeBands: (d as { ageBandsJson?: unknown }).ageBandsJson ?? null,
    acsRaceEthnicity: d.raceEthnicityJson,
    blsUnemployment: d.unemploymentRatePercent,
    blsIndustryMix: d.blsIndustryMixJson,
    dataStatus: {
      censusPopulation: st(d.population != null),
      acsMedianIncome: st(d.medianHouseholdIncome != null),
      acsPovertyRate: st(d.povertyRatePercent != null),
      acsEducation: st(d.bachelorsOrHigherPercent != null),
      acsAgeBands: st((d as { ageBandsJson?: unknown }).ageBandsJson != null),
      acsRaceEthnicity: st(d.raceEthnicityJson != null),
      blsUnemployment: st(d.unemploymentRatePercent != null),
      blsIndustryMix: st(d.blsIndustryMixJson != null),
    },
    missingDataWarnings: w,
  };
}

const SOS_KEYWORD_RE =
  /initiative|referendum|ballot|election|SECRETARY OF STATE|state board of election|county clerk|absentee|voting machine|ballot|petition|capitol/i;

type HammerControversialRow = {
  billNumber: string;
  session: string;
  title: string;
  role: string;
};

function parseHammerSosRelevant(
  rows: HammerControversialRow[]
): CountyPoliticalProfileResult["oppositionHighlights"] {
  const out: CountyPoliticalProfileResult["oppositionHighlights"] = [];
  for (const r of rows) {
    if (SOS_KEYWORD_RE.test(r.title) || /SB307/i.test(r.billNumber)) {
      out.push({
        category: "SOS-relevant (title scan)",
        billNumber: r.billNumber,
        session: r.session,
        title: r.title,
        titleConfidence: "title-metadata-only",
      });
    }
  }
  return out.slice(0, 40);
}

export function computeWinNumberFromTotal(
  expectedTotal: number
): { value: number; formula: string } {
  if (!Number.isFinite(expectedTotal) || expectedTotal < 0) {
    return { value: 0, formula: "winNumber = max(0, floor(expectedTotalVotes/2) + 1) when total known" };
  }
  const v = Math.floor(expectedTotal / 2) + 1;
  return { value: v, formula: "winNumber = floor(expectedTotalVotes / 2) + 1" };
}

export function computePluralityThreshold(
  expectedTotal: number,
  share: number
): { value: number; formula: string } {
  if (!Number.isFinite(expectedTotal) || expectedTotal < 0) {
    return { value: 0, formula: "n/a" };
  }
  const v = Math.floor(expectedTotal * share) + 1;
  return {
    value: v,
    formula: `pluralityWinThreshold = floor(expectedTotalVotes * ${share}) + 1 (integer ballots)`,
  };
}

function rowFromDb(
  r: Prisma.ElectionCountyResultGetPayload<{
    include: {
      source: true;
      contest: true;
    };
  }>
): CountyProfileRow {
  const vp = r.votePercent != null ? Number(r.votePercent) : null;
  return {
    sourceId: r.sourceId,
    electionName: r.source.electionName,
    electionDate: r.source.electionDate.toISOString(),
    isOfficial: r.source.isOfficial,
    registeredVoters: r.registeredVoters,
    ballotsCast: r.ballotsCast,
    votePercent: vp,
    contestName: r.contest?.contestName ?? null,
    contestTotalVotes: r.contest?.totalVotes ?? null,
  };
}

function isPrimaryName(name: string) {
  return /primary|preferential|runoff/i.test(name);
}

export type BuildCountyPoliticalProfileParams = {
  countyName: string;
  /** 5-char FIPS when known (e.g. 05115 for Pope) — resolves county when name/slug mismatch in DB */
  fips?: string;
  countyId?: string;
  office?: string;
  includePrecincts?: boolean;
  includeOpposition?: boolean;
};

export async function buildCountyPoliticalProfile(
  params: BuildCountyPoliticalProfileParams
): Promise<CountyPoliticalProfileResult> {
  const office = params.office ?? "Secretary of State";
  const now = new Date().toISOString();
  const notes: string[] = [];
  const missing: string[] = ["Arkansas has no public party registration in the voter file sense used for D share."];
  const sources: CountyPoliticalProfileResult["sources"] = [
    { id: "SRC-PRISMA", label: "Local election result tables", type: "DB", pathOrNote: "ElectionCountyResult, ElectionPrecinctResult" },
  ];

  let county: CountyPoliticalProfileResult["county"] = null;
  if (params.countyId) {
    const c = await prisma.county.findUnique({
      where: { id: params.countyId },
      select: { id: true, slug: true, fips: true, displayName: true },
    });
    county = c;
  } else {
    const raw = params.countyName.trim();
    const fips5 = params.fips?.replace(/\D/g, "").padStart(5, "0");
    if (fips5 && fips5.length === 5) {
      const byF = await prisma.county.findFirst({
        where: { fips: fips5 },
        select: { id: true, slug: true, fips: true, displayName: true },
      });
      if (byF) {
        county = byF;
      }
    }
    if (!county) {
      const c = await prisma.county.findFirst({
        where: {
          OR: [
            { displayName: { equals: raw, mode: "insensitive" } },
            { displayName: { equals: `${raw} County`, mode: "insensitive" } },
            { displayName: { contains: raw, mode: "insensitive" } },
            { slug: { equals: `${raw.toLowerCase().replace(/\s+/g, "-")}-county` } },
            { slug: { equals: raw.toLowerCase().replace(/\s+/g, "-") } },
          ],
        },
        select: { id: true, slug: true, fips: true, displayName: true },
      });
      county = c;
    }
  }

  /** When County row is missing, still pull election data by FIPS or raw name on result rows. */
  let countyFipsForRows: string | null = null;
  let rowWhere: Prisma.ElectionCountyResultWhereInput = {};
  if (!county && params.fips) {
    countyFipsForRows = params.fips.replace(/\D/g, "").padStart(5, "0");
    rowWhere = { countyFips: countyFipsForRows };
  } else if (!county) {
    const n = params.countyName.replace(/county/ig, "").trim();
    if (n.length > 0) {
      rowWhere = { countyNameRaw: { equals: n, mode: "insensitive" } };
    }
  }

  if (!county && countyFipsForRows) {
    county = {
      id: "synthetic",
      displayName: `${params.countyName.replace(/county/ig, "").trim()} County`.replace(/\s+/g, " "),
      fips: countyFipsForRows,
      slug: "pope-county",
    };
    notes.push("County row missing in Prisma — using FIPS on election result rows; relational counts need a mapped County.id.");
  }

  if (!county && !countyFipsForRows && !("countyNameRaw" in rowWhere)) {
    notes.push("County not found in Prisma and no fips for fallback; check slug, countyId, or fips.");
    return {
      county: null,
      dataStatus: {
        hasCounty: false,
        electionCountyRowCount: 0,
        electionPrecinctRowCount: 0,
        hasPartyRegistrationField: false,
        lastSyncedAt: null,
        notes,
      },
      censusAcsBls: emptyAcsBls(["County not resolved — no ACS/Census block."]),
      electionHistory: [],
      primaryHistory: [],
      turnoutProfile: { lastGeneral: null, lastPrimary: null, lowTurnoutPrimary: null, dropOffNarrative: null },
      precinctMapData: { topPrecinctsByBallots: [], lowTurnoutOpportunities: [], confidence: "unavailable" },
      registrationProfile: { note: "No county row.", lastKnownRegisteredFromResults: null },
      estimatedDemocraticUniverse: {
        observedDemocraticVoteFloor: null,
        note: "Import contest-candidate results with party labels to estimate floor; not computed here.",
        confidence: "needs-contest-data",
      },
      winNumberModel: {
        expectedTotalVotes: null,
        majorityWinNumber: null,
        formula: "winNumber = floor(expectedTotalVotes / 2) + 1",
        basis: "n/a — county not resolved",
        confidence: "unavailable",
        assumptions: [],
      },
      pluralityModel: {
        scenarios: [],
        threeWayNarrative:
          "When three or more candidates are on the ballot, the winner may be selected by plurality under Arkansas rules for that office, depending on the contest and year. The campaign still benefits from a majority-capable coalition for legitimacy and stability.",
        competitiveContextNotes: [
          {
            label: "Multi-candidate / libertarian / GOP dynamics",
            text: "Narrative claims about who called for a protest vote, or 50/50 GOP splits, require citation from public reporting or polling — not from this results JSON (which does not name candidates).",
            confidence: "public-reporting-needed",
          },
        ],
        assumptions: ["Use certified vote totals and contest rules for the target election."],
      },
      volunteerAndContactProfile: {
        knownContactsCount: null,
        relationalContactsCount: null,
        volunteerAsksCount: null,
        followUpNeededCount: null,
        confidence: "unavailable",
      },
      oppositionHighlights: params.includeOpposition ? parseHammerSosRelevant((hammerDryRun as { controversial: HammerControversialRow[] }).controversial) : [],
      talkingPoints: { strong: [], questions: [], avoid: [], countyAsks: [] },
      pathToVictory: "Resolve county, then re-run this profile with DB access.",
      engagementPlan: {
        relationalOrganizing: {
          summary: "Relational layer uses trusted networks (GOTV-2, relational contacts) — metrics below are aggregate only.",
          powerOfFiveDefinition:
            "Each core supporter brings five: expand reach without broadcasting private lists. Tracked in-app via relational contacts (e.g. powerOfFiveSlot / isCoreFive) when enabled.",
          aggregateRelationalCount: null,
          aggregateCoreFiveCount: null,
          aggregateFollowUpCount: null,
          technicalCapabilities: [
            "Relational contacts and GOTV planning in secure campaign tools",
            "Optional core-five flags on relational rows (PII stays internal)",
            "County briefing pages built from verified public and aggregate data",
          ],
          howItHelpsWin:
            "Converts private trust into turnout where mail alone cannot; scales as organizers grow trusted local networks.",
          confidence: "unavailable",
        },
        thisWeek: [],
        kellyGrappeCom: "https://www.kellygrappe.com",
        engineRoadmap:
          "The public site is the front door; behind the scenes the campaign matures coordinated county dashboards, GOTV planning, and approval-based messaging—always with private data off public pages.",
      },
      missingDataWarnings: missing,
      sources,
      generatedAt: now,
      office,
    };
  }

  const effectiveCounty = county;
  const countyIdForRel =
    effectiveCounty && effectiveCounty.id !== "synthetic" ? effectiveCounty.id : null;
  const rawName = params.countyName.replace(/county/ig, "").trim();
  const electionResultWhere: Prisma.ElectionCountyResultWhereInput = countyIdForRel
    ? { countyId: countyIdForRel }
    : countyFipsForRows
      ? {
          OR: [
            { countyFips: countyFipsForRows },
            { countyNameRaw: { equals: rawName, mode: "insensitive" } },
            { countyNameRaw: { equals: `${rawName} County`, mode: "insensitive" } },
          ],
        }
      : rowWhere;
  const precinctWhere: Prisma.ElectionPrecinctResultWhereInput = countyIdForRel
    ? { countyId: countyIdForRel }
    : countyFipsForRows
      ? {
          OR: [
            { countyFips: countyFipsForRows },
            { countyNameRaw: { equals: rawName, mode: "insensitive" } },
            { countyNameRaw: { equals: `${rawName} County`, mode: "insensitive" } },
          ],
        }
      : { id: { in: [] } };

  const [electionCountyRowCount, electionPrecinctRowCount, rows, precRows, relCount, coreFive, followUps, voterN, askCount] = await Promise.all([
    prisma.electionCountyResult.count({ where: electionResultWhere }),
    params.includePrecincts
      ? prisma.electionPrecinctResult.count({ where: precinctWhere })
      : Promise.resolve(0),
    prisma.electionCountyResult.findMany({
      where: electionResultWhere,
      take: 400,
      orderBy: [{ source: { electionDate: "desc" } }],
      include: { source: true, contest: true },
    }),
    params.includePrecincts && (countyIdForRel || countyFipsForRows)
      ? prisma.electionPrecinctResult.findMany({
          where: precinctWhere,
          take: 8000,
          select: {
            ballotsCast: true,
            registeredVoters: true,
            precinctNameRaw: true,
            source: { select: { electionName: true, electionDate: true } },
          },
        })
      : Promise.resolve(
          [] as {
            ballotsCast: number | null;
            registeredVoters: number | null;
            precinctNameRaw: string | null;
            source: { electionName: string; electionDate: Date };
          }[]
        ),
    countyIdForRel ? prisma.relationalContact.count({ where: { countyId: countyIdForRel } }).catch(() => 0) : 0,
    countyIdForRel
      ? prisma.relationalContact.count({ where: { countyId: countyIdForRel, isCoreFive: true } }).catch(() => 0)
      : 0,
    countyIdForRel
      ? prisma.relationalContact
          .count({
            where: { countyId: countyIdForRel, nextFollowUpAt: { not: null } },
          })
          .catch(() => 0)
      : 0,
    countyIdForRel ? prisma.voterRecord.count({ where: { countyId: countyIdForRel } }).catch(() => 0) : 0,
    countyIdForRel ? prisma.volunteerAsk.count({ where: { countyId: countyIdForRel } }).catch(() => 0) : 0,
  ]);

  if (relCount > 0) {
    sources.push({ id: "SRC-REL", label: "Relational contact aggregates", type: "DB", pathOrNote: "RelationalContact count by county" });
  }

  const history = rows.map(rowFromDb);
  const generals = history.filter((h) => !isPrimaryName(h.electionName));
  const primaries = history.filter((h) => isPrimaryName(h.electionName));
  const byDateDesc = (a: CountyProfileRow, b: CountyProfileRow) =>
    b.electionDate.localeCompare(a.electionDate);
  const generalsTurnout = generals
    .filter((h) => h.contestName == null)
    .sort(byDateDesc);
  const lastGeneral =
    generalsTurnout[0] ??
    [...generals].sort((a, b) => (b.ballotsCast ?? 0) - (a.ballotsCast ?? 0))[0] ??
    null;
  const primaryTurnout = primaries
    .filter((h) => h.contestName == null)
    .sort(byDateDesc);
  const lastPrimary = primaryTurnout[0] ?? primaries.sort(byDateDesc)[0] ?? null;
  const primaryForLow = primaryTurnout.length > 0 ? primaryTurnout : primaries;
  const lowTurnoutPrimary =
    primaryForLow.length > 0
      ? [...primaryForLow].sort(
          (a, b) => (a.votePercent ?? 0) - (b.votePercent ?? 0)
        )[0] ?? null
      : null;

  let expectedTotal: number | null = lastGeneral?.ballotsCast ?? null;
  if (expectedTotal == null && generals.length > 0) {
    const withBallots = generals.filter((g) => g.ballotsCast != null && (g.ballotsCast as number) > 0);
    const pick = [...withBallots].sort(byDateDesc)[0];
    if (pick) {
      expectedTotal = pick.ballotsCast;
      notes.push(`Expected total from latest general row with ballots cast: ${pick.electionName}.`);
    }
  }
  if (expectedTotal == null && lastGeneral?.registeredVoters && lastGeneral.votePercent != null) {
    const est = Math.round((lastGeneral.registeredVoters * (lastGeneral.votePercent as number)) / 100);
    if (est > 0) {
      expectedTotal = est;
      notes.push("Expected total inferred from R·turnout% when ballotsCast null — verify row.");
    }
  }

  const wn = expectedTotal != null ? computeWinNumberFromTotal(expectedTotal) : { value: 0, formula: "n/a" };
  const plShares = [0.5, 0.45, 0.42, 0.38] as const;
  const plLabels = [
    "50% + 1 (majority, two-way mental model — not a substitute for legal contest rule)",
    "45% (illustrative plurality — verify contest)",
    "42% (illustrative)",
    "38% (low-fragmentation illustrative)",
  ];
  const scenarios: PluralityScenario[] = plShares.map((s, i) => {
    const t = expectedTotal != null ? computePluralityThreshold(expectedTotal, s) : { value: 0, formula: "n/a" };
    return {
      label: plLabels[i] ?? `share ${s}`,
      voteShare: s,
      minVotes: t.value,
      formula: t.formula,
      confidence: "planning-estimate",
    };
  });

  const dropOffNarrative =
    lastGeneral && lastPrimary
      ? `Last primary (~${(lastPrimary.votePercent ?? 0).toFixed(1)}% turnout of registered) vs last general snapshot in sources (see ballots/RV on turnout rows): plan relational & GOTV to bridge the drop-off.`
      : null;

  const aggByPrecinct = new Map<string, { ballots: number; reg: number; lastSrc: string }>();
  for (const pr of precRows) {
    const key = (pr.precinctNameRaw ?? "unknown").trim() || "unknown";
    const cur = aggByPrecinct.get(key) ?? { ballots: 0, reg: 0, lastSrc: "" };
    cur.ballots += pr.ballotsCast ?? 0;
    cur.reg += pr.registeredVoters ?? 0;
    cur.lastSrc = pr.source.electionName;
    aggByPrecinct.set(key, cur);
  }
  const topPrecincts = [...aggByPrecinct.entries()]
    .map(([label, v]) => ({ label, ballots: v.ballots, reg: v.reg, source: v.lastSrc }))
    .filter((p) => p.ballots > 0)
    .sort((a, b) => b.ballots - a.ballots)
    .slice(0, 10)
    .map((p) => ({ label: p.label, ballots: p.ballots, source: p.source }));
  const lowTurnoutOpp: { label: string; note: string }[] = topPrecincts
    .filter((p) => p.label !== "unknown")
    .slice(-5)
    .map((p) => ({ label: p.label, note: "Compare registered vs cast when precinct R/V fields align — not individual voters." }));
  if (topPrecincts.length === 0) {
    missing.push("No precinct tabulation in DB for this county — PRECINCT-1 / ingest gap possible.");
  }

  const opposition = params.includeOpposition
    ? parseHammerSosRelevant((hammerDryRun as { controversial: HammerControversialRow[] }).controversial)
    : [];
  sources.push({
    id: "SRC-ARKLEG-DRY",
    label: "Hammer title grid (controversial / filtered)",
    type: "JSON",
    pathOrNote: "data/intelligence/generated/arkleg-hammer-ingest-summary.dryrun.json",
  });

  const acsBls = countyIdForRel
    ? acsBlsFromDb(
        await prisma.countyPublicDemographics.findUnique({
          where: { countyId: countyIdForRel },
        })
      )
    : emptyAcsBls(
        !countyIdForRel
          ? ["County FIPS / Prisma id missing for ACS join — public demographics are optional.", ...missing]
          : missing
      );

  return {
    county,
    censusAcsBls: acsBls,
    dataStatus: {
      hasCounty: effectiveCounty != null && effectiveCounty.id !== "synthetic",
      electionCountyRowCount,
      electionPrecinctRowCount,
      hasPartyRegistrationField: false,
      lastSyncedAt: now,
      notes: electionCountyRowCount === 0 ? ["No election county rows in DB for this county — run election ingest."] : notes,
    },
    electionHistory: generals,
    primaryHistory: primaries,
    turnoutProfile: { lastGeneral, lastPrimary, lowTurnoutPrimary, dropOffNarrative },
    precinctMapData: {
      topPrecinctsByBallots: topPrecincts,
      lowTurnoutOpportunities: lowTurnoutOpp,
      confidence: topPrecincts.length > 0 ? "db-derived" : "unavailable",
    },
    registrationProfile: {
      note: "Use `registeredVoters` on turnout rows as a snapshot, not a live file export.",
      lastKnownRegisteredFromResults: lastGeneral?.registeredVoters ?? lastPrimary?.registeredVoters ?? null,
    },
    estimatedDemocraticUniverse: {
      observedDemocraticVoteFloor: null,
      note: "Requires contest-candidate results with defensible D labeling — not imputed from geography.",
      confidence: "needs-contest-data",
    },
    winNumberModel: {
      expectedTotalVotes: expectedTotal,
      majorityWinNumber: expectedTotal != null ? wn.value : null,
      formula: wn.formula,
      basis: lastGeneral
        ? `Latest general in DB for county: ${lastGeneral.electionName} (${lastGeneral.electionDate.slice(0, 10)})`
        : "No general row in sample",
      confidence: expectedTotal != null ? "db-derived" : "unavailable",
      assumptions: [
        "If three-way, majority threshold may not match legal win threshold — use plurality model.",
        "Use certified totals for the target election, not a planning prototype.",
      ],
    },
    pluralityModel: {
      scenarios: expectedTotal != null ? scenarios : [],
      threeWayNarrative:
        "A three-way race (e.g. D / R / L) can be decided by a plurality. Planning includes both a majority goal (trust and mandate) and lower-threshold technical floors — verify the exact office’s election method for the year on the ballot.",
      competitiveContextNotes: [
        {
          label: "2026 context (field assessment)",
          text: "Claims about a strong third candidate, or Republicans urging a Libertarian vote, are not derivable from the JSON exports we ingest (contest text does not include candidate names here). Cite public reporting, polling, or party communications if you use this message.",
          confidence: "public-reporting-needed",
        },
      ],
      assumptions: [
        "plurality thresholds scale linearly with expected total ballots only as a *math illustration*",
        "No runoff assumed — add rules from SoS for the specific contest if a runoff is possible",
      ],
    },
    volunteerAndContactProfile: {
      knownContactsCount: voterN > 0 ? voterN : null,
      relationalContactsCount: relCount > 0 ? relCount : null,
      volunteerAsksCount: askCount > 0 ? askCount : null,
      followUpNeededCount: followUps > 0 ? followUps : null,
      confidence: relCount + voterN > 0 ? "db-derived" : "unavailable",
    },
    oppositionHighlights: opposition,
    talkingPoints: {
      strong: [
        "The Secretary of State’s office is not just paperwork. It touches elections, business filings, public records, and the Capitol — administration matters.",
        "Pope County should not have to wait for Little Rock to model transparent, competent election and records service.",
        "A three-way race changes the math; it does not change the mission: build a broad, trustworthy coalition.",
        "We run on people over politics — and we back that with data we can show, not guesses we cannot defend.",
        "Your relational network (family, work, church, school) is how we turn registration into turnout.",
      ],
      questions: [
        "How will you make early voting and notice rules work for both Russellville and rural precincts?",
        "What does a competent business-filing service look like to a small business owner in this county?",
        "How will you depoliticize election disputes that hit the Capitol?",
      ],
      avoid: [
        "Citing 2026 primary candidate splits without a verified contest result table.",
        "Treating a planning illustration as a certified vote requirement.",
        "Stating an opponent’s motive without a citable public record.",
      ],
      countyAsks: [
        "Host a relational coffee with five unregistered friends.",
        "Report one data verification gap from this briefing to the team.",
        "Attend a county event with a one-page handout from kellygrappe.com.",
        "Recruit a deputy registrar partner through your church or union.",
        "Map one trusted circle with the Power of Five (five conversations).",
      ],
    },
    pathToVictory:
      "1) Grow trusted contacts (relational + power of five). 2) Register and chase turnout, especially in low-turnout slices. 3) Use verified opposition record (SOS-relevant legislation) in town halls. 4) Build toward majority-capable support while planning for plausible plurality if three-way. 5) Feed everything back into coordinated GOTV and research workflows as they mature — never dump private lists on a static public page.",
    engagementPlan: {
      relationalOrganizing: {
        summary:
          "The campaign combines GOTV, relational networks, and the Power of Five (each core supporter bringing five conversations) — tracked securely for organizers with access, with only aggregates on public pages.",
        powerOfFiveDefinition:
          "Five conversations per core supporter — scalable, private, and measurable as aggregates only in public materials.",
        aggregateRelationalCount: relCount > 0 ? relCount : null,
        aggregateCoreFiveCount: coreFive > 0 ? coreFive : null,
        aggregateFollowUpCount: followUps > 0 ? followUps : null,
        technicalCapabilities: [
          "Secure relational and voter roll summaries for staff (no public PII)",
          "GOTV contact plan previews for the field",
          "Opposition research from public bill metadata (verify full text before claims)",
          "County political profiles for local briefings",
        ],
        howItHelpsWin:
          "Converts one-to-one trust into net votes; aggregate counts show depth where broadcast cannot. kellygrappe.com is the public front door while staff tools keep the same discipline—county by county, with private data off the open web.",
        confidence: relCount + coreFive > 0 ? "db-derived" : "unavailable",
      },
      thisWeek: [
        "Export this county profile from the secure campaign dashboard for a leader huddle (internal).",
        "Log relational touches in the approved internal tool (no PII in static drops).",
        "Pick one opposition category (initiative, audit, etc.) to verify on Arkleg.",
        "Schedule one in-person follow-up in the highest-precinct cluster when precinct data exists.",
      ],
      kellyGrappeCom:
        "https://www.kellygrappe.com — public sign-up, events, and volunteer paths while staff coordination tools catch up behind the scenes.",
      engineRoadmap:
        "Today: manual coordination, verified research, and secure staff dashboards. Tomorrow: deeper county views, contact plans, task queues, and approval-based messaging—this profile is a bridge artifact.",
    },
    missingDataWarnings: Array.from(
      new Set(
        [
          ...missing,
          "No 2026 runoff JSON in the canonical 13-file election set on disk — if a runoff is relevant, add that file to ingest and re-run the audit.",
          "SOS 2026 primary contest data in raw JSON is ID-based without candidate name strings in the export we inspected — do not assert name-level splits from this file alone.",
        ]
      )
    ),
    sources,
    generatedAt: now,
    office,
  };
}
