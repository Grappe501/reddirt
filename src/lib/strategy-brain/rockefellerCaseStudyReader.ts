import fs from "node:fs";
import path from "node:path";
import type { RockefellerCaseStudyFile } from "./strategyDoctrineTypes";

export function rockefellerGrassrootsCaseStudyReader(): RockefellerCaseStudyFile {
  const abs = path.join(process.cwd(), "data/strategy-doctrine/rockefeller-grassroots-case-study.json");
  return JSON.parse(fs.readFileSync(abs, "utf8")) as RockefellerCaseStudyFile;
}

