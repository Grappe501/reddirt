import fs from "node:fs";
import path from "node:path";
import type {
  AgentCapabilityMapFile,
  AgentDependencyGraphFile,
  AgentRuntimeCoordinationMapFile,
  AgentRuntimeStateTableFile,
  AgentSafetyPolicyMapFile,
  CampaignBrainAgentRegistryFile,
  CrossAgentInsightStreamFile,
  MultiAgentCoordinationReadinessFile,
} from "./multiAgentTypes";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

export function loadCampaignBrainAgentRegistry(): CampaignBrainAgentRegistryFile {
  return readJson<CampaignBrainAgentRegistryFile>("data/multi-agent/campaign-brain-agent-registry.json");
}

export function loadAgentCapabilityMap(): AgentCapabilityMapFile {
  return readJson<AgentCapabilityMapFile>("data/multi-agent/agent-capability-map.json");
}

export function loadAgentRuntimeCoordinationMap(): AgentRuntimeCoordinationMapFile {
  return readJson<AgentRuntimeCoordinationMapFile>(
    "data/multi-agent/agent-runtime-coordination-map.json",
  );
}

export function loadAgentDependencyGraph(): AgentDependencyGraphFile {
  return readJson<AgentDependencyGraphFile>("data/multi-agent/agent-dependency-graph.json");
}

export function loadAgentSafetyPolicyMap(): AgentSafetyPolicyMapFile {
  return readJson<AgentSafetyPolicyMapFile>("data/multi-agent/agent-safety-policy-map.json");
}

export function loadAgentRuntimeStateTable(): AgentRuntimeStateTableFile {
  return readJson<AgentRuntimeStateTableFile>("data/multi-agent/agent-runtime-state-table.json");
}

export function loadCrossAgentInsightStream(): CrossAgentInsightStreamFile {
  return readJson<CrossAgentInsightStreamFile>("data/multi-agent/cross-agent-insight-stream.json");
}

export function loadMultiAgentCoordinationReadiness(): MultiAgentCoordinationReadinessFile {
  return readJson<MultiAgentCoordinationReadinessFile>(
    "data/audit/multi-agent-coordination-readiness-table.json",
  );
}

