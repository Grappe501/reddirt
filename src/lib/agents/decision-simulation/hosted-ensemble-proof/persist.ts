import type { HostedEnsembleProof } from "./contracts";

export const HOSTED_PROOF_STORAGE = "ENSEMBLE_AGGREGATE" as const;

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
}

export function mergeHostedProofIntoAggregate(
  summary: unknown,
  proof: HostedEnsembleProof,
): Record<string, unknown> {
  return {
    ...asRecord(summary),
    hostedProof: {
      ...proof,
      storage: HOSTED_PROOF_STORAGE,
    },
  };
}
