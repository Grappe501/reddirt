import type { CommunityWorkbenchEventRow } from "./types";

const ACTIVE_STATUSES = new Set(["planned", "confirmed", "executed", "aar_complete"]);

export function computeEventReadinessPct(events: CommunityWorkbenchEventRow[]): number {
  if (events.length === 0) return 0;

  const active = events.filter((e) => ACTIVE_STATUSES.has(e.status));
  if (active.length === 0) return 0;

  let score = 0;
  const perEventMax = 100 / Math.max(active.length, 3);

  for (const ev of active) {
    let pts = 0;
    if (ev.status === "idea") pts += 5;
    if (ev.status === "planned") pts += 20;
    if (ev.status === "confirmed") pts += 35;
    if (ev.status === "executed") pts += 25;
    if (ev.status === "aar_complete") pts += 15;

    if (ev.runOfShow.length >= 3) pts += 10;
    if (ev.assignments.filter((a) => a.assignee?.trim()).length >= 3) pts += 10;
    if (ev.leadName?.trim()) pts += 5;
    if (ev.location?.trim()) pts += 5;
    if (ev.committeeId) pts += 5;
    if (ev.status === "executed" || ev.status === "aar_complete") {
      if (ev.actualAttendance != null) pts += 5;
    }
    if (ev.status === "aar_complete" && ev.aarBody?.trim()) pts += 10;

    score += Math.min(perEventMax, (pts / 100) * perEventMax);
  }

  return Math.min(100, Math.round(score));
}

export function countEventsByStatus(events: CommunityWorkbenchEventRow[]) {
  return {
    idea: events.filter((e) => e.status === "idea").length,
    planned: events.filter((e) => e.status === "planned").length,
    confirmed: events.filter((e) => e.status === "confirmed").length,
    executed: events.filter((e) => e.status === "executed").length,
    aar_complete: events.filter((e) => e.status === "aar_complete").length,
    cancelled: events.filter((e) => e.status === "cancelled").length,
  };
}

export function eventKpiCurrent(events: CommunityWorkbenchEventRow[], key: string): number | undefined {
  const counts = countEventsByStatus(events);
  if (key === "events" || key === "town_halls" || key === "fairs") {
    return counts.executed + counts.aar_complete;
  }
  if (key === "town_hall") {
    return counts.confirmed + counts.executed + counts.aar_complete;
  }
  return undefined;
}
