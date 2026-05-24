export const CONTINUOUS_OPTIMIZATION_README = {
  id: "continuous_optimization",
  phase: "4C",
  purpose:
    "Read-only optimization signals that tell the agent which weak domains, stale feedback, tool gaps, and cross-domain warnings should be improved next.",
  modulePath: "src/lib/agents/orchestration/optimization/",
  test: "npm run agents:test-continuous-optimization",
  safety: [
    "Read-only",
    "No execution controls",
    "No persistence or production mutation",
    "Outputs recommendations for human-gated repair",
  ],
} as const;
