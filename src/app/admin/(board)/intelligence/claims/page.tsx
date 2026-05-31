import Link from "next/link";
import {
  listClaimsForAdmin,
  summarizeClaimLedger,
} from "@/lib/intelligence/claims/claimLedgerSummary";
import { loadCitationAnchors, loadCitationSources } from "@/lib/intelligence/claims/claimLedgerStore";

export const dynamic = "force-dynamic";

const card = "rounded-xl border border-kelly-text/10 bg-white p-4";

function riskTone(risk: string): string {
  if (risk === "CRITICAL") return "text-rose-900 bg-rose-50 border-rose-200";
  if (risk === "HIGH") return "text-amber-900 bg-amber-50 border-amber-200";
  return "text-kelly-muted bg-kelly-page border-kelly-text/10";
}

export default async function ClaimsLedgerPage() {
  const summary = summarizeClaimLedger();
  const claims = listClaimsForAdmin().slice(0, 100);
  const sourceCount = loadCitationSources().sources.length;
  const anchorCount = loadCitationAnchors().anchors.length;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI Claim Ledger · Citation Engine
        </p>
        <h1 className="font-heading text-2xl font-bold">Claim trace & citation depth</h1>
        <p className="mt-2 max-w-4xl text-sm text-kelly-muted">
          INTERNAL ONLY · NON_PUBLISHABLE · Every claim traceable to sources. Human approval required for
          internal use and public adaptation.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/llm-review-queue" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            LLM review queue
          </Link>
          <Link href="/admin/intelligence" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Intelligence hub
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Total claims</p>
          <p className="font-heading text-2xl font-bold">{summary.totalClaims}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Verified / inferred / unsupported</p>
          <p className="text-lg font-bold">{summary.verifiedClaims} / {summary.inferredClaims} / {summary.unsupportedClaims}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Needs review</p>
          <p className="font-heading text-2xl font-bold text-amber-800">{summary.needsReviewClaims}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Sources / anchors</p>
          <p className="text-lg font-bold">{sourceCount} / {anchorCount}</p>
        </div>
      </section>

      <section className={`${card} mb-6 border-amber-300/40 bg-amber-50/30`}>
        <h2 className="text-sm font-bold uppercase text-amber-950">Approved (human only)</h2>
        <p className="mt-1 text-xs text-kelly-muted">
          Internal: {summary.approvedInternal} · Public adaptation: {summary.approvedPublicAdaptation}
        </p>
        <h3 className="mt-3 text-xs font-bold uppercase text-rose-800">Top citation gaps</h3>
        <ul className="mt-1 list-inside list-disc text-xs text-rose-900">
          {summary.topMissingCitationGaps.length > 0
            ? summary.topMissingCitationGaps.map((g) => <li key={g.slice(0, 60)}>{g}</li>)
            : <li>Run intelligence:claims:ingest to populate ledger</li>}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Claims ({claims.length} shown)</h2>
        {claims.length === 0 ? (
          <p className="text-sm text-kelly-muted">No claims ingested. Run npm run intelligence:claims:ingest</p>
        ) : (
          claims.map((claim) => (
            <article key={claim.id} className={`${card} text-xs`}>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/intelligence/claims/${encodeURIComponent(claim.id)}`} className="font-bold text-kelly-navy underline">
                  {claim.claimText.slice(0, 100)}{claim.claimText.length > 100 ? "…" : ""}
                </Link>
                <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold">{claim.classification}</span>
                <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold">{claim.verificationStatus}</span>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${riskTone(claim.publicUseRisk)}`}>
                  {claim.publicUseRisk} risk
                </span>
              </div>
              <p className="mt-2 text-kelly-muted">
                Depth {claim.evidenceDepthScore}/100 · Confidence {claim.confidenceScore}/100 ·{" "}
                {claim.citationAnchorIds.length} anchors · {claim.publishabilityStatus}
              </p>
              <p className="mt-1 text-kelly-subtle">{claim.recommendedHumanAction}</p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
