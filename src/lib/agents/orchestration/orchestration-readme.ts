/**
 * Campaign Orchestration Intelligence Layer — module index (code-side).
 * Full architecture: docs/campaign-events/CAMPAIGN_ORCHESTRATION_INTELLIGENCE_ARCHITECTURE.md
 */

export const ORCHESTRATION_LAYER_README = {
  name: "Campaign Orchestration Intelligence Layer",
  version: "v2-live",
  northStar:
    "One coordinated campaign brain that reasons across county, volunteer, communications, events, finance, training, dashboards, and memory.",
  coreQuestion: "How does this improve the AI's understanding of the entire campaign?",
  layers: [
    "Signal",
    "Context",
    "Reasoning",
    "Planning",
    "Human Gate",
    "Execution Prep",
    "Learning",
    "UX Delivery",
  ],
  entrypoints: {
    signalLoader: "load-campaign-orchestration-signals.ts",
    reasoning: "orchestration-reasoning-engine.ts",
    workflows: "orchestration-workflow-planner.ts",
    stateTypes: "campaign-state-types.ts",
    domains: "orchestration-domains.ts",
    tools: "sprint-orchestration-intelligence-tools.ts",
  },
  docs: [
    "ORCHESTRATION_INTELLIGENCE_INVENTORY.md",
    "CAMPAIGN_ORCHESTRATION_INTELLIGENCE_ARCHITECTURE.md",
    "ORCHESTRATION_DOMAIN_MAP.md",
    "ORCHESTRATION_MEMORY_MODEL.md",
    "ORCHESTRATION_TRAINING_AND_COPILOT_PLAN.md",
    "ORCHESTRATION_BUILD_ROADMAP.md",
  ],
} as const;
