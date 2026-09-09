import type {
  DecisionSimulationMove,
  DecisionSimulationOpeningInput,
  DecisionSimulationRun,
} from "./contracts";
import { buildDecisionSimulationShell, assertDecisionSimulationSequence } from "./sequence";
import {
  DECISION_SIMULATION_JSON_SCHEMA,
  DECISION_SIMULATION_PROMPT_VERSION,
  type DecisionSimulationAiPayload,
} from "./structured-output";
import {
  buildDecisionSimulationDeveloperPrompt,
  buildDecisionSimulationUserPrompt,
} from "./prompt";

export interface DecisionSimulationOpenAiUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface DecisionSimulationOpenAiResult {
  run: DecisionSimulationRun;
  executiveSummary: string;
  strongestRisk: string;
  strongestOpportunity: string;
  model: string;
  responseId?: string;
  usage: DecisionSimulationOpenAiUsage;
}

interface OpenAiResponseLike {
  id?: string;
  model?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string };
}

function resolveModel(): string {
  return (
    process.env.DECISION_SIMULATION_OPENAI_MODEL ||
    process.env.OPENAI_MODEL ||
    "gpt-4o-mini"
  );
}

function extractOutputText(response: OpenAiResponseLike): string {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  throw new Error("OpenAI response did not contain output_text.");
}

function assertAiPayload(payload: DecisionSimulationAiPayload): void {
  if (!Array.isArray(payload.moves) || payload.moves.length !== 6) {
    throw new Error(`Decision simulation expected 6 generated moves; received ${payload.moves?.length ?? 0}.`);
  }

  const expected = [
    [1, "COUNTERPARTY", "PREDICTED_RESPONSE"],
    [2, "OPERATOR", "RECOMMENDED_RESPONSE"],
    [3, "COUNTERPARTY", "PREDICTED_RESPONSE"],
    [4, "OPERATOR", "RECOMMENDED_RESPONSE"],
    [5, "COUNTERPARTY", "PREDICTED_RESPONSE"],
    [6, "OPERATOR", "RECOMMENDED_RESPONSE"],
  ] as const;

  payload.moves.forEach((move, index) => {
    const [moveNumber, side, kind] = expected[index];
    if (move.moveNumber !== moveNumber || move.side !== side || move.kind !== kind) {
      throw new Error(`Decision simulation move ${index + 1} violated canonical sequence.`);
    }
    if (!move.message.trim()) throw new Error(`Decision simulation move ${move.moveNumber} has empty content.`);
    if (move.confidence.estimatedProbability < 0 || move.confidence.estimatedProbability > 1) {
      throw new Error(`Decision simulation move ${move.moveNumber} probability is outside 0..1.`);
    }
  });
}

function mergeAiPayload(
  input: DecisionSimulationOpeningInput,
  payload: DecisionSimulationAiPayload,
  model: string,
): DecisionSimulationRun {
  const run = buildDecisionSimulationShell(input);

  for (const aiMove of payload.moves) {
    const move = run.moves[aiMove.moveNumber] as DecisionSimulationMove;
    move.message = aiMove.message;
    move.objective = aiMove.objective;
    move.predictedFrame = aiMove.predictedFrame;
    move.rationaleSummary = aiMove.rationaleSummary;
    move.risks = aiMove.risks;
    move.opportunities = aiMove.opportunities;
    move.assumptions = aiMove.assumptions;
    move.confidence = aiMove.confidence;
    move.actor = aiMove.side === "OPERATOR" ? input.operatorActor : input.counterpartyActor;
    // Evidence is never model-invented. Phase 9 attaches governed evidence refs separately.
    move.evidenceRefs = [];
  }

  run.assumptions = payload.assumptions;
  run.evidenceRefs = [];
  run.modelVersion = model;
  run.promptVersion = DECISION_SIMULATION_PROMPT_VERSION;
  run.createdAt = new Date().toISOString();
  assertDecisionSimulationSequence(run);
  return run;
}

async function callOpenAi(input: DecisionSimulationOpeningInput): Promise<OpenAiResponseLike> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured in the server environment.");
  }

  const model = resolveModel();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "developer", content: buildDecisionSimulationDeveloperPrompt() },
        { role: "user", content: buildDecisionSimulationUserPrompt(input) },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "decision_simulation_expected_path",
          strict: true,
          schema: DECISION_SIMULATION_JSON_SCHEMA,
        },
      },
    }),
  });

  const json = (await response.json()) as OpenAiResponseLike;
  if (!response.ok) {
    throw new Error(`OpenAI Responses API failed (${response.status}): ${json.error?.message ?? "unknown error"}`);
  }
  return json;
}

export async function runDecisionSimulationOpenAi(
  input: DecisionSimulationOpeningInput,
): Promise<DecisionSimulationOpenAiResult> {
  if (!input.message.trim()) throw new Error("Decision simulation opening message is required.");

  const response = await callOpenAi(input);
  const raw = extractOutputText(response);
  const payload = JSON.parse(raw) as DecisionSimulationAiPayload;
  assertAiPayload(payload);
  const model = response.model || resolveModel();
  const run = mergeAiPayload(input, payload, model);

  return {
    run,
    executiveSummary: payload.executiveSummary,
    strongestRisk: payload.strongestRisk,
    strongestOpportunity: payload.strongestOpportunity,
    model,
    responseId: response.id,
    usage: {
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      totalTokens: response.usage?.total_tokens,
    },
  };
}
