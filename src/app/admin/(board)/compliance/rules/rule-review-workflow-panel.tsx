import Link from "next/link";
import { buildRuleReviewWorkflow } from "@/lib/compliance/knowledge/build-rule-review-workflow";

export async function RuleReviewWorkflowPanel({ focusTopicId }: { focusTopicId?: string }) {
  const workflow = await buildRuleReviewWorkflow();

  return (
    <section className="rounded-2xl border border-[#0f2744]/20 bg-slate-50 p-5">
      <h2 className="font-heading text-xl font-bold text-[#0f2744]">Rule review decision workflow</h2>
      <p className="mt-2 text-sm text-slate-700">{workflow.operatorSummary}</p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-500">Queue items</dt>
          <dd className="font-bold">{workflow.totalQueueItems}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Topics pending Rules review</dt>
          <dd className="font-bold text-amber-800">{workflow.topicsPendingReview}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Ready for workbench</dt>
          <dd className="font-bold text-emerald-800">{workflow.itemsReadyForWorkbench}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-slate-600">Batch approval stays blocked for rule_review. Review each topic on this page, then approve queue items individually.</p>
      <ol className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
        {workflow.items.map((item) => {
          const focused = focusTopicId === item.topicId;
          return (
            <li
              key={item.queueItemId}
              className={`rounded-lg border p-3 ${focused ? "border-[#0f2744] bg-white ring-2 ring-[#0f2744]/20" : "border-slate-200 bg-white"}`}
            >
              <p className="font-semibold text-[#0f2744]">{item.topicLabel}</p>
              <p className="text-xs text-slate-500">
                Queue {item.queueStatus} · topic {item.topicReviewed ? `reviewed (${item.reviewedInitials})` : "not reviewed"}
              </p>
              <p className="mt-1 text-slate-700">{item.nextStep}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
                <Link href={item.hrefRules} className="text-[#0f2744] underline">
                  Rules topic
                </Link>
                <Link href={item.hrefQueueItem} className="text-[#0f2744] underline">
                  Queue item
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
