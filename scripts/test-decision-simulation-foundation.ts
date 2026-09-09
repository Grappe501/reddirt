import {
  buildDecisionSimulationShell,
  DECISION_SIMULATION_DOCTRINE,
  validateDecisionSimulationSequence,
} from "../src/lib/agents/decision-simulation";

function main() {
  const run = buildDecisionSimulationShell({
    message: "Announce a major endorsement.",
    channel: "PUBLIC_STATEMENT",
    objective: "Test the canonical six-move strategic response sequence.",
    operatorActor: { name: "Operator", actorType: "CAMPAIGN" },
    counterpartyActor: { name: "Counterparty", actorType: "CAMPAIGN" },
    stakes: "HIGH",
    urgency: "MEDIUM",
  });

  const validation = validateDecisionSimulationSequence(run);
  const sevenNodes = run.moves.length === 7;
  const openingPreserved = run.moves[0]?.message === "Announce a major endorsement.";
  const sidesAlternate = run.moves.every((move, index) =>
    index % 2 === 0 ? move.side === "OPERATOR" : move.side === "COUNTERPARTY",
  );
  const finalMoveIsOperator = run.moves[6]?.side === "OPERATOR";
  const noSend = DECISION_SIMULATION_DOCTRINE.autonomousSendEnabled === false;
  const noAutoPost = DECISION_SIMULATION_DOCTRINE.autonomousPostingEnabled === false;
  const advisoryOnly = DECISION_SIMULATION_DOCTRINE.advisoryOnly === true;
  const noHiddenCot = DECISION_SIMULATION_DOCTRINE.storesHiddenChainOfThought === false;

  console.log("Decision Simulation Phase 1 foundation checks");
  console.log("  canonical sequence valid:", validation.ok);
  console.log("  seven nodes present:", sevenNodes);
  console.log("  opening move preserved:", openingPreserved);
  console.log("  sides alternate:", sidesAlternate);
  console.log("  final move returns to operator:", finalMoveIsOperator);
  console.log("  advisory only:", advisoryOnly);
  console.log("  autonomous send disabled:", noSend);
  console.log("  autonomous posting disabled:", noAutoPost);
  console.log("  hidden chain-of-thought storage disabled:", noHiddenCot);

  const ok =
    validation.ok &&
    sevenNodes &&
    openingPreserved &&
    sidesAlternate &&
    finalMoveIsOperator &&
    advisoryOnly &&
    noSend &&
    noAutoPost &&
    noHiddenCot;

  if (!ok) {
    console.error(validation.errors);
    process.exit(1);
  }

  console.log("OK — Decision Simulation Phase 1 foundation checks passed");
}

main();
