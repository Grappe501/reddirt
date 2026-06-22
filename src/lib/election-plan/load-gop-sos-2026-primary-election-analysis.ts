import { readFileSync } from "fs";
import path from "path";

import type { GopSos2026ResultsBundle } from "@/lib/election-plan/gop-sos-2026-results-types";
import type {
  GopCountyFlipRow,
  GopPrecinctReportingRow,
  GopRegionAnalysisRow,
  GopSos2026PrimaryElectionAnalysis,
  GopTurnoutDropRow,
} from "@/lib/election-plan/gop-sos-2026-primary-election-analysis-types";

const DATA_FILE = path.join(process.cwd(), "data/election/2026-gop-sos-primary-runoff-by-county.normalized.json");
const RUNOFF_CACHE = path.join(process.cwd(), "data/election/2026-gop-sos-runoff-api-cache.json");

const REGION_LABELS: Record<string, string> = {
  central: "Central Arkansas",
  northwest: "Northwest",
  northeast: "Northeast",
  north_central: "North Central",
  west_central: "West Central",
  southwest: "Southwest",
  south: "South",
  southeast: "Southeast",
};

let cached: GopSos2026PrimaryElectionAnalysis | null = null;

function pct(n: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((n / total) * 1000) / 10;
}

function loadBundle(): GopSos2026ResultsBundle | null {
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8")) as GopSos2026ResultsBundle;
  } catch {
    return null;
  }
}

function loadPrecinctCountsByFips(): Map<string, number> {
  const map = new Map<string, number>();
  try {
    const cache = JSON.parse(readFileSync(RUNOFF_CACHE, "utf8")) as {
      turnout?: { totalPrecincts?: number };
      response?: {
        contests?: Record<
          string,
          { locations?: Record<string, { totalPrecincts?: number }> }
        >;
      };
    };
    const contestId = "1f5c45de-d1b5-4acb-a853-b72b5f695363";
    const locs = cache.response?.contests?.[contestId]?.locations ?? {};
    for (const [fips, loc] of Object.entries(locs)) {
      if (loc.totalPrecincts != null) map.set(fips, loc.totalPrecincts);
    }
  } catch {
    /* optional cache */
  }
  return map;
}

function toFlipRow(row: GopSos2026ResultsBundle["counties"][number]): GopCountyFlipRow {
  return {
    county: row.county,
    countySlug: row.countySlug,
    primaryWinner: row.primary.winner,
    runoffWinner: row.runoff.winner,
    runoffMarginPct: row.runoff.marginPct,
    opportunityTier: row.analysis.opportunityTier,
    headline: row.analysis.headline,
  };
}

export function buildGopSos2026PrimaryElectionAnalysis(): GopSos2026PrimaryElectionAnalysis | null {
  const bundle = loadBundle();
  if (!bundle) return null;

  const { counties, statewide, builtAt, sources } = bundle;
  const precinctByFips = loadPrecinctCountsByFips();
  const totalPrecinctsReporting =
    [...precinctByFips.values()].reduce((s, n) => s + n, 0) || 2863;

  const retentionPct = pct(statewide.runoff.totalVotes, statewide.primary.totalVotes);

  const regionBuckets = new Map<string, GopRegionAnalysisRow>();
  for (const row of counties) {
    const id = row.regionId;
    const existing = regionBuckets.get(id) ?? {
      regionId: id,
      regionLabel: REGION_LABELS[id] ?? id,
      countyCount: 0,
      primaryNorrisPct: 0,
      primaryHammerPct: 0,
      primaryHarrisonPct: 0,
      runoffNorrisPct: 0,
      runoffHammerPct: 0,
      turnoutRetentionPct: 0,
      norrisRunoffCountyWins: 0,
      hammerRunoffCountyWins: 0,
      _pN: 0,
      _pH: 0,
      _pHar: 0,
      _rN: 0,
      _rH: 0,
      _pt: 0,
      _rt: 0,
    } as GopRegionAnalysisRow & {
      _pN: number;
      _pH: number;
      _pHar: number;
      _rN: number;
      _rH: number;
      _pt: number;
      _rt: number;
    };

    const b = existing as GopRegionAnalysisRow & {
      _pN: number;
      _pH: number;
      _pHar: number;
      _rN: number;
      _rH: number;
      _pt: number;
      _rt: number;
    };
    b.countyCount++;
    b._pN += row.primary.norrisVotes;
    b._pH += row.primary.hammerVotes;
    b._pHar += row.primary.harrisonVotes;
    b._rN += row.runoff.norrisVotes;
    b._rH += row.runoff.hammerVotes;
    b._pt += row.primary.totalVotes;
    b._rt += row.runoff.totalVotes;
    if (row.runoff.winner === "norris") b.norrisRunoffCountyWins++;
    if (row.runoff.winner === "hammer") b.hammerRunoffCountyWins++;
    regionBuckets.set(id, b);
  }

  const regions: GopRegionAnalysisRow[] = [...regionBuckets.values()]
    .map((raw) => {
      const b = raw as GopRegionAnalysisRow & {
        _pN: number;
        _pH: number;
        _pHar: number;
        _rN: number;
        _rH: number;
        _pt: number;
        _rt: number;
      };
      return {
        regionId: b.regionId,
        regionLabel: b.regionLabel,
        countyCount: b.countyCount,
        primaryNorrisPct: pct(b._pN, b._pt),
        primaryHammerPct: pct(b._pH, b._pt),
        primaryHarrisonPct: pct(b._pHar, b._pt),
        runoffNorrisPct: pct(b._rN, b._rt),
        runoffHammerPct: pct(b._rH, b._rt),
        turnoutRetentionPct: pct(b._rt, b._pt),
        norrisRunoffCountyWins: b.norrisRunoffCountyWins,
        hammerRunoffCountyWins: b.hammerRunoffCountyWins,
      };
    })
    .sort((a, b) => b.runoffNorrisPct - a.runoffNorrisPct);

  const flipCounties = counties
    .filter((c) => c.analysis.primaryToRunoffFlip)
    .map(toFlipRow)
    .sort((a, b) => a.runoffMarginPct - b.runoffMarginPct);

  const turnoutDropLeaders: GopTurnoutDropRow[] = counties
    .map((c) => ({
      county: c.county,
      countySlug: c.countySlug,
      primaryVotes: c.primary.totalVotes,
      runoffVotes: c.runoff.totalVotes,
      retentionPct: pct(c.runoff.totalVotes, c.primary.totalVotes),
      runoffWinner: c.runoff.winner,
    }))
    .sort((a, b) => a.retentionPct - b.retentionPct)
    .slice(0, 12);

  const topNorrisRunoffCounties = counties
    .filter((c) => c.runoff.winner === "norris")
    .sort((a, b) => b.runoff.norrisPct - a.runoff.norrisPct)
    .slice(0, 12)
    .map(toFlipRow);

  const hammerBaseCounties = counties
    .filter((c) => c.analysis.hammerWonBoth)
    .sort((a, b) => b.runoff.hammerPct - a.runoff.hammerPct)
    .map(toFlipRow);

  const precinctDensityLeaders: GopPrecinctReportingRow[] = counties
    .map((c) => {
      const totalPrecincts = precinctByFips.get(c.fips) ?? 0;
      return {
        county: c.county,
        countySlug: c.countySlug,
        totalPrecincts,
        runoffVotes: c.runoff.totalVotes,
        runoffNorrisPct: c.runoff.norrisPct,
        runoffHammerPct: c.runoff.hammerPct,
        votesPerPrecinct: totalPrecincts > 0 ? Math.round(c.runoff.totalVotes / totalPrecincts) : 0,
      };
    })
    .filter((r) => r.totalPrecincts > 0)
    .sort((a, b) => b.totalPrecincts - a.totalPrecincts)
    .slice(0, 10);

  const coalitionMath = {
    norrisPrimaryNorrisRunoff: counties.filter(
      (c) => c.primary.winner === "norris" && c.runoff.winner === "norris",
    ).length,
    norrisPrimaryHammerRunoff: counties.filter(
      (c) => c.primary.winner === "norris" && c.runoff.winner === "hammer",
    ).length,
    hammerPrimaryHammerRunoff: counties.filter(
      (c) => c.primary.winner === "hammer" && c.runoff.winner === "hammer",
    ).length,
    hammerPrimaryNorrisRunoff: counties.filter(
      (c) => c.primary.winner === "hammer" && c.runoff.winner === "norris",
    ).length,
    harrisonPrimaryNorrisRunoff: counties.filter(
      (c) => c.primary.winner === "harrison" && c.runoff.winner === "norris",
    ).length,
    harrisonPrimaryHammerRunoff: counties.filter(
      (c) => c.primary.winner === "harrison" && c.runoff.winner === "hammer",
    ).length,
    hammerStrongholds: counties.filter((c) => c.analysis.hammerWonBoth).length,
    closeHammerWins: counties.filter((c) => c.runoff.winner === "hammer" && c.runoff.marginPct <= 3).length,
    closeNorrisWins: counties.filter((c) => c.runoff.winner === "norris" && c.runoff.marginPct <= 3).length,
    highOpportunityCounties: counties.filter((c) => c.analysis.opportunityTier === "high").length,
  };

  const kellyExecutiveOneLiner = `Hammer won the GOP nomination by ${statewide.runoff.marginVotes.toLocaleString()} votes (${statewide.runoff.marginPct.toFixed(1)}%) — but Norris carried ${statewide.runoff.norrisCountiesWon} of 75 counties. Kelly's path is geographic: service-first persuasion where Hammer barely consolidated, not a statewide GOP pile-on.`;

  const executiveSummary = [
    `Three-way primary (266,439 votes): Norris ${statewide.primary.norrisPct.toFixed(1)}% · Hammer ${statewide.primary.hammerPct.toFixed(1)}% · Harrison ${statewide.primary.harrisonPct.toFixed(1)}% — effectively a dead heat.`,
    `Runoff turnout collapsed to ${retentionPct.toFixed(1)}% of primary (${statewide.runoff.totalVotes.toLocaleString()} votes). Hammer ${statewide.runoff.hammerPct.toFixed(1)}% · Norris ${statewide.runoff.norrisPct.toFixed(1)}% — a ${statewide.runoff.marginVotes.toLocaleString()}-vote statewide margin.`,
    `County map inverted: Norris won ${statewide.runoff.norrisCountiesWon} counties vs Hammer ${statewide.runoff.hammerCountiesWon} — Hammer's win is metro consolidation + turnout, not broad geographic dominance.`,
    `${coalitionMath.highOpportunityCounties} counties flagged high-opportunity for Kelly field and contrast messaging; ${coalitionMath.closeHammerWins} Hammer runoff wins were within 3 points.`,
  ];

  const theStory = [
    "The March 2026 Republican SOS race was two elections in one narrative. In the preferential primary, no candidate broke 35% — Norris, Hammer, and Harrison each claimed a third of a restless GOP base looking for an outsider Secretary of State.",
    "The runoff told a different story: turnout fell by roughly seven in ten primary voters statewide. Who returned favored Hammer's Capitol election-integrity brand — enough for a 913-vote statewide win — but the geography of that win is narrow and fragile.",
    "Norris won more counties (38–37) because his coalition held in rural and north Arkansas while Harrison's vote splintered. Hammer consolidated Harrison voters in Northwest and Central suburbs (Washington, Saline) but barely held Benton (51.1%) and lost Pulaski outright.",
    "Fifteen counties that Harrison carried in March went Hammer in the runoff; ten went Norris — proof the 'reform outsider' lane did not automatically follow Hammer. Kelly enters as the only candidate still speaking to direct democracy, clerk partnership, and transparent administration without a GOP purity test.",
  ];

  const patterns = [
    {
      title: "Geography beats statewide margin",
      body: `Norris counties cluster in Northeast (${regions.find((r) => r.regionId === "northeast")?.runoffNorrisPct.toFixed(1)}% Norris runoff), North Central (${regions.find((r) => r.regionId === "north_central")?.runoffNorrisPct.toFixed(1)}%), and West Central (${regions.find((r) => r.regionId === "west_central")?.runoffNorrisPct.toFixed(1)}%). Hammer's best regions: Central (${regions.find((r) => r.regionId === "central")?.runoffHammerPct.toFixed(1)}% Hammer) and South (${regions.find((r) => r.regionId === "south")?.runoffHammerPct.toFixed(1)}%).`,
    },
    {
      title: "Primary-to-runoff flips are persuasion targets",
      body: `${flipCounties.length} counties flipped winner between primary and runoff — including Faulkner (Hammer primary → Norris runoff by 15 pts) and Pope (Norris primary → Hammer runoff). These are counties where the GOP base was still choosing, not locked in.`,
    },
    {
      title: "Turnout collapse defines the electorate",
      body: `Average county retained only ~28% of primary GOP voters in the runoff. Southeast and Northeast retained under 18%. The November electorate will look more like the primary (266k) than the runoff (81k) — Kelly competes for the voters who sat out the runoff.`,
    },
    {
      title: "Harrison voters split — not a monolith",
      body: `Of 25 Harrison-primary counties, ${coalitionMath.harrisonPrimaryHammerRunoff} went Hammer in runoff and ${coalitionMath.harrisonPrimaryNorrisRunoff} went Norris. Harrison's reform lane did not automatically convert to Hammer — especially where Norris already led on outsider credentials.`,
    },
    {
      title: "Hammer strongholds are identifiable — and limited",
      body: `Only ${coalitionMath.hammerStrongholds} counties show Hammer winning both primary and runoff with comfortable margins (e.g., Saline 64.9% runoff). ${coalitionMath.closeHammerWins} Hammer wins were nail-biters under 3 points — paper-ballot mandates did not produce decisive mandates.`,
    },
    {
      title: "Precinct reporting vs precinct splits",
      body: `${totalPrecinctsReporting.toLocaleString()} precincts reported statewide in the runoff, but Arkansas SOS public exports aggregate at county FIPS — not precinct vote splits. Field targeting uses county opportunity tiers + voter-file precinct overlays; high-precinct counties (Pulaski 468, Benton 468) are where micro-targeting investment pays off once precinct exports are ingested.`,
    },
  ];

  const campaignUtilization = [
    {
      title: "Field & travel",
      bullets: [
        "Prioritize high-opportunity counties on the Norris coalition map — especially runoff flips (Faulkner, Pope, White, Scott) and Norris wins under 3 pts (Pulaski, Benton).",
        "Pair county playbook stops with clerk meetings — Hammer weakness is implementation, not slogans.",
        "In Hammer strongholds (Saline, Garland): service frame only; do not attack GOP voters.",
      ],
    },
    {
      title: "Messaging & contrast",
      bullets: [
        "Lead with direct democracy + clerk partnership where Norris/Harrison voters overlap Kelly's lane.",
        "Use county-specific runoff margins in local press — 'Hammer won statewide by 913 votes; Norris carried this county.'",
        "Avoid unsourced character attacks; use verified election-administration contrast only.",
      ],
    },
    {
      title: "Debate & media",
      bullets: [
        "When Hammer cites 'Republican voters chose me' — pivot to geography: 38 counties chose Norris, turnout was 30% of primary.",
        "Pulaski and Sebastian are proof integrity-ranking rhetoric did not hold in urban/exurban GOP — clerk-centered Kelly lines land.",
        "Staff: pull county cards from this module before local debate prep or LTE placement.",
      ],
    },
    {
      title: "Coalition & turnout",
      bullets: [
        "November electorate resembles primary scale more than runoff — target voters who skipped March 31.",
        "Norris endorsement / alignment conversations: emphasize Kelly is the outsider SOS operator Norris voters wanted.",
        "Cross-link county GOP panels on city/county briefs for traveling Kelly and surrogates.",
      ],
    },
  ];

  const dataLimitations = [
    "Vote totals: Arkansas SOS preferential primary JSON + Election Night Reporting API (official March 2026 GOP SOS runoff).",
    "Geography: 75 county FIPS aggregates — not precinct-level vote splits in current public export.",
    "Precinct counts per county are from runoff reporting metadata (2,863 precincts statewide); precinct-level pattern analysis requires future precinct export or voter-file overlay.",
    "Messaging frames in county cards are campaign analysis — not opponent character claims. Claims gate applies to all stage use.",
  ];

  return {
    builtAt,
    kellyExecutiveOneLiner,
    executiveSummary,
    theStory,
    patterns,
    campaignUtilization,
    dataLimitations,
    statewide: {
      primaryTotal: statewide.primary.totalVotes,
      runoffTotal: statewide.runoff.totalVotes,
      turnoutRetentionPct: retentionPct,
      primaryNorrisPct: statewide.primary.norrisPct,
      primaryHammerPct: statewide.primary.hammerPct,
      primaryHarrisonPct: statewide.primary.harrisonPct,
      runoffNorrisPct: statewide.runoff.norrisPct,
      runoffHammerPct: statewide.runoff.hammerPct,
      runoffMarginVotes: statewide.runoff.marginVotes,
      runoffMarginPct: statewide.runoff.marginPct,
      norrisRunoffCounties: statewide.runoff.norrisCountiesWon,
      hammerRunoffCounties: statewide.runoff.hammerCountiesWon,
      totalPrecinctsReporting,
    },
    coalitionMath,
    regions,
    flipCounties,
    turnoutDropLeaders,
    topNorrisRunoffCounties,
    hammerBaseCounties,
    precinctDensityLeaders,
    sourcesNote: sources.evidenceNote,
  };
}

export function loadGopSos2026PrimaryElectionAnalysis(): GopSos2026PrimaryElectionAnalysis | null {
  if (cached) return cached;
  cached = buildGopSos2026PrimaryElectionAnalysis();
  return cached;
}
