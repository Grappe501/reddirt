import fs from "node:fs";
import path from "node:path";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  KIM_HAMMER_GEOGRAPHIC_NARRATIVE_OVERLAYS_REL,
  computeGeographicNarrativeState,
  loadGeographicNarrativeIndex,
  loadKimHammerGeographicNarrativeOverlays,
  resolveNarrativeCountyState,
  summarizeGeographicNarrativeForCommand,
} from "@/lib/opposition/kimHammerGeographicNarrativeState";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";
import { KIM_HAMMER_GEOGRAPHIC_READINESS_SIGNALS } from "@/lib/opposition/types/kimHammerGeographicNarrative";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_COUNTY_IDS = [
  "statewide",
  "pulaski",
  "washington",
  "benton",
  "sebastian",
  "craighead",
];

const REQUIRED_FILES = [
  "src/lib/opposition/kimHammerGeographicNarrativeState.ts",
  "src/lib/opposition/types/kimHammerGeographicNarrative.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerGeographicNarrativeDashboard.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/geographic-narrative-intelligence/page.tsx",
  KIM_HAMMER_GEOGRAPHIC_NARRATIVE_OVERLAYS_REL,
];

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-2 artifact: ${relPath}`);
  }

  const registrySource = fs.readFileSync(
    path.join(process.cwd(), "src/lib/opposition/kimHammerBriefingRegistry.ts"),
    "utf8",
  );
  assert(
    registrySource.includes('"geographic-narrative-intelligence"'),
    "Briefing registry must include geographic-narrative-intelligence module.",
  );

  const dashboardSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
    ),
    "utf8",
  );
  assert(
    dashboardSource.includes("/geographic-narrative-intelligence"),
    "Evidence Command must link to geographic narrative intelligence.",
  );
  assert(
    dashboardSource.includes("Geographic narrative intelligence"),
    "Evidence Command must surface geographic narrative summary section.",
  );

  const overlays = loadKimHammerGeographicNarrativeOverlays();
  assert(overlays.overlays.length === 6, `Expected 6 county overlays; got ${overlays.overlays.length}.`);

  for (const countyId of REQUIRED_COUNTY_IDS) {
    assert(
      overlays.overlays.some((row) => row.countyId === countyId),
      `Missing overlay for county: ${countyId}.`,
    );
  }

  for (const overlay of overlays.overlays) {
    assert(overlay.narrativeIds.length > 0, `${overlay.countyId} must reference governed narrative IDs.`);
    assert(overlay.strategicNotes.length > 0, `${overlay.countyId} must include strategic notes.`);
    assert(
      overlay.reviewStatus.length > 0,
      `${overlay.countyId} must include reviewStatus.`,
    );
  }

  const narrativeIndex = loadKimHammerNarrativeStateIndex();
  const index = loadGeographicNarrativeIndex();
  assert(index.countyCount === 6, `Geographic index must track 6 counties; got ${index.countyCount}.`);
  assert(index.narrativeCellCount > 0, "Geographic index must compute narrative cells.");

  for (const signal of KIM_HAMMER_GEOGRAPHIC_READINESS_SIGNALS) {
    assert(typeof index.signalCounts[signal] === "number", `Signal count missing for ${signal}.`);
  }

  const pulaski = index.counties.find((row) => row.countyId === "pulaski");
  assert(pulaski, "Pulaski County overlay must compute.");
  assert(
    pulaski.strategicNotes.includes("SB487") || pulaski.topRiskSignal.includes("SB487"),
    "Pulaski must reflect SB487 county-burden dependency in strategic notes or risk signal.",
  );

  const pulaskiSb487 = resolveNarrativeCountyState("SB487", "pulaski");
  assert(pulaskiSb487, "Pulaski × SB487 narrative cell must resolve.");
  assert(
    pulaskiSb487.geographicSignal === "COUNTY_BLOCKED" || pulaskiSb487.blockers.length > 0,
    "Pulaski SB487 cell must be blocked or carry blockers due to citation review gap.",
  );
  assert(pulaskiSb487.signal.length > 0, "Geographic signals must explain WHY.");

  const managementPulaski = resolveNarrativeCountyState("debate-frame-management-readiness", "pulaski");
  assert(managementPulaski, "Pulaski × management readiness must resolve.");
  assert(
    managementPulaski.blockers.some((row) => row.includes("kh3b-management-readiness-evidence") || row.includes("TASK")),
    "Management readiness in Pulaski must reflect in-progress retrieval task dependency.",
  );

  for (const county of index.counties) {
    const recomputed = computeGeographicNarrativeState(
      overlays.overlays.find((row) => row.countyId === county.countyId)!,
    );
    assert(recomputed.narrativeStates.length > 0, `${county.countyId} must expose narrative states.`);
    for (const cell of recomputed.narrativeStates) {
      assert(
        narrativeIndex.narratives.some((row) => row.narrativeId === cell.narrativeId),
        `${cell.narrativeId} must trace to NSI-1 narrative registry.`,
      );
      assert(cell.geographicScore >= 0 && cell.geographicScore <= 1, "Geographic score must be normalized 0-1.");
    }
  }

  const commandSummary = summarizeGeographicNarrativeForCommand();
  assert(commandSummary.countyCount === 6, "Evidence command geographic summary must track 6 counties.");
  assert(Array.isArray(commandSummary.topRisks), "Top geographic risks must be available for Evidence Command.");

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `NSI-2 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );

  console.log("Kim Hammer geographic narrative intelligence checks passed.");
  console.log(
    JSON.stringify(
      {
        countyCount: index.countyCount,
        narrativeCellCount: index.narrativeCellCount,
        signalCounts: index.signalCounts,
        pulaskiDominantSignal: pulaski.dominantSignal,
        pulaskiTopRisk: pulaski.topRiskSignal.slice(0, 120),
        exportReadyClaims: evidenceIndex.metrics.exportReadyClaims,
        route: "/admin/intelligence/kim-hammer/geographic-narrative-intelligence",
      },
      null,
      2,
    ),
  );
}

main();
