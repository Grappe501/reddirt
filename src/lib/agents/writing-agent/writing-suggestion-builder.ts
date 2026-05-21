import type { WritingAudience } from "./writing-profile";
import { DEFAULT_WRITING_PROFILE, mergeWritingProfile } from "./writing-profile";
import { loadWritingStyleObservations } from "./writing-style-observations";

export type WritingSuggestion = {
  original: string;
  suggested: string;
  rationale: string;
  audience: WritingAudience;
  confidence: "high" | "medium" | "low";
};

/** Deterministic V1 — no LLM; pattern + profile only. */
export function buildWritingSuggestion(
  text: string,
  audience: WritingAudience = "operator",
): WritingSuggestion {
  const profile = mergeWritingProfile(DEFAULT_WRITING_PROFILE);
  const obs = loadWritingStyleObservations();
  const override = profile.audienceOverrides[audience];
  let suggested = text.trim();

  if (audience === "public" || audience === "candidate") {
    suggested = suggested.replace(/\bAI\b/gi, "assistant");
    suggested = suggested.replace(/\bLLM\b/gi, "");
  }
  if (profile.sentenceLengthPreference === "short" && suggested.length > 240) {
    const parts = suggested.split(/(?<=[.!?])\s+/);
    suggested = parts.slice(0, 2).join(" ") || suggested.slice(0, 240);
  }
  for (const avoid of profile.avoidPhrases) {
    if (suggested.toLowerCase().includes(avoid.toLowerCase())) {
      suggested = suggested.replace(new RegExp(avoid, "gi"), "");
    }
  }

  const acceptedCount = obs.filter((o) => o.source === "accepted_edit").length;
  const rationale = [
    override ? `Audience tone: ${override.tone}. ${override.notes}` : `Default tone: ${profile.preferredTone}.`,
    acceptedCount ? `${acceptedCount} prior accepted edit(s) on file.` : "No accepted edits logged yet — using defaults.",
    "Human must approve before send/publish.",
  ].join(" ");

  return {
    original: text,
    suggested: suggested.trim() || text,
    rationale,
    audience,
    confidence: obs.length > 3 ? "medium" : "low",
  };
}
