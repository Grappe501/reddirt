#!/usr/bin/env tsx
import { dryRunCountyIngestion, summarizeIngestionResults } from "../src/lib/county-workbench/factory/countyIngestionOrchestrator";
import { seedRegistryIdentityFacts } from "../src/lib/county-workbench/factory/countyFactStore";
seedRegistryIdentityFacts();
dryRunCountyIngestion().then((r) => console.log(JSON.stringify(summarizeIngestionResults(r), null, 2)));
