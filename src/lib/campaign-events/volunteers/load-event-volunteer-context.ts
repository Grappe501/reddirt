import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";
import { loadEventCountyContext } from "@/lib/agents/county-intelligence/county-event-strategy";
import { recommendVolunteersForEvent, estimateEventStaffingGap, type EventVolunteerNeed } from "./volunteer-assignment-engine";
import { loadVolunteersStore } from "./volunteer-storage";

export type EventVolunteerContext = {
  eventRecordId: string;
  volunteersNeeded: number;
  rolesSuggested: string[];
  county?: string;
  recommendations: ReturnType<typeof recommendVolunteersForEvent>;
  staffingGap: ReturnType<typeof estimateEventStaffingGap>;
  trainedInCounty: number;
  leadershipProspects: number;
  reminderStatus: "not_scheduled";
  gapWarning?: string;
};

const DEFAULT_ROLES = ["check-in table", "literature table", "event setup"];

export function loadEventVolunteerContext(row: CalendarSurfaceRow): EventVolunteerContext {
  const store = loadVolunteersStore();
  const countyCtx = loadEventCountyContext(row.county);
  const volunteersNeeded = Number.parseInt(row.factCard.who.volunteerCount ?? "4", 10) || 4;
  const rolesSuggested = DEFAULT_ROLES;
  const county = row.county?.toLowerCase();

  const need: EventVolunteerNeed = {
    eventRecordId: row.recordId,
    county,
    rolesNeeded: rolesSuggested,
    volunteersNeeded,
    trainedOnly: true,
  };

  const recommendations = recommendVolunteersForEvent(need, store.profiles, store.assignments);
  const staffingGap = estimateEventStaffingGap(volunteersNeeded, store.assignments, row.recordId);

  const trainedInCounty = store.profiles.filter(
    (p) =>
      p.trainingCompleted.includes("campaign-basics") &&
      (!county || !p.county || p.county === county),
  ).length;

  const leadershipProspects = store.profiles.filter(
    (p) => p.leadershipPotential === "high" && (!county || p.county === county),
  ).length;

  let gapWarning = staffingGap.warning;
  if (trainedInCounty < volunteersNeeded) {
    gapWarning = `Only ${trainedInCounty} trained volunteer(s) in county — need ${volunteersNeeded}.`;
  }
  if (countyCtx && countyCtx.recruitTargets.length > 0 && staffingGap.gap > 0) {
    gapWarning = `${gapWarning ?? ""} County recruit targets active.`.trim();
  }

  return {
    eventRecordId: row.recordId,
    volunteersNeeded,
    rolesSuggested,
    county,
    recommendations: recommendations.slice(0, 9),
    staffingGap,
    trainedInCounty,
    leadershipProspects,
    reminderStatus: "not_scheduled",
    gapWarning,
  };
}
