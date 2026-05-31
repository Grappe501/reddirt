#!/usr/bin/env tsx
import { compileAllCountyProfiles, summarizeCompiledProfileReadiness } from "../src/lib/county-workbench/factory/countyProfileCompiler";
compileAllCountyProfiles();
console.log(JSON.stringify(summarizeCompiledProfileReadiness(), null, 2));
