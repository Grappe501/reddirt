import { z } from "zod";

import { formatOpenAIErrorForClient, getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import {
  buildSanitizedPublicAvailability,
  classifyInstantAgainstAvailability,
  type PublicAvailabilityWindow,
} from "@/lib/calendar/public-availability";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

const TZ = "America/Chicago";

export type PublicSchedulingRequest = {
  requesterName?: string;
  organization?: string;
  email?: string;
  phone?: string;
  eventTitle?: string;
  eventType?: string;
  county?: string;
  city?: string;
  address?: string;
  preferredDate?: string;
  alternateDates?: string[];
  preferredStartTime?: string;
  preferredEndTime?: string;
  flexibility: "exact_date_only" | "same_week" | "same_month" | "campaign_suggests";
  audienceSize?: number;
  speakingRequested?: boolean;
  pressInvited?: boolean;
  localHostAvailable?: boolean;
  notes?: string;
};

export type PublicSchedulingAssistantResult = {
  intakeStatus:
    | "ready_to_submit"
    | "needs_more_information"
    | "suggest_alternative_times"
    | "staff_review_required";
  publicMessage: string;
  missingFields: string[];
  suggestedWindows: Array<{
    label: string;
    startAt: string;
    endAt: string;
    reasonPublic: string;
  }>;
  privateStaffFlags: Array<{
    flag:
      | "possible_conflict"
      | "travel_heavy"
      | "work_hours"
      | "needs_local_host"
      | "press_opportunity"
      | "send_local_candidate"
      | "high_priority_county"
      | "needs_verification";
    note: string;
  }>;
  recommendedTentativeEvent: {
    title: string;
    startAt?: string;
    endAt?: string;
    county?: string;
    city?: string;
    location?: string;
    eventType?: string;
    calendarLane: "TENTATIVE";
  };
};

const staffFlagSchema = z.object({
  flag: z.enum([
    "possible_conflict",
    "travel_heavy",
    "work_hours",
    "needs_local_host",
    "press_opportunity",
    "send_local_candidate",
    "high_priority_county",
    "needs_verification",
  ]),
  note: z.string(),
});

export const publicSchedulingAssistantResultSchema = z.object({
  intakeStatus: z.enum(["ready_to_submit", "needs_more_information", "suggest_alternative_times", "staff_review_required"]),
  publicMessage: z.string(),
  missingFields: z.array(z.string()),
  suggestedWindows: z.array(
    z.object({
      label: z.string(),
      startAt: z.string(),
      endAt: z.string(),
      reasonPublic: z.string(),
    }),
  ),
  privateStaffFlags: z.array(staffFlagSchema),
  recommendedTentativeEvent: z.object({
    title: z.string(),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
    county: z.string().optional(),
    city: z.string().optional(),
    location: z.string().optional(),
    eventType: z.string().optional(),
    calendarLane: z.literal("TENTATIVE"),
  }),
});

function requiredMissing(req: PublicSchedulingRequest): string[] {
  const m: string[] = [];
  if (!req.requesterName?.trim()) m.push("requesterName");
  if (!req.email?.trim()) m.push("email");
  if (!req.phone?.trim()) m.push("phone");
  if (!req.eventTitle?.trim()) m.push("eventTitle");
  if (!req.eventType?.trim()) m.push("eventType");
  if (!req.county?.trim()) m.push("county");
  if (req.flexibility !== "campaign_suggests" && !req.preferredDate?.trim()) m.push("preferredDate");
  return m;
}

function combineChicagoInstant(ymd: string, hm?: string | null): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const raw = (hm?.trim() || "12:00").replace(/(^\d{1,2}:\d{2}).*/, "$1");
  const m = /^(\d{1,2}):(\d{2})$/.exec(raw);
  if (!m) return null;
  const hh = Math.min(23, Math.max(0, parseInt(m[1]!, 10)));
  const mm = Math.min(59, Math.max(0, parseInt(m[2]!, 10)));
  const wall = parse(
    `${ymd} ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`,
    "yyyy-MM-dd HH:mm:ss",
    new Date(),
  );
  return fromZonedTime(wall, TZ).toISOString();
}

function pickSuggestedWindows(
  windows: PublicAvailabilityWindow[],
  count: number,
  afterYmd?: string,
): PublicSchedulingAssistantResult["suggestedWindows"] {
  const anchor = afterYmd && /^\d{4}-\d{2}-\d{2}$/.test(afterYmd) ? afterYmd : undefined;
  const open = windows.filter((w) => w.status === "open" || w.status === "soft_conflict");
  const sorted = [...open].sort((a, b) => a.startAt.localeCompare(b.startAt));
  const picked: PublicSchedulingAssistantResult["suggestedWindows"] = [];
  for (const w of sorted) {
    if (anchor && w.startAt.slice(0, 10) < anchor) continue;
    picked.push({
      label: `Option ${picked.length + 1}: ${w.startAt.slice(0, 10)} (central Arkansas time)`,
      startAt: w.startAt,
      endAt: w.endAt,
      reasonPublic:
        w.status === "soft_conflict"
          ? "That week already has several campaign commitments; this window is a gentler fit."
          : "This window looks lighter on the public-facing calendar density check.",
    });
    if (picked.length >= count) break;
  }
  return picked;
}

export function buildDeterministicPublicSchedulingResult(args: {
  request: PublicSchedulingRequest;
  travelItems: CampaignCalendarItem[];
  routeImpactMilesEstimate: number | null;
}): PublicSchedulingAssistantResult {
  const { request, travelItems, routeImpactMilesEstimate } = args;
  const missing = requiredMissing(request);
  const windows = buildSanitizedPublicAvailability(travelItems, {
    anchorYmd: request.preferredDate,
  });

  const staff: PublicSchedulingAssistantResult["privateStaffFlags"] = [];
  if (routeImpactMilesEstimate != null && routeImpactMilesEstimate > 160) {
    staff.push({ flag: "travel_heavy", note: `Rough centroid-to-hub distance ~${routeImpactMilesEstimate} mi (staff only).` });
  }
  if (!request.address?.trim()) {
    staff.push({ flag: "needs_verification", note: "Venue / address missing — confirm before tentative Google sync." });
  }
  if (request.pressInvited) {
    staff.push({ flag: "press_opportunity", note: "Host indicated press may attend — staff comms review." });
  }
  if (request.speakingRequested && !request.localHostAvailable) {
    staff.push({ flag: "needs_local_host", note: "Speaking requested without a confirmed local host/guide." });
  }

  if (missing.length) {
    return {
      intakeStatus: "needs_more_information",
      publicMessage:
        "Thanks for reaching out. A few details are still missing so staff can review your request fairly — please fill in the highlighted fields.",
      missingFields: missing,
      suggestedWindows: pickSuggestedWindows(windows, 3, request.preferredDate),
      privateStaffFlags: staff,
      recommendedTentativeEvent: {
        title: request.eventTitle?.trim() || "Requested campaign event",
        startAt: request.preferredDate ? combineChicagoInstant(request.preferredDate, request.preferredStartTime) ?? undefined : undefined,
        endAt: request.preferredDate ? combineChicagoInstant(request.preferredDate, request.preferredEndTime) ?? undefined : undefined,
        county: request.county,
        city: request.city,
        location: request.address,
        eventType: request.eventType,
        calendarLane: "TENTATIVE",
      },
    };
  }

  let intakeStatus: PublicSchedulingAssistantResult["intakeStatus"] = "ready_to_submit";
  let publicMessage =
    "We received the details you shared. Nothing is confirmed yet — staff will review and follow up by email.";
  const suggested = pickSuggestedWindows(windows, 3, request.preferredDate);

  if (request.preferredDate) {
    const inst = combineChicagoInstant(request.preferredDate, request.preferredStartTime);
    if (inst) {
      const hit = classifyInstantAgainstAvailability(inst, windows);
      if (hit?.status === "blocked") {
        intakeStatus = "suggest_alternative_times";
        publicMessage =
          "That date may be difficult given what we can share publicly about the schedule load. Here are a few windows that tend to work better — you can pick one or leave flexibility for staff.";
        staff.push({
          flag: "possible_conflict",
          note: "Preferred day shows heavy public-density scheduling; verify internally (no titles exposed publicly).",
        });
      } else if (hit?.status === "soft_conflict") {
        intakeStatus = "suggest_alternative_times";
        publicMessage =
          "That timing might be tight. If you can shift slightly, these alternative windows are easier fits — staff will still review everything.";
        staff.push({ flag: "possible_conflict", note: "Soft conflict on sanitized public calendar density." });
      }
    }
  }

  if (request.flexibility === "exact_date_only" && intakeStatus === "suggest_alternative_times") {
    intakeStatus = "staff_review_required";
    publicMessage =
      "You asked for a specific date only. We will route this to staff review rather than suggesting shifts you did not invite.";
  }

  return {
    intakeStatus,
    publicMessage,
    missingFields: [],
    suggestedWindows: suggested,
    privateStaffFlags: staff,
    recommendedTentativeEvent: {
      title: request.eventTitle!.trim(),
      startAt: request.preferredDate
        ? combineChicagoInstant(request.preferredDate, request.preferredStartTime) ?? undefined
        : undefined,
      endAt: request.preferredDate ? combineChicagoInstant(request.preferredDate, request.preferredEndTime) ?? undefined : undefined,
      county: request.county,
      city: request.city,
      location: request.address,
      eventType: request.eventType,
      calendarLane: "TENTATIVE",
    },
  };
}

const SYSTEM = `You are the Kelly Grappe campaign scheduling intelligence (same persona as internal Kelly agent) in PUBLIC-SAFE MODE.

You are helping a member of the public submit a scheduling request.
Do not reveal internal calendar details, private meeting titles, overnight locations, county strategy, internal priority scores, private phone numbers, or travel routes not already summarized as sanitized availability.
Do not promise Kelly will attend. Do not confirm availability. Route commitments to staff review.
Use only the provided publicAvailabilityWindows (status + public reasons) and the schedulingRequest object — never invent private facts.

Reply with JSON ONLY matching this shape:
{
  "intakeStatus": "ready_to_submit" | "needs_more_information" | "suggest_alternative_times" | "staff_review_required",
  "publicMessage": string,
  "missingFields": string[],
  "suggestedWindows": Array<{ "label": string, "startAt": string, "endAt": string, "reasonPublic": string }>,
  "privateStaffFlags": Array<{ "flag": "possible_conflict"|"travel_heavy"|"work_hours"|"needs_local_host"|"press_opportunity"|"send_local_candidate"|"high_priority_county"|"needs_verification", "note": string }>,
  "recommendedTentativeEvent": { "title": string, "startAt"?: string, "endAt"?: string, "county"?: string, "city"?: string, "location"?: string, "eventType"?: string, "calendarLane": "TENTATIVE" }
}

Max 3 suggestedWindows. privateStaffFlags notes are for staff only — still avoid private calendar titles.`;

export async function runPublicSchedulingAssistant(args: {
  request: PublicSchedulingRequest;
  travelItems: CampaignCalendarItem[];
  routeImpactMilesEstimate: number | null;
}): Promise<PublicSchedulingAssistantResult> {
  const base = buildDeterministicPublicSchedulingResult(args);
  if (!isOpenAIConfigured()) return base;

  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const windows = buildSanitizedPublicAvailability(args.travelItems, { anchorYmd: args.request.preferredDate });

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: JSON.stringify({
            schedulingRequest: args.request,
            publicAvailabilityWindows: windows,
            routeImpactMilesEstimate: args.routeImpactMilesEstimate,
            deterministicDraft: base,
          }),
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return base;
    const parsed = publicSchedulingAssistantResultSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return base;
    return parsed.data;
  } catch (e) {
    console.warn("runPublicSchedulingAssistant openai", formatOpenAIErrorForClient(e));
    return base;
  }
}

export function stripPrivateStaffFlagsForPublicResponse(
  r: PublicSchedulingAssistantResult,
): Omit<PublicSchedulingAssistantResult, "privateStaffFlags"> {
  const { privateStaffFlags: _p, ...rest } = r;
  return rest;
}
