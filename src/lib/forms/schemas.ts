import { z } from "zod";

const email = z.string().email("Enter a valid email.");
const phone = z
  .string()
  .optional()
  .transform((v) => (v?.trim() ? v.trim() : undefined));
const zip = z
  .string()
  .min(3, "ZIP or postal code looks too short.")
  .max(12, "ZIP or postal code looks too long.");
const county = z.string().max(80).optional();
const name = z.string().min(1, "Name is required.").max(120);
const honeypot = z
  .string()
  .optional()
  .refine((v) => !v || v.length === 0, "Spam detected.");

export const joinMovementSchema = z.object({
  formType: z.literal("join_movement"),
  name,
  email,
  phone: phone,
  zip,
  county,
  interests: z.array(z.string()).max(20).default([]),
  message: z.string().max(2000).optional(),
  website: honeypot,
});

export const volunteerSchema = z.object({
  formType: z.literal("volunteer"),
  name,
  email,
  phone: phone,
  zip,
  county,
  availability: z.string().max(500).optional(),
  skills: z.string().max(2000).optional(),
  leadershipInterest: z.boolean().default(false),
  interests: z.array(z.string()).max(20).default([]),
  website: honeypot,
});

export const localTeamSchema = z.object({
  formType: z.literal("local_team"),
  name,
  email,
  phone: phone,
  zip,
  county,
  community: z.string().min(1, "Tell us your town or community.").max(200),
  teamGoal: z.string().max(2000).optional(),
  website: honeypot,
});

export const directDemocracyCommitmentSchema = z.object({
  formType: z.literal("direct_democracy_commitment"),
  name,
  email,
  phone: phone,
  county: z.string().min(1, "County helps us route local action.").max(80),
  zip,
  referendumOptIn: z.boolean().default(false),
  smsOptIn: z.boolean().default(false),
  website: honeypot,
});

export const storySubmissionSchema = z.object({
  formType: z.literal("story_submission"),
  name: z.string().min(1).max(120),
  email,
  phone: phone,
  county: z.string().max(80).optional(),
  title: z.string().min(3, "Add a short title.").max(200),
  story: z.string().min(40, "Share a bit more detail—stories need at least a few sentences.").max(12000),
  consentPublic: z
    .boolean()
    .refine((v) => v === true, "Please confirm we may follow up and that you understand publishing rules."),
  website: honeypot,
});

export const gatheringTypeValues = [
  "front_porch",
  "living_room",
  "coffee_meetup",
  "listening_session",
  "issue_briefing",
  "other",
] as const;

/** Plain object for `discriminatedUnion` — refinements live on the union + form schema. */
export const hostGatheringShape = z.object({
  formType: z.literal("host_gathering"),
  name,
  email,
  phone: phone,
  zip,
  county,
  community: z.string().min(1, "Tell us the town or neighborhood.").max(200),
  gatheringType: z.enum(gatheringTypeValues),
  gatheringTypeOther: z.string().max(120).optional(),
  preferredTiming: z.string().max(500).optional(),
  expectedGuests: z.string().max(80).optional(),
  needs: z.string().max(2000).optional(),
  website: honeypot,
});

function refineHostGatheringOther(
  gatheringType: z.infer<typeof hostGatheringShape>["gatheringType"],
  gatheringTypeOther: string | undefined,
  ctx: z.RefinementCtx,
) {
  if (gatheringType === "other" && !gatheringTypeOther?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Add a short label for the gathering type.",
      path: ["gatheringTypeOther"],
    });
  }
}

export const hostGatheringSchema = hostGatheringShape.superRefine((data, ctx) =>
  refineHostGatheringOther(data.gatheringType, data.gatheringTypeOther, ctx),
);

export const formSubmissionSchema = z
  .discriminatedUnion("formType", [
    joinMovementSchema,
    volunteerSchema,
    localTeamSchema,
    directDemocracyCommitmentSchema,
    storySubmissionSchema,
    hostGatheringShape,
  ])
  .superRefine((data, ctx) => {
    if (data.formType === "host_gathering") {
      refineHostGatheringOther(data.gatheringType, data.gatheringTypeOther, ctx);
    }
  });

export type FormSubmissionInput = z.infer<typeof formSubmissionSchema>;
export type JoinMovementInput = z.infer<typeof joinMovementSchema>;
export type VolunteerInput = z.infer<typeof volunteerSchema>;
export type LocalTeamInput = z.infer<typeof localTeamSchema>;
export type DirectDemocracyCommitmentInput = z.infer<typeof directDemocracyCommitmentSchema>;
export type StorySubmissionInput = z.infer<typeof storySubmissionSchema>;
export type HostGatheringInput = z.infer<typeof hostGatheringSchema>;

const dateYmd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.");
const timeHm = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Use 24h time (HH:MM).");
const optionalHttpsUrl = z
  .string()
  .max(2000)
  .optional()
  .transform((v) => (v?.trim() ? v.trim() : undefined))
  .superRefine((v, ctx) => {
    if (v && !z.string().url().safeParse(v).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Use a full link (https://…).", path: [] });
    }
  });
const countyIdOptional = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .refine((v) => v === undefined || /^c[a-z0-9]+$/i.test(v), "Pick a valid county if listed.");

export const suggestCommunityEventSchema = z
  .object({
    eventName: z
      .string()
      .min(3, "Event name is required.")
      .max(200, "Name is a bit long — shorten?"),
    shortDescription: z.string().max(2000).optional(),
    startDate: dateYmd,
    startTime: timeHm,
    endDate: dateYmd,
    endTime: timeHm,
    city: z.string().max(120).optional(),
    countyId: countyIdOptional,
    venueName: z.string().max(200).optional(),
    infoUrl: optionalHttpsUrl,
    submitterName: name,
    submitterEmail: email,
    website: honeypot,
  })
  .superRefine((d, ctx) => {
    const a = d.startDate + d.startTime;
    const b = d.endDate + d.endTime;
    if (b < a) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End must be on or after start.", path: ["endTime"] });
    }
  });

export type SuggestCommunityEventInput = z.infer<typeof suggestCommunityEventSchema>;
