"use server";

import {
  CampaignEventStatus,
  CampaignEventType,
  CampaignEventVisibility,
  EventWorkflowState,
} from "@prisma/client";

import { COUNTY_PARTY_MONTHLY_CAMPAIGN_INTENT } from "@/lib/campaign-ops/county-party-meeting-intent";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { runEventCreatedWorkflows } from "@/lib/ops/workflow/runner";

export type CreateCountyPartyMeetingState =
  | { ok: true; message: string; eventId: string }
  | { ok: false; message: string };

export async function createCountyPartyMonthlyMeetingAction(
  _prev: CreateCountyPartyMeetingState,
  formData: FormData,
): Promise<CreateCountyPartyMeetingState> {
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      message:
        "DATABASE_URL is not set. Connect the database to publish this meeting to the campaign calendar and spawn workbench tasks.",
    };
  }

  const countySlug = String(formData.get("countySlug") ?? "").trim();
  const reg = getRegistryCountyBySlug(countySlug);
  if (!reg) return { ok: false, message: "Unknown Arkansas county slug." };

  const countyRow = await prisma.county.findUnique({ where: { slug: countySlug } });
  if (!countyRow) {
    return {
      ok: false,
      message:
        "County is not in the database yet. Run `npx prisma migrate deploy` and `npx prisma db seed`, or create the event from Admin → Events.",
    };
  }

  const titleIn = String(formData.get("title") ?? "").trim();
  const startRaw = String(formData.get("startAt") ?? "").trim();
  if (!startRaw) return { ok: false, message: "Start date and time are required." };
  const startAt = new Date(startRaw);
  if (Number.isNaN(startAt.getTime())) return { ok: false, message: "Invalid start date." };

  const locationName = String(formData.get("locationName") ?? "").trim() || null;
  const agenda = String(formData.get("agenda") ?? "").trim();
  const featuredSpeakers = String(formData.get("featuredSpeakers") ?? "").trim();
  const rsvpGoal = String(formData.get("rsvpGoal") ?? "").trim();
  const newAttendeeGoal = String(formData.get("newAttendeeGoal") ?? "").trim();

  const title = titleIn || `[County Democratic Party] ${reg.displayName} — Monthly meeting`;

  const internalSummary = [
    agenda && `Agenda:\n${agenda}`,
    featuredSpeakers && `Featured speakers:\n${featuredSpeakers}`,
    rsvpGoal && `RSVP goal: ${rsvpGoal}`,
    newAttendeeGoal && `New attendee goal: ${newAttendeeGoal}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const slug = `county-party-${countySlug}-${startAt.getTime()}`;
  const endAt = new Date(startAt.getTime() + 2 * 60 * 60 * 1000);

  const event = await prisma.campaignEvent.create({
    data: {
      slug,
      title,
      description: agenda || null,
      eventType: CampaignEventType.MEETING,
      status: CampaignEventStatus.SCHEDULED,
      visibility: CampaignEventVisibility.INTERNAL,
      countyId: countyRow.id,
      locationName,
      startAt,
      endAt,
      timezone: "America/Chicago",
      eventWorkflowState: EventWorkflowState.DRAFT,
      campaignIntent: COUNTY_PARTY_MONTHLY_CAMPAIGN_INTENT,
      internalSummary: internalSummary || null,
    },
  });

  await runEventCreatedWorkflows(event.id);

  return {
    ok: true,
    eventId: event.id,
    message:
      "Meeting saved on the campaign calendar. Workbench tasks: invite Power of 5 networks, RSVP follow-up, post-meeting volunteer report. Tie emails in Email Command Center to these tasks when automation is enabled.",
  };
}
