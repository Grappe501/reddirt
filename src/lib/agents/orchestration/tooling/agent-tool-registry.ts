/**
 * Unified agent tool registry — orchestration + knowledge + master catalog.
 */

import { AI_TOOL_LIFECYCLES } from "@/lib/campaign-events/ai-tools-master-catalog";
import type { AiToolEntry, AiToolStatus } from "@/lib/campaign-events/ai-tools-master-catalog";
import { mergeSupplementIntoLifecycles } from "@/lib/campaign-events/ai-tools-supplement";
import { ORCHESTRATION_INTELLIGENCE_TOOL_CONTRACTS } from "../orchestration-tool-contracts";
import { CAMPAIGN_KNOWLEDGE_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-campaign-knowledge-tools";
import type { CampaignAiToolContract } from "@/lib/campaign-events/ai-tools/tool-contract";
import type { CampaignDomainId } from "../campaign-state-types";
import { getOrchestrationDomain, ORCHESTRATION_DOMAINS } from "../orchestration-domains";
import type { AgentToolCapability, AgentToolCapabilityStatus } from "./agent-tooling-types";
import { classifyToolSafety } from "./agent-tool-safety";

const LIFECYCLE_DOMAIN: Record<string, CampaignDomainId> = {
  campaign_orchestration_intelligence: "campaign_management",
  campaign_knowledge_graph: "memory",
  county_intelligence_bridge: "county",
  communications_system: "communications",
  email_os_suite: "communications",
  volunteer_system: "volunteer",
  calendar_intake: "calendar",
  tentative_approval: "approvals",
  event_planning_sprint6: "event_planning",
  event_intelligence_sprint7: "hot_wash",
  campaign_finance_sprint8: "finance",
  mileage_reimbursement: "reimbursement",
  kelly_os_intelligence: "training",
  kelly_os_copilot_tooling: "campaign_management",
  agent_os_control: "campaign_management",
  dashboard_nav_sprint9: "dashboard_ux",
  tool_builder: "tool_builder",
};

function statusFromCatalog(s: AiToolStatus): AgentToolCapabilityStatus {
  if (s === "functional") return "ready";
  if (s === "partial") return "partial";
  return "planned";
}

function domainForLifecycle(lifecycleId: string): CampaignDomainId {
  return LIFECYCLE_DOMAIN[lifecycleId] ?? "campaign_management";
}

function improvesUnderstanding(contract: CampaignAiToolContract): string {
  return `Teaches campaign: ${contract.purpose}. Reads ${contract.readsFrom}; outputs ${contract.outputs}. Guardrails: ${contract.guardrails || "human-gated operations"}.`;
}

function improvesFromEntry(entry: AiToolEntry): string {
  return `Teaches campaign: ${entry.purpose}. Reads ${entry.reads}. Writes ${entry.writes}. ${entry.guardrails ? `Guardrails: ${entry.guardrails}.` : ""}`;
}

function contractToCapability(c: CampaignAiToolContract): AgentToolCapability {
  const domain = domainForLifecycle(c.lifecycle);
  const safety = classifyToolSafety({
    id: c.id,
    humanApprovalRequired: c.humanApprovalRequired,
    writesTo: c.writesTo,
    riskLevel: c.riskLevel,
    guardrails: c.guardrails,
  });
  const readOnly = c.writesTo === "—" || c.writesTo === "-";
  return {
    id: c.id,
    label: c.name,
    description: c.purpose,
    domain,
    domains: [domain],
    category: c.lifecycle,
    inputShape: c.inputs,
    outputShape: c.outputs,
    readOnly,
    preparesAction: !readOnly && c.humanApprovalRequired,
    executesAction: false,
    requiresHumanApproval: c.humanApprovalRequired,
    restrictedActionType: safety === "prohibited" ? c.id : undefined,
    safetyLevel: safety,
    sourcePaths: [c.deterministicHelperPath],
    routePaths: [...c.routesUsingTool],
    testPaths: c.testChecklist.length ? c.testChecklist : [`scripts/test-orchestration-plan.ts`],
    docsPaths: [`docs/campaign-events/AI_AGENT_TOOL_BUILD_MAP.md`],
    improvesCampaignUnderstandingHow: improvesUnderstanding(c),
    campaignStateInputs: ["CampaignState", "period"],
    knowledgeGraphInputs: c.lifecycle.includes("knowledge") ? ["knowledge.graphHealth", "knowledge.knowledgeGaps"] : [],
    lessonsInputs: c.lifecycle.includes("knowledge") ? ["knowledge.strongestLessons"] : [],
    producedSignals: c.observationEvents.length ? [...c.observationEvents] : [],
    producedObservations: c.lifecycle.includes("knowledge") ? ["structured_observations"] : [],
    producedLessons: c.lifecycle.includes("knowledge") || c.lifecycle.includes("orchestration") ? ["lesson_candidates"] : [],
    freshness: "fresh",
    status: statusFromCatalog(c.currentStatus),
    blockers: c.riskLevel === "blocked" ? ["Catalog risk blocked"] : c.currentStatus === "idea" ? ["Not yet implemented"] : [],
    metadata: { sprint: c.sprint, priority: c.priority ?? "P1" },
  };
}

function entryToCapability(entry: AiToolEntry): AgentToolCapability {
  const domain = domainForLifecycle(entry.lifecycleId);
  const safety = classifyToolSafety({
    id: entry.id,
    humanApprovalRequired: entry.humanApprovalRequired,
    writesTo: entry.writes,
    riskLevel: "low",
    guardrails: entry.guardrails,
  });
  const readOnly = entry.writes === "—" || entry.writes === "-";
  return {
    id: entry.id,
    label: entry.name,
    description: entry.purpose,
    domain,
    domains: [domain],
    category: entry.lifecycleId,
    inputShape: entry.trigger,
    outputShape: entry.purpose,
    readOnly,
    preparesAction: entry.humanApprovalRequired,
    executesAction: false,
    requiresHumanApproval: entry.humanApprovalRequired,
    safetyLevel: safety,
    sourcePaths: [entry.futureRoute],
    routePaths: entry.futureRoute.startsWith("/") ? [entry.futureRoute] : [],
    testPaths: [],
    docsPaths: [`docs/campaign-events/AI_AGENT_TOOL_BUILD_MAP.md`],
    improvesCampaignUnderstandingHow: improvesFromEntry(entry),
    campaignStateInputs: ["CampaignState"],
    knowledgeGraphInputs: [],
    lessonsInputs: [],
    producedSignals: [],
    producedObservations: [],
    producedLessons: [],
    freshness: "fresh",
    status: statusFromCatalog(entry.status),
    blockers: entry.status === "idea" ? ["Planned — not implemented"] : [],
    metadata: { priority: entry.priority },
  };
}

export function loadUnifiedAgentToolRegistry(): AgentToolCapability[] {
  const map = new Map<string, AgentToolCapability>();

  for (const c of [...ORCHESTRATION_INTELLIGENCE_TOOL_CONTRACTS, ...CAMPAIGN_KNOWLEDGE_TOOL_CONTRACTS]) {
    map.set(c.id, contractToCapability(c));
  }

  const lifecycles = mergeSupplementIntoLifecycles(AI_TOOL_LIFECYCLES);
  for (const lc of lifecycles) {
    for (const tool of lc.tools) {
      if (!map.has(tool.id)) map.set(tool.id, entryToCapability(tool));
    }
  }

  return [...map.values()];
}

export function getAgentToolById(registry: AgentToolCapability[], id: string): AgentToolCapability | undefined {
  return registry.find((t) => t.id === id);
}

export function registrySummary(registry: AgentToolCapability[]): {
  total: number;
  ready: number;
  partial: number;
  planned: number;
  withUnderstanding: number;
} {
  return {
    total: registry.length,
    ready: registry.filter((t) => t.status === "ready").length,
    partial: registry.filter((t) => t.status === "partial").length,
    planned: registry.filter((t) => t.status === "planned").length,
    withUnderstanding: registry.filter((t) => t.improvesCampaignUnderstandingHow.length > 10).length,
  };
}

export function validateRegistryUnderstanding(registry: AgentToolCapability[]): string[] {
  return registry.filter((t) => !t.improvesCampaignUnderstandingHow?.trim()).map((t) => t.id);
}

export function toolsForDomain(registry: AgentToolCapability[], domain: CampaignDomainId): AgentToolCapability[] {
  return registry.filter((t) => t.domains.includes(domain) || t.domain === domain);
}

export function domainLabel(domain: CampaignDomainId): string {
  return getOrchestrationDomain(domain)?.label ?? domain.replaceAll("_", " ");
}

export const ALL_ORCHESTRATION_DOMAIN_IDS = ORCHESTRATION_DOMAINS.map((d) => d.id);
