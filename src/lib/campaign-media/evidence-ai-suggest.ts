import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { formatMemoryForPrompt } from "@/lib/campaign-media/evidence-ai-memory";
import type { EvidenceAiSuggestion } from "@/lib/campaign-media/evidence-ai-types";
import type { PhotoEvidenceOverlay, SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";

const SUGGEST_SYSTEM = `You help a political campaign operator confirm evidence metadata for Arkansas campaign photos and videos.
Hard rules:
- Prefer "Unknown" over inventing county, city, venue, people, or dates.
- Never invent geography from clothing, guesswork, or vibes.
- Use confirmed past examples only as soft priors — if the current image does not clearly match, return Unknown.
- whatThisProves must be concrete campaign evidence language (listened/learned/visited/spoke/engaged), not marketing fluff.
- Return JSON only.`;

function parseSuggestion(raw: string): EvidenceAiSuggestion {
  const parsed = JSON.parse(raw) as Partial<EvidenceAiSuggestion>;
  const unk = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s || "Unknown";
  };
  const people = Array.isArray(parsed.peopleVisible)
    ? parsed.peopleVisible.map((p) => String(p).trim()).filter(Boolean)
    : [];
  const confidence =
    parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
      ? parsed.confidence
      : "low";
  return {
    county: unk(parsed.county),
    city: unk(parsed.city),
    venue: unk(parsed.venue),
    eventDate: unk(parsed.eventDate),
    eventName: unk(parsed.eventName),
    photographer: unk(parsed.photographer),
    peopleVisible: people,
    whatThisProves: String(parsed.whatThisProves ?? "").trim(),
    confidence,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
    rationale: String(parsed.rationale ?? "").trim(),
  };
}

function readPublicImageAsDataUrl(src: string): { dataUrl: string; mimeType: string } | null {
  if (!src.startsWith("/")) return null;
  const rel = src.replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", rel);
  if (!existsSync(abs)) return null;
  const buf = readFileSync(abs);
  const ext = path.extname(abs).toLowerCase();
  const mimeType =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : ext === ".gif"
          ? "image/gif"
          : "image/jpeg";
  // Cap roughly ~4MB base64 payload
  if (buf.length > 3_500_000) {
    return null;
  }
  return { dataUrl: `data:${mimeType};base64,${buf.toString("base64")}`, mimeType };
}

export async function suggestPhotoEvidenceWithAi(input: {
  photo: CampaignPhotoRecord;
  overlay: PhotoEvidenceOverlay | null;
}): Promise<{ ok: true; suggestion: EvidenceAiSuggestion } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY not configured in RedDirt .env / .env.local." };
  }

  const memory = formatMemoryForPrompt(12);
  const image = readPublicImageAsDataUrl(input.photo.src);
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();

  const userText = `Suggest evidence fields for this campaign photo.
Return JSON:
{
  "county": "short Arkansas county name or Unknown",
  "city": "city or Unknown",
  "venue": "venue or Unknown",
  "eventDate": "YYYY-MM-DD or Unknown",
  "eventName": "event name or Unknown",
  "photographer": "name or Unknown",
  "peopleVisible": ["names if clearly known"],
  "whatThisProves": "one concrete proof sentence",
  "confidence": "high|medium|low",
  "warnings": ["..."],
  "rationale": "short"
}

Registry baseline (may be Unknown):
id=${input.photo.id}
filename=${input.photo.basic.originalFilename}
caption=${input.photo.accessibility.caption}
alt=${input.photo.accessibility.altText}
eventName=${input.photo.campaign.eventName}
county=${input.photo.campaign.county}
city=${input.photo.campaign.city}
venue=${input.photo.campaign.venue}
people=${input.photo.campaign.peopleVisible.join(", ")}
overlay=${JSON.stringify(input.overlay ?? {})}

Confirmed past examples (soft priors only):
${memory}`;

  try {
    const content: Array<
      { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
    > = [{ type: "text", text: userText }];
    if (image) {
      content.push({ type: "image_url", image_url: { url: image.dataUrl } });
    } else {
      content.push({
        type: "text",
        text: "IMAGE UNAVAILABLE locally — suggest only from text metadata; prefer Unknown for geography.",
      });
    }

    const res = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SUGGEST_SYSTEM },
        { role: "user", content },
      ],
    });
    const raw = res.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) return { ok: false, error: "OpenAI returned empty suggestion." };
    const suggestion = parseSuggestion(raw);
    if (!image) {
      suggestion.warnings = [
        ...suggestion.warnings,
        "Local image bytes unavailable — geography should stay Unknown unless text already confirms it.",
      ];
      if (suggestion.confidence === "high") suggestion.confidence = "medium";
    }
    return { ok: true, suggestion };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}

export async function suggestSpeechEvidenceWithAi(input: {
  media: CampaignMediaRecord;
  overlay: SpeechEvidenceOverlay | null;
}): Promise<{ ok: true; suggestion: EvidenceAiSuggestion } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY not configured in RedDirt .env / .env.local." };
  }

  const memory = formatMemoryForPrompt(12);
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const userText = `Suggest evidence fields for this campaign speech/video (no invented geography).
Return JSON with county, city, venue, eventDate, eventName, photographer, peopleVisible, whatThisProves, confidence, warnings, rationale.
For speeches, county may be a short name; peopleVisible can include Kelly Grappe when she is the speaker.

Title: ${input.media.title}
Description: ${input.media.description}
Summary: ${input.media.summary ?? ""}
Topics: ${input.media.topics.join(", ")}
Existing counties: ${(input.media.counties ?? []).join(", ") || "none"}
Overlay: ${JSON.stringify(input.overlay ?? {})}

Confirmed past examples:
${memory}`;

  try {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SUGGEST_SYSTEM },
        { role: "user", content: userText },
      ],
    });
    const raw = res.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) return { ok: false, error: "OpenAI returned empty suggestion." };
    return { ok: true, suggestion: parseSuggestion(raw) };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}
