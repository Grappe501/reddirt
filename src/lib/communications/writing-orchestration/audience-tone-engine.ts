import type { WritingAudience, WritingTone } from "./writing-orchestration-types";

export function resolveAudienceTone(audience: WritingAudience, urgency: "low" | "medium" | "high"): WritingTone {
  if (urgency === "high") return "urgent";
  if (audience === "volunteer" || audience === "host") return "warm";
  if (audience === "candidate") return "calm";
  if (audience === "campaign_team") return "direct";
  return "warm";
}

export function toneOpening(tone: WritingTone): string {
  const map: Record<WritingTone, string> = {
    warm: "Thank you for being part of Kelly's campaign for Secretary of State.",
    direct: "Quick update from the Kelly Grappe campaign team:",
    urgent: "Time-sensitive request from the Kelly Grappe campaign:",
    celebratory: "Great news from the trail —",
    calm: "Briefing for your upcoming appearance:",
  };
  return map[tone];
}
