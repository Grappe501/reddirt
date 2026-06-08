import fs from "node:fs";
import path from "node:path";
import { buildDebatePrepTutorSession, critiqueTutorPracticeAnswer } from "../src/lib/intelligence/v4/debatePrepTutorOrchestrator";
import { listTutorModes } from "../src/lib/intelligence/v4/debatePrepTutorPackage";

function registryHasTool(toolId: string): boolean {
  const raw = fs.readFileSync(path.join(process.cwd(), "data/intelligence/ai-copilot-tool-registry.json"), "utf8");
  const registry = JSON.parse(raw) as { tools: { toolId: string }[] };
  return registry.tools.some((t) => t.toolId === toolId);
}

async function main() {
  const modes = listTutorModes();
  const newTools = ["check-my-record-responder", "packo-lane-advisor", "direct-democracy-explainer"];

  console.log("=== Debate Prep Tutor v1 ===");
  console.log(`Modes: ${modes.length}`);
  for (const m of modes) {
    const session = buildDebatePrepTutorSession(m.mode);
    console.log(`  ${m.mode}: ${session.cards.length} cards, ${session.sequenceSteps.length} sequence steps`);
  }

  for (const id of newTools) {
    const found = registryHasTool(id);
    console.log(`  tool ${id}: ${found ? "registered" : "MISSING"}`);
    if (!found) process.exit(1);
  }

  const session = buildDebatePrepTutorSession("tonight-15");
  const card = session.cards[0]?.card;
  if (!card) {
    console.error("No cards in session");
    process.exit(1);
  }

  const critique = await critiqueTutorPracticeAnswer(
    card,
    "I agree with Senator Hammer on election integrity. We need secure elections.",
  );
  console.log(`Critique: ${critique.overall} — ${critique.headline}`);
  if (critique.fixes.length === 0 && critique.overall !== "blocked") {
    console.warn("Expected agree-only fix");
  }

  console.log("\nPASS: Debate prep tutor package wired");
}

main();
