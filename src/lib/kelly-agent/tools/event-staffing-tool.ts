import "server-only";
import { loadEventCoveragePlans } from "@/lib/calendar/load-event-coverage-plans";
import {
  loadEventStaffAssignmentsFile,
  loadEventVolunteerCalloutsFile,
  loadEventVolunteerRemindersFile,
} from "@/lib/calendar/load-event-staffing-data";

export function buildEventStaffingToolOutput(eventId?: string, repoRoot?: string) {
  const plans = loadEventCoveragePlans(repoRoot);
  const assignments = loadEventStaffAssignmentsFile(repoRoot)?.assignments ?? [];
  const callouts = loadEventVolunteerCalloutsFile(repoRoot)?.callouts ?? [];
  const reminders = loadEventVolunteerRemindersFile(repoRoot)?.reminders ?? [];
  if (eventId) {
    const plan = plans.find((p) => p.campaignEventId === eventId || p.calendarItemId === eventId);
    const campaignEventId = plan?.campaignEventId ?? eventId;
    const eventAssignments = assignments.filter((a) => a.campaignEventId === campaignEventId);
    const eventCallout = callouts.find((c) => c.campaignEventId === campaignEventId);
    const eventReminders = reminders.filter((r) => r.campaignEventId === campaignEventId);
    return {
      eventId,
      coverageReady: plan ? plan.status === "ready" || plan.status === "covered" : false,
      volunteersNeeded: plan?.volunteersNeeded ?? 0,
      assignedVolunteerSlots: eventAssignments.length,
      tableNeeded: plan?.tableNeeded ?? false,
      materials: plan?.materials ?? null,
      shouldCallOutVolunteers: Boolean(eventCallout),
      callout: eventCallout ?? null,
      reminderDrafts: eventReminders,
      staffingRoster: eventAssignments,
      humanApprovalRequired: true,
      smsDisabled: true,
    };
  }
  return {
    eventsNeedingVolunteerCallout: callouts.filter((c) => c.status === "needs_approval" || c.status === "draft").length,
    remindersDrafted: reminders.length,
    eventsReadyToCover: plans.filter((p) => p.status === "ready" || p.status === "covered").length,
    eventsMissingVolunteerLead: plans.filter((p) => p.volunteerLeadNeeded && !p.volunteerLeadName).length,
    tablePermissionNeeded: plans.filter((p) => p.tableNeeded && p.tableStatus === "needs_permission").length,
    humanApprovalRequired: true,
    smsDisabled: true,
    note: "Read-only event staffing and volunteer callout tool. No outbound contact is sent.",
  };
}
