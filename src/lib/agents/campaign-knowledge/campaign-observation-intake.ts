/**
 * Observation intake — converts campaign signals into structured graph nodes + lesson candidates.
 * No raw PII; metadata and summaries only.
 */

import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";
import type { CampaignEntityEdge, CampaignEntityNode } from "./campaign-entity-graph-types";
import type { CampaignLesson } from "./campaign-lessons-types";
import type { CampaignDomainId } from "@/lib/agents/orchestration/campaign-state-types";
import type { CampaignLearningSnapshot } from "@/lib/campaign-events/hot-wash-intelligence/load-campaign-learning-snapshot";
import type { StatewideCountyIntelligence } from "@/lib/agents/county-intelligence/county-kpi-types";
import type { CampaignBlocker } from "@/lib/agents/orchestration/campaign-state-types";

function nodeId(kind: string, ref: string): string {
  return `${kind}:${ref}`.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 120);
}

function domainFromPath(pathname?: string): CampaignDomainId {
  if (!pathname) return "campaign_management";
  if (pathname.includes("county")) return "county";
  if (pathname.includes("communication") || pathname.includes("email")) return "communications";
  if (pathname.includes("reimbursement") || pathname.includes("finance")) return "finance";
  if (pathname.includes("volunteer")) return "volunteer";
  if (pathname.includes("workbench") || pathname.includes("campaign-events")) return "event_planning";
  if (pathname.includes("compliance")) return "compliance";
  return "campaign_management";
}

export type ObservationIntakeResult = {
  nodes: CampaignEntityNode[];
  edges: CampaignEntityEdge[];
  lessonCandidates: Omit<CampaignLesson, "id" | "createdAt" | "updatedAt">[];
};

export function intakeFromUserObservations(observations: UserObservationEntry[]): ObservationIntakeResult {
  const nodes: CampaignEntityNode[] = [];
  const lessonCandidates: ObservationIntakeResult["lessonCandidates"] = [];
  const now = new Date().toISOString();

  for (const o of observations.slice(-40)) {
    const id = nodeId("obs", `${o.event}:${o.at ?? now}:${o.pathname ?? ""}`);
    nodes.push({
      id,
      kind: "observation",
      label: o.event.replaceAll("_", " "),
      domainId: domainFromPath(o.pathname),
      sourceSystem: "user-observations",
      sourceRef: o.event,
      freshnessAt: o.at ?? now,
      confidence: 70,
      metadata: { pathname: o.pathname ?? "", role: o.role ?? "" },
    });

    if (o.event === "hotwash_completed" || o.event === "strategic_signal_detected") {
      lessonCandidates.push({
        title: `Observation: ${o.event}`,
        summary: `Signal from ${o.pathname ?? "admin"} — review hot wash for lesson extraction.`,
        domainId: "hot_wash",
        lessonType: "what_worked",
        confidence: "medium",
        freshness: "fresh",
        usefulnessScore: 55,
        sourceKind: "user_observation",
        sourceRef: o.event,
        linkedEntityIds: [id],
        requiresHumanApproval: true,
        status: "proposed",
      });
    }

    if (o.event === "flow_abandoned" || o.event === "abandoned_flow") {
      lessonCandidates.push({
        title: "Workflow friction detected",
        summary: `Operators abandoned flow on ${o.pathname ?? "unknown path"}.`,
        domainId: domainFromPath(o.pathname),
        lessonType: "operational",
        confidence: "low",
        freshness: "fresh",
        usefulnessScore: 45,
        sourceKind: "user_observation",
        linkedEntityIds: [id],
        requiresHumanApproval: true,
        status: "proposed",
      });
    }
  }

  return { nodes, edges: [], lessonCandidates };
}

export function intakeFromHotWashLearning(learning: CampaignLearningSnapshot): ObservationIntakeResult {
  const nodes: CampaignEntityNode[] = [];
  const lessonCandidates: ObservationIntakeResult["lessonCandidates"] = [];
  const now = new Date().toISOString();

  for (const issue of learning.topIssues.slice(0, 6)) {
    const id = nodeId("outcome", issue.slice(0, 40));
    nodes.push({
      id,
      kind: "outcome",
      label: issue.slice(0, 80),
      domainId: "hot_wash",
      sourceSystem: "campaign-learning-snapshot",
      freshnessAt: now,
      confidence: 65,
      metadata: { type: "recurring_issue" },
    });
    lessonCandidates.push({
      title: `Recurring issue: ${issue.slice(0, 60)}`,
      summary: issue,
      domainId: "hot_wash",
      lessonType: "pattern",
      confidence: "medium",
      freshness: "aging",
      usefulnessScore: 60,
      sourceKind: "hot_wash_learning",
      linkedEntityIds: [id],
      requiresHumanApproval: true,
      status: "proposed",
    });
  }

  for (const fmt of learning.topFormats.slice(0, 4)) {
    nodes.push({
      id: nodeId("event", fmt.slice(0, 40)),
      kind: "event",
      label: fmt.slice(0, 80),
      domainId: "event_planning",
      sourceSystem: "campaign-learning-snapshot",
      freshnessAt: now,
      confidence: 60,
      metadata: { type: "top_format" },
    });
  }

  return { nodes, edges: [], lessonCandidates };
}

export function intakeFromCountyIntelligence(county: StatewideCountyIntelligence): ObservationIntakeResult {
  const nodes: CampaignEntityNode[] = [];
  const lessonCandidates: ObservationIntakeResult["lessonCandidates"] = [];
  const now = county.generatedAt ?? new Date().toISOString();

  for (const c of county.weakCounties.slice(0, 8)) {
    const id = nodeId("county", c.countySlug);
    nodes.push({
      id,
      kind: "county",
      label: c.countyName,
      domainId: "county",
      sourceSystem: "county-intelligence",
      sourceRef: c.countySlug,
      freshnessAt: now,
      confidence: Math.min(95, c.countyReadinessScore),
      metadata: { fieldStrength: c.fieldStrengthScore, weak: true },
    });
    if (c.topWeaknesses[0]) {
      lessonCandidates.push({
        title: `${c.countyName}: ${c.topWeaknesses[0].slice(0, 50)}`,
        summary: c.topWeaknesses.join("; "),
        domainId: "county",
        lessonType: "county",
        confidence: "medium",
        freshness: "fresh",
        usefulnessScore: 58,
        sourceKind: "county_intelligence",
        sourceRef: c.countySlug,
        countySlug: c.countySlug,
        linkedEntityIds: [id],
        requiresHumanApproval: true,
        status: "proposed",
      });
    }
  }

  for (const c of county.opportunityCounties.slice(0, 5)) {
    nodes.push({
      id: nodeId("county-opp", c.countySlug),
      kind: "county",
      label: `${c.countyName} (momentum)`,
      domainId: "county",
      sourceSystem: "county-intelligence",
      sourceRef: c.countySlug,
      freshnessAt: now,
      confidence: 72,
      metadata: { opportunity: true },
    });
  }

  return { nodes, edges: [], lessonCandidates };
}

export function intakeFromBlockers(blockers: CampaignBlocker[]): ObservationIntakeResult {
  const nodes: CampaignEntityNode[] = [];
  const now = new Date().toISOString();
  for (const b of blockers.slice(0, 15)) {
    nodes.push({
      id: nodeId("blocker", b.id),
      kind: "blocker",
      label: b.message.slice(0, 100),
      domainId: b.domainId,
      sourceSystem: "orchestration",
      sourceRef: b.id,
      freshnessAt: now,
      confidence: b.severity === "P0" ? 90 : 75,
      metadata: { severity: b.severity },
    });
  }
  return { nodes, edges: [], lessonCandidates: [] };
}

export function mergeIntakeResults(...results: ObservationIntakeResult[]): ObservationIntakeResult {
  const nodeMap = new Map<string, CampaignEntityNode>();
  const edgeMap = new Map<string, CampaignEntityEdge>();
  const lessonCandidates: ObservationIntakeResult["lessonCandidates"] = [];

  for (const r of results) {
    for (const n of r.nodes) nodeMap.set(n.id, n);
    for (const e of r.edges) edgeMap.set(e.id, e);
    lessonCandidates.push(...r.lessonCandidates);
  }

  return {
    nodes: [...nodeMap.values()],
    edges: [...edgeMap.values()],
    lessonCandidates: lessonCandidates.slice(0, 30),
  };
}
