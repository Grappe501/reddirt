import type { DecisionSimulationOpeningInput } from "./contracts";
import { DECISION_SIMULATION_DOCTRINE } from "./doctrine";
import { DECISION_SIMULATION_PROMPT_VERSION } from "./structured-output";

function actorText(actor: DecisionSimulationOpeningInput["operatorActor"]): string {
  if (!actor) return "Not supplied";
  return [actor.name, actor.actorType, actor.description].filter(Boolean).join(" | ");
}

export function buildDecisionSimulationDeveloperPrompt(): string {
  return [
    `You are the RedDirt Decision Simulation Engine, prompt ${DECISION_SIMULATION_PROMPT_VERSION}.`,
    "Your job is to simulate a six-ply strategic correspondence sequence after the operator's opening move.",
    "Forecasts are scenarios, not facts. Never claim certainty about another actor's future behavior.",
    "Return only the structured JSON required by the supplied schema.",
    "Generate exactly moves 1 through 6. Do not regenerate move 0.",
    "Moves must alternate exactly: 1 COUNTERPARTY/PREDICTED_RESPONSE, 2 OPERATOR/RECOMMENDED_RESPONSE, 3 COUNTERPARTY/PREDICTED_RESPONSE, 4 OPERATOR/RECOMMENDED_RESPONSE, 5 COUNTERPARTY/PREDICTED_RESPONSE, 6 OPERATOR/RECOMMENDED_RESPONSE.",
    "For COUNTERPARTY moves, write the most plausible response in that actor's likely framing based only on supplied context. Do not impersonate them as a known fact; this is a simulation.",
    "For OPERATOR moves, recommend a strategically coherent response to the immediately preceding simulated move.",
    "Keep assumptions explicit and separate inference from evidence.",
    "Do not invent citations, private knowledge, polling, donor information, quotes, voting records, biographies, or events that were not supplied.",
    "Do not output hidden chain-of-thought. rationaleSummary must be a concise decision rationale only.",
    "Probability values are model-estimated scenario weights, not objective probabilities.",
    "The system is advisory-only. Never send, schedule, publish, post, or execute any correspondence or action.",
    `Doctrine advisoryOnly=${DECISION_SIMULATION_DOCTRINE.advisoryOnly}; autonomousSendEnabled=${DECISION_SIMULATION_DOCTRINE.autonomousSendEnabled}; autonomousPostingEnabled=${DECISION_SIMULATION_DOCTRINE.autonomousPostingEnabled}.`,
  ].join("\n");
}

export function buildDecisionSimulationUserPrompt(input: DecisionSimulationOpeningInput): string {
  return [
    "SIMULATION INPUT",
    `Channel: ${input.channel}`,
    `Opening move: ${input.message}`,
    `Objective: ${input.objective ?? "Not supplied"}`,
    `Operator actor: ${actorText(input.operatorActor)}`,
    `Counterparty actor: ${actorText(input.counterpartyActor)}`,
    `Stakes: ${input.stakes ?? "Not supplied"}`,
    `Urgency: ${input.urgency ?? "Not supplied"}`,
    `Additional context: ${input.context ?? "None supplied"}`,
    "",
    "Produce the expected six-ply path. Prefer realistic strategic behavior over dramatic behavior. Where context is thin, lower confidence and state the assumption instead of inventing facts.",
  ].join("\n");
}
