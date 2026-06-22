/**
 * Build `data/election/2026-gop-sos-primary-runoff-by-county.normalized.json`
 *
 * Primary: Arkansas SOS `2026_Preferential_Primary.json` (Locations/FIPS).
 * Runoff: Arkansas Election Night Reporting API (official SOS vendor export).
 *
 * Usage (from RedDirt/):
 *   node scripts/run-with-h-drive-env.cjs npx tsx scripts/election-targets/build-2026-gop-sos-primary-runoff.ts
 *
 * Optional env:
 *   SOS_ELECTION_JSON_DIR — folder with 2026_Preferential_Primary.json
 *   SKIP_RUNOFF_FETCH=1 — use cached runoff in data/election/2026-gop-sos-runoff-api-cache.json
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import type {
  GopSos2026CountyRow,
  GopSos2026ResultsBundle,
} from "../../src/lib/election-plan/gop-sos-2026-results-types";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data/election");
const OUT_FILE = path.join(OUT_DIR, "2026-gop-sos-primary-runoff-by-county.normalized.json");
const RUNOFF_CACHE = path.join(OUT_DIR, "2026-gop-sos-runoff-api-cache.json");
const DEFAULT_SOS_DIR = "H:\\SOSWebsite\\campaign information for ingestion\\electionResults";

const PRIMARY_CONTEST_ID = "fea979cc-6800-498d-a424-a4d73ad3fc24";
const RUNOFF_CONTEST_ID = "1f5c45de-d1b5-4acb-a853-b72b5f695363";
const RUNOFF_ELECTION_ID = "b412bdef-f97a-45bc-b3ec-6761d28caf9e";

const PRIMARY_CHOICES = {
  norris: "4a9d96b7-5528-49f4-ba4b-c0c4ea613477",
  hammer: "34f226bd-abd3-465a-822f-7f58b0269343",
  harrison: "1ea97837-94c7-4d65-a08b-515314625666",
} as const;

const RUNOFF_CHOICES = {
  norris: "2240597e-d52e-4fd2-8dbe-589004342b94",
  hammer: "955a8e10-888e-4ae9-b740-bf370150cc9c",
} as const;

type PreferentialChoice = {
  ChoiceID?: string;
  choiceID?: string;
  TotalVotes?: number;
  totalVotes?: number;
  VotePercent?: number;
  votePercent?: number;
};

type PreferentialLocation = {
  TotalVotes?: number;
  totalVotes?: number;
  Choices?: PreferentialChoice[];
  choices?: PreferentialChoice[];
};

type PreferentialContest = {
  ContestID?: string;
  contestID?: string;
  TotalVotes?: number;
  Choices?: PreferentialChoice[];
  Locations?: Record<string, PreferentialLocation>;
};

type PreferentialJson = {
  ElectionData?: { ElectionID?: string; IsOfficial?: boolean };
  ContestData?: PreferentialContest[];
};

type RunoffApiResponse = {
  response?: {
    contests?: Record<
      string,
      {
        totalVotes?: number;
        choices?: Array<{ choiceID: string; totalVotes: number; votePercent: number }>;
        locations?: Record<
          string,
          {
            totalVotes: number;
            choices: Array<{ choiceID: string; totalVotes: number; votePercent: number }>;
          }
        >;
      }
    >;
  };
  isOfficial?: boolean;
};

function shortCountyName(displayName: string): string {
  return displayName.replace(/\s+County$/i, "").trim();
}

function choiceVotes(choices: PreferentialChoice[] | undefined, id: string): number {
  for (const c of choices ?? []) {
    const cid = c.ChoiceID ?? c.choiceID;
    if (cid === id) return c.TotalVotes ?? c.totalVotes ?? 0;
  }
  return 0;
}

function pct(n: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((n / total) * 1000) / 10;
}

function winnerLabel(
  votes: Record<"norris" | "hammer" | "harrison", number>,
  total: number,
): "norris" | "hammer" | "harrison" | "tie" {
  const entries = (Object.entries(votes) as Array<[keyof typeof votes, number]>).sort((a, b) => b[1] - a[1]);
  if (entries.length < 2 || entries[0][1] === entries[1][1]) return "tie";
  return entries[0][0];
}

function runoffWinner(norris: number, hammer: number): "norris" | "hammer" | "tie" {
  if (norris === hammer) return "tie";
  return norris > hammer ? "norris" : "hammer";
}

function buildKellyBrief(row: {
  primaryWinner: string;
  runoffWinner: string;
  runoffMarginPct: number;
  norrisRunoffPct: number;
  hammerRunoffPct: number;
}): { headline: string; coalitionFrame: string; hammerWeakness: string; opportunityTier: "high" | "medium" | "watch" } {
  const norrisWonRunoff = row.runoffWinner === "norris";
  const close = row.runoffMarginPct <= 3;
  const hammerUnder51 = row.hammerRunoffPct < 51;

  let opportunityTier: "high" | "medium" | "watch" = "watch";
  if (norrisWonRunoff || (close && hammerUnder51)) opportunityTier = "high";
  else if (close || row.norrisRunoffPct >= 45) opportunityTier = "medium";

  const headline = norrisWonRunoff
    ? `Norris carried the GOP runoff here (${row.norrisRunoffPct}% · Hammer ${row.hammerRunoffPct}%)`
    : close
      ? `Hammer barely held the runoff (${row.hammerRunoffPct}% · margin ${row.runoffMarginPct} pts)`
      : `Hammer won the runoff (${row.hammerRunoffPct}% · Norris ${row.norrisRunoffPct}%)`;

  const coalitionFrame =
    "Norris voters split on establishment vs outsider — many align with Kelly on direct democracy and transparent SOS service, and push back on Hammer's paper-ballot mandates framed as voter suppression.";

  let hammerWeakness: string;
  if (norrisWonRunoff) {
    hammerWeakness =
      "Hammer lost the Republican runoff countywide — integrity-ranking rhetoric did not hold the coalition here.";
  } else if (close) {
    hammerWeakness =
      "Hammer's runoff margin is thin — paper-ballot / election-integrity framing did not produce a decisive win.";
  } else if (row.primaryWinner === "norris" && row.runoffWinner === "hammer") {
    hammerWeakness =
      "Norris led the March primary here; Hammer flipped it in the runoff with establishment turnout — persuadable GOP base remains.";
  } else {
    hammerWeakness =
      "Hammer base county — lead with clerk-service and transparency; avoid attacking rural GOP voters.";
  }

  return { headline, coalitionFrame, hammerWeakness, opportunityTier };
}

async function fetchRunoffContest(): Promise<NonNullable<RunoffApiResponse["response"]>["contests"]> {
  if (process.env.SKIP_RUNOFF_FETCH === "1" && existsSync(RUNOFF_CACHE)) {
    const cached = JSON.parse(readFileSync(RUNOFF_CACHE, "utf8")) as RunoffApiResponse;
    const contest = cached.response?.contests?.[RUNOFF_CONTEST_ID];
    if (contest?.locations) return cached.response!.contests!;
  }

  const url = `https://enr-results-api.totalresults.com/Contest/GetContestResults?cId=arkansas&electionID=${RUNOFF_ELECTION_ID}&contestType=Statewide`;
  const res = await fetch(url, {
    headers: { "User-Agent": "RedDirt-election-plan-builder/1.0 (Kelly SOS campaign)" },
  });
  if (!res.ok) {
    throw new Error(`Runoff fetch failed: HTTP ${res.status}`);
  }
  const json = (await res.json()) as RunoffApiResponse;
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(RUNOFF_CACHE, JSON.stringify(json, null, 2));
  const contest = json.response?.contests?.[RUNOFF_CONTEST_ID];
  if (!contest?.locations) {
    throw new Error("Runoff SOS contest missing location results");
  }
  return json.response!.contests!;
}

function readPrimaryContest(): PreferentialContest {
  const sosDir = process.env.SOS_ELECTION_JSON_DIR ?? DEFAULT_SOS_DIR;
  const primaryPath = path.join(sosDir, "2026_Preferential_Primary.json");
  if (!existsSync(primaryPath)) {
    throw new Error(`Primary JSON not found: ${primaryPath}`);
  }
  const json = JSON.parse(readFileSync(primaryPath, "utf8")) as PreferentialJson;
  const contest = json.ContestData?.find((c) => (c.ContestID ?? c.contestID) === PRIMARY_CONTEST_ID);
  if (!contest?.Locations) {
    throw new Error(`Primary SOS contest ${PRIMARY_CONTEST_ID} not found`);
  }
  return contest;
}

async function main() {
  const primaryContest = readPrimaryContest();
  const runoffContests = await fetchRunoffContest();
  const runoffContest = runoffContests?.[RUNOFF_CONTEST_ID];
  if (!runoffContest?.locations) {
    throw new Error("Runoff contest data incomplete");
  }

  const counties: GopSos2026CountyRow[] = [];
  const missingRunoff: string[] = [];
  const missingPrimary: string[] = [];

  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    const fips = reg.fips;
    const primaryLoc = primaryContest.Locations![fips];
    const runoffLoc = runoffContest.locations[fips];

    if (!primaryLoc) missingPrimary.push(county);
    if (!runoffLoc) missingRunoff.push(county);

    const pNorris = choiceVotes(primaryLoc?.Choices ?? primaryLoc?.choices, PRIMARY_CHOICES.norris);
    const pHammer = choiceVotes(primaryLoc?.Choices ?? primaryLoc?.choices, PRIMARY_CHOICES.hammer);
    const pHarrison = choiceVotes(primaryLoc?.Choices ?? primaryLoc?.choices, PRIMARY_CHOICES.harrison);
    const pTotal = primaryLoc?.TotalVotes ?? primaryLoc?.totalVotes ?? pNorris + pHammer + pHarrison;

    const rNorris = choiceVotes(runoffLoc?.choices, RUNOFF_CHOICES.norris);
    const rHammer = choiceVotes(runoffLoc?.choices, RUNOFF_CHOICES.hammer);
    const rTotal = runoffLoc?.totalVotes ?? rNorris + rHammer;

    const primaryWin = winnerLabel({ norris: pNorris, hammer: pHammer, harrison: pHarrison }, pTotal);
    const runoffWin = runoffWinner(rNorris, rHammer);
    const runoffMarginVotes = Math.abs(rHammer - rNorris);
    const runoffMarginPct = pct(runoffMarginVotes, rTotal);
    const norrisRunoffPct = pct(rNorris, rTotal);
    const hammerRunoffPct = pct(rHammer, rTotal);

    const brief = buildKellyBrief({
      primaryWinner: primaryWin,
      runoffWinner: runoffWin,
      runoffMarginPct,
      norrisRunoffPct,
      hammerRunoffPct,
    });

    counties.push({
      county,
      countySlug: reg.slug,
      fips,
      regionId: reg.regionId,
      primary: {
        totalVotes: pTotal,
        norrisVotes: pNorris,
        hammerVotes: pHammer,
        harrisonVotes: pHarrison,
        norrisPct: pct(pNorris, pTotal),
        hammerPct: pct(pHammer, pTotal),
        harrisonPct: pct(pHarrison, pTotal),
        winner: primaryWin,
      },
      runoff: {
        totalVotes: rTotal,
        norrisVotes: rNorris,
        hammerVotes: rHammer,
        norrisPct: norrisRunoffPct,
        hammerPct: hammerRunoffPct,
        marginVotes: runoffMarginVotes,
        marginPct: runoffMarginPct,
        winner: runoffWin,
      },
      analysis: {
        ...brief,
        norrisWonPrimary: primaryWin === "norris",
        norrisWonRunoff: runoffWin === "norris",
        hammerWonBoth: primaryWin === "hammer" && runoffWin === "hammer",
        primaryToRunoffFlip:
          (primaryWin === "norris" && runoffWin === "hammer") ||
          (primaryWin === "hammer" && runoffWin === "norris"),
      },
    });
  }

  const statewidePrimary = counties.reduce(
    (acc, c) => ({
      norris: acc.norris + c.primary.norrisVotes,
      hammer: acc.hammer + c.primary.hammerVotes,
      harrison: acc.harrison + c.primary.harrisonVotes,
      total: acc.total + c.primary.totalVotes,
    }),
    { norris: 0, hammer: 0, harrison: 0, total: 0 },
  );

  const statewideRunoff = counties.reduce(
    (acc, c) => ({
      norris: acc.norris + c.runoff.norrisVotes,
      hammer: acc.hammer + c.runoff.hammerVotes,
      total: acc.total + c.runoff.totalVotes,
    }),
    { norris: 0, hammer: 0, total: 0 },
  );

  const bundle: GopSos2026ResultsBundle = {
    schemaVersion: "2026-gop-sos-v1",
    builtAt: new Date().toISOString(),
    sources: {
      primaryFile: "2026_Preferential_Primary.json",
      primaryContestId: PRIMARY_CONTEST_ID,
      runoffApi: "https://enr-results-api.totalresults.com/Contest/GetContestResults",
      runoffElectionId: RUNOFF_ELECTION_ID,
      runoffContestId: RUNOFF_CONTEST_ID,
      evidenceNote:
        "County vote totals from Arkansas SOS preferential primary JSON and Election Night Reporting API (March 2026 GOP SOS runoff). Messaging frames are campaign analysis — not opponent character claims.",
    },
    statewide: {
      primary: {
        totalVotes: statewidePrimary.total,
        norrisVotes: statewidePrimary.norris,
        hammerVotes: statewidePrimary.hammer,
        harrisonVotes: statewidePrimary.harrison,
        norrisPct: pct(statewidePrimary.norris, statewidePrimary.total),
        hammerPct: pct(statewidePrimary.hammer, statewidePrimary.total),
        harrisonPct: pct(statewidePrimary.harrison, statewidePrimary.total),
        winner: winnerLabel(
          { norris: statewidePrimary.norris, hammer: statewidePrimary.hammer, harrison: statewidePrimary.harrison },
          statewidePrimary.total,
        ),
        norrisCountiesWon: counties.filter((c) => c.primary.winner === "norris").length,
        hammerCountiesWon: counties.filter((c) => c.primary.winner === "hammer").length,
        harrisonCountiesWon: counties.filter((c) => c.primary.winner === "harrison").length,
      },
      runoff: {
        totalVotes: statewideRunoff.total,
        norrisVotes: statewideRunoff.norris,
        hammerVotes: statewideRunoff.hammer,
        norrisPct: pct(statewideRunoff.norris, statewideRunoff.total),
        hammerPct: pct(statewideRunoff.hammer, statewideRunoff.total),
        marginVotes: Math.abs(statewideRunoff.hammer - statewideRunoff.norris),
        marginPct: pct(Math.abs(statewideRunoff.hammer - statewideRunoff.norris), statewideRunoff.total),
        winner: runoffWinner(statewideRunoff.norris, statewideRunoff.hammer),
        norrisCountiesWon: counties.filter((c) => c.runoff.winner === "norris").length,
        hammerCountiesWon: counties.filter((c) => c.runoff.winner === "hammer").length,
      },
    },
    counties,
    validation: {
      countyCount: counties.length,
      missingPrimaryCounties: missingPrimary,
      missingRunoffCounties: missingRunoff,
    },
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(bundle, null, 2));

  console.log(`Wrote ${OUT_FILE}`);
  console.log(
    `Counties: ${counties.length} · Norris runoff wins: ${bundle.statewide.runoff.norrisCountiesWon} · Hammer: ${bundle.statewide.runoff.hammerCountiesWon}`,
  );
  if (missingPrimary.length || missingRunoff.length) {
    console.warn("Missing:", { missingPrimary, missingRunoff });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
