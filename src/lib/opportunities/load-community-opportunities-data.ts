import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { CommunityOpportunity, WeekendRoutePlan } from "@/lib/opportunities/community-opportunity-types";

const DATA = "data/calendar-command-center";
const NORM = "community-opportunities-2026.normalized.json";
const PLANS = "weekend-route-plans-2026.json";

export function communityOpportunitiesDataPresent(): boolean {
  return existsSync(path.join(process.cwd(), DATA, NORM));
}

export function loadCommunityOpportunitiesNormalized(): CommunityOpportunity[] {
  const p = path.join(process.cwd(), DATA, NORM);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as { rows?: CommunityOpportunity[] };
    return raw.rows ?? [];
  } catch {
    return [];
  }
}

export type WeekendRoutePlansFile = {
  generatedAt?: string;
  topClusters: string[];
  plans: WeekendRoutePlan[];
};

export function loadWeekendRoutePlansFile(): WeekendRoutePlansFile | null {
  const p = path.join(process.cwd(), DATA, PLANS);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as WeekendRoutePlansFile;
  } catch {
    return null;
  }
}

/** Kelly cockpit: at most two plans — prefer upcoming week window, else best scored. */
export function loadKellyWeekendRoutePreviews(todayYmd: string, max = 2): WeekendRoutePlan[] {
  const file = loadWeekendRoutePlansFile();
  if (!file?.plans?.length) return [];
  const today = new Date(`${todayYmd}T12:00:00`);
  const end = new Date(today);
  end.setDate(end.getDate() + 14);

  const inWindow = file.plans.filter((p) => {
    const w = new Date(`${p.weekStart}T12:00:00`);
    return !Number.isNaN(w.getTime()) && w >= today && w <= end;
  });
  const pool = inWindow.length ? inWindow : [...file.plans].sort((a, b) => b.mustAttendCount - a.mustAttendCount || b.countiesTouched - a.countiesTouched);
  return pool.slice(0, max);
}
