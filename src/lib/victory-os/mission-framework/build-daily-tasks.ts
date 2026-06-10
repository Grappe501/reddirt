/**
 * Victory OS Sprint 2 — deterministic daily tasks from weekly mission + resource type.
 */

import { addCalendarDays } from "@/lib/calendar/weekly-time";
import type { CountyDailyTask, CountyMission, VictoryResourceType } from "../types";

function taskId(countySlug: string, weekKey: string, n: number): string {
  return `task-${countySlug}-${weekKey}-${n}`;
}

type TaskTemplate = { title: string; assigneeRole: CountyDailyTask["assigneeRole"]; dayOffset: number };

function templatesForResource(resourceType: VictoryResourceType, county: string): TaskTemplate[] {
  switch (resourceType) {
    case "kelly":
      return [
        { title: `CM brief Kelly on ${county} deployment`, assigneeRole: "cm", dayOffset: 0 },
        { title: "Confirm venue, travel, and security", assigneeRole: "field", dayOffset: 1 },
        { title: "County chair prep call — talking points + volunteers", assigneeRole: "chair", dayOffset: 2 },
        { title: "Execute event / fair appearance", assigneeRole: "candidate", dayOffset: 4 },
        { title: "Hot wash + contact tally to field", assigneeRole: "field", dayOffset: 5 },
      ];
    case "surrogate":
      return [
        { title: "Book surrogate and confirm calendar hold", assigneeRole: "field", dayOffset: 0 },
        { title: "Chair briefing packet — county context", assigneeRole: "chair", dayOffset: 1 },
        { title: "Surrogate event execution", assigneeRole: "field", dayOffset: 3 },
        { title: "Follow-up thank-you + contact log", assigneeRole: "captain", dayOffset: 4 },
      ];
    case "volunteer":
    case "county_chair":
      return [
        { title: "Call county chair — assign weekly objective", assigneeRole: "cm", dayOffset: 0 },
        { title: "Recruit or confirm volunteer captain", assigneeRole: "chair", dayOffset: 1 },
        { title: "Staff booth / meeting on calendar", assigneeRole: "captain", dayOffset: 2 },
        { title: "Volunteer shift confirmation", assigneeRole: "captain", dayOffset: 3 },
        { title: "Report contacts + gaps to field", assigneeRole: "field", dayOffset: 5 },
      ];
    case "phone_bank":
      return [
        { title: "Load county call list + script", assigneeRole: "field", dayOffset: 0 },
        { title: "Schedule phone bank shift", assigneeRole: "captain", dayOffset: 1 },
        { title: "Run phone bank shift", assigneeRole: "volunteer", dayOffset: 3 },
        { title: "Log commitments + follow-ups", assigneeRole: "captain", dayOffset: 4 },
      ];
    case "fundraising":
      return [
        { title: "Identify county fundraising prospects", assigneeRole: "cm", dayOffset: 0 },
        { title: "Schedule donor call block", assigneeRole: "cm", dayOffset: 2 },
        { title: "Execute fundraising calls", assigneeRole: "cm", dayOffset: 3 },
        { title: "Allocate proceeds to county field plan", assigneeRole: "field", dayOffset: 5 },
      ];
    case "media":
      return [
        { title: "Pitch local media / radio for county", assigneeRole: "field", dayOffset: 0 },
        { title: "Prep county message track", assigneeRole: "cm", dayOffset: 1 },
        { title: "Media hit or op-ed placement", assigneeRole: "candidate", dayOffset: 4 },
      ];
    case "literature":
      return [
        { title: "Order county literature bundle", assigneeRole: "field", dayOffset: 0 },
        { title: "Confirm delivery to chair/captain", assigneeRole: "chair", dayOffset: 2 },
        { title: "Distribute at event or canvass", assigneeRole: "volunteer", dayOffset: 4 },
      ];
    default:
      return [
        { title: "Optional volunteer touch if capacity allows", assigneeRole: "captain", dayOffset: 2 },
      ];
  }
}

export function buildDailyTasksForWeeklyMission(
  weekly: CountyMission,
  weekKey: string,
  countyLabel: string,
): CountyDailyTask[] {
  const resourceType = weekly.resourceType ?? "volunteer";
  const templates = templatesForResource(resourceType, countyLabel);
  const now = new Date().toISOString();

  return templates.map((t, i) => ({
    id: taskId(weekly.countySlug, weekKey, i + 1),
    countySlug: weekly.countySlug,
    parentMissionId: weekly.id,
    periodKey: addCalendarDays(weekKey, t.dayOffset),
    title: t.title,
    assigneeRole: t.assigneeRole,
    status: "proposed" as const,
    sortOrder: i + 1,
    ...(now ? {} : {}),
  }));
}
