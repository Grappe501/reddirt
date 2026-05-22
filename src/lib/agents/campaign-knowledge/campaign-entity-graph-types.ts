/**
 * Campaign Knowledge Graph — entity types (Phase 3A).
 * Metadata-only nodes; no raw PII bodies or voter file rows.
 */

import type { CampaignDomainId } from "@/lib/agents/orchestration/campaign-state-types";

export type CampaignEntityKind =
  | "person"
  | "county"
  | "organization"
  | "event"
  | "message"
  | "workflow"
  | "decision"
  | "outcome"
  | "observation"
  | "lesson"
  | "recommendation"
  | "blocker"
  | "tool_usage";

export type CampaignEntityNode = {
  id: string;
  kind: CampaignEntityKind;
  label: string;
  domainId?: CampaignDomainId;
  sourceSystem: string;
  sourceRef?: string;
  freshnessAt: string;
  confidence: number;
  metadata: Record<string, string | number | boolean | null>;
};

export type CampaignEntityEdge = {
  id: string;
  fromId: string;
  toId: string;
  relation: string;
  strength: number;
  observedAt: string;
};

export type CampaignEntityGraph = {
  generatedAt: string;
  period: string;
  nodes: CampaignEntityNode[];
  edges: CampaignEntityEdge[];
  summary: {
    nodeCount: number;
    edgeCount: number;
    byKind: Partial<Record<CampaignEntityKind, number>>;
    underInformedKinds: CampaignEntityKind[];
  };
};

export function emptyCampaignEntityGraph(period = "2026-04"): CampaignEntityGraph {
  return {
    generatedAt: new Date().toISOString(),
    period,
    nodes: [],
    edges: [],
    summary: { nodeCount: 0, edgeCount: 0, byKind: {}, underInformedKinds: ["person", "message", "decision"] },
  };
}
