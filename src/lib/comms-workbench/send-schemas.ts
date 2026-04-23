import {
  CommunicationSendStatus,
  CommunicationSendType,
  CommsWorkbenchChannel,
} from "@prisma/client";
import { z } from "zod";

/**
 * One approved source per send: either a draft or a variant, never both.
 * Variants are stored with the parent `communicationDraftId` plus optional `communicationVariantId`.
 */
export const createCommunicationSendSchema = z
  .object({
    communicationPlanId: z.string().min(1),
    communicationDraftId: z.string().optional(),
    communicationVariantId: z.string().optional(),
    channel: z.nativeEnum(CommsWorkbenchChannel),
    sendType: z.nativeEnum(CommunicationSendType).optional(),
    targetSegmentId: z
      .string()
      .optional()
      .transform((v) => {
        if (v == null) return undefined;
        const t = v.trim();
        return t.length ? t : undefined;
      }),
    /** ISO 8601 from client, or empty / omitted for an unscheduled planning send. */
    scheduledAt: z
      .string()
      .optional()
      .transform((v) => {
        if (v == null || v === "") return undefined;
        return v;
      }),
  })
  .refine(
    (d) => {
      const dCount = d.communicationDraftId ? 1 : 0;
      const vCount = d.communicationVariantId ? 1 : 0;
      return dCount + vCount === 1;
    },
    { message: "Provide exactly one of communicationDraftId or communicationVariantId." }
  );

export const updateCommunicationSendSchema = z.object({
  communicationSendId: z.string().min(1),
  scheduledAt: z.union([z.string().min(1), z.null()]).optional(),
  targetSegmentId: z.union([z.string().min(1), z.null()]).optional(),
  sendType: z.union([z.nativeEnum(CommunicationSendType), z.null()]).optional(),
  status: z.nativeEnum(CommunicationSendStatus).optional(),
});

export const cancelCommunicationSendSchema = z.object({
  communicationSendId: z.string().min(1),
});

/** Status values editable in the planning / intention phase (no delivery yet). */
export const PLANNING_COMMUNICATION_SEND_STATUSES: readonly CommunicationSendStatus[] = [
  CommunicationSendStatus.DRAFT,
  CommunicationSendStatus.QUEUED,
  CommunicationSendStatus.SCHEDULED,
];
