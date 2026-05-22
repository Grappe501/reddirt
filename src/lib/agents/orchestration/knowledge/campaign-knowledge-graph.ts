/**
 * Deterministic V1 campaign knowledge graph builder from CampaignState + signals.
 */

import type { CampaignState, CampaignBlocker, CampaignOpportunity } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import type {
  CampaignKnowledgeEntity,
  CampaignKnowledgeEdge,
  CampaignKnowledgeGraphHealth,
  CampaignKnowledgeGraphResult,
  CampaignObservation,
  CampaignLesson,
  RecommendationFeedback,
} from "./campaign-knowledge-types";

function entityId(type: string, ref: string): string {
  return `${type}:${ref}`.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 120);
}

function edgeId(from: string, to: string, rel: string): string {
  return `edge:${from}:${to}:${rel}`.slice(0, 160);
}

function freshnessFromDate(iso: string): CampaignKnowledgeEntity["freshness"] {
  const days = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 14) return "fresh";
  if (days <= 60) return "aging";
  return "stale";
}

function entityFromBlocker(b: CampaignBlocker, now: string): CampaignKnowledgeEntity {
  return {
    id: entityId("blocker", b.id),
    type: "blocker",
    label: b.message.slice(0, 100),
    summary: b.message,
    aliases: [],
    domains: [b.domainId],
    counties: [],
    sourceIds: [b.id],
    confidence: b.severity === "P0" ? 90 : b.severity === "P1" ? 80 : 65,
    freshness: "fresh",
    createdAt: now,
    updatedAt: now,
    metadata: { severity: b.severity, route: b.suggestedRoute ?? "" },
  };
}

function entityFromOpportunity(o: CampaignOpportunity, now: string): CampaignKnowledgeEntity {
  return {
    id: entityId("opportunity", o.id),
    type: "opportunity",
    label: o.message.slice(0, 100),
    summary: o.message,
    aliases: [],
    domains: [o.domainId],
    counties: [],
    sourceIds: [o.id],
    confidence: o.impact === "high" ? 85 : o.impact === "medium" ? 72 : 60,
    freshness: "fresh",
    createdAt: now,
    updatedAt: now,
    metadata: { impact: o.impact },
  };
}

function domainEntity(domainId: string, score: number, summary: string, now: string): CampaignKnowledgeEntity {
  return {
    id: entityId("domain", domainId),
    type: "domain",
    label: domainId.replaceAll("_", " "),
    summary,
    aliases: [],
    domains: [domainId as CampaignKnowledgeEntity["domains"][0]],
    counties: [],
    sourceIds: [`domain:${domainId}`],
    confidence: Math.min(95, score),
    freshness: score >= 70 ? "fresh" : score >= 40 ? "aging" : "stale",
    createdAt: now,
    updatedAt: now,
    metadata: { score },
  };
}

function dedupeEntities(entities: CampaignKnowledgeEntity[]): CampaignKnowledgeEntity[] {
  const map = new Map<string, CampaignKnowledgeEntity>();
  for (const e of entities) {
    const existing = map.get(e.id);
    if (!existing || e.confidence > existing.confidence) map.set(e.id, e);
  }
  return [...map.values()];
}

function dedupeEdges(edges: CampaignKnowledgeEdge[]): CampaignKnowledgeEdge[] {
  const map = new Map<string, CampaignKnowledgeEdge>();
  for (const e of edges) map.set(e.id, e);
  return [...map.values()];
}

export function buildCampaignKnowledgeGraph(input: {
  state: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
  observations?: CampaignObservation[];
  lessons?: CampaignLesson[];
  recommendationFeedback?: RecommendationFeedback[];
  persistedEntities?: CampaignKnowledgeEntity[];
  persistedEdges?: CampaignKnowledgeEdge[];
}): CampaignKnowledgeGraphResult {
  const now = new Date().toISOString();
  const { state, sourceHealth } = input;
  const entities: CampaignKnowledgeEntity[] = [...(input.persistedEntities ?? [])];
  const edges: CampaignKnowledgeEdge[] = [...(input.persistedEdges ?? [])];
  const observations: CampaignObservation[] = [...(input.observations ?? [])];

  for (const b of state.activeBlockers) {
    entities.push(entityFromBlocker(b, now));
    const domainId = entityId("domain", b.domainId);
    edges.push({
      id: edgeId(entityId("blocker", b.id), domainId, "blocks"),
      fromId: entityId("blocker", b.id),
      toId: domainId,
      relationship: "blocks",
      confidence: 85,
      evidence: [b.message],
      sourceIds: [b.id],
      createdAt: now,
      metadata: {},
    });
  }

  for (const o of state.activeOpportunities) {
    entities.push(entityFromOpportunity(o, now));
    const domainId = entityId("domain", o.domainId);
    edges.push({
      id: edgeId(entityId("opportunity", o.id), domainId, "unlocks"),
      fromId: entityId("opportunity", o.id),
      toId: domainId,
      relationship: "unlocks",
      confidence: 75,
      evidence: [o.message],
      sourceIds: [o.id],
      createdAt: now,
      metadata: {},
    });
  }

  for (const d of Object.values(state.domainStatuses)) {
    entities.push(domainEntity(d.domainId, d.score, d.summary, now));
    if (d.band === "weak" || d.band === "critical") {
      edges.push({
        id: edgeId(entityId("domain", d.domainId), entityId("risk", d.domainId), "weakened_domain"),
        fromId: entityId("domain", d.domainId),
        toId: entityId("risk", `weak-${d.domainId}`),
        relationship: "weakened_domain",
        confidence: 80,
        evidence: d.blockers.length ? d.blockers : [d.summary],
        sourceIds: [`domain:${d.domainId}`],
        createdAt: now,
        metadata: { band: d.band },
      });
      entities.push({
        id: entityId("risk", `weak-${d.domainId}`),
        type: "risk",
        label: `Weak ${d.domainId.replaceAll("_", " ")}`,
        summary: d.summary,
        aliases: [],
        domains: [d.domainId],
        counties: [],
        sourceIds: [`domain:${d.domainId}`],
        confidence: 78,
        freshness: "fresh",
        createdAt: now,
        updatedAt: now,
        metadata: { band: d.band },
      });
    }
  }

  for (const c of state.countyIntelligenceSummary.heatListTop.slice(0, 8)) {
    const slug = c.toLowerCase().replace(/\s+/g, "-");
    entities.push({
      id: entityId("county", slug),
      type: "county",
      label: c,
      summary: `County attention signal from intelligence heat list`,
      aliases: [],
      domains: ["county"],
      counties: [slug],
      sourceIds: ["county-intelligence"],
      confidence: 72,
      freshness: "fresh",
      createdAt: now,
      updatedAt: now,
      metadata: { heatList: true },
    });
  }

  for (const w of state.financeComplianceWarnings) {
    entities.push({
      id: entityId("issue", w.slice(0, 40)),
      type: "issue",
      label: w.slice(0, 80),
      summary: w,
      aliases: [],
      domains: ["finance", "compliance"],
      counties: [],
      sourceIds: ["finance-compliance"],
      confidence: 88,
      freshness: "fresh",
      createdAt: now,
      updatedAt: now,
      metadata: {},
    });
  }

  for (const a of state.preparedActions.slice(0, 6)) {
    entities.push({
      id: entityId("workflow", a.id),
      type: "workflow",
      label: a.title,
      summary: a.why,
      aliases: [],
      domains: ["campaign_management"],
      counties: [],
      sourceIds: [a.id],
      confidence: 70,
      freshness: "fresh",
      createdAt: now,
      updatedAt: now,
      metadata: { humanGate: a.humanGate },
    });
  }

  const missingSources = sourceHealth
    .filter((s) => s.status === "error" || s.status === "missing" || s.status === "degraded")
    .map((s) => s.label);

  for (const src of missingSources) {
    observations.push({
      id: entityId("obs", `missing-${src}`),
      type: "ai_inference",
      title: `Degraded source: ${src}`,
      summary: `Signal source ${src} is not fully available — knowledge graph has a gap.`,
      domains: ["campaign_management"],
      counties: [],
      people: [],
      source: "orchestration-source-health",
      confidence: 90,
      sensitivity: "internal",
      approvalStatus: "approved",
      createdAt: now,
      evidence: [src],
      suggestedEntities: [],
      suggestedEdges: [],
      suggestedLessons: [],
    });
  }

  const mergedEntities = dedupeEntities(entities).slice(-600);
  const mergedEdges = dedupeEdges(edges).slice(-900);
  const lessons = input.lessons ?? [];
  const feedback = input.recommendationFeedback ?? [];

  const weakDomains = state.weakDomains.map((d) => d.replaceAll("_", " "));
  const staleDomains = [...new Set(lessons.filter((l) => l.freshness === "stale").flatMap((l) => l.domains))].map((d) =>
    d.replaceAll("_", " "),
  );

  let confidence: CampaignKnowledgeGraphHealth["confidence"] = "medium";
  if (missingSources.length >= 3 || mergedEntities.length < 5) confidence = "low";
  if (missingSources.length === 0 && mergedEntities.length >= 20 && state.confidenceLevel === "high") confidence = "high";

  const graphHealth: CampaignKnowledgeGraphHealth = {
    entityCount: mergedEntities.length,
    edgeCount: mergedEdges.length,
    lessonCount: lessons.length,
    observationCount: observations.length,
    weakDomains,
    staleDomains,
    missingSources,
    confidence,
  };

  return {
    generatedAt: now,
    entities: mergedEntities,
    edges: mergedEdges,
    observations,
    lessons,
    recommendationFeedback: feedback,
    graphHealth,
  };
}

/** Convert legacy entity-graph nodes to canonical entities. */
export function legacyNodesToEntities(
  nodes: { id: string; kind: string; label: string; domainId?: string; freshnessAt: string; confidence: number; sourceSystem: string }[],
): CampaignKnowledgeEntity[] {
  const typeMap: Record<string, CampaignKnowledgeEntity["type"]> = {
    person: "person",
    county: "county",
    organization: "organization",
    event: "event",
    message: "message",
    workflow: "workflow",
    decision: "decision",
    outcome: "outcome",
    observation: "observation",
    lesson: "lesson",
    recommendation: "recommendation",
    blocker: "blocker",
    tool_usage: "tool",
  };
  return nodes.map((n) => ({
    id: n.id,
    type: typeMap[n.kind] ?? "observation",
    label: n.label,
    summary: n.label,
    aliases: [],
    domains: n.domainId ? [n.domainId as CampaignKnowledgeEntity["domains"][0]] : [],
    counties: n.kind === "county" ? [n.label.toLowerCase().replace(/\s+/g, "-")] : [],
    sourceIds: [n.sourceSystem],
    confidence: n.confidence,
    freshness: freshnessFromDate(n.freshnessAt),
    createdAt: n.freshnessAt,
    updatedAt: n.freshnessAt,
    metadata: {},
  }));
}
