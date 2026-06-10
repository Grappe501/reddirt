/**
 * Victory OS Sprint 5 — tactic linkage persistence.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { loadOrGenerateWeeklyDecisionBrief } from "../decision-engine/load-decision-brief";
import { loadCountyMissionsRegistry } from "../mission-framework/load-county-missions";
import { weekKeyFromDate } from "@/lib/calendar/weekly-time";
import { syncTacticLinkage } from "./sync-tactic-linkage";
import type { TacticLinkageRegistryFile, TacticLinkageViewModel } from "./types";

const DATA_DIR = "data/tactic-linkage";
const REGISTRY_FILE = "registry-v1.json";

function registryPath(): string {
  return path.join(process.cwd(), DATA_DIR, REGISTRY_FILE);
}

export function loadTacticLinkageRegistry(): TacticLinkageRegistryFile | null {
  const p = registryPath();
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as TacticLinkageRegistryFile;
  } catch {
    return null;
  }
}

export function persistTacticLinkageRegistry(registry: TacticLinkageRegistryFile): string {
  const dir = path.join(process.cwd(), DATA_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(registryPath(), `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  return `${DATA_DIR}/${REGISTRY_FILE}`;
}

export function syncAndPersistTacticLinkage(weekKey: string): TacticLinkageRegistryFile {
  const brief = loadOrGenerateWeeklyDecisionBrief(weekKey);
  const missions = loadCountyMissionsRegistry();
  const registry = syncTacticLinkage({
    weekKey,
    briefId: brief.briefId,
    stacks: missions?.stacks ?? [],
    decisions: brief.topDecisions.map((d) => ({ id: d.id, countySlug: d.countySlug })),
  });
  persistTacticLinkageRegistry(registry);
  return registry;
}

export function composeTacticLinkageViewModel(weekKey?: string): TacticLinkageViewModel {
  const wk = weekKey ?? weekKeyFromDate(new Date());
  let registry = loadTacticLinkageRegistry();
  if (!registry || registry.syncedWeekKey !== wk) {
    registry = syncAndPersistTacticLinkage(wk);
  }

  const byCountyMap = new Map<string, { countySlug: string; county: string; linked: number; unlinked: number }>();
  for (const t of registry.tactics) {
    if (!t.countySlug || !t.county) continue;
    const row = byCountyMap.get(t.countySlug) ?? { countySlug: t.countySlug, county: t.county, linked: 0, unlinked: 0 };
    if (t.linkageStatus === "linked") row.linked += 1;
    else row.unlinked += 1;
    byCountyMap.set(t.countySlug, row);
  }

  const { summary } = registry;
  const intelligenceNarrative = [
    `Tactic linkage · week ${wk}`,
    `${summary.linkedCount} of ${summary.totalCalendarItems} calendar rows linked to county missions.`,
    summary.needsMissionCount > 0 ? `${summary.needsMissionCount} tactics await mission sync.` : null,
    summary.orphanCount > 0 ? `${summary.orphanCount} rows missing county — fix calendar metadata.` : null,
    "Calendar is downstream of decisions — not the OS spine.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    weekKey: wk,
    registry,
    byCounty: [...byCountyMap.values()].sort((a, b) => b.linked - a.linked),
    intelligenceNarrative,
  };
}
