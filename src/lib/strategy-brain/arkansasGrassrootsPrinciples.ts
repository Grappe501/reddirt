import fs from "node:fs";
import path from "node:path";
import type { ArkansasGrassrootsPrinciplesFile } from "./strategyDoctrineTypes";

export function arkansasGrassrootsPrinciplesReader(): ArkansasGrassrootsPrinciplesFile {
  const abs = path.join(process.cwd(), "data/strategy-doctrine/arkansas-grassroots-principles.json");
  return JSON.parse(fs.readFileSync(abs, "utf8")) as ArkansasGrassrootsPrinciplesFile;
}

