import "server-only";
import path from "node:path";
import { readFile } from "node:fs/promises";

import type { AgentContextPack } from "@/lib/kelly-agent/agent-context-pack";
import { filterCalendarItemsInWindow, loadCountyFactsByKey, loadCountyPrioritySnapshot, loadTravelCalendarItems } from "@/lib/calendar/load-travel-calendar-data";
import { getChicagoWeekRange } from "@/lib/calendar/week-view-range";
import { loadCommunityOpportunitiesNormalized } from "@/lib/opportunities/load-community-opportunities-data";
import { loadRouteMatrixCache } from "@/lib/opportunities/google-route-matrix";

export async function buildAgentContextPack(opts: {
  weekMondayYmd?: string;
  currentLocation?: string;
}): Promise<AgentContextPack> {
  const wr = getChicagoWeekRange(opts.weekMondayYmd);
  const items = loadTravelCalendarItems();
  const startMs = new Date(wr.startIso).getTime();
  const endMs = new Date(wr.endExclusiveIso).getTime();
  const windowItems = filterCalendarItemsInWindow(items, startMs, endMs);
  const confirmed = windowItems.filter((i) => i.calendarStatus === "confirmed");
  const opps = loadCommunityOpportunitiesNormalized();
  const countyFacts = Object.entries(loadCountyFactsByKey()).map(([countyKey, row]) => ({ countyKey, ...row }));
  const priorities = loadCountyPrioritySnapshot();
  const repoRoot = process.cwd();
  const routeCache = await loadRouteMatrixCache(repoRoot);

  return {
    currentDate: new Date().toISOString(),
    currentLocation: opts.currentLocation,
    homeBase: "Rose Bud, Arkansas",
    calendarWindow: {
      start: wr.startIso,
      end: wr.endExclusiveIso,
      items: windowItems as unknown[],
    },
    confirmedCommitments: confirmed as unknown[],
    tentativeOpportunities: opps.slice(0, 160) as unknown[],
    countyFacts: countyFacts as unknown[],
    countyPriorities: priorities as unknown[],
    routeMatrix: { version: routeCache.version, entryCount: Object.keys(routeCache.entries).length },
    pastKellyTouches: undefined,
    mediaMatches: undefined,
    staffRules: [
      "Single Kelly campaign brain — no competing persona. Only use supplied JSON and tool outputs.",
      "Carroll County (Berryville / Eureka Springs corridor): staff should block one prep evening per week leading up to any scheduled debate until the week before; protect open minutes for rehearsal, briefings, and travel buffers.",
    ],
    knownConstraints: [
      "Tuesday daytime = Little Rock / Pulaski work window unless the calendar row waives it.",
      "Do not invent contacts, opponents, poll numbers, or venue access.",
      "This API route does not write to Google Calendar — sync is a read-only status snapshot when the tool runs.",
      "When `win_targets` appears in the tool bundle, treat it as a scenario (not a prediction). Explain uncertainty, missing data flags, and that humans approve field plans.",
      "`volunteer_capacity` is operations-only (staffing, guides, access materials, follow-up workload). Never present it as automated voter persuasion or demographic targeting.",
      "`event_success_playbook` prepares staff work and draft automation tasks only; it never sends messages or creates voter-targeting lists.",
      "`event_outreach_plan` may suggest email drafts for approved audiences, but humans must approve every test and live send; no AI-triggered sending.",
      "`candidate_dashboard_preflight` and `schedule_readiness` are safety/readiness checks; use them to label ready vs staged vs blocked before Kelly preview.",
    ],
  };
}

export async function loadMediaIndexSlice(repoRoot: string, limit: number): Promise<unknown[]> {
  try {
    const raw = JSON.parse(await readFile(path.join(repoRoot, "data/media/media-index.json"), "utf8")) as {
      items?: unknown[];
    };
    return (raw.items ?? []).slice(0, limit);
  } catch {
    return [];
  }
}
