import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type StagedGotvCommitmentCard = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  county: string;
  city?: string;
  zip: string;
  waysToHelp: string[];
  optInEmail: boolean;
  optInSms: boolean;
  optInPhone: boolean;
  languageAccessSkills?: string;
  notes?: string;
};

export function loadStagedGotvCommitmentCards(repoRoot?: string): StagedGotvCommitmentCard[] {
  const root = repoRoot ?? process.cwd();
  const p = path.join(root, "data/field-ops/gotv-commitment-cards.staged.json");
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as { rows?: StagedGotvCommitmentCard[] };
    return raw.rows ?? [];
  } catch {
    return [];
  }
}
