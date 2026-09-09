import { NextResponse } from "next/server";
import {
  planDecisionSimulationEnsemble,
  runDecisionSimulationEnsemble,
  type DecisionSimulationActorModel,
  type DecisionSimulationOpeningInput,
} from "@/lib/agents/decision-simulation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  openingInput: DecisionSimulationOpeningInput;
  requestedRuns: number;
  actorModel?: DecisionSimulationActorModel;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const requestedRuns = Number(body.requestedRuns || 1);
    const plan = planDecisionSimulationEnsemble({ requestedRuns });

    if (!body.openingInput?.message?.trim()) {
      return NextResponse.json({ ok: false, error: "Opening correspondence is required." }, { status: 400 });
    }

    if (plan.requestedRuns > 10) {
      return NextResponse.json({
        ok: true,
        execution: "PLANNED",
        plan,
        message: "This preview safely executes up to 10 live OpenAI simulations per HTTP request. Larger jobs are represented with the production queue/distributed plan and will execute after the worker slice is enabled.",
      });
    }

    const result = await runDecisionSimulationEnsemble({
      openingInput: body.openingInput,
      requestedRuns: plan.requestedRuns,
      actorModel: body.actorModel,
      ensembleSeed: `dashboard-${Date.now()}`,
    });

    return NextResponse.json({ ok: true, execution: "COMPLETE", plan, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown decision simulation error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
