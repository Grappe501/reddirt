import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { CampaignEventEmailDraft, EmailDraftType } from "./review-meta";
import type { CampaignEventFactCardData } from "./fact-card-data";

export function buildEmailDraft(input: {
  type: EmailDraftType;
  calendar: CampaignCalendarItem;
  factCard: CampaignEventFactCardData;
  missingChecklist: string[];
  to?: string;
}): CampaignEventEmailDraft {
  const { calendar, factCard } = input;
  const title = calendar.title;
  const date = String(calendar.start).slice(0, 10);
  const host = factCard.who.hostName ?? factCard.who.hostOrganization ?? "host";
  const to = input.to?.trim() || factCard.who.hostEmail?.trim() || "";

  const bodies: Record<EmailDraftType, { subject: string; body: string }> = {
    confirm_event_details: {
      subject: `Confirm campaign event details — ${title} (${date})`,
      body: `Hello ${host},\n\nWe are preparing Kelly Grappe's campaign schedule and want to confirm the details for:\n\n• Event: ${title}\n• Date: ${date}\n${calendar.location ? `• Location on file: ${calendar.location}\n` : ""}\nPlease confirm time, address, and whether Kelly is expected in person or via Zoom.\n\nThank you,\nKelly Grappe for Secretary of State`,
    },
    ask_address_location: {
      subject: `Location needed — ${title} (${date})`,
      body: `Hello ${host},\n\nFor our records and travel planning, could you share the full venue address (street, city, zip) for ${title} on ${date}?\n\nCity-level is helpful if the street address is not finalized yet.\n\nThank you,`,
    },
    ask_host_contact: {
      subject: `Host contact — ${title} (${date})`,
      body: `Hello,\n\nCould you share the best day-of contact (name, phone, email) for ${title} on ${date}?\n\nThank you,`,
    },
    ask_speaking_slot: {
      subject: `Speaking role — ${title} (${date})`,
      body: `Hello ${host},\n\nWill Kelly have a speaking slot at ${title}? If so, what time and for how long?\n\nThank you,`,
    },
    ask_table_materials: {
      subject: `Tabling / materials — ${title} (${date})`,
      body: `Hello ${host},\n\nWill there be a marketing table or materials setup at ${title}? What should we bring (literature, signs, donation QR, etc.)?\n\nThank you,`,
    },
    ask_volunteer_logistics: {
      subject: `Volunteer logistics — ${title} (${date})`,
      body: `Hello ${host},\n\nAre volunteers needed for ${title}? If yes, how many and where should they meet?\n\nThank you,`,
    },
    ask_attendance_audience: {
      subject: `Audience & attendance — ${title} (${date})`,
      body: `Hello ${host},\n\nWho is being invited (expected attendance, cross-aisle guests, etc.) for ${title} on ${date}?\n\nThank you,`,
    },
  };

  const pack = bodies[input.type];
  return {
    type: input.type,
    to: to || undefined,
    subject: pack.subject,
    body: pack.body,
    relatedEventTitle: title,
    missingChecklist: input.missingChecklist,
    savedAt: new Date().toISOString(),
  };
}
