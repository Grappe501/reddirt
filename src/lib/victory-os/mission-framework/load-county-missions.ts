/**
 * Victory OS Sprint 2 — county mission registry persistence.
 * Path: data/county-missions/registry-v1.json
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import type {
  CountyDailyTask,
  CountyMission,
  CountyMissionStack,
  CountyMissionStatus,
  CountyMissionsRegistryFile,
} from "../types";

const MISSIONS_DIR = "data/county-missions";
const REGISTRY_FILE = "registry-v1.json";

function registryPath(): string {
  return path.join(process.cwd(), MISSIONS_DIR, REGISTRY_FILE);
}

function ensureDir(): void {
  const dir = path.join(process.cwd(), MISSIONS_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function loadCountyMissionsRegistry(): CountyMissionsRegistryFile | null {
  const p = registryPath();
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as CountyMissionsRegistryFile;
  } catch {
    return null;
  }
}

export function loadCountyMissionStack(countySlug: string): CountyMissionStack | null {
  const reg = loadCountyMissionsRegistry();
  return reg?.stacks.find((s) => s.countySlug === countySlug) ?? null;
}

export function loadAllCountyMissionStacks(): CountyMissionStack[] {
  return loadCountyMissionsRegistry()?.stacks ?? [];
}

export function persistCountyMissionsRegistry(file: CountyMissionsRegistryFile): string {
  ensureDir();
  const p = registryPath();
  writeFileSync(p, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  return p;
}

export function buildEmptyRegistry(weekKey: string): CountyMissionsRegistryFile {
  return {
    version: 1,
    doctrinePath: "docs/campaign-events/VICTORY_OS_DOCTRINE.md",
    updatedAt: new Date().toISOString(),
    syncedWeekKey: weekKey,
    syncedFromBriefId: null,
    countyCount: 0,
    stacks: [],
  };
}

export function mergeStackIntoRegistry(
  registry: CountyMissionsRegistryFile,
  stack: CountyMissionStack,
): CountyMissionsRegistryFile {
  const stacks = registry.stacks.filter((s) => s.countySlug !== stack.countySlug);
  stacks.push(stack);
  stacks.sort((a, b) => a.county.localeCompare(b.county));
  return {
    ...registry,
    updatedAt: new Date().toISOString(),
    countyCount: stacks.length,
    stacks,
  };
}

export function updateMissionStatusInRegistry(
  countySlug: string,
  missionId: string,
  status: CountyMissionStatus,
): CountyMissionsRegistryFile | null {
  const reg = loadCountyMissionsRegistry();
  if (!reg) return null;
  const stack = reg.stacks.find((s) => s.countySlug === countySlug);
  if (!stack) return null;

  const patch = (m: CountyMission | null): CountyMission | null =>
    m && m.id === missionId ? { ...m, status, updatedAt: new Date().toISOString() } : m;

  const updated: CountyMissionStack = {
    ...stack,
    updatedAt: new Date().toISOString(),
    longTerm: patch(stack.longTerm),
    monthly: patch(stack.monthly),
    weekly: patch(stack.weekly),
  };

  persistCountyMissionsRegistry(mergeStackIntoRegistry(reg, updated));
  return loadCountyMissionsRegistry();
}

export function updateDailyTaskStatusInRegistry(
  countySlug: string,
  taskId: string,
  status: CountyMissionStatus,
): CountyMissionsRegistryFile | null {
  const reg = loadCountyMissionsRegistry();
  if (!reg) return null;
  const stack = reg.stacks.find((s) => s.countySlug === countySlug);
  if (!stack) return null;

  const dailyTasks = stack.dailyTasks.map((t) =>
    t.id === taskId ? { ...t, status } : t,
  ) as CountyDailyTask[];

  const updated: CountyMissionStack = { ...stack, dailyTasks, updatedAt: new Date().toISOString() };
  persistCountyMissionsRegistry(mergeStackIntoRegistry(reg, updated));
  return loadCountyMissionsRegistry();
}

export function countyMissionsRegistryPresent(): boolean {
  return existsSync(registryPath());
}

export function expectedCountyCount(): number {
  return ARKANSAS_COUNTY_REGISTRY.length;
}

export function listStacksForWeek(weekKey: string): CountyMissionStack[] {
  const reg = loadCountyMissionsRegistry();
  if (!reg || reg.syncedWeekKey !== weekKey) return [];
  return reg.stacks.filter((s) => s.weekly?.periodKey === weekKey);
}

export function listTopDecisionMissionStacks(limit = 10): CountyMissionStack[] {
  const reg = loadCountyMissionsRegistry();
  if (!reg) return [];
  return reg.stacks
    .filter((s) => s.weekly?.linkedDecisionIds?.length)
    .sort((a, b) => (a.weekly?.kellyTier ?? 4) - (b.weekly?.kellyTier ?? 4))
    .slice(0, limit);
}
