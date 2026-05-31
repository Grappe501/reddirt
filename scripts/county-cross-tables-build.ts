#!/usr/bin/env tsx
import { buildAllCountyCrossTables, summarizeCrossTableCompleteness } from "../src/lib/county-workbench/factory/countyCrossTableBuilder";
buildAllCountyCrossTables();
console.log(JSON.stringify(summarizeCrossTableCompleteness(), null, 2));
