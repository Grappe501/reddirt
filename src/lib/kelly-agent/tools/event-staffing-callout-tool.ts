import "server-only";

import { loadEventCoveragePlans } from "@/lib/calendar/load-event-coverage-plans";
import { loadEventStaffingPlans } from "@/lib/calendar/load-event-staffing-plans";
import { loadEventVolunteerCalloutsFile, loadEventVolunteerRemindersFile } from "@/lib/calendar/load-event-staffing-data";

export function buildEventStaffingCalloutToolOutput(eventId?: string, repoRoot?: string) {
  const coveragePlans = loadEventCoveragePlans(repoRoot);
  const staffingPlans = loadEventStaffingPlans(repoRoot);
  const callouts = loadEventVolunteerCalloutsFile(repoRoot)?.callouts ?? [];
  const reminders = loadEventVolunteerRemindersFile(repoRoot)?.reminders ?? [];

  if (eventId) {
    const coverage = coveragePlans.find((p) => p.campaignEventId === eventId || p.calendarItemId === eventId);
    const campaignEventId = coverage?.campaignEventId ?? eventId;
    const staffing = staffingPlans.find((p) => p.campaignEventId === campaignEventId);
    const callout = callouts.find((c) => c.campaignEventId === campaignEventId);
    const eventReminders = reminders.filter((r) => r.campaignEventId === campaignEventId);
    return {
      eventId,
      covered: Boolean(coverage && ["ready", "covered"].includes(coverage.status) && staffing?.staffingGap === 0),
      volunteersNeeded: staffing?.volunteersNeeded ?? coverage?.volunteersNeeded ?? 0,
      volunteersConfirmed: staffing?.volunteersConfirmed ?? 0,
      staffingGap: staffing?.staffingGap ?? coverage?.volunteersNeeded ?? 0,
      assigned: staffing?.assignedVolunteers ?? [],
      needsCallout: Boolean(callout),
      callout: callout ?? null,
      materialsToPack: coverage?.materials ?? null,
      reminderDraftCount: eventReminders.length,
      reminderDrafts: eventReminders,
      nextStaffAction: staffing?.notes ?? coverage?.staffNextActions?.[0] ?? "Review coverage plan.",
      humanOverrideRequired: true,
      noSendPerformed: true,
    };
  }

  return {
    totalEvents: staffingPlans.length,
    eventsNeedingVolunteerLead: staffingPlans.filter((p) => p.status === "needs_volunteer_lead").length,
    eventsNeedingCallout: staffingPlans.filter((p) => p.status === "needs_callout" || p.staffingGap > 0).length,
    reminderDraftsGenerated: reminders.length,
    eventsFullyStaffed: staffingPlans.filter((p) => p.status === "fully_staffed").length,
    calloutDrafts: callouts.length,
    humanOverrideRequired: true,
    noSendPerformed: true,
    note: "Read-only event staffing and volunteer callout tool. No email, SMS, Google, or public automation runs here.",
  };
}
