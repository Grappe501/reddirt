import { randomUUID } from "node:crypto";
import { buildActorVariation } from "./actor-model";
import { buildActorContextForPrompt } from "./actor-context";
import { assignAlternativeFuture } from "./alternative-futures/assign";
import { runDecisionSimulationOpenAi } from "./openai-runtime";
import { buildGenericActorModel } from "./generic-actor";
import {
  claimNextDecisionSimulationChunk,
  completeDecisionSimulationChunk,
  getDecisionSimulationJob,
  getDecisionSimulationJobSnapshot,
} from "./jobs";
import type { DecisionSimulationActorModel } from "./actor-model";
import type { DecisionSimulationOpeningInput } from "./contracts";

export function resolveDecisionSimWorkerSecret(): string {
  return process.env.DECISION_SIM_WORKER_SECRET?.trim() || process.env.ADMIN_SECRET?.trim() || "";
}

export function isDecisionSimWorkerAuthorized(request: Request): boolean {
  const expected = resolveDecisionSimWorkerSecret();
  if (!expected) return false;
  const header = request.headers.get("x-decision-sim-worker")?.trim();
  return Boolean(header && header === expected);
}

export async function kickDecisionSimulationWorker(jobId: string, origin: string) {
  const secret = resolveDecisionSimWorkerSecret();
  if (!secret) return;
  const url = `${origin.replace(/\/$/, "")}/api/admin/decision-simulator/jobs/${jobId}/work`;
  void fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-decision-sim-worker": secret,
    },
    body: JSON.stringify({ jobId }),
  }).catch(() => {});
}

export async function processDecisionSimulationJobChunk(jobId: string) {
  const workerId = `worker-${randomUUID()}`;
  const claimed = await claimNextDecisionSimulationChunk(jobId, workerId);
  if (!claimed.chunk || !claimed.job) {
    return { ok: true, done: true, job: await getDecisionSimulationJob(jobId) };
  }

  const snapshotRow = await getDecisionSimulationJobSnapshot(jobId);
  const inputSnapshot = (snapshotRow?.input_snapshot ?? {}) as {
    openingInput?: DecisionSimulationOpeningInput;
    actorModel?: DecisionSimulationActorModel | null;
  };
  const openingInput = inputSnapshot.openingInput;
  if (!openingInput?.message) {
    await completeDecisionSimulationChunk({
      jobId,
      chunk: claimed.chunk,
      completedRuns: 0,
      failedRuns: claimed.chunk.end_run_ordinal - claimed.chunk.start_run_ordinal + 1,
      inputTokens: 0,
      outputTokens: 0,
      error: "Missing opening input snapshot.",
      resultSnapshot: { members: [] },
      frames: [],
      finals: [],
    });
    return { ok: false, done: true, job: await getDecisionSimulationJob(jobId) };
  }

  const actorModel = inputSnapshot.actorModel ?? buildGenericActorModel(openingInput);
  const seed = snapshotRow?.job_seed || `job-${jobId}`;

  let completedRuns = 0;
  let failedRuns = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  const frames: Array<{ frame: string; count: number }> = [];
  const finals: Array<{ recommendation: string; count: number }> = [];
  const members: Array<Record<string, unknown>> = [];
  let lastError: string | undefined;

  for (let ordinal = claimed.chunk.start_run_ordinal; ordinal <= claimed.chunk.end_run_ordinal; ordinal += 1) {
    const latest = await getDecisionSimulationJob(jobId);
    if (latest?.status === "CANCELLED") {
      lastError = "Cancelled";
      break;
    }
    const variation = buildActorVariation(actorModel, ordinal, seed);
    const future = assignAlternativeFuture(ordinal);
    const context = buildActorContextForPrompt(actorModel, variation, {
      future,
      openingMessage: openingInput.message,
    });
    try {
      const result = await runDecisionSimulationOpenAi({
        ...openingInput,
        context: [openingInput.context, context].filter(Boolean).join("\n\n"),
      });
      completedRuns += 1;
      inputTokens += result.usage.inputTokens ?? 0;
      outputTokens += result.usage.outputTokens ?? 0;
      const frame = result.run.moves[1]?.predictedFrame ?? "Unspecified";
      const final = result.run.moves[6]?.message ?? "Unspecified";
      frames.push({ frame, count: 1 });
      finals.push({ recommendation: final, count: 1 });
      members.push({
        ordinal,
        seed: variation.seed,
        futureId: future.futureId,
        frame,
        final,
        confidence: result.run.moves[1]?.confidence?.estimatedProbability ?? null,
        executiveSummary: result.executiveSummary,
        moves: result.run.moves.map((move) => ({
          moveNumber: move.moveNumber,
          side: move.side,
          message: move.message,
          predictedFrame: move.predictedFrame,
        })),
      });
    } catch (error) {
      failedRuns += 1;
      lastError = error instanceof Error ? error.message : "Simulation failed";
      members.push({ ordinal, seed: variation.seed, futureId: future.futureId, error: lastError });
    }
  }

  const job = await completeDecisionSimulationChunk({
    jobId,
    chunk: claimed.chunk,
    completedRuns,
    failedRuns,
    inputTokens,
    outputTokens,
    error: lastError,
    resultSnapshot: { members },
    frames,
    finals,
  });

  return {
    ok: true,
    done: job?.status === "COMPLETE" || job?.status === "CANCELLED" || job?.status === "FAILED",
    job,
  };
}
