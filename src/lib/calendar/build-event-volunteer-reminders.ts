import { createHash } from "node:crypto";
import type { CampaignEventCoveragePlan } from "@/lib/calendar/event-coverage-types";
import type { EventStaffAssignment, EventStaffingPlan } from "@/lib/calendar/event-staffing-types";
import type { EventVolunteerReminder } from "@/lib/calendar/event-volunteer-reminder-types";

type EventMeta = {
  startAt?: string | Date | null;
  locationName?: string | null;
};

const TIMINGS: EventVolunteerReminder["timing"][] = [
  "on_assignment",
  "one_week_before",
  "72_hours_before",
  "day_before",
  "morning_of",
  "post_event",
];

function idFor(...parts: string[]): string {
  return `reminder_${createHash("sha256").update(parts.join(":")).digest("hex").slice(0, 24)}`;
}

function titleFor(timing: EventVolunteerReminder["timing"]): string {
  if (timing === "post_event") return "Thank you and photo upload for {Event Title}";
  if (timing === "morning_of") return "Today: volunteer details for {Event Title}";
  return "Volunteer details for {Event Title}";
}

function bodyFor(timing: EventVolunteerReminder["timing"], staffing: EventStaffingPlan, coverage: CampaignEventCoveragePlan, meta?: EventMeta): string {
  return [
    `Event: ${staffing.title}`,
    meta?.startAt ? `Date/time: ${new Date(meta.startAt).toLocaleString("en-US", { timeZone: "America/Chicago" })}` : "Date/time: confirm in calendar",
    `Arrival time: ${staffing.arrivalTime ?? "confirm with staff owner"}`,
    `Location: ${meta?.locationName ?? "confirm location"}`,
    `Point of contact: ${staffing.volunteerLead ?? "staff owner / volunteer lead TBD"}`,
    "",
    `Wear: ${staffing.whatToWear.join(", ")}.`,
    `Bring: ${staffing.whatToBring.join(", ")}.`,
    coverage.tableNeeded ? "Tabling: yes. Confirm permission, setup spot, tablecloth, banner, clipboards, pens, signup sheets, QR cards, push cards, fans, and branded mints." : "Tabling: not currently planned.",
    `Materials: ${coverage.materials.pushCards} push cards, ${coverage.materials.fans} fans, ${coverage.materials.brandedMints} branded mints, ${coverage.materials.fourFootTablecloths} tablecloth, ${coverage.materials.pullUpBanners} pull-up banner.`,
    "",
    timing === "post_event"
      ? "After the event, please upload photos and send quick notes: who attended, what questions came up, commitments collected, and follow-up needed."
      : "After the event, please send photos and quick notes so staff can update the county file.",
    "",
    "Draft only. Human approval required before sending. No SMS is sent by this workflow.",
  ].join("\n");
}

function shouldDraftForAssignment(a: EventStaffAssignment): boolean {
  return ["volunteer_lead", "table_captain", "materials_captain", "photographer_social", "local_host", "county_party_contact", "general_volunteer", "driver"].includes(a.role);
}

export function buildEventVolunteerReminders(staffing: EventStaffingPlan, coverage: CampaignEventCoveragePlan, meta?: EventMeta): EventVolunteerReminder[] {
  if (staffing.status === "cancelled" || coverage.status === "not_covering") return [];
  const assignments = staffing.assignedVolunteers.filter(shouldDraftForAssignment);
  return assignments.flatMap((assignment) =>
    TIMINGS.map((timing) => ({
      id: idFor(staffing.campaignEventId, assignment.id, timing),
      campaignEventId: staffing.campaignEventId,
      staffAssignmentId: assignment.id,
      channel: "email" as const,
      event: {
        title: staffing.title,
        dateTime: meta?.startAt ? new Date(meta.startAt).toISOString() : undefined,
        location: meta?.locationName ?? undefined,
        arrivalTime: staffing.arrivalTime,
        pointOfContact: staffing.volunteerLead ?? undefined,
      },
      timing,
      status: "draft" as const,
      subject: titleFor(timing),
      body: bodyFor(timing, staffing, coverage, meta),
      materialsIncluded: {
        pushCards: coverage.materials.pushCards > 0,
        fans: coverage.materials.fans > 0,
        brandedMints: coverage.materials.brandedMints > 0,
        tablecloth: coverage.materials.fourFootTablecloths > 0,
        pullUpBanner: coverage.materials.pullUpBanners > 0,
      },
      includes: {
        arrivalTime: true,
        location: true,
        whatToWear: true,
        whatToBring: true,
        contactPerson: true,
        parkingNotes: true,
        weatherNotes: timing === "morning_of",
        postEventUploadLink: timing === "post_event",
      },
      humanApprovalRequired: true as const,
    })),
  );
}
