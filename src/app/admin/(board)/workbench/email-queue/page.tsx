import Link from "next/link";
import { CreateEmailWorkflowItemForm } from "@/components/admin/workbench/CreateEmailWorkflowItemForm";
import { listEmailWorkflowItems } from "@/lib/email-workflow/queries";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";

export default async function EmailWorkflowQueuePage() {
  const items = await listEmailWorkflowItems({ take: 200 });

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-deep-soil/10 bg-cream-canvas/90 px-1 py-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/workbench"
            className="rounded border border-deep-soil/15 bg-white px-2 py-0.5 text-xs font-semibold text-civic-slate"
          >
            ← Workbench
          </Link>
        </div>
        <p className="max-w-prose font-body text-[10px] text-deep-soil/55">
          Email workflow queue (E-1). All items are review-first; there is no auto-send or auto-approval from this engine.
        </p>
      </div>

      <div className="overflow-x-auto border-b border-deep-soil/10">
        <table className="w-full min-w-[900px] border-collapse font-body text-xs">
          <thead>
            <tr className="border-b border-deep-soil/10 text-left text-[10px] font-bold uppercase text-deep-soil/50">
              <th className="p-1.5">Status / priority</th>
              <th className="p-1.5">Who / what / why (summary)</th>
              <th className="p-1.5">Impact / recommended</th>
              <th className="p-1.5">Source / triage</th>
              <th className="p-1.5">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-3 text-deep-soil/60">
                  No email workflow items yet. Use the form below to add a manual item, or connect triggers in a later
                  packet.
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="border-b border-deep-soil/5 align-top">
                  <td className="p-1.5">
                    <Link href={`/admin/workbench/email-queue/${r.id}`} className="font-semibold text-civic-slate hover:underline">
                      {r.status}
                    </Link>
                    <div className="text-[10px] text-deep-soil/55">
                      {r.priority} · esc {r.escalationLevel} · {r.spamDisposition}
                    </div>
                  </td>
                  <td className="p-1.5">
                    <div className="line-clamp-2 font-medium text-deep-soil">{r.whoSummary || r.title || "—"}</div>
                    <div className="line-clamp-2 text-deep-soil/70">{r.whatSummary}</div>
                    <div className="line-clamp-2 text-[10px] text-deep-soil/60">{r.whySummary}</div>
                  </td>
                  <td className="p-1.5">
                    <div className="line-clamp-2 text-deep-soil/80">{r.impactSummary}</div>
                    <div className="line-clamp-2 text-[10px] text-deep-soil/55">{r.recommendedResponseSummary}</div>
                  </td>
                  <td className="p-1.5 text-[10px] text-deep-soil/65">
                    {r.sourceType} / {r.triggerType}
                    <div>
                      {r.assignedTo ? `→ ${r.assignedTo.nameLabel ?? r.assignedTo.email}` : "Unassigned"}
                    </div>
                    {r.linkHints.planTitle ? <div>Plan: {r.linkHints.planTitle}</div> : null}
                  </td>
                  <td className="whitespace-nowrap p-1.5 text-[10px] text-deep-soil/55">
                    {r.createdAt.slice(0, 10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 border-t border-deep-soil/10 pt-3" id="create-manual">
        <h2 className="font-heading text-sm font-bold text-deep-soil">Add a manual queue item</h2>
        <p className="mt-0.5 font-body text-xs text-deep-soil/60">
          Manual rows use source <code className="rounded bg-deep-soil/5 px-0.5">MANUAL</code> and land in the queue for
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
