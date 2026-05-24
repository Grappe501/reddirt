import { NextResponse } from "next/server";
import {
  listApprovedLessons,
  listPendingLessonApprovals,
  loadLessonApprovals,
  recordLessonApproval,
} from "@/lib/agents/orchestration/feedback/lesson-approval-service";
import type { LessonApproval } from "@/lib/agents/orchestration/feedback/orchestration-feedback-types";
import { validateLessonApprovalInput } from "@/lib/agents/orchestration/feedback/feedback-safety";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    lessonApprovals: loadLessonApprovals(),
    pendingLessonApprovals: listPendingLessonApprovals(),
    approvedLessons: listApprovedLessons(),
    safety: {
      readOnly: true,
      autoPromotionDisabled: true,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<LessonApproval>;
    const errors = validateLessonApprovalInput(body);
    if (errors.length) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }
    const approval = recordLessonApproval(body as Parameters<typeof recordLessonApproval>[0]);
    return NextResponse.json({
      ok: true,
      approval,
      learned: `${approval.lessonTitle} marked ${approval.approvalStatus}.`,
      safety: {
        approvalStoreOnly: true,
        sensitiveMemoryAutoStoreDisabled: true,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not record lesson approval";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
