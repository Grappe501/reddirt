/**
 * Clamp vision/AI identify suggestions — Prefer Unknown unless confidence + tools support geo.
 * Never invents Approve; proposals only.
 */
import type { EvidenceAiSuggestion } from "@/lib/campaign-media/evidence-ai-types";

const GEO_TOOLS = new Set([
  "lookup_arkansas_county",
  "search_calendar_presence",
  "search_confirmed_memory",
  "find_similar_campaign_photos",
]);

function isUnknownish(v: string | undefined): boolean {
  const s = String(v ?? "").trim();
  return !s || s === "Unknown";
}

/**
 * Soften geography on low/medium confidence or when no geo tools ran.
 * High confidence still Prefer Unknown if no geo tool grounding.
 */
export function clampVisionIdentifySuggestion(
  suggestion: EvidenceAiSuggestion,
  opts?: { imageAttached?: boolean; toolsUsed?: string[] },
): EvidenceAiSuggestion {
  const next: EvidenceAiSuggestion = {
    ...suggestion,
    warnings: [...(suggestion.warnings ?? [])],
    toolsUsed: opts?.toolsUsed ?? suggestion.toolsUsed,
  };

  const tools = next.toolsUsed ?? [];
  const hasGeoTool = tools.some((t) => GEO_TOOLS.has(t));
  const imageAttached = opts?.imageAttached !== false;

  if (!imageAttached) {
    next.warnings.push(
      "Vision Identify: no local image bytes — geography forced toward Unknown unless tools already confirm.",
    );
  }

  const forceUnknown =
    next.confidence === "low" ||
    (next.confidence === "medium" && !hasGeoTool) ||
    (next.confidence === "high" && !hasGeoTool && !imageAttached);

  if (forceUnknown) {
    const hadGeo =
      !isUnknownish(next.county) || !isUnknownish(next.city) || !isUnknownish(next.venue);
    if (hadGeo) {
      next.warnings.push(
        "Vision Identify clamp: Prefer Unknown — confidence/tools insufficient to keep asserted geography.",
      );
    }
    next.county = "Unknown";
    next.city = "Unknown";
    next.venue = isUnknownish(next.venue) ? "Unknown" : next.venue;
    if (next.confidence === "high") next.confidence = "medium";
  } else if (next.confidence === "high" && hasGeoTool) {
    next.warnings.push(
      "Vision Identify: high confidence with geo tools — still Needs operator Save confirm (never auto-Approve).",
    );
  } else {
    next.warnings.push(
      "Vision Identify: proposal only — Apply/Save then Approve separately. Prefer Unknown if unsure.",
    );
  }

  return next;
}
