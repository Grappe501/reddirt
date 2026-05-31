#!/usr/bin/env tsx
import { runCountyIngestionPlan, summarizeIngestionResults } from "../src/lib/county-workbench/factory/countyIngestionOrchestrator";
import { seedRegistryIdentityFacts } from "../src/lib/county-workbench/factory/countyFactStore";
seedRegistryIdentityFacts();
runCountyIngestionPlan({ adapters: ["workbenchBridge", "campaignNotes"], dryRun: false }).then((r) =>
  console.log(JSON.stringify(summarizeIngestionResults(r), null, 2)),
);
