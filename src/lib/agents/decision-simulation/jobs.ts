import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { DECISION_SIMULATION_DOCTRINE_VERSION } from "./doctrine";
import { estimateDecisionSimulationCost } from "./cost-estimate";
import {
  buildDecisionSimulationCommandCenter,
  jobProgressPercent,
  planQueuedDecisionSimulationJob,
  type CommandCenterMember,
} from "./job-lifecycle";
import { getDecisionSimulationQueueConfig } from "./queue-config";
import { DECISION_SIMULATION_PROMPT_VERSION } from "./structured-output";
import type { DecisionSimulationActorModel } from "./actor-model";
import type { DecisionSimulationOpeningInput } from "./contracts";

export type JobCreateInput = {
  openingInput: DecisionSimulationOpeningInput;
  requestedRuns: number;
  actorModel?: DecisionSimulationActorModel;
  actorModelId?: string;
  confirmExpensive?: boolean;
  confirmThousand?: boolean;
};

type EnsembleRow = {
  id: string;
  requested_runs: number;
  completed_runs: number;
  failed_runs: number;
  status: string;
  execution_mode: string;
  chunk_size: number;
  chunk_count: number;
  next_chunk_ordinal: number;
  input_snapshot: unknown;
  model_name: string | null;
  actor_model_version: string | null;
  doctrine_version: string;
  created_at: Date;
  started_at: Date | null;
  updated_at: Date;
  completed_at: Date | null;
  cancelled_at: Date | null;
  error_summary: string | null;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number | null;
  job_seed: string | null;
};

type ChunkRow = {
  id: string;
  ensemble_id: string;
  chunk_ordinal: number;
  start_run_ordinal: number;
  end_run_ordinal: number;
  status: string;
  attempts: number;
  completed_runs: number;
  failed_runs: number;
  claimed_at: Date | null;
  error: string | null;
  input_tokens: number;
  output_tokens: number;
  result_snapshot: unknown;
};

export type DecisionSimulationJobView = {
  id: string;
  status: string;
  requested: number;
  completed: number;
  failed: number;
  percentComplete: number;
  executionMode: string;
  currentChunk: number;
  chunkCount: number;
  chunks: Array<{
    ordinal: number;
    status: string;
    startRunOrdinal: number;
    endRunOrdinal: number;
    completedRuns: number;
    failedRuns: number;
    error: string | null;
  }>;
  tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number };
  estimatedCostUsd: number | null;
  error: string | null;
  architectureOnly: boolean;
  createdAt: string;
  startedAt: string | null;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  aggregate: unknown;
  commandCenter: ReturnType<typeof buildDecisionSimulationCommandCenter> | null;
  representativeRuns: unknown[];
};

function asJobView(
  row: EnsembleRow,
  extra: {
    aggregate?: unknown;
    chunks?: DecisionSimulationJobView["chunks"];
    members?: CommandCenterMember[];
    frames?: Array<{ frame: string; count: number; share?: number }>;
    finals?: Array<{ recommendation?: string; frame?: string; count: number; share?: number }>;
  } = {},
): DecisionSimulationJobView {
  const members = extra.members ?? [];
  const frames = extra.frames ?? [];
  const finals = extra.finals ?? [];
  return {
    id: row.id,
    status: row.status,
    requested: row.requested_runs,
    completed: row.completed_runs,
    failed: row.failed_runs,
    percentComplete: jobProgressPercent(row.completed_runs, row.failed_runs, row.requested_runs),
    executionMode: row.execution_mode,
    currentChunk: Math.min(row.next_chunk_ordinal, Math.max(1, row.chunk_count)),
    chunkCount: row.chunk_count,
    chunks: extra.chunks ?? [],
    tokenUsage: {
      inputTokens: row.input_tokens,
      outputTokens: row.output_tokens,
      totalTokens: row.input_tokens + row.output_tokens,
    },
    estimatedCostUsd: row.estimated_cost_usd,
    error: row.error_summary,
    architectureOnly: row.execution_mode === "DISTRIBUTED" && row.requested_runs > getDecisionSimulationQueueConfig().maxRunsPerJob,
    createdAt: row.created_at.toISOString(),
    startedAt: row.started_at?.toISOString() ?? null,
    updatedAt: row.updated_at.toISOString(),
    completedAt: row.completed_at?.toISOString() ?? null,
    cancelledAt: row.cancelled_at?.toISOString() ?? null,
    aggregate: extra.aggregate ?? null,
    commandCenter:
      members.length || frames.length
        ? buildDecisionSimulationCommandCenter(row.requested_runs, members, frames, finals)
        : null,
    representativeRuns: members.slice(0, 5),
  };
}

export async function countActiveDecisionSimulationJobs(): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ n: bigint }>>`
    SELECT COUNT(*)::bigint AS n
    FROM public.decision_simulation_ensemble
    WHERE status IN ('QUEUED', 'RUNNING', 'PARTIAL')
  `;
  return Number(rows[0]?.n ?? 0);
}

export async function createDecisionSimulationJob(input: JobCreateInput) {
  const cfg = getDecisionSimulationQueueConfig();
  const message = input.openingInput?.message?.trim();
  if (!message) {
    return { ok: false as const, status: 400, error: "Opening correspondence is required." };
  }
  const requestedRuns = Math.floor(Number(input.requestedRuns) || 0);
  if (requestedRuns < 1 || requestedRuns > 1_000_000) {
    return { ok: false as const, status: 400, error: "requestedRuns must be between 1 and 1,000,000." };
  }

  const estimate = estimateDecisionSimulationCost(requestedRuns, cfg.jobBudgetUsd);
  if (estimate.blockedByBudget) {
    return {
      ok: false as const,
      status: 402,
      error: "Estimated minimum cost exceeds DECISION_SIM_JOB_BUDGET_USD.",
      estimate,
    };
  }
  if (requestedRuns >= 100 && !input.confirmExpensive) {
    return {
      ok: false as const,
      status: 409,
      error: "Confirm the estimated workload before launching this ensemble.",
      estimate,
      needsConfirm: true,
    };
  }
  if (estimate.requiresSecondConfirm && !input.confirmThousand) {
    return {
      ok: false as const,
      status: 409,
      error: "1,000-run jobs need a second confirmation.",
      estimate,
      needsSecondConfirm: true,
    };
  }

  const active = await countActiveDecisionSimulationJobs();
  if (active >= cfg.maxActiveJobs) {
    return { ok: false as const, status: 429, error: "Too many active Decision Simulator jobs." };
  }

  const plan = planQueuedDecisionSimulationJob(requestedRuns);
  const id = randomUUID();
  const seed = `job-${id}`;
  const snapshot = {
    openingInput: input.openingInput,
    actorModel: input.actorModel ?? null,
    actorModelId: input.actorModelId ?? null,
    estimate,
    plan,
  };

  await prisma.$executeRaw`
    INSERT INTO public.decision_simulation_ensemble (
      id, requested_runs, completed_runs, failed_runs, status, execution_mode,
      max_concurrency, chunk_size, chunk_count, next_chunk_ordinal, retain_individual_runs,
      input_snapshot, model_name, prompt_version, doctrine_version, actor_model_version,
      job_seed, estimated_cost_usd, created_at, updated_at
    ) VALUES (
      ${id}, ${plan.requestedRuns}, 0, 0, ${plan.architectureOnly ? "QUEUED" : plan.executionMode === "INLINE" ? "RUNNING" : "QUEUED"},
      ${plan.executionMode}, ${cfg.queueConcurrency}, ${plan.chunkSize}, ${plan.chunkCount}, 1, ${plan.requestedRuns <= 10},
      ${JSON.stringify(snapshot)}::jsonb, ${process.env.OPENAI_MODEL ?? process.env.DECISION_SIMULATION_OPENAI_MODEL ?? "gpt-4o-mini"},
      ${DECISION_SIMULATION_PROMPT_VERSION}, ${DECISION_SIMULATION_DOCTRINE_VERSION},
      ${input.actorModel?.version ?? "dashboard-generic-actor-1.0"}, ${seed}, ${estimate.costRangeUsd.max},
      NOW(), NOW()
    )
  `;

  if (!plan.architectureOnly) {
    for (let i = 0; i < plan.chunkCount; i += 1) {
      const start = i * plan.chunkSize + 1;
      const end = Math.min(plan.requestedRuns, start + plan.chunkSize - 1);
      await prisma.$executeRaw`
        INSERT INTO public.decision_simulation_ensemble_chunk (
          id, ensemble_id, chunk_ordinal, start_run_ordinal, end_run_ordinal, status
        ) VALUES (
          ${randomUUID()}, ${id}, ${i + 1}, ${start}, ${end}, 'PENDING'
        )
      `;
    }
  }

  await prisma.$executeRaw`
    INSERT INTO public.decision_simulation_ensemble_aggregate (
      id, ensemble_id, summary, dominant_frames, dominant_recommendations, updated_at
    ) VALUES (
      ${randomUUID()}, ${id}, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb, NOW()
    )
    ON CONFLICT (ensemble_id) DO NOTHING
  `;

  const job = await getDecisionSimulationJob(id);
  return {
    ok: true as const,
    job,
    estimate,
    plan,
    inline: plan.executionMode === "INLINE",
    kickWorker: plan.executionMode === "QUEUED" && !plan.architectureOnly,
  };
}

export async function getDecisionSimulationJobSnapshot(jobId: string) {
  const rows = await prisma.$queryRaw<Array<{ input_snapshot: unknown; job_seed: string | null }>>`
    SELECT input_snapshot, job_seed FROM public.decision_simulation_ensemble WHERE id = ${jobId} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getDecisionSimulationJob(jobId: string) {
  const rows = await prisma.$queryRaw<EnsembleRow[]>`
    SELECT * FROM public.decision_simulation_ensemble WHERE id = ${jobId} LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  const agg = await prisma.$queryRaw<Array<{ summary: unknown; dominant_frames: unknown; dominant_recommendations: unknown }>>`
    SELECT summary, dominant_frames, dominant_recommendations
    FROM public.decision_simulation_ensemble_aggregate
    WHERE ensemble_id = ${jobId}
    LIMIT 1
  `;
  const chunkRows = await prisma.$queryRaw<
    Array<{
      chunk_ordinal: number;
      status: string;
      start_run_ordinal: number;
      end_run_ordinal: number;
      completed_runs: number;
      failed_runs: number;
      error: string | null;
      result_snapshot: unknown;
    }>
  >`
    SELECT chunk_ordinal, status, start_run_ordinal, end_run_ordinal, completed_runs, failed_runs, error, result_snapshot
    FROM public.decision_simulation_ensemble_chunk
    WHERE ensemble_id = ${jobId}
    ORDER BY chunk_ordinal ASC
  `;
  const members = chunkRows.flatMap((chunk) => {
    const snapshot = (chunk.result_snapshot ?? {}) as { members?: CommandCenterMember[] };
    return snapshot.members ?? [];
  });
  const frames = (agg[0]?.dominant_frames as Array<{ frame: string; count: number; share?: number }>) ?? [];
  const finals =
    (agg[0]?.dominant_recommendations as Array<{
      recommendation?: string;
      frame?: string;
      count: number;
      share?: number;
    }>) ?? [];
  return asJobView(row, {
    aggregate: agg[0] ?? null,
    chunks: chunkRows.map((chunk) => ({
      ordinal: chunk.chunk_ordinal,
      status: chunk.status,
      startRunOrdinal: chunk.start_run_ordinal,
      endRunOrdinal: chunk.end_run_ordinal,
      completedRuns: chunk.completed_runs,
      failedRuns: chunk.failed_runs,
      error: chunk.error,
    })),
    members,
    frames,
    finals,
  });
}

export async function cancelDecisionSimulationJob(jobId: string) {
  await prisma.$executeRaw`
    UPDATE public.decision_simulation_ensemble
    SET status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW(), error_summary = 'Cancelled by operator'
    WHERE id = ${jobId} AND status IN ('QUEUED', 'RUNNING', 'PARTIAL')
  `;
  await prisma.$executeRaw`
    UPDATE public.decision_simulation_ensemble_chunk
    SET status = 'FAILED', error = 'Cancelled', completed_at = NOW()
    WHERE ensemble_id = ${jobId} AND status IN ('PENDING', 'RUNNING')
  `;
  return getDecisionSimulationJob(jobId);
}

export async function retryFailedDecisionSimulationChunks(jobId: string) {
  const cfg = getDecisionSimulationQueueConfig();
  await prisma.$executeRaw`
    UPDATE public.decision_simulation_ensemble_chunk
    SET status = 'PENDING', error = NULL, claimed_at = NULL, claimed_by = NULL
    WHERE ensemble_id = ${jobId}
      AND status = 'FAILED'
      AND attempts <= ${cfg.maxRetries}
      AND COALESCE(error, '') <> 'Cancelled'
  `;
  await prisma.$executeRaw`
    UPDATE public.decision_simulation_ensemble
    SET status = 'QUEUED', updated_at = NOW()
    WHERE id = ${jobId} AND status IN ('FAILED', 'PARTIAL', 'CANCELLED')
  `;
  return getDecisionSimulationJob(jobId);
}

export async function claimNextDecisionSimulationChunk(jobId: string, workerId: string) {
  const jobRows = await prisma.$queryRaw<EnsembleRow[]>`
    SELECT * FROM public.decision_simulation_ensemble WHERE id = ${jobId} LIMIT 1
  `;
  const job = jobRows[0];
  if (!job || job.status === "CANCELLED" || job.status === "COMPLETE") return { job, chunk: null as ChunkRow | null };
  if (job.execution_mode === "DISTRIBUTED" && job.requested_runs > getDecisionSimulationQueueConfig().maxRunsPerJob) {
    return { job, chunk: null as ChunkRow | null };
  }

  const chunks = await prisma.$queryRaw<ChunkRow[]>`
    SELECT * FROM public.decision_simulation_ensemble_chunk
    WHERE ensemble_id = ${jobId}
      AND status IN ('PENDING', 'FAILED')
      AND (claimed_at IS NULL OR claimed_at < NOW() - INTERVAL '2 minutes')
    ORDER BY chunk_ordinal ASC
    LIMIT 1
  `;
  const chunk = chunks[0];
  if (!chunk) return { job, chunk: null };

  await prisma.$executeRaw`
    UPDATE public.decision_simulation_ensemble_chunk
    SET status = 'RUNNING', claimed_at = NOW(), claimed_by = ${workerId},
        attempts = attempts + 1, started_at = COALESCE(started_at, NOW())
    WHERE id = ${chunk.id} AND status IN ('PENDING', 'FAILED')
  `;
  await prisma.$executeRaw`
    UPDATE public.decision_simulation_ensemble
    SET status = 'RUNNING', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
    WHERE id = ${jobId}
  `;
  return { job, chunk: { ...chunk, status: "RUNNING" } };
}

export async function completeDecisionSimulationChunk(input: {
  jobId: string;
  chunk: ChunkRow;
  completedRuns: number;
  failedRuns: number;
  inputTokens: number;
  outputTokens: number;
  error?: string;
  resultSnapshot: unknown;
  frames: Array<{ frame: string; count: number }>;
  finals: Array<{ recommendation: string; count: number }>;
}) {
  const already = await prisma.$queryRaw<Array<{ status: string }>>`
    SELECT status FROM public.decision_simulation_ensemble_chunk WHERE id = ${input.chunk.id} LIMIT 1
  `;
  if (already[0]?.status === "COMPLETE") {
    return getDecisionSimulationJob(input.jobId);
  }

  await prisma.$executeRaw`
    UPDATE public.decision_simulation_ensemble_chunk
    SET status = 'COMPLETE', completed_runs = ${input.completedRuns}, failed_runs = ${input.failedRuns},
        input_tokens = ${input.inputTokens}, output_tokens = ${input.outputTokens},
        error = ${input.error ?? null}, result_snapshot = ${JSON.stringify(input.resultSnapshot)}::jsonb,
        completed_at = NOW()
    WHERE id = ${input.chunk.id}
  `;

  await prisma.$executeRaw`
    UPDATE public.decision_simulation_ensemble
    SET completed_runs = completed_runs + ${input.completedRuns},
        failed_runs = failed_runs + ${input.failedRuns},
        input_tokens = input_tokens + ${input.inputTokens},
        output_tokens = output_tokens + ${input.outputTokens},
        next_chunk_ordinal = ${input.chunk.chunk_ordinal + 1},
        updated_at = NOW()
    WHERE id = ${input.jobId}
  `;

  const agg = await prisma.$queryRaw<Array<{ dominant_frames: unknown; dominant_recommendations: unknown }>>`
    SELECT dominant_frames, dominant_recommendations
    FROM public.decision_simulation_ensemble_aggregate
    WHERE ensemble_id = ${input.jobId}
    LIMIT 1
  `;
  const { mergeFrameCounts } = await import("./job-lifecycle");
  const frames = mergeFrameCounts(
    ((agg[0]?.dominant_frames as Array<{ frame: string; count: number }>) ?? []).map((row) => ({
      frame: row.frame,
      count: row.count,
    })),
    input.frames,
  );
  const finals = mergeFrameCounts(
    ((agg[0]?.dominant_recommendations as Array<{ frame?: string; recommendation?: string; count: number }>) ?? []).map(
      (row) => ({ frame: row.recommendation ?? row.frame ?? "", count: row.count }),
    ),
    input.finals.map((row) => ({ frame: row.recommendation, count: row.count })),
  ).map((row) => ({ recommendation: row.frame, count: row.count, share: row.share }));

  await prisma.$executeRaw`
    UPDATE public.decision_simulation_ensemble_aggregate
    SET dominant_frames = ${JSON.stringify(frames)}::jsonb,
        dominant_recommendations = ${JSON.stringify(finals)}::jsonb,
        updated_at = NOW()
    WHERE ensemble_id = ${input.jobId}
  `;

  const pending = await prisma.$queryRaw<Array<{ n: bigint }>>`
    SELECT COUNT(*)::bigint AS n
    FROM public.decision_simulation_ensemble_chunk
    WHERE ensemble_id = ${input.jobId} AND status IN ('PENDING', 'RUNNING', 'FAILED')
  `;
  if (Number(pending[0]?.n ?? 0) === 0) {
    await prisma.$executeRaw`
      UPDATE public.decision_simulation_ensemble
      SET status = CASE WHEN failed_runs >= requested_runs THEN 'FAILED' ELSE 'COMPLETE' END,
          completed_at = NOW(), updated_at = NOW()
      WHERE id = ${input.jobId} AND status <> 'CANCELLED'
    `;
  }
  return getDecisionSimulationJob(input.jobId);
}

export type { DecisionSimulationOpeningInput };
