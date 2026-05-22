import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CampaignEntityGraph, CampaignEntityNode, CampaignEntityEdge } from "./campaign-entity-graph-types";

const REL = "data/campaign-events/campaign-knowledge/entity-graph.json";

function filePath(repoRoot?: string) {
  return path.join(repoRoot ?? process.cwd(), REL);
}

export function loadCampaignEntityGraph(repoRoot?: string): CampaignEntityGraph | null {
  const p = filePath(repoRoot);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as CampaignEntityGraph;
  } catch {
    return null;
  }
}

export function saveCampaignEntityGraph(graph: CampaignEntityGraph, repoRoot?: string): void {
  const p = filePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(p, JSON.stringify(graph, null, 2), "utf8");
}

export function upsertEntityNodes(
  graph: CampaignEntityGraph,
  nodes: CampaignEntityNode[],
  edges: CampaignEntityEdge[] = [],
): CampaignEntityGraph {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  for (const n of nodes) nodeMap.set(n.id, n);
  const edgeMap = new Map(graph.edges.map((e) => [e.id, e]));
  for (const e of edges) edgeMap.set(e.id, e);

  const mergedNodes = [...nodeMap.values()].slice(-500);
  const mergedEdges = [...edgeMap.values()].slice(-800);
  const byKind: CampaignEntityGraph["summary"]["byKind"] = {};
  for (const n of mergedNodes) {
    byKind[n.kind] = (byKind[n.kind] ?? 0) + 1;
  }

  const expectedKinds = ["person", "county", "event", "message", "observation", "lesson"] as const;
  const underInformedKinds = expectedKinds.filter((k) => (byKind[k] ?? 0) < 2);

  return {
    ...graph,
    generatedAt: new Date().toISOString(),
    nodes: mergedNodes,
    edges: mergedEdges,
    summary: {
      nodeCount: mergedNodes.length,
      edgeCount: mergedEdges.length,
      byKind,
      underInformedKinds: [...underInformedKinds],
    },
  };
}
