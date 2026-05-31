#!/usr/bin/env tsx
import { runCountyFactoryAudit } from "../src/lib/county-workbench/factory/countyFactoryAudit";
console.log(JSON.stringify(runCountyFactoryAudit(), null, 2));
