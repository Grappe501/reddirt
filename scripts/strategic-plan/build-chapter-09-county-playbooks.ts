/**
 * Phase 4 — Auto-populate Chapter 9 county playbooks from Ch 4, 5, 7, opportunity + VCI.
 *
 * Usage: npm run strategic-plan:chapter-09:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import { ARKANSAS_TOP_75_CITIES } from "./data/arkansas-top-40-cities";
import { clusterForCounty } from "./data/opportunity-clusters";
import {
  computeVictoryContributionIndex,
  deriveCountyMission,
  powerOf5Goal,
  vciTier,
  volunteerTarget,
} from "./lib/county-mission-logic";
import {
  fmt,
  loadDropOffSummary,
  loadElectionHistory,
  loadWinTargets,
  readJson,
  registrationPace,
  resolveRegistrationGoals,
  shortCountyName,
  PLAN_ROOT,
} from "./lib/strategic-plan-shared";

const OUT_DIR = path.join(PLAN_ROOT, "part-iii-arkansas-battlefield/chapter-09-seventy-five-county-playbook");
const SUMMARY_PATH = path.join(OUT_DIR, "statewide-playbook-summary.json");
const VCI_PATH = path.join(PLAN_ROOT, "command-center/victory-contribution-index.json");

type OpportunityRow = {
  county: string;
  slug: string;
  tier: "A" | "B" | "C" | "D";
  rank: number;
  dropOffRecovery50: number;
  registrationGoal: number;
  republicanConversionPotential: number;
  opportunityScore: number;
  hopeIndex: number;
};

type FairRow = { county: string; fairName: string; campaignValue?: string; routeCluster?: string };

type CitySummaryRow = {
  name: string;
  county: string;
  targetVotes: number;
  influenceCategory: string;
};

function loadOpportunity(): Map<string, OpportunityRow> {
  const p = path.join(PLAN_ROOT, "part-ii-electoral-math/opportunity-scorecard/statewide-opportunity-scorecard.json");
  const data = readJson<{ counties: OpportunityRow[] }>(p);
  if (!data) throw new Error("Run strategic-plan:opportunity:build first.");
  return new Map(data.counties.map((c) => [c.county, c]));
}

function loadCitySummary(): CitySummaryRow[] {
  const p = path.join(
    PLAN_ROOT,
    "part-iii-arkansas-battlefield/chapter-07-top-40-city-strategy/top-40-city-summary.json",
  );
  return readJson<{ cities: CitySummaryRow[] }>(p)?.cities ?? [];
}

function loadFairs(): Map<string, FairRow> {
  const p = path.join(process.cwd(), "data/calendar-command-center/arkansas-county-fairs-2026.normalized.json");
  const data = readJson<{ rows: FairRow[] }>(p);
  return new Map((data?.rows ?? []).map((r) => [r.county, r]));
}

function buildPlaybook(params: {
  county: string;
  slug: string;
  fips: string;
  pres2024D: number;
  mid2022D: number;
  dropOff: number;
  recovery25: number;
  recovery50: number;
  recovery75: number;
  hopeIndex: number;
  hopeTier: string;
  regGoal: number;
  regGap: number;
  weeklyReg: number;
  dailyReg: number;
  opp: OpportunityRow;
  mission: ReturnType<typeof deriveCountyMission>;
  vci: number;
  vciRank: number;
  vciPriority: string;
  cities: CitySummaryRow[];
  fair?: FairRow;
  clusterName: string;
  winTarget: number;
  voteGain: number;
  po5: number;
  volunteers: number;
}): string {
  const cityLines =
    params.cities.length > 0
      ? params.cities
          .map((c) => `- **${c.name}** — ${fmt(c.targetVotes)} target votes · ${c.influenceCategory}`)
          .join("\n")
      : "- No Top 75 priority city — county-seat and community event focus";

  return `# ${params.county} County — Campaign Playbook

> **Status:** Generated — operational county mission
> **Document:** Arkansas Plurality Victory Plan
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT
> **Part:** III — The Arkansas Battlefield
> **Chapter:** 9
> **County:** ${params.county}
> **FIPS:** ${params.fips}
> **Opportunity Tier:** ${params.opp.tier} (rank #${params.opp.rank})
> **VCI Rank:** #${params.vciRank} of 75 · ${params.vciPriority}

---

## County mission

**Role:** ${params.mission.role}

| Priority | Mission |
| -------- | ------- |
| **Primary** | ${params.mission.primaryMission} |
| **Secondary** | ${params.mission.secondaryMission} |
| **Tertiary** | ${params.mission.tertiaryMission} |

**Deployment cluster:** ${params.clusterName}

---

## Electoral section

| Metric | Value |
| ------ | ----: |
| 2024 Presidential D | ${fmt(params.pres2024D)} |
| 2022 Midterm SOS D | ${fmt(params.mid2022D)} |
| Drop-off | **${fmt(params.dropOff)}** |
| Recovery @ 25% | ${fmt(params.recovery25)} |
| Recovery @ 50% | **${fmt(params.recovery50)}** |
| Recovery @ 75% | ${fmt(params.recovery75)} |
| Hope Index | ${params.hopeIndex}/100 (${params.hopeTier}) |
| Win-target votes (county) | ${fmt(params.winTarget)} |
| Vote gain needed | ${fmt(params.voteGain)} |

*Detail: [Chapter 4 drop-off](../../part-ii-electoral-math/chapter-04-democratic-drop-off/counties/${params.slug}.md)*

---

## Registration section

| Metric | Value |
| ------ | ----: |
| Registration goal | **${fmt(params.regGoal)}** |
| Gap remaining | ${fmt(params.regGap)} |
| Weekly pace (20 wk) | **${fmt(params.weeklyReg)}** / week |
| Daily pace | **${fmt(params.dailyReg)}** / day |

*Detail: [Chapter 5 registration dashboard](../../part-ii-electoral-math/chapter-05-fifty-thousand-new-voter-plan/counties/${params.slug}.md)*

---

## Opportunity section

| Metric | Value |
| ------ | ----: |
| Opportunity tier | **${params.opp.tier}** |
| Statewide opportunity rank | **#${params.opp.rank}** |
| Opportunity score | ${fmt(params.opp.opportunityScore)} |
| Victory Contribution Index (VCI) | **${fmt(params.vci)}** |
| Lane 2 @ 50% | ${fmt(params.opp.dropOffRecovery50)} |
| Registration goal | ${fmt(params.opp.registrationGoal)} |
| Lane 4 peel potential (12%) | ${fmt(params.opp.republicanConversionPotential)} |

---

## Cities in county (Top 75 priority)

${cityLines}

---

## Field operations targets

| Field | Target |
| ----- | -----: |
| Power of 5 conversations | **${fmt(params.po5)}** |
| Volunteer target | **${fmt(params.volunteers)}** |
| Campaign visits (planning) | TBD |
| County fair | ${params.fair?.fairName ?? "See event intelligence layer"} |

${params.fair ? `Fair notes: ${params.fair.campaignValue ?? "monitor"} · route cluster: ${params.fair.routeCluster ?? "TBD"}` : ""}

---

## Faith · business · clerk hooks

| Channel | Status |
| ------- | ------ |
| Faith outreach | TBD — see [event intelligence](../../../event-intelligence/README.md) |
| Chamber / Rotary / civic | TBD |
| County clerk engagement | **Priority** (SOS race) |
| Community organizations | TBD |

---

## Regenerate

\`npm run strategic-plan:chapter-09:build\`
`;
}

async function main() {
  const dropOff = loadDropOffSummary();
  const history = loadElectionHistory();
  const win = loadWinTargets();
  const { goals } = await resolveRegistrationGoals(dropOff);
  const opportunity = loadOpportunity();
  const citySummary = loadCitySummary();
  const fairs = loadFairs();

  const citiesByCounty = new Map<string, CitySummaryRow[]>();
  for (const c of citySummary) {
    const list = citiesByCounty.get(c.county) ?? [];
    list.push(c);
    citiesByCounty.set(c.county, list);
  }

  const cityVotesByCounty = new Map<string, number>();
  for (const city of ARKANSAS_TOP_75_CITIES) {
    const row = citySummary.find((s) => s.name === city.name);
    const votes = row?.targetVotes ?? 0;
    cityVotesByCounty.set(city.county, (cityVotesByCounty.get(city.county) ?? 0) + votes);
  }

  const vciRows: Array<{
    county: string;
    slug: string;
    vci: number;
    rank: number;
    priority: string;
    cityInfluenceVotes: number;
    mission: ReturnType<typeof deriveCountyMission>;
  }> = [];

  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    const drop = dropOff.counties.find((c) => c.county === county)!;
    const goal = goals.find((g) => g.county === county)!;
    const opp = opportunity.get(county)!;
    const hist = history.get(county);
    const winRow = win.counties.find((c) => c.county === county);
    const cityInfluenceVotes = cityVotesByCounty.get(county) ?? 0;
    const missionInput = {
      tier: opp.tier,
      hopeIndex: drop.hopeIndex,
      dropOffRecovery50: drop.recovery50,
      registrationGoal: goal.goal,
      republicanConversionPotential: opp.republicanConversionPotential,
      cityInfluenceVotes,
      baselineDemShare: winRow?.baselineDemShare ?? 0,
    };
    const mission = deriveCountyMission(missionInput);
    const vci = computeVictoryContributionIndex({
      ...missionInput,
      cityInfluenceVotes,
    });
    vciRows.push({
      county,
      slug: reg.slug,
      vci,
      rank: 0,
      priority: "",
      cityInfluenceVotes,
      mission,
    });
  }

  vciRows.sort((a, b) => b.vci - a.vci);
  vciRows.forEach((r, i) => {
    r.rank = i + 1;
    r.priority = vciTier(i + 1, 75);
  });

  mkdirSync(path.join(OUT_DIR, "counties"), { recursive: true });
  mkdirSync(path.join(PLAN_ROOT, "command-center"), { recursive: true });

  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    const drop = dropOff.counties.find((c) => c.county === county)!;
    const goal = goals.find((g) => g.county === county)!;
    const opp = opportunity.get(county)!;
    const hist = history.get(county);
    const winRow = win.counties.find((c) => c.county === county);
    const vciRow = vciRows.find((v) => v.county === county)!;
    const pace = registrationPace(goal.goal, goal.gapRemaining);
    const cluster = clusterForCounty(county);

    writeFileSync(
      path.join(OUT_DIR, "counties", `${reg.slug}.md`),
      buildPlaybook({
        county,
        slug: reg.slug,
        fips: reg.fips,
        pres2024D: hist?.presidential2024DemVotes ?? 0,
        mid2022D: hist?.sos2022DemVotes ?? 0,
        dropOff: drop.rawLoss,
        recovery25: Math.round(drop.rawLoss * 0.25),
        recovery50: drop.recovery50,
        recovery75: drop.recovery75,
        hopeIndex: drop.hopeIndex,
        hopeTier: drop.hopeTier,
        regGoal: goal.goal,
        regGap: goal.gapRemaining,
        weeklyReg: pace.weeklyTarget,
        dailyReg: pace.dailyTarget,
        opp,
        mission: vciRow.mission,
        vci: vciRow.vci,
        vciRank: vciRow.rank,
        vciPriority: vciRow.priority,
        cities: citiesByCounty.get(county) ?? [],
        fair: fairs.get(county),
        clusterName: cluster.name,
        winTarget: winRow?.targetVotes ?? 0,
        voteGain: winRow?.targetVoteGain ?? 0,
        po5: powerOf5Goal(drop.recovery50, goal.goal),
        volunteers: volunteerTarget(goal.goal, opp.tier),
      }),
      "utf8",
    );
  }

  writeFileSync(
    VCI_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        formula:
          "VCI = Lane 2 @ 50% + Registration Goal + GOP Conversion @ 12% + City Influence (Top 75 vote targets in county)",
        useCases: [
          "Candidate travel priority",
          "Staff deployment",
          "Volunteer deployment",
          "Direct mail priority",
          "Digital advertising priority",
        ],
        counties: vciRows,
      },
      null,
      2,
    ),
    "utf8",
  );

  writeFileSync(
    SUMMARY_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        top10VCI: vciRows.slice(0, 10),
        tierCounts: {
          A: [...opportunity.values()].filter((o) => o.tier === "A").length,
          B: [...opportunity.values()].filter((o) => o.tier === "B").length,
          C: [...opportunity.values()].filter((o) => o.tier === "C").length,
          D: [...opportunity.values()].filter((o) => o.tier === "D").length,
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(
    `Wrote 75 county playbooks + VCI scorecard. Top VCI: ${vciRows[0].county} (${vciRows[0].vci.toLocaleString()}).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
