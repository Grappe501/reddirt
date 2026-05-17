import { getServerEnv } from "@/lib/env";
import type { CashSlipExtraction } from "./cash-slip-ocr-types";

export async function extractCashSlip(input: {
  imageBase64?: string;
  manualText?: string;
  enteredAmount?: number;
}): Promise<CashSlipExtraction> {
  const env = getServerEnv();
  const missingFields = [
    "donorFullName",
    "address1",
    "city",
    "state",
    "zip",
    "employer",
    "occupation",
    "contributionAmount",
    "contributionDate",
  ];

  if (!env.OPENAI_API_KEY) {
    return {
      contributionAmount: input.enteredAmount,
      confidence: "low",
      missingFields: input.enteredAmount ? missingFields.filter((field) => field !== "contributionAmount") : missingFields,
      warnings: ["OCR unavailable because OPENAI_API_KEY is not configured. Use manual entry and human review."],
      humanReviewRequired: true,
    };
  }

  return {
    contributionAmount: input.enteredAmount,
    confidence: "low",
    missingFields: input.enteredAmount ? missingFields.filter((field) => field !== "contributionAmount") : missingFields,
    warnings: [
      "OpenAI key is present, but Pass 1 does not send donor slip images to AI yet. Manual review remains required.",
      "Enable vision extraction only after image retention and privacy settings are approved.",
    ],
    humanReviewRequired: true,
  };
}
