#!/usr/bin/env tsx
/**
 * Generate Sprint 0 leadership review report from victory-map-v1.json.
 * Run: npm run victory:map:review
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

import { loadKellyWinTargetScenarioFile } from "../../src/lib/election-targets/load-win-target-scenario";
import { summarizeVictoryMapDimensions } from "../../src/lib/victory-os/classify-county-dimensions";
import { loadVictoryMapFile } from "../../src/lib/victory-os/load-victory-map";
import { CRITICAL_ELECTORAL_COUNTIES, LEADERSHIP_COUNTY_OVERRIDES } from "../../src/lib/victory-os/leadership-county-overrides";
import type { VictoryMapCountyProfile } from "../../src/lib/victory-os/types";

const OUT = path.join(process.cwd(), "docs/campaign-events/VICTORY_MAP_SPRINT_0_REVIEW.md");

function listBy<T extends VictoryMapCountyProfile>(
  counties: T[],
  pick: (c: T) => boolean,
): string {
  return counties
    .filter(pick)
    .map((c) => `- **${c.county}** (${c.countySlug}) — ${c.regionLabel ?? c.regionSlug}`)
    .join("\n");
}

function main() {
  const file = loadVictoryMapFile();
  if (!file || file.counties.length !== 75) {
    console.error("victory-map-v1.json missing or incomplete — run npm run victory:map:seed");
    process.exit(1);
  }

  const counties = file.counties;
  const dims = summarizeVictoryMapDimensions(counties);
  const win = loadKellyWinTargetScenarioFile();
  const missingWinRows = counties.filter((c) => c.countyWinContribution == null);
  const highOpp = counties.filter((c) => c.opportunityLevel === "high");
  const weakReady = counties.filter((c) => c.organizationalReadiness === "weak");
  const overrideCounties = counties.filter((c) => LEADERSHIP_COUNTY_OVERRIDES[c.county]);
  const heuristicCritical = counties.filter(
    (c) => c.electoralImportance === "critical" && !CRITICAL_ELECTORAL_COUNTIES.has(c.county),
  );

  const winMissingData = win
    ? win.counties.filter((r) => r.missingData && r.missingData.length > 0).length
    : 0;

  const md = `# Victory Map — Sprint 0 Leadership Review

**Status:** Draft classification pending campaign leadership review — **not final**  
**Generated:** ${new Date().toISOString().slice(0, 10)}  
**Data file:** \`data/strategy-doctrine/victory-map-v1.json\`  
**Doctrine:** [\`VICTORY_OS_DOCTRINE.md\`](./VICTORY_OS_DOCTRINE.md)  
**Assumptions:** [\`VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md\`](./VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md)

> **Sprint 0 scope:** Classification only. No deployment recommendations. No Decision Engine. No dashboards.

---

## Statewide planning context (not a forecast)

| Metric | Value |
|--------|------:|
| Working target with cushion | ${file.statewide.workingTargetWithCushion.toLocaleString()} |
| Statewide vote gap (planning) | ${file.statewide.statewideVoteGap.toLocaleString()} |
| Counties classified | ${dims.total} / 75 |
| Leadership overrides applied | ${dims.leadershipOverrides} |
| All \`leadershipStatus\` | \`draft\` |

---

## Dimension summary

| Electoral importance | Count |
|----------------------|------:|
| Critical | ${dims.electoral.critical} |
| Important | ${dims.electoral.important} |
| Helpful | ${dims.electoral.helpful} |
| Maintenance | ${dims.electoral.maintenance} |

| Opportunity | Count |
|-------------|------:|
| High | ${dims.opportunity.high} |
| Medium | ${dims.opportunity.medium} |
| Low | ${dims.opportunity.low} |

| Organizational readiness | Count |
|--------------------------|------:|
| Strong | ${dims.readiness.strong} |
| Moderate | ${dims.readiness.moderate} |
| Weak | ${dims.readiness.weak} |

---

## Critical counties (${dims.electoral.critical})

Doctrine must-win set: Pulaski, Washington, Benton, Faulkner, Saline, Craighead — plus heuristic critical from win-target percentiles.

${listBy(counties, (c) => c.electoralImportance === "critical") || "_None_"}

### Heuristic critical (not in doctrine must-win set) — **needs leadership review**

${heuristicCritical.map((c) => `- **${c.county}** — ${c.draftReason?.split(".")[1]?.trim() ?? "win-target percentile"}`).join("\n") || "_None beyond doctrine set_"}

---

## Important counties (${dims.electoral.important})

${listBy(counties, (c) => c.electoralImportance === "important") || "_None_"}

---

## Helpful counties (${dims.electoral.helpful})

${listBy(counties, (c) => c.electoralImportance === "helpful") || "_None_"}

---

## Maintenance counties (${dims.electoral.maintenance})

${listBy(counties, (c) => c.electoralImportance === "maintenance") || "_None_"}

---

## High-opportunity counties (${highOpp.length})

${listBy(counties, (c) => c.opportunityLevel === "high") || "_None_"}

---

## Weak-readiness counties (${weakReady.length})

Default when county-workbench KPI absent. **Needs field validation before locking readiness.**

${listBy(counties, (c) => c.organizationalReadiness === "weak") || "_None_"}

---

## Leadership override exemplars (${overrideCounties.length})

${overrideCounties.map((c) => `- **${c.county}** — ${c.notes ?? c.draftReason?.slice(0, 120) ?? ""}`).join("\n") || "_None_"}

---

## Counties needing leadership review (priority)

1. All 75 counties (\`leadershipStatus: draft\`)
2. Heuristic **critical** counties outside doctrine must-win set (${heuristicCritical.length})
3. Counties with win-target \`missingData\` flags (${winMissingData} counties in scenario file)
4. Readiness scores defaulting to **weak** without KPI (${weakReady.length} counties)

---

## Missing / weak data

| Issue | Count |
|-------|------:|
| Counties without \`countyWinContribution\` in map | ${missingWinRows.length} |
| Win-target rows with \`missingData\` arrays | ${winMissingData} |
| KPI-driven readiness (strong/moderate) | ${counties.filter((c) => c.sourceBasis?.includes("county-workbench-kpi")).length} |

Common win-target gaps: \`registration_goal\`, \`registered_voters_turnout_headroom\`, \`county_facts\` — replace with official SOS / county data when ingested.

---

## Sprint 0 exit checklist (leadership)

- [ ] Review critical county list — confirm doctrine must-win + heuristic additions
- [ ] Review high-opportunity counties — align with growth strategy
- [ ] Validate readiness labels with field directors (most default weak)
- [ ] Sign [\`VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md\`](./VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md)
- [ ] Set \`leadershipStatus\` → \`locked\` per county after sign-off
- [ ] **Do not** start Decision Engine until map is locked

---

## Regenerate

\`\`\`bash
npm run victory:map:seed
npm run victory:map:review
npm run victory:map:verify
\`\`\`
`;

  writeFileSync(OUT, md, "utf8");
  console.log(`Wrote ${OUT}`);
}

main();
