import fs from "node:fs";
import path from "node:path";
import type { EventVisibilityPlaybookFile } from "./strategyDoctrineTypes";

export function eventVisibilityOpportunityReader(): EventVisibilityPlaybookFile {
  const abs = path.join(process.cwd(), "data/strategy-doctrine/event-visibility-playbook.json");
  return JSON.parse(fs.readFileSync(abs, "utf8")) as EventVisibilityPlaybookFile;
}

