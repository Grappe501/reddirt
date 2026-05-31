import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { summarizeCountyFactCoverage, findMissingFactsByCounty } from "./countyFactStore";
import { GLOBAL_REQUIRED_FACT_TYPES, identifyMissingSourceTypes, summarizeSourceCoverage } from "./countySourceCatalog";
import { summarizeCrossTableCompleteness } from "./countyCrossTableBuilder";
import { summarizeCompiledProfileReadiness } from "./countyProfileCompiler";
import { summarizeCountyBriefFactory } from "./countyBriefFactory";
import type { CountyIngestionJob } from "./countyFactoryTypes";
import { COUNTY_FACTORY_GOVERNANCE } from "./countyFactoryTypes";
import { COUNTY_FACTORY_PATHS, countyFactoryAbs } from "./countyFactoryPaths";

export type CountyBuilderAgentRun = {
  runId: string;
  generatedAt: string;
  governance: typeof COUNTY_FACTORY_GOVERNANCE;
  globalDataPullRecommendations: string[];
  countySpecificPullRecommendations: Array<{ countySlug: string; countyName: string; recommendations: string[] }>;
  countyReadinessRankings: Array<{ countySlug: string; countyName: string; score: number; gapCount: number }>;
  debateUsefulFacts: string[];
  messageUsefulFacts: string[];
  travelUsefulFacts: string[];
  eventRecruitmentOpportunities: string[];
  crossTableMissingness: string[];
  buildQueue: CountyIngestionJob[];
  topGapCounties: Array<{ countySlug: string; gapCount: number }>;
};

export function recommendNextGlobalDataPulls(): string[] {
  const sourceCoverage = summarizeSourceCoverage();
  const missingTypes = identifyMissingSourceTypes([...GLOBAL_REQUIRED_FACT_TYPES]);
  return [
    ...sourceCoverage.deferredIds.map((id) => `Enable/configure source: ${id}`),
    ...missingTypes.map((t) => `Add source coverage for fact type: ${t}`),
    "Pass C1: Census/ACS all-county pull (CENSUS_API_KEY)",
    "Pass C2: SOS registration/election import (COUNTY_SOS_IMPORT_ENABLED=1)",
    "Pass C3: BLS/economic import (BLS_API_KEY)",
    "Pass C4–C8: education, health, local assets, media, validators",
  ].slice(0, 12);
}

export function recommendNextCountyDataPulls(countySlug: string): string[] {
  const gaps = findMissingFactsByCounty(countySlug, [...GLOBAL_REQUIRED_FACT_TYPES]);
  const reg = ARKANSAS_COUNTY_REGISTRY.find((c) => c.slug === countySlug);
  return gaps.slice(0, 8).map((g) => `${reg?.displayName ?? countySlug}: research ${g}`);
}

export function prioritizeCountiesForDataCompletion(limit = 15) {
  return ARKANSAS_COUNTY_REGISTRY.map((c) => ({
    countySlug: c.slug,
    countyName: c.displayName,
    gapCount: findMissingFactsByCounty(c.slug, [...GLOBAL_REQUIRED_FACT_TYPES]).length,
  }))
    .sort((a, b) => b.gapCount - a.gapCount)
    .slice(0, limit);
}

export function identifyFactsNeededForDebate(): string[] {
  return [
    "County election administration validators (human-reviewed)",
    "Local media landscape per county",
    "Verified voter registration context (not planning proxy)",
    "Opposition geographic overlays for debate counties",
  ];
}

export function identifyFactsNeededForTravel(): string[] {
  return ["Event opportunities / fairs / festivals", "Chamber and civic anchor contacts", "Travel corridor region clustering"];
}

export function identifyFactsNeededForField(): string[] {
  return ["Coalition contacts", "Field assets", "Local validators (churches, schools, hospitals)"];
}

export function generateCountyBuildQueue(): CountyIngestionJob[] {
  const now = new Date().toISOString();
  return [
    { jobId: "cbq-c1", adapterName: "census", countySlug: "ALL", status: "DEFERRED", reason: "Pass C1 — CENSUS_API_KEY", createdAt: now },
    { jobId: "cbq-c2", adapterName: "sosRegistration", countySlug: "ALL", status: "DEFERRED", reason: "Pass C2 — SOS import", createdAt: now },
    { jobId: "cbq-c3", adapterName: "bls", countySlug: "ALL", status: "DEFERRED", reason: "Pass C3 — BLS", createdAt: now },
    { jobId: "cbq-bridge", adapterName: "workbenchBridge", countySlug: "ALL", status: "PENDING", reason: "Run when COUNTY_WORKBENCH_ROOT set", createdAt: now },
  ];
}

export function runCountyBuilderAgent(repoRoot: string = process.cwd()): CountyBuilderAgentRun {
  const factCoverage = summarizeCountyFactCoverage(repoRoot);
  const profileRollup = summarizeCompiledProfileReadiness();
  const briefRollup = summarizeCountyBriefFactory();
  const tableRollup = summarizeCrossTableCompleteness(repoRoot);

  const countyRecs = prioritizeCountiesForDataCompletion(10).map((c) => ({
    countySlug: c.countySlug,
    countyName: c.countyName,
    recommendations: recommendNextCountyDataPulls(c.countySlug),
  }));

  const rankings = ARKANSAS_COUNTY_REGISTRY.map((c) => {
    const gaps = findMissingFactsByCounty(c.slug, [...GLOBAL_REQUIRED_FACT_TYPES]).length;
    const profileScore = profileRollup.lowestReadiness.find((x) => x.countySlug === c.slug)?.score ?? 20;
    return {
      countySlug: c.slug,
      countyName: c.displayName,
      score: profileScore,
      gapCount: gaps,
    };
  }).sort((a, b) => a.score - b.score);

  const run: CountyBuilderAgentRun = {
    runId: `cba-${Date.now().toString(36)}`,
    generatedAt: new Date().toISOString(),
    governance: COUNTY_FACTORY_GOVERNANCE,
    globalDataPullRecommendations: recommendNextGlobalDataPulls(),
    countySpecificPullRecommendations: countyRecs,
    countyReadinessRankings: rankings,
    debateUsefulFacts: identifyFactsNeededForDebate(),
    messageUsefulFacts: ["County message themes require Pass C9 + human review"],
    travelUsefulFacts: identifyFactsNeededForTravel(),
    eventRecruitmentOpportunities: identifyFactsNeededForField(),
    crossTableMissingness: tableRollup.tables.filter((t) => t.completenessScore < 20).map((t) => `${t.tableType}: ${t.completenessScore}% complete`),
    buildQueue: generateCountyBuildQueue(),
    topGapCounties: prioritizeCountiesForDataCompletion(10).map((c) => ({
      countySlug: c.countySlug,
      gapCount: c.gapCount,
    })),
  };

  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.agentRun, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(run, null, 2)}\n`, "utf8");

  const docPath = path.join(repoRoot, "docs/county-workbench/COUNTY_BUILDER_AGENT_RECOMMENDATIONS.md");
  mkdirSync(path.dirname(docPath), { recursive: true });
  writeFileSync(
    docPath,
    `# County Builder Agent Recommendations

Generated: ${run.generatedAt}

## Global data pulls
${run.globalDataPullRecommendations.map((l) => `- ${l}`).join("\n")}

## Top gap counties
${run.topGapCounties.map((c) => `- ${c.countySlug}: ${c.gapCount} missing fact types`).join("\n")}

## Cross-table missingness
${run.crossTableMissingness.map((l) => `- ${l}`).join("\n")}

Facts: ${factCoverage.totalFacts} · Profiles avg: ${profileRollup.avgReadiness} · Briefs: ${briefRollup.countyCount}/75
`,
    "utf8",
  );

  return run;
}

export function buildCountyFactoryDashboardRollup(repoRoot: string = process.cwd()) {
  const facts = summarizeCountyFactCoverage(repoRoot);
  const sources = summarizeSourceCoverage(repoRoot);
  const profiles = summarizeCompiledProfileReadiness();
  const briefs = summarizeCountyBriefFactory();
  const agent = existsSync(countyFactoryAbs(COUNTY_FACTORY_PATHS.agentRun, repoRoot))
    ? JSON.parse(readFileSync(countyFactoryAbs(COUNTY_FACTORY_PATHS.agentRun, repoRoot), "utf8"))
    : null;
  return {
    facts,
    sources,
    profiles,
    briefs,
    agentRun: agent,
    agentRecommendations: recommendNextGlobalDataPulls().slice(0, 5),
    governance: COUNTY_FACTORY_GOVERNANCE,
  };
}
