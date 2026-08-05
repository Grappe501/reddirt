import type { CrossCheckRecord, WarehouseObservation } from "../types";
import { newId } from "../repositories/fileWarehouse";

/**
 * ACS labor-force concepts vs BLS LAUS/CPS are conceptually related, not directly comparable.
 */
export function runPhase1CrossChecks(observations: WarehouseObservation[]): CrossCheckRecord[] {
  const accepted = observations.filter((o) => o.validationStatus === "accepted");
  const acsLf = accepted.find(
    (o) =>
      o.sourceId === "census" &&
      o.geographyId === "geo:us-ar" &&
      (o.seriesCode.includes("S2301") || o.consumerMetricId === "CC-BASELINE-LF-001"),
  );
  const blsUnempAr = accepted.find(
    (o) =>
      o.sourceId === "bls" &&
      o.geographyId === "geo:us-ar" &&
      (o.seriesCode.startsWith("LASST05") || o.consumerMetricId === "CC-BASELINE-UNEMP-002"),
  );

  const checks: CrossCheckRecord[] = [];
  const reviewedAt = new Date().toISOString();

  if (!acsLf && !blsUnempAr) {
    checks.push({
      crossCheckId: newId("xchk"),
      subjectMetric: "AR labor market (ACS LF vs BLS unemployment)",
      primaryObservationId: null,
      corroboratingObservationId: null,
      comparisonMethod: "definition_and_presence",
      definitionCompatibility: "conceptually_related",
      periodCompatibility: "requires_review",
      geographyCompatibility: "directly_comparable",
      variance: null,
      tolerance: null,
      status: "insufficient_data",
      explanation:
        "Neither ACS labor-force participation nor BLS Arkansas unemployment is present for cross-check.",
      confidenceEffect: "none",
      reviewedAt,
    });
    return checks;
  }

  if (!acsLf || !blsUnempAr) {
    checks.push({
      crossCheckId: newId("xchk"),
      subjectMetric: "AR labor market (ACS LF vs BLS unemployment)",
      primaryObservationId: acsLf?.observationId ?? null,
      corroboratingObservationId: blsUnempAr?.observationId ?? null,
      comparisonMethod: "definition_and_presence",
      definitionCompatibility: "conceptually_related",
      periodCompatibility: "requires_review",
      geographyCompatibility: "directly_comparable",
      variance: null,
      tolerance: null,
      status: "insufficient_data",
      explanation:
        "Only one side of the conceptually related pair is present. Different concepts (participation vs unemployment); do not treat as conflict.",
      confidenceEffect: "leave_primary_unchanged",
      reviewedAt,
    });
    return checks;
  }

  checks.push({
    crossCheckId: newId("xchk"),
    subjectMetric: "AR labor market (ACS LF vs BLS unemployment)",
    primaryObservationId: acsLf.observationId,
    corroboratingObservationId: blsUnempAr.observationId,
    comparisonMethod: "definition_compatibility_only",
    definitionCompatibility: "conceptually_related",
    periodCompatibility:
      acsLf.period.slice(0, 4) === blsUnempAr.period.slice(0, 4)
        ? "directly_comparable"
        : "period_mismatch",
    geographyCompatibility: "directly_comparable",
    variance: null,
    tolerance: null,
    status: "not_applicable",
    explanation:
      "ACS labor-force participation and BLS unemployment measure different concepts (survey design, universe, period). Recorded as conceptually related; numeric variance not treated as confirmation or conflict.",
    confidenceEffect: "cap_at_verified_with_limitations",
    reviewedAt,
  });

  return checks;
}
