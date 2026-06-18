import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildDebatePrepTutorSession,
  buildCheckMyRecordTutorContent,
  critiqueTutorPracticeAnswer,
  generateSocraticCoachMessage,
} from "@/lib/intelligence/v4/debatePrepTutorOrchestrator";
import {
  buildProfessorTutorSession,
  critiqueProfessorPracticeAnswer,
} from "@/lib/intelligence/v4/debatePrepProfessorOrchestrator";
import { listTutorModes } from "@/lib/intelligence/v4/debatePrepTutorPackage";
import { listProfessorModes } from "@/lib/intelligence/v4/debatePrepProfessorV5";
import { DEBATE_PREP_TUTOR_V5_VERSION, getTutorHubGuides } from "@/lib/intelligence/v4/debatePrepTutorGuideV5";
import { getDrillQueueCards, resolveDrillQueueId } from "@/lib/intelligence/v4/phase16P3DrillQueue";
import { runCopilotWithLlmDraftQueue } from "@/lib/intelligence/aiCopilotOrchestrator";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const startSchema = z.object({
  action: z.literal("start-session"),
  mode: z.enum(["panic-5", "tonight-15", "deep-30", "check-my-record", "three-way-panel"]),
});

const professorStartSchema = z.object({
  action: z.literal("start-professor-session"),
  mode: z.enum(["office-hours-10", "seminar-25", "moot-court-45", "forensic-audit"]),
  topic: z.string().optional(),
});

const critiqueSchema = z.object({
  action: z.literal("critique-answer"),
  cardId: z.string().min(1),
  queueId: z.string().optional(),
  practiceAnswer: z.string().min(5).max(3000),
  topic: z.string().optional(),
});

const professorCritiqueSchema = z.object({
  action: z.literal("critique-professor-answer"),
  cardId: z.string().min(1),
  queueId: z.string().optional(),
  practiceAnswer: z.string().min(5).max(3000),
  topic: z.string().optional(),
  moot: z.boolean().optional(),
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
  professorStartSchema,
  critiqueSchema,
  professorCritiqueSchema,
  coachSchema,
  toolSchema,
  z.object({ action: z.literal("list-modes") }),
  z.object({ action: z.literal("list-professor-modes") }),
  z.object({ action: z.literal("check-my-record-content") }),
]);

function findCard(cardId: string, queueId?: string) {
  const qid = resolveDrillQueueId(queueId);
  return getDrillQueueCards(qid).find((c) => c.cardId === cardId);
}

export function getDebatePrepTutorPayload() {
  return {
    ok: true as const,
    route: "debate-prep-tutor",
    version: DEBATE_PREP_TUTOR_V5_VERSION,
    legacyVersion: "tutor-v1.0",
    modes: listTutorModes(),
    professorModes: listProfessorModes(),
    guides: getTutorHubGuides(),
    governance: "NON_PUBLISHABLE · HUMAN_REVIEW · stage-safe gates enforced",
  };
}

export async function handleDebatePrepTutorPost(
  req: Request,
  opts?: { generatedForRoute?: string; rateLimitKey?: string },
): Promise<Response> {
  const ip = clientIp(req);
  const rlKey = opts?.rateLimitKey ?? `debate-prep-tutor:${ip}`;
  const rl = rateLimit(rlKey, 40, 60_000);
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
  const generatedForRoute = opts?.generatedForRoute ?? "/admin/intelligence/debate-prep-tutor";

  try {
    if (body.action === "list-modes") {
      return NextResponse.json({ ok: true, modes: listTutorModes() });
    }

    if (body.action === "list-professor-modes") {
      return NextResponse.json({ ok: true, professorModes: listProfessorModes() });
    }

    if (body.action === "check-my-record-content") {
      return NextResponse.json({ ok: true, content: buildCheckMyRecordTutorContent() });
    }

    if (body.action === "start-session") {
      const session = buildDebatePrepTutorSession(body.mode);
      return NextResponse.json({ ok: true, session });
    }

    if (body.action === "start-professor-session") {
      const session = buildProfessorTutorSession(body.mode, body.topic ?? "debate prep");
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

    if (body.action === "critique-professor-answer") {
      const card = findCard(body.cardId, body.queueId);
      if (!card) {
        return NextResponse.json({ ok: false, error: "card_not_found" }, { status: 404 });
      }
      const critique = await critiqueProfessorPracticeAnswer(card, body.practiceAnswer, {
        moot: body.moot,
        topic: body.topic,
      });
      return NextResponse.json({ ok: true, critique, cardId: body.cardId });
    }

    if (body.action === "run-tool") {
      const result = runCopilotWithLlmDraftQueue(body.toolId, {
        topic: body.topic ?? "debate prep tutor session",
        generatedForRoute,
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
