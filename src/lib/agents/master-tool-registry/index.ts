/**
 * Master tool registry — read-only aggregation for the All-Knowing Campaign Agent.
 * V0: re-exports Campaign Event OS catalog + global orchestration contracts.
 * Future: ingest Kelly Agent, compliance, countyWorkbench, AJAX without cross-lane imports.
 */
import { AI_TOOL_LIFECYCLES } from "@/lib/campaign-events/ai-tools-master-catalog";
import { mergeSupplementIntoLifecycles } from "@/lib/campaign-events/ai-tools-supplement";
import { GLOBAL_AGENT_ORCHESTRATION_CATALOG_ENTRIES } from "@/lib/campaign-events/ai-tools/sprint-global-agent-tools";
import { AGENT_INTELLIGENCE_ALL_CATALOG_ENTRIES } from "@/lib/campaign-events/ai-tools/sprint-agent-intelligence-tools";
import { SPRINT2_AGENT_CATALOG_ENTRIES } from "@/lib/campaign-events/ai-tools/sprint-agent-intelligence-2-tools";
import { SPRINT3_AGENT_CATALOG_ENTRIES } from "@/lib/campaign-events/ai-tools/sprint-agent-intelligence-3-tools";
import { SPRINT6_EVENT_PLANNING_CATALOG_ENTRIES } from "@/lib/campaign-events/ai-tools/sprint-event-planning-6-tools";
import { SPRINT7_EVENT_INTELLIGENCE_CATALOG_ENTRIES } from "@/lib/campaign-events/ai-tools/sprint-event-intelligence-7-tools";
import { SPRINT8_CAMPAIGN_FINANCE_CATALOG_ENTRIES } from "@/lib/campaign-events/ai-tools/sprint-campaign-finance-8-tools";
import type { MasterToolRegistryEntry } from "./types";

export { MASTER_TOOL_REGISTRY_VERSION } from "./types";
export type { MasterToolDomain, MasterToolKind, MasterToolRegistryEntry } from "./types";

function catalogToRegistry(): MasterToolRegistryEntry[] {
  const lifecycles = mergeSupplementIntoLifecycles(AI_TOOL_LIFECYCLES);
  const out: MasterToolRegistryEntry[] = [];
  for (const lc of lifecycles) {
    for (const tool of lc.tools) {
      out.push({
        id: tool.id,
        name: tool.name,
        domain: lc.id.startsWith("sprint") ? mapSprintLifecycle(lc.id) : "campaign_events",
        app: "RedDirt",
        sourcePath: tool.futureRoute,
        purpose: tool.purpose,
        status: tool.status,
        version: "v1",
        kind: tool.humanApprovalRequired ? "deterministic" : "deterministic",
        reads: tool.reads,
        writes: tool.writes,
        permissions: "admin",
        humanApprovalRequired: tool.humanApprovalRequired,
        observationEvents: [],
        riskLevel: tool.humanApprovalRequired ? "medium" : "low",
        routeBindings: [tool.futureRoute].filter(Boolean),
        automationReadiness: tool.guardrails.toLowerCase().includes("no auto") ? "human_gated" : "read_only",
        v2LearningPath: "See AI_AGENT_OBSERVATION_AND_LEARNING_ROADMAP.md",
        inUnifiedMasterAgent: true,
      });
    }
  }
  const agentIntel = [
    ...GLOBAL_AGENT_ORCHESTRATION_CATALOG_ENTRIES,
    ...AGENT_INTELLIGENCE_ALL_CATALOG_ENTRIES,
    ...SPRINT2_AGENT_CATALOG_ENTRIES,
    ...SPRINT3_AGENT_CATALOG_ENTRIES,
    ...SPRINT6_EVENT_PLANNING_CATALOG_ENTRIES,
    ...SPRINT7_EVENT_INTELLIGENCE_CATALOG_ENTRIES,
    ...SPRINT8_CAMPAIGN_FINANCE_CATALOG_ENTRIES,
  ];
  for (const tool of agentIntel) {
    if (out.some((x) => x.id === tool.id)) continue;
    out.push({
      id: tool.id,
      name: tool.name,
        domain: mapAgentIntelDomain(tool.lifecycleId),
      app: "RedDirt",
      sourcePath: tool.futureRoute,
      purpose: tool.purpose,
      status: tool.status,
      version: "v1",
      kind: "deterministic",
      reads: tool.reads,
      writes: tool.writes,
      permissions: "admin",
      humanApprovalRequired: tool.humanApprovalRequired,
      observationEvents: [],
      riskLevel: "medium",
      routeBindings: [tool.futureRoute].filter(Boolean),
      automationReadiness: "human_gated",
      v2LearningPath: "Cross-domain context fusion + observation mining",
      inUnifiedMasterAgent: true,
    });
  }
  return out;
}

function mapAgentIntelDomain(lifecycleId: string): MasterToolRegistryEntry["domain"] {
  if (lifecycleId.startsWith("agent_user")) return "global_orchestration";
  if (lifecycleId.startsWith("agent_writing")) return "global_orchestration";
  if (lifecycleId.startsWith("agent_ux")) return "global_orchestration";
  if (lifecycleId.startsWith("agent_campaign")) return "global_orchestration";
  if (lifecycleId.startsWith("agent_system")) return "global_orchestration";
  return "global_orchestration";
}

function mapSprintLifecycle(id: string): MasterToolRegistryEntry["domain"] {
  if (id.includes("approval_email")) return "approval_email";
  if (id.includes("calendar_promotion")) return "google_calendar";
  if (id.includes("global")) return "global_orchestration";
  return "campaign_events";
}

let _cache: MasterToolRegistryEntry[] | null = null;

export function listMasterRegistryTools(): MasterToolRegistryEntry[] {
  if (!_cache) _cache = catalogToRegistry();
  return _cache;
}

export function countMasterRegistryByStatus() {
  const tools = listMasterRegistryTools();
  return {
    total: tools.length,
    functional: tools.filter((t) => t.status === "functional").length,
    partial: tools.filter((t) => t.status === "partial").length,
    scaffolded: tools.filter((t) => t.status === "scaffolded").length,
    idea: tools.filter((t) => t.status === "idea").length,
  };
}
