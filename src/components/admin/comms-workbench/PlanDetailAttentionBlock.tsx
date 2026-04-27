import Link from "next/link";
import { COMMS_PLAN_SECTION, commsPlanPath } from "@/lib/comms-workbench/comms-nav";
import type { CommunicationPlanDetail } from "@/lib/comms-workbench/dto";

const card = "rounded-md border border-kelly-text/10 bg-amber-50/35 p-3 shadow-sm";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55";

export function PlanDetailAttentionBlock({ plan }: { plan: CommunicationPlanDetail }) {
  const { review, sendSummary, opsSummary } = plan;
  const items: { key: string; text: string; action?: { label: string; href: string } }[] = [];

  if (opsSummary.hasDraftOrVariantWorkButNoApprovedSendSource && !review.hasDraftsReadyForReview && !review.hasVariantsReadyForReview) {
    items.push({
      key: "no-approved",
      text: "There are drafts or variants, but nothing is approved for sends yet. Approve an asset, or request review, before planning delivery.",
      action: { label: "Open drafts", href: commsPlanPath(plan.id, COMMS_PLAN_SECTION.drafts) },
    });
  }

  if (review.hasDraftsReadyForReview) {
    items.push({
      key: "drafts-review",
      text: "One or more drafts are ready for review before you can add sends for those assets.",
      action: { label: "Go to review", href: commsPlanPath(plan.id, COMMS_PLAN_SECTION.review) },
    });
  }
  if (review.hasVariantsReadyForReview) {
    items.push({
      key: "var-review",
      text: "One or more variants are in review. Approve a variant to target it on a planned send.",
      action: { label: "Go to review", href: commsPlanPath(plan.id, COMMS_PLAN_SECTION.review) },
    });
  }
  if (sendSummary.failedCount > 0) {
    items.push({
      key: "failed",
      text: `Send execution: ${sendSummary.failedCount} failed. Check outcomes and the planned send row for details.`,
      action: { label: "View planned sends", href: commsPlanPath(plan.id, COMMS_PLAN_SECTION.sends) },
    });
  }
  const inFlight = sendSummary.queuedCount + sendSummary.sendingCount;
  if (inFlight > 0) {
    items.push({
      key: "inflight",
      text: `Delivery in progress: ${sendSummary.queuedCount} queued, ${sendSummary.sendingCount} sending.`,
      action: { label: "View execution", href: commsPlanPath(plan.id, COMMS_PLAN_SECTION.execution) },
    });
  }

  return (
    <section id={COMMS_PLAN_SECTION.attention} className={card} aria-label="What needs attention">
      <h2 className={h2}>What needs attention</h2>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-kelly-text/75">Nothing urgent on this plan—review, queue, and send as needed.</p>
      ) : (
        <ul className="mt-1.5 space-y-1.5 text-sm text-kelly-text/90">
          {items.map((it) => (
            <li key={it.key} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
              <span>{it.text}</span>
              {it.action ? (
                <Link
                  href={it.action.href}
                  className="shrink-0 text-xs font-semibold text-kelly-slate hover:underline"
                  prefetch={false}
                >
                  {it.action.label} →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
