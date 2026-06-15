/**
 * Phase 6 — Four Lanes executive command center + victory projection.
 *
 * Usage: npm run strategic-plan:four-lanes:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { fmt, loadDropOffSummary, readJson, resolveRegistrationGoals, PLAN_ROOT } from "./lib/strategic-plan-shared";

const OUT_DIR = path.join(PLAN_ROOT, "command-center");
const JSON_PATH = path.join(OUT_DIR, "four-lanes-dashboard.json");

async function main() {
  const dropOff = loadDropOffSummary();
  const win = readJson<{
    statewide: { statewideBaselineVotes: number; workingTargetWithCushion: number; statewideVoteGap: number };
  }>(path.join(process.cwd(), "data/election/kelly-win-target-scenario-v1.json"))!;
  const { goals } = await resolveRegistrationGoals(dropOff);

  const opp = readJson<{ counties: Array<{ republicanConversionPotential: number }> }>(
    path.join(PLAN_ROOT, "part-ii-electoral-math/opportunity-scorecard/statewide-opportunity-scorecard.json"),
  )!;

  const lane1Goal = win.statewide.statewideBaselineVotes;
  const lane2Potential = dropOff.totals.rawDropOff;
  const lane2Goal = dropOff.totals.recovery50Total;
  const lane2Stretch = dropOff.totals.recovery75Total;
  const lane3Goal = 50_000;
  const lane4Goal = Math.round(opp.counties.reduce((s, c) => s + c.republicanConversionPotential, 0));

  const regSoFar = goals.reduce((s, g) => s + (g.registrationsSoFar ?? 0), 0);

  const dashboard = {
    generatedAt: new Date().toISOString(),
    narrative:
      "Over 102,000 Arkansas Democrats voted in 2024 but skipped the 2022 midterm. First job: bring them back.",
    lanes: {
      lane1: {
        name: "Democratic Retention",
        goal: lane1Goal,
        currentProjection: null as number | null,
        gap: null as number | null,
        note: "Hold baseline — prevent drop-off from 325,814 floor",
      },
      lane2: {
        name: "Democratic Reactivation",
        potential: lane2Potential,
        goal: lane2Goal,
        stretch: lane2Stretch,
        current: null as number | null,
        gap: lane2Goal,
        note: "102,070 available · 51,051 @ 50% working goal",
      },
      lane3: {
        name: "New Voter Registration",
        goal: lane3Goal,
        current: regSoFar || null,
        gap: lane3Goal - regSoFar,
        weeklyPace: Math.ceil((lane3Goal - regSoFar) / 20),
        note: "50,000 statewide · 2,500/week over 20 weeks",
      },
      lane4: {
        name: "Republican / Independent Conversion",
        goal: lane4Goal,
        current: null as number | null,
        gap: lane4Goal,
        note: "Statewide 12% peel model on 2022 SOS Republican vote",
      },
    },
    victoryProjection: {
      pluralityWinRange: { low: 390_000, high: 420_000 },
      workingGoal: 400_000,
      stretchGoal: 430_000,
      traditionalMajorityTarget: win.statewide.workingTargetWithCushion,
      scenarios: {
        expected: {
          label: "Expected case",
          formula: "Lane 1 baseline + 50% Lane 2 + 60% Lane 3 + 40% Lane 4",
          projectedVotes: Math.round(lane1Goal + lane2Goal * 0.5 + lane3Goal * 0.6 + lane4Goal * 0.4),
        },
        best: {
          label: "Best case",
          formula: "Lane 1 + 75% Lane 2 + 80% Lane 3 + 50% Lane 4",
          projectedVotes: Math.round(lane1Goal + lane2Stretch * 0.75 + lane3Goal * 0.8 + lane4Goal * 0.5),
        },
        stretch: {
          label: "Stretch case",
          formula: "Lane 1 + 75% Lane 2 + 100% Lane 3 + 60% Lane 4",
          projectedVotes: Math.round(lane1Goal + lane2Stretch + lane3Goal + lane4Goal * 0.6),
        },
      },
      combinedOpportunityNote:
        "Lane 2 + Lane 3 + Lane 4 goals exceed traditional 173,149 gap model — plurality path is multi-lane.",
    },
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(JSON_PATH, JSON.stringify(dashboard, null, 2), "utf8");

  const md = `# Four Lanes Command Center

> **Status:** Generated — executive cockpit
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT

${dashboard.narrative}

---

## Lane 1 — Democratic Retention

| Field | Value |
| ----- | ----: |
| Goal | **${fmt(lane1Goal)}** |
| Current projection | TBD (field data) |
| Gap | TBD |

---

## Lane 2 — Democratic Reactivation

| Field | Value |
| ----- | ----: |
| Potential | **${fmt(lane2Potential)}** |
| Goal (50%) | **${fmt(lane2Goal)}** |
| Stretch (75%) | **${fmt(lane2Stretch)}** |
| Current | TBD |
| Gap | **${fmt(lane2Goal)}** |

---

## Lane 3 — Registration

| Field | Value |
| ----- | ----: |
| Goal | **${fmt(lane3Goal)}** |
| Current | ${regSoFar ? fmt(regSoFar) : "TBD"} |
| Gap | **${fmt(lane3Goal - regSoFar)}** |
| Weekly pace | **${fmt(Math.ceil((lane3Goal - regSoFar) / 20))}** |

---

## Lane 4 — Republican / Independent Conversion

| Field | Value |
| ----- | ----: |
| Goal (12% peel) | **${fmt(lane4Goal)}** |
| Current | TBD |
| Gap | **${fmt(lane4Goal)}** |

---

## Total Victory Projection

| Scenario | Projected votes | vs plurality range (390K–420K) |
| -------- | --------------: | ------------------------------ |
| Expected | **${fmt(dashboard.victoryProjection.scenarios.expected.projectedVotes)}** | ${dashboard.victoryProjection.scenarios.expected.projectedVotes >= 390_000 ? "✓ In range" : "Below range"} |
| Best | **${fmt(dashboard.victoryProjection.scenarios.best.projectedVotes)}** | ${dashboard.victoryProjection.scenarios.best.projectedVotes >= 420_000 ? "✓ Stretch" : "In range"} |
| Stretch | **${fmt(dashboard.victoryProjection.scenarios.stretch.projectedVotes)}** | Plurality win path |

**Plurality working goal:** 400,000+ · **Traditional 50%+1:** ${fmt(win.statewide.workingTargetWithCushion)} (not required)

*Machine-readable:* [\`four-lanes-dashboard.json\`](./four-lanes-dashboard.json)

---

## Regenerate

\`npm run strategic-plan:four-lanes:build\`
`;

  writeFileSync(path.join(OUT_DIR, "four-lanes-dashboard.md"), md, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote four-lanes command center. Expected projection: ${dashboard.victoryProjection.scenarios.expected.projectedVotes.toLocaleString()} votes.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
