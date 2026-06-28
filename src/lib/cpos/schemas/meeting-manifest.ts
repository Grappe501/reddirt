import { z } from "zod";

const metricBeatSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  liveSource: z.enum(["truth_snapshot", "election_plan"]).optional().nullable(),
});

const scheduleSchema = z.object({
  timezone: z.string(),
  meetingStart: z.string(),
  meetingEnd: z.string(),
  programStart: z.string(),
});

const joinSchema = z.object({
  audiencePath: z.string(),
  presenterPath: z.string(),
  bannerCopy: z.string(),
  authPolicy: z.enum(["election_plan_login", "passcode", "unlisted"]),
  postMeetingPasscode: z.boolean().optional(),
});

const segmentSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

const chapterSchema = z.object({
  id: z.string(),
  index: z.number().int().nonnegative(),
  title: z.string(),
  scheduleStart: z.string().optional(),
  scheduleEnd: z.string().optional(),
  storyBeat: z.string().optional(),
  audienceMode: z.string().optional(),
  presenterAction: z.string().optional(),
  segments: z.array(segmentSchema).optional().default([]),
  cues: z.array(z.string()).optional(),
  primaryDemo: z.string().optional(),
  secondaryDemoCards: z.array(z.string()).optional(),
  interactions: z.array(z.string()).optional(),
  closingLine: z.string().optional(),
});

const demoLinkSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  path: z.string(),
  presentationQuery: z.record(z.string()).optional(),
  polishLevel: z.enum(["v1_primary", "card_only", "placeholder"]).optional(),
});

const pollOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const interactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["poll", "form", "button"]),
  prompt: z.string().optional(),
  options: z.array(pollOptionSchema).optional(),
  formKey: z.string().optional(),
});

const cueSchema = z.object({
  text: z.string(),
  chapters: z.array(z.string()),
  scheduleHint: z.string().optional(),
});

const timingSchema = z.object({
  useWallClock: z.boolean().optional(),
  chapterWarningsMinutesBeforeEnd: z.number().optional(),
  globalHardStopMinutes: z.number().optional(),
});

const completionSchema = z.object({
  analyticsOnly: z.boolean().optional(),
  replayVideo: z.boolean().optional(),
  formRouting: z
    .object({
      provider: z.literal("api_forms"),
      path: z.string(),
      formKey: z.string(),
      workflowIntakeType: z.string(),
    })
    .optional(),
});

const integrationsSchema = z
  .object({
    zoom: z.string().optional(),
    electionPlan: z.boolean().optional(),
    workflowIntake: z.boolean().optional(),
    powerOf5: z.boolean().optional(),
    realtimeV1: z.string().optional(),
  })
  .optional();

export const meetingManifestSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  version: z.number().int().positive(),
  meetingType: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  schedule: scheduleSchema,
  join: joinSchema,
  promise: z.string().optional(),
  openingDisclaimer: z.string().optional(),
  coreNumbers: z.array(metricBeatSchema).optional().default([]),
  media: z
    .object({
      openingVideo: z
        .object({
          id: z.string(),
          src: z.string(),
          placeholder: z.boolean().optional(),
          durationMinutes: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  chapters: z.array(chapterSchema).min(1),
  demos: z.record(demoLinkSchema).optional().default({}),
  interactions: z.record(interactionSchema).optional().default({}),
  cues: z.record(cueSchema).optional().default({}),
  timing: timingSchema.optional(),
  completion: completionSchema.optional(),
  integrations: integrationsSchema,
});

export type MeetingManifest = z.infer<typeof meetingManifestSchema>;
export type MeetingChapter = z.infer<typeof chapterSchema>;
export type MeetingSegment = z.infer<typeof segmentSchema>;
export type MetricBeat = z.infer<typeof metricBeatSchema>;
export type DemoLink = z.infer<typeof demoLinkSchema>;
export type MeetingInteraction = z.infer<typeof interactionSchema>;
export type MeetingCue = z.infer<typeof cueSchema>;

export function formatManifestZodError(error: z.ZodError): string {
  return error.issues
    .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
    .join("\n");
}
