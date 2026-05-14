import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { EventStaffAssignmentsFile, EventStaffingPlansFile } from "@/lib/calendar/event-staffing-types";
import type { EventVolunteerCalloutsFile } from "@/lib/calendar/event-volunteer-callout-types";
import type { EventVolunteerRemindersFile } from "@/lib/calendar/event-volunteer-reminder-types";
import type { CampaignMaterialsInventory } from "@/lib/calendar/campaign-materials-inventory-types";

function readJson<T>(repoRoot: string, rel: string): T | null {
  const file = path.join(repoRoot, rel);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

export function loadEventStaffAssignmentsFile(repoRoot = process.cwd()): EventStaffAssignmentsFile | null {
  const direct = readJson<EventStaffAssignmentsFile>(repoRoot, "data/calendar-command-center/event-staff-assignments.staged.json");
  if (direct) return direct;
  const plans = readJson<EventStaffingPlansFile>(repoRoot, "data/calendar-command-center/event-staffing-plans.staged.json");
  if (!plans) return null;
  return {
    version: 1,
    generatedAt: plans.generatedAt,
    source: "event_staffing_plans",
    assignments: plans.plans.flatMap((p) => p.assignedVolunteers),
  };
}

export function loadEventStaffingPlansFile(repoRoot = process.cwd()): EventStaffingPlansFile | null {
  return readJson<EventStaffingPlansFile>(repoRoot, "data/calendar-command-center/event-staffing-plans.staged.json");
}

export function loadEventVolunteerCalloutsFile(repoRoot = process.cwd()): EventVolunteerCalloutsFile | null {
  return readJson<EventVolunteerCalloutsFile>(repoRoot, "data/calendar-command-center/event-volunteer-callouts.staged.json");
}

export function loadEventVolunteerRemindersFile(repoRoot = process.cwd()): EventVolunteerRemindersFile | null {
  return readJson<EventVolunteerRemindersFile>(repoRoot, "data/calendar-command-center/event-volunteer-reminders.staged.json");
}

export function loadCampaignMaterialsInventory(repoRoot = process.cwd()): CampaignMaterialsInventory | null {
  return readJson<CampaignMaterialsInventory>(repoRoot, "data/calendar-command-center/campaign-materials-inventory.json");
}
