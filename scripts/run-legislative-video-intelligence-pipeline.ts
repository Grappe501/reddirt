#!/usr/bin/env tsx
import {
  runLegislativeVideoIntelligencePipeline,
  type LegislativePipelineMode,
} from "../src/lib/legislature/legislativeVideoIntelligencePipeline";

const modeArg = process.argv[2] ?? process.env.LEGISLATURE_PIPELINE_MODE ?? "CRITICAL_ONLY";
const mode = modeArg as LegislativePipelineMode;

runLegislativeVideoIntelligencePipeline(process.cwd(), mode).then((result) => {
  console.log(JSON.stringify(result, null, 2));
});
