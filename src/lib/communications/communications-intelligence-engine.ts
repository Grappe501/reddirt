import { loadCommunicationsBundle } from "@/lib/campaign-events/communications/load-communications-bundle";
import { detectCommunicationFatigue } from "./sequences/communication-fatigue-detector";
import { detectFollowupGaps } from "./sequences/followup-gap-detector";
import { buildCommunicationSequence } from "./sequences/communication-sequence-builder";
import { detectSequenceRisks } from "./sequences/sequence-risk-detector";
import {
  buildRelationshipGraph,
  buildRelationshipHealthBrief,
} from "./relationship-intelligence/relationship-intelligence-engine";
import { detectUnresolvedFollowups } from "./memory/unresolved-followup-detector";
import { buildRelationshipMemoryReview } from "./memory/relationship-memory-review";
import { listCountyCommunicationsGaps } from "./county-communications-intelligence";

export type CommunicationsIntelligenceContext = {
  generatedAt: string;
  relationshipHealth: ReturnType<typeof buildRelationshipHealthBrief>;
  volunteerEngagement: { active: number; atRisk: number };
  countyGaps: ReturnType<typeof listCountyCommunicationsGaps>;
  inactiveSupporters: string[];
  hostFollowUpGaps: string[];
  retentionRisks: string[];
  fatigueWarnings: string[];
  massEmailStatus: "blocked" | "gated";
  statewideMessagingStatus: string;
  eventFollowUpReadiness: string;
  teamBriefingReadiness: string;
  bottlenecks: string[];
  topPriorities: string[];
  sampleSequence: ReturnType<typeof buildCommunicationSequence>;
};

export function composeCommunicationsIntelligenceContext(): CommunicationsIntelligenceContext {
  const bundle = loadCommunicationsBundle();
  const graph = buildRelationshipGraph(false);
  const health = buildRelationshipHealthBrief(graph);
  const gaps = detectFollowupGaps(graph.nodes);
  const fatigue = detectCommunicationFatigue(graph.nodes);
  const countyGaps = listCountyCommunicationsGaps(6);
  const volunteers = graph.nodes.filter((n) => n.kinds.includes("volunteer"));
  const hosts = graph.nodes.filter((n) => n.kinds.includes("host"));

  const sampleSequence = buildCommunicationSequence("volunteer_onboarding", "New volunteers");
  const seqRisks = detectSequenceRisks(sampleSequence);

  const bottlenecks: string[] = [...bundle.risks];
  if (!bundle.readiness.approvalEmail.sendEnabled) {
    bottlenecks.push("Outbound send disabled — drafts only");
  }

  const topPriorities = [
    ...health.topPriorities.slice(0, 4),
    ...countyGaps.slice(0, 2).map((c) => `County comms: ${c.countyName} — ${c.messagingAngle.slice(0, 60)}`),
  ].slice(0, 8);

  return {
    generatedAt: new Date().toISOString(),
    relationshipHealth: health,
    volunteerEngagement: {
      active: volunteers.filter((v) => v.engagementScore >= 50).length,
      atRisk: volunteers.filter((v) => v.burnoutRisk !== "low").length,
    },
    countyGaps,
    inactiveSupporters: graph.nodes
      .filter((n) => n.engagementScore < 25)
      .map((n) => n.displayName)
      .slice(0, 8),
    hostFollowUpGaps: hosts.filter((h) => h.followUpNeeded).map((h) => h.displayName).slice(0, 6),
    retentionRisks: gaps.filter((g) => g.priority === "high").map((g) => g.displayName),
    fatigueWarnings: fatigue,
    massEmailStatus: bundle.massEmailStatus,
    statewideMessagingStatus: bundle.teamWorkflowReadiness,
    eventFollowUpReadiness: bundle.volunteerWorkflowReadiness,
    teamBriefingReadiness: bundle.teamWorkflowReadiness,
    bottlenecks,
    topPriorities,
    sampleSequence: { ...sampleSequence, warnings: [...sampleSequence.warnings, ...seqRisks] },
  };
}

export function getCommunicationsPriorityCount(): number {
  const ctx = composeCommunicationsIntelligenceContext();
  return ctx.topPriorities.length + getUnresolvedOutreachCount();
}

// unresolved from memory
export function getUnresolvedOutreachCount(): number {
  return detectUnresolvedFollowups().length + buildRelationshipMemoryReview().unresolved.length;
}
