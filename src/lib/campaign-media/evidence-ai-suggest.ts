import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { runEvidenceAiBrain } from "@/lib/campaign-media/evidence-ai-brain";
import { formatMemoryForPrompt } from "@/lib/campaign-media/evidence-ai-memory";
import type { EvidenceAiSuggestion } from "@/lib/campaign-media/evidence-ai-types";
import type { PhotoEvidenceOverlay, SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";

function readPublicImageAsDataUrl(src: string): string | null {
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
  if (buf.length > 3_500_000) return null;
  return `data:${mimeType};base64,${buf.toString("base64")}`;
}

export async function suggestPhotoEvidenceWithAi(input: {
  photo: CampaignPhotoRecord;
  overlay: PhotoEvidenceOverlay | null;
}): Promise<{ ok: true; suggestion: EvidenceAiSuggestion } | { ok: false; error: string }> {
  const memory = formatMemoryForPrompt(12);
  const imageDataUrl = readPublicImageAsDataUrl(input.photo.src);

  const userText = `Suggest evidence fields for this campaign PHOTO using tools when helpful.
Call lookup_arkansas_county before asserting a county.
Call search_calendar_presence / search_confirmed_memory / find_similar_campaign_photos when cues exist.
Call get_photo_file_basics / inspect_photo_pixels / suggest_crop_plan when useful for cropAdvice.
Prefer Unknown geography. Do not auto-create derivatives unless cropAdvice clearly needs a written file.
Do not invent geography.

Registry baseline (may be Unknown):
id=${input.photo.id}
filename=${input.photo.basic.originalFilename}
src=${input.photo.src}
caption=${input.photo.accessibility.caption}
alt=${input.photo.accessibility.altText}
eventName=${input.photo.campaign.eventName}
county=${input.photo.campaign.county}
city=${input.photo.campaign.city}
venue=${input.photo.campaign.venue}
people=${input.photo.campaign.peopleVisible.join(", ")}
overlay=${JSON.stringify(input.overlay ?? {})}
imageAttached=${Boolean(imageDataUrl)}

Confirmed past examples (soft priors only):
${memory}`;

  const result = await runEvidenceAiBrain({
    kind: "photo",
    userText,
    imageDataUrl,
  });
  if (!result.ok) return result;

  const suggestion = result.suggestion;
  if (!imageDataUrl) {
    suggestion.warnings = [
      ...suggestion.warnings,
      "Local image bytes unavailable — geography should stay Unknown unless text/tools already confirm it.",
    ];
    if (suggestion.confidence === "high") suggestion.confidence = "medium";
  }
  if (result.toolsUsed.length) {
    suggestion.warnings = [
      ...suggestion.warnings,
      `Tools used: ${result.toolsUsed.join(", ")}`,
    ];
  }
  return { ok: true, suggestion };
}

export async function suggestSpeechEvidenceWithAi(input: {
  media: CampaignMediaRecord;
  overlay: SpeechEvidenceOverlay | null;
}): Promise<{ ok: true; suggestion: EvidenceAiSuggestion } | { ok: false; error: string }> {
  const memory = formatMemoryForPrompt(12);

  const userText = `Suggest evidence fields for this campaign SPEECH/VIDEO using tools when helpful.
Call get_video_transcript_excerpt for youtubeVideoId=${input.media.youtubeVideoId} when useful.
Call plan_video_excerpt / probe_video_tooling when proposing short-clip speakerNotes.
Call lookup_arkansas_county before asserting counties.
Call search_calendar_presence / search_confirmed_memory / search_campaign_speeches for grounding.
Do not invent geography or spoken claims not supported by transcript/tools.

Title: ${input.media.title}
Description: ${input.media.description}
Summary: ${input.media.summary ?? ""}
Topics: ${input.media.topics.join(", ")}
Existing counties: ${(input.media.counties ?? []).join(", ") || "none"}
youtubeVideoId=${input.media.youtubeVideoId}
speechId=${input.media.id}
Overlay: ${JSON.stringify(input.overlay ?? {})}

Confirmed past examples:
${memory}`;

  const result = await runEvidenceAiBrain({
    kind: "video",
    userText,
  });
  if (!result.ok) return result;

  const suggestion = result.suggestion;
  if (result.toolsUsed.length) {
    suggestion.warnings = [
      ...suggestion.warnings,
      `Tools used: ${result.toolsUsed.join(", ")}`,
    ];
  }
  return { ok: true, suggestion };
}
