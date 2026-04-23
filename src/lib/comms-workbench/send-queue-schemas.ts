import { z } from "zod";

export const queueCommunicationSendSchema = z.object({
  communicationSendId: z.string().min(1),
});

export const unqueueCommunicationSendSchema = z.object({
  communicationSendId: z.string().min(1),
});
