import { createHash } from "node:crypto";
import type { CampaignEventCoveragePlan } from "@/lib/calendar/event-coverage-types";
import type { EventStaffAssignment, EventStaffAssignmentRole, EventStaffingPlan } from "@/lib/calendar/event-staffing-types";

type EventMeta = {
  campaignEventId: string;
  title?: string;
  startAt?: string | Date | null;
  locationName?: string | null;
};

function idFor(prefix: string, ...parts: string[]): string {
  return `${prefix}_${createHash("sha256").update(parts.join(":")).digest("hex").slice(0, 24)}`;
}

function assignment(campaignEventId: string, role: EventStaffAssignmentRole, notes: string, arrivalTime?: string): EventStaffAssignment {
  return {
    id: idFor("staff", campaignEventId, role, notes),
    campaignEventId,
    role,
    status: "needed",
    arrivalTime,
    notes,
  };
}

function rolesFor(plan: CampaignEventCoveragePlan, arrivalTime?: string): EventStaffAssignment[] {
  if (["cancelled", "not_covering"].includes(plan.status) || plan.volunteersNeeded <= 0) return [];
  const roles: EventStaffAssignment[] = [
    assignment(plan.campaignEventId, "staff_owner", "Own event readiness, staff next actions, and post-event follow-up.", arrivalTime),
  ];
  if (plan.volunteerLeadNeeded && !plan.volunteerLeadName) {
    roles.push(assignment(plan.campaignEventId, "volunteer_lead", "Recruit or confirm volunteer lead before this event is ready.", arrivalTime));
  }
  if (plan.localHostNeeded && !plan.localHostName) {
    roles.push(assignment(plan.campaignEventId, "local_host", "Find local host or guide who can orient volunteers.", arrivalTime));
  }
  if (plan.coverageMode === "county_party_surrogate") {
    roles.push(assignment(plan.campaignEventId, "county_party_contact", "Confirm county party or local surrogate coverage.", arrivalTime));
  }
  if (plan.tableNeeded) {
    roles.push(assignment(plan.campaignEventId, "table_captain", "Confirm table permission, setup, and teardown.", arrivalTime));
    roles.push(assignment(plan.campaignEventId, "materials_captain", "Pack, track, and return event materials.", arrivalTime));
  }
  if (plan.followUp.photosNeeded) {
    roles.push(assignment(plan.campaignEventId, "photographer_social", "Capture photos and quick notes for follow-up.", arrivalTime));
  }
  const volunteerRoleCount = roles.filter((r) => r.role !== "staff_owner").length;
  for (let i = 0; i < Math.max(0, plan.volunteersNeeded - volunteerRoleCount); i += 1) {
    roles.push(assignment(plan.campaignEventId, "general_volunteer", `General volunteer slot ${i + 1}.`, arrivalTime));
  }
  return roles;
}

function staffingStatus(plan: CampaignEventCoveragePlan, assignedVolunteers: EventStaffAssignment[], volunteersConfirmed: number): EventStaffingPlan["status"] {
  if (plan.status === "cancelled") return "cancelled";
  if (plan.status === "not_covering") return "fully_staffed";
  if (assignedVolunteers.length === 0 && plan.volunteersNeeded === 0) return "fully_staffed";
  if (plan.volunteerLeadNeeded && !plan.volunteerLeadName) return "needs_volunteer_lead";
  if (volunteersConfirmed === 0 && plan.volunteersNeeded > 0) return "needs_callout";
  if (volunteersConfirmed < plan.volunteersNeeded) return "partially_staffed";
  return "fully_staffed";
}

export function buildEventStaffingPlan(plan: CampaignEventCoveragePlan, meta?: EventMeta): EventStaffingPlan {
  const arrivalTime = plan.logistics.arrivalTime;
  const assignedVolunteers = rolesFor(plan, arrivalTime);
  const volunteersConfirmed = assignedVolunteers.filter((a) => a.status === "confirmed" || a.status === "checked_in").length;
  const staffingGap = Math.max(0, plan.volunteersNeeded - volunteersConfirmed);
  return {
    id: idFor("staffplan", plan.campaignEventId),
    campaignEventId: plan.campaignEventId,
    title: meta?.title ?? `Campaign event ${plan.campaignEventId.slice(0, 8)}`,
    county: plan.county,
    city: plan.city,
    volunteerLeadNeeded: plan.volunteerLeadNeeded && !plan.volunteerLeadName,
    volunteerLead: plan.volunteerLeadName,
    assignedVolunteers,
    volunteersNeeded: plan.volunteersNeeded,
    volunteersConfirmed,
    staffingGap,
    arrivalTime,
    setupMinutes: plan.logistics.setupMinutes,
    teardownMinutes: plan.logistics.teardownMinutes,
    whatToWear: plan.logistics.whatToWear ? [plan.logistics.whatToWear] : ["Kelly shirt if available"],
    whatToBring: plan.logistics.whatToBring?.length ? plan.logistics.whatToBring : ["water", "comfortable shoes", "phone"],
    status: staffingStatus(plan, assignedVolunteers, volunteersConfirmed),
    notes: plan.staffNextActions.join(" · "),
  };
}
