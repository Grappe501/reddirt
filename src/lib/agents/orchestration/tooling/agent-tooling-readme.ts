/**
 * AI Agent Tooling Brain — module orientation.
 */

export const AGENT_TOOLING_MODULE = {
  id: "agent_tooling_brain",
  version: "4A-v1",
  path: "src/lib/agents/orchestration/tooling/",
  northStar: "How does this improve the AI's understanding of the entire campaign?",
  answers: [
    "What tools exist?",
    "When to use them?",
    "What each tool teaches the campaign?",
    "What actions are allowed?",
    "What requires human approval?",
    "What tool sequence to recommend?",
    "How tool usage improves CampaignState and knowledge?",
  ],
  safety: [
    "Default: prepare only, never execute",
    "autoExecutionDisabled always true",
    "Prohibited: send, GCal write, finance post, voter export",
  ],
  entryPoints: {
    registry: "agent-tool-registry.ts#loadUnifiedAgentToolRegistry",
    selector: "agent-tool-selector.ts#selectAgentTools",
    sequencer: "agent-tool-sequencer.ts#buildAgentToolSequences",
    actionPrep: "agent-action-prep.ts#prepareAgentActions",
    state: "agent-tooling-state.ts#buildAgentToolingState",
    api: "/api/agents/orchestration-tooling-state",
  },
} as const;
