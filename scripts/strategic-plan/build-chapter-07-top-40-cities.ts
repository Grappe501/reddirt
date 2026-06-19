/**
 * Phase 3A — Generate Top 40 city electoral + influence profiles and Top 10 deep dives.
 *
 * Usage: npm run strategic-plan:chapter-07:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  ARKANSAS_COUNTY_POPULATION_2020,
  ARKANSAS_TOP_100_CITIES,
  type ArkansasTop40City,
  type CityInfluenceTag,
} from "./data/arkansas-top-40-cities";
import { fmt, loadWinTargets, PLAN_ROOT } from "./lib/strategic-plan-shared";

const CH7_DIR = path.join(PLAN_ROOT, "part-iii-arkansas-battlefield/chapter-07-top-40-city-strategy");
const CH8_DIR = path.join(PLAN_ROOT, "part-iii-arkansas-battlefield/chapter-08-top-10-strategic-cities");
const SUMMARY_PATH = path.join(CH7_DIR, "top-40-city-summary.json");

const INFLUENCE_LABELS: Record<CityInfluenceTag, string> = {
  media: "Media market influence",
  fundraising: "Fundraising influence",
  volunteers: "Volunteer production",
  students: "Student / university pipeline",
  digital_reach: "Digital / social amplification",
  business_leaders: "Business leader access",
  chambers: "Chamber of Commerce network",
  moderate_republicans: "Moderate Republican conversion (Lane 4)",
  turnout_growth: "Turnout growth potential",
  democratic_recovery: "Democratic recovery (Lane 2)",
  persuasion: "Persuasion opportunity",
  regional_media: "Regional media market",
  political_influence: "Statewide political influence",
};

function influenceCategory(tags: CityInfluenceTag[]): string {
  if (tags.includes("media") || tags.includes("political_influence")) return "Statewide influence hub";
  if (tags.includes("students")) return "University / youth registration hub";
  if (tags.includes("business_leaders") || tags.includes("chambers")) return "Business / chamber hub";
  if (tags.includes("democratic_recovery") || tags.includes("turnout_growth")) return "Democratic recovery hub";
  if (tags.includes("persuasion") || tags.includes("moderate_republicans")) return "Persuasion / conversion hub";
  return "Regional organizing hub";
}

function visitLabel(freq: ArkansasTop40City["visitFrequency"]): string {
  const map = {
    weekly: "Weekly (campaign backbone)",
    biweekly: "Every 2 weeks",
    monthly: "Monthly",
    quarterly: "Quarterly / event-driven",
    campaign_sprint: "Final 6-week sprint focus",
  };
  return map[freq];
}

function computeCityElectoral(city: ArkansasTop40City) {
  const scenario = loadWinTargets();
  const countyRow = scenario.counties.find((c) => c.county === city.county);
  const countyPop = ARKANSAS_COUNTY_POPULATION_2020[city.county] ?? city.population2020;
  const share = city.population2020 / countyPop;
  const targetVotes = countyRow ? Math.round(countyRow.targetVotes * share) : 0;
  const baselineVote = countyRow ? Math.round(countyRow.baselineDemVotes * share) : 0;
  const voteGain = countyRow ? Math.round(countyRow.targetVoteGain * share) : 0;
  return { targetVotes, baselineVote, voteGain, countyTarget: countyRow?.targetVotes ?? 0, share };
}

function buildCityMarkdown(city: ArkansasTop40City, rank: number): string {
  const e = computeCityElectoral(city);
  const influenceLines = city.influenceTags.map((t) => `- ${INFLUENCE_LABELS[t]}`).join("\n");

  return `# ${city.name} — City Strategy

> **Status:** Generated
> **Document:** Arkansas Plurality Victory Plan
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT
> **Part:** III — The Arkansas Battlefield
> **Chapter:** 7
> **City rank (vote target):** #${rank} of 100
> **Top 10 strategic city:** ${city.isTop10 ? "Yes" : "No"}

---

## Electoral profile

| Field | Value |
| ----- | ----: |
| Population (2020 Census) | ${fmt(city.population2020)} |
| County | ${city.county} |
| County population share | ${((city.population2020 / (ARKANSAS_COUNTY_POPULATION_2020[city.county] ?? 1)) * 100).toFixed(1)}% |
| **Target votes** | **${fmt(e.targetVotes)}** |
| Baseline Democratic vote (est.) | ${fmt(e.baselineVote)} |
| Vote gain needed (est.) | ${fmt(e.voteGain)} |
| County total target | ${fmt(e.countyTarget)} |

*City targets allocated proportionally: county win-target × (city pop ÷ county pop). Source: \`kelly-win-target-scenario-v1.json\`.*

---

## Influence profile

**Category:** ${influenceCategory(city.influenceTags)}

${influenceLines}

**Strategic role:** ${city.strategicRole}

**Suggested visit frequency:** ${visitLabel(city.visitFrequency)}

---

## Four-lane fit

| Lane | Role in ${city.name} |
| ---- | -------------------- |
| Lane 1 — Retention | Hold baseline Democratic voters |
| Lane 2 — Reactivation | ${city.influenceTags.includes("democratic_recovery") ? "**Primary** — drop-off recovery" : "Support county recovery efforts"} |
| Lane 3 — Registration | ${city.influenceTags.includes("students") ? "**Primary** — student & youth registration" : "Community registration events"} |
| Lane 4 — Conversion | ${city.influenceTags.includes("moderate_republicans") || city.influenceTags.includes("business_leaders") ? "**Primary** — relationship conversion" : "Power of 5 persuasion"} |

---

## Field plan hooks

| Field | Status |
| ----- | ------ |
| Power of 5 goal | TBD |
| Volunteer targets | TBD |
| Visit schedule | ${visitLabel(city.visitFrequency)} |
| Media market | TBD |
| Faith community analysis | TBD |
| Business community analysis | ${city.influenceTags.includes("chambers") ? "Priority" : "TBD"} |

---

## Data source

- Win targets: \`data/election/kelly-win-target-scenario-v1.json\`
- Regenerate: \`npm run strategic-plan:chapter-07:build\`
`;
}

function buildTop10DeepDive(city: ArkansasTop40City, rank: number, top10TargetSum: number): string {
  const e = computeCityElectoral(city);
  const base = buildCityMarkdown(city, rank);

  return `${base}

---

## Deep dive — ${city.name} (Top 10)

### Why this city matters

${city.strategicRole}

### Vote math at a glance

- **${fmt(e.targetVotes)} target votes** — ${rank <= 3 ? "among the highest city targets in Arkansas" : "a top-10 strategic allocation"}
- **${fmt(e.voteGain)} vote gain** needed beyond baseline
- Represents **${((e.targetVotes / top10TargetSum) * 100).toFixed(1)}%** of the Top 10 combined target (${fmt(top10TargetSum)})

### Influence assets to activate

${city.influenceTags.map((t) => `1. **${INFLUENCE_LABELS[t]}** — deploy for county and statewide lift`).join("\n")}

### Recommended 20-week presence

- Visit cadence: **${visitLabel(city.visitFrequency)}**
- Pair with adjacent cities in same county/region for travel efficiency
- Anchor events: county fair, chamber, faith, and campus calendar (see appendices F–H)
`;
}

function main() {
  const scenario = loadWinTargets();
  const citiesWithVotes = ARKANSAS_TOP_100_CITIES.map((city) => ({
    city,
    ...computeCityElectoral(city),
  }));
  citiesWithVotes.sort((a, b) => b.targetVotes - a.targetVotes);

  mkdirSync(path.join(CH7_DIR, "cities"), { recursive: true });
  mkdirSync(CH8_DIR, { recursive: true });

  const summaryRows = citiesWithVotes.map((row, i) => ({
    rank: i + 1,
    slug: row.city.slug,
    name: row.city.name,
    county: row.city.county,
    population2020: row.city.population2020,
    targetVotes: row.targetVotes,
    voteGain: row.voteGain,
    baselineVote: row.baselineVote,
    influenceCategory: influenceCategory(row.city.influenceTags),
    strategicRole: row.city.strategicRole,
    visitFrequency: row.city.visitFrequency,
    isTop10: row.city.isTop10,
    influenceTags: row.city.influenceTags,
  }));

  const top10 = summaryRows.filter((r) => r.isTop10);
  const top10TargetSum = top10.reduce((s, r) => s + r.targetVotes, 0);
  const top100TargetSum = summaryRows.reduce((s, r) => s + r.targetVotes, 0);
  const top40TargetSum = summaryRows.slice(0, 40).reduce((s, r) => s + r.targetVotes, 0);

  for (const row of citiesWithVotes) {
    const rank = summaryRows.find((s) => s.slug === row.city.slug)!.rank;
    writeFileSync(path.join(CH7_DIR, "cities", `${row.city.slug}.md`), buildCityMarkdown(row.city, rank), "utf8");
    if (row.city.isTop10) {
      writeFileSync(
        path.join(CH8_DIR, `${row.city.slug}.md`),
        buildTop10DeepDive(row.city, rank, top10TargetSum),
        "utf8",
      );
    }
  }

  writeFileSync(
    SUMMARY_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        top100TargetVotes: top100TargetSum,
        top100ShareOfStatewideWorkingTarget: top100TargetSum / scenario.statewide.workingTargetWithCushion,
        top75TargetVotes: top100TargetSum,
        top75ShareOfStatewideWorkingTarget: top100TargetSum / scenario.statewide.workingTargetWithCushion,
        top40TargetVotes: top40TargetSum,
        top40ShareOfStatewideWorkingTarget: top40TargetSum / scenario.statewide.workingTargetWithCushion,
        top10TargetVotes: top10TargetSum,
        top10Cities: top10,
        cities: summaryRows,
      },
      null,
      2,
    ),
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(
    `Wrote ${ARKANSAS_TOP_100_CITIES.length} city profiles + 10 deep dives. Top 100 targets: ${top100TargetSum.toLocaleString()} | Top 40 (legacy slice): ${top40TargetSum.toLocaleString()} | Top 10: ${top10TargetSum.toLocaleString()}.`,
  );
}

main();
