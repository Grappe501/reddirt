import { clipEvidenceText } from "../evidence-provenance/clip";
import {
  OBSERVED_OUTCOME_VERSION,
  OBSERVED_RESPONSE_EXCERPT_MAX,
  type OutcomeCompareInput,
  type OutcomeComparison,
} from "./contracts";

const STOP = new Set([
  "the",
  "and",
  "for",
  "that",
  "this",
  "with",
  "from",
  "your",
  "have",
  "will",
  "are",
  "was",
  "not",
  "but",
  "you",
  "our",
  "their",
]);

function normalizeFrame(value?: string | null): string {
  return (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !STOP.has(token)),
  );
}

function jaccard(left: Set<string>, right: Set<string>): number {
  if (!left.size || !right.size) return 0;
  let inter = 0;
  for (const token of left) {
    if (right.has(token)) inter += 1;
  }
  return inter / new Set([...left, ...right]).size;
}

export function compareObservedOutcome(input: OutcomeCompareInput): OutcomeComparison {
  const excerpt = clipEvidenceText(input.actualResponse, OBSERVED_RESPONSE_EXCERPT_MAX);
  const chosen = input.branches.find((lane) => lane.futureId === input.closestFuture);
  const predictedFrame = chosen?.frame ?? null;
  const observedFrame = input.observedFrame?.trim() || null;
  const predictedFirstMessage = chosen?.firstMessage?.trim() || null;
  const actualTokens = tokens(excerpt);
  let suggestedFuture: string | null = null;
  let best = 0;
  for (const lane of input.branches) {
    const message = lane.firstMessage?.trim();
    if (!message) continue;
    const score = jaccard(actualTokens, tokens(message));
    if (score > best) {
      best = score;
      suggestedFuture = lane.futureId;
    }
  }
  const contentOverlap = predictedFirstMessage ? jaccard(actualTokens, tokens(predictedFirstMessage)) : null;
  const chosenNorm = normalizeFrame(predictedFrame);
  const observedNorm = normalizeFrame(observedFrame);
  const frameMatch = chosenNorm && observedNorm ? chosenNorm === observedNorm : null;
  const operatorFutureAgreesWithGuess =
    suggestedFuture != null ? suggestedFuture === input.closestFuture : null;
  const misses: string[] = [];
  if (!excerpt) misses.push("No observed public response was attached.");
  if (frameMatch === false) {
    misses.push(`Predicted frame ${predictedFrame}; observed tagged ${observedFrame}.`);
  }
  if (operatorFutureAgreesWithGuess === false) {
    misses.push(`Operator mapped ${input.closestFuture}; lexical guess was ${suggestedFuture}.`);
  }
  if (contentOverlap != null && contentOverlap < 0.15 && excerpt) {
    misses.push("Low lexical overlap with the predicted first response. This is not a semantic score.");
  }
  return {
    version: OBSERVED_OUTCOME_VERSION,
    predictedFrame,
    observedFrame,
    predictedFirstMessage,
    suggestedFuture,
    operatorFutureAgreesWithGuess,
    frameMatch,
    contentOverlap,
    misses,
    writeback: "FORBIDDEN",
  };
}
