/**
 * Phase 7 — Opportunity cluster rollups for routing backbone.
 *
 * Usage: npm run strategic-plan:clusters:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { OPPORTUNITY_CLUSTERS } from "./data/opportunity-clusters";
import { fmt, readJson, PLAN_ROOT } from "./lib/strategic-plan-shared";

const OUT_DIR = path.join(PLAN_ROOT, "command-center/opportunity-clusters");

type OpportunityRow = {
  county: string;
  dropOffRecovery50: number;
  registrationGoal: number;
  republicanConversionPotential: number;
};

type VciRow = { county: string; vci: number };

function main() {
  const opp = readJson<{ counties: OpportunityRow[] }>(
    path.join(PLAN_ROOT, "part-ii-electoral-math/opportunity-scorecard/statewide-opportunity-scorecard.json"),
  )!.counties;
  const vci = readJson<{ counties: VciRow[] }>(path.join(PLAN_ROOT, "command-center/victory-contribution-index.json"));

  const clusters = OPPORTUNITY_CLUSTERS.map((cluster) => {
    const countyRows = opp.filter((c) => cluster.counties.includes(c.county));
    const lane2 = countyRows.reduce((s, c) => s + c.dropOffRecovery50, 0);
    const reg = countyRows.reduce((s, c) => s + c.registrationGoal, 0);
    const lane4 = countyRows.reduce((s, c) => s + c.republicanConversionPotential, 0);
    const vciSum = vci
      ? countyRows.reduce((s, c) => s + (vci.counties.find((v) => v.county === c.county)?.vci ?? 0), 0)
      : lane2 + reg + lane4;

    return {
      ...cluster,
      combined: {
        lane2Recovery50: lane2,
        registrationGoal: reg,
        lane4ConversionPotential: lane4,
        victoryContributionIndex: vciSum,
      },
      countyCount: countyRows.length,
    };
  });

  clusters.sort((a, b) => b.combined.victoryContributionIndex - a.combined.victoryContributionIndex);

  mkdirSync(OUT_DIR, { recursive: true });

  writeFileSync(
    path.join(OUT_DIR, "clusters.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), clusters }, null, 2),
    "utf8",
  );

  const md = `# Opportunity Clusters

> **Status:** Generated — routing backbone for 20-week schedule
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT

Cluster-based deployment planning: organize travel, events, and relationships across regions—not 75 independent counties.

---

## Clusters (ranked by VCI)

${clusters
  .map(
    (c, i) => `### ${i + 1}. ${c.name}

| Metric | Value |
| ------ | ----: |
| Counties | ${c.countyCount} |
| Lane 2 @ 50% | **${fmt(c.combined.lane2Recovery50)}** |
| Registration goal | **${fmt(c.combined.registrationGoal)}** |
| Lane 4 peel potential | **${fmt(c.combined.lane4ConversionPotential)}** |
| Combined VCI | **${fmt(c.combined.victoryContributionIndex)}** |
| Recommended visits | ${c.recommendedVisits} |

**Cities:** ${c.cities.join(", ") || "County-seat focus"}

**Counties:** ${c.counties.join(", ")}

${c.description}

`,
  )
  .join("\n")}

---

## Regenerate

\`npm run strategic-plan:clusters:build\`
`;

  writeFileSync(path.join(OUT_DIR, "README.md"), md, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote ${clusters.length} opportunity clusters. Leader: ${clusters[0].name}.`);
}

main();
