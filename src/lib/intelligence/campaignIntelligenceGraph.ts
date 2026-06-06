import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadCampaignStrategicDoctrineRegistry } from "@/lib/intelligence/campaignStrategicAlignment";
import { loadKimHammerExportHistory } from "@/lib/opposition/kimHammerExportControl";
import { loadKimHammerGeographicNarrativeOverlays } from "@/lib/opposition/kimHammerGeographicNarrativeState";
import { loadKimHammerNarrativeRegistry } from "@/lib/opposition/kimHammerNarrativeState";
import { findKimHammerBillNarrative } from "@/lib/opposition/kimHammerLegislativeNarratives";
import { enrichPhilosophyGraphNode } from "@/lib/intelligence/v4/applyPhase10StrategyPhilosophy";
import type {
  CampaignGraphEntity,
  CampaignIntelligenceGraphFile,
  CampaignPhilosophyGraphFile,
  CampaignPhilosophyNode,
} from "@/lib/intelligence/types/campaignIntelligenceGraph";

export const CAMPAIGN_INTELLIGENCE_GRAPH_REL = "data/intelligence/campaign-intelligence-graph.json";
export const CAMPAIGN_PHILOSOPHY_GRAPH_REL = "data/intelligence/campaign-philosophy-graph.json";

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

function readJson<T>(repoRoot: string, rel: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, rel), "utf8")) as T;
}

export function loadCampaignPhilosophyGraph(
  repoRoot: string = process.cwd(),
): CampaignPhilosophyGraphFile {
  if (!existsSync(absPath(repoRoot, CAMPAIGN_PHILOSOPHY_GRAPH_REL))) {
    return { generatedAt: new Date().toISOString(), graphVersion: "1.0", purpose: "Uninitialized", nodes: [] };
  }
  return readJson<CampaignPhilosophyGraphFile>(repoRoot, CAMPAIGN_PHILOSOPHY_GRAPH_REL);
}

export function loadCampaignIntelligenceGraph(
  repoRoot: string = process.cwd(),
): CampaignIntelligenceGraphFile {
  if (!existsSync(absPath(repoRoot, CAMPAIGN_INTELLIGENCE_GRAPH_REL))) {
    return {
      generatedAt: new Date().toISOString(),
      graphVersion: "1.0",
      purpose: "Uninitialized",
      entityCount: 0,
      entities: [],
    };
  }
  return readJson<CampaignIntelligenceGraphFile>(repoRoot, CAMPAIGN_INTELLIGENCE_GRAPH_REL);
}

export function resolveGraphEntity(
  entityId: string,
  repoRoot: string = process.cwd(),
): CampaignGraphEntity | undefined {
  const graph = loadCampaignIntelligenceGraph(repoRoot);
  return graph.entities.find((row) => row.entityId === entityId);
}

export function resolveLinkedGraphEntities(
  entityId: string,
  repoRoot: string = process.cwd(),
): CampaignGraphEntity[] {
  const root = resolveGraphEntity(entityId, repoRoot);
  if (!root) return [];
  const graph = loadCampaignIntelligenceGraph(repoRoot);
  const byId = new Map(graph.entities.map((row) => [row.entityId, row]));
  return root.linkedEntities.map((id) => byId.get(id)).filter((row): row is CampaignGraphEntity => Boolean(row));
}

export function loadEnrichedCampaignPhilosophyGraph(repoRoot: string = process.cwd()) {
  const graph = loadCampaignPhilosophyGraph(repoRoot);
  return {
    ...graph,
    nodes: graph.nodes.map(enrichPhilosophyGraphNode),
  };
}

export function resolvePhilosophyNode(
  philosophyId: string,
  repoRoot: string = process.cwd(),
): CampaignPhilosophyNode | undefined {
  const graph = loadCampaignPhilosophyGraph(repoRoot);
  return graph.nodes.find((row) => row.philosophyId === philosophyId);
}

export function resolvePhilosophyForBill(
  billNumber: string,
  repoRoot: string = process.cwd(),
): CampaignPhilosophyNode[] {
  const graph = loadCampaignPhilosophyGraph(repoRoot);
  return graph.nodes.filter((row) => row.linkedBills.includes(billNumber.toUpperCase()));
}

export function resolveGraphEntityForBill(
  billNumber: string,
  repoRoot: string = process.cwd(),
): CampaignGraphEntity | undefined {
  return resolveGraphEntity(`bill-${billNumber.toUpperCase()}`, repoRoot);
}

export function summarizeCampaignIntelligenceGraph(
  repoRoot?: string,
): {
  entityCount: number;
  entityTypeCounts: Record<string, number>;
  billCount: number;
  narrativeCount: number;
  doctrineCount: number;
  philosophyCount: number;
} {
  const graph = loadCampaignIntelligenceGraph(repoRoot);
  const entityTypeCounts: Record<string, number> = {};
  for (const entity of graph.entities) {
    entityTypeCounts[entity.entityType] = (entityTypeCounts[entity.entityType] ?? 0) + 1;
  }
  const philosophy = loadCampaignPhilosophyGraph(repoRoot);
  return {
    entityCount: graph.entityCount,
    entityTypeCounts,
    billCount: entityTypeCounts.BILL ?? 0,
    narrativeCount: entityTypeCounts.NARRATIVE ?? 0,
    doctrineCount: entityTypeCounts.DOCTRINE ?? 0,
    philosophyCount: philosophy.nodes.length,
  };
}

export function auditCampaignIntelligenceGraphLinks(repoRoot: string = process.cwd()): {
  validLinks: number;
  brokenLinks: string[];
} {
  const graph = loadCampaignIntelligenceGraph(repoRoot);
  const ids = new Set(graph.entities.map((row) => row.entityId));
  let validLinks = 0;
  const brokenLinks: string[] = [];

  for (const entity of graph.entities) {
    for (const link of entity.linkedEntities) {
      if (ids.has(link)) validLinks += 1;
      else brokenLinks.push(`${entity.entityId} -> ${link}`);
    }
  }

  return { validLinks, brokenLinks };
}

export function listGraphEntitiesByType(
  entityType: CampaignGraphEntity["entityType"],
  repoRoot?: string,
): CampaignGraphEntity[] {
  return loadCampaignIntelligenceGraph(repoRoot).entities.filter((row) => row.entityType === entityType);
}

export function verifyGraphArtifactSync(repoRoot: string = process.cwd()): {
  narrativeRegistryCount: number;
  graphNarrativeCount: number;
  doctrineRegistryCount: number;
  graphDoctrineCount: number;
  exportHistoryCount: number;
} {
  const narratives = loadKimHammerNarrativeRegistry(repoRoot);
  const doctrines = loadCampaignStrategicDoctrineRegistry(repoRoot);
  const exports = loadKimHammerExportHistory(repoRoot);
  const graph = loadCampaignIntelligenceGraph(repoRoot);
  return {
    narrativeRegistryCount: narratives.narratives.length,
    graphNarrativeCount: graph.entities.filter((row) => row.entityType === "NARRATIVE").length,
    doctrineRegistryCount: doctrines.doctrines.length,
    graphDoctrineCount: graph.entities.filter((row) => row.entityType === "DOCTRINE").length,
    exportHistoryCount: exports.entries.length,
  };
}

export function resolveBillGraphBundle(
  billNumber: string,
  repoRoot: string = process.cwd(),
): {
  billEntity?: CampaignGraphEntity;
  linkedEntities: CampaignGraphEntity[];
  philosophyNodes: CampaignPhilosophyNode[];
  narrativeIntel: ReturnType<typeof findKimHammerBillNarrative>;
} {
  const billEntity = resolveGraphEntityForBill(billNumber, repoRoot);
  const linkedEntities = billEntity ? resolveLinkedGraphEntities(billEntity.entityId, repoRoot) : [];
  return {
    billEntity,
    linkedEntities,
    philosophyNodes: resolvePhilosophyForBill(billNumber, repoRoot),
    narrativeIntel: findKimHammerBillNarrative(billNumber),
  };
}

export function getGraphDomainsUnified(): string[] {
  return [
    "Bills / laws",
    "Narratives",
    "Claims",
    "Citations",
    "Counties",
    "Export packets",
    "Debate frames",
    "Strategic doctrines",
    "Philosophy principles",
    "Civic values",
    "County burden themes",
    "Governance concepts",
    "AI suggestions",
    "Geographic overlays",
    "Narrative fatigue analytics",
    "Field strategy references",
    "County briefing intelligence (NSI-5)",
    "Operational environment (NSI-6)",
    "Turnout signals (aggregate)",
    "Media ecosystem overlays",
    "Demographic overlays (aggregate)",
    "Regional strategic clusters (NSI-6)",
    "Volunteer/surrogate messaging guidance",
    "Voter/election aggregate overlays (read-only)",
  ];
}

export function resolveCountyGraphBundle(
  countyId: string,
  repoRoot: string = process.cwd(),
): {
  countyEntity?: CampaignGraphEntity;
  overlayEntity?: CampaignGraphEntity;
  narratives: CampaignGraphEntity[];
  bills: CampaignGraphEntity[];
  doctrines: CampaignGraphEntity[];
  philosophyNodes: CampaignPhilosophyNode[];
  graphNotes: string[];
} {
  const countyEntity = resolveGraphEntity(`county-${countyId}`, repoRoot);
  const overlayEntity = resolveGraphEntity(`geo-overlay-${countyId}`, repoRoot);
  const linked = countyEntity ? resolveLinkedGraphEntities(countyEntity.entityId, repoRoot) : [];
  const overlayLinked = overlayEntity ? resolveLinkedGraphEntities(overlayEntity.entityId, repoRoot) : [];

  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const overlay = overlays.overlays.find((row) => row.countyId === countyId);
  const graph = loadCampaignIntelligenceGraph(repoRoot);
  const byId = new Map(graph.entities.map((row) => [row.entityId, row]));

  const narrativeEntities: CampaignGraphEntity[] = [];
  const billEntities: CampaignGraphEntity[] = [];
  for (const narrativeId of overlay?.narrativeIds ?? []) {
    const candidates = [
      `narrative-${narrativeId}`,
      `narrative-kh0b-${narrativeId.replace(/^kh0b-/, "")}`,
      narrativeId.startsWith("debate-frame-") ? `narrative-${narrativeId}` : undefined,
    ].filter(Boolean) as string[];
    for (const id of candidates) {
      const entity = byId.get(id);
      if (entity) narrativeEntities.push(entity);
    }
    if (/^SB\d+/i.test(narrativeId)) {
      const bill = byId.get(`bill-${narrativeId.toUpperCase()}`);
      if (bill) billEntities.push(bill);
    }
  }

  for (const entity of [...linked, ...overlayLinked]) {
    if (entity.entityType === "NARRATIVE" && !narrativeEntities.some((row) => row.entityId === entity.entityId)) {
      narrativeEntities.push(entity);
    }
    if (entity.entityType === "BILL" && !billEntities.some((row) => row.entityId === entity.entityId)) {
      billEntities.push(entity);
    }
  }

  const doctrineIds = new Set([
    ...(countyEntity?.doctrineLinks ?? []),
    ...narrativeEntities.flatMap((row) => row.doctrineLinks),
    ...billEntities.flatMap((row) => row.doctrineLinks),
  ]);
  const doctrines = [...doctrineIds]
    .map((id) => byId.get(id))
    .filter((row): row is CampaignGraphEntity => Boolean(row));

  const philosophy = loadCampaignPhilosophyGraph(repoRoot);
  const philosophyNodes = philosophy.nodes.filter(
    (node) =>
      node.linkedBills.some((bill) => billEntities.some((entity) => entity.entityId === `bill-${bill}`)) ||
      doctrines.some((doc) => node.linkedDoctrines.includes(doc.entityId)),
  );

  const graphNotes = [
    `${countyId}: ${narrativeEntities.length} narrative graph edge(s), ${billEntities.length} bill edge(s), ${doctrines.length} doctrine link(s).`,
    "County → narratives → bills → civic impacts → citations → export history → doctrine → debate/volunteer guidance (read-only).",
  ];

  return {
    countyEntity,
    overlayEntity,
    narratives: narrativeEntities,
    bills: billEntities,
    doctrines,
    philosophyNodes,
    graphNotes,
  };
}
