import assert from "node:assert/strict";
import {
  CANDIDATE_IPAD_COPILOT_QUICK_TOOLS,
  CANDIDATE_IPAD_PRIMARY_NAV,
  CANDIDATE_IPAD_PROFILE,
  isCandidateIpadMode,
} from "../src/lib/intelligence/candidateIpadMode";
import { loadAiCopilotToolRegistry } from "../src/lib/intelligence/aiCopilotOrchestrator";
assert.equal(CANDIDATE_IPAD_PROFILE.maxContentWidthPx, 820);
assert.ok(CANDIDATE_IPAD_PRIMARY_NAV.length >= 5);
assert.ok(CANDIDATE_IPAD_COPILOT_QUICK_TOOLS.length >= 5);

const registry = loadAiCopilotToolRegistry();
assert.ok(registry.tools.length >= 20, "copilot registry loaded");
for (const tool of CANDIDATE_IPAD_COPILOT_QUICK_TOOLS) {
  assert.ok(registry.tools.some((t) => t.toolId === tool.toolId), `missing registry tool ${tool.toolId}`);
}

console.log("test-candidate-ipad-intelligence: OK", {
  ipadModeEnv: isCandidateIpadMode(),
  quickTools: CANDIDATE_IPAD_COPILOT_QUICK_TOOLS.length,
  registryTools: registry.tools.length,
});
