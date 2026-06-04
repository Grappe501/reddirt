process.env.NETLIFY = "true";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import {
  buildDebateAgentToolingPageData,
  loadDebateAgentToolingPackage,
} from "../src/lib/intelligence/debateAgentToolingPackage";
import { runDeterministicCopilotTool } from "../src/lib/intelligence/aiCopilotOrchestrator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
loadRedDirtEnv(repoRoot);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const pkg = loadDebateAgentToolingPackage(repoRoot);
  assert(pkg, "debate-agent-tooling-package.json must load");
  assert(pkg.sequences.length >= 4, "Expected 4+ operator sequences");
  assert(pkg.quickToolIds.length >= 8, "Expected 8+ quick tools");

  const data = buildDebateAgentToolingPageData(repoRoot);
  assert(data, "Page data must build");
  assert(data.debatePrepTools.length >= 7, "debate_prep tools");
  assert(data.quickTools.length === pkg.quickToolIds.length, "Quick tools resolve from registry");
  assert(data.sosQuestionCount >= 20, "SOS bank wired");
  assert(data.recommendedRuns.length >= 4, "Recommended runs");

  const trap = runDeterministicCopilotTool("trap-question-detector", { repoRoot });
  assert(trap && trap.sections.length >= 2, "trap-question-detector");
  const trapText = trap.sections.flatMap((s) => s.bullets).join(" ");
  assert(trapText.includes("trap-lanes") || trapText.includes("Trap"), "Trap detector links lanes");

  const debateQ = runDeterministicCopilotTool("debate-question-generator", { repoRoot });
  assert(debateQ && debateQ.sections.length >= 2, "debate-question-generator");
  const dqText = debateQ.sections.flatMap((s) => s.bullets).join(" ");
  assert(dqText.includes("sos-debate-questions"), "Debate Q generator references SOS bank");

  const rebuttal = runDeterministicCopilotTool("rebuttal-builder", { repoRoot, topic: "county clerks" });
  assert(rebuttal, "rebuttal-builder");
  assert(rebuttal.publicationSafety === "NON_PUBLISHABLE", "rebuttal safety");

  console.log("Debate agent tooling package test");
  console.log("  sequences:", pkg.sequences.length);
  console.log("  quick tools:", data.quickTools.length);
  console.log("  sos questions:", data.sosQuestionCount);
  console.log("  readiness signals:", data.readinessSignals.length);
  console.log("PASS");
}

main();
