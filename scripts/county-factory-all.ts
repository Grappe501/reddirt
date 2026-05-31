#!/usr/bin/env tsx
import { runCountyFactoryAll } from "../src/lib/county-workbench/factory/countyFactoryRunner";
runCountyFactoryAll().then((r) => console.log(JSON.stringify(r, null, 2)));
