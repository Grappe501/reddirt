/**
 * County Coverage Reality Audit — merge historical stops, leadership confirmations, VCI.
 *
 * Usage: npm run campaign-brain:coverage-audit:build
 *
 * Outputs:
 *   docs/campaign-brain/routing/county-coverage-reality-audit.json
 *   docs/campaign-brain/routing/county-coverage-reality-audit.md
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, loadOpportunityCounties, loadVci, vciByCountyMap } from "./lib/inputs";
import {
  allCountyNames,
  coverageBonusPoints,
  coverageNeedScore,
  loadAllCountyVisits,
  parseDate,
  type CountyVisit,
} from "./lib/county-coverage";

const ROUTING = path.join(BRAIN_ROOT, "routing");
const EARLY_VOTING_START = "2026-10-20";

const DELTA_COUNTIES = new Set([
  "Phillips",
  "Desha",
  "Chicot",
  "Monroe",
  "St. Francis",
  "Crittenden",
  "Mississippi",
  "Lee",
  "Drew",
  "Ashley",
  "Lincoln",
  "Jefferson",
]);

const TIER1_REVISIT = new Set([
  "Pulaski",
  "Benton",
  "Washington",
  "Faulkner",
  "Saline",
  "Sebastian",
  "Craighead",
  "Jefferson",
  "Lonoke",
]);

const TIER2_COMPLETION_EXAMPLES = new Set([
  "Calhoun",
  "Dallas",
  "Desha",
  "Monroe",
  "Prairie",
  "Woodruff",
  "Little River",
  "Boone",
  "Madison",
  "Newton",
  "Searcy",
]);

type LeadershipRow = {
  county: string;
  visitCount: number;
  intensity?: string;
};

function loadLeadershipHistory(): LeadershipRow[] {
  const p = path.join(BRAIN_DATA, "county-visit-history-leadership.json");
  if (!existsSync(p)) return [];
  const raw = JSON.parse(readFileSync(p, "utf8")) as { counties?: LeadershipRow[] };
  return raw.counties ?? [];
}

/** Leadership confirms visit count; dates come from system sources only. */
function buildMergedCountyStats(
  systemVisits: CountyVisit[],
  leadership: LeadershipRow[],
): Map<
  string,
  { visitCount: number; lastVisitDate: string | null; daysSince: number | null; leadershipConfirmed: boolean }
> {
  const ref = new Date("2026-06-15T12:00:00.000Z");
  const stats = new Map<
    string,
    { visitCount: number; lastVisitDate: string | null; daysSince: number | null; leadershipConfirmed: boolean }
  >();

  for (const county of allCountyNames()) {
    const system = systemVisits.filter((v) => v.county === county);
    const lead = leadership.find((r) => r.county === county);
    const systemCount = system.length;
    const visitCount = Math.max(systemCount, lead?.visitCount ?? 0);
    const sorted = [...system].sort((a, b) => b.date.localeCompare(a.date));
    const lastVisitDate = sorted[0]?.date ?? null;
    const daysSince = lastVisitDate
      ? Math.floor((ref.getTime() - parseDate(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
      : visitCount > 0
        ? null
        : null;

    stats.set(county, {
      visitCount,
      lastVisitDate,
      daysSince: visitCount === 0 ? null : daysSince,
      leadershipConfirmed: Boolean(lead),
    });
  }

  return stats;
}

function planningCategory(county: string, visitCount: number, daysSince: number | null): string {
  if (visitCount === 0) {
    if (DELTA_COUNTIES.has(county)) return "delta_gap";
    if (TIER2_COMPLETION_EXAMPLES.has(county)) return "completion_tour";
    return "never_visited";
  }
  if (TIER1_REVISIT.has(county) && (daysSince === null || daysSince > 30)) return "tier1_revisit";
  if (visitCount === 1 && daysSince !== null && daysSince > 45) return "completion_touch";
  if (visitCount >= 3) return "maintain_relationship";
  return "revisit";
}

function priorityScore(params: {
  vciRank: number;
  daysSince: number | null;
  visitCount: number;
  county: string;
  opportunityTier: string;
}): number {
  const vciWeight = Math.max(0, 76 - params.vciRank) * 8;
  const coverage = coverageNeedScore(params.daysSince) * 6;
  const bonus = coverageBonusPoints(params.daysSince) * 0.5;
  let score = vciWeight + coverage + bonus;

  if (params.visitCount === 0) score += 25;
  if (DELTA_COUNTIES.has(params.county) && params.visitCount === 0) score += 30;
  if (TIER1_REVISIT.has(params.county) && (params.daysSince ?? 999) > 30) score += 20;
  if (params.opportunityTier === "A") score += 10;
  if (params.opportunityTier === "B") score += 5;

  return Math.round(score);
}

function recommendedAction(category: string, county: string, daysSince: number | null): string {
  switch (category) {
    case "delta_gap":
      return `Delta priority — schedule immersion (West Memphis / Helena / Blytheville corridor targets).`;
    case "tier1_revisit":
      return `Tier 1 VCI — stack coalition + volunteer + story on next regional trip.`;
    case "completion_tour":
      return `County completion — one event, one story, one volunteer, one relationship; move on.`;
    case "never_visited":
      return `No confirmed visit — find highest-scoring stackable trip before ${EARLY_VOTING_START}.`;
    case "completion_touch":
      return `Single visit ${daysSince ?? "?"}d ago — add second touch or stack objectives on return.`;
    case "maintain_relationship":
      return `Relationship capital invested — revisit when calendar stacks 3+ objectives.`;
    default:
      return `Revisit on multi-purpose trip — avoid single-objective long drives.`;
  }
}

function main() {
  mkdirSync(ROUTING, { recursive: true });

  const ref = new Date("2026-06-15T12:00:00.000Z");
  const leadership = loadLeadershipHistory();
  const systemVisits = loadAllCountyVisits(BRAIN_DATA);
  const countyStats = buildMergedCountyStats(systemVisits, leadership);

  const brainOnlyVisited = new Set(systemVisits.map((v) => v.county)).size;

  const vci = loadVci();
  const vciMap = vciByCountyMap(vci);
  const opp = loadOpportunityCounties();
  const oppMap = new Map(opp.map((c) => [c.county, c]));

  const systemOnlyCounties = new Set(systemVisits.map((v) => v.county));
  const leadershipOnly = leadership.filter((r) => !systemOnlyCounties.has(r.county)).map((r) => r.county);

  const rows = allCountyNames().map((county) => {
    const stat = countyStats.get(county)!;
    const v = vciMap.get(county);
    const o = oppMap.get(county);
    const daysSince = stat.daysSince;
    const visitCount = stat.visitCount;
    const category = planningCategory(county, visitCount, daysSince);
    const score = priorityScore({
      vciRank: v?.rank ?? 75,
      daysSince,
      visitCount,
      county,
      opportunityTier: o?.tier ?? "D",
    });

    let coverageStatus: string;
    if (visitCount === 0) coverageStatus = "never_visited";
    else if (daysSince === null) coverageStatus = "visited_date_uncertain";
    else if (daysSince > 60) coverageStatus = "neglected";
    else if (daysSince > 30) coverageStatus = "due";
    else if (daysSince <= 14) coverageStatus = "recent";
    else coverageStatus = "maintain";

    return {
      county,
      vciRank: v?.rank ?? null,
      vci: v?.vci ?? null,
      opportunityTier: o?.tier ?? "D",
      visitCount,
      lastVisitDate: stat.lastVisitDate,
      lastVisitDateKnown: stat.lastVisitDate !== null,
      daysSinceLastVisit: daysSince,
      leadershipConfirmed: stat.leadershipConfirmed,
      coverageStatus,
      planningCategory: category,
      isDeltaCounty: DELTA_COUNTIES.has(county),
      isTier1Revisit: TIER1_REVISIT.has(county),
      priorityScore: score,
      recommendedAction: recommendedAction(category, county, daysSince),
      recommendedBy: EARLY_VOTING_START,
    };
  });

  rows.sort((a, b) => b.priorityScore - a.priorityScore);

  const visited = rows.filter((r) => r.visitCount > 0);
  const neverVisited = rows.filter((r) => r.visitCount === 0);
  const deltaGaps = neverVisited.filter((r) => r.isDeltaCounty);
  const tier1Due = rows.filter((r) => r.isTier1Revisit && (r.daysSinceLastVisit ?? 999) > 30);

  const output = {
    generatedAt: new Date().toISOString(),
    referenceDate: ref.toISOString().slice(0, 10),
    earlyVotingStart: EARLY_VOTING_START,
    doctrine:
      "Complete county coverage while revisiting Tier 1 VCI counties. Fill open days with multi-purpose trips — not single-objective long drives.",
    sources: {
      countyVisitLog: path.join("data/campaign-brain/county-visit-log.json"),
      countyTouchSummary: path.join("data/calendar-command-center/county-touch-summary.json"),
      leadershipHistory: path.join("data/campaign-brain/county-visit-history-leadership.json"),
    },
    reconciliation: {
      brainReportedVisited: 31,
      systemVisitsInTouchSummary: brainOnlyVisited,
      leadershipConfirmedCounties: leadership.length,
      visitedAfterLeadershipMerge: visited.length,
      leadershipOnlyNotInTouchSummary: leadershipOnly,
      delta: visited.length - 31,
    },
    summary: {
      totalCounties: 75,
      visitedCounties: visited.length,
      neverVisitedCounties: neverVisited.length,
      deltaCountiesNeverVisited: deltaGaps.length,
      tier1RevisitDue: tier1Due.length,
      averageVisitsPerVisitedCounty:
        visited.length > 0
          ? Math.round((visited.reduce((s, r) => s + r.visitCount, 0) / visited.length) * 10) / 10
          : 0,
    },
    visitedCounties: visited.sort((a, b) => b.visitCount - a.visitCount),
    neverVisitedCounties: neverVisited,
    deltaGapCounties: deltaGaps,
    tier1RevisitQueue: tier1Due.sort((a, b) => b.priorityScore - a.priorityScore),
    priorityQueue: rows.slice(0, 25),
    allCounties: rows,
  };

  writeFileSync(path.join(ROUTING, "county-coverage-reality-audit.json"), JSON.stringify(output, null, 2), "utf8");

  const md = `# County Coverage Reality Audit

> Leadership-confirmed travel history merged with calendar touch summary and visit log · VCI-ranked priority queue

**Reference date:** ${output.referenceDate} · **Early voting target horizon:** ${output.earlyVotingStart}

---

## Reconciliation (Brain vs reality)

| Metric | Count |
| ------ | ----: |
| Brain previously reported visited | ${output.reconciliation.brainReportedVisited} |
| **After leadership merge** | **${output.reconciliation.visitedAfterLeadershipMerge}** |
| Leadership-confirmed counties | ${output.reconciliation.leadershipConfirmedCounties} |
| Added from leadership (not in touch summary) | ${output.reconciliation.leadershipOnlyNotInTouchSummary.join(", ") || "—"} |

---

## Summary

| Visited counties | Never visited | Delta gaps (never visited) | Tier 1 revisit due |
| ---------------: | ------------: | -------------------------: | -----------------: |
| **${output.summary.visitedCounties}** | ${output.summary.neverVisitedCounties} | ${output.summary.deltaCountiesNeverVisited} | ${output.summary.tier1RevisitDue} |

**Doctrine:** ${output.doctrine}

---

## Top 15 priority counties (fill calendar with stackable trips)

| Rank | County | VCI | Visits | Days since | Category | Score |
| ---: | ------ | --: | -----: | ---------: | -------- | ----: |
${output.priorityQueue
  .slice(0, 15)
  .map(
    (r, i) =>
      `| ${i + 1} | ${r.county} | ${r.vciRank ?? "—"} | ${r.visitCount} | ${r.daysSinceLastVisit ?? "—"} | ${r.planningCategory} | ${r.priorityScore} |`,
  )
  .join("\n")}

---

## Delta gap — never visited (historically Democratic vote-producing)

${deltaGaps.map((r) => `- **${r.county}** (VCI rank ${r.vciRank ?? "—"}) — ${r.recommendedAction}`).join("\n") || "_None_"}

---

## Tier 1 revisit due (>30 days)

${tier1Due
  .slice(0, 12)
  .map((r) => `- **${r.county}** — ${r.visitCount} visits · last ${r.lastVisitDate ?? "?"} · ${r.recommendedAction}`)
  .join("\n") || "_None due_"}

---

## Visited counties (leadership + system)

| County | Visits | Last visit | Days since | VCI rank |
| ------ | -----: | ---------- | ---------: | -------: |
${visited
  .slice(0, 40)
  .map((r) => `| ${r.county} | ${r.visitCount} | ${r.lastVisitDate ?? "—"} | ${r.daysSinceLastVisit ?? "—"} | ${r.vciRank ?? "—"} |`)
  .join("\n")}

*Full data:* [\`county-coverage-reality-audit.json\`](./county-coverage-reality-audit.json)
`;

  writeFileSync(path.join(ROUTING, "county-coverage-reality-audit.md"), md, "utf8");

  // eslint-disable-next-line no-console
  console.log(
    `County coverage reality audit: ${output.summary.visitedCounties}/75 visited (${output.summary.neverVisitedCounties} never) · ${output.summary.deltaCountiesNeverVisited} Delta gaps · leadership merge +${output.reconciliation.delta}`,
  );
}

main();
