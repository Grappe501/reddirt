import Link from "next/link";
import type { MediaDerivedCitationCandidate } from "@/lib/intelligence/mediaFindingPromotionWorkflow";

export function MediaDerivedCitationCandidatesPanel({
  candidates,
}: {
  candidates: MediaDerivedCitationCandidate[];
}) {
  return (
    <section className="mb-6 rounded-xl border border-violet-200/50 bg-violet-50/40 p-4 text-xs">
      <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">
        Media-Derived Citation Candidates
      </h2>
      <p className="mt-1 text-violet-900/80">
        Read-only draft candidates from media intake promotions. Not governed citation cards until human
        confirmation in Citation Locker workflow.
      </p>
      {candidates.length === 0 ? (
        <p className="mt-3 text-violet-900">No media-derived citation candidates yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {candidates.map((row) => (
            <li key={row.candidateId} className="rounded-lg border border-violet-900/10 bg-white p-3">
              <p className="font-semibold text-violet-950">{row.title}</p>
              <p className="mt-1 text-[10px] text-violet-900/70">
                {row.candidateId} · finding {row.findingId} · {row.reviewStatus}
              </p>
              <p className="mt-2 text-violet-900">{row.summary.slice(0, 200)}</p>
              <p className="mt-2 font-semibold text-violet-950">Proposed citation text</p>
              <p className="text-violet-900">{row.proposedCitationText.slice(0, 240)}</p>
              {row.operatorNotes ? (
                <p className="mt-2 text-violet-900">
                  <strong>Operator notes:</strong> {row.operatorNotes}
                </p>
              ) : null}
              <p className="mt-2 text-[10px] text-rose-800">
                {row.publicationSafety} · human review required · NOT a citation card
              </p>
              <Link
                href="/admin/intelligence/media-intake"
                className="mt-2 inline-block font-semibold text-violet-950 underline"
              >
                ← Back to media finding
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 rounded border border-violet-300/50 bg-violet-100/50 p-2 text-[10px] font-semibold text-violet-950">
        Review candidate manually in Citation Locker workflow — no automatic promotion into citation card.
      </p>
    </section>
  );
}
