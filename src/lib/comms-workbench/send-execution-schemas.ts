import { z } from "zod";

export const claimCommunicationSendSchema = z.object({
  communicationSendId: z.string().min(1),
});

export const executeCommunicationSendSchema = z.object({
  communicationSendId: z.string().min(1),
  toEmail: z.string().email().optional(),
  toPhone: z.string().min(3).optional(),
});

export const executeNextQueuedSendInPlanSchema = z.object({
  communicationPlanId: z.string().min(1),
  toEmail: z.string().email().optional(),
  toPhone: z.string().min(3).optional(),
});

export const resetFailedSendToQueuedSchema = z.object({
  communicationSendId: z.string().min(1),
});
