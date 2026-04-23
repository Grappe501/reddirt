import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmailWorkflowItemDetail } from "@/lib/email-workflow/queries";
import { RunEmailWorkflowInterpretationButton } from "@/components/admin/workbench/RunEmailWorkflowInterpretationButton";
import { WorkbenchPill } from "@/components/admin/workbench/WorkbenchPill";
import { EmailWorkflowInterpretationProvenancePanel } from "@/components/admin/email-workflow/EmailWorkflowInterpretationProvenancePanel";

type Props = { params: Promise<{ id: string }> };

const dt = "font-body text-sm text-deep-soil/85";
const dd = "mt-0.5 font-body text-sm text-deep-soil";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-deep-soil/10 py-2 last:border-0">
      <h3 className={h3}>{title}</h3>
      {children}
    </section>
  );
}

function statusPillVariant(status: string): "neutral" | "accent" | "warn" | "muted" {
  if (status === "ENRICHED" || status === "IN_REVIEW" || status === "READY_TO_RESPOND") return "accent";
  if (status === "ESCALATED" || status === "SPAM") return "warn";
  if (status === "CLOSED" || status === "ARCHIVED") return "muted";
  return "neutral";
}

export default async function EmailWorkflowQueueDetailPage({ params }: Props) {
  const { id } = await params;
  const d = await getEmailWorkflowItemDetail(id);
  if (!d) notFound();

  const l = d.linkDetail;
  const rawMeta = d.metadataJson;
  const interpretation =
    rawMeta && typeof rawMeta === "object" && !Array.isArray(rawMeta) && "emailWorkflowInterpretation" in rawMeta
      ? (rawMeta as Record<string, unknown>).emailWorkflowInterpretation
      : null;

  const enriched = d.status === "ENRICHED";

  return (
    <div className="min-w-0 max-w-3xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-deep-soil/10 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/workbench/email-queue"
            className="rounded border border-deep-soil/15 bg-white px-2 py-0.5 text-xs font-semibold text-civic-slate"
          >
            ← Email queue
          </Link>
          <Link href="/admin/workbench" className="text-xs text-deep-soil/60 hover:underline">
            Workbench
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <WorkbenchPill variant={statusPillVariant(d.status)}>{d.status}</WorkbenchPill>
          <WorkbenchPill variant="neutral">{d.priority}</WorkbenchPill>
          <span className="text-[10px] text-deep-soil/45">esc {d.escalationLevel}</span>
          <span className="text-[10px] text-deep-soil/45">{d.spamDisposition}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-heading text-lg font-bold text-deep-soil">{d.title || d.whatSummary || "Email workflow item"}</h1>
        {enriched ? (
          <WorkbenchPill variant="accent" caps={false}>
            Interpretation applied
          </WorkbenchPill>
        ) : null}
      </div>
      {d.queueReason ? (
        <p className="mt-1 font-body text-xs text-deep-soil/70">Queue: {d.queueReason}</p>
      ) : null}

      <div className="mt-3 space-y-2">
        <div className="rounded border border-deep-soil/10 bg-cream-canvas/50 px-2 py-1">
          <p className="text-[10px] text-deep-soil/55">
            Queue-first: interpretation fills <strong className="font-semibold text-deep-soil/70">empty</strong> fields and
            respects non-default triage unless you force overwrite. No send execution or auto-approval.
          </p>
        </div>
        <RunEmailWorkflowInterpretationButton itemId={d.id} />
      </div>

      <div className="mt-2 divide-y divide-deep-soil/10">
        <Section title="Row fields (manual and/or interpretation)">
          <p className="mb-2 text-[10px] text-deep-soil/50">
            Stored on <code className="rounded bg-deep-soil/5 px-0.5">EmailWorkflowItem</code> — may be edited manually
            or filled by the last interpretation run (where not protected).
          </p>
          <dl className="grid gap-2 sm:grid-cols-1">
            <div>
              <dt className={dt}>Who</dt>
              <dd className={dd}>{d.whoSummary ?? "—"}</dd>
            </div>
            <div>
              <dt className={dt}>What</dt>
              <dd className={dd}>{d.whatSummary ?? "—"}</dd>
            </div>
            <div>
              <dt className={dt}>When</dt>
              <dd className={dd}>
                {d.whenSummary ?? "—"}
                {d.occurredAt ? <span className="ml-1 text-[10px] text-deep-soil/50">({d.occurredAt})</span> : null}
              </dd>
            </div>
            <div>
              <dt className={dt}>Where</dt>
              <dd className={dd}>{d.whereSummary ?? "—"}</dd>
            </div>
            <div>
              <dt className={dt}>Why it matters</dt>
              <dd className={dd}>{d.whySummary ?? "—"}</dd>
            </div>
            <div>
              <dt className={dt}>Campaign impact</dt>
              <dd className={dd}>{d.impactSummary ?? "—"}</dd>
            </div>
            <div>
              <dt className={dt}>Recommended response</dt>
              <dd className={dd}>{d.recommendedResponseSummary ?? "—"}</dd>
            </div>
            <div>
              <dt className={dt}>Rationale (recommended response)</dt>
              <dd className={dd}>{d.recommendedResponseRationale ?? "—"}</dd>
            </div>
          </dl>
        </Section>

        <Section title="Last interpretation (provenance)">
          {interpretation != null && typeof interpretation === "object" ? (
            <>
              <EmailWorkflowInterpretationProvenancePanel data={interpretation} />
              <details className="mt-2 text-[10px] text-deep-soil/55">
                <summary className="cursor-pointer font-semibold text-deep-soil/60">Raw interpretation JSON</summary>
                <pre className="mt-1 max-h-40 overflow-auto rounded border border-deep-soil/10 bg-white p-2 text-deep-soil/80">
                  {JSON.stringify(interpretation, null, 2)}
                </pre>
              </details>
            </>
          ) : (
            <p className="text-xs text-deep-soil/55">No interpretation has been written yet. Use “Run interpretation” above.</p>
          )}
        </Section>

        <Section title="Signals (current triage columns)">
          <p className={dt}>
            Intent: {d.intent} · tone: {d.tone} · sentiment: {d.sentiment ?? "—"} · de-escalation:{" "}
            {d.needsDeescalation ? "yes" : "no"}
          </p>
          <p className="mt-1 text-xs text-deep-soil/65">Spam: {d.spamDisposition} · score: {d.spamScore != null ? String(d.spamScore) : "—"}</p>
        </Section>

        <Section title="Review metadata">
          <p className={dt}>
            Created {d.createdAt} · updated {d.updatedAt}
          </p>
          <p className="mt-1 text-xs text-deep-soil/70">
            Reviewer: {d.reviewedBy ? d.reviewedBy.nameLabel ?? d.reviewedBy.email : "—"} · at {d.reviewedAt ?? "—"}
          </p>
        </Section>

        <Section title="Source links (linked records)">
          <p className="mb-1 text-[10px] text-deep-soil/50">Read-only pointers for cross-navigation; not a substitute for row fields above.</p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-deep-soil/80">
            {l.userLabel || l.userId ? (
              <li>
                Contact user: {l.userLabel ?? l.userId}
                {l.volunteerProfileId ? ` · volunteer ${l.volunteerProfileId}` : ""}
              </li>
            ) : null}
            {l.communicationPlan ? (
              <li>
                Plan:{" "}
                <Link
                  className="text-civic-slate underline"
                  href={`/admin/workbench/comms/plans/${l.communicationPlan.id}`}
                >
                  {l.communicationPlan.title}
                </Link>
              </li>
            ) : null}
            {l.thread ? <li>Thread: {l.thread.id} · {l.thread.primaryEmail ?? l.thread.primaryPhone ?? ""}</li> : null}
            {l.communicationSend ? (
              <li>
                Send: {l.communicationSend.id} ({l.communicationSend.status}, {l.communicationSend.channel})
              </li>
            ) : null}
            {l.workflowIntake ? <li>Workflow intake: {l.workflowIntake.id} — {l.workflowIntake.title}</li> : null}
            {l.campaignTask ? <li>Campaign task: {l.campaignTask.title}</li> : null}
            {l.conversationOpportunity ? <li>Conversation opportunity: {l.conversationOpportunity.title}</li> : null}
            {l.socialContentItem ? <li>Social item: {l.socialContentItem.title ?? l.socialContentItem.id}</li> : null}
            {l.comsPlanAudienceSegment ? <li>Segment: {l.comsPlanAudienceSegment.name}</li> : null}
            {l.communicationMessage ? (
              <li>
                Message: {l.communicationMessage.id} · {l.communicationMessage.direction} · {l.communicationMessage.createdAt}
              </li>
            ) : null}
            {!l.userId &&
            !l.communicationPlan &&
            !l.thread &&
            !l.communicationSend &&
            !l.workflowIntake &&
            !l.campaignTask &&
            !l.conversationOpportunity &&
            !l.socialContentItem &&
            !l.comsPlanAudienceSegment &&
            !l.communicationMessage ? (
              <li className="list-none text-deep-soil/55">No linked records on this item.</li>
            ) : null}
          </ul>
        </Section>

        <Section title="Full row metadata (JSON)">
          <pre className="max-h-48 overflow-auto rounded border border-deep-soil/10 bg-white p-2 text-[10px] text-deep-soil/80">
            {JSON.stringify(d.metadataJson, null, 2)}
          </pre>
        </Section>
      </div>
    </div>
  );
}
