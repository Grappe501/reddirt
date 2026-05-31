#!/usr/bin/env tsx
import { loadCountySourceCatalog } from "../src/lib/county-workbench/factory/countySourceCatalog";
import { saveCountySourcesRegistry } from "../src/lib/county-workbench/factory/countyFactStore";
const catalog = loadCountySourceCatalog();
saveCountySourcesRegistry({ version: 1, generatedAt: new Date().toISOString(), sources: catalog.sources });
console.log(JSON.stringify({ sources: catalog.sources.length }, null, 2));
