import fs from "node:fs";
import path from "node:path";
import {
  CAMPAIGN_STRATEGIC_DOCTRINE_REGISTRY_REL,
  computeDoctrineConsistencySignals,
  computeStrategicAlignment,
  loadCampaignStrategicDoctrineRegistry,
  resolveAiSuggestionDoctrineContext,
  resolveNarrativeDoctrineAlignment,
  summarizeStrategicAlignmentRisk,
} from "@/lib/intelligence/campaignStrategicAlignment";
import { CAMPAIGN_STRATEGIC_ALIGNMENT_SIGNALS } from "@/lib/intelligence/types/campaignStrategicAlignment";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerAiSuggestionSandbox } from "@/lib/opposition/kimHammerSuggestionSandbox";
import { generateKimHammerLiveSuggestionCandidates } from "@/lib/opposition/kimHammerSuggestionSandbox";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "src/lib/intelligence/campaignStrategicAlignment.ts",
  "src/lib/intelligence/types/campaignStrategicAlignment.ts",
  "src/app/admin/(board)/intelligence/strategy-alignment/page.tsx",
  "src/app/admin/(board)/intelligence/strategy-alignment/StrategyAlignmentDashboard.tsx",
  CAMPAIGN_STRATEGIC_DOCTRINE_REGISTRY_REL,
  "docs/intelligence/CAMPAIGN_INTELLIGENCE_SYNCHRONIZATION_PLAN.md",
];

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing SDI-1 artifact: ${relPath}`);
  }

  const registry = loadCampaignStrategicDoctrineRegistry();
  assert(registry.doctrines.length >= 18, `Expected at least 18 doctrine entries; got ${registry.doctrines.length}.`);

  for (const doctrine of registry.doctrines) {
    assert(doctrine.doctrineId.length > 0, "Every doctrine must have doctrineId.");
    assert(fs.existsSync(path.join(process.cwd(), doctrine.sourcePath)), `Missing source for ${doctrine.doctrineId}: ${doctrine.sourcePath}`);
    assert(doctrine.corePrinciples.length > 0, `${doctrine.doctrineId} must list core principles.`);
    assert(doctrine.reviewStatus.length > 0, `${doctrine.doctrineId} must include reviewStatus.`);
  }

  const dashboardSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
    ),
    "utf8",
  );
  assert(dashboardSource.includes("/strategy-alignment"), "Evidence Command must link to strategy alignment.");
  assert(dashboardSource.includes("Strategic doctrine alignment"), "Evidence Command must render doctrine summary.");

  const sandboxBrowserSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/admin/(board)/intelligence/kim-hammer/KimHammerAiSuggestionSandboxBrowser.tsx",
    ),
    "utf8",
  );
  assert(
    sandboxBrowserSource.includes("Doctrine alignment"),
    "AI suggestion sandbox must render doctrine alignment warnings.",
  );

  const index = computeStrategicAlignment();
  assert(index.narrativeCount >= 8, "SDI-1 must analyze at least 8 governed narratives.");
  assert(index.doctrineCount === registry.doctrines.length, "Alignment index doctrine count must match registry.");

  for (const signal of CAMPAIGN_STRATEGIC_ALIGNMENT_SIGNALS) {
    assert(typeof index.signalCounts[signal] === "number", `Missing signal count for ${signal}.`);
  }

  const countyBurden = resolveNarrativeDoctrineAlignment("kh0b-county-administration-burden");
  assert(countyBurden, "County administration burden narrative must resolve doctrine alignment.");
  assert(countyBurden.signal.length > 0, "Alignment signals must explain WHY.");
  assert(
    countyBurden.alignmentSignal === "STRATEGICALLY_TENSE" ||
      countyBurden.alignmentSignal === "STRATEGICALLY_FRAGILE" ||
      countyBurden.matchedDoctrineIds.length >= 2,
    `County burden should reflect doctrine tension or multi-doctrine linkage; got ${countyBurden.alignmentSignal}.`,
  );
  assert(
    countyBurden.signal.includes("county") ||
      countyBurden.signal.includes("doctrine") ||
      countyBurden.signal.includes("modernization-forward"),
    "County burden alignment signal must reference doctrine framing context.",
  );

  const debateIntegrity = resolveNarrativeDoctrineAlignment("debate-frame-election-integrity");
  assert(debateIntegrity, "Debate election integrity frame must resolve.");
  assert(
    debateIntegrity.alignmentSignal === "STRATEGICALLY_ALIGNED" ||
      debateIntegrity.alignmentSignal === "STRATEGICALLY_PRIORITY",
    `Election integrity debate frame should align with core doctrine; got ${debateIntegrity.alignmentSignal}.`,
  );

  const consistency = computeDoctrineConsistencySignals();
  assert(consistency.length >= 1, "Doctrine consistency signals must compute.");

  const commandSummary = summarizeStrategicAlignmentRisk();
  assert(commandSummary.doctrineCount >= 18, "Evidence command strategic summary must expose doctrine count.");

  const sandbox = loadKimHammerAiSuggestionSandbox();
  const firstWithNarrative = sandbox.suggestions.find((row) => row.relatedNarrativeIds?.length);
  if (firstWithNarrative) {
    const context = resolveAiSuggestionDoctrineContext(firstWithNarrative);
    assert(context.nonAuthoritative === true, "AI doctrine context must remain non-authoritative.");
  }

  const liveCandidates = generateKimHammerLiveSuggestionCandidates();
  assert(
    liveCandidates.some((row) => row.id === "live-doctrine-county-burden-tension"),
    "Live suggestion candidates must include doctrine tension routing for county burden narrative.",
  );

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `SDI-1 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );

  console.log("Campaign strategic alignment (SDI-1) checks passed.");
  console.log(
    JSON.stringify(
      {
        doctrineCount: index.doctrineCount,
        narrativeCount: index.narrativeCount,
        signalCounts: index.signalCounts,
        countyBurdenSignal: countyBurden.alignmentSignal,
        countyBurdenText: countyBurden.signal.slice(0, 140),
        debateIntegritySignal: debateIntegrity.alignmentSignal,
        exportReadyClaims: evidenceIndex.metrics.exportReadyClaims,
        route: "/admin/intelligence/strategy-alignment",
      },
      null,
      2,
    ),
  );
}

main();
