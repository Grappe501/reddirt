import { formatCampaignPrioritiesPromptLine } from "../campaign-priorities";
import type { WritingPromptPacket } from "./contracts";
import { buildActorWritingIntelligence } from "./catalog";
import type { WritingActorId } from "./contracts";

export function buildWritingIntelligencePromptPacket(actorId?: string): WritingPromptPacket | null {
  if (actorId !== "chris-jones-ar02" && actorId !== "french-hill-ar02") return null;
  const intel = buildActorWritingIntelligence(actorId);
  if (intel.documentCount === 0) return null;
  const refs = intel.sources.slice(0, 6).map((source) => source.id);
  const structure =
    actorId === "chris-jones-ar02"
      ? "When this actor responds in public writing, recent pieces often move personal/everyday observation → systems diagnosis → values → hopeful action."
      : "When this office responds in public writing, newsletters often move Friends greeting → problem/statistic → Arkansas example → committee/legislative action → constituent close.";
  const lines = [
    `WRITING INTELLIGENCE PACKET (${intel.version})`,
    `Actor: ${actorId}. Documents=${intel.documentCount}. Newest=${intel.newestSourceDate ?? "unknown"}.`,
    `Authorship mix: direct=${intel.authorship.DIRECT_AUTHOR}; official-office=${intel.authorship.OFFICIAL_OFFICE}; attributed=${intel.authorship.ATTRIBUTED}.`,
    `Current themes: ${intel.topThemes.slice(0, 5).join(", ") || "none"}.`,
    formatCampaignPrioritiesPromptLine(actorId),
    structure,
    `Observed frames: ${intel.decisionTendencies.map((item) => `${item.label}=${item.value} [${item.sourceState}]`).join(" | ")}`,
    `Rhetoric rates (corpus means, not personality labels): analogy=${intel.fingerprint.rhetoric.analogy}; statistics=${intel.fingerprint.rhetoric.statistics}; local=${intel.fingerprint.rhetoric.localExample}; institutional=${intel.fingerprint.rhetoric.institutionalProcess}; contrast=${intel.fingerprint.rhetoric.opponentContrast}.`,
    "Generated replies are SIMULATED. Never present them as actual quotations.",
    `Evidence refs: ${refs.join(", ")}`,
  ].filter(Boolean);
  return { actorId, lines, sourceRefs: refs };
}

export function formatWritingIntelligencePromptPacket(actorId?: string): string {
  const packet = buildWritingIntelligencePromptPacket(actorId as WritingActorId | undefined);
  return packet ? packet.lines.join("\n") : "";
}

export function writingPacketHasSourceRefs(actorId: WritingActorId): boolean {
  const packet = buildWritingIntelligencePromptPacket(actorId);
  return Boolean(packet && packet.sourceRefs.length > 0 && packet.lines.some((line) => line.includes("Evidence refs")));
}
