import fs from "node:fs";
import path from "node:path";
import type {
  CountyRelationshipEdge,
  CountyRelationshipGraphFile,
  MemoryFieldStatus,
  RegionalInfluenceMapFile,
  RegionalInfluenceRow,
} from "./countyMemoryTypes";

const REL_GRAPH_PATH = path.join(process.cwd(), "data", "county-memory", "county-relationship-graph.json");
const REGIONAL_INFLUENCE_PATH = path.join(process.cwd(), "data", "county-memory", "regional-influence-map.json");

function defaultEdge(countySlug: string): CountyRelationshipEdge {
  return {
    sourceCountySlug: countySlug,
    targetCountySlug: countySlug,
    relationshipType: "no_graph_data",
    signalStrength: 0,
    confidence: "MISSING",
    sharedIssues: ["MISSING"],
    notes: "No relationship graph edges loaded yet.",
  };
}

export function loadCountyRelationshipGraph(): CountyRelationshipGraphFile {
  const raw = fs.readFileSync(REL_GRAPH_PATH, "utf8");
  return JSON.parse(raw) as CountyRelationshipGraphFile;
}

export function loadRegionalInfluenceMap(): RegionalInfluenceMapFile {
  const raw = fs.readFileSync(REGIONAL_INFLUENCE_PATH, "utf8");
  return JSON.parse(raw) as RegionalInfluenceMapFile;
}

export function getCountyRelationshipEdges(countySlug: string): CountyRelationshipEdge[] {
  const graph = loadCountyRelationshipGraph();
  const rows = graph.edges.filter(
    (edge) => edge.sourceCountySlug === countySlug || edge.targetCountySlug === countySlug,
  );
  return rows.length > 0 ? rows : [defaultEdge(countySlug)];
}

export function summarizeRelationshipConfidence(edges: CountyRelationshipEdge[]): MemoryFieldStatus {
  if (edges.some((edge) => edge.confidence === "PRESENT")) return "PRESENT";
  if (edges.some((edge) => edge.confidence === "NEEDS_REVIEW")) return "NEEDS_REVIEW";
  return "MISSING";
}

export function getRegionalInfluenceForCounty(countySlug: string): RegionalInfluenceRow | null {
  const map = loadRegionalInfluenceMap();
  return map.rows.find((row) => row.counties.includes(countySlug)) ?? null;
}

