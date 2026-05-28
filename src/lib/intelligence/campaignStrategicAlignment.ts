import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadGeographicNarrativeIndex } from "@/lib/opposition/kimHammerGeographicNarrativeState";
import { loadKimHammerNarrativeStateIndex, resolveKimHammerNarrativeState } from "@/lib/opposition/kimHammerNarrativeState";
import { computeNarrativeFatigue } from "@/lib/opposition/kimHammerNarrativeUsageAnalytics";
import { loadKimHammerAiSuggestionSandbox } from "@/lib/opposition/kimHammerSuggestionSandbox";
import type { KimHammerAiSuggestion } from "@/lib/opposition/types/kimHammerAiSuggestion";
import type {
  CampaignAiSuggestionDoctrineContext,
  CampaignDoctrineConsistencySignal,
  CampaignDoctrineRegistryEntry,
  CampaignNarrativeDoctrineAlignment,
  CampaignStrategicAlignmentIndex,
  CampaignStrategicAlignmentSignal,
  CampaignStrategicDoctrineRegistryFile,
} from "@/lib/intelligence/types/campaignStrategicAlignment";

export const CAMPAIGN_STRATEGIC_DOCTRINE_REGISTRY_REL =
  "data/strategy-doctrine/campaign-strategic-doctrine-registry.json";

const NARRATIVE_DOCTRINE_MAP: Record<string, string[]> = {
  "kh0b-2021-integrity-foundation": [
    "doctrine-steve-strategy",
    "doctrine-sos-keeper-records",
    "doctrine-opponent-contrast-matrix",
  ],
  "kh0b-county-administration-burden": [
    "doctrine-steve-strategy",
    "doctrine-grassroots-principles",
    "doctrine-segmented-targeting",
    "doctrine-county-kpi-model",
  ],
  "kh0b-legislative-chronology": ["doctrine-steve-strategy", "doctrine-kim-contrast-debate"],
  "debate-frame-election-integrity": [
    "doctrine-steve-strategy",
    "doctrine-sos-keeper-records",
    "doctrine-kim-contrast-debate",
    "doctrine-opponent-contrast-matrix",
  ],
  "debate-frame-management-readiness": [
    "doctrine-kim-contrast-debate",
    "doctrine-opponent-contrast-matrix",
    "doctrine-steve-strategy",
  ],
  "debate-frame-debate-questions": [
    "doctrine-sos-keeper-records",
    "doctrine-kim-contrast-debate",
  ],
  SB486: ["doctrine-opponent-contrast-matrix", "doctrine-steve-strategy"],
  SB487: [
    "doctrine-grassroots-principles",
    "doctrine-segmented-targeting",
    "doctrine-steve-strategy",
    "doctrine-county-kpi-model",
  ],
};

const PRIORITY_DOCTRINE_IDS = new Set([
  "doctrine-steve-strategy",
  "doctrine-steve-strategy-json",
  "doctrine-sos-keeper-records",
  "doctrine-grassroots-principles",
  "doctrine-opponent-contrast-matrix",
]);

function absPath(repoRoot: string, relPath: string): string {
  return path.join(repoRoot, relPath);
}

export function loadCampaignStrategicDoctrineRegistry(
  repoRoot: string = process.cwd(),
): CampaignStrategicDoctrineRegistryFile {
  if (!existsSync(absPath(repoRoot, CAMPAIGN_STRATEGIC_DOCTRINE_REGISTRY_REL))) {
    return {
      generatedAt: new Date().toISOString(),
      registryVersion: "1.0",
      purpose: "Strategic doctrine registry not yet initialized.",
      discoveryPhase: "SDI-1",
      doctrines: [],
    };
  }
  return JSON.parse(
    readFileSync(absPath(repoRoot, CAMPAIGN_STRATEGIC_DOCTRINE_REGISTRY_REL), "utf8"),
  ) as CampaignStrategicDoctrineRegistryFile;
}

function resolveDoctrineLinks(
  narrativeId: string,
  registry: CampaignStrategicDoctrineRegistryFile,
): CampaignDoctrineRegistryEntry[] {
  const ids = new Set<string>([
    ...(NARRATIVE_DOCTRINE_MAP[narrativeId] ?? []),
    ...registry.doctrines
      .filter((row) => row.linkedNarrativeIds?.includes(narrativeId))
      .map((row) => row.doctrineId),
  ]);
  return registry.doctrines.filter((row) => ids.has(row.doctrineId));
}

function narrativeHaystack(narrativeId: string, repoRoot: string): string {
  const narrative = resolveKimHammerNarrativeState(narrativeId, repoRoot);
  if (!narrative) return narrativeId;
  return [
    narrativeId,
    narrative.title,
    narrative.description,
    narrative.narrativeClass,
    ...narrative.blockers,
  ]
    .join(" ")
    .toLowerCase();
}

function buildAlignmentSignalText(
  narrativeTitle: string,
  signal: CampaignStrategicAlignmentSignal,
  tensions: string[],
  matchedTitles: string[],
): string {
  if (signal === "STRATEGICALLY_CONTRADICTORY") {
    return `${narrativeTitle} conflicts with campaign philosophy — ${tensions[0] ?? "doctrine guardrail violation"}.`;
  }
  if (signal === "STRATEGICALLY_TENSE") {
    return `${narrativeTitle} operationally usable but partially tensions with governing doctrine — ${tensions[0] ?? "verify framing before local deployment"}.`;
  }
  if (signal === "STRATEGICALLY_FRAGILE") {
    return `${narrativeTitle} strategic alignment fragile — ${tensions[0] ?? "doctrine dependencies unresolved"}.`;
  }
  if (signal === "STRATEGICALLY_UNDERDEFINED") {
    return `${narrativeTitle} lacks complete doctrine mapping — expand registry links before strategic promotion.`;
  }
  if (signal === "STRATEGICALLY_PRIORITY") {
    return `${narrativeTitle} aligns with core campaign doctrine (${matchedTitles.slice(0, 2).join(", ")}) — priority strategic frame when operationally ready.`;
  }
  if (signal === "STRATEGICALLY_ALIGNED") {
    return `${narrativeTitle} aligns with campaign doctrine (${matchedTitles.slice(0, 2).join(", ") || "governed frames"}).`;
  }
  return `${narrativeTitle}: ${signal}`;
}

function resolveAlignmentSignal(
  score: number,
  tensions: string[],
  matchedDoctrine: CampaignDoctrineRegistryEntry[],
  narrativeId: string,
  readinessBand: string,
): CampaignStrategicAlignmentSignal {
  const haystack = narrativeId.toLowerCase();

  if (tensions.some((row) => row.includes("CONTRADICTS"))) {
    return "STRATEGICALLY_CONTRADICTORY";
  }

  if (matchedDoctrine.length === 0) {
    return "STRATEGICALLY_UNDERDEFINED";
  }

  const isPriorityDoctrine =
    matchedDoctrine.some((row) => PRIORITY_DOCTRINE_IDS.has(row.doctrineId)) &&
    (readinessBand === "STRONG" || readinessBand === "MODERATE") &&
    tensions.length === 0;

  if (isPriorityDoctrine && (haystack.includes("debate-frame-election") || haystack.includes("keeper"))) {
    return "STRATEGICALLY_PRIORITY";
  }

  if (tensions.length >= 2 || (readinessBand === "BLOCKED" && tensions.length >= 1)) {
    return "STRATEGICALLY_FRAGILE";
  }

  if (tensions.length === 1 && readinessBand !== "STRONG") {
    return "STRATEGICALLY_TENSE";
  }

  if (score >= 0.8 && tensions.length === 0) {
    return matchedDoctrine.some((row) => PRIORITY_DOCTRINE_IDS.has(row.doctrineId))
      ? "STRATEGICALLY_PRIORITY"
      : "STRATEGICALLY_ALIGNED";
  }

  if (score >= 0.65) return "STRATEGICALLY_ALIGNED";
  if (score >= 0.45) return "STRATEGICALLY_TENSE";
  return "STRATEGICALLY_FRAGILE";
}

export function resolveNarrativeDoctrineAlignment(
  narrativeId: string,
  repoRoot: string = process.cwd(),
): CampaignNarrativeDoctrineAlignment | undefined {
  const narrative = resolveKimHammerNarrativeState(narrativeId, repoRoot);
  if (!narrative) return undefined;

  const registry = loadCampaignStrategicDoctrineRegistry(repoRoot);
  const matchedDoctrine = resolveDoctrineLinks(narrativeId, registry);
  const haystack = narrativeHaystack(narrativeId, repoRoot);
  const geographic = loadGeographicNarrativeIndex(repoRoot);
  const fatigue = computeNarrativeFatigue(narrativeId, repoRoot);

  const geoCells = geographic.counties.flatMap((county) =>
    county.narrativeStates.filter((cell) => cell.narrativeId === narrativeId),
  );
  const dominantGeo =
    geoCells.sort((a, b) => a.geographicScore - b.geographicScore)[0]?.geographicSignal ?? null;

  let score = 0.55;
  const tensions: string[] = [];
  const tensionDoctrineIds: string[] = [];

  if (matchedDoctrine.length === 0) {
    score = 0.35;
  } else {
    score += Math.min(0.25, matchedDoctrine.length * 0.05);
  }

  for (const doctrine of matchedDoctrine) {
    if (doctrine.alignmentSensitivity === "CRITICAL") score += 0.05;
    if (PRIORITY_DOCTRINE_IDS.has(doctrine.doctrineId)) score += 0.05;

    for (const risk of doctrine.contradictionRisks) {
      const riskLower = risk.toLowerCase();
      if (
        riskLower.includes("microtarget") &&
        narrativeId.includes("county-administration-burden")
      ) {
        tensions.push(
          `County burden narrative operationally strong, but partially tensions with modernization-forward governing doctrine unless framed around county support and implementation readiness.`,
        );
        tensionDoctrineIds.push(doctrine.doctrineId);
      }
      if (
        riskLower.includes("polariz") &&
        (narrativeId.includes("county-administration-burden") ||
          narrativeId === "SB487" ||
          narrativeId === "SB486")
      ) {
        tensions.push(
          `Partial tension with ${doctrine.title}: avoid polarizing cultural-war SOS framing — center process clarity and county support.`,
        );
        tensionDoctrineIds.push(doctrine.doctrineId);
      }
      if (riskLower.includes("unsourced") && narrative.blockers.some((row) => row.includes("NEEDS_REVIEW"))) {
        tensions.push(`CONTRADICTS ${doctrine.title}: unresolved review gaps violate contrast fact-check discipline.`);
        tensionDoctrineIds.push(doctrine.doctrineId);
      }
      if (riskLower.includes("motive inference") && narrative.readinessBand === "WEAK") {
        tensions.push(`Fragile alignment with ${doctrine.title} while qualification evidence remains partial.`);
        tensionDoctrineIds.push(doctrine.doctrineId);
      }
    }
  }

  if (narrative.readinessBand === "BLOCKED") {
    score -= 0.15;
    tensions.push("Operational BLOCKED state weakens strategic deployability regardless of doctrine fit.");
  } else if (narrative.readinessBand === "WEAK") {
    score -= 0.08;
  } else if (narrative.readinessBand === "STRONG") {
    score += 0.1;
  }

  if (fatigue?.usageSignal === "USAGE_FRAGILE" || fatigue?.usageSignal === "USAGE_STALE") {
    score -= 0.06;
    tensions.push(`Export fatigue signal ${fatigue.usageSignal} — verify doctrine-safe reuse before deployment.`);
  }

  if (dominantGeo === "COUNTY_BLOCKED" || dominantGeo === "COUNTY_WEAK") {
    score -= 0.05;
  }

  score = Math.max(0, Math.min(1, Number(score.toFixed(2))));

  const alignmentSignal = resolveAlignmentSignal(
    score,
    tensions,
    matchedDoctrine,
    narrativeId,
    narrative.readinessBand,
  );

  const uniqueTensions = [...new Set(tensions)].sort((a, b) => {
    if (a.includes("modernization-forward")) return -1;
    if (b.includes("modernization-forward")) return 1;
    return 0;
  });
  const matchedIds = matchedDoctrine.map((row) => row.doctrineId);

  return {
    narrativeId,
    narrativeTitle: narrative.title,
    alignmentSignal,
    alignmentScore: score,
    signal: buildAlignmentSignalText(
      narrative.title,
      alignmentSignal,
      uniqueTensions,
      matchedDoctrine.map((row) => row.title),
    ),
    matchedDoctrineIds: matchedIds,
    tensionDoctrineIds: [...new Set(tensionDoctrineIds)],
    operationalReadinessBand: narrative.readinessBand,
    geographicDominantSignal: dominantGeo,
    usageSignal: fatigue?.usageSignal ?? null,
    blockers: [...narrative.blockers, ...uniqueTensions.slice(0, 2)],
    computedAt: new Date().toISOString(),
  };
}

export function computeDoctrineConsistencySignals(
  repoRoot: string = process.cwd(),
): CampaignDoctrineConsistencySignal[] {
  const registry = loadCampaignStrategicDoctrineRegistry(repoRoot);
  const narrativeIndex = loadKimHammerNarrativeStateIndex(repoRoot);
  const signals: CampaignDoctrineConsistencySignal[] = [];

  for (const doctrine of registry.doctrines) {
    const linked =
      doctrine.linkedNarrativeIds ??
      Object.entries(NARRATIVE_DOCTRINE_MAP)
        .filter(([, ids]) => ids.includes(doctrine.doctrineId))
        .map(([narrativeId]) => narrativeId);

    if (linked.length === 0) continue;

    const alignments = linked
      .map((narrativeId) => resolveNarrativeDoctrineAlignment(narrativeId, repoRoot))
      .filter((row): row is CampaignNarrativeDoctrineAlignment => Boolean(row));

    const tense = alignments.filter(
      (row) =>
        row.alignmentSignal === "STRATEGICALLY_TENSE" ||
        row.alignmentSignal === "STRATEGICALLY_FRAGILE" ||
        row.alignmentSignal === "STRATEGICALLY_CONTRADICTORY",
    );

    if (tense.length > 0) {
      signals.push({
        doctrineId: doctrine.doctrineId,
        doctrineTitle: doctrine.title,
        signal: `${tense.length} linked narrative(s) carry doctrine tension under ${doctrine.title}.`,
        severity: tense.some((row) => row.alignmentSignal === "STRATEGICALLY_CONTRADICTORY")
          ? "CRITICAL"
          : "WARNING",
        affectedNarrativeIds: tense.map((row) => row.narrativeId),
      });
    }
  }

  const undefinedNarratives = narrativeIndex.narratives.filter((row) => {
    const alignment = resolveNarrativeDoctrineAlignment(row.narrativeId, repoRoot);
    return alignment?.alignmentSignal === "STRATEGICALLY_UNDERDEFINED";
  });

  if (undefinedNarratives.length > 0) {
    signals.push({
      doctrineId: "registry-coverage",
      doctrineTitle: "Doctrine registry coverage",
      signal: `${undefinedNarratives.length} narrative(s) lack complete doctrine mapping in SDI-1 registry.`,
      severity: "INFO",
      affectedNarrativeIds: undefinedNarratives.map((row) => row.narrativeId),
    });
  }

  return signals;
}

export function resolveAiSuggestionDoctrineContext(
  suggestion: KimHammerAiSuggestion,
  repoRoot: string = process.cwd(),
): CampaignAiSuggestionDoctrineContext {
  const registry = loadCampaignStrategicDoctrineRegistry(repoRoot);
  const warnings: string[] = [];
  const matchedDoctrineIds: string[] = [];
  let doctrineSignal: CampaignStrategicAlignmentSignal | "NONE" = "NONE";

  const narrativeIds = suggestion.relatedNarrativeIds ?? [];
  for (const narrativeId of narrativeIds) {
    const alignment = resolveNarrativeDoctrineAlignment(narrativeId, repoRoot);
    if (!alignment) continue;

    if (
      alignment.alignmentSignal === "STRATEGICALLY_TENSE" ||
      alignment.alignmentSignal === "STRATEGICALLY_FRAGILE" ||
      alignment.alignmentSignal === "STRATEGICALLY_CONTRADICTORY"
    ) {
      doctrineSignal = alignment.alignmentSignal;
      warnings.push(`Doctrine alignment: ${alignment.signal}`);
      matchedDoctrineIds.push(...alignment.matchedDoctrineIds);
    }
  }

  const bodyLower = `${suggestion.title} ${suggestion.body}`.toLowerCase();
  const steveDoctrine = registry.doctrines.find((row) => row.doctrineId === "doctrine-steve-strategy-json");
  if (steveDoctrine) {
    for (const blocked of ["target individual voters", "automate outreach", "publish final strategy"]) {
      if (bodyLower.includes(blocked.split(" ")[0]) && bodyLower.includes("voter")) {
        warnings.push(`Strategic guardrail: Steve doctrine blocks "${blocked}" — suggestion remains non-authoritative.`);
        doctrineSignal = "STRATEGICALLY_CONTRADICTORY";
        matchedDoctrineIds.push(steveDoctrine.doctrineId);
      }
    }
  }

  if (suggestion.suggestionType === "DEBATE_PREP") {
    matchedDoctrineIds.push("doctrine-kim-contrast-debate", "doctrine-opponent-contrast-matrix");
    warnings.push(
      "Debate prep suggestions must pass export-ready claim filter and contrast fact-check matrix before any external use.",
    );
    if (doctrineSignal === "NONE") doctrineSignal = "STRATEGICALLY_ALIGNED";
  }

  return {
    suggestionId: suggestion.id,
    doctrineSignal,
    warnings: [...new Set(warnings)],
    matchedDoctrineIds: [...new Set(matchedDoctrineIds)],
    nonAuthoritative: true,
  };
}

export function computeStrategicAlignment(
  repoRoot: string = process.cwd(),
): CampaignStrategicAlignmentIndex {
  const registry = loadCampaignStrategicDoctrineRegistry(repoRoot);
  const narrativeIndex = loadKimHammerNarrativeStateIndex(repoRoot);
  const sandbox = loadKimHammerAiSuggestionSandbox(repoRoot);

  const alignments = narrativeIndex.narratives
    .map((row) => resolveNarrativeDoctrineAlignment(row.narrativeId, repoRoot))
    .filter((row): row is CampaignNarrativeDoctrineAlignment => Boolean(row))
    .sort((a, b) => a.alignmentScore - b.alignmentScore);

  const signalCounts: Record<CampaignStrategicAlignmentSignal, number> = {
    STRATEGICALLY_ALIGNED: 0,
    STRATEGICALLY_TENSE: 0,
    STRATEGICALLY_FRAGILE: 0,
    STRATEGICALLY_CONTRADICTORY: 0,
    STRATEGICALLY_UNDERDEFINED: 0,
    STRATEGICALLY_PRIORITY: 0,
  };

  for (const row of alignments) {
    signalCounts[row.alignmentSignal] += 1;
  }

  const tensionPriority: CampaignStrategicAlignmentSignal[] = [
    "STRATEGICALLY_CONTRADICTORY",
    "STRATEGICALLY_FRAGILE",
    "STRATEGICALLY_TENSE",
    "STRATEGICALLY_UNDERDEFINED",
    "STRATEGICALLY_PRIORITY",
    "STRATEGICALLY_ALIGNED",
  ];

  const topStrategicTensions = alignments
    .filter(
      (row) =>
        row.alignmentSignal !== "STRATEGICALLY_ALIGNED" &&
        row.alignmentSignal !== "STRATEGICALLY_PRIORITY",
    )
    .sort(
      (a, b) =>
        tensionPriority.indexOf(a.alignmentSignal) - tensionPriority.indexOf(b.alignmentSignal),
    )
    .slice(0, 5)
    .map((row) => ({
      narrativeId: row.narrativeId,
      narrativeTitle: row.narrativeTitle,
      signal: row.signal,
    }));

  const priorityDoctrineAreas = registry.doctrines
    .filter((row) => PRIORITY_DOCTRINE_IDS.has(row.doctrineId) || row.synchronizationPriority === "P1_LIVE")
    .slice(0, 8)
    .map((row) => ({
      doctrineId: row.doctrineId,
      title: row.title,
      category: row.category,
    }));

  const aiSuggestionAlignmentWarnings = sandbox.suggestions
    .map((suggestion) => resolveAiSuggestionDoctrineContext(suggestion, repoRoot))
    .filter((row) => row.warnings.length > 0)
    .slice(0, 8)
    .map((row) => ({
      suggestionId: row.suggestionId,
      title: sandbox.suggestions.find((s) => s.id === row.suggestionId)?.title ?? row.suggestionId,
      warning: row.warnings[0] ?? "Doctrine review recommended.",
    }));

  return {
    generatedAt: new Date().toISOString(),
    doctrineCount: registry.doctrines.length,
    narrativeCount: alignments.length,
    signalCounts,
    alignments,
    consistencySignals: computeDoctrineConsistencySignals(repoRoot),
    topStrategicTensions,
    priorityDoctrineAreas,
    aiSuggestionAlignmentWarnings,
  };
}

export function summarizeStrategicAlignmentRisk(
  repoRoot?: string,
): {
  doctrineCount: number;
  tenseCount: number;
  fragileCount: number;
  priorityCount: number;
  topStrategicTensions: CampaignStrategicAlignmentIndex["topStrategicTensions"];
  philosophyAlerts: CampaignDoctrineConsistencySignal[];
  priorityDoctrineAreas: CampaignStrategicAlignmentIndex["priorityDoctrineAreas"];
} {
  const index = computeStrategicAlignment(repoRoot);
  return {
    doctrineCount: index.doctrineCount,
    tenseCount: index.signalCounts.STRATEGICALLY_TENSE,
    fragileCount:
      index.signalCounts.STRATEGICALLY_FRAGILE + index.signalCounts.STRATEGICALLY_CONTRADICTORY,
    priorityCount: index.signalCounts.STRATEGICALLY_PRIORITY + index.signalCounts.STRATEGICALLY_ALIGNED,
    topStrategicTensions: index.topStrategicTensions.slice(0, 3),
    philosophyAlerts: index.consistencySignals.filter((row) => row.severity !== "INFO").slice(0, 3),
    priorityDoctrineAreas: index.priorityDoctrineAreas.slice(0, 4),
  };
}

export function filterStrategicAlignments(
  index: CampaignStrategicAlignmentIndex,
  filters: {
    signal?: CampaignStrategicAlignmentSignal | "ALL";
    narrativeQuery?: string;
    doctrineQuery?: string;
  },
): CampaignNarrativeDoctrineAlignment[] {
  const narrativeQuery = filters.narrativeQuery?.trim().toLowerCase() ?? "";
  const doctrineQuery = filters.doctrineQuery?.trim().toLowerCase() ?? "";
  const signal = filters.signal ?? "ALL";

  return index.alignments.filter((row) => {
    if (signal !== "ALL" && row.alignmentSignal !== signal) return false;
    if (narrativeQuery) {
      const haystack = `${row.narrativeId} ${row.narrativeTitle} ${row.signal}`.toLowerCase();
      if (!haystack.includes(narrativeQuery)) return false;
    }
    if (doctrineQuery) {
      const haystack = row.matchedDoctrineIds.join(" ").toLowerCase();
      if (!haystack.includes(doctrineQuery)) return false;
    }
    return true;
  });
}
