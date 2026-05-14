export type EventOutreachPlan = {
  eventId: string;
  title: string;
  county?: string;
  city?: string;
  recommendedEmails: Array<{
    purpose: "event_invitation" | "event_reminder" | "volunteer_ask" | "house_party_followup" | "thank_you";
    audience:
      | "opted_in_supporters"
      | "volunteers"
      | "county_hosts"
      | "local_guides"
      | "commitment_card_signups"
      | "staff_test";
    timing: "one_week_before" | "72_hours_before" | "day_before" | "day_of" | "after_event";
    reason: string;
    requiresHumanApproval: true;
  }>;
  notRecommended: string[];
  complianceWarnings: string[];
};

type EventLike = {
  id?: string;
  title?: string;
  county?: string | null;
  city?: string | null;
  location?: string | null;
  calendarStatus?: string;
  start?: string;
  eventType?: string;
};

export function buildEventOutreachPlan(event: EventLike | null | undefined): EventOutreachPlan {
  if (!event) {
    return {
      eventId: "unknown",
      title: "Unknown event",
      recommendedEmails: [],
      notRecommended: ["No event selected; do not create outreach drafts."],
      complianceWarnings: ["Human approval required before every send.", "No automated voter targeting or no-consent outreach."],
    };
  }

  const county = event.county ?? undefined;
  const city = event.city ?? event.location?.split(",")[0]?.trim() ?? undefined;
  const isConfirmed = event.calendarStatus === "confirmed" || event.calendarStatus === "scheduled";

  const recommendedEmails = [
    {
      purpose: "event_invitation",
      audience: "commitment_card_signups",
      timing: "one_week_before",
      reason: county
        ? `Prepare an opt-in invitation for recent commitment-card signups connected to ${county}.`
        : "Prepare an opt-in invitation only after staff selects a lawful campaign audience.",
      requiresHumanApproval: true,
    },
    {
      purpose: "volunteer_ask",
      audience: "volunteers",
      timing: "72_hours_before",
      reason: "Ask opted-in volunteers for setup, check-in, local guide, and follow-up support.",
      requiresHumanApproval: true,
    },
    {
      purpose: "event_reminder",
      audience: "county_hosts",
      timing: "day_before",
      reason: "Confirm host logistics, room setup, point person, and arrival instructions.",
      requiresHumanApproval: true,
    },
    {
      purpose: "thank_you",
      audience: "opted_in_supporters",
      timing: "after_event",
      reason: "Prepare a thank-you only for opted-in attendees or existing campaign relationships.",
      requiresHumanApproval: true,
    },
  ] satisfies EventOutreachPlan["recommendedEmails"];

  return {
    eventId: event.id ?? "unknown",
    title: event.title ?? "Untitled event",
    county,
    city,
    recommendedEmails: isConfirmed ? recommendedEmails : [],
    notRecommended: [
      "Do not blind-send to everyone near the event.",
      "Do not email voter-file-only records with no campaign contact basis.",
      "Do not send radius audiences until staff reviews/export-checks exact recipients.",
      "Do not auto-send because AI recommended this plan.",
    ],
    complianceWarnings: [
      "Every email requires human approval.",
      "Default live audiences exclude unknown consent.",
      "Suppression, bounce, spam-report, unsubscribe, and do-not-contact filters must pass before send.",
      "Live batch is capped at 25 unless a future policy changes it.",
    ],
  };
}
