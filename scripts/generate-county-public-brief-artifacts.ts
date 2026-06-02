/**
 * Persist governed county public messaging briefs for all 75 counties.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  generateAllCountyBriefBundles,
  summarizeCountyPublicBriefReadiness,
} from "../src/lib/intelligence/briefs/countyPublicBriefGenerator";

function main() {
  const repoRoot = process.cwd();
  const bundles = generateAllCountyBriefBundles();
  const rollup = summarizeCountyPublicBriefReadiness(bundles);
  const dir = path.join(repoRoot, "data/intelligence/briefs/county");
  mkdirSync(dir, { recursive: true });

  for (const bundle of bundles) {
    const short = bundle.countySlug.replace(/-county$/, "");
    const file = path.join(dir, `${short}-public-messaging.json`);
    writeFileSync(file, `${JSON.stringify(bundle.publicMessagingBrief, null, 2)}\n`, "utf8");
  }

  const indexPath = path.join(dir, "_rollup.json");
  writeFileSync(
    indexPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        countyCount: bundles.length,
        rollup,
        governance: ["INTERNAL_DRAFT", "NON_PUBLISHABLE", "HUMAN_REVIEW_REQUIRED"],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const docLines = [
    "# County Public Brief Readiness",
    "",
    `**Generated:** ${new Date().toISOString().slice(0, 10)} (BURT public-brief-grade pass)`,
    "**Lane:** RedDirt/",
    "",
    "## Governance",
    "",
    "All county public messaging briefs are **INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED · NOT_PUBLIC_CONTENT**.",
    "No county brief may be used for public messaging until a human approves every claim, citation, inference, and wording.",
    "",
    "## Rollup",
    "",
    "| Tier | Count |",
    "|------|-------|",
    `| PUBLIC_BRIEF_READY | ${rollup.PUBLIC_BRIEF_READY} |`,
    `| INTERNAL_MESSAGE_SOURCE_ONLY | ${rollup.INTERNAL_MESSAGE_SOURCE_ONLY} |`,
    `| FIELD_PLANNING_ONLY | ${rollup.FIELD_PLANNING_ONLY} |`,
    `| SHELL_ONLY | ${rollup.SHELL_ONLY} |`,
    `| BLOCKED | ${rollup.BLOCKED} |`,
    "",
    "## Tier definitions",
    "",
    "| Tier | Meaning |",
    "|------|---------|",
    "| PUBLIC_BRIEF_READY | Evidence + canonical goal + human approval — audit expects 0 today |",
    "| INTERNAL_MESSAGE_SOURCE_ONLY | v2 dashboard, KH overlay, or full profile — internal messaging source only |",
    "| FIELD_PLANNING_ONLY | Full workbench profile without public messaging readiness |",
    "| SHELL_ONLY | Command scaffold only — dangerous for public county messaging |",
    "| BLOCKED | Governance or data blockers prevent even internal use |",
    "",
    "## County matrix",
    "",
    "| County | Public brief readiness | Confidence | Research gaps |",
    "|--------|---------------------|------------|---------------|",
    ...bundles.map((b) => {
      const gaps = b.publicMessagingBrief.researchGaps.length;
      return `| ${b.countyName} | ${b.publicBriefReadiness} | ${b.publicMessagingBrief.confidenceScore}/100 | ${gaps} |`;
    }),
    "",
    "## Artifacts",
    "",
    "- JSON briefs: `data/intelligence/briefs/county/{slug}-public-messaging.json`",
    "- Rollup index: `data/intelligence/briefs/county/_rollup.json`",
    "- Generator: `src/lib/intelligence/briefs/countyPublicBriefGenerator.ts`",
    "- 75-county matrix: `docs/intelligence/COUNTY_WORKBENCH_75_COUNTY_READINESS_MATRIX.md`",
    "",
  ];

  const docPath = path.join(repoRoot, "docs/intelligence/COUNTY_PUBLIC_BRIEF_READINESS.md");
  mkdirSync(path.dirname(docPath), { recursive: true });
  writeFileSync(docPath, `${docLines.join("\n")}\n`, "utf8");

  console.log(`Wrote ${bundles.length} county briefs to ${dir}`);
  console.log(`Wrote readiness doc to ${docPath}`);
  console.log("Rollup:", rollup);
}

main();
