import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ImageExtractionResult } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OpenAIClient = { chat: { completions: { create: (args: any) => Promise<{ choices: Array<{ message?: { content?: string } }> }> } } };

export async function loadImageAsJpegBase64(filePath: string): Promise<{ base64: string; mimeType: string }> {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await readFile(filePath);
  if (ext === ".heic") {
    const sharp = await import("sharp");
    const jpeg = await sharp.default(buffer).jpeg({ quality: 90 }).toBuffer();
    return { base64: jpeg.toString("base64"), mimeType: "image/jpeg" };
  }
  const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
  return { base64: buffer.toString("base64"), mimeType };
}

export async function extractImageDocument(input: {
  filePath: string;
  documentType: "check" | "receipt" | "in_kind";
  openai: OpenAIClient | null;
  model: string;
}): Promise<ImageExtractionResult> {
  if (!input.openai) {
    return {
      documentType: input.documentType,
      confidence: "low",
      warnings: ["OPENAI_API_KEY not configured — manual entry required."],
      humanReviewRequired: true,
    };
  }

  const { base64, mimeType } = await loadImageAsJpegBase64(input.filePath);
  const prompt =
    input.documentType === "check"
      ? "Extract check contribution: donor name, check number, date, amount, bank memo if visible, city/state. JSON only."
      : input.documentType === "in_kind"
        ? "Extract in-kind donation: donor name, date, description of goods/services, estimated fair market value amount, location. JSON only."
        : "Extract expense receipt: vendor, date, subtotal, tax, tip, total, city, state, line items. JSON only.";

  try {
    const response = await input.openai.chat.completions.create({
      model: input.model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${prompt} Fields: vendorOrDonor, amountCents (integer), transactionDate (YYYY-MM-DD), city, state, checkNumber, description, confidence (high|medium|low), warnings (array). humanReviewRequired must be true.`,
            },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
          ],
        },
      ],
    });
    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as Partial<ImageExtractionResult>;
    return {
      documentType: input.documentType,
      vendorOrDonor: parsed.vendorOrDonor,
      amountCents: typeof parsed.amountCents === "number" ? parsed.amountCents : undefined,
      transactionDate: parsed.transactionDate,
      city: parsed.city,
      state: parsed.state,
      checkNumber: parsed.checkNumber,
      description: parsed.description,
      confidence: parsed.confidence === "high" || parsed.confidence === "medium" ? parsed.confidence : "low",
      warnings: [...(parsed.warnings ?? []), "AI extraction — compliance officer review required."],
      humanReviewRequired: true,
      rawText: raw.slice(0, 4000),
    };
  } catch (error) {
    return {
      documentType: input.documentType,
      confidence: "low",
      warnings: [error instanceof Error ? error.message : "Vision extraction failed"],
      humanReviewRequired: true,
    };
  }
}

export function imageExtractionChunk(fileName: string, extraction: ImageExtractionResult): string {
  return [
    `April 2026 ${extraction.documentType} image: ${fileName}`,
    extraction.vendorOrDonor ? `Party: ${extraction.vendorOrDonor}` : "",
    extraction.transactionDate ? `Date: ${extraction.transactionDate}` : "",
    extraction.amountCents != null ? `Amount: $${(extraction.amountCents / 100).toFixed(2)}` : "",
    extraction.city || extraction.state ? `Location: ${[extraction.city, extraction.state].filter(Boolean).join(", ")}` : "",
    extraction.checkNumber ? `Check #: ${extraction.checkNumber}` : "",
    extraction.description ? `Description: ${extraction.description}` : "",
    `Confidence: ${extraction.confidence}`,
    `Warnings: ${extraction.warnings.join("; ")}`,
    `Reconcile: match to Ethics workbook row and bank statement line by date ±3 days and amount.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sha256File(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}
