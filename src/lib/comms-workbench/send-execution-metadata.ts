import { CommunicationSendType } from "@prisma/client";
import { z } from "zod";

/**
 * Optional `metadataJson.commsExecution` on `CommunicationSend` for outbound addressing.
 * No audience engine — thread link or explicit test/ops addresses only.
 */
export const commsExecutionMetadataSchema = z
  .object({
    executionThreadId: z.string().min(1).optional(),
    toEmail: z.string().email().optional(),
    toPhone: z.string().min(3).optional(),
    /** When true, allows `toEmail` / `toPhone` without thread (guarded). */
    executionAllowDirectAddress: z.boolean().optional(),
  })
  .strict();

export type CommsExecutionMetadata = z.infer<typeof commsExecutionMetadataSchema>;

export function parseCommsExecutionMetadata(metadataJson: unknown): CommsExecutionMetadata {
  if (metadataJson == null || typeof metadataJson !== "object") return {};
  const root = metadataJson as { commsExecution?: unknown };
  if (root.commsExecution == null || typeof root.commsExecution !== "object") return {};
  const r = commsExecutionMetadataSchema.safeParse(root.commsExecution);
  return r.success ? r.data : {};
}

export function canUseDirectExecutionAddress(params: {
  sendType: CommunicationSendType | null;
  meta: CommsExecutionMetadata;
}): boolean {
  if (params.sendType === CommunicationSendType.TEST) return true;
  return params.meta.executionAllowDirectAddress === true;
}
