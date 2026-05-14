import { z } from "zod";

export const PUBLIC_SCHEDULE_EVENT_TYPES = [
  "county_party_meeting",
  "house_party",
  "civic_club",
  "school_campus",
  "fair_festival",
  "fundraiser",
  "listening_session",
  "church_community",
  "press_media",
  "volunteer_event",
  "other",
] as const;

export const PUBLIC_SCHEDULE_EVENT_TYPE_LABELS: Record<(typeof PUBLIC_SCHEDULE_EVENT_TYPES)[number], string> = {
  county_party_meeting: "County party meeting",
  house_party: "House party",
  civic_club: "Civic club",
  school_campus: "School / campus event",
  fair_festival: "Fair / festival",
  fundraiser: "Fundraiser",
  listening_session: "Listening session",
  church_community: "Church / community event",
  press_media: "Press / media",
  volunteer_event: "Volunteer event",
  other: "Other",
};

export const scheduleCampaignEventBodySchema = z
  .object({
    website: z.string().optional(),
    requesterName: z.string().min(1).max(200),
    organization: z.string().max(200).optional().nullable(),
    email: z.string().email().max(320),
    phone: z.string().min(7).max(40),
    eventTitle: z.string().min(2).max(200),
    eventType: z.enum(PUBLIC_SCHEDULE_EVENT_TYPES),
    county: z.string().min(1).max(100),
    city: z.string().max(120).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    preferredDate: z
      .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
      .optional()
      .nullable()
      .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
    alternateDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(12).optional().nullable(),
    /** One-per-line or comma-separated YYYY-MM-DD (optional). Merged into `alternateDates` server-side. */
    alternateDatesText: z.string().max(600).optional().nullable(),
    preferredStartTime: z.string().max(12).optional().nullable(),
    preferredEndTime: z.string().max(12).optional().nullable(),
    flexibility: z.enum(["exact_date_only", "same_week", "same_month", "campaign_suggests"]),
    audienceSize: z.number().int().positive().max(500_000).optional().nullable(),
    eventPurpose: z.string().max(4000).optional().nullable(),
    eventVisibility: z.enum(["public", "private"]),
    pressInvited: z.boolean(),
    pressReleaseInterest: z.enum(["no", "maybe", "yes", "staff_decide"]),
    localIssueAngle: z.string().max(2000).optional().nullable(),
    speakingRequested: z.boolean(),
    localHostAvailable: z.boolean(),
    notes: z.string().max(8000).optional().nullable(),
    permissionToContact: z.preprocess(
      (v) => v === true || v === "on",
      z.boolean().refine((x) => x === true, {
        message: "Please allow the campaign to contact you about this request.",
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.flexibility !== "campaign_suggests" && !data.preferredDate?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "preferredDate is required unless flexibility is campaign_suggests",
        path: ["preferredDate"],
      });
    }
  });

export type ScheduleCampaignEventBody = z.infer<typeof scheduleCampaignEventBodySchema>;

export function normalizeScheduleCampaignEventBody(body: ScheduleCampaignEventBody): ScheduleCampaignEventBody {
  const base = body.alternateDates?.filter(Boolean) ?? [];
  const extra =
    body.alternateDatesText?.trim() ?
      body.alternateDatesText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s))
    : [];
  const merged = [...base, ...extra].slice(0, 12);
  return {
    ...body,
    alternateDates: merged.length ? merged : null,
    alternateDatesText: null,
  };
}

export function toPersistedPublicScheduleBody(body: ScheduleCampaignEventBody) {
  const n = normalizeScheduleCampaignEventBody(body);
  const { alternateDatesText: _t, website: _w, ...rest } = n;
  return rest;
}

export function bodyToPublicSchedulingRequest(body: ScheduleCampaignEventBody) {
  return {
    requesterName: body.requesterName,
    organization: body.organization ?? undefined,
    email: body.email,
    phone: body.phone,
    eventTitle: body.eventTitle,
    eventType: body.eventType,
    county: body.county,
    city: body.city ?? undefined,
    address: body.address ?? undefined,
    preferredDate: body.preferredDate ?? undefined,
    alternateDates: body.alternateDates ?? undefined,
    preferredStartTime: body.preferredStartTime ?? undefined,
    preferredEndTime: body.preferredEndTime ?? undefined,
    flexibility: body.flexibility,
    audienceSize: body.audienceSize ?? undefined,
    speakingRequested: body.speakingRequested,
    pressInvited: body.pressInvited,
    localHostAvailable: body.localHostAvailable,
    notes: body.notes ?? undefined,
  };
}
