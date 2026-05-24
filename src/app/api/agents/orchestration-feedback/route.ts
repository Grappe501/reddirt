import { NextResponse } from "next/server";
import { buildFeedbackLoopState } from "@/lib/agents/orchestration/feedback/feedback-learning-engine";
import { recordRecommendationOutcome } from "@/lib/agents/orchestration/feedback/recommendation-feedback-service";
import type { RecommendationOutcome } from "@/lib/agents/orchestration/feedback/orchestration-feedback-types";
import { validateRecommendationOutcomeInput } from "@/lib/agents/orchestration/feedback/feedback-safety";

export const dynamic = "force-dynamic";

export async function GET() {
  const feedbackLoop = buildFeedbackLoopState();
  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    feedbackLoop,
    recentRecommendationOutcomes: feedbackLoop.recentOutcomes,
    lessonApprovals: [...feedbackLoop.pendingLessonApprovals, ...feedbackLoop.approvedLessons],
    feedbackSummary: feedbackLoop.domainSummary,
    pendingLessonApprovals: feedbackLoop.pendingLessonApprovals,
    ignoredRecommendations: feedbackLoop.ignoredRecommendations,
    failedRecommendationPatterns: feedbackLoop.failedPatterns,
    safety: {
      readOnly: true,
      postWritesFeedbackOnly: true,
      autoExecutionDisabled: true,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<RecommendationOutcome>;
    const errors = validateRecommendationOutcomeInput(body);
    if (errors.length) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }
    const outcome = recordRecommendationOutcome(body as Parameters<typeof recordRecommendationOutcome>[0]);
    return NextResponse.json({
      ok: true,
      outcome,
      learned: outcome.outcomeSummary ?? outcome.humanFeedback ?? `Human marked ${outcome.recommendationTitle} as ${outcome.status}.`,
      safety: {
        feedbackStoreOnly: true,
        autoExecutionDisabled: true,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not record recommendation outcome";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
