import Link from "next/link";
import {
  EmailWorkflowEscalationLevel,
  EmailWorkflowPriority,
  EmailWorkflowSourceType,
  EmailWorkflowSpamDisposition,
  EmailWorkflowStatus,
} from "@prisma/client";
import { CreateEmailWorkflowItemForm } from "@/components/admin/workbench/CreateEmailWorkflowItemForm";
import { WorkbenchPill } from "@/components/admin/workbench/WorkbenchPill";
import {
  EMAIL_WORKFLOW_NEEDS_ATTENTION_STATUSES,
  EMAIL_WORKFLOW_STATUS_LABELS,
} from "@/lib/email-workflow/governance";
import {
  getEmailWorkflowQueueSummary,
  listEmailWorkflowItems,
} from "@/lib/email-workflow/queries";
import type { EmailWorkflowListFilters } from "@/lib/email-workflow/types";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55";

type Props = {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    sourceType?: string;
    escalationLevel?: string;
    spamDisposition?: string;
    assignee?: string;
  }>;
};

function asEnumValue<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  if (!value) return undefined;
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export default async function EmailWorkflowQueuePage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = asEnumValue(sp.status, Object.values(EmailWorkflowStatus));
  const priority = asEnumValue(sp.priority, Object.values(EmailWorkflowPriority));
  const sourceType = asEnumValue(sp.sourceType, Object.values(EmailWorkflowSourceType));
  const escalationLevel = asEnumValue(sp.escalationLevel, Object.values(EmailWorkflowEscalationLevel));
  const spamDisposition = asEnumValue(sp.spamDisposition, Object.values(EmailWorkflowSpamDisposition));
  const assignee = asEnumValue(sp.assignee, ["assigned", "unassigned"] as const);

  const filters: EmailWorkflowListFilters = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(sourceType ? { sourceType } : {}),
    ...(escalationLevel ? { escalationLevel } : {}),
    ...(spamDisposition ? { spamDisposition } : {}),
    ...(assignee ? { assignedState: assignee } : {}),
  };
  const [items, summary] = await Promise.all([
    listEmailWorkflowItems({ take: 250, filters }),
    getEmailWorkflowQueueSummary(filters),
  ]);
  const needsAttention = items.filter((i) => EMAIL_WORKFLOW_NEEDS_ATTENTION_STATUSES.includes(i.status));
  const remaining = items.filter((i) => !EMAIL_WORKFLOW_NEEDS_ATTENTION_STATUSES.includes(i.status));

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-kelly-text/10 bg-kelly-page/90 px-1 py-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/workbench/email-command-center"
            className="rounded border border-kelly-forest/30 bg-kelly-fog/60 px-2 py-0.5 text-xs font-bold text-kelly-navy"
          >
            Email command center
          </Link>
          <Link
            href="/admin/workbench/email-command-center/gmail/review"
            className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
          >
            Gmail metadata review
          </Link>
          <Link
            href="/admin/workbench"
            className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
          >
            ← Workbench
          </Link>
        </div>
        <p className="max-w-prose font-body text-[10px] text-kelly-text/55">
          Email workflow queue (E-1). All items are review-first; there is no auto-send or auto-approval from this engine.
        </p>
      </div>

      <div className="mb-3 grid gap-1.5 border-b border-kelly-text/10 pb-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border border-kelly-text/10 bg-kelly-page px-2 py-1.5">
          <p className={h2}>New</p>
          <p className="font-heading text-xl font-bold text-kelly-text">{summary.newCount}</p>
        </div>
        <div className="rounded border border-kelly-text/10 bg-kelly-page px-2 py-1.5">
          <p className={h2}>Enriched</p>
          <p className="font-heading text-xl font-bold text-kelly-text">{summary.enrichedCount}</p>
        </div>
        <div className="rounded border border-kelly-text/10 bg-kelly-page px-2 py-1.5">
          <p className={h2}>Ready / reviewed</p>
          <p className="font-heading text-xl font-bold text-kelly-text">{summary.inReviewCount + summary.readyCount}</p>
        </div>
        <div className="rounded border border-kelly-text/10 bg-kelly-page px-2 py-1.5">
          <p className={h2}>Approved</p>
          <p className="font-heading text-xl font-bold text-kelly-text">{summary.approvedCount}</p>
        </div>
        <div className="rounded border border-kelly-text/10 bg-kelly-page px-2 py-1.5">
          <p className={h2}>Escalated</p>
          <p className="font-heading text-xl font-bold text-amber-900">{summary.escalatedCount}</p>
        </div>
        <div className="rounded border border-kelly-text/10 bg-kelly-page px-2 py-1.5">
          <p className={h2}>Unassigned</p>
          <p className="font-heading text-xl font-bold text-kelly-text">{summary.unassignedCount}</p>
        </div>
        <div className="rounded border border-kelly-text/10 bg-kelly-page px-2 py-1.5">
          <p className={h2}>Needs attention</p>
          <p className="font-heading text-xl font-bold text-kelly-navy">{summary.needsAttentionCount}</p>
        </div>
        <div className="rounded border border-kelly-text/10 bg-kelly-page px-2 py-1.5">
          <p className={h2}>Total shown</p>
          <p className="font-heading text-xl font-bold text-kelly-text">{summary.total}</p>
        </div>
      </div>

      <form className="mb-3 grid gap-1.5 rounded border border-kelly-text/10 bg-white/70 p-2 sm:grid-cols-2 xl:grid-cols-6">
        <label className="text-[10px] font-bold uppercase text-kelly-text/55">
          Status
          <select name="status" defaultValue={status ?? ""} className="mt-0.5 w-full border border-kelly-text/15 bg-white px-1 py-1 text-xs">
            <option value="">All</option>
            {Object.values(EmailWorkflowStatus).map((v) => (
              <option key={v} value={v}>
                {EMAIL_WORKFLOW_STATUS_LABELS[v]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[10px] font-bold uppercase text-kelly-text/55">
          Priority
          <select name="priority" defaultValue={priority ?? ""} className="mt-0.5 w-full border border-kelly-text/15 bg-white px-1 py-1 text-xs">
            <option value="">All</option>
            {Object.values(EmailWorkflowPriority).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[10px] font-bold uppercase text-kelly-text/55">
          Source
          <select name="sourceType" defaultValue={sourceType ?? ""} className="mt-0.5 w-full border border-kelly-text/15 bg-white px-1 py-1 text-xs">
            <option value="">All</option>
            {Object.values(EmailWorkflowSourceType).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[10px] font-bold uppercase text-kelly-text/55">
          Escalation
          <select
            name="escalationLevel"
            defaultValue={escalationLevel ?? ""}
            className="mt-0.5 w-full border border-kelly-text/15 bg-white px-1 py-1 text-xs"
          >
            <option value="">All</option>
            {Object.values(EmailWorkflowEscalationLevel).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[10px] font-bold uppercase text-kelly-text/55">
          Spam
          <select
            name="spamDisposition"
            defaultValue={spamDisposition ?? ""}
            className="mt-0.5 w-full border border-kelly-text/15 bg-white px-1 py-1 text-xs"
          >
            <option value="">All</option>
            {Object.values(EmailWorkflowSpamDisposition).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[10px] font-bold uppercase text-kelly-text/55">
          Assignment
          <select name="assignee" defaultValue={assignee ?? ""} className="mt-0.5 w-full border border-kelly-text/15 bg-white px-1 py-1 text-xs">
            <option value="">All</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </label>
        <div className="sm:col-span-2 xl:col-span-6 flex items-center gap-2">
          <button type="submit" className="rounded border border-kelly-text/20 bg-kelly-page px-2 py-1 text-xs font-semibold text-kelly-text">
            Apply filters
          </button>
          <Link href="/admin/workbench/email-queue" className="text-xs font-semibold text-kelly-slate hover:underline">
            Reset
          </Link>
        </div>
      </form>

      <div className="overflow-x-auto border-b border-kelly-text/10">
        <table className="w-full min-w-[900px] border-collapse font-body text-xs">
          <thead>
            <tr className="border-b border-kelly-text/10 text-left text-[10px] font-bold uppercase text-kelly-text/50">
              <th className="p-1.5">Status / priority</th>
              <th className="p-1.5">Who / what / why (summary)</th>
              <th className="p-1.5">Impact / recommended</th>
              <th className="p-1.5">Assignment / source</th>
              <th className="p-1.5">Occurred / updated</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-3 text-kelly-text/60">
                  No email workflow items yet. Use the form below to add a manual item, or connect triggers in a later
                  packet.
                </td>
              </tr>
            ) : (
              <>
                {needsAttention.length > 0 ? (
                  <tr>
                    <td colSpan={5} className="bg-kelly-page/40 px-1.5 py-1 text-[10px] font-bold uppercase text-kelly-navy">
                      Needs attention ({needsAttention.length})
                    </td>
                  </tr>
                ) : null}
                {needsAttention.map((r) => (
                  <tr key={r.id} className="border-b border-kelly-text/5 align-top bg-amber-50/35">
                    <td className="p-1.5">
                      <Link href={`/admin/workbench/email-queue/${r.id}`} className="font-semibold text-kelly-slate hover:underline">
                        {EMAIL_WORKFLOW_STATUS_LABELS[r.status]}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-kelly-text/55">
                        <WorkbenchPill variant={r.escalationLevel === "HIGH" || r.escalationLevel === "CRITICAL" ? "warn" : "accent"}>
                          {r.priority}
                        </WorkbenchPill>
                        <span>esc {r.escalationLevel}</span>
                      </div>
                    </td>
                    <td className="p-1.5">
                      <div className="line-clamp-2 font-medium text-kelly-text">{r.whoSummary || r.title || "—"}</div>
                      <div className="line-clamp-2 text-kelly-text/70">{r.whatSummary}</div>
                      <div className="line-clamp-2 text-[10px] text-kelly-text/60">{r.whySummary}</div>
                    </td>
                    <td className="p-1.5">
                      <div className="line-clamp-2 text-kelly-text/80">{r.impactSummary}</div>
                      <div className="line-clamp-2 text-[10px] text-kelly-text/55">{r.recommendedResponseSummary}</div>
                    </td>
                    <td className="p-1.5 text-[10px] text-kelly-text/65">
                      <div className="font-semibold text-kelly-text/80">
                        {r.assignedTo ? r.assignedTo.nameLabel ?? r.assignedTo.email : "Unassigned"}
                      </div>
                      <div>
                        {r.sourceType} / {r.triggerType}
                      </div>
                      {r.linkHints.planTitle ? <div>Plan: {r.linkHints.planTitle}</div> : null}
                    </td>
                    <td className="p-1.5 text-[10px] text-kelly-text/55">
                      <div>{r.occurredAt ? `Occurred ${r.occurredAt.slice(0, 16).replace("T", " ")}` : "Occurred —"}</div>
                      <div>Updated {r.updatedAt.slice(0, 16).replace("T", " ")}</div>
                    </td>
                  </tr>
                ))}
                {remaining.length > 0 ? (
                  <tr>
                    <td colSpan={5} className="bg-white px-1.5 py-1 text-[10px] font-bold uppercase text-kelly-text/55">
                      Other queue items ({remaining.length})
                    </td>
                  </tr>
                ) : null}
                {remaining.map((r) => (
                <tr key={r.id} className="border-b border-kelly-text/5 align-top">
                  <td className="p-1.5">
                    <Link href={`/admin/workbench/email-queue/${r.id}`} className="font-semibold text-kelly-slate hover:underline">
                      {EMAIL_WORKFLOW_STATUS_LABELS[r.status]}
                    </Link>
                    <div className="mt-0.5 text-[10px] text-kelly-text/55">
                      {r.priority} · esc {r.escalationLevel} · {r.spamDisposition}
                    </div>
                  </td>
                  <td className="p-1.5">
                    <div className="line-clamp-2 font-medium text-kelly-text">{r.whoSummary || r.title || "—"}</div>
                    <div className="line-clamp-2 text-kelly-text/70">{r.whatSummary}</div>
                    <div className="line-clamp-2 text-[10px] text-kelly-text/60">{r.whySummary}</div>
                  </td>
                  <td className="p-1.5">
                    <div className="line-clamp-2 text-kelly-text/80">{r.impactSummary}</div>
                    <div className="line-clamp-2 text-[10px] text-kelly-text/55">{r.recommendedResponseSummary}</div>
                  </td>
                  <td className="p-1.5 text-[10px] text-kelly-text/65">
                    <div className="font-semibold text-kelly-text/80">
                      {r.assignedTo ? r.assignedTo.nameLabel ?? r.assignedTo.email : "Unassigned"}
                    </div>
                    <div>{r.sourceType} / {r.triggerType}</div>
                    {r.linkHints.planTitle ? <div>Plan: {r.linkHints.planTitle}</div> : null}
                  </td>
                  <td className="p-1.5 text-[10px] text-kelly-text/55">
                    <div>{r.occurredAt ? `Occurred ${r.occurredAt.slice(0, 16).replace("T", " ")}` : "Occurred —"}</div>
                    <div>Updated {r.updatedAt.slice(0, 16).replace("T", " ")}</div>
                  </td>
                </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 border-t border-kelly-text/10 pt-3" id="create-manual">
        <h2 className="font-heading text-sm font-bold text-kelly-text">Add a manual queue item</h2>
        <p className="mt-0.5 font-body text-xs text-kelly-text/60">
          Manual rows use source <code className="rounded bg-kelly-text/5 px-0.5">MANUAL</code> and land in the queue for
          operator review. Linked threads and sends can be added when integrating triggers.
        </p>
        <div className="mt-3">
          <h3 className={h2 + " mb-1"}>Context</h3>
          <CreateEmailWorkflowItemForm />
        </div>
      </div>
    </div>
  );
}
