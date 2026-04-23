import { z } from "zod";

const optionalNote = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null) return undefined;
    const t = v.trim();
    return t.length ? t : undefined;
  });

const requiredNote = z
  .string()
  .min(1, "A review note is required")
  .transform((v) => v.trim());

export const requestCommunicationDraftReviewSchema = z.object({
  communicationDraftId: z.string().min(1),
  note: optionalNote,
});

export const approveCommunicationDraftSchema = z.object({
  communicationDraftId: z.string().min(1),
  note: optionalNote,
});

export const rejectCommunicationDraftSchema = z.object({
  communicationDraftId: z.string().min(1),
  note: requiredNote,
});

export const requestChangesCommunicationDraftSchema = z.object({
  communicationDraftId: z.string().min(1),
  note: requiredNote,
});

export const requestCommunicationVariantReviewSchema = z.object({
  communicationVariantId: z.string().min(1),
  note: optionalNote,
});

export const approveCommunicationVariantSchema = z.object({
  communicationVariantId: z.string().min(1),
  note: optionalNote,
});

export const rejectCommunicationVariantSchema = z.object({
  communicationVariantId: z.string().min(1),
  note: requiredNote,
});

export const requestChangesCommunicationVariantSchema = z.object({
  communicationVariantId: z.string().min(1),
  note: requiredNote,
});
