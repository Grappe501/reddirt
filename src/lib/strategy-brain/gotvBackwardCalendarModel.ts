import fs from "node:fs";
import path from "node:path";
import type { GotvBackwardCalendarModelFile } from "./strategyDoctrineTypes";

export function gotvBackwardCalendarPlanner(): GotvBackwardCalendarModelFile {
  const abs = path.join(process.cwd(), "data/strategy-doctrine/gotv-backward-calendar-model.json");
  return JSON.parse(fs.readFileSync(abs, "utf8")) as GotvBackwardCalendarModelFile;
}

