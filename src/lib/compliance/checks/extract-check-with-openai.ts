import "server-only";

import { formatOpenAIErrorForClient, getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import {
  checkExtractionSchema,
  checkImageExtractionSchema,
  type CheckExtraction,
  type CheckImageExtraction,
} from "./check-extraction-types";

const MULTI_CHECK_PROMPT = `You are reviewing a PHOTO that may contain ONE OR MORE separate physical campaign contribution checks
(stacked, fanned, overlapping, or side-by-side on a table). Each distinct check is a separate contribution.

Return strict JSON only:
{
  "checks": [
    {
      "contributorFirstName", "contributorLastName", "contributorFullName",
      "address1", "address2", "city", "state", "zip",
      "employer", "occupation",
      "amount" (number),
      "checkNumber", "checkDate" (YYYY-MM-DD if possible), "receivedDate", "memo",
      "confidence": "high"|"medium"|"low",
      "missingFields": [field names not visible on THIS check],
      "warnings": [per-check notes],
      "humanReviewRequired": true
    }
  ],
  "imageWarnings": [photo-level notes],
  "estimatedCheckCount": number
}

Rules:
- Return one object in "checks" per distinct physical check visible in the photo.
- If you only see one check, return an array with one element.
- Do not merge multiple payors into one entry.
- Only extract text visible on each check. Do not invent employer, occupation, or address.
- If a check is partially obscured, extract what you can and list gaps in missingFields.`;

/** @deprecated Prefer extractChecksFromImageWithOpenAI for donation photos. */
export async function extractCheckWithOpenAI(input: {
  imageBase64?: string;
  mimeType?: string;
  manualText?: string;
}): Promise<CheckExtraction> {
  const multi = await extractChecksFromImageWithOpenAI(input);
  if (multi.checks.length === 1) return multi.checks[0];
  if (multi.checks.length > 1) {
    return {
      ...multi.checks[0],
      warnings: [
        ...multi.checks[0].warnings,
        `Photo contained ${multi.checks.length} checks; only the first was returned by legacy extract. Re-extract the image.`,
      ],
    };
  }
  return fallbackSingleCheck("No checks detected on image.", input.manualText);
}

export async function extractChecksFromImageWithOpenAI(input: {
  imageBase64?: string;
  mimeType?: string;
  manualText?: string;
}): Promise<CheckImageExtraction> {
  if (!isOpenAIConfigured() || (!input.imageBase64 && !input.manualText)) {
    return fallbackImageExtraction("OpenAI vision unavailable or no check image supplied.", input.manualText);
  }
  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
      { type: "text", text: MULTI_CHECK_PROMPT },
    ];
    if (input.manualText) content.push({ type: "text", text: `Operator notes:\n${input.manualText.slice(0, 4000)}` });
    if (input.imageBase64 && input.mimeType) {
      content.push({ type: "image_url", image_url: { url: `data:${input.mimeType};base64,${input.imageBase64}` } });
    }
    const response = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
    });
    const raw = response.choices[0]?.message.content ?? "{}";
    const parsed = checkImageExtractionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      const loose = JSON.parse(raw) as { checks?: unknown[] };
      if (Array.isArray(loose.checks) && loose.checks.length) {
        const checks: CheckExtraction[] = [];
        for (const item of loose.checks) {
          const one = checkExtractionSchema.safeParse(item);
          if (one.success) checks.push(one.data);
        }
        if (checks.length) {
          return {
            checks,
            imageWarnings: ["Response shape was repaired; verify every check on the photo."],
            estimatedCheckCount: checks.length,
          };
        }
      }
      return fallbackImageExtraction("Check extraction returned invalid structure. Review manually.", input.manualText);
    }
    if (!parsed.data.checks.length) {
      return fallbackImageExtraction("No checks detected on this photo.", input.manualText);
    }
    return parsed.data;
  } catch (error) {
    return fallbackImageExtraction(formatOpenAIErrorForClient(error), input.manualText);
  }
}

function fallbackSingleCheck(warning: string, manualText?: string): CheckExtraction {
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

function fallbackImageExtraction(warning: string, manualText?: string): CheckImageExtraction {
  return {
    checks: [fallbackSingleCheck(warning, manualText)],
    imageWarnings: [warning],
    estimatedCheckCount: 1,
  };
}
