import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { runEvidenceAiBrain } from "@/lib/campaign-media/evidence-ai-brain";
import { formatMemoryForPrompt } from "@/lib/campaign-media/evidence-ai-memory";
import type { EvidenceAiSuggestion, BatchPhotoAiProposal } from "@/lib/campaign-media/evidence-ai-types";
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
  mode?: import("@/lib/campaign-media/evidence-ai-modes").EvidenceAiMode | string;
}): Promise<
  | {
      ok: true;
      suggestion: EvidenceAiSuggestion;
      mode: import("@/lib/campaign-media/evidence-ai-modes").EvidenceAiMode;
      toolCount: number;
    }
  | { ok: false; error: string }
> {
  const memory = formatMemoryForPrompt(12);
  const imageDataUrl = readPublicImageAsDataUrl(input.photo.src);
  const { parseEvidenceAiMode } = await import("@/lib/campaign-media/evidence-ai-modes");
  const mode = parseEvidenceAiMode(input.mode ?? "identify");

  const userText = `Suggest evidence fields for this campaign PHOTO using tools when helpful (mode=${mode}).
Call lookup_arkansas_county before asserting a county.
Call search_calendar_presence / search_confirmed_memory / find_similar_campaign_photos when cues exist.
Stay inside the active mode tool subset. Prefer Unknown geography.
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
    mode,
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
  return { ok: true, suggestion, mode: result.mode, toolCount: result.toolCount };
}

export async function suggestSpeechEvidenceWithAi(input: {
  media: CampaignMediaRecord;
  overlay: SpeechEvidenceOverlay | null;
  mode?: import("@/lib/campaign-media/evidence-ai-modes").EvidenceAiMode | string;
}): Promise<
  | {
      ok: true;
      suggestion: EvidenceAiSuggestion;
      mode: import("@/lib/campaign-media/evidence-ai-modes").EvidenceAiMode;
      toolCount: number;
    }
  | { ok: false; error: string }
> {
  const memory = formatMemoryForPrompt(12);
  const { parseEvidenceAiMode } = await import("@/lib/campaign-media/evidence-ai-modes");
  const mode = parseEvidenceAiMode(input.mode ?? "identify");

  const userText = `Suggest evidence fields for this campaign SPEECH/VIDEO using tools when helpful (mode=${mode}).
Stay inside the active mode tool subset.
Call lookup_arkansas_county before asserting counties.
Prefer Unknown geography. Do not invent spoken claims not supported by transcript/tools.

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
    mode,
  });
  if (!result.ok) return result;

  const suggestion = result.suggestion;
  if (result.toolsUsed.length) {
    suggestion.warnings = [
      ...suggestion.warnings,
      `Tools used: ${result.toolsUsed.join(", ")}`,
    ];
  }
  return { ok: true, suggestion, mode: result.mode, toolCount: result.toolCount };
}

const BATCH_SHARED_FIELDS = [
  "county",
  "city",
  "venue",
  "eventDate",
  "eventName",
  "photographer",
  "peopleVisible",
  "whatThisProves",
] as const;

function recommendedFieldsFromSuggestion(s: EvidenceAiSuggestion, mixedGeography: boolean): string[] {
  const out: string[] = [];
  for (const key of BATCH_SHARED_FIELDS) {
    if (key === "peopleVisible") {
      if (s.peopleVisible.length) out.push(key);
      continue;
    }
    if (key === "whatThisProves") {
      if (s.whatThisProves.trim()) out.push(key);
      continue;
    }
    const v = String(s[key] ?? "").trim();
    if (!v || v === "Unknown") continue;
    if (mixedGeography && (key === "county" || key === "city" || key === "venue")) continue;
    out.push(key);
  }
  return out;
}

function parseBatchExtras(raw: string | undefined): {
  recommendedApplyFields: string[];
  perPhotoNotes: Array<{ photoId: string; note: string }>;
} {
  if (!raw) return { recommendedApplyFields: [], perPhotoNotes: [] };
  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as {
      recommendedApplyFields?: unknown;
      perPhotoNotes?: unknown;
    };
    const recommendedApplyFields = Array.isArray(parsed.recommendedApplyFields)
      ? parsed.recommendedApplyFields.map((f) => String(f).trim()).filter(Boolean)
      : [];
    const perPhotoNotes = Array.isArray(parsed.perPhotoNotes)
      ? parsed.perPhotoNotes
          .map((row) => {
            if (!row || typeof row !== "object") return null;
            const r = row as { photoId?: unknown; note?: unknown };
            const photoId = String(r.photoId ?? "").trim();
            const note = String(r.note ?? "").trim();
            if (!photoId || !note) return null;
            return { photoId, note };
          })
          .filter((x): x is { photoId: string; note: string } => Boolean(x))
          .slice(0, 24)
      : [];
    return { recommendedApplyFields, perPhotoNotes };
  } catch {
    return { recommendedApplyFields: [], perPhotoNotes: [] };
  }
}

export async function suggestBatchPhotoEvidenceWithAi(input: {
  photos: Array<{
    photo: CampaignPhotoRecord;
    overlay: PhotoEvidenceOverlay | null;
  }>;
  /** Prefer identify (default). Fit allowed; other modes coerce to identify for batch safety. */
  mode?: import("@/lib/campaign-media/evidence-ai-modes").EvidenceAiMode | string;
}): Promise<{ ok: true; proposal: BatchPhotoAiProposal } | { ok: false; error: string }> {
  const { clusterPhotoSelection } = await import("@/lib/campaign-media/cluster-photo-selection");
  const { parseEvidenceAiMode } = await import("@/lib/campaign-media/evidence-ai-modes");
  const requested = parseEvidenceAiMode(input.mode ?? "identify");
  const mode = requested === "fit" ? "fit" : "identify";
  const capped = input.photos.slice(0, 24);
  if (capped.length < 2) {
    return { ok: false, error: "Select at least 2 photos for batch AI suggest." };
  }

  const clusterInputs = capped.map(({ photo, overlay }) => ({
    id: photo.id,
    src: photo.src,
    caption: photo.accessibility.caption,
    county: overlay?.county ?? photo.campaign.county,
    city: overlay?.city ?? photo.campaign.city,
    venue: overlay?.venue ?? photo.campaign.venue,
    eventDate: overlay?.eventDate ?? photo.campaign.eventDate,
    eventName: overlay?.eventName ?? photo.campaign.eventName,
    filename: photo.basic.originalFilename,
  }));
  const clusters = clusterPhotoSelection(clusterInputs, { maxPhotos: 24 });

  const memory = formatMemoryForPrompt(12);
  const imageUrls: string[] = [];
  for (const row of capped.slice(0, 2)) {
    const url = readPublicImageAsDataUrl(row.photo.src);
    if (url) imageUrls.push(url);
  }

  const roster = capped
    .map(({ photo, overlay }, i) => {
      const c = overlay?.county ?? photo.campaign.county;
      const city = overlay?.city ?? photo.campaign.city;
      const eventName = overlay?.eventName ?? photo.campaign.eventName;
      const eventDate = overlay?.eventDate ?? photo.campaign.eventDate;
      return `${i + 1}. id=${photo.id} file=${photo.basic.originalFilename} county=${c} city=${city} event=${eventName} date=${eventDate} caption=${photo.accessibility.caption.slice(0, 120)}`;
    })
    .join("\n");

  const userText = `BATCH PHOTO EVIDENCE PROPOSAL (review-only — do NOT call batch_apply_photo_evidence).
Propose SHARED fields that could apply to this selection after operator review.
Local cluster summary: ${clusters.summary}
mixedGeography=${clusters.mixedGeography}
clusters=${JSON.stringify(clusters.clusters)}

Photo roster:
${roster}

Rules:
- Prefer Unknown over inventing geography.
- If mixedGeography is true, keep county/city/venue Unknown unless tools prove one shared place.
- Call lookup_arkansas_county / search_calendar_presence / search_confirmed_memory / find_similar_campaign_photos when helpful.
- Do not write files or create derivatives in this pass.
- Return JSON with normal evidence fields PLUS:
  recommendedApplyFields: string[] (subset safe to batch),
  perPhotoNotes: [{ photoId, note }] for outliers only.

Confirmed past examples (soft priors only):
${memory}`;

  const result = await runEvidenceAiBrain({
    kind: "photo",
    userText,
    imageDataUrl: imageUrls[0] ?? null,
    extraImageDataUrls: imageUrls.slice(1),
    mode,
    systemExtra:
      "BATCH MODE: Propose shared fields only. Never call batch_apply_photo_evidence. Include recommendedApplyFields and optional perPhotoNotes in the final JSON.",
    maxToolRounds: 5,
  });
  if (!result.ok) return result;

  const suggestion = result.suggestion;
  if (result.toolsUsed.length) {
    suggestion.warnings = [
      ...suggestion.warnings,
      `Tools used: ${result.toolsUsed.join(", ")}`,
    ];
  }
  if (clusters.mixedGeography) {
    suggestion.warnings = [
      ...suggestion.warnings,
      "Selection has mixed county cues — geography fields may be withheld from recommended apply list.",
    ];
  }
  if (!imageUrls.length) {
    suggestion.warnings = [
      ...suggestion.warnings,
      "No local image bytes attached — geography should stay Unknown unless tools already confirm it.",
    ];
    if (suggestion.confidence === "high") suggestion.confidence = "medium";
  }

  const extras = parseBatchExtras(result.rawContent);
  const fallbackFields = recommendedFieldsFromSuggestion(suggestion, clusters.mixedGeography);
  const recommendedApplyFields =
    extras.recommendedApplyFields.length > 0
      ? extras.recommendedApplyFields.filter((f) =>
          (BATCH_SHARED_FIELDS as readonly string[]).includes(f),
        )
      : fallbackFields;

  const proposal: BatchPhotoAiProposal = {
    photoIds: capped.map((p) => p.photo.id),
    clusterSummary: clusters.summary,
    clusters: clusters.clusters,
    mixedGeography: clusters.mixedGeography,
    shared: suggestion,
    recommendedApplyFields,
    perPhotoNotes: extras.perPhotoNotes,
    model: result.model,
  };

  return { ok: true, proposal };
}
