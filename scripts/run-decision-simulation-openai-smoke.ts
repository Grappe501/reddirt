import { runDecisionSimulationOpenAi } from "../src/lib/agents/decision-simulation";

async function main() {
  const result = await runDecisionSimulationOpenAi({
    message: "We are announcing a new campaign initiative tomorrow morning.",
    channel: "PUBLIC_STATEMENT",
    objective: "Anticipate likely public counter-messaging and prepare disciplined responses.",
    operatorActor: { name: "Our campaign", actorType: "CAMPAIGN" },
    counterpartyActor: { name: "Opposing campaign", actorType: "CAMPAIGN" },
    stakes: "MEDIUM",
    urgency: "MEDIUM",
    context: "Generic smoke test only. Do not assume facts that are not supplied.",
  });

  console.log("Decision Simulation live OpenAI smoke");
  console.log("model:", result.model);
  console.log("response id:", result.responseId ?? "not returned");
  console.log("token usage:", result.usage);
  console.log("summary:", result.executiveSummary);
  console.log("strongest risk:", result.strongestRisk);
  console.log("strongest opportunity:", result.strongestOpportunity);
  for (const move of result.run.moves) {
    console.log(`\nMOVE ${move.moveNumber} — ${move.side}`);
    console.log(move.message);
    if (move.moveNumber > 0) {
      console.log("frame:", move.predictedFrame);
      console.log("confidence:", move.confidence);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
