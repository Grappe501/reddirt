import { listCuratedBillPlaybookNumbers } from "@/lib/intelligence/v4/debateBillOperatorPlaybooks";
import { listAllBillNumbersFromIndex } from "@/lib/intelligence/v4/billActProofDepth";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { buildTrapLaneStepCoverage } from "@/lib/intelligence/v4/trapLaneStepCoverage";
import { KELLY_ATTACK_VECTORS } from "@/lib/intelligence/v4/kellyCandidateResearchDepth";

function trapLaneCoveragePct(laneId: string): number {
  const d = getTrapLaneDrillDown(laneId)!;
  const coverage = buildTrapLaneStepCoverage(d);
  const fields = [
    d.rebuttalScripts.length >= 1,
    d.whatToExpectHammerToSay.length >= 3,
    coverage.steps.length >= 6,
    !!d.encounterDepth?.whatToExpectPlain,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

/** Client-safe offense readiness metric — shared by build progress and opposition layer. */
export function computeOppositionOffenseReadinessPct(): number {
  const trapIds = getAllTrapLaneIds();
  const trapAvg = Math.round(
    trapIds.reduce((s, id) => s + trapLaneCoveragePct(id), 0) / Math.max(1, trapIds.length),
  );
  const curated = listCuratedBillPlaybookNumbers().length;
  const totalBills = listAllBillNumbersFromIndex().length;
  const curatedBillPct = Math.round((curated / Math.max(1, totalBills)) * 100);
  const defensePct = Math.round(
    ((KELLY_ATTACK_VECTORS.length -
      KELLY_ATTACK_VECTORS.filter((v) => v.verificationStatus === "NEEDS_RESEARCH").length) /
      KELLY_ATTACK_VECTORS.length) *
      100,
  );
  return Math.round(trapAvg * 0.35 + 100 * 0.25 + curatedBillPct * 0.2 + defensePct * 0.2);
}
