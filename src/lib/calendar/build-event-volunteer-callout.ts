import { createHash } from "node:crypto";
import type { CampaignEventCoveragePlan } from "@/lib/calendar/event-coverage-types";
import type { EventStaffAssignmentRole, EventStaffingPlan } from "@/lib/calendar/event-staffing-types";
import type { EventVolunteerCallout } from "@/lib/calendar/event-volunteer-callout-types";

function idFor(plan: CampaignEventCoveragePlan): string {
  return `callout_${createHash("sha256").update(plan.campaignEventId).digest("hex").slice(0, 24)}`;
}

function rolesNeeded(plan: CampaignEventCoveragePlan): EventStaffAssignmentRole[] {
  const roles = new Set<EventStaffAssignmentRole>();
  if (plan.volunteerLeadNeeded && !plan.volunteerLeadName) roles.add("volunteer_lead");
  if (plan.tableNeeded) roles.add("table_captain");
  if (plan.tableNeeded || plan.staffNextActions.some((a) => /pack/i.test(a))) roles.add("materials_captain");
  if (plan.followUp.photosNeeded) roles.add("photographer_social");
  const generalNeeded = Math.max(0, plan.volunteersNeeded - roles.size);
  if (generalNeeded > 0) roles.add("general_volunteer");
  return [...roles];
}

function messagePurpose(plan: CampaignEventCoveragePlan): EventVolunteerCallout["messagePurpose"] {
  if (plan.tableNeeded) return "table_coverage";
  if (plan.coverageMode === "local_volunteer_coverage") return "local_coverage";
  if (plan.volunteerLeadNeeded) return "staffing_gap";
  return "volunteer_signup";
}

export function shouldCreateVolunteerCallout(plan: CampaignEventCoveragePlan, assignedVolunteerCount = 0): boolean {
  if (["cancelled", "not_covering"].includes(plan.status)) return false;
  return plan.volunteersNeeded > assignedVolunteerCount;
}

export function buildEventVolunteerCallout(
  plan: CampaignEventCoveragePlan,
  opts: { eventTitle?: string; assignedVolunteerCount?: number; staffingPlan?: EventStaffingPlan; startAt?: string | Date | null; locationName?: string | null } = {},
): EventVolunteerCallout | null {
  const assignedVolunteerCount = opts.assignedVolunteerCount ?? opts.staffingPlan?.volunteersConfirmed ?? 0;
  if (!shouldCreateVolunteerCallout(plan, assignedVolunteerCount)) return null;
  const needed = Math.max(1, plan.volunteersNeeded - assignedVolunteerCount);
  const roles = rolesNeeded(plan);
  const title = opts.staffingPlan?.title ?? opts.eventTitle ?? `Campaign event ${plan.campaignEventId.slice(0, 8)}`;
  return {
    id: idFor(plan),
    campaignEventId: plan.campaignEventId,
    event: {
      title,
      dateTime: opts.startAt ? new Date(opts.startAt).toISOString() : undefined,
      location: opts.locationName ?? undefined,
    },
    county: plan.county,
    city: plan.city,
    suggestedRadiusMiles: plan.tableNeeded ? 25 : 15,
    volunteersNeeded: needed,
    rolesNeeded: roles,
    suggestedAudience: plan.county ? "county_volunteers" : "staff_test",
    status: "needs_approval",
    messagePurpose: messagePurpose(plan),
    recommendedSendAt: new Date().toISOString(),
    complianceGate: {
      emailOptInRequired: true,
      unsubscribeRequired: true,
      suppressionCheckRequired: true,
      smsDisabled: true,
      humanApprovalRequired: true,
    },
    humanApprovalRequired: true,
    draftSubject: `Volunteer help needed for ${title}`,
    draftBody: [
      `We need ${needed} volunteer${needed === 1 ? "" : "s"} to help cover ${title}.`,
      plan.county ? `County: ${plan.county}` : null,
      plan.city ? `City: ${plan.city}` : null,
      roles.length ? `Roles needed: ${roles.map((r) => r.replace(/_/g, " ")).join(", ")}` : null,
      plan.tableNeeded ? "This may include tabling coverage and materials setup." : "This is local campaign coverage.",
      "Human approval is required before any outbound email. SMS is disabled for this workflow.",
    ]
      .filter(Boolean)
      .join("\n\n"),
    staffNotes: "Draft only. Confirm audience, opt-in, suppression, and staff owner before sending.",
  };
}
