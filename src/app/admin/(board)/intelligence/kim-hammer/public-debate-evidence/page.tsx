import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  getExternalUseStatus,
  getLegalRiskLabel,
  getPublicationTier,
  getReviewStatusLabel,
} from "@/lib/opposition/kimHammerPublicationSafety";

const badgeClass: Record<string, string> = {
  READY_WITH_CITATION: "bg-emerald-100 text-emerald-800",
  USE_WITH_CAUTION: "bg-amber-100 text-amber-800",
  INTERNAL_ONLY: "bg-slate-100 text-slate-800",
  DO_NOT_USE_EXTERNALLY: "bg-rose-100 text-rose-800",
};

const reviewBadgeClass: Record<string, string> = {
  APPROVED_FOR_EXTERNAL_USE: "bg-emerald-100 text-emerald-800",
  EXPORTED: "bg-emerald-100 text-emerald-800",
  APPROVED_FOR_INTERNAL_USE: "bg-sky-100 text-sky-800",
  NEEDS_REVIEW: "bg-amber-100 text-amber-800",
  DRAFT: "bg-slate-100 text-slate-800",
  BLOCKED: "bg-rose-100 text-rose-800",
  ARCHIVED: "bg-zinc-100 text-zinc-700",
  LEGACY_UNSET: "bg-slate-100 text-slate-800",
};

export default async function KimHammerPublicDebateEvidencePage() {
  const index = loadKimHammerEvidenceIndex();
  const board = index.publicDebateEvidenceBoard;
  const debateClaims = index.claims.filter((claim) => claim.indexSource === "PUBLIC_DEBATE_BOARD");
  const publicReadyClaims = debateClaims.filter(
    (claim) => getExternalUseStatus(claim) === "READY_WITH_CITATION",
  ).length;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Public Debate Evidence Board</p>
        <h1 className="font-heading text-2xl font-bold">Source Safety + External Use Readiness</h1>
        <p className="mt-2 text-xs text-kelly-muted">{board.purpose}</p>
      </header>

      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Total claims</p>
          <p className="mt-1 text-xl font-bold">{board.items.length}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Public-ready</p>
          <p className="mt-1 text-xl font-bold">{publicReadyClaims}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Caution / restricted</p>
          <p className="mt-1 text-xl font-bold">{board.items.length - publicReadyClaims}</p>
        </div>
      </section>

      <section className="grid gap-4">
        {debateClaims.map((claim) => {
          const reviewStatus = getReviewStatusLabel(claim);
          const externalUse = getExternalUseStatus(claim) ?? "INTERNAL_ONLY";

          return (
            <article key={claim.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-kelly-navy">{claim.topic ?? claim.id}</h2>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${badgeClass[externalUse] ?? "bg-slate-100 text-slate-800"}`}>
                  {externalUse}
                </span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${reviewBadgeClass[reviewStatus] ?? "bg-slate-100 text-slate-800"}`}>
                  {reviewStatus.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-kelly-muted"><strong>Claim:</strong> {claim.text}</p>
              <p className="mt-1 text-kelly-muted">
                Tier: {getPublicationTier(claim)} · Citation: {claim.citationStatus} · Legal risk: {getLegalRiskLabel(claim)}
              </p>
              <p className="mt-1 text-kelly-muted">Human review required: {claim.humanReviewRequired ? "yes" : "no"}</p>
              {claim.reviewer ? (
                <p className="mt-1 text-kelly-muted">
                  Reviewer: {claim.reviewer}
                  {claim.reviewedAt ? ` · Reviewed: ${claim.reviewedAt}` : ""}
                </p>
              ) : null}

              <div className="mt-2 grid gap-3 lg:grid-cols-2">
                <div>
                  <p className="font-semibold text-kelly-navy">Supporting evidence</p>
                  <ul className="mt-1 list-inside list-disc text-kelly-muted">
                    {(claim.supportingEvidence ?? []).length === 0 ? (
                      <li>None captured.</li>
                    ) : (
                      claim.supportingEvidence!.map((ev) => <li key={`${claim.id}-${ev.url}`}>{ev.summary}</li>)
                    )}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-kelly-navy">Challenging evidence</p>
                  <ul className="mt-1 list-inside list-disc text-kelly-muted">
                    {(claim.challengingEvidence ?? []).length === 0 ? (
                      <li>None captured.</li>
                    ) : (
                      claim.challengingEvidence!.map((ev) => (
                        <li key={`${claim.id}-challenge-${ev.url}`}>{ev.summary}</li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
