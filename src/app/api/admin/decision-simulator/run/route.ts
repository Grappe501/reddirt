import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
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

function buildGenericActorModel(input: DecisionSimulationOpeningInput): DecisionSimulationActorModel {
  const actorName = input.counterpartyActor?.name?.trim() || "Counterparty";
  return {
    actorName,
    version: "dashboard-generic-actor-1.0",
    effectiveAt: new Date().toISOString(),
    description: input.counterpartyActor?.description || "Generic counterparty model created from dashboard input. Treat all behavioral details as hypotheses unless supported by supplied evidence.",
    primaryIncentives: ["Protect credibility", "Advance strategic objectives", "Avoid unnecessary political or reputational damage"],
    strategicConstraints: ["Public scrutiny", "Incomplete information", "Need to maintain message discipline"],
    preferredFrames: [
      { label: "Defend current position", weight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Reframe the issue", weight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Question the operator's premise", weight: 0.8, confidence: "LOW", sourceState: "HYPOTHESIS" },
    ],
    attackLanes: [
      { label: "Credibility", weight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Motivation", weight: 0.8, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Record or consistency", weight: 0.8, confidence: "LOW", sourceState: "HYPOTHESIS" },
    ],
    defensiveFrames: [
      { label: "Stay on message", weight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Shift to favorable terrain", weight: 0.8, confidence: "LOW", sourceState: "HYPOTHESIS" },
    ],
    escalationTendencies: [
      { label: "Measured counter", probabilityWeight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Aggressive counter", probabilityWeight: 0.6, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Minimal response", probabilityWeight: 0.5, confidence: "LOW", sourceState: "HYPOTHESIS" },
    ],
    deescalationTendencies: [
      { label: "Ignore or deprioritize", probabilityWeight: 0.4, confidence: "LOW", sourceState: "HYPOTHESIS" },
    ],
    communicationStyle: ["Adaptive", "Message disciplined"],
    likelyAudiences: ["General public", "Supporters", "Media"],
    uncertaintyNotes: ["No researched actor profile was supplied; this is a generic hypothesis model."],
  };
}

export async function POST(request: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const ip = clientIp(request);
  const rl = rateLimit(`decision-simulator:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many simulation requests. Try again shortly.", retryAfterMs: rl.retryAfterMs },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as RequestBody;
    const requestedRuns = Number(body.requestedRuns || 1);
    const ensemble = { requestedRuns };
    const plan = planDecisionSimulationEnsemble(ensemble);

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

    const actorModel = body.actorModel ?? buildGenericActorModel(body.openingInput);
    const result = await runDecisionSimulationEnsemble({
      openingInput: body.openingInput,
      actorModel,
      ensemble,
      ensembleSeed: `dashboard-${Date.now()}`,
    });

    return NextResponse.json({ ok: true, execution: "COMPLETE", plan, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown decision simulation error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
