/**
 * Opportunity Contribution scorecard — county tier classification for scheduling.
 *
 * Opportunity Score = Drop-Off Recovery @ 50% + Registration Goal + Republican Conversion Potential
 *
 * Usage: npm run strategic-plan:opportunity:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import { REPUBLICAN_PEEL_RATE } from "./data/arkansas-top-40-cities";
import {
  loadDropOffSummary,
  loadElectionHistory,
  resolveRegistrationGoals,
  fmt,
  PLAN_ROOT,
  shortCountyName,
} from "./lib/strategic-plan-shared";

const OUT_DIR = path.join(PLAN_ROOT, "part-ii-electoral-math/opportunity-scorecard");
const MD_PATH = path.join(OUT_DIR, "README.md");
const JSON_PATH = path.join(OUT_DIR, "statewide-opportunity-scorecard.json");

type OpportunityTier = "A" | "B" | "C" | "D";

function tierFromRank(rank: number): OpportunityTier {
  if (rank <= 12) return "A";
  if (rank <= 30) return "B";
  if (rank <= 60) return "C";
  return "D";
}

function tierLabel(t: OpportunityTier): string {
  const map: Record<OpportunityTier, string> = {
    A: "Tier A — Highest overall upside",
    B: "Tier B — Strong upside",
    C: "Tier C — Relationship-building counties",
    D: "Tier D — Maintenance counties",
  };
  return map[t];
}

async function main() {
  const dropOff = loadDropOffSummary();
  const history = loadElectionHistory();
  const { goals } = await resolveRegistrationGoals(dropOff);

  const rows = ARKANSAS_COUNTY_REGISTRY.map((reg) => {
    const county = shortCountyName(reg.displayName);
    const drop = dropOff.counties.find((c) => c.county === county)!;
    const goal = goals.find((g) => g.county === county)!;
    const hist = history.get(county);
    const repConversion = Math.round((hist?.sos2022RepVotes ?? 0) * REPUBLICAN_PEEL_RATE);
    const score = drop.recovery50 + goal.goal + repConversion;

    return {
      county,
      slug: reg.slug,
      fips: reg.fips,
      dropOffRecovery50: drop.recovery50,
      registrationGoal: goal.goal,
      republicanConversionPotential: repConversion,
      opportunityScore: score,
      hopeIndex: drop.hopeIndex,
      tier: "D" as OpportunityTier,
      rank: 0,
    };
  });

  rows.sort((a, b) => b.opportunityScore - a.opportunityScore);
  rows.forEach((r, i) => {
    r.rank = i + 1;
    r.tier = tierFromRank(i + 1);
  });

  mkdirSync(OUT_DIR, { recursive: true });

  const byTier = {
    A: rows.filter((r) => r.tier === "A"),
    B: rows.filter((r) => r.tier === "B"),
    C: rows.filter((r) => r.tier === "C"),
    D: rows.filter((r) => r.tier === "D"),
  };

  writeFileSync(
    JSON_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        formula:
          "Opportunity Score = Lane 2 recovery @ 50% + registration goal + (2022 SOS Republican votes × 12%)",
        tiers: {
          A: "Ranks 1–12 — highest overall upside",
          B: "Ranks 13–30 — strong upside",
          C: "Ranks 31–60 — relationship-building",
          D: "Ranks 61–75 — maintenance",
        },
        counties: rows,
      },
      null,
      2,
    ),
    "utf8",
  );

  const tierSection = (tier: OpportunityTier) => {
    const list = byTier[tier];
    return `### ${tierLabel(tier)}

| Rank | County | Opportunity Score | Lane 2 @ 50% | Reg Goal | Lane 4 Peel |
| ---- | ------ | ----------------: | -----------: | -------: | ----------: |
${list.map((r) => `| ${r.rank} | ${r.county} | ${fmt(r.opportunityScore)} | ${fmt(r.dropOffRecovery50)} | ${fmt(r.registrationGoal)} | ${fmt(r.republicanConversionPotential)} |`).join("\n")}
`;
  };

  const md = `# Opportunity Contribution Scorecard

> **Status:** Generated
> **Document:** Arkansas Plurality Victory Plan
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT

---

## Formula

\`\`\`
Opportunity Score =
  Drop-Off Recovery @ 50%
  + Registration Goal
  + Republican Conversion Potential (2022 SOS R × 12%)
\`\`\`

Use this scorecard to prioritize candidate travel, surrogate deployment, and county chair investment.

---

## Statewide context

| Lane 2 statewide recovery @ 50% | ${fmt(dropOff.totals.recovery50Total)} |
| Registration goal (statewide) | 50,000 |
| Counties classified | 75 |

*Machine-readable:* [\`statewide-opportunity-scorecard.json\`](./statewide-opportunity-scorecard.json)

---

${tierSection("A")}

${tierSection("B")}

${tierSection("C")}

${tierSection("D")}

---

## Regenerate

\`\`\`bash
npm run strategic-plan:opportunity:build
\`\`\`
`;

  writeFileSync(MD_PATH, md, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote opportunity scorecard. Tier A leaders: ${byTier.A.map((r) => r.county).join(", ")}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
