import {
  type DecisionSimulationMove,
  type DecisionSimulationOpeningInput,
  type DecisionSimulationRun,
  type DecisionSimulationValidationResult,
} from "./contracts";
import { DECISION_SIMULATION_SEQUENCE } from "./doctrine";

function emptyMove(
  spec: (typeof DECISION_SIMULATION_SEQUENCE)[number],
  input: DecisionSimulationOpeningInput,
): DecisionSimulationMove {
  const isOpening = spec.moveNumber === 0;
  const actor = spec.side === "OPERATOR" ? input.operatorActor : input.counterpartyActor;

  return {
    moveNumber: spec.moveNumber,
    side: spec.side,
    kind: spec.kind,
    actor,
    message: isOpening ? input.message : "",
    objective: isOpening ? input.objective : undefined,
    predictedFrame: undefined,
    rationaleSummary: undefined,
    risks: [],
    opportunities: [],
    assumptions: [],
    evidenceRefs: [],
    confidence: {
      label: isOpening ? "UNSET" : "UNSET",
    },
  };
}

/**
 * Builds the canonical seven-node shell: opening move + six forecast/counter moves.
 * This function is intentionally deterministic and contains no model call.
 */
export function buildDecisionSimulationShell(
  input: DecisionSimulationOpeningInput,
): DecisionSimulationRun {
  const moves = DECISION_SIMULATION_SEQUENCE.map((spec) => emptyMove(spec, input));

  return {
    channel: input.channel,
    objective: input.objective,
    openingInput: input,
    moves,
    assumptions: [],
    evidenceRefs: [],
  };
}

export function validateDecisionSimulationSequence(
  run: DecisionSimulationRun,
): DecisionSimulationValidationResult {
  const errors: string[] = [];

  if (run.moves.length !== DECISION_SIMULATION_SEQUENCE.length) {
    errors.push(
      `Expected ${DECISION_SIMULATION_SEQUENCE.length} moves including opening; received ${run.moves.length}.`,
    );
  }

  for (const spec of DECISION_SIMULATION_SEQUENCE) {
    const move = run.moves[spec.moveNumber];
    if (!move) {
      errors.push(`Missing move ${spec.moveNumber}.`);
      continue;
    }

    if (move.moveNumber !== spec.moveNumber) {
      errors.push(
        `Move index ${spec.moveNumber} has moveNumber ${move.moveNumber}.`,
      );
    }

    if (move.side !== spec.side) {
      errors.push(
        `Move ${spec.moveNumber} must belong to ${spec.side}; received ${move.side}.`,
      );
    }

    if (move.kind !== spec.kind) {
      errors.push(
        `Move ${spec.moveNumber} must be ${spec.kind}; received ${move.kind}.`,
      );
    }
  }

  if (!run.moves[0]?.message.trim()) {
    errors.push("Opening move must contain a non-empty message.");
  }

  return { ok: errors.length === 0, errors };
}

export function assertDecisionSimulationSequence(run: DecisionSimulationRun): void {
  const validation = validateDecisionSimulationSequence(run);
  if (!validation.ok) {
    throw new Error(`Invalid decision simulation sequence: ${validation.errors.join(" ")}`);
  }
}
