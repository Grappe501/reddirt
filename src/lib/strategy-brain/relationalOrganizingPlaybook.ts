import fs from "node:fs";
import path from "node:path";
import type { RelationalOrganizingPlaybookFile } from "./strategyDoctrineTypes";

export function relationalOrganizingPlaybookReader(): RelationalOrganizingPlaybookFile {
  const abs = path.join(process.cwd(), "data/strategy-doctrine/relational-organizing-playbook.json");
  return JSON.parse(fs.readFileSync(abs, "utf8")) as RelationalOrganizingPlaybookFile;
}

