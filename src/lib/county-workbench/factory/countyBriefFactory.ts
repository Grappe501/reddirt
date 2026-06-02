import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { compileCountyProfile, loadCompiledProfile } from "./countyProfileCompiler";
import type { CountyBriefCompiled } from "./countyFactoryTypes";
import { COUNTY_FACTORY_GOVERNANCE } from "./countyFactoryTypes";
import { COUNTY_FACTORY_PATHS, countyFactoryAbs } from "./countyFactoryPaths";

export function generateCountyBrief(countySlug: string, repoRoot: string = process.cwd()): CountyBriefCompiled {
  const profile = loadCompiledProfile(countySlug, repoRoot) ?? compileCountyProfile(countySlug, repoRoot);
  const verifiedFacts = [
    ...profile.demographicSnapshot,
    ...profile.voterSnapshot,
    ...profile.economicSnapshot,
  ].filter((f) => f.verificationStatus === "VERIFIED" || f.verificationStatus === "IMPORTED_UNVERIFIED");

  const brief: CountyBriefCompiled = {
    countySlug: profile.countySlug,
    countyName: profile.countyName,
    briefId: `cbf-${countySlug}`,
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    countySnapshot: [
      `${profile.countyName} (${profile.fips}) — ${profile.regionLabel}`,
      `Profile status: ${profile.profileStatus} · Readiness ${profile.readinessScore}/100`,
    ],
    whatWeKnow: verifiedFacts.slice(0, 6).map((f) => `[${f.verificationStatus}] ${f.factType}/${f.factKey}: ${String(f.value).slice(0, 80)}`),
    whatWeDoNotKnow: profile.knownGaps.slice(0, 8),
    strongestFacts: verifiedFacts
      .filter((f) => f.confidence >= 80)
      .slice(0, 5)
      .map((f) => `${f.factKey} (${f.sourceName})`),
    weakFacts: verifiedFacts
      .filter((f) => f.confidence < 50 || f.verificationStatus === "ESTIMATED")
      .slice(0, 5)
      .map((f) => `${f.factKey} — ${f.verificationStatus}`),
    sourceGaps: profile.knownGaps,
    localMessageAngles: profile.messageOpportunities.length
      ? profile.messageOpportunities.map((f) => `[INTERNAL] ${String(f.value).slice(0, 100)}`)
      : ["No message angles indexed — Pass C9 required"],
    debateRelevance: profile.profileStatus === "SHELL"
      ? [`${profile.countyName}: shell — limited debate utility until validators indexed`]
      : [`${profile.countyName}: review local election administration themes with citation`],
    travelEventRelevance: profile.eventOpportunities.length
      ? profile.eventOpportunities.map((f) => String(f.value).slice(0, 80))
      : profile.recommendedNextResearch.slice(0, 3),
    voterRegistrationRelevance: [
      "Canonical registration goal: read from admin CountyCampaignStats — never mutate via factory",
      ...(profile.voterSnapshot.length ? ["Voter snapshot facts present — human review before field use"] : ["No voter registration facts — Pass C2"]),
    ],
    coalitionRelevance: profile.localValidators.length
      ? profile.localValidators.map((f) => String(f.value).slice(0, 80))
      : ["Validators not indexed — Pass C8"],
    fieldPlanNextSteps: profile.recommendedNextResearch.slice(0, 5),
    researchTasks: profile.knownGaps.slice(0, 6).map((g) => `Close gap: ${g}`),
    claimCitationRequirements: [
      "All county claims require citation anchor before public adaptation",
      "Planning estimates labeled ESTIMATED — not verified facts",
      "INTERNAL_DRAFT only until human review",
    ],
    readinessScore: profile.readinessScore,
    generatedAt: new Date().toISOString(),
    governance: COUNTY_FACTORY_GOVERNANCE,
  };

  const abs = countyFactoryAbs(`${COUNTY_FACTORY_PATHS.briefsDir}/${countySlug}.json`, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(brief, null, 2)}\n`, "utf8");
  return brief;
}

export function generateAllCountyBriefs(repoRoot: string = process.cwd()): CountyBriefCompiled[] {
  const briefs = ARKANSAS_COUNTY_REGISTRY.map((c) => generateCountyBrief(c.slug, repoRoot));
  const rollup = {
    ...summarizeCountyBriefFactory(briefs),
    countyIndex: briefs.map((b) => ({
      countySlug: b.countySlug,
      countyName: b.countyName,
      readinessScore: b.readinessScore,
      briefGenerated: true,
      shellBrief: b.whatWeKnow.length <= 3,
    })),
  };
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.briefsRollup, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(rollup, null, 2)}\n`, "utf8");
  return briefs;
}

export type CountyBriefRollupSummary = {
  generatedAt: string;
  countyCount: number;
  all75: boolean;
  avgReadiness: number;
  shellBriefCount: number;
  debateUsefulCount: number;
  governance: typeof COUNTY_FACTORY_GOVERNANCE;
};

export type CountyBriefRollupFile = CountyBriefRollupSummary & {
  countyIndex?: Array<{
    countySlug: string;
    countyName: string;
    readinessScore: number;
    briefGenerated: boolean;
    shellBrief: boolean;
  }>;
};

export function loadBriefRollup(repoRoot: string = process.cwd()): CountyBriefRollupFile | null {
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.briefsRollup, repoRoot);
  if (!existsSync(abs)) return null;
  return JSON.parse(readFileSync(abs, "utf8")) as CountyBriefRollupFile;
}

export function loadCountyBrief(countySlug: string, repoRoot: string = process.cwd()): CountyBriefCompiled | null {
  const abs = countyFactoryAbs(`${COUNTY_FACTORY_PATHS.briefsDir}/${countySlug}.json`, repoRoot);
  if (!existsSync(abs)) return null;
  return JSON.parse(readFileSync(abs, "utf8")) as CountyBriefCompiled;
}

export function summarizeCountyBriefFactory(briefs?: CountyBriefCompiled[]): CountyBriefRollupSummary {
  if (briefs) {
    const shellCount = briefs.filter((b) => b.whatWeKnow.length <= 3).length;
    return {
      generatedAt: new Date().toISOString(),
      countyCount: briefs.length,
      all75: briefs.length >= 75,
      avgReadiness: Math.round(briefs.reduce((n, b) => n + b.readinessScore, 0) / Math.max(briefs.length, 1)),
      shellBriefCount: shellCount,
      debateUsefulCount: briefs.filter((b) => b.debateRelevance.some((d) => !d.includes("shell"))).length,
      governance: COUNTY_FACTORY_GOVERNANCE,
    };
  }

  const rollup = loadBriefRollup();
  if (rollup) {
    return {
      generatedAt: rollup.generatedAt,
      countyCount: rollup.countyCount,
      all75: rollup.all75,
      avgReadiness: rollup.avgReadiness,
      shellBriefCount: rollup.shellBriefCount,
      debateUsefulCount: rollup.debateUsefulCount,
      governance: rollup.governance,
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    countyCount: 0,
    all75: false,
    avgReadiness: 0,
    shellBriefCount: 0,
    debateUsefulCount: 0,
    governance: COUNTY_FACTORY_GOVERNANCE,
  };
}

export function writeBriefFactoryRollupDoc(repoRoot: string = process.cwd()): string {
  const rollup = summarizeCountyBriefFactory();
  const doc = `# County Brief Factory Rollup

Generated: ${rollup.generatedAt}

- Counties: ${rollup.countyCount}/75
- Avg readiness: ${rollup.avgReadiness}/100
- Shell briefs: ${rollup.shellBriefCount}
- Debate-useful: ${rollup.debateUsefulCount}

All briefs: INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED
`;
  const abs = path.join(repoRoot, "docs/county-workbench/COUNTY_BRIEF_FACTORY_ROLLUP.md");
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, doc, "utf8");
  return abs;
}
