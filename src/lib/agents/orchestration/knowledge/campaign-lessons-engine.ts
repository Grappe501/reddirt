/**
 * Deterministic lessons engine — patterns, gaps, recurring blockers.
 */

import type { CampaignState } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import type {
  CampaignKnowledgeGraphResult,
  CampaignLesson,
  CampaignObservation,
} from "./campaign-knowledge-types";

function lessonId(type: string, ref: string): string {
  return `lesson:${type}:${ref}`.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 120);
}

function rankScore(l: CampaignLesson): number {
  const conf = l.confidence === "high" ? 25 : l.confidence === "medium" ? 15 : 5;
  const act = l.actionability === "high" ? 20 : l.actionability === "medium" ? 10 : 0;
  const appr = l.approvalStatus === "approved" ? 20 : 0;
  const fresh = l.freshness === "fresh" ? 10 : l.freshness === "aging" ? 5 : 0;
  return conf + act + appr + fresh;
}

export function rankCampaignLessons(lessons: CampaignLesson[]): CampaignLesson[] {
  return [...lessons].sort((a, b) => rankScore(b) - rankScore(a));
}

export function detectRecurringBlockerLessons(blockerMessages: string[]): CampaignLesson[] {
  const counts = new Map<string, number>();
  for (const m of blockerMessages) {
    const key = m.slice(0, 60);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const now = new Date().toISOString();
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .map(([msg, n]) => ({
      id: lessonId("repeated_blocker", msg),
      type: "repeated_blocker" as const,
      title: `Recurring blocker (${n}×)`,
      summary: msg,
      whyItMatters: "Repeated blockers drain operator attention — address root cause once.",
      domains: ["campaign_management" as const],
      counties: [],
      relatedEntityIds: [],
      sourceObservationIds: [],
      confidence: n >= 3 ? ("high" as const) : ("medium" as const),
      freshness: "fresh" as const,
      actionability: "high" as const,
      approvalStatus: "approved" as const,
      createdAt: now,
      recommendedFollowup: "Add to weekly CM standup until cleared.",
    }));
}

export function generateKnowledgeGapLessons(
  state: CampaignState,
  sourceHealth: OrchestrationSourceHealth[],
  graph: CampaignKnowledgeGraphResult,
): CampaignLesson[] {
  const now = new Date().toISOString();
  const gaps: CampaignLesson[] = [];

  for (const s of sourceHealth.filter((x) => x.status === "error" || x.status === "missing" || x.status === "degraded")) {
    gaps.push({
      id: lessonId("knowledge_gap", s.sourceId),
      type: "knowledge_gap",
      title: `Knowledge gap: ${s.label}`,
      summary: s.detail ?? `Source ${s.label} is ${s.status} — AI reasoning may be incomplete.`,
      whyItMatters: "The AI must learn what it does not know — degraded sources create blind spots.",
      domains: ["campaign_management"],
      counties: [],
      relatedEntityIds: [],
      sourceObservationIds: [],
      confidence: "high",
      freshness: "fresh",
      actionability: "high",
      approvalStatus: "approved",
      createdAt: now,
      recommendedFollowup: `Restore ${s.label} signal loader.`,
    });
  }

  for (const d of state.weakDomains) {
    gaps.push({
      id: lessonId("knowledge_gap", `weak-${d}`),
      type: "knowledge_gap",
      title: `Weak domain: ${d.replaceAll("_", " ")}`,
      summary: state.domainStatuses[d]?.summary ?? "Domain health below threshold.",
      whyItMatters: "Weak domains need more observations and operator context.",
      domains: [d],
      counties: [],
      relatedEntityIds: [],
      sourceObservationIds: [],
      confidence: "medium",
      freshness: "fresh",
      actionability: "medium",
      approvalStatus: "approved",
      createdAt: now,
    });
  }

  if (graph.graphHealth.entityCount < 10) {
    gaps.push({
      id: lessonId("knowledge_gap", "sparse-graph"),
      type: "knowledge_gap",
      title: "Sparse knowledge graph",
      summary: `Only ${graph.graphHealth.entityCount} entities — intake more observations to build campaign memory.`,
      whyItMatters: "A thin graph limits cross-domain pattern detection.",
      domains: ["memory"],
      counties: [],
      relatedEntityIds: [],
      sourceObservationIds: [],
      confidence: "high",
      freshness: "fresh",
      actionability: "medium",
      approvalStatus: "approved",
      createdAt: now,
      recommendedFollowup: "Log hot wash notes and county signals after each event.",
    });
  }

  if (!state.countyIntelligenceSummary.bridgeAvailable) {
    gaps.push({
      id: lessonId("knowledge_gap", "county-bridge"),
      type: "county_learning",
      title: "County workbench bridge unavailable",
      summary: "Full county cognition requires countyWorkbench bridge connection.",
      whyItMatters: "County strategy depends on live KPI data.",
      domains: ["county"],
      counties: [],
      relatedEntityIds: [],
      sourceObservationIds: [],
      confidence: "high",
      freshness: "fresh",
      actionability: "high",
      approvalStatus: "approved",
      createdAt: now,
    });
  }

  if (state.commsReadiness.massEmailBlocked && state.emailEccReadiness.sendEnabled === false) {
    gaps.push({
      id: lessonId("knowledge_gap", "email-readiness"),
      type: "message_learning",
      title: "Email send path gated",
      summary: "Mass email blocked and ECC send disabled — orchestration will recommend drafts only.",
      whyItMatters: "Comms recommendations must respect human gates until send is enabled.",
      domains: ["communications"],
      counties: [],
      relatedEntityIds: [],
      sourceObservationIds: [],
      confidence: "high",
      freshness: "fresh",
      actionability: "medium",
      approvalStatus: "approved",
      createdAt: now,
    });
  }

  if (state.memoryObservationSummary.frictionSignals >= 2) {
    gaps.push({
      id: lessonId("emerging_pattern", "workflow-friction"),
      type: "emerging_pattern",
      title: "Workflow friction detected",
      summary: `${state.memoryObservationSummary.frictionSignals} friction signals from operator observations.`,
      whyItMatters: "Abandoned flows indicate UX or process gaps.",
      domains: ["dashboard_ux", "tool_builder"],
      counties: [],
      relatedEntityIds: [],
      sourceObservationIds: [],
      confidence: "medium",
      freshness: "fresh",
      actionability: "high",
      approvalStatus: "proposed",
      createdAt: now,
      recommendedFollowup: "Review tool-builder queue for friction tickets.",
    });
  }

  return gaps;
}

export function lessonsFromObservations(observations: CampaignObservation[]): CampaignLesson[] {
  const now = new Date().toISOString();
  const out: CampaignLesson[] = [];
  for (const o of observations) {
    for (const s of o.suggestedLessons) {
      if (!s.title) continue;
      out.push({
        id: lessonId("obs", o.id + s.title.slice(0, 20)),
        type: s.type ?? "emerging_pattern",
        title: s.title,
        summary: s.summary ?? o.summary,
        whyItMatters: s.whyItMatters ?? "Derived from operator observation.",
        domains: s.domains ?? o.domains,
        counties: o.counties,
        relatedEntityIds: [],
        sourceObservationIds: [o.id],
        confidence: o.sensitivity === "strategic" ? "medium" : "low",
        freshness: "fresh",
        actionability: s.actionability ?? "medium",
        approvalStatus: o.approvalStatus === "approved" ? "proposed" : "proposed",
        createdAt: now,
        recommendedFollowup: s.recommendedFollowup,
      });
    }
  }
  return out;
}

export function generateCampaignLessons(input: {
  state: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
  graph: CampaignKnowledgeGraphResult;
  persistedLessons?: CampaignLesson[];
}): CampaignLesson[] {
  const { state, sourceHealth, graph } = input;
  const blockerMsgs = state.activeBlockers.map((b) => b.message);
  const recurring = detectRecurringBlockerLessons(blockerMsgs);
  const gaps = generateKnowledgeGapLessons(state, sourceHealth, graph);
  const fromObs = lessonsFromObservations(graph.observations);

  const map = new Map<string, CampaignLesson>();
  for (const l of [...(input.persistedLessons ?? []), ...recurring, ...gaps, ...fromObs, ...graph.lessons]) {
    map.set(l.id, l);
  }
  return rankCampaignLessons([...map.values()]);
}

export function getStrongestLessons(lessons: CampaignLesson[], limit = 5): CampaignLesson[] {
  return rankCampaignLessons(lessons.filter((l) => l.approvalStatus === "approved" || l.approvalStatus === "proposed")).slice(
    0,
    limit,
  );
}

export function getRecurringBlockerLessons(lessons: CampaignLesson[]): CampaignLesson[] {
  return lessons.filter((l) => l.type === "repeated_blocker");
}

export function getKnowledgeGapLessons(lessons: CampaignLesson[]): CampaignLesson[] {
  return lessons.filter((l) => l.type === "knowledge_gap");
}
