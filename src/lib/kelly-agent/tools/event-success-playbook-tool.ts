import "server-only";

import { loadGotvCommitmentAllocationFile } from "@/lib/field-ops/load-gotv-commitment-allocation";
import { getVolunteerCapacityRowForCounty } from "@/lib/field-ops/load-volunteer-capacity-model";

export type EventSuccessPlaybook = {
  eventId: string;
  title: string;
  county?: string;
  city?: string;

  recommendedActions: Array<{
    actionType:
      | "host_confirmation"
      | "local_guide"
      | "volunteer_staffing"
      | "press_release"
      | "media_advisory"
      | "photographer"
      | "social_post"
      | "commitment_card_ask"
      | "house_party_followup"
      | "county_brief"
      | "access_language_support"
      | "post_event_followup"
      | "google_calendar_sync";
    recommendation: "do" | "consider" | "skip" | "needs_human_decision";
    reason: string;
    suggestedOwner?: "staff" | "county_host" | "volunteer_lead" | "press" | "candidate";
    dueOffsetHours?: number;
    requiresHumanApproval: boolean;
  }>;

  automationDrafts: Array<{
    channel: "email" | "sms" | "phone_bank" | "task_only";
    audienceType: "event_hosts" | "confirmed_volunteers" | "opted_in_supporters" | "staff" | "county_leads";
    timing: "one_week_before" | "72_hours_before" | "day_before" | "day_of" | "after_event";
    purpose: string;
    complianceStatus: "requires_opt_in" | "safe_task_only" | "needs_review";
    humanApprovalRequired: true;
  }>;
};

type EventLike = {
  id?: string;
  title?: string;
  county?: string;
  city?: string;
  eventType?: string;
  calendarStatus?: string;
  drillDown?: { host?: string; contacts?: string; adminLocalGuide?: { displayName?: string } };
};

export function buildEventSuccessPlaybook(event: EventLike | null | undefined): EventSuccessPlaybook | null {
  if (!event?.id || !event.title) return null;
  const county = event.county?.replace(/\s+County$/i, "").trim();
  const cap = county ? getVolunteerCapacityRowForCounty(county) : null;
  const gotv = loadGotvCommitmentAllocationFile();
  const alloc = county ? gotv?.counties.find((c) => c.county === county) ?? null : null;
  const hasHost = Boolean(event.drillDown?.host || event.drillDown?.contacts);
  const guideKnown = Boolean(event.drillDown?.adminLocalGuide?.displayName);

  const recommendedActions: EventSuccessPlaybook["recommendedActions"] = [
    {
      actionType: "host_confirmation",
      recommendation: hasHost ? "do" : "needs_human_decision",
      reason: hasHost ? "Host/contact exists in event metadata; confirm arrival, role, and commitment-card ask." : "No host contact is visible in event metadata.",
      suggestedOwner: "staff",
      dueOffsetHours: -168,
      requiresHumanApproval: true,
    },
    {
      actionType: "local_guide",
      recommendation: guideKnown || (cap?.localGuideNeed ?? 1) <= 0 ? "consider" : "do",
      reason: guideKnown ? "Local guide is listed on the event." : `County guide gap is ${cap?.localGuideNeed ?? "unknown"}; confirm before principal travel.`,
      suggestedOwner: "county_host",
      dueOffsetHours: -72,
      requiresHumanApproval: true,
    },
    {
      actionType: "volunteer_staffing",
      recommendation: (cap?.eventStaffingNeed ?? 0) > 0 ? "do" : "consider",
      reason: `County field-ops model estimates ${cap?.eventStaffingNeed ?? 0} event staffing slots.`,
      suggestedOwner: "volunteer_lead",
      dueOffsetHours: -72,
      requiresHumanApproval: true,
    },
    {
      actionType: "commitment_card_ask",
      recommendation: alloc && alloc.commitmentGap > 0 ? "do" : "consider",
      reason: alloc ? `${county} commitment target ${alloc.volunteerCommitmentTarget}, current ${alloc.currentCommitments ?? 0}, gap ${alloc.commitmentGap}.` : "No county commitment allocation row found.",
      suggestedOwner: "candidate",
      dueOffsetHours: -24,
      requiresHumanApproval: true,
    },
    {
      actionType: "access_language_support",
      recommendation:
        cap?.hispanicCommunityAccessNeed === "needs_bilingual_materials" || cap?.hispanicCommunityAccessNeed === "needs_local_partner"
          ? "do"
          : "consider",
      reason: cap?.languageAccessNotes ?? "Review access needs and materials for public engagement.",
      suggestedOwner: "staff",
      dueOffsetHours: -72,
      requiresHumanApproval: true,
    },
    {
      actionType: "post_event_followup",
      recommendation: "do",
      reason: "Prepare thank-you / follow-up tasks for hosts and opted-in volunteers. No sends until human approval.",
      suggestedOwner: "staff",
      dueOffsetHours: 24,
      requiresHumanApproval: true,
    },
    {
      actionType: "google_calendar_sync",
      recommendation: event.calendarStatus === "confirmed" ? "consider" : "skip",
      reason: "This tool prepares staff work only; it does not write Google Calendar.",
      suggestedOwner: "staff",
      dueOffsetHours: -48,
      requiresHumanApproval: true,
    },
  ];

  const automationDrafts: EventSuccessPlaybook["automationDrafts"] = [
    {
      channel: "task_only",
      audienceType: "staff",
      timing: "one_week_before",
      purpose: "Confirm host, local guide, staffing slots, accessibility/materials, and county brief.",
      complianceStatus: "safe_task_only",
      humanApprovalRequired: true,
    },
    {
      channel: "email",
      audienceType: "event_hosts",
      timing: "72_hours_before",
      purpose: "Draft host confirmation note for staff review.",
      complianceStatus: "needs_review",
      humanApprovalRequired: true,
    },
    {
      channel: "sms",
      audienceType: "confirmed_volunteers",
      timing: "day_before",
      purpose: "Draft opt-in volunteer reminder; do not send until consent/suppression checks pass.",
      complianceStatus: "requires_opt_in",
      humanApprovalRequired: true,
    },
    {
      channel: "task_only",
      audienceType: "staff",
      timing: "after_event",
      purpose: "Create follow-up tasks for thank-yous, commitment-card entry, photos, and county notes.",
      complianceStatus: "safe_task_only",
      humanApprovalRequired: true,
    },
  ];

  return {
    eventId: event.id,
    title: event.title,
    county,
    city: event.city,
    recommendedActions,
    automationDrafts,
  };
}
