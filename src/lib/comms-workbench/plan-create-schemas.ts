import { CampaignTaskPriority, CommunicationObjective } from "@prisma/client";
import { z } from "zod";

const nullIfEmpty = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null) return undefined;
    const t = v.trim();
    return t.length ? t : undefined;
  });

const optionalCuid = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? undefined : v.trim()));

/** Form inputs often send "" for optional datetimes. */
const optionalDateTime = z
  .union([z.string(), z.undefined(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === "") return undefined;
    const d = new Date(String(v));
    return Number.isNaN(d.getTime()) ? undefined : d;
  });

/**
 * Create a `CommunicationPlan` with optional single upstream source (at most one of the four FKs).
 * Direct/blank start: leave all source FKs unset.
 */
export const createCommunicationPlanSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(500),
    objective: z.nativeEnum(CommunicationObjective),
    priority: z.nativeEnum(CampaignTaskPriority).optional(),
    summary: nullIfEmpty,
    ownerUserId: optionalCuid,
    requestedByUserId: optionalCuid,
    dueAt: optionalDateTime,
    scheduledAt: optionalDateTime,
    sourceType: nullIfEmpty,
    sourceWorkflowIntakeId: optionalCuid,
    sourceCampaignTaskId: optionalCuid,
    sourceEventId: optionalCuid,
    sourceSocialContentItemId: optionalCuid,
  })
  .superRefine((d, ctx) => {
    const n = [
      d.sourceWorkflowIntakeId,
      d.sourceCampaignTaskId,
      d.sourceEventId,
      d.sourceSocialContentItemId,
    ].filter(Boolean).length;
    if (n > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link at most one source (intake, task, event, or social item).",
      });
    }
  });

export const createCommunicationPlanFromWorkflowIntakeSchema = z.object({
  workflowIntakeId: z.string().min(1, "Intake is required"),
  title: nullIfEmpty,
  summary: nullIfEmpty,
  objective: z.nativeEnum(CommunicationObjective),
  priority: z.nativeEnum(CampaignTaskPriority).optional(),
  dueAt: optionalDateTime,
  scheduledAt: optionalDateTime,
});

export const createCommunicationPlanFromCampaignTaskSchema = z.object({
  campaignTaskId: z.string().min(1, "Task is required"),
  title: nullIfEmpty,
  summary: nullIfEmpty,
  objective: z.nativeEnum(CommunicationObjective),
  dueAt: optionalDateTime,
  scheduledAt: optionalDateTime,
});

export const createCommunicationPlanFromCampaignEventSchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  title: nullIfEmpty,
  summary: nullIfEmpty,
  objective: z.nativeEnum(CommunicationObjective),
  priority: z.nativeEnum(CampaignTaskPriority).optional(),
  dueAt: optionalDateTime,
  scheduledAt: optionalDateTime,
});

export const createCommunicationPlanFromSocialContentItemSchema = z.object({
  socialContentItemId: z.string().min(1, "Social work item is required"),
  title: nullIfEmpty,
  summary: nullIfEmpty,
  objective: z.nativeEnum(CommunicationObjective),
  priority: z.nativeEnum(CampaignTaskPriority).optional(),
  dueAt: optionalDateTime,
  scheduledAt: optionalDateTime,
});

export type CreateCommunicationPlanInput = z.infer<typeof createCommunicationPlanSchema>;
export type CreateCommunicationPlanFromWorkflowIntakeInput = z.infer<
  typeof createCommunicationPlanFromWorkflowIntakeSchema
>;
export type CreateCommunicationPlanFromCampaignTaskInput = z.infer<typeof createCommunicationPlanFromCampaignTaskSchema>;
export type CreateCommunicationPlanFromCampaignEventInput = z.infer<typeof createCommunicationPlanFromCampaignEventSchema>;
export type CreateCommunicationPlanFromSocialContentItemInput = z.infer<
  typeof createCommunicationPlanFromSocialContentItemSchema
>;
