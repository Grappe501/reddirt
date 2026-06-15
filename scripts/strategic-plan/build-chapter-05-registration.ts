/**
 * Phase 2A — Generate Chapter 5 registration opportunity dashboards (75 counties).
 *
 * Usage: npm run strategic-plan:chapter-05:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";

import {
  fmt,
  loadDropOffSummary,
  loadElectionHistory,
  registrationPace,
  resolveRegistrationGoals,
  estimateCountyHsSeniors,
  writeRegistrationGoalsJson,
  shortCountyName,
  PLAN_ROOT,
} from "./lib/strategic-plan-shared";

const OUT_DIR = path.join(PLAN_ROOT, "part-ii-electoral-math/chapter-05-fifty-thousand-new-voter-plan");
const SUMMARY_PATH = path.join(OUT_DIR, "statewide-registration-summary.json");

function buildCountyMarkdown(
  county: string,
  slug: string,
  goal: number,
  source: string,
  soFar: number | null,
  gap: number,
  hsSeniors: number,
  recovery50: number,
): string {
  const pace = registrationPace(goal, gap);

  return `# ${county} County — Registration Opportunity Dashboard

> **Status:** Generated
> **Document:** Arkansas Plurality Victory Plan
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT
> **Part:** II — The Electoral Math
> **Chapter:** 5 — Lane 3: New Voter Expansion
> **County:** ${county}

---

## Core message

> ${gap.toLocaleString()} registrations to go. That is **${pace.weeklyTarget}/week** or **${pace.dailyTarget}/day** over ${pace.weeksRemaining} weeks.

---

## Registration dashboard

| Field | Value |
| ----- | ----: |
| County registration goal | **${fmt(goal)}** |
| Current registrations (baseline) | ${soFar === null ? "—" : `**${fmt(soFar)}**`} |
| Gap remaining | **${fmt(gap)}** |
| Goal source | ${source} |

---

## Pace targets (${pace.weeksRemaining} weeks remaining)

| Period | Target |
| ------ | -----: |
| Weekly | **${fmt(pace.weeklyTarget)}** / week |
| Daily | **${fmt(pace.dailyTarget)}** / day |
| Monthly (~${pace.monthsRemaining} mo) | **${fmt(pace.monthlyTarget)}** / month |

---

## Youth opportunity

| Field | Estimate |
| ----- | -------: |
| Est. graduating seniors (county share) | ~${fmt(hsSeniors)} |
| Suggested senior registration target | ~${fmt(Math.round(hsSeniors * 0.35))} (35% capture) |
| Community college / trade school | TBD — field inventory |

*Senior estimate: county share of ~35,000 statewide public HS graduates, weighted by 2024 presidential turnout.*

---

## Lane context

| Lane | County anchor |
| ---- | ------------: |
| Lane 2 recovery @ 50% | ${fmt(recovery50)} votes |
| Lane 3 registration goal | ${fmt(goal)} new registrants |

---

## Priority populations

- High school seniors
- Community colleges, universities, trade schools
- Community registration events
- Faith community outreach
- Military families
- Young professionals
- Naturalized citizens

---

## Data source

- Goal: \`${source}\`
- Regenerate: \`npm run strategic-plan:chapter-05:build\`
`;
}

async function main() {
  const dropOff = loadDropOffSummary();
  const history = loadElectionHistory();
  const { goals, dbWarning } = await resolveRegistrationGoals(dropOff);

  const statewidePresTotal = [...history.values()].reduce(
    (s, r) => s + (r.presidential2024TotalVotes ?? 0),
    0,
  );

  mkdirSync(path.join(OUT_DIR, "counties"), { recursive: true });

  let totalGoal = 0;
  let totalGap = 0;

  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    const g = goals.find((x) => x.county === county)!;
    const drop = dropOff.counties.find((c) => c.county === county)!;
    const hs = estimateCountyHsSeniors(county, history.get(county), statewidePresTotal);

    totalGoal += g.goal;
    totalGap += g.gapRemaining;

    writeFileSync(
      path.join(OUT_DIR, "counties", `${reg.slug}.md`),
      buildCountyMarkdown(
        county,
        reg.slug,
        g.goal,
        g.source,
        g.registrationsSoFar,
        g.gapRemaining,
        hs,
        drop.recovery50,
      ),
      "utf8",
    );
  }

  writeRegistrationGoalsJson(
    goals,
    dbWarning?.includes("Lane 2-weighted")
      ? "Allocated from Lane 2 recovery weights pending CountyCampaignStats backfill."
      : "CountyCampaignStats.registrationGoal from database.",
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    statewideGoal: totalGoal,
    statewideGap: totalGap,
    weeksRemaining: 20,
    statewideWeeklyTarget: Math.ceil(totalGap / 20),
    statewideDailyTarget: Math.ceil(totalGap / 140),
    dbWarning,
    top10ByGoal: [...goals].sort((a, b) => b.goal - a.goal).slice(0, 10),
    goals: goals.map((g) => ({
      county: g.county,
      slug: g.slug,
      goal: g.goal,
      gap: g.gapRemaining,
      source: g.source,
    })),
  };

  writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2), "utf8");

  // eslint-disable-next-line no-console
  console.log(
    `Wrote 75 registration dashboards. Statewide goal: ${totalGoal.toLocaleString()} | gap: ${totalGap.toLocaleString()} | ${Math.ceil(totalGap / 20)}/week.`,
  );
  if (dbWarning) console.warn(dbWarning);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
