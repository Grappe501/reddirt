import {
  CommsWorkbenchChannel,
  SocialMessageTacticMode,
  SocialMessageToneMode,
} from "@prisma/client";
import { z } from "zod";

const channelZ = z.nativeEnum(CommsWorkbenchChannel);

const nullIfEmpty = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null) return undefined;
    const t = v.trim();
    return t.length ? t : undefined;
  });

const toneZ = z
  .union([z.nativeEnum(SocialMessageToneMode), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v));
const tacticZ = z
  .union([z.nativeEnum(SocialMessageTacticMode), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v));

/**
 * New draft in a plan — body is required (trimmed non-empty) for all channels in this pass.
 */
export const createCommunicationDraftSchema = z.object({
  communicationPlanId: z.string().min(1),
  channel: channelZ,
  title: nullIfEmpty,
  subjectLine: nullIfEmpty,
  previewText: nullIfEmpty,
  bodyCopy: z.string().refine((s) => s.trim().length > 0, { message: "Message body is required" }),
  shortCopy: nullIfEmpty,
  messageToneMode: toneZ,
  messageTacticMode: tacticZ,
  /** If true, mark primary (and clear other primaries for same plan+channel). If false/omitted, server may still set primary when this is the first draft for that channel. */
  isPrimary: z.boolean(),
});

/**
 * Update existing draft; omit fields you do not want to change (action merges with existing row).
 */
export const updateCommunicationDraftSchema = z
  .object({
    id: z.string().min(1),
    title: nullIfEmpty,
    subjectLine: nullIfEmpty,
    previewText: nullIfEmpty,
    bodyCopy: z.string().optional(),
    shortCopy: nullIfEmpty,
    messageToneMode: toneZ,
    messageTacticMode: tacticZ,
    isPrimary: z.boolean().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.bodyCopy !== undefined && d.bodyCopy.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Message body cannot be empty", path: ["bodyCopy"] });
    }
  });

export type CreateCommunicationDraftInput = z.infer<typeof createCommunicationDraftSchema>;
export type UpdateCommunicationDraftInput = z.infer<typeof updateCommunicationDraftSchema>;
