import {
  aiDeltaSchema,
  decisionGuardSchema,
  impactForecastSchema,
  orchestratorSnapshotSchema,
  rolePlansBundleSchema,
} from "./orchestrator-types";

export function validateOrchestratorSnapshot(data: unknown) {
  return orchestratorSnapshotSchema.parse(data);
}

export function validateImpactForecast(data: unknown) {
  return impactForecastSchema.parse(data);
}

export function validateDecisionGuard(data: unknown) {
  return decisionGuardSchema.parse(data);
}

export function validateAiDelta(data: unknown) {
  return aiDeltaSchema.parse(data);
}

export function validateRolePlans(data: unknown) {
  return rolePlansBundleSchema.parse(data);
}

export function assertOrchestratorPackage(outputs: {
  snapshot: unknown;
  impactForecast: unknown;
  decisionGuard: unknown;
  rolePlans: unknown;
  delta: unknown;
}): void {
  const snapshot = validateOrchestratorSnapshot(outputs.snapshot);
  validateImpactForecast(outputs.impactForecast);
  validateDecisionGuard(outputs.decisionGuard);
  validateRolePlans(outputs.rolePlans);
  validateAiDelta(outputs.delta);

  if (snapshot.filingStatus === "green" && snapshot.unsafeShortcuts.length === 0) {
    /* ok */
  }
  if (snapshot.filingStatus === "green" && snapshot.nextBestAction.action.title.toLowerCase().includes("filing green")) {
    throw new Error("Orchestrator inconsistent: recommends filing green while claiming green status without audit");
  }
  const guard = validateDecisionGuard(outputs.decisionGuard);
  if (!guard.productionBankAssumption.verified) {
    const nba = snapshot.nextBestAction.action.whyItMatters.toLowerCase();
    if (/netlify has bank|production bank ready/i.test(nba)) {
      throw new Error("Orchestrator assumes production bank without verification");
    }
  }
}
