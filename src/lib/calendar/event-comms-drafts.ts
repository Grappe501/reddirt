import type { CampaignEvent, County, EventWorkflowState } from "@prisma/client";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { assertEventCommsDraftAllowed, type EventCommsDraftKind } from "@/lib/calendar/event-comms-policy";
import { EVENT_STAGE_LABEL } from "@/lib/calendar/event-lifecycle";

const DEFAULT_TONE =
  "Professional, neighborly, Oklahoma-rooted progressivism: concrete, inclusive, no partisan attacks on voters.";

function campaignTone() {
  return process.env.CAMPAIGN_COMMS_TONE?.trim() || DEFAULT_TONE;
}

function eventContextBlock(event: {
  title: string;
  eventType: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  locationName: string | null;
  address: string | null;
  publicSummary: string | null;
  internalSummary: string | null;
  eventWorkflowState: EventWorkflowState;
  county: Pick<County, "displayName"> | null;
}) {
  return [
    `Title: ${event.title}`,
    `Type: ${event.eventType.replaceAll("_", " ")}`,
    `Stage: ${EVENT_STAGE_LABEL[event.eventWorkflowState]}`,
    `When: ${event.startAt.toISOString()} → ${event.endAt.toISOString()} (${event.timezone})`,
    `Where: ${event.locationName || "TBD"}${event.address ? ` — ${event.address}` : ""}`,
    `County: ${event.county?.displayName || "TBD"}`,
    `Public blurb: ${(event.publicSummary || "").trim() || "—"}`,
    `Internal notes (staff): ${(event.internalSummary || "").trim() || "—"}`,
  ].join("\n");
}

function kindInstruction(kind: EventCommsDraftKind, mode: "internal" | "outward") {
  const scope =
    mode === "internal"
      ? "STAFF-ONLY DRAFT — not to be sent to voters/RSVPs as a final. Label clearly for internal coordination."
      : "Suitable to send to the described audience. Obey opt-in / consent norms.";

  switch (kind) {
    case "reminder_sms":
      return `${scope} Write a single SMS, <= 300 characters, with event title, one-line time+place, and one RSVP/clear ask. No markdown.`;
    case "reminder_email":
      return `${scope} Write a short plain-text email body (subject line on first line as "Subject: ..."). 120–200 words.`;
    case "cancellation":
      return `${scope} Regretful cancellation notice. Time, what changed, any reschedule pointer.`;
    case "thank_you":
      return `${scope} Post-event thank-you. Acknowledge attendance and one forward-looking CTA.`;
    case "volunteer_followup":
      return `${scope} Thank volunteers and point to a next step (event, link placeholder [LINK], or reply).`;
    default:
      return scope;
  }
}

export type EventCommsDraftInput = Pick<
  CampaignEvent,
  | "title"
  | "eventType"
  | "startAt"
  | "endAt"
  | "timezone"
  | "locationName"
  | "address"
  | "publicSummary"
  | "internalSummary"
  | "eventWorkflowState"
> & { county: Pick<County, "displayName"> | null };

/**
 * OpenAI draft for a calendar-tied comms template.
 */
export async function generateEventCommsMessageDraft(
  event: EventCommsDraftInput,
  kind: EventCommsDraftKind
): Promise<{ text: string } | { error: string }> {
  if (!isOpenAIConfigured()) {
    return { error: "OpenAI is not configured (OPENAI_API_KEY)." };
  }
  let mode: "internal" | "outward";
  try {
    mode = assertEventCommsDraftAllowed(event.eventWorkflowState, kind).mode;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "This draft is not allowed at the current event stage." };
  }
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const sys = [
    "You are a campaign comms drafter for an Oklahoma state-level field program.",
    `Tone: ${campaignTone()}`,
    kindInstruction(kind, mode),
  ].join(" ");

  const res = await client.chat.completions.create({
    model,
    temperature: 0.4,
    messages: [
      { role: "system", content: sys },
      {
        role: "user",
        content: `Create the copy now.\n\n${eventContextBlock(event)}`,
      },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim() ?? "";
  if (!text) return { error: "OpenAI returned empty text." };
  return { text };
}
