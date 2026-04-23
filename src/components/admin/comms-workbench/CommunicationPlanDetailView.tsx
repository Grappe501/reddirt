import Link from "next/link";
import { CommunicationPlanExecutionBlock } from "@/components/admin/comms-workbench/CommunicationPlanExecutionBlock";
import { CommsPlanDraftsPanel } from "@/components/admin/comms-workbench/CommsPlanDraftsPanel";
import { CommsPlanSendsPanel } from "@/components/admin/comms-workbench/CommsPlanSendsPanel";
import { CommsPlanVariantsPanel } from "@/components/admin/comms-workbench/CommsPlanVariantsPanel";
import { CommsStatusBadge } from "@/components/admin/comms-workbench/CommsStatusBadge";
import { PlanDetailAttentionBlock } from "@/components/admin/comms-workbench/PlanDetailAttentionBlock";
import { PlanDetailInPageNav } from "@/components/admin/comms-workbench/PlanDetailInPageNav";
import { CommsPlanSegmentsPanel } from "@/components/admin/comms-workbench/CommsPlanSegmentsPanel";
import { COMMS_PLAN_SECTION, COMMS_APP_PATHS, commsMediaPath, commsPlanPath } from "@/lib/comms-workbench/comms-nav";
import { COMMS_EMPTY } from "@/lib/comms-workbench/comms-section-copy";
import type { CommunicationPlanDetail } from "@/lib/comms-workbench/dto";
import { getMediaOutreachStatusDisplay, commsStatusBadgeClass } from "@/lib/comms-workbench/status-display";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

const card = "rounded-md border border-deep-soil/10 bg-white p-3 shadow-sm";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const empty = "rounded border border-dashed border-deep-soil/15 bg-cream-canvas/50 px-3 py-3 text-sm text-deep-soil/60";

function SourceBlock({ plan }: { plan: CommunicationPlanDetail }) {
  const { source } = plan;
  if (source.all.length === 0 && !source.sourceType) {
    return <p className={empty}>{COMMS_EMPTY.noSource}</p>;
  }
  return (
    <div className="space-y-2">
      {source.sourceType ? (
        <p className="text-xs text-deep-soil/70">
          <span className="font-semibold">Recorded source type:</span> {source.sourceType}
        </p>
      ) : null}
      <ul className="space-y-1.5">
        {source.all.map((r) => (
          <li key={r.id} className="rounded border border-deep-soil/8 bg-cream-canvas/30 px-2 py-1.5 text-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/45">
              {formatCommsFieldLabel(r.kind)}
            </span>
            <p className="font-medium text-deep-soil">{r.sourceLabel}</p>
            {r.sourceSubtitle ? <p className="text-xs text-deep-soil/65">{r.sourceSubtitle}</p> : null}
            <p className="text-[10px] text-deep-soil/45">id: {r.id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommunicationPlanDetailView({ plan }: { plan: CommunicationPlanDetail }) {
  return (
    <div className="min-w-0 space-y-5">
      <header className="border-b border-deep-soil/10 pb-3">
        <p className={h2}>Communication plan</p>
        <h1 className="font-heading text-2xl font-bold text-deep-soil">{plan.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-deep-soil/80">
          <span className="rounded border border-deep-soil/12 bg-cream-canvas px-2 py-0.5">
            {formatCommsFieldLabel(plan.objective)}
          </span>
          <CommsStatusBadge segment="plan" status={plan.status} />
          <span className="rounded border border-deep-soil/12 bg-cream-canvas px-2 py-0.5">
            Priority: {formatCommsFieldLabel(plan.priority)}
          </span>
        </div>
        {plan.summary ? <p className="mt-2 max-w-3xl font-body text-sm text-deep-soil/80">{plan.summary}</p> : null}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-deep-soil/80">
          <div>
            <span className={h2}>Owner</span>
            <p className="mt-0.5">{plan.owner ? plan.owner.nameLabel ?? plan.owner.email : "—"}</p>
          </div>
          <div>
            <span className={h2}>Requester</span>
            <p className="mt-0.5">{plan.requester ? plan.requester.nameLabel ?? plan.requester.email : "—"}</p>
          </div>
          <div>
            <span className={h2}>Due</span>
            <p className="mt-0.5">{plan.dueAt ? new Date(plan.dueAt).toLocaleString() : "—"}</p>
          </div>
          <div>
            <span className={h2}>Scheduled (plan)</span>
            <p className="mt-0.5">{plan.scheduledAt ? new Date(plan.scheduledAt).toLocaleString() : "—"}</p>
          </div>
          <div>
            <span className={h2}>Approved (plan)</span>
            <p className="mt-0.5">{plan.approvedAt ? new Date(plan.approvedAt).toLocaleString() : "—"}</p>
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-[11px] text-deep-soil/55">
          Plan “approved” is separate from a draft/variant “approved” (copy) and a send “sent” (delivery). This page walks the full
          lifecycle: source → review → drafts/variants → planned sends → execution.
        </p>
      </header>

      <PlanDetailInPageNav planId={plan.id} />

      <PlanDetailAttentionBlock plan={plan} />

      <section id={COMMS_PLAN_SECTION.source} className={card}>
        <h2 className={h2}>Source provenance</h2>
        <p className="mb-1 text-xs text-deep-soil/60">Why this plan exists in the workbench: linked intakes, tasks, events, or social content.</p>
        <div className="mt-1">
          <SourceBlock plan={plan} />
        </div>
      </section>

      <section id={COMMS_PLAN_SECTION.review} className={card}>
        <h2 className={h2}>Review summary</h2>
        <p className="mb-1 text-xs text-deep-soil/60">
          Copy review state for drafts and variants. Assets must be approved before they appear in planned sends.
        </p>
        <ul className="mt-1 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          <li>Drafts in review: {plan.review.hasDraftsReadyForReview ? "Yes" : "No"}</li>
          <li>Variants in review: {plan.review.hasVariantsReadyForReview ? "Yes" : "No"}</li>
          <li>Approved drafts: {plan.review.approvedDraftCount}</li>
          <li>Approved variants: {plan.review.approvedVariantCount}</li>
          <li>Rejected drafts: {plan.review.rejectedDraftCount}</li>
          <li>Rejected variants: {plan.review.rejectedVariantCount}</li>
          <li>Last review request: {plan.review.latestReviewRequestedAt ? new Date(plan.review.latestReviewRequestedAt).toLocaleString() : "—"}</li>
          <li>Last reviewed: {plan.review.latestReviewedAt ? new Date(plan.review.latestReviewedAt).toLocaleString() : "—"}</li>
        </ul>
        <p className="mt-2 text-xs text-deep-soil/55">
          <Link className="font-semibold text-civic-slate" href={commsPlanPath(plan.id, COMMS_PLAN_SECTION.drafts)}>
            Jump to drafts
          </Link>{" "}
          or{" "}
          <Link className="font-semibold text-civic-slate" href={commsPlanPath(plan.id, COMMS_PLAN_SECTION.variants)}>
            variants
          </Link>{" "}
          to open review actions.
        </p>
      </section>

      <section id={COMMS_PLAN_SECTION.sendSummary} className={card}>
        <h2 className={h2}>Send summary (tracked)</h2>
        <p className="mb-1 text-xs text-deep-soil/60">Planned and tracked sends for this plan (planning + execution states).</p>
        <ul className="mt-1 grid grid-cols-2 gap-1 text-sm sm:grid-cols-3">
          <li>Total: {plan.sendSummary.sendCount}</li>
          <li>Queued: {plan.sendSummary.queuedCount}</li>
          <li>Scheduled: {plan.sendSummary.scheduledCount}</li>
          <li>Sent: {plan.sendSummary.sentCount}</li>
          <li>Failed: {plan.sendSummary.failedCount}</li>
          <li>Next scheduled: {plan.sendSummary.nextScheduledAt ? new Date(plan.sendSummary.nextScheduledAt).toLocaleString() : "—"}</li>
          <li>Last sent: {plan.sendSummary.lastSentAt ? new Date(plan.sendSummary.lastSentAt).toLocaleString() : "—"}</li>
        </ul>
        <p className="mt-2 text-xs text-deep-soil/55">
          <Link className="font-semibold text-civic-slate" href={commsPlanPath(plan.id, COMMS_PLAN_SECTION.sends)}>
            Open planned sends
          </Link>{" "}
          to add or run sends.
        </p>
      </section>

      <CommunicationPlanExecutionBlock summary={plan.executionSummary} />

      <section id={COMMS_PLAN_SECTION.drafts} className={card}>
        <h2 className={h2}>
          Drafts <span className="font-mono text-deep-soil/50">({plan.draftCount})</span>
        </h2>
        <p className="mb-2 text-xs text-deep-soil/60">
          Base copy per channel. Approve a draft before creating planned sends for it. Use variants for segments without rewriting the
          base.
        </p>
        <CommsPlanDraftsPanel planId={plan.id} drafts={plan.drafts} />
      </section>

      <section id={COMMS_PLAN_SECTION.variants} className={card}>
        <h2 className={h2}>
          Variants <span className="font-mono text-deep-soil/50">({plan.variantCount})</span>
        </h2>
        <p className="mb-2 text-xs text-deep-soil/60">
          Audience- or channel-specific rows. Empty overrides mean “inherit the base draft” for that field.
        </p>
        <CommsPlanVariantsPanel planId={plan.id} drafts={plan.drafts} />
      </section>

      <section id={COMMS_PLAN_SECTION.segments} className={card}>
        <h2 className={h2}>
          Plan audience segments <span className="font-mono text-deep-soil/50">({plan.audienceSegments.length})</span>
        </h2>
        <p className="mb-2 text-xs text-deep-soil/60">
          Campaign-local reusable groups (distinct from broadcast audience segments). Static segments have manual members;
          dynamic segments store rules only — they are not evaluated in this release.
        </p>
        <CommsPlanSegmentsPanel planId={plan.id} segments={plan.audienceSegments} />
      </section>

      <section id={COMMS_PLAN_SECTION.sends} className={card}>
        <h2 className={h2}>
          Planned sends <span className="font-mono text-deep-soil/50">({plan.sends.length})</span>
        </h2>
        <p className="mb-2 text-xs text-deep-soil/60">
          Choose an approved draft or variant, set schedule, then queue for delivery. Outcomes and webhooks are summarized in
          execution intelligence (no raw provider payloads in this view).
        </p>
        <CommsPlanSendsPanel planId={plan.id} sends={plan.sends} drafts={plan.drafts} opsSummary={plan.opsSummary} />
      </section>

      <section id={COMMS_PLAN_SECTION.media} className={card}>
        <h2 className={h2}>
          Media outreach linked here <span className="font-mono text-deep-soil/50">({plan.mediaOutreach.length})</span>
        </h2>
        {plan.mediaOutreach.length === 0 ? (
          <p className={`mt-1 ${empty}`}>{COMMS_EMPTY.noMedia}</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {plan.mediaOutreach.map((m) => {
              const disp = getMediaOutreachStatusDisplay(m.status);
              return (
                <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <Link className="font-semibold text-civic-slate hover:underline" href={commsMediaPath(m.id)}>
                      {m.title}
                    </Link>
                    <span className={`ml-2 ${commsStatusBadgeClass(disp.tone)}`}>{disp.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-2 text-xs text-deep-soil/55">
          <Link href={COMMS_APP_PATHS.media} className="font-semibold text-civic-slate">
            Media workbench
          </Link>{" "}
          lists all PR/media rows.
        </p>
      </section>
    </div>
  );
}
