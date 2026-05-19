import { z } from "zod";

export const checkExtractionSchema = z.object({
  contributorFirstName: z.string().optional(),
  contributorLastName: z.string().optional(),
  contributorFullName: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  employer: z.string().optional(),
  occupation: z.string().optional(),
  amount: z.number().optional(),
  checkNumber: z.string().optional(),
  checkDate: z.string().optional(),
  receivedDate: z.string().optional(),
  memo: z.string().optional(),
  confidence: z.enum(["high", "medium", "low"]),
  missingFields: z.array(z.string()),
  warnings: z.array(z.string()),
  humanReviewRequired: z.literal(true),
});

export type CheckExtraction = z.infer<typeof checkExtractionSchema>;
