/**
 * Deterministic tool sequencer — multi-step tool sequences for common campaign needs.
 */

import type { CampaignState } from "../campaign-state-types";
import type { AgentToolCapability, AgentToolSequence, AgentToolSequenceStep } from "./agent-tooling-types";
import { getAgentToolById } from "./agent-tool-registry";

function step(order: number, toolId: string, registry: AgentToolCapability[], title: string, purpose: string): AgentToolSequenceStep {
  const tool = getAgentToolById(registry, toolId);
  return {
    order,
    toolId,
    title,
    purpose,
    safety: tool?.safetyLevel ?? "safe_read",
    humanGate: tool?.requiresHumanApproval ?? false,
  };
}

function seq(partial: Omit<AgentToolSequence, "steps"> & { stepDefs: { toolId: string; title: string; purpose: string }[] }, registry: AgentToolCapability[]): AgentToolSequence {
  return {
    ...partial,
    steps: partial.stepDefs.map((s, i) => step(i + 1, s.toolId, registry, s.title, s.purpose)),
  };
}

export function buildAgentToolSequences(state: CampaignState, registry: AgentToolCapability[]): AgentToolSequence[] {
  const sequences: AgentToolSequence[] = [];

  sequences.push(
    seq(
      {
        id: "seq-county-intelligence-refresh",
        title: "County intelligence refresh",
        summary: "Inspect stale county domains, pull V2 summary, review observations, prep visit packet.",
        trigger: state.weakDomains.includes("county") || state.countyIntelligenceSummary.weakCountyCount > 0 ? "weak_county" : "scheduled",
        ownerRole: "field_manager",
        domains: ["county", "field"],
        expectedOutcome: "County visit prep packet ready for human review.",
        humanGateRequired: true,
        safetyNotes: ["Read-only county pull", "No voter export", "Memory writes require approval"],
        blockedBy: state.countyIntelligenceSummary.bridgeAvailable ? [] : ["countyWorkbench bridge unavailable"],
        doneWhen: "Operator reviewed county action package.",
        stepDefs: [
          { toolId: "campaign-state-loader", title: "Load CampaignState", purpose: "Baseline county health bands." },
          { toolId: "field-priority-orchestrator", title: "Field priorities", purpose: "Rank county attention list." },
          { toolId: "campaign-observation-intake-engine", title: "Review observations", purpose: "Pull recent county signals." },
          { toolId: "county-lesson-extractor", title: "County lessons", purpose: "Propose county learnings." },
          { toolId: "workflow-execution-package-builder", title: "Human review packet", purpose: "Prepare execution checklist." },
        ],
      },
      registry,
    ),
  );

  sequences.push(
    seq(
      {
        id: "seq-comms-readiness",
        title: "Comms readiness sequence",
        summary: "Inspect comms health, ECC gates, blockers, sandbox checklist — no send.",
        trigger: state.commsReadiness.massEmailBlocked ? "send_gated" : "comms_weak",
        ownerRole: "communications_director",
        domains: ["communications"],
        expectedOutcome: "Human approval packet for any outreach — drafts only.",
        humanGateRequired: true,
        safetyNotes: ["No auto-send", "ECC send disabled until human enables"],
        blockedBy: [],
        doneWhen: "Operator verified send gates and draft checklist.",
        stepDefs: [
          { toolId: "communications-priority-orchestrator", title: "Comms priorities", purpose: "Top comms moves." },
          { toolId: "cross-domain-signal-loader", title: "Source health", purpose: "Verify comms sources ready." },
          { toolId: "orchestration-reasoning-engine", title: "Comms blockers", purpose: "Surface comms risks." },
          { toolId: "workflow-execution-package-builder", title: "Sandbox checklist", purpose: "Prepare test-send checklist." },
        ],
      },
      registry,
    ),
  );

  sequences.push(
    seq(
      {
        id: "seq-cm-daily",
        title: "Campaign manager daily sequence",
        summary: "Load state, blockers, workflows, top tools, daily briefing.",
        trigger: "daily_cm",
        ownerRole: "campaign_manager",
        domains: ["campaign_management"],
        expectedOutcome: "CM daily action briefing prepared — human executes.",
        humanGateRequired: false,
        safetyNotes: ["Read-only coordination", "No execution"],
        blockedBy: [],
        doneWhen: "CM reviewed top 3 moves and workflows.",
        stepDefs: [
          { toolId: "campaign-state-loader", title: "Load state", purpose: "Live CampaignState." },
          { toolId: "orchestration-reasoning-engine", title: "Diagnosis", purpose: "Blockers and opportunities." },
          { toolId: "cross-domain-workflow-planner", title: "Workflows", purpose: "Activate workflows." },
          { toolId: "campaign-manager-daily-plan-builder", title: "Daily plan", purpose: "CM operating plan." },
          { toolId: "campaign-priority-ranker", title: "Rank actions", purpose: "Top priorities." },
        ],
      },
      registry,
    ),
  );

  sequences.push(
    seq(
      {
        id: "seq-hotwash-learning",
        title: "Event hot wash learning sequence",
        summary: "Collect notes, observations, lessons, update knowledge graph.",
        trigger: "post_event",
        ownerRole: "event_lead",
        domains: ["hot_wash", "event_planning", "memory"],
        expectedOutcome: "Lesson candidates + graph update — human approves lessons.",
        humanGateRequired: true,
        safetyNotes: ["Lessons proposed not auto-approved", "No PII in graph"],
        blockedBy: [],
        doneWhen: "Hot wash lessons reviewed by operator.",
        stepDefs: [
          { toolId: "hotwash-lesson-extractor", title: "Hot wash extract", purpose: "Learning snapshot." },
          { toolId: "campaign-observation-intake-engine", title: "Structure notes", purpose: "Observation intake." },
          { toolId: "campaign-lessons-engine", title: "Lessons", purpose: "Rank and propose lessons." },
          { toolId: "campaign-entity-graph-builder", title: "Update graph", purpose: "Persist entities." },
          { toolId: "hotwash-to-county-strategy-router", title: "Follow-up workflow", purpose: "County strategy handoff." },
        ],
      },
      registry,
    ),
  );

  sequences.push(
    seq(
      {
        id: "seq-finance-compliance-safety",
        title: "Finance/compliance safety sequence",
        summary: "Detect warnings, prep review checklist — never auto-post.",
        trigger: state.financeComplianceWarnings.length > 0 ? "finance_warning" : "scheduled",
        ownerRole: "treasurer",
        domains: ["finance", "compliance", "reimbursement"],
        expectedOutcome: "Treasurer review checklist — human approval required.",
        humanGateRequired: true,
        safetyNotes: ["No finance post", "No reimbursement submit", "Review only"],
        blockedBy: [],
        doneWhen: "Treasurer signed off review checklist.",
        stepDefs: [
          { toolId: "campaign-risk-detector", title: "Finance risks", purpose: "Surface compliance warnings." },
          { toolId: "orchestration-reasoning-engine", title: "Diagnosis", purpose: "Finance domain status." },
          { toolId: "workflow-execution-package-builder", title: "Review checklist", purpose: "Human review packet." },
        ],
      },
      registry,
    ),
  );

  return sequences.filter((s) => s.blockedBy.length === 0 || s.id !== "seq-county-intelligence-refresh" || state.countyIntelligenceSummary.bridgeAvailable);
}
