import { appendCountyFactoryAuditEvent } from "./countyFactStore";
import { loadCountySourceCatalog } from "./countySourceCatalog";
import { saveCountySourcesRegistry } from "./countyFactStore";
import { dryRunCountyIngestion, runCountyIngestionPlan, summarizeIngestionResults } from "./countyIngestionOrchestrator";
import { buildAllCountyCrossTables, summarizeCrossTableCompleteness } from "./countyCrossTableBuilder";
import { compileAllCountyProfiles, summarizeCompiledProfileReadiness } from "./countyProfileCompiler";
import { generateAllCountyBriefs, writeBriefFactoryRollupDoc } from "./countyBriefFactory";
import { runCountyBuilderAgent } from "./aiCountyBuilderAgent";
import { seedRegistryIdentityFacts } from "./countyFactStore";
import type { CountyFactoryRun } from "./countyFactoryTypes";

export async function runCountyFactoryAll(repoRoot: string = process.cwd()): Promise<CountyFactoryRun> {
  const runId = `cfr-${Date.now().toString(36)}`;
  const startedAt = new Date().toISOString();
  const warnings: string[] = [];

  appendCountyFactoryAuditEvent({ eventType: "FACTORY_RUN_START", countySlug: null, detail: runId }, repoRoot);

  seedRegistryIdentityFacts(repoRoot);
  const catalog = loadCountySourceCatalog(repoRoot);
  saveCountySourcesRegistry({ version: 1, generatedAt: new Date().toISOString(), sources: catalog.sources }, repoRoot);

  const dryResults = await dryRunCountyIngestion(repoRoot);
  const drySummary = summarizeIngestionResults(dryResults);
  if (drySummary.deferred > 0) {
    warnings.push(`${drySummary.deferred} ingestion jobs deferred (expected without API keys)`);
  }

  const ingestResults = await runCountyIngestionPlan(
    { adapters: ["workbenchBridge", "campaignNotes"], dryRun: false },
    repoRoot,
  );
  const ingestSummary = summarizeIngestionResults(ingestResults);

  buildAllCountyCrossTables(repoRoot);
  const profiles = compileAllCountyProfiles(repoRoot);
  const briefs = generateAllCountyBriefs(repoRoot);
  writeBriefFactoryRollupDoc(repoRoot);
  runCountyBuilderAgent(repoRoot);

  const profileRollup = summarizeCompiledProfileReadiness(profiles);
  const tableRollup = summarizeCrossTableCompleteness(repoRoot);

  const run: CountyFactoryRun = {
    runId,
    startedAt,
    completedAt: new Date().toISOString(),
    phases: [
      "seed_registry",
      "source_catalog",
      "dry_run",
      "ingestion",
      "cross_tables",
      "profiles",
      "briefs",
      "agent",
    ],
    countiesProcessed: profiles.length,
    factsTotal: ingestSummary.factsAdded + 75 * 3,
    profilesGenerated: profiles.length,
    briefsGenerated: briefs.length,
    warnings: [
      ...warnings,
      `Profiles: ${profileRollup.byStatus.SHELL} shell / ${profileRollup.byStatus.PARTIAL} partial / ${profileRollup.byStatus.COMPILED} compiled`,
      `Cross-table avg completeness: ${tableRollup.avgCompleteness}%`,
    ],
  };

  appendCountyFactoryAuditEvent(
    { eventType: "FACTORY_RUN_COMPLETE", countySlug: null, detail: JSON.stringify(run) },
    repoRoot,
  );

  return run;
}
