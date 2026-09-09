import type { DecisionSimulationOpeningInput } from "./contracts";
import type { DecisionSimulationActorModel } from "./actor-model";
import { buildActorVariation } from "./actor-model";
import { buildActorContextForPrompt } from "./actor-context";
import { assignAlternativeFuture } from "./alternative-futures/assign";
import type { AlternativeFutureId } from "./alternative-futures/contracts";
import { runDecisionSimulationOpenAi, type DecisionSimulationOpenAiResult } from "./openai-runtime";
import {
  planDecisionSimulationEnsemble,
  type DecisionSimulationEnsemblePlan,
  type DecisionSimulationEnsembleRequest,
} from "./scale";

export interface DecisionSimulationEnsembleMemberResult {
  ordinal: number;
  seed: number;
  futureId: AlternativeFutureId;
  actorVariation: ReturnType<typeof buildActorVariation>;
  result?: DecisionSimulationOpenAiResult;
  error?: string;
}

export interface DecisionSimulationRepresentativeRun {
  ordinal: number;
  reason: "MEDIAN_CONFIDENCE" | "HIGHEST_CONFIDENCE" | "LOWEST_CONFIDENCE" | "MOST_COMMON_FRAME";
}

export interface DecisionSimulationEnsembleResult {
  plan: DecisionSimulationEnsemblePlan;
  completedRuns: number;
  failedRuns: number;
  members: DecisionSimulationEnsembleMemberResult[];
  dominantMove1Frames: Array<{ frame: string; count: number; share: number }>;
  dominantFinalRecommendations: Array<{ recommendation: string; count: number; share: number }>;
  averageConfidence?: number;
  averageScenarioProbability?: number;
  tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number };
  representativeRuns: DecisionSimulationRepresentativeRun[];
}

export interface DecisionSimulationEnsembleExecutionInput {
  openingInput: DecisionSimulationOpeningInput;
  actorModel: DecisionSimulationActorModel;
  ensemble: DecisionSimulationEnsembleRequest;
  ensembleSeed?: string;
  abortSignal?: AbortSignal;
}

function average(values: number[]): number | undefined {
  if (!values.length) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function topCounts(values: string[], limit = 8) {
  const map = new Map<string, number>();
  for (const value of values.filter(Boolean)) map.set(value, (map.get(value) ?? 0) + 1);
  const total = values.length || 1;
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count, share: count / total }));
}

function representativeRuns(members: DecisionSimulationEnsembleMemberResult[]): DecisionSimulationRepresentativeRun[] {
  const completed = members.filter((member) => member.result);
  if (!completed.length) return [];
  const scored = completed.map((member) => ({
    ordinal: member.ordinal,
    confidence: average(member.result!.run.moves.slice(1).map((move) => move.confidence.estimatedProbability ?? 0)) ?? 0,
    frame: member.result!.run.moves[1]?.predictedFrame ?? "",
  }));
  const ordered = [...scored].sort((a, b) => a.confidence - b.confidence);
  const frameCounts = topCounts(scored.map((item) => item.frame));
  const commonFrame = frameCounts[0]?.label;
  const common = scored.find((item) => item.frame === commonFrame);
  const reps: DecisionSimulationRepresentativeRun[] = [
    { ordinal: ordered[Math.floor((ordered.length - 1) / 2)].ordinal, reason: "MEDIAN_CONFIDENCE" },
    { ordinal: ordered[ordered.length - 1].ordinal, reason: "HIGHEST_CONFIDENCE" },
    { ordinal: ordered[0].ordinal, reason: "LOWEST_CONFIDENCE" },
  ];
  if (common && !reps.some((item) => item.ordinal === common.ordinal)) {
    reps.push({ ordinal: common.ordinal, reason: "MOST_COMMON_FRAME" });
  }
  return reps;
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
  abortSignal?: AbortSignal,
): Promise<T[]> {
  const results = new Array<T>(tasks.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      if (abortSignal?.aborted) throw new Error("Decision simulation ensemble cancelled.");
      const index = cursor++;
      if (index >= tasks.length) return;
      results[index] = await tasks[index]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

export async function runDecisionSimulationEnsemble(
  input: DecisionSimulationEnsembleExecutionInput,
): Promise<DecisionSimulationEnsembleResult> {
  const plan = planDecisionSimulationEnsemble(input.ensemble);
  if (plan.executionMode === "DISTRIBUTED") {
    throw new Error("Distributed ensemble execution requires the Phase 5 worker adapter; use the generated chunk plan instead of a synchronous process.");
  }

  const tasks = Array.from({ length: plan.requestedRuns }, (_, index) => async (): Promise<DecisionSimulationEnsembleMemberResult> => {
    const ordinal = index + 1;
    const future = assignAlternativeFuture(ordinal);
    const actorVariation = buildActorVariation(input.actorModel, ordinal, input.ensembleSeed);
    const context = buildActorContextForPrompt(input.actorModel, actorVariation, {
      future,
      openingMessage: input.openingInput.message,
    });
    try {
      const result = await runDecisionSimulationOpenAi({
        ...input.openingInput,
        context: [input.openingInput.context, context].filter(Boolean).join("\n\n"),
      });
      return { ordinal, seed: actorVariation.seed, futureId: future.futureId, actorVariation, result };
    } catch (error) {
      return {
        ordinal,
        seed: actorVariation.seed,
        futureId: future.futureId,
        actorVariation,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  const members = await runWithConcurrency(tasks, plan.maxConcurrency, input.abortSignal);
  const completed = members.filter((member) => member.result);
  const frames = completed.map((member) => member.result!.run.moves[1]?.predictedFrame ?? "Unspecified");
  const finals = completed.map((member) => member.result!.run.moves[6]?.message ?? "Unspecified");
  const confidences = completed.flatMap((member) => member.result!.run.moves.slice(1).map((move) => move.confidence.estimatedProbability ?? 0));
  const probabilities = completed.flatMap((member) => member.result!.run.moves.filter((move) => move.side === "COUNTERPARTY").map((move) => move.confidence.estimatedProbability ?? 0));

  return {
    plan,
    completedRuns: completed.length,
    failedRuns: members.length - completed.length,
    members: plan.retainIndividualRuns ? members : members.filter((member) => member.error),
    dominantMove1Frames: topCounts(frames).map(({ label, ...rest }) => ({ frame: label, ...rest })),
    dominantFinalRecommendations: topCounts(finals).map(({ label, ...rest }) => ({ recommendation: label, ...rest })),
    averageConfidence: average(confidences),
    averageScenarioProbability: average(probabilities),
    tokenUsage: completed.reduce((acc, member) => ({
      inputTokens: acc.inputTokens + (member.result!.usage.inputTokens ?? 0),
      outputTokens: acc.outputTokens + (member.result!.usage.outputTokens ?? 0),
      totalTokens: acc.totalTokens + (member.result!.usage.totalTokens ?? 0),
    }), { inputTokens: 0, outputTokens: 0, totalTokens: 0 }),
    representativeRuns: representativeRuns(members),
  };
}

export interface DecisionSimulationDistributedChunk {
  chunkOrdinal: number;
  startRunOrdinal: number;
  endRunOrdinal: number;
  runCount: number;
}

export function buildDecisionSimulationDistributedChunks(
  request: DecisionSimulationEnsembleRequest,
): { plan: DecisionSimulationEnsemblePlan; chunks: DecisionSimulationDistributedChunk[] } {
  const plan = planDecisionSimulationEnsemble(request);
  const chunks: DecisionSimulationDistributedChunk[] = [];
  for (let start = 1, chunkOrdinal = 1; start <= plan.requestedRuns; start += plan.chunkSize, chunkOrdinal += 1) {
    const end = Math.min(plan.requestedRuns, start + plan.chunkSize - 1);
    chunks.push({ chunkOrdinal, startRunOrdinal: start, endRunOrdinal: end, runCount: end - start + 1 });
  }
  return { plan, chunks };
}
