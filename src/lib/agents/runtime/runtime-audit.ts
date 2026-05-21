import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

export type RuntimeAuditEntry = {
  id: string;
  at: string;
  actor: string;
  message: string;
  intentTask: string;
  intentDomain: string;
  intentRisk: string;
  toolsSelected: string[];
  toolsBlocked: string[];
  recommendationsShown: string[];
  memoryCandidates: number;
  pathname: string;
  period: string;
  userClickedRecommendation?: boolean;
  humanOverride?: string;
};

const REL = "data/campaign-events/agent-runtime-audit.json";
const MAX = 300;

function filePath(repoRoot?: string) {
  return path.join(repoRoot ?? process.cwd(), REL);
}

export function loadRuntimeAudit(repoRoot?: string): RuntimeAuditEntry[] {
  const p = filePath(repoRoot);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function appendRuntimeAudit(
  entry: Omit<RuntimeAuditEntry, "id" | "at"> & { id?: string; at?: string },
  repoRoot?: string,
): RuntimeAuditEntry {
  const p = filePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const prev = loadRuntimeAudit(repoRoot);
  const full: RuntimeAuditEntry = {
    ...entry,
    id: entry.id ?? `art_${Date.now().toString(36)}`,
    at: entry.at ?? new Date().toISOString(),
  };
  writeFileSync(p, JSON.stringify([...prev, full].slice(-MAX), null, 2), "utf8");
  return full;
}
