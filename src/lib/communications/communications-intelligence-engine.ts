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

export type OscarAction = {
  id: string;
  priority: "now" | "today" | "watch";
  lane: "relationship" | "county" | "content" | "operations" | "safety";
  title: string;
  why: string;
  nextStep: string;
  confidence: "high" | "medium" | "limited";
  humanApprovalRequired: boolean;
};

export type OscarCommunicationsBrief = {
  version: "3.0";
  readinessScore: number;
  posture: "hold" | "attention" | "ready";
  headline: string;
  actions: OscarAction[];
  evidenceWarnings: string[];
  capabilities: string[];
};

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
  oscar: OscarCommunicationsBrief;
};

function buildOscarBrief(input: {
  followUpCount: number;
  countyGaps: ReturnType<typeof listCountyCommunicationsGaps>;
  hostFollowUpGaps: string[];
  bottlenecks: string[];
  massEmailStatus: "blocked" | "gated";
  sendEnabled: boolean;
}): OscarCommunicationsBrief {
  const actions: OscarAction[] = [];

  if (input.followUpCount > 0) {
    actions.push({
      id: "relationship-followup",
      priority: "now",
      lane: "relationship",
      title: `${input.followUpCount} relationship follow-up${input.followUpCount === 1 ? "" : "s"} need attention`,
      why: "Unresolved relationship work compounds quickly and is more valuable than adding another broadcast.",
      nextStep: "Open the relationship queue, review context, and draft the highest-value personal follow-ups first.",
      confidence: "high",
      humanApprovalRequired: true,
    });
  }

  const county = input.countyGaps[0];
  if (county) {
    actions.push({
      id: `county-${county.countySlug}`,
      priority: "today",
      lane: "county",
      title: `Strengthen ${county.countyName} communications`,
      why: county.issueSummary,
      nextStep: `Build a local message around: ${county.messagingAngle}`,
      confidence: "medium",
      humanApprovalRequired: true,
    });
  }

  if (input.hostFollowUpGaps.length > 0) {
    actions.push({
      id: "host-followup",
      priority: "today",
      lane: "operations",
      title: `${input.hostFollowUpGaps.length} host follow-up gap${input.hostFollowUpGaps.length === 1 ? "" : "s"}`,
      why: "Event hosts are high-trust relationships; missed follow-up weakens repeat-event capacity.",
      nextStep: "Generate host follow-up drafts and route them through the governed review path.",
      confidence: "high",
      humanApprovalRequired: true,
    });
  }

  if (!input.sendEnabled || input.massEmailStatus === "blocked") {
    actions.push({
      id: "send-safety",
      priority: "watch",
      lane: "safety",
      title: "Keep outbound in governed draft mode",
      why: "Provider/send readiness is not fully enabled. Oscar should improve decisions and drafts without bypassing launch controls.",
      nextStep: "Use Message Studio and ECC review; do not enable autonomous or bulk sending from the AI layer.",
      confidence: "high",
      humanApprovalRequired: true,
    });
  }

  const penalties = Math.min(45,
    input.bottlenecks.length * 5 +
    (input.massEmailStatus === "blocked" ? 15 : 0) +
    (!input.sendEnabled ? 10 : 0),
  );
  const readinessScore = Math.max(0, 100 - penalties);
  const posture: OscarCommunicationsBrief["posture"] = readinessScore < 55 ? "hold" : readinessScore < 80 ? "attention" : "ready";

  return {
    version: "3.0",
    readinessScore,
    posture,
    headline:
      actions.length > 0
        ? `Oscar has ${actions.filter((a) => a.priority !== "watch").length} actionable communications priorities.`
        : "Oscar sees no urgent communications intervention in the current evidence.",
    actions: actions.slice(0, 6),
    evidenceWarnings: [
      "Contact-level send telemetry is not recipient-addressable in the V1 aggregate send ledger; Oscar does not infer individual send frequency.",
      "Scores are decision support, not facts about voter intent, persuasion, or personal psychology.",
      "Political, donor, crisis, and mass-outreach content remains human-reviewed before release.",
    ],
    capabilities: [
      "Relationship follow-up triage",
      "County message-gap detection",
      "Host and volunteer retention signals",
      "Cadence/fatigue guardrails",
      "Purpose, audience, tone, CTA, and subject orchestration",
      "Event-to-comms handoff",
      "Human-gated send readiness",
    ],
  };
}

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

  const hostFollowUpGaps = hosts.filter((h) => h.followUpNeeded).map((h) => h.displayName).slice(0, 6);
  const topPriorities = [
    ...health.topPriorities.slice(0, 4),
    ...countyGaps.slice(0, 2).map((c) => `County comms: ${c.countyName} — ${c.messagingAngle.slice(0, 60)}`),
  ].slice(0, 8);

  const oscar = buildOscarBrief({
    followUpCount: gaps.length,
    countyGaps,
    hostFollowUpGaps,
    bottlenecks,
    massEmailStatus: bundle.massEmailStatus,
    sendEnabled: bundle.readiness.approvalEmail.sendEnabled,
  });

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
    hostFollowUpGaps,
    retentionRisks: gaps.filter((g) => g.priority === "high").map((g) => g.displayName),
    fatigueWarnings: fatigue,
    massEmailStatus: bundle.massEmailStatus,
    statewideMessagingStatus: bundle.teamWorkflowReadiness,
    eventFollowUpReadiness: bundle.volunteerWorkflowReadiness,
    teamBriefingReadiness: bundle.teamWorkflowReadiness,
    bottlenecks,
    topPriorities,
    sampleSequence: { ...sampleSequence, warnings: [...sampleSequence.warnings, ...seqRisks] },
    oscar,
  };
}

export function getCommunicationsPriorityCount(): number {
  const ctx = composeCommunicationsIntelligenceContext();
  return ctx.oscar.actions.filter((a) => a.priority !== "watch").length + getUnresolvedOutreachCount();
}

export function getUnresolvedOutreachCount(): number {
  return detectUnresolvedFollowups().length + buildRelationshipMemoryReview().unresolved.length;
}
