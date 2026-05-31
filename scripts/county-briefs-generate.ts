#!/usr/bin/env tsx
import { generateAllCountyBriefs, writeBriefFactoryRollupDoc } from "../src/lib/county-workbench/factory/countyBriefFactory";
generateAllCountyBriefs();
writeBriefFactoryRollupDoc();
console.log("County briefs generated for all 75 counties");
