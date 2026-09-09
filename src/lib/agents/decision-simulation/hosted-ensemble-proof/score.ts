import { ALTERNATIVE_FUTURE_IDS } from "../alternative-futures/contracts";
import {
  HOSTED_ENSEMBLE_MIN_RUNS,
  HOSTED_ENSEMBLE_PROOF_VERSION,
  type HostedEnsembleProof,
  type HostedProofCheck,
  type HostedProofStatus,
} from "./contracts";

export type HostedProofJob = {
  requested: number;
  completed?: number;
  failed?: number;
  status: string;
  executionMode?: string;
  architectureOnly?: boolean;
  commandCenter?: {
    robustness?: {
      futuresWithRuns?: number;
      requiredFutures?: number;
      lanes?: Array<{
        futureId: string;
        runCount: number;
        modalShare?: number | null;
        representativeIsModal?: boolean;
      }>;
    };
  } | null;
  dashboard?: {
    branches?: Array<{ futureId: string; runCount?: number; representativeIsModal?: boolean }>;
  } | null;
};

function check(id: HostedProofCheck["id"], label: string, pass: boolean, detail: string): HostedProofCheck {
  return { id, label, pass, detail };
}

export function scoreHostedEnsembleProof(job: HostedProofJob): HostedEnsembleProof {
  const lanes = job.commandCenter?.robustness?.lanes ?? [];
  const populated = lanes.filter((lane) => lane.runCount > 0);
  const minLaneN = populated.length ? Math.min(...populated.map((lane) => lane.runCount)) : 0;
  const futuresWithRuns = job.commandCenter?.robustness?.futuresWithRuns ?? populated.length;
  const queuedDepth =
    job.requested >= HOSTED_ENSEMBLE_MIN_RUNS &&
    (job.executionMode ?? "QUEUED") === "QUEUED" &&
    !job.architectureOnly;
  const finished =
    job.status === "COMPLETE" ||
    (job.completed ?? 0) + (job.failed ?? 0) >= job.requested;
  const sixFutures = futuresWithRuns >= ALTERNATIVE_FUTURE_IDS.length;
  const withinLane = queuedDepth && minLaneN >= 2;
  const typicalSample =
    populated.length > 0 &&
    populated.every((lane) => lane.runCount < 2 || lane.representativeIsModal !== false);
  const dashboardBranches = (job.dashboard?.branches?.length ?? 0) >= ALTERNATIVE_FUTURE_IDS.length;
  const workerContinuity = (job.executionMode ?? "QUEUED") === "QUEUED" && !job.architectureOnly;

  const checks: HostedProofCheck[] = [
    check(
      "QUEUED_DEPTH",
      "Queued 100+ job",
      queuedDepth,
      queuedDepth
        ? `${job.requested} queued runs.`
        : job.architectureOnly
          ? "Architecture-only plan does not execute."
          : `${job.requested} runs is below hosted ensemble depth.`,
    ),
    check("FINISHED", "Job finished", finished, finished ? `Status ${job.status}.` : `Status ${job.status}.`),
    check(
      "SIX_FUTURES",
      "All six named futures have runs",
      sixFutures,
      `${futuresWithRuns}/6 futures have at least one run.`,
    ),
    check(
      "WITHIN_LANE_N",
      "Within-lane n is at least 2",
      withinLane,
      minLaneN >= 2 ? `Smallest lane n=${minLaneN}.` : `Smallest lane n=${minLaneN}. A 6-run job cannot prove hosted depth.`,
    ),
    check(
      "TYPICAL_SAMPLE",
      "Displayed sample is typical of its lane",
      typicalSample,
      typicalSample ? "Modal-typical representatives are shown." : "A displayed sample is missing or atypical.",
    ),
    check(
      "DASHBOARD_BRANCHES",
      "Branch explorer has six futures",
      dashboardBranches,
      dashboardBranches ? "Dashboard branches are present." : "Dashboard branches are missing.",
    ),
    check(
      "WORKER_CONTINUITY",
      "Queued worker does not need the tab",
      workerContinuity,
      workerContinuity ? "Queued execution can continue after the tab closes." : "Inline or architecture-only jobs are not this proof.",
    ),
  ];

  let status: HostedProofStatus = "NOT_STARTED";
  if (queuedDepth && !finished) status = "IN_PROGRESS";
  if (queuedDepth && finished && checks.every((item) => item.pass)) status = "PROVEN";
  if (queuedDepth && finished && checks.some((item) => !item.pass)) status = "FAILED";

  const summary =
    status === "PROVEN"
      ? "Hosted ensemble is informative: six futures, within-lane n, typical samples, tab not required."
      : status === "IN_PROGRESS"
        ? "Hosted ensemble is running. Proof waits for completion."
        : status === "FAILED"
          ? "Hosted job finished but is not yet informative."
          : "Launch a queued 100 or 1,000 job on dec-sim to prove hosted depth. This check does not start a paid run.";

  return {
    version: HOSTED_ENSEMBLE_PROOF_VERSION,
    status,
    requested: job.requested,
    minLaneN,
    futuresWithRuns,
    checks,
    summary,
  };
}
