import Link from "next/link";
import { ComplianceNav, CompliancePageHeader } from "../../components";
import { loadApprovalAuditLog, loadApprovalItems } from "@/lib/compliance/approval/approval-storage";
import { reopenItemFormAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ApprovalHistoryPage() {
  const [log, items] = await Promise.all([loadApprovalAuditLog(), loadApprovalItems()]);
  const itemById = new Map(items.map((item) => [item.id, item]));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="Audit"
        title="Approval action history"
        description="Every save, approve, reject, batch, and reopen is logged with actor initials and timestamps. Undo is not allowed after filing snapshot certification."
      />
      <ComplianceNav />
      <p className="text-sm">
        <Link href="/api/admin/compliance/approval/export" className="font-semibold text-kelly-navy underline" prefetch={false}>
          Export audit log (JSON)
        </Link>
      </p>
      <section className="grid gap-3">
        {log.slice(0, 200).map((entry) => {
          const item = itemById.get(entry.itemId);
          return (
            <article key={entry.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-kelly-wash px-2 py-0.5 text-xs font-bold uppercase">{entry.action}</span>
                  <span className="font-semibold">{entry.actorInitials}</span>
                  <span className="text-kelly-slate">{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
                {item && entry.itemId !== "batch" ? (
                  <form action={reopenItemFormAction}>
                    <input type="hidden" name="itemId" value={entry.itemId} />
                    <input type="hidden" name="queueId" value={entry.queueId} />
                    <input type="hidden" name="initials" value="OP" />
                    <button type="submit" className="rounded-full border border-kelly-navy px-3 py-1 text-xs font-semibold text-kelly-navy">
                      Reopen
                    </button>
                  </form>
                ) : null}
              </div>
              <p className="mt-2">
                Item:{" "}
                {item ? (
                  <Link href={`/admin/compliance/approval/${entry.queueId}/item/${entry.itemId}`} className="font-semibold text-kelly-navy underline">
                    {item.title}
                  </Link>
                ) : (
                  entry.itemId
                )}
              </p>
              {entry.note ? <p className="mt-1 text-kelly-text/75">{entry.note}</p> : null}
              {entry.changedFields?.length ? (
                <p className="mt-1 text-xs">Fields: {entry.changedFields.join(", ")}</p>
              ) : null}
              {entry.voiceTranscript ? <p className="mt-1 text-xs italic">Voice: {entry.voiceTranscript}</p> : null}
              {(entry.before || entry.after) && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold">Before / after</summary>
                  <pre className="mt-1 max-h-40 overflow-auto rounded bg-kelly-wash p-2 text-xs">
                    {JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}
                  </pre>
                </details>
              )}
            </article>
          );
        })}
        {!log.length ? <p className="text-sm text-kelly-text/70">No approval actions logged yet.</p> : null}
      </section>
      <Link href="/admin/compliance/approval" className="text-sm font-semibold text-kelly-navy underline">
        ← Approval hub
      </Link>
    </div>
  );
}
