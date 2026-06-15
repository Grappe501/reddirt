/**
 * County Coverage Completion — planned vs completed vs remaining per county.
 *
 * Usage: npm run campaign-brain:coverage:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_ROOT, loadOpportunityCounties, fmt } from "./lib/inputs";
import {
  allCountyNames,
  buildCountyCoverageIndex,
  loadAllCountyVisits,
  plannedContactsByTier,
} from "./lib/county-coverage";

const OUT = path.join(BRAIN_ROOT, "measurement");

function main() {
  mkdirSync(OUT, { recursive: true });

  const opp = loadOpportunityCounties();
  const oppMap = new Map(opp.map((c) => [c.county, c]));
  const visits = loadAllCountyVisits(path.join(process.cwd(), "data/campaign-brain"));
  const coverage = buildCountyCoverageIndex(visits);

  const visitCounts = new Map<string, number>();
  for (const v of visits) {
    visitCounts.set(v.county, (visitCounts.get(v.county) ?? 0) + 1);
  }

  const rows = allCountyNames().map((county) => {
    const tier = oppMap.get(county)?.tier;
    const planned = plannedContactsByTier(tier);
    const completed = visitCounts.get(county) ?? 0;
    const remaining = Math.max(0, planned - completed);
    const completionPct = planned > 0 ? Math.round((completed / planned) * 1000) / 10 : 0;
    const cov = coverage.counties.find((c) => c.county === county);

    return {
      county,
      tier: tier ?? "D",
      planned,
      completed,
      remaining,
      completionPct,
      daysSinceContact: cov?.daysSinceVisit ?? null,
      guardrailStatus: cov?.guardrailStatus ?? "violation",
    };
  });

  rows.sort((a, b) => b.remaining - a.remaining || (b.daysSinceContact ?? 999) - (a.daysSinceContact ?? 999));

  const output = {
    generatedAt: new Date().toISOString(),
    note: "Planned contacts by opportunity tier (A=5, B=3, C=2, D=1). Completed from visit log + county-touch-summary.",
    statewide: {
      planned: rows.reduce((s, r) => s + r.planned, 0),
      completed: rows.reduce((s, r) => s + r.completed, 0),
      remaining: rows.reduce((s, r) => s + r.remaining, 0),
    },
    counties: rows,
  };

  writeFileSync(path.join(OUT, "county-coverage-completion.json"), JSON.stringify(output, null, 2), "utf8");

  const md = `# County Coverage Completion

> Planned vs completed campaign contacts by county

---

## Statewide

| Planned | Completed | Remaining |
| ------: | --------: | --------: |
| ${fmt(output.statewide.planned)} | **${fmt(output.statewide.completed)}** | ${fmt(output.statewide.remaining)} |

---

## By county (highest remaining first)

| County | Tier | Planned | Completed | Remaining | Guardrail |
| ------ | ---- | ------: | --------: | --------: | --------- |
${rows
  .slice(0, 30)
  .map(
    (r) =>
      `| ${r.county} | ${r.tier} | ${r.planned} | ${r.completed} | **${r.remaining}** | ${r.guardrailStatus} |`,
  )
  .join("\n")}

---

## Examples (leadership readout)

${rows
  .filter((r) => r.tier === "A")
  .slice(0, 6)
  .map((r) => `- **${r.county}** — ${r.completed}/${r.planned} complete (${r.remaining} remaining)`)
  .join("\n")}

*Full data:* [\`county-coverage-completion.json\`](./county-coverage-completion.json)
`;

  writeFileSync(path.join(OUT, "county-coverage-completion.md"), md, "utf8");

  // eslint-disable-next-line no-console
  console.log(
    `County coverage completion: ${output.statewide.completed}/${output.statewide.planned} contacts complete (${output.statewide.remaining} remaining).`,
  );
}

main();
