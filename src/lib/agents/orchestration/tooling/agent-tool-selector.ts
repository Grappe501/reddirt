/**
 * Deterministic tool selector — recommend tools from CampaignState + knowledge.
 */

import type { CampaignState } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import type { AgentToolCapability, AgentToolRecommendation } from "./agent-tooling-types";
import { getAgentToolById } from "./agent-tool-registry";

export type AgentToolSelectorInput = {
  state: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
  registry: AgentToolCapability[];
  role: CampaignUserRole;
  period: string;
};

export type AgentToolSelectorResult = {
  recommended: AgentToolRecommendation[];
  blocked: AgentToolCapability[];
  missing: AgentToolRecommendation[];
  topFive: AgentToolRecommendation[];
};

function rec(
  tool: AgentToolCapability,
  period: string,
  partial: Pick<AgentToolRecommendation, "whyNow" | "campaignNeed" | "urgency" | "confidence" | "sourceEvidence">,
): AgentToolRecommendation {
  return {
    id: `rec:${tool.id}`,
    toolId: tool.id,
    title: tool.label,
    summary: tool.description,
    whyNow: partial.whyNow,
    campaignNeed: partial.campaignNeed,
    domain: tool.domain,
    urgency: partial.urgency,
    confidence: partial.confidence,
    expectedOutput: tool.outputShape,
    expectedCampaignStateImprovement: `Strengthens ${tool.domain.replaceAll("_", " ")} signals in CampaignState.`,
    expectedKnowledgeGraphImprovement: tool.producedLessons.length
      ? "May produce lesson candidates for campaign memory."
      : "Adds operational signals to campaign understanding.",
    requiredHumanApproval: tool.requiresHumanApproval,
    blockedBy: tool.status === "planned" ? ["Tool status planned — not fully implemented"] : tool.blockers,
    suggestedInputs: { period },
    doneWhen: `Operator reviewed output from ${tool.label}.`,
    safety: tool.safetyLevel,
    sourceEvidence: partial.sourceEvidence,
  };
}

export function selectAgentTools(input: AgentToolSelectorInput): AgentToolSelectorResult {
  const { state, sourceHealth, registry, role } = input;
  const recommended: AgentToolRecommendation[] = [];
  const blocked = registry.filter((t) => t.status === "blocked" || t.safetyLevel === "prohibited");
  const missing: AgentToolRecommendation[] = [];

  const pick = (id: string) => getAgentToolById(registry, id);

  const stateLoader = pick("campaign-state-loader");
  if (stateLoader) {
    recommended.push(
      rec(stateLoader, input.period, {
        whyNow: "Foundation — refresh live CampaignState before other tools.",
        campaignNeed: "Accurate campaign snapshot",
        urgency: "P1",
        confidence: "high",
        sourceEvidence: [state.observationSummary],
      }),
    );
  }

  for (const gap of state.knowledge.knowledgeGaps.slice(0, 3)) {
    const tool = pick("campaign-knowledge-memory-synthesizer") ?? pick("campaign-lessons-engine");
    if (tool) {
      recommended.push(
        rec(tool, input.period, {
          whyNow: gap.summary,
          campaignNeed: gap.title,
          urgency: "P1",
          confidence: "medium",
          sourceEvidence: [gap.whyItMatters],
        }),
      );
    }
  }

  for (const b of state.activeBlockers.filter((x) => x.severity === "P0" || x.severity === "P1").slice(0, 2)) {
    const tool =
      b.domainId === "county"
        ? pick("field-priority-orchestrator") ?? pick("county-lesson-extractor")
        : b.domainId === "communications"
          ? pick("communications-priority-orchestrator")
          : pick("orchestration-reasoning-engine");
    if (tool) {
      recommended.push(
        rec(tool, input.period, {
          whyNow: b.message,
          campaignNeed: `Clear ${b.domainId} blocker`,
          urgency: b.severity,
          confidence: "high",
          sourceEvidence: [b.message],
        }),
      );
    }
  }

  if (state.weakDomains.includes("county") || state.countyIntelligenceSummary.weakCountyCount > 0) {
    const tool = pick("field-priority-orchestrator") ?? pick("county-lesson-extractor");
    if (tool) {
      recommended.push(
        rec(tool, input.period, {
          whyNow: `${state.countyIntelligenceSummary.weakCountyCount} weak counties — county intelligence refresh needed.`,
          campaignNeed: "County field posture",
          urgency: "P1",
          confidence: "high",
          sourceEvidence: state.countyIntelligenceSummary.heatListTop.slice(0, 2),
        }),
      );
    }
  }

  if (state.commsReadiness.massEmailBlocked || !state.emailEccReadiness.sendEnabled) {
    const tool = pick("communications-priority-orchestrator");
    if (tool) {
      recommended.push(
        rec(tool, input.period, {
          whyNow: "Email/ECC send gated — inspect comms readiness before any outreach.",
          campaignNeed: "Comms readiness",
          urgency: "P1",
          confidence: "high",
          sourceEvidence: ["massEmailBlocked", "sendEnabled"],
        }),
      );
    }
  }

  if (state.memoryObservationSummary.frictionSignals >= 2) {
    const tool = pick("orchestration-observation-miner") ?? pick("campaign-tool-gap-orchestrator");
    if (tool) {
      recommended.push(
        rec(tool, input.period, {
          whyNow: `${state.memoryObservationSummary.frictionSignals} friction signals — mine observations for tool gaps.`,
          campaignNeed: "Reduce operator friction",
          urgency: "P2",
          confidence: "medium",
          sourceEvidence: ["user-observations friction"],
        }),
      );
    }
  }

  const degraded = sourceHealth.filter((s) => s.status !== "ready");
  for (const s of degraded.slice(0, 2)) {
    missing.push({
      id: `missing:${s.sourceId}`,
      toolId: "cross-domain-signal-loader",
      title: `Restore ${s.label}`,
      summary: s.detail ?? "Signal source degraded",
      whyNow: "Knowledge gap from missing source",
      campaignNeed: s.label,
      domain: "campaign_management",
      urgency: "P1",
      confidence: "high",
      expectedOutput: "Source ready in sourceHealth",
      expectedCampaignStateImprovement: "Full CampaignState fidelity",
      expectedKnowledgeGraphImprovement: "Fewer knowledge gaps",
      requiredHumanApproval: false,
      blockedBy: [],
      suggestedInputs: {},
      doneWhen: `${s.label} status is ready.`,
      safety: "safe_read",
      sourceEvidence: [s.sourceId],
    });
  }

  if (role === "campaign_manager") {
    const tool = pick("campaign-manager-daily-plan-builder");
    if (tool) {
      recommended.push(
        rec(tool, input.period, {
          whyNow: "CM daily operating rhythm",
          campaignNeed: "Daily plan",
          urgency: "P1",
          confidence: "medium",
          sourceEvidence: ["role:campaign_manager"],
        }),
      );
    }
  }

  const deduped = [...new Map(recommended.map((r) => [r.toolId, r])).values()];
  const topFive = deduped.slice(0, 5);

  return { recommended: deduped, blocked, missing, topFive };
}
