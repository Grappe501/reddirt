import { z } from "zod";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";
import type { OwnedMediaAsset } from "@prisma/client";
import pdfParse from "pdf-parse";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { readOwnedMediaFile } from "@/lib/owned-media/storage";

const rowSchema = z.object({
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  county: z.string().nullable().optional(),
  rawRowText: z.string(),
  confidence: z.number().min(0).max(1).optional(),
});

const extractSchema = z.object({
  rows: z.array(rowSchema),
  notes: z.string().optional(),
});

export type SignupRowExtracted = z.infer<typeof rowSchema>;

const SYSTEM = `You extract volunteer sign-up lines. Return only JSON with key "rows" (array). Each row:
- firstName, lastName, phone, email, address, county (use null if missing/illegible)
- rawRowText: the line or cell group as you read it
- confidence: 0-1
Never invent PII. If no rows, { "rows": [] }.`;

export type ExtractFromOwnedMediaResult =
  | { ok: true; rawOcrText: string; model: string; rows: SignupRowExtracted[]; avgConfidence: number | null; parsed: z.infer<typeof extractSchema> }
  | { ok: false; error: string; rawOcrText?: string };

function avgConf(rows: SignupRowExtracted[]): number | null {
  const nums = rows.map((r) => r.confidence).filter((c): c is number => typeof c === "number");
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function structureFromPlainText(plain: string, model: string): Promise<z.infer<typeof extractSchema>> {
  const client = getOpenAIClient();
  const res = await client.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Text from sheet/PDF (may be messy):\n\n${plain.slice(0, 32_000)}` },
    ],
  });
  const raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error("No model response");
  const j = JSON.parse(raw) as unknown;
  const p = extractSchema.safeParse(j);
  if (!p.success) return { rows: [] };
  return p.data;
}

/**
 * Read owned media, extract volunteer rows via OpenAI (vision for images, text for digital PDFs).
 */
export async function extractSignupRowsFromOwnedMedia(
  asset: Pick<OwnedMediaAsset, "id" | "storageKey" | "mimeType" | "kind" | "fileName">
): Promise<ExtractFromOwnedMediaResult> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY is not set; cannot run extraction." };
  }
  const { model: textModel } = getOpenAIConfigFromEnv();
  const visionModel = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o";

  const buf = await readOwnedMediaFile(asset.storageKey);
  const mime = asset.mimeType.toLowerCase();
  const isImage = mime.startsWith("image/") || asset.kind === "IMAGE";
  const isPdf = mime === "application/pdf" || asset.fileName.toLowerCase().endsWith(".pdf");

  try {
    if (isImage) {
      const b64 = buf.toString("base64");
      const mediaType = mime && mime !== "application/octet-stream" ? mime : "image/jpeg";
      const dataUrl = `data:${mediaType};base64,${b64}`;
      const client = getOpenAIClient();
      const userContent: ChatCompletionContentPart[] = [
        { type: "text", text: "Return JSON only. This is a photo of a paper volunteer sign-up sheet. Extract all signer rows." },
        { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
      ];
      const res = await client.chat.completions.create({
        model: visionModel,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userContent },
        ],
      });
      const rawOcr = res.choices[0]?.message?.content;
      if (!rawOcr) {
        return { ok: false, error: "Vision model returned no content." };
      }
      let parsed: z.infer<typeof extractSchema>;
      try {
        const j = JSON.parse(rawOcr) as unknown;
        const p = extractSchema.safeParse(j);
        if (!p.success) {
          parsed = await structureFromPlainText(`Model output (fix into valid rows JSON):\n${rawOcr}`, textModel);
        } else {
          parsed = p.data;
        }
      } catch {
        parsed = await structureFromPlainText(rawOcr, textModel);
      }
      return {
        ok: true,
        rawOcrText: rawOcr.slice(0, 200_000),
        model: visionModel,
        rows: parsed.rows,
        avgConfidence: avgConf(parsed.rows),
        parsed,
      };
    }

    if (isPdf) {
      const pdf = await pdfParse(buf);
      const text = (pdf.text ?? "").trim();
      if (text.length < 15) {
        return {
          ok: false,
          error:
            "This PDF has very little extractable text (it may be a scan). Upload clear photos of each page, or a text-based PDF export.",
          rawOcrText: text,
        };
      }
      const parsed = await structureFromPlainText(text, textModel);
      return {
        ok: true,
        rawOcrText: text.slice(0, 200_000),
        model: textModel,
        rows: parsed.rows,
        avgConfidence: avgConf(parsed.rows),
        parsed,
      };
    }

    return {
      ok: false,
      error: "Use a PNG or JPEG of the sign-up sheet, or a text-based PDF.",
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
