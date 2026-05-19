import { formatOpenAIErrorForClient, getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { checkExtractionSchema, type CheckExtraction } from "./check-extraction-types";

export async function extractCheckWithOpenAI(input: {
  imageBase64?: string;
  mimeType?: string;
  manualText?: string;
}): Promise<CheckExtraction> {
  if (!isOpenAIConfigured() || (!input.imageBase64 && !input.manualText)) {
    return fallbackExtraction("OpenAI vision unavailable or no check image supplied.", input.manualText);
  }
  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
      {
        type: "text",
        text: `Extract this campaign contribution CHECK into strict JSON only. Fields:
contributorFirstName, contributorLastName, contributorFullName, address1, address2, city, state, zip,
employer, occupation, amount (number), checkNumber, checkDate (YYYY-MM-DD if possible), receivedDate, memo,
confidence (high|medium|low), missingFields (array of field names still not visible), warnings (array),
humanReviewRequired: true.
Rules: Only extract text visible on the check. Do not invent employer, occupation, or address. If not visible, omit and list in missingFields.`,
      },
    ];
    if (input.manualText) content.push({ type: "text", text: `Notes:\n${input.manualText.slice(0, 4000)}` });
    if (input.imageBase64 && input.mimeType) {
      content.push({ type: "image_url", image_url: { url: `data:${input.mimeType};base64,${input.imageBase64}` } });
    }
    const response = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
    });
    const raw = response.choices[0]?.message.content ?? "{}";
    const parsed = checkExtractionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return fallbackExtraction("Check extraction returned invalid structure. Review manually.", input.manualText);
    }
    return parsed.data;
  } catch (error) {
    return fallbackExtraction(formatOpenAIErrorForClient(error), input.manualText);
  }
}

function fallbackExtraction(warning: string, manualText?: string): CheckExtraction {
  return {
    confidence: "low",
    missingFields: [
      "contributorFullName",
      "address1",
      "city",
      "state",
      "zip",
      "employer",
      "occupation",
      "amount",
      "checkDate",
    ],
    warnings: [warning, manualText ? "Partial manual notes provided." : "Enter fields manually from the check image."],
    humanReviewRequired: true,
  };
}
