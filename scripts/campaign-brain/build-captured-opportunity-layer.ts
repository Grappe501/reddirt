/**
 * Captured Opportunity Layer — potential, captured, remaining, completion by county/cluster/lane.
 *
 * Usage: npm run campaign-brain:captured:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { OPPORTUNITY_CLUSTERS } from "../strategic-plan/data/opportunity-clusters";
import { completionPct } from "./lib/feedback-types";
import { loadCapturedProgressV2 } from "./lib/feedback-load";
import {
  BRAIN_ROOT,
  loadClusters,
  loadOpportunityCounties,
  loadVci,
  ARKANSAS_COUNTY_REGISTRY,
  shortCountyName,
  fmt,
} from "./lib/inputs";

const OUT = path.join(BRAIN_ROOT, "measurement");

function main() {
  const captured = loadCapturedProgressV2();
  const vci = loadVci();
  const opp = loadOpportunityCounties();
  const clusters = loadClusters();

  const counties = ARKANSAS_COUNTY_REGISTRY.map((reg) => {
    const county = shortCountyName(reg.displayName);
    const potential = vci.find((v) => v.county === county)?.vci ?? 0;
    const cap = captured.byCounty[county] ?? { capturedVci: 0, byLane: { lane2: 0, lane3: 0, lane4: 0 } };
    const o = opp.find((x) => x.county === county)!;
    const remaining = Math.max(0, potential - cap.capturedVci);
    return {
      county,
      slug: reg.slug,
      potential,
      captured: cap.capturedVci,
      remaining,
      completionPct: completionPct(cap.capturedVci, potential),
      byLane: {
        lane2: { captured: cap.byLane.lane2, potential: o.dropOffRecovery50 },
        lane3: { captured: cap.byLane.lane3, potential: o.registrationGoal },
        lane4: { captured: cap.byLane.lane4, potential: o.republicanConversionPotential },
      },
    };
  });

  counties.sort((a, b) => b.remaining - a.remaining);

  const clusterRows = clusters.map((c) => {
    const potential = c.combined.victoryContributionIndex;
    const cap = captured.byCluster[c.id]?.capturedVci ?? 0;
    return {
      id: c.id,
      name: c.name,
      potential,
      captured: cap,
      remaining: Math.max(0, potential - cap),
      completionPct: completionPct(cap, potential),
      lane2Potential: c.combined.lane2Recovery50,
      registrationPotential: c.combined.registrationGoal,
      lane4Potential: c.combined.lane4ConversionPotential,
    };
  });

  clusterRows.sort((a, b) => b.remaining - a.remaining);

  const statewideVciPotential = vci.reduce((s, c) => s + c.vci, 0);
  const statewideCaptured = counties.reduce((s, c) => s + c.captured, 0);

  const laneRows = (["lane1", "lane2", "lane3", "lane4"] as const).map((lane) => {
    const l = captured.statewide.byLane[lane];
    const pot = l.potential ?? l.goal;
    return {
      lane,
      goal: l.goal,
      potential: pot,
      captured: l.captured,
      remaining: Math.max(0, (lane === "lane2" ? pot : l.goal) - l.captured),
      completionPct: completionPct(l.captured, lane === "lane2" ? pot : l.goal),
    };
  });

  const output = {
    generatedAt: new Date().toISOString(),
    statewide: {
      potential: statewideVciPotential,
      captured: statewideCaptured,
      remaining: statewideVciPotential - statewideCaptured,
      completionPct: completionPct(statewideCaptured, statewideVciPotential),
      byLane: laneRows,
    },
    clusters: clusterRows,
    counties,
  };

  mkdirSync(OUT, { recursive: true });
  writeFileSync(path.join(OUT, "captured-opportunity.json"), JSON.stringify(output, null, 2), "utf8");

  const topCluster = clusterRows[0];
  const md = `# Captured Opportunity Layer

> Potential → Captured → Remaining → Completion %

Update source: [\`data/campaign-brain/captured-progress.json\`](../../data/campaign-brain/captured-progress.json)

---

## Statewide

| Metric | Value |
| ------ | ----: |
| Total VCI potential | ${fmt(output.statewide.potential)} |
| Captured | **${fmt(output.statewide.captured)}** |
| Remaining | **${fmt(output.statewide.remaining)}** |
| Completion | **${output.statewide.completionPct}%** |

### By lane

| Lane | Goal / Potential | Captured | Remaining | Completion |
| ---- | ---------------: | -------: | --------: | ---------: |
${laneRows.map((l) => `| ${l.lane} | ${fmt(l.potential)} | ${fmt(l.captured)} | ${fmt(l.remaining)} | ${l.completionPct}% |`).join("\n")}

---

## Top cluster: ${topCluster.name}

| Potential | Captured | Remaining | Completion |
| --------: | -------: | --------: | ---------: |
| ${fmt(topCluster.potential)} | ${fmt(topCluster.captured)} | **${fmt(topCluster.remaining)}** | ${topCluster.completionPct}% |

---

## County alerts (0% completion, Tier A potential)

${counties
  .filter((c) => c.completionPct === 0 && c.potential >= 15_000)
  .slice(0, 10)
  .map((c) => `- **${c.county}** — ${fmt(c.potential)} potential, 0 captured`)
  .join("\n")}

*Full data:* [\`captured-opportunity.json\`](./captured-opportunity.json)
`;

  writeFileSync(path.join(OUT, "captured-opportunity.md"), md, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Captured opportunity layer: ${output.statewide.completionPct}% statewide completion (${fmt(output.statewide.captured)} / ${fmt(output.statewide.potential)}).`);
}

main();
