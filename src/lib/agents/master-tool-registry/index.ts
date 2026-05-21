/**
 * Master tool registry — read-only aggregation for the All-Knowing Campaign Agent.
 * V0: re-exports Campaign Event OS catalog + global orchestration contracts.
 * Future: ingest Kelly Agent, compliance, countyWorkbench, AJAX without cross-lane imports.
 */
import { AI_TOOL_LIFECYCLES } from "@/lib/campaign-events/ai-tools-master-catalog";
import { mergeSupplementIntoLifecycles } from "@/lib/campaign-events/ai-tools-supplement";
import { GLOBAL_AGENT_ORCHESTRATION_CATALOG_ENTRIES } from "@/lib/campaign-events/ai-tools/sprint-global-agent-tools";
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
  for (const tool of GLOBAL_AGENT_ORCHESTRATION_CATALOG_ENTRIES) {
    if (out.some((x) => x.id === tool.id)) continue;
    out.push({
      id: tool.id,
      name: tool.name,
      domain: "global_orchestration",
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
