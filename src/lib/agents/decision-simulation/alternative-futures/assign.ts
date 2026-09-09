import {
  ALTERNATIVE_FUTURES,
  ALTERNATIVE_FUTURE_IDS,
  type AlternativeFutureAssignment,
  type AlternativeFutureId,
} from "./contracts";

export function assignAlternativeFuture(ordinal: number): AlternativeFutureAssignment {
  const safe = Math.max(1, Math.floor(ordinal));
  const futureId = ALTERNATIVE_FUTURE_IDS[(safe - 1) % ALTERNATIVE_FUTURE_IDS.length];
  const definition = ALTERNATIVE_FUTURES.find((item) => item.id === futureId)!;
  return { ordinal: safe, futureId, definition };
}

export function futuresCoveredByRunCount(requestedRuns: number): AlternativeFutureId[] {
  const count = Math.max(0, Math.floor(requestedRuns));
  return ALTERNATIVE_FUTURE_IDS.filter((_, index) => index < count);
}
