import { z } from "zod";

export const receiptPaymentMethodSchema = z.enum(["campaign_card", "campaign_check", "personal_reimbursement", "cash", "unknown"]);
export const receiptExpenseCategorySchema = z.enum([
  "meals",
  "travel",
  "lodging",
  "fuel",
  "printing",
  "postage",
  "event_supplies",
  "office_supplies",
  "software",
  "advertising",
  "fundraising",
  "bank_fee",
  "staff_payment",
  "consulting",
  "other",
  "unknown",
]);

export const receiptExtractionSchema = z.object({
  vendorName: z.string().optional(),
  receiptDate: z.string().optional(),
  receiptTime: z.string().optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  tip: z.number().optional(),
  total: z.number().optional(),
  paymentMethod: receiptPaymentMethodSchema.optional(),
  cardLastFour: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  lineItems: z.array(z.object({ description: z.string(), amount: z.number().optional() })).optional(),
  suggestedCategory: receiptExpenseCategorySchema,
  suggestedPurpose: z.string().optional(),
  confidence: z.enum(["high", "medium", "low"]),
  missingFields: z.array(z.string()),
  warnings: z.array(z.string()),
  humanReviewRequired: z.literal(true),
});

export type ReceiptExtractionModel = z.infer<typeof receiptExtractionSchema>;

export type ReceiptAgentTool = {
  name: string;
  purpose: string;
  canDo: string[];
  cannotDo: string[];
};

export const receiptIntakeAgentTools: ReceiptAgentTool[] = [
  {
    name: "Receipt Extraction Tool",
    purpose: "Extract visible receipt fields into structured JSON.",
    canDo: ["read vendor/date/amounts if visible", "flag unclear totals", "suggest category and purpose"],
    cannotDo: ["approve expense", "certify legal compliance", "hide missing fields"],
  },
  {
    name: "Human Approval Guard",
    purpose: "Ensure receipt entries remain staged until a human approves.",
    canDo: ["explain missing approvals", "require reviewer initials"],
    cannotDo: ["approve", "mark paid", "mark reconciled"],
  },
];
