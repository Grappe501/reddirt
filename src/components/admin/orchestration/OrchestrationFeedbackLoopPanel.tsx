"use client";

import { useState } from "react";
import type { OrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";
import type {
  LessonApproval,
  LessonApprovalStatus,
  RecommendationOutcomeSource,
  RecommendationOutcomeStatus,
} from "@/lib/agents/orchestration/feedback/orchestration-feedback-types";
import type { CampaignDomainId } from "@/lib/agents/orchestration/campaign-state-types";

type MutationState = "idle" | "saving" | "saved" | "error";

async function postJson(url: string, body: unknown): Promise<boolean> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export function OrchestrationFeedbackLoopPanel({ payload }: { payload: OrchestrationStatePayload }) {
  const [status, setStatus] = useState<MutationState>("idle");
  const feedback = payload.campaignState.feedbackLoop;
  const topMoves = payload.topMoves.slice(0, 3);
  const prepared = payload.agentTooling.preparedActions.slice(0, 3);
  const tools = payload.agentTooling.topRecommendedTools.slice(0, 3);

  const saveOutcome = async (input: {
    recommendationId: string;
    recommendationTitle: string;
    source: RecommendationOutcomeSource;
    domain: CampaignDomainId;
    status: RecommendationOutcomeStatus;
    outcomeSummary?: string;
  }) => {
    setStatus("saving");
    const ok = await postJson("/api/agents/orchestration-feedback", {
      ...input,
      ownerRole: payload.meta.role,
      proposedAt: payload.generatedAt,
      decidedBy: payload.meta.role,
      followupNeeded: input.status === "failed" || input.status === "needs_revision",
      safetyNotes: ["Dashboard feedback control only", "No execution action triggered"],
    });
    setStatus(ok ? "saved" : "error");
  };

  const saveApproval = async (lesson: LessonApproval, approvalStatus: LessonApprovalStatus) => {
    setStatus("saving");
    const ok = await postJson("/api/agents/lesson-approvals", {
      ...lesson,
      approvalStatus,
      reviewedBy: payload.meta.role,
      reviewedAt: new Date().toISOString(),
      promotedToCampaignMemory: approvalStatus === "approved",
      reviewerNotes: `Dashboard marked ${approvalStatus}`,
    });
    setStatus(ok ? "saved" : "error");
  };

  const outcomeButtons = (args: {
    recommendationId: string;
    recommendationTitle: string;
    source: RecommendationOutcomeSource;
    domain: CampaignDomainId;
  }) => (
    <div className="mt-2 flex flex-wrap gap-1">
      {(["accepted", "rejected", "completed", "failed", "needs_revision"] as RecommendationOutcomeStatus[]).map((s) => (
        <button
          key={s}
          type="button"
          className="rounded border px-2 py-1 text-[10px] font-bold uppercase text-kelly-navy hover:bg-kelly-page"
          onClick={() =>
            saveOutcome({
              ...args,
              status: s,
              outcomeSummary: `Human marked ${args.recommendationTitle} as ${s}.`,
            })
          }
        >
          {s.replaceAll("_", " ")}
        </button>
      ))}
    </div>
  );

  return (
    <section className="rounded-2xl border border-purple-900/15 bg-gradient-to-br from-purple-50/50 to-white p-5">
      <h2 className="text-sm font-bold text-kelly-navy">Feedback + Lesson Approval Loop</h2>
      <p className="mt-2 text-sm text-kelly-muted">{feedback.learningSummary}</p>
      <p className="mt-1 text-xs font-bold text-amber-900">
        Feedback controls write only to the learning store. They do not execute email, SMS, calendar, finance, export, or memory promotion actions.
      </p>
      {status !== "idle" ? (
        <p className={`mt-2 text-xs font-bold ${status === "error" ? "text-red-700" : "text-kelly-muted"}`}>
          {status === "saving" ? "Saving feedback..." : status === "saved" ? "Saved feedback record." : "Feedback save failed."}
        </p>
      ) : null}

      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Pending</dt>
          <dd className="text-lg font-bold text-kelly-navy">{feedback.feedbackHealth.pendingCount}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Approved lessons</dt>
          <dd className="text-lg font-bold text-kelly-navy">{feedback.feedbackHealth.approvedLessonCount}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Ignored</dt>
          <dd className="text-lg font-bold text-kelly-navy">{feedback.feedbackHealth.ignoredCount}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Failed</dt>
          <dd className="text-lg font-bold text-kelly-navy">{feedback.feedbackHealth.failedCount}</dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Top moves awaiting feedback</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {topMoves.map((m) => (
              <li key={m.rank} className="rounded-lg border px-2 py-1.5">
                <span className="font-bold">{m.title}</span>
                <p className="text-kelly-muted">{m.whyThisMatters}</p>
                {outcomeButtons({
                  recommendationId: `top-move-${m.rank}`,
                  recommendationTitle: m.title,
                  source: "top_move",
                  domain: m.domainId,
                })}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Prepared actions awaiting feedback</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {prepared.length === 0 ? (
              <li className="text-kelly-muted">No prepared actions.</li>
            ) : (
              prepared.map((a) => (
                <li key={a.id} className="rounded-lg border px-2 py-1.5">
                  <span className="font-bold">{a.title}</span>
                  <p className="text-kelly-muted">{a.approvalPrompt}</p>
                  <p className="font-bold text-amber-900">Execution disabled</p>
                  {outcomeButtons({
                    recommendationId: a.id,
                    recommendationTitle: a.title,
                    source: "prepared_action",
                    domain: a.domain,
                  })}
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Tool recommendations awaiting feedback</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {tools.map((t) => (
              <li key={t.id} className="rounded-lg border px-2 py-1.5">
                <span className="font-bold">{t.title}</span>
                <p className="text-kelly-muted">{t.whyNow}</p>
                {outcomeButtons({
                  recommendationId: t.id,
                  recommendationTitle: t.title,
                  source: "tool_recommendation",
                  domain: t.domain,
                })}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Pending lesson approvals</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {feedback.pendingLessonApprovals.length === 0 ? (
              <li className="text-kelly-muted">No pending lesson approvals.</li>
            ) : (
              feedback.pendingLessonApprovals.slice(0, 5).map((l) => (
                <li key={l.id} className="rounded-lg border px-2 py-1.5">
                  <span className="font-bold">{l.lessonTitle}</span>
                  <p className="text-kelly-muted">
                    {l.lessonType.replaceAll("_", " ")} · {l.sensitivity}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(["approved", "rejected", "archived", "needs_more_evidence"] as LessonApprovalStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="rounded border px-2 py-1 text-[10px] font-bold uppercase text-kelly-navy hover:bg-kelly-page"
                        onClick={() => saveApproval(l, s)}
                      >
                        {s.replaceAll("_", " ")}
                      </button>
                    ))}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Recent outcomes</h3>
          <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
            {feedback.recentOutcomes.slice(0, 6).map((o) => (
              <li key={o.id}>
                <span className="font-bold">{o.status.replaceAll("_", " ")}</span>: {o.recommendationTitle}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Repeated failure patterns</h3>
          <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
            {feedback.failedPatterns.length === 0 ? (
              <li>No repeated failure patterns detected.</li>
            ) : (
              feedback.failedPatterns.map((p) => <li key={`${p.source}-${p.domain}`}>{p.summary}</li>)
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
