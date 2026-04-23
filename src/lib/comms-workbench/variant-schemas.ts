import { CommunicationVariantType, CommsWorkbenchChannel } from "@prisma/client";
import { z } from "zod";

const nullIfEmpty = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null) return undefined;
    const t = v.trim();
    return t.length ? t : undefined;
  });

const optionalMultiline = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null) return undefined;
    const t = v.trim();
    return t.length ? t : undefined;
  });

const channelForCreate = z
  .union([z.nativeEnum(CommsWorkbenchChannel), z.literal(""), z.null(), z.undefined()])
  .optional()
  .transform((v) => (v === "" || v == null || v === undefined ? null : v));

const variantTypeZ = z.nativeEnum(CommunicationVariantType);

/**
 * New variant: references one draft; override fields are optional. Null/empty on the DB row means
 * “use base draft at read time” (no merge engine; convention only).
 */
export const createCommunicationVariantSchema = z.object({
  communicationDraftId: z.string().min(1, "Draft is required"),
  variantType: variantTypeZ,
  targetSegmentId: nullIfEmpty,
  targetSegmentLabel: nullIfEmpty,
  channelOverride: channelForCreate,
  subjectLineOverride: optionalMultiline,
  bodyCopyOverride: optionalMultiline,
  ctaOverride: optionalMultiline,
});

const nullableTrimmed = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined) return undefined;
    if (v == null) return null;
    const t = v.trim();
    return t.length ? t : null;
  });

const channelForUpdate = z
  .union([z.nativeEnum(CommsWorkbenchChannel), z.null(), z.undefined()])
  .optional()
  .transform((v) => (v === undefined ? undefined : v));

/**
 * Partial update. Each field: omit to leave unchanged; `null` clears nullable strings / channel.
 */
export const updateCommunicationVariantSchema = z
  .object({
    id: z.string().min(1),
    variantType: variantTypeZ.optional(),
    targetSegmentId: nullableTrimmed,
    targetSegmentLabel: nullableTrimmed,
    channelOverride: channelForUpdate,
    subjectLineOverride: nullableTrimmed,
    bodyCopyOverride: nullableTrimmed,
    ctaOverride: nullableTrimmed,
  })
  .superRefine((d, ctx) => {
    const { id, ...rest } = d;
    if (id.length === 0) return;
    const touched = Object.values(rest).some((v) => v !== undefined);
    if (!touched) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one field to update is required" });
    }
  });

export const deleteCommunicationVariantSchema = z.object({
  id: z.string().min(1),
});

export type CreateCommunicationVariantInput = z.infer<typeof createCommunicationVariantSchema>;
export type UpdateCommunicationVariantInput = z.infer<typeof updateCommunicationVariantSchema>;
export type DeleteCommunicationVariantInput = z.infer<typeof deleteCommunicationVariantSchema>;
