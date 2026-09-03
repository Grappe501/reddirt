import "server-only";
import { ARKANSAS_COUNTIES } from "@/data/kelly-county-visits";
import { extractCalendarIngest, type IngestImage } from "@/lib/calendar-admin/ingest";
import type { ProposedStop } from "@/lib/calendar-admin/types";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";
import {
  emptyCard,
  KELLY_ROLE_VALUES,
  MOBILIZE_VALUES,
  TABLING_VALUES,
  VOLUNTEERS_VALUES,
  FIELD_ATTENDANCE_VALUES,
  type SchedulerPublicCard,
} from "@/lib/scheduler/public-card-fields";

export type OscarDraft = {
  proposal: ProposedStop;
  card: SchedulerPublicCard;
  publicSummary: string;
  weakFields: string[];
};

function asAllowed<T extends string>(raw: unknown, allowed: readonly T[]): T | null {
  if (typeof raw !== "string") return null;
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : null;
}

function neighborSummary(stop: ProposedStop): string {
  const place = stop.city?.trim() || (stop.counties[0] ? `${stop.counties[0]} County` : "Arkansas");
  return `Kelly will be in ${place}. Details will be posted here when they are locked.`;
}

async function prefillPublicCard(stop: ProposedStop, sourceText: string): Promise<{
  card: SchedulerPublicCard;
  publicSummary: string;
  weakFields: string[];
}> {
  const fallback: SchedulerPublicCard = {
    ...emptyCard(),
    fieldAttendance: stop.confidence === "uncertain" ? "tentative" : "confirmed",
    kellyRole: "tba",
    tabling: "planned",
    volunteers: "needed",
    mobilize: "needed",
    needsMoreInfo: stop.confidence !== "confirmed" || !stop.city,
  };
  const weak: string[] = [];
  if (!stop.city) weak.push("City is missing.");
  if (!stop.counties.length) weak.push("County is missing.");
  if (!stop.startTime) weak.push("Start time is missing.");
  if (stop.confidence !== "confirmed") weak.push("Date or place is not locked yet.");

  if (!isOpenAIConfigured()) {
    return { card: fallback, publicSummary: neighborSummary(stop), weakFields: weak };
  }

  const { model } = getOpenAIConfigFromEnv();
  try {
    const client = getOpenAIClient();
    const res = await client.chat.completions.create({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You fill public event-card fields for Kelly Grappe for Secretary of State (Arkansas).
Return JSON only.
Neighbor-facing copy only. Never say "create Mobilize", "ticket", or internal ops language.
If Mobilize is not live, mobilize="needed" (public chip reads as signup coming).
If volunteers are not confirmed, volunteers="needed".
If Kelly speaking is unclear, kellyRole="tba".
If the date is soft, fieldAttendance="tentative". If Kelly will not attend, fieldAttendance="surrogate" and kellyRole="not_attending".
If details are incomplete, fieldAttendance="caution" and needsMoreInfo=true.
publicSummary: one or two short sentences. No emails, phones, or Zoom links.

Allowed:
fieldAttendance: ${FIELD_ATTENDANCE_VALUES.join("|")}
kellyRole: ${KELLY_ROLE_VALUES.join("|")}
tabling: ${TABLING_VALUES.join("|")}
volunteers: ${VOLUNTEERS_VALUES.join("|")}
mobilize: ${MOBILIZE_VALUES.join("|")}
mobilizeHref and volunteerHref: https URLs or empty.`,
        },
        {
          role: "user",
          content: `STOP: ${JSON.stringify({
            title: stop.publicTitle || stop.title,
            date: stop.date,
            city: stop.city,
            counties: stop.counties,
            startTime: stop.startTime,
            notes: stop.notes,
            confidence: stop.confidence,
          })}\n\nSOURCE (PII already stripped):\n${sourceText.slice(0, 4000)}\n\nCounties: ${ARKANSAS_COUNTIES.join(", ")}`,
        },
      ],
    });
    const parsed = JSON.parse(res.choices[0]?.message?.content || "{}") as Record<string, unknown>;
    const card: SchedulerPublicCard = {
      fieldAttendance: asAllowed(parsed.fieldAttendance, FIELD_ATTENDANCE_VALUES) ?? fallback.fieldAttendance,
      kellyRole: asAllowed(parsed.kellyRole, KELLY_ROLE_VALUES) ?? fallback.kellyRole,
      tabling: asAllowed(parsed.tabling, TABLING_VALUES) ?? fallback.tabling,
      volunteers: asAllowed(parsed.volunteers, VOLUNTEERS_VALUES) ?? fallback.volunteers,
      mobilize: asAllowed(parsed.mobilize, MOBILIZE_VALUES) ?? fallback.mobilize,
      mobilizeHref: typeof parsed.mobilizeHref === "string" && parsed.mobilizeHref.startsWith("https://")
        ? parsed.mobilizeHref.slice(0, 500)
        : null,
      volunteerHref: typeof parsed.volunteerHref === "string" && parsed.volunteerHref.startsWith("https://")
        ? parsed.volunteerHref.slice(0, 500)
        : null,
      needsMoreInfo: Boolean(parsed.needsMoreInfo) || fallback.needsMoreInfo,
    };
    const publicSummary =
      typeof parsed.publicSummary === "string" && parsed.publicSummary.trim()
        ? parsed.publicSummary.trim().slice(0, 400)
        : neighborSummary(stop);
    return { card, publicSummary, weakFields: weak };
  } catch (e) {
    return {
      card: fallback,
      publicSummary: neighborSummary(stop),
      weakFields: [...weak, formatOpenAIErrorForClient(e)],
    };
  }
}

export async function runOscarIngest(input: { text: string; images: IngestImage[] }): Promise<{
  drafts: OscarDraft[];
  ignored: Array<{ title: string; reason: string }>;
  warning?: string;
}> {
  const extracted = await extractCalendarIngest({
    text: input.text,
    images: input.images,
    existing: [],
  });
  const drafts: OscarDraft[] = [];
  for (const proposal of extracted.items.filter((item) => !item.skipAsPublic && item.includeOnPublicPage)) {
    const filled = await prefillPublicCard(proposal, input.text);
    drafts.push({ proposal, ...filled });
  }
  return {
    drafts,
    ignored: extracted.ignored,
    warning: extracted.warning,
  };
}
