import { after, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { runDecisionSimulationEnsemble } from "@/lib/agents/decision-simulation";
import type { DecisionSimulationActorModel } from "@/lib/agents/decision-simulation/actor-model";
import { buildGenericActorModel } from "@/lib/agents/decision-simulation/generic-actor";
import {
  GENERIC_PERSONALITY_ID,
  getBuiltInPersonality,
  resolvePersonality,
} from "@/lib/agents/decision-simulation/personality-catalog";
import { completeDecisionSimulationChunk, createDecisionSimulationJob, getDecisionSimulationJob } from "@/lib/agents/decision-simulation/jobs";
import { prisma } from "@/lib/db";
import { kickDecisionSimulationWorker } from "@/lib/agents/decision-simulation/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 26;

function requestOrigin(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin
  );
}

export async function POST(request: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const ip = clientIp(request);
  const rl = rateLimit(`decision-simulator-jobs:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many simulation requests. Try again shortly.", retryAfterMs: rl.retryAfterMs },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as {
      openingInput: Parameters<typeof createDecisionSimulationJob>[0]["openingInput"];
      requestedRuns: number;
      actorModelId?: string;
      actorModel?: DecisionSimulationActorModel;
      operatorPersonalityId?: string;
      counterpartyPersonalityId?: string;
      confirmExpensive?: boolean;
      confirmThousand?: boolean;
    };

    const counterpartyId = body.counterpartyPersonalityId ?? body.actorModelId;
    const builtInCounterparty = getBuiltInPersonality(counterpartyId);
    const counterparty = resolvePersonality(counterpartyId);
    const operator = resolvePersonality(body.operatorPersonalityId);
    const actorModel =
      builtInCounterparty && builtInCounterparty.id !== GENERIC_PERSONALITY_ID
        ? { ...builtInCounterparty.model, actorId: builtInCounterparty.id }
        : isUsableActorModel(body.actorModel)
          ? {
              ...body.actorModel,
              actorId: counterpartyId || body.actorModel.actorId,
              actorName: String(body.actorModel.actorName || counterparty.name).slice(0, 120),
            }
          : buildGenericActorModel(body.openingInput);
    if (body.openingInput) {
      body.openingInput.operatorActor = body.openingInput.operatorActor ?? {
        name: operator.name,
        actorType: "PERSON",
        description: operator.office,
      };
      body.openingInput.counterpartyActor = body.openingInput.counterpartyActor ?? {
        name: counterparty.name,
        actorType: "PERSON",
        description: counterparty.office,
      };
    }

    const created = await createDecisionSimulationJob({
      openingInput: body.openingInput,
      requestedRuns: body.requestedRuns,
      actorModel,
      actorModelId: body.actorModelId,
      confirmExpensive: body.confirmExpensive,
      confirmThousand: body.confirmThousand,
    });
    if (!created.ok) {
      return NextResponse.json(created, { status: created.status });
    }

    if (created.inline && created.job) {
      const result = await runDecisionSimulationEnsemble({
        openingInput: body.openingInput,
        actorModel,
        ensemble: { requestedRuns: created.plan.requestedRuns },
        ensembleSeed: `inline-${created.job.id}`,
      });
      const chunks = await prisma.$queryRaw<Array<{ id: string; chunk_ordinal: number; start_run_ordinal: number; end_run_ordinal: number; status: string; attempts: number; completed_runs: number; failed_runs: number; claimed_at: Date | null; error: string | null; input_tokens: number; output_tokens: number; result_snapshot: unknown; ensemble_id: string }>>`
        SELECT * FROM public.decision_simulation_ensemble_chunk WHERE ensemble_id = ${created.job.id} LIMIT 1
      `;
      if (chunks[0]) {
        await completeDecisionSimulationChunk({
          jobId: created.job.id,
          chunk: chunks[0],
          completedRuns: result.completedRuns,
          failedRuns: result.failedRuns,
          inputTokens: result.tokenUsage.inputTokens,
          outputTokens: result.tokenUsage.outputTokens,
          resultSnapshot: { members: result.members, representativeRuns: result.representativeRuns },
          frames: result.dominantMove1Frames.map((row) => ({ frame: row.frame, count: row.count })),
          finals: result.dominantFinalRecommendations.map((row) => ({
            recommendation: row.recommendation,
            count: row.count,
          })),
        });
      }
      const job = await getDecisionSimulationJob(created.job.id);
      return NextResponse.json({
        ok: true,
        execution: "COMPLETE",
        job,
        result,
        estimate: created.estimate,
      });
    }

    if (created.kickWorker && created.job) {
      const origin = requestOrigin(request);
      after(() => {
        void kickDecisionSimulationWorker(created.job.id, origin);
      });
    }

    return NextResponse.json({
      ok: true,
      execution: created.plan.architectureOnly ? "ARCHITECTURE" : "QUEUED",
      job: created.job,
      estimate: created.estimate,
      plan: created.plan,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create simulation job.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

function isUsableActorModel(value: DecisionSimulationActorModel | undefined): value is DecisionSimulationActorModel {
  return Boolean(
    value &&
      typeof value.actorName === "string" &&
      value.actorName.trim() &&
      Array.isArray(value.preferredFrames) &&
      Array.isArray(value.primaryIncentives),
  );
}
