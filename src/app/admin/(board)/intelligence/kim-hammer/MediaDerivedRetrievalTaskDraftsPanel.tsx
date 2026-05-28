import Link from "next/link";
import type { MediaDerivedTaskDraft } from "@/lib/intelligence/mediaFindingPromotionWorkflow";

export function MediaDerivedRetrievalTaskDraftsPanel({
  drafts,
}: {
  drafts: MediaDerivedTaskDraft[];
}) {
  return (
    <section className="mb-6 rounded-xl border border-sky-200/50 bg-sky-50/40 p-4 text-xs">
      <h2 className="text-sm font-bold uppercase tracking-wider text-sky-950">
        Media-Derived Retrieval Task Drafts
      </h2>
      <p className="mt-1 text-sky-900/80">
        Read-only draft task suggestions from media intake. Not active KH-3B tasks until human confirms in
        task workflow.
      </p>
      {drafts.length === 0 ? (
        <p className="mt-3 text-sky-900">No media-derived task drafts yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {drafts.map((row) => (
            <li key={row.draftId} className="rounded-lg border border-sky-900/10 bg-white p-3">
              <p className="font-semibold text-sky-950">{row.suggestedTaskTitle}</p>
              <p className="mt-1 text-[10px] text-sky-900/70">
                {row.draftId} · finding {row.findingId} · {row.suggestedPriority} priority
              </p>
              <p className="mt-2 text-sky-900">
                <strong>Suggested source path:</strong> {row.suggestedSourcePath}
              </p>
              {row.operatorNotes ? (
                <p className="mt-2 text-sky-900">
                  <strong>Operator notes:</strong> {row.operatorNotes}
                </p>
              ) : null}
              <p className="mt-2 text-[10px] text-rose-800">
                {row.publicationSafety} · draft only — NOT an active retrieval task
              </p>
              <Link
                href="/admin/intelligence/media-intake"
                className="mt-2 inline-block font-semibold text-sky-950 underline"
              >
                ← Back to media finding
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
