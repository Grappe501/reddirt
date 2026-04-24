/**
 * BRAIN-OPS-2 + BRAIN-OPS-3: read-only deterministic truth snapshot (aggregate health read model).
 * Repo-grounded counts only; no automation.
 * @see docs/deterministic-brain-foundation.md
 * @see docs/progressive-build-protocol.md (PROTO-1)
 */

import { FinancialTransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getLatestVoterFileSnapshot } from "@/lib/voter-file/queries";
import { TruthClass, type TruthClassId } from "./truth";
import { getOpenWorkCountsBySource, type OpenWorkCountBySource } from "./open-work";
import { getCoverageSummary } from "./seating";
import { getElectionResultCoverageSummary } from "./election-results";

export const BRAIN_OPS_2_PACKET = "BRAIN-OPS-2" as const;
export const BRAIN_OPS_3_PACKET = "BRAIN-OPS-3" as const;

export type TruthMetricStatus = "good" | "partial" | "missing" | "unknown";

export type TruthMetric = {
  label: string;
  status: TruthMetricStatus;
  /** Values from `truth.ts` (`TruthClassId`). */
  truthClass: TruthClassId;
  note?: string;
};

/** GOALS-VERIFY-1 mirror check: authoritative `registrationGoal` vs per-snapshot `countyGoal` on latest COMPLETE file. */
export type CountyGoalMirrorCheck = {
  basis: "latest_complete_voter_file_snapshot";
  snapshotId: string | null;
  snapshotFileAsOfIso: string | null;
  countiesWithAuthoritativeGoal: number;
  /** `CountyCampaignStats.registrationGoal` set but no `CountyVoterMetrics` row for this snapshot. */
  missingMetricsRowOnLatestSnapshot: number;
  /** Row exists; `countyGoal` is null while `registrationGoal` is set (recompute gap). */
  mirrorCountyGoalNullCount: number;
  /** Row exists; both integers and `countyGoal !== registrationGoal`. */
  numericMismatchCount: number;
  /** No COMPLETE `VoterFileSnapshot` — mirror not evaluated. */
  couldNotEvaluateMirror: boolean;
};

export type TruthWarningGroups = {
  goals: string[];
  compliance: string[];
  finance: string[];
  seats: string[];
  pipeline: string[];
  other: string[];
};

export type TruthSnapshot = {
  generatedAt: Date;
  /** BRAIN-OPS-3: deterministic mirror / conflict context (GOALS-VERIFY-1). */
  countyGoalMirror: CountyGoalMirrorCheck;
  /** UWR-2 + CM-2: same object backing `truth.openWork` note — avoids duplicate `getOpenWorkCountsBySource` calls for consumers. */
  openWorkCounts: OpenWorkCountBySource;
  truth: {
    countyGoals: TruthMetric;
    electionData: TruthMetric;
    complianceDocs: TruthMetric;
    seatCoverage: TruthMetric;
    budgetState: TruthMetric;
    openWork: TruthMetric;
  };
  health: {
    missingData: string[];
    staleData: string[];
    conflicts: string[];
    /** Flat list (concat of `warningGroups`) for simple consumers. */
    warnings: string[];
    /** BRAIN-OPS-3: grouped warnings. */
    warningGroups: TruthWarningGroups;
  };
  governance: {
    blocked: string[];
    reviewRequired: string[];
    advisoryOnly: string[];
  };
};

function flattenWarningGroups(g: TruthWarningGroups): string[] {
  return [...g.goals, ...g.compliance, ...g.finance, ...g.seats, ...g.pipeline, ...g.other];
}

export async function getTruthSnapshot(): Promise<TruthSnapshot> {
  const generatedAt = new Date();

  const [
    totalCounties,
    countiesWithRegistrationGoal,
    complianceTotal,
    complianceApprovedForAi,
    txByStatus,
    coverage,
    openWorkCounts,
    latestSnap,
    statsWithRegistrationGoal,
    pipelineErrorCountyCount,
    electionCoverage,
    electionOfficialFlags,
    currentVoterClassificationCount,
    relationalContactCount,
    relationalCoreFiveCount,
  ] = await Promise.all([
    prisma.county.count(),
    prisma.countyCampaignStats.count({
      where: { registrationGoal: { not: null } },
    }),
    prisma.complianceDocument.count(),
    prisma.complianceDocument.count({ where: { approvedForAiReference: true } }),
    prisma.financialTransaction.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    getCoverageSummary(),
    getOpenWorkCountsBySource(),
    getLatestVoterFileSnapshot(),
    prisma.countyCampaignStats.findMany({
      where: { registrationGoal: { not: null } },
      select: { countyId: true, registrationGoal: true },
    }),
    prisma.countyCampaignStats.count({
      where: {
        pipelineError: { not: null },
        NOT: { pipelineError: "" },
      },
    }),
    getElectionResultCoverageSummary(),
    prisma.electionResultSource.findMany({ select: { isOfficial: true } }),
    prisma.voterModelClassification.count({ where: { isCurrent: true } }),
    prisma.relationalContact.count(),
    prisma.relationalContact.count({ where: { isCoreFive: true } }),
  ]);

  const draftCount =
    txByStatus.find((g) => g.status === FinancialTransactionStatus.DRAFT)?._count._all ?? 0;
  const confirmedCount =
    txByStatus.find((g) => g.status === FinancialTransactionStatus.CONFIRMED)?._count._all ?? 0;
  const totalTx = draftCount + confirmedCount;

  let missingMetricsRowOnLatestSnapshot = 0;
  let mirrorCountyGoalNullCount = 0;
  let numericMismatchCount = 0;
  const couldNotEvaluateMirror = latestSnap == null;

  const metricsByCounty = new Map<string, { countyGoal: number | null }>();
  if (latestSnap) {
    const metricsRows = await prisma.countyVoterMetrics.findMany({
      where: { voterFileSnapshotId: latestSnap.id },
      select: { countyId: true, countyGoal: true },
    });
    for (const r of metricsRows) {
      metricsByCounty.set(r.countyId, { countyGoal: r.countyGoal });
    }
  }

  for (const s of statsWithRegistrationGoal) {
    const auth = s.registrationGoal;
    if (auth == null) continue;
    if (!latestSnap) break;
    const m = metricsByCounty.get(s.countyId);
    if (!m) {
      missingMetricsRowOnLatestSnapshot += 1;
      continue;
    }
    if (m.countyGoal === null) {
      mirrorCountyGoalNullCount += 1;
      continue;
    }
    if (m.countyGoal !== auth) {
      numericMismatchCount += 1;
    }
  }

  const countyGoalMirror: CountyGoalMirrorCheck = {
    basis: "latest_complete_voter_file_snapshot",
    snapshotId: latestSnap?.id ?? null,
    snapshotFileAsOfIso: latestSnap?.fileAsOfDate?.toISOString() ?? null,
    countiesWithAuthoritativeGoal: statsWithRegistrationGoal.length,
    missingMetricsRowOnLatestSnapshot,
    mirrorCountyGoalNullCount,
    numericMismatchCount,
    couldNotEvaluateMirror,
  };

  let countyGoalsStatus: TruthMetricStatus;
  if (totalCounties === 0 || countiesWithRegistrationGoal === 0) countyGoalsStatus = "missing";
  else if (countiesWithRegistrationGoal * 2 >= totalCounties) countyGoalsStatus = "good";
  else countyGoalsStatus = "partial";

  const mirrorNoteParts: string[] = [];
  if (couldNotEvaluateMirror) {
    mirrorNoteParts.push("mirror not evaluated (no COMPLETE VoterFileSnapshot)");
  } else {
    mirrorNoteParts.push(
      `mirror on snapshot ${latestSnap!.id.slice(0, 8)}… (${countyGoalMirror.snapshotFileAsOfIso ?? "no date"})`,
    );
    if (numericMismatchCount > 0) {
      mirrorNoteParts.push(`${numericMismatchCount} numeric mismatch vs countyGoal`);
    }
    if (missingMetricsRowOnLatestSnapshot > 0) {
      mirrorNoteParts.push(`${missingMetricsRowOnLatestSnapshot} missing metrics row`);
    }
    if (mirrorCountyGoalNullCount > 0) {
      mirrorNoteParts.push(`${mirrorCountyGoalNullCount} null countyGoal with auth goal set`);
    }
  }

  const countyGoals: TruthMetric = {
    label: "County registration goals",
    status: countyGoalsStatus,
    truthClass: TruthClass.AUTHORITATIVE,
    note:
      totalCounties > 0
        ? `${countiesWithRegistrationGoal}/${totalCounties} counties have registrationGoal set (CountyCampaignStats). ${mirrorNoteParts.join("; ")}`
        : "No County rows",
  };

  const electionSourceCount = electionCoverage.sourceCount;
  const countyMapRatio =
    totalCounties > 0 ? electionCoverage.distinctMappedCountyIds / totalCounties : 0;
  const allSourcesMarkedOfficial =
    electionOfficialFlags.length > 0 && electionOfficialFlags.every((s) => s.isOfficial === true);

  let electionStatus: TruthMetricStatus;
  let electionClass: TruthClassId;
  let electionNote: string;

  if (electionSourceCount === 0) {
    electionStatus = "missing";
    electionClass = TruthClass.PROVISIONAL;
    electionNote =
      "No ElectionResultSource rows in DB. Raw JSON may exist at H:\\SOSWebsite\\campaign information for ingestion\\electionResults — run npm run ingest:election-results -- --file <one-json-per-run>";
  } else if (electionCoverage.countyResultRowCount === 0) {
    electionStatus = "partial";
    electionClass = allSourcesMarkedOfficial ? TruthClass.AUTHORITATIVE : TruthClass.PROVISIONAL;
    electionNote = `${electionSourceCount} ingest source(s), ${electionCoverage.contestCount} contest row(s), but zero ElectionCountyResult rows — check parser / file shape`;
  } else {
    electionStatus = countyMapRatio >= 0.75 ? "good" : "partial";
    electionClass = allSourcesMarkedOfficial ? TruthClass.AUTHORITATIVE : TruthClass.PROVISIONAL;
    electionNote = `${electionSourceCount} source(s), ${electionCoverage.contestCount} contests, ${electionCoverage.countyResultRowCount} county-level tabulation rows (${electionCoverage.countyResultsWithCountyId} with County FK), ${electionCoverage.precinctResultRowCount} precinct/location rows; ${electionCoverage.distinctMappedCountyIds}/${totalCounties} counties mapped at least once. Tabulation storage only — not turnout targeting math`;
  }

  const electionData: TruthMetric = {
    label: "Election results (ingested)",
    status: electionStatus,
    truthClass: electionClass,
    note: electionNote,
  };

  let complianceStatus: TruthMetricStatus;
  let complianceClass: TruthClassId;
  let complianceNote: string | undefined;

  if (complianceTotal === 0) {
    complianceStatus = "missing";
    complianceClass = TruthClass.UNAPPROVED_FOR_AI;
    complianceNote = "No ComplianceDocument rows";
  } else if (complianceApprovedForAi === complianceTotal) {
    complianceStatus = "good";
    complianceClass = TruthClass.AUTHORITATIVE;
    complianceNote = `${complianceTotal} document(s), all approved for AI reference`;
  } else if (complianceApprovedForAi > 0) {
    complianceStatus = "partial";
    complianceClass = TruthClass.AUTHORITATIVE;
    complianceNote = `${complianceApprovedForAi}/${complianceTotal} approved for AI reference`;
  } else {
    complianceStatus = "partial";
    complianceClass = TruthClass.UNAPPROVED_FOR_AI;
    complianceNote = `${complianceTotal} document(s), none approved for AI reference`;
  }

  const complianceDocs: TruthMetric = {
    label: "Compliance documents",
    status: complianceStatus,
    truthClass: complianceClass,
    note: complianceNote,
  };

  const staffed = coverage.filled + coverage.acting + coverage.shadow;
  let seatStatus: TruthMetricStatus;
  if (coverage.totalPositions === 0) seatStatus = "unknown";
  else if (coverage.vacant === 0) seatStatus = "good";
  else if (staffed === 0) seatStatus = "missing";
  else seatStatus = "partial";

  const seatCoverage: TruthMetric = {
    label: "ROLE-1 seat coverage",
    status: seatStatus,
    truthClass: TruthClass.AUTHORITATIVE,
    note: `${staffed}/${coverage.totalPositions} seats staffed (filled+acting+shadow); ${coverage.vacant} vacant`,
  };

  let budgetStatus: TruthMetricStatus;
  let budgetClass: TruthClassId;
  let budgetNote: string | undefined;

  if (totalTx === 0) {
    budgetStatus = "unknown";
    budgetClass = TruthClass.AUTHORITATIVE;
    budgetNote = "No FinancialTransaction rows";
  } else if (draftCount > 0 && confirmedCount > 0) {
    budgetStatus = "partial";
    budgetClass = TruthClass.AUTHORITATIVE;
    budgetNote = `CONFIRMED ${confirmedCount}, DRAFT ${draftCount} (drafts are not fiscal truth)`;
  } else if (draftCount > 0) {
    budgetStatus = "partial";
    budgetClass = TruthClass.UNAPPROVED_FOR_AI;
    budgetNote = `${draftCount} DRAFT row(s), no CONFIRMED ledger truth yet`;
  } else {
    budgetStatus = "good";
    budgetClass = TruthClass.AUTHORITATIVE;
    budgetNote = `${confirmedCount} CONFIRMED row(s)`;
  }

  const budgetState: TruthMetric = {
    label: "Financial ledger",
    status: budgetStatus,
    truthClass: budgetClass,
    note: budgetNote,
  };

  const openWork: TruthMetric = {
    label: "Open work (queue health)",
    status: "good",
    truthClass: TruthClass.INFERRED,
    note: `emailWorkflowItem=${openWorkCounts.emailWorkflowItem}, workflowIntake=${openWorkCounts.workflowIntake}, campaignTask=${openWorkCounts.campaignTask}, communicationThread=${openWorkCounts.communicationThread}, arkansasFestivalIngest=${openWorkCounts.arkansasFestivalIngest} (global counts; not seat-scoped)`,
  };

  const missingData: string[] = [];
  if (electionSourceCount === 0) {
    missingData.push(
      "Election results not loaded into database yet (no ElectionResultSource rows; CLI: npm run ingest:election-results -- --file <path> — one election per run)",
    );
  }
  missingData.push(
    "No per-volunteer goals breakdown in schema (VolunteerProfile has no goal fields; county-level targets on CountyCampaignStats only)",
  );
  if (relationalContactCount === 0) {
    missingData.push(
      "Relational organizing: no RelationalContact rows (REL-2 network layer is empty — not a data defect, optional until volunteers populate)",
    );
  }

  const staleData: string[] = [];
  if (couldNotEvaluateMirror && countiesWithRegistrationGoal > 0) {
    staleData.push(
      "County voter metrics mirror: no COMPLETE VoterFileSnapshot — cannot verify countyGoal vs registrationGoal",
    );
  }
  if (missingMetricsRowOnLatestSnapshot > 0) {
    staleData.push(
      `${missingMetricsRowOnLatestSnapshot} county(ies) with registrationGoal lack CountyVoterMetrics on latest COMPLETE snapshot (recompute / ingest gap)`,
    );
  }
  if (mirrorCountyGoalNullCount > 0) {
    staleData.push(
      `${mirrorCountyGoalNullCount} county(ies) have metrics row on latest snapshot but countyGoal is null while registrationGoal is set`,
    );
  }
  if (complianceTotal > 0 && complianceApprovedForAi === 0) {
    staleData.push(
      "Compliance: documents uploaded but none approved for AI reference (knowledge gate not cleared)",
    );
  }
  if (draftCount > 0 && confirmedCount === 0) {
    staleData.push(
      "Financial ledger: only DRAFT FinancialTransaction rows — no CONFIRMED actuals yet",
    );
  }
  if (coverage.vacantUnderCampaignManager > 0) {
    staleData.push(
      `${coverage.vacantUnderCampaignManager} vacant ROLE-1 seat(s) directly under campaign_manager (coverage gap signal)`,
    );
  }
  if (pipelineErrorCountyCount > 0) {
    staleData.push(
      `${pipelineErrorCountyCount} CountyCampaignStats row(s) with non-empty pipelineError (voter pipeline / sync narrative)`,
    );
  }

  const conflicts: string[] = [];
  if (numericMismatchCount > 0) {
    conflicts.push(
      `GOALS mirror: ${numericMismatchCount} county(ies) on latest COMPLETE snapshot have countyGoal !== registrationGoal (both integers; see GOALS-VERIFY-1)`,
    );
  }

  const warningGroups: TruthWarningGroups = {
    goals: [],
    compliance: [],
    finance: [],
    seats: [],
    pipeline: [],
    other: [],
  };

  if (numericMismatchCount > 0) {
    warningGroups.goals.push(
      `${numericMismatchCount} county registration goal numeric mismatch (countyGoal vs registrationGoal) on latest snapshot`,
    );
  }
  if (missingMetricsRowOnLatestSnapshot > 0) {
    warningGroups.goals.push(
      `${missingMetricsRowOnLatestSnapshot} county(ies) missing CountyVoterMetrics row for latest snapshot despite registrationGoal`,
    );
  }
  if (mirrorCountyGoalNullCount > 0) {
    warningGroups.goals.push(
      `${mirrorCountyGoalNullCount} county(ies) with null countyGoal on latest snapshot while registrationGoal is set`,
    );
  }

  if (complianceTotal > 0 && complianceApprovedForAi < complianceTotal) {
    warningGroups.compliance.push(
      `${complianceTotal - complianceApprovedForAi} ComplianceDocument row(s) not approved for AI reference`,
    );
  }

  if (draftCount > 0) {
    warningGroups.finance.push(
      `${draftCount} DRAFT FinancialTransaction row(s) are not operational truth until CONFIRMED`,
    );
  }

  if (coverage.vacant > 0) {
    warningGroups.seats.push(
      `${coverage.vacant} vacant ROLE-1 seat(s) (see getCoverageSummary / seating.ts)`,
    );
  }
  if (coverage.vacantUnderCampaignManager > 0) {
    warningGroups.seats.push(
      `${coverage.vacantUnderCampaignManager} vacant seat(s) under campaign_manager subtree`,
    );
  }

  if (pipelineErrorCountyCount > 0) {
    warningGroups.pipeline.push(
      `${pipelineErrorCountyCount} county stats row(s) with pipelineError set — check voter file / pipeline sync`,
    );
  }

  if (electionSourceCount > 0 && totalCounties > 0 && countyMapRatio < 0.5) {
    warningGroups.other.push(
      `Election ingest: only ${electionCoverage.distinctMappedCountyIds}/${totalCounties} distinct counties have a mapped ElectionCountyResult.countyId — review unmatched raw labels`,
    );
  }

  const owTotal =
    openWorkCounts.emailWorkflowItem +
    openWorkCounts.workflowIntake +
    openWorkCounts.campaignTask +
    openWorkCounts.communicationThread +
    openWorkCounts.arkansasFestivalIngest;
  if (owTotal > 50) {
    warningGroups.other.push(
      `Open work volume elevated (total count ${owTotal} across UWR-2 sources — triage load, not a data defect)`,
    );
  }

  const warnings = flattenWarningGroups(warningGroups);

  const blocked: string[] = [];

  const reviewRequired: string[] = [];
  if (complianceTotal > 0 && complianceApprovedForAi < complianceTotal) {
    reviewRequired.push("ComplianceDocument.approvedForAiReference is false for one or more uploads");
  }
  if (draftCount > 0) {
    reviewRequired.push("FinancialTransaction rows in DRAFT status need confirmation for actuals");
  }
  if (numericMismatchCount > 0) {
    reviewRequired.push(
      "County voter metrics: reconcile countyGoal with CountyCampaignStats.registrationGoal (recompute or correct authoritative goal)",
    );
  }

  const advisoryOnly: string[] = [
    "Ingested election JSON tabulation in DB is reported results storage — not SOS certification, not turnout models, not voter-level vote history",
    "County Wikipedia reference context (SearchChunk / ingested markdown; advisory reference, not SOS truth)",
  ];
  if (currentVoterClassificationCount === 0) {
    advisoryOnly.push(
      "Voter model: no current VoterModelClassification rows — tier labels are absent until staff/modeling writes classifications (VOTER-MODEL-1 is optional metadata, not roll truth)",
    );
  } else {
    advisoryOnly.push(
      `Voter model: ${currentVoterClassificationCount} current VoterModelClassification row(s) — all tiers are inferred/provisional unless explicitly human-confirmed; never treat as vote totals or guaranteed support`,
    );
  }
  if (relationalContactCount === 0) {
    advisoryOnly.push(
      "Relational contacts (REL-2): no rows — missing volunteer relational network layer; when populated, treat counts and core-five counts as operational network metadata only (not votes, not auto-support)",
    );
  } else {
    advisoryOnly.push(
      `Relational contacts (REL-2): ${relationalContactCount} contact row(s), ${relationalCoreFiveCount} marked core-five — operational / inferred network size only; not vote totals, not automatic supporter classification, not registration verification unless separately confirmed`,
    );
  }

  return {
    generatedAt,
    countyGoalMirror,
    openWorkCounts,
    truth: {
      countyGoals,
      electionData,
      complianceDocs,
      seatCoverage,
      budgetState,
      openWork,
    },
    health: {
      missingData,
      staleData,
      conflicts,
      warnings,
      warningGroups,
    },
    governance: {
      blocked,
      reviewRequired,
      advisoryOnly,
    },
  };
}
