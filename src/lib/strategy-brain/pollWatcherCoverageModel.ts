import fs from "node:fs";
import path from "node:path";
import type { PollWatcherCoverageModelFile } from "./strategyDoctrineTypes";

export function pollWatcherCoveragePlanner(): PollWatcherCoverageModelFile {
  const abs = path.join(process.cwd(), "data/strategy-doctrine/poll-watcher-coverage-model.json");
  return JSON.parse(fs.readFileSync(abs, "utf8")) as PollWatcherCoverageModelFile;
}

