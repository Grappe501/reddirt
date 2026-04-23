import { z } from "zod";

export const retryCommunicationSendSchema = z.object({
  communicationSendId: z.string().min(1),
});
