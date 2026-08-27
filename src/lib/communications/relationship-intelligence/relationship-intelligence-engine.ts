import { loadCommunicationsStore } from "@/lib/campaign-events/communications/communications-store";
import { daysSince, summarizeSendHistory } from "./communication-history-summary";
import {
  mapContactRoleToKinds,
  scoreBurnoutRisk,
  scoreContactEngagement,
} from "./engagement-scoring";
import type { RelationshipGraph, RelationshipHealthBrief, RelationshipNode } from "./relationship-graph-types";
import { loadPersistedRelationshipGraph, saveRelationshipGraph } from "./relationship-graph-store";
import {
  computeRelationshipStrength,
  deriveInfluenceLevel,
  deriveResponsiveness,
  deriveTrustLevel,
} from "./relationship-strength-engine";

export function buildRelationshipGraph(persist = false): RelationshipGraph {
  const store = loadCommunicationsStore();

  const nodes: RelationshipNode[] = store.contacts.map((c) => {
    const kinds = mapContactRoleToKinds(c.roleTags);
    // V1 sends are aggregate list/segment records. summarizeSendHistory deliberately
    // returns unknown/zero at contact level until recipient-attributed telemetry lands.
    const sendMeta = summarizeSendHistory(store.sends, c.email);
    const touchDays = daysSince(c.updatedAt);
    const engagementScore = scoreContactEngagement({
      contact: c,
      sendCount: sendMeta.sendCount,
      daysSinceTouch: touchDays,
    });
    const trustLevel = deriveTrustLevel(engagementScore, sendMeta.sendCount);
    const strengthScore = computeRelationshipStrength(engagementScore, trustLevel);
    const burnoutRisk = scoreBurnoutRisk({
      kinds,
      engagementScore,
      sendCount: sendMeta.sendCount,
    });
    const followUpNeeded =
      !c.suppressed &&
      engagementScore < 45 &&
      (touchDays == null || touchDays > 30);

    return {
      id: `rel_${c.id}`,
      contactId: c.id,
      email: c.email,
      displayName: c.displayName ?? c.email,
      kinds,
      countySlug: c.countySlug,
      trustLevel,
      influenceLevel: deriveInfluenceLevel(kinds, c.countySlug),
      responsiveness: deriveResponsiveness(engagementScore, touchDays),
      engagementScore,
      strengthScore,
      burnoutRisk,
      followUpNeeded,
      lastTouchAt: c.updatedAt,
      eventParticipationCount: c.eventRecordId ? 1 : 0,
      sendCount: sendMeta.sendCount,
      suppressed: c.suppressed,
      notes: c.notes ? [c.notes] : [],
    };
  });

  const graph: RelationshipGraph = {
    generatedAt: new Date().toISOString(),
    nodes,
    edges: [],
    summary: {
      totalContacts: nodes.length,
      volunteers: nodes.filter((n) => n.kinds.includes("volunteer")).length,
      hosts: nodes.filter((n) => n.kinds.includes("host")).length,
      countyLeaders: nodes.filter((n) => n.kinds.includes("county_leader")).length,
      highBurnoutRisk: nodes.filter((n) => n.burnoutRisk === "high").length,
      followUpOverdue: nodes.filter((n) => n.followUpNeeded).length,
      inactiveSupporters: nodes.filter((n) => n.engagementScore < 25 && !n.suppressed).length,
    },
  };

  if (persist) saveRelationshipGraph(graph);
  return graph;
}

export function loadRelationshipGraph(): RelationshipGraph {
  return loadPersistedRelationshipGraph() ?? buildRelationshipGraph(false);
}

export function buildRelationshipHealthBrief(graph = loadRelationshipGraph()): RelationshipHealthBrief {
  const sendSummary = summarizeSendHistory(loadCommunicationsStore().sends);
  const topPriorities: string[] = [];
  const inactive = graph.nodes.filter((n) => n.followUpNeeded).slice(0, 5);
  for (const n of inactive) {
    topPriorities.push(`Follow up: ${n.displayName} (${n.kinds[0]}, engagement ${n.engagementScore})`);
  }
  const burnout = graph.nodes.filter((n) => n.burnoutRisk === "high").slice(0, 3);
  return {
    headline: `${graph.summary.totalContacts} relationships · ${graph.summary.followUpOverdue} need follow-up`,
    topPriorities: topPriorities.length
      ? topPriorities
      : ["Relationship graph healthy — focus county comms gaps next"],
    relationshipWarnings: [
      ...burnout.map((n) => `Burnout risk: ${n.displayName} — reduce cadence`),
      "Contact-level send telemetry is not yet available; burnout scoring does not infer recipient sends from aggregate campaigns.",
    ],
    engagementHighlights: [
      `${graph.summary.volunteers} volunteers tracked`,
      `${graph.summary.hosts} hosts tracked`,
      `${sendSummary.sendCount} aggregate sends in audit log`,
    ],
  };
}
