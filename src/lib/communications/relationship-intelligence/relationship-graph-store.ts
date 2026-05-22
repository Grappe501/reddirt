import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RelationshipGraph } from "./relationship-graph-types";

const REL_DIR = "data/campaign-events/communications";
const GRAPH_FILE = "relationship-graph.json";

function graphPath(repoRoot?: string): string {
  return path.join(repoRoot ?? process.cwd(), REL_DIR, GRAPH_FILE);
}

export function loadPersistedRelationshipGraph(repoRoot?: string): RelationshipGraph | null {
  const p = graphPath(repoRoot);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as RelationshipGraph;
  } catch {
    return null;
  }
}

export function saveRelationshipGraph(graph: RelationshipGraph, repoRoot?: string): void {
  const p = graphPath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(p, JSON.stringify(graph, null, 2), "utf8");
}
