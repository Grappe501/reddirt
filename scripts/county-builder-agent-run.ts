#!/usr/bin/env tsx
import { runCountyBuilderAgent } from "../src/lib/county-workbench/factory/aiCountyBuilderAgent";
console.log(JSON.stringify(runCountyBuilderAgent(), null, 2));
