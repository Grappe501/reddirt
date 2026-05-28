import fs from "node:fs";
import path from "node:path";
import type { SteveStrategyDoctrineFile } from "./strategyDoctrineTypes";

export function steveStrategyDoctrineReader(): SteveStrategyDoctrineFile {
  const abs = path.join(process.cwd(), "data/strategy-doctrine/steve-strategy-doctrine.json");
  return JSON.parse(fs.readFileSync(abs, "utf8")) as SteveStrategyDoctrineFile;
}

