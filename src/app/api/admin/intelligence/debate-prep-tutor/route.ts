import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  buildDebatePrepTutorSession,
  buildCheckMyRecordTutorContent,
  critiqueTutorPracticeAnswer,
  generateSocraticCoachMessage,
} from "@/lib/intelligence/v4/debatePrepTutorOrchestrator";
import { listTutorModes } from "@/lib/intelligence/v4/debatePrepTutorPackage";
import { getDrillQueueCards, resolveDrillQueueId } from "@/lib/intelligence/v4/phase16P3DrillQueue";
import { runCopilotWithLlmDraftQueue } from "@/lib/intelligence/aiCopilotOrchestrator";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

const startSchema = z.object({
  action: z.literal("start-session"),
  mode: z.enum(["panic-5", "tonight-15", "deep-30", "check-my-record", "three-way-panel"]),
});

const critiqueSchema = z.object({
  action: z.literal("critique-answer"),
  cardId: z.string().min(1),
  queueId: z.string().optional(),
  practiceAnswer: z.string().min(5).max(3000),
  topic: z.string().optional(),
});

const coachSchema = z.object({
  action: z.literal("coach-turn"),
  cardId: z.string().min(1),
  queueId: z.string().optional(),
  turnIndex: z.number().int().min(0).max(5),
  mode: z.enum(["panic-5", "tonight-15", "deep-30", "check-my-record", "three-way-panel"]),
});

const toolSchema = z.object({
  action: z.literal("run-tool"),
  toolId: z.string().min(1),
  topic: z.string().optional(),
});

const bodySchema = z.discriminatedUnion("action", [
  startSchema,
  critiqueSchema,
  coachSchema,
  toolSchema,
  z.object({ action: z.literal("list-modes") }),
  z.object({ action: z.literal("check-my-record-content") }),
]);

function findCard(cardId: string, queueId?: string) {
  const qid = resolveDrillQueueId(queueId);
  return getDrillQueueCards(qid).find((c) => c.cardId === cardId);
}

export async function GET() {
  const denied = await assertAdminApi();
  if (denied) return denied;

  return NextResponse.json({
    ok: true,
    route: "debate-prep-tutor",
    version: "tutor-v1.0",
    modes: listTutorModes(),
    governance: "NON_PUBLISHABLE · HUMAN_REVIEW · stage-safe gates enforced",
  });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const ip = clientIp(req);
  const rl = rateLimit(`debate-prep-tutor:${ip}`, 40, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;

  try {
    if (body.action === "list-modes") {
      return NextResponse.json({ ok: true, modes: listTutorModes() });
    }

    if (body.action === "check-my-record-content") {
      return NextResponse.json({ ok: true, content: buildCheckMyRecordTutorContent() });
    }

    if (body.action === "start-session") {
      const session = buildDebatePrepTutorSession(body.mode);
      return NextResponse.json({ ok: true, session });
    }

    if (body.action === "coach-turn") {
      const card = findCard(body.cardId, body.queueId);
      if (!card) {
        return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 });
      }
      const message = await generateSocraticCoachMessage(card, body.turnIndex, body.mode);
      return NextResponse.json({ ok: true, coachMessage: message, cardId: body.cardId });
    }

    if (body.action === "critique-answer") {
      const card = findCard(body.cardId, body.queueId);
      if (!card) {
        return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 });
      }
      const critique = await critiqueTutorPracticeAnswer(card, body.practiceAnswer, body.topic);
      return NextResponse.json({ ok: true, critique, cardId: body.cardId });
    }

    if (body.action === "run-tool") {
      const result = runCopilotWithLlmDraftQueue(body.toolId, {
        topic: body.topic ?? "debate prep tutor session",
        generatedForRoute: "/admin/intelligence/debate-prep-tutor",
        attemptLlm: false,
      });
      if (!result) {
        return NextResponse.json({ ok: false, error: "tool_failed" }, { status: 500 });
      }
      return NextResponse.json({
        ok: true,
        toolId: body.toolId,
        output: result.deterministic,
        llmDraftId: result.llmDraftId,
      });
    }

    return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
  } catch (e) {
    console.error("[debate-prep-tutor]", e);
    const detail = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ ok: false, error: "tutor_failed", message: detail }, { status: 500 });
  }
}
