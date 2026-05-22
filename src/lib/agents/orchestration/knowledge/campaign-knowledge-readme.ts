/**
 * Campaign Knowledge Graph module — orientation for agents and operators.
 */

export const CAMPAIGN_KNOWLEDGE_MODULE = {
  id: "campaign_knowledge_graph",
  version: "3A-v1",
  path: "src/lib/agents/orchestration/knowledge/",
  northStar: "How does this improve the AI's understanding of the entire campaign?",
  roles: {
    mapReader: "Understand current campaign reality via CampaignState + knowledge graph",
    mapBuilder: "Improve the map when the campaign acts, learns, decides, succeeds, or fails",
  },
  storage: {
    entityGraph: "data/campaign-events/campaign-knowledge/entity-graph.json",
    lessons: "data/campaign-events/campaign-knowledge/lessons.json",
    feedback: "data/campaign-events/campaign-knowledge/recommendation-feedback.json",
  },
  safety: [
    "No auto-approval of strategic or sensitive memory",
    "No raw PII, voter rows, inbox bodies, or secrets",
    "Humans approve; AI recommends and prepares",
    "Graceful degradation when signal sources fail",
  ],
  entryPoints: {
    buildGraph: "campaign-knowledge-graph.ts#buildCampaignKnowledgeGraph",
    intake: "campaign-observation-intake.ts#intakeRawObservation",
    lessons: "campaign-lessons-engine.ts#generateCampaignLessons",
    state: "campaign-knowledge-state.ts#buildCampaignKnowledgeSummary",
    api: "/api/agents/campaign-knowledge-state",
  },
} as const;
