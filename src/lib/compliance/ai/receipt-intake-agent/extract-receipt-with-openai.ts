import { formatOpenAIErrorForClient, getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { receiptExtractionSchema, type ReceiptExtractionModel } from "./receipt-agent-types";
import { classifyReceiptCategory } from "./receipt-category-classifier";
import { detectPaymentMethod } from "./payment-method-detector";

export async function extractReceiptWithOpenAI(input: {
  imageBase64?: string;
  mimeType?: string;
  manualText?: string;
}): Promise<ReceiptExtractionModel> {
  if (!isOpenAIConfigured() || (!input.imageBase64 && !input.manualText)) {
    return fallbackExtraction("OpenAI vision unavailable or no receipt image/text supplied.", input.manualText);
  }
  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [
      {
        type: "text",
        text:
          "Extract this campaign receipt into strict JSON with vendorName, receiptDate, receiptTime, subtotal, tax, tip, total, paymentMethod, cardLastFour, city, state, lineItems, suggestedCategory, suggestedPurpose, confidence, missingFields, warnings, humanReviewRequired:true. AI cannot approve or certify compliance.",
      },
    ];
    if (input.manualText) content.push({ type: "text", text: `Manual receipt text:\n${input.manualText.slice(0, 6000)}` });
    if (input.imageBase64 && input.mimeType) {
      content.push({ type: "image_url", image_url: { url: `data:${input.mimeType};base64,${input.imageBase64}` } });
    }
    const response = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
    });
    const raw = response.choices[0]?.message.content ?? "{}";
    const parsed = receiptExtractionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return fallbackExtraction("OpenAI receipt extraction returned invalid structure. Manual review required.", input.manualText);
    }
    return parsed.data;
  } catch (error) {
    return fallbackExtraction(formatOpenAIErrorForClient(error), input.manualText);
  }
}

function fallbackExtraction(warning: string, manualText?: string): ReceiptExtractionModel {
  return {
    suggestedCategory: classifyReceiptCategory({ lineText: manualText }),
    paymentMethod: detectPaymentMethod(manualText),
    confidence: "low",
    missingFields: ["vendor", "date", "total"],
    warnings: [warning, "Manual entry fallback is active. Human review required."],
    humanReviewRequired: true,
  };
}
