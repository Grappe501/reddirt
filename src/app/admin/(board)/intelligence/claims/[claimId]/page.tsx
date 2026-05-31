import Link from "next/link";
import { notFound } from "next/navigation";
import { getClaimWithCitations } from "@/lib/intelligence/claims/claimLedgerSummary";
import { scoreClaimEvidence } from "@/lib/intelligence/claims/evidenceDepthScoring";
import { ClaimReviewActions } from "./ClaimReviewActions";

export const dynamic = "force-dynamic";

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ claimId: string }>;
}) {
  const { claimId } = await params;
  const decoded = decodeURIComponent(claimId);
  const detail = getClaimWithCitations(decoded);
  if (!detail) notFound();

  const { claim, sources, anchors, policyViolations } = detail;
  const depthExplain = scoreClaimEvidence({
    claim,
    anchors,
    sources,
    shellCounty: claim.countySlug != null && claim.evidenceDepthScore < 40,
  });

  return (
    <div className="mx-auto max-w-5xl text-kelly-text pb-16">
      <Link href="/admin/intelligence/claims" className="text-xs font-semibold text-kelly-navy underline">
        ← Claim ledger
      </Link>

      <header className="mt-4 mb-6 border-b border-kelly-text/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Claim detail</p>
        <h1 className="font-heading text-xl font-bold">{claim.claimText}</h1>
        <p className="mt-2 text-xs text-kelly-muted">
          {claim.id} · {claim.domain} · {claim.classification} · {claim.verificationStatus} ·{" "}
          {claim.publishabilityStatus}
        </p>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Evidence depth</p>
          <p className="text-2xl font-bold">{claim.evidenceDepthScore}/100</p>
          <p className="text-xs text-kelly-muted">{depthExplain.reason}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Confidence</p>
          <p className="text-2xl font-bold">{claim.confidenceScore}/100</p>
          <p className="text-xs text-kelly-muted">{claim.evidenceStrength}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Public use risk</p>
          <p className="text-2xl font-bold text-rose-800">{claim.publicUseRisk}</p>
          <p className="text-xs text-kelly-muted">{claim.internalUseStatus}</p>
        </div>
      </section>

      <ClaimReviewActions claimId={claim.id} verificationStatus={claim.verificationStatus} classification={claim.classification} />

      <section className="mb-6 rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Supporting sources</h2>
        <ul className="mt-2 space-y-2 text-xs">
          {sources.length > 0 ? sources.map((s) => (
            <li key={s.id} className="rounded border p-2">
              <p className="font-bold">{s.title}</p>
              <p className="text-kelly-muted">{s.sourceType} · reliability {s.reliabilityRating} · confidence {s.sourceConfidence}</p>
            </li>
          )) : <li className="text-kelly-muted">No sources linked</li>}
        </ul>
      </section>

      <section className="mb-6 rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Citation anchors</h2>
        <ul className="mt-2 space-y-2 text-xs">
          {anchors.length > 0 ? anchors.map((a) => (
            <li key={a.id} className="rounded border p-2">
              <p className="font-bold">{a.notes || a.id}</p>
              <p className="text-kelly-muted">{a.claimSupportType} · {a.anchorType}</p>
            </li>
          )) : <li className="text-kelly-muted">No anchors linked</li>}
        </ul>
      </section>

      {policyViolations.length > 0 ? (
        <section className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <h2 className="text-sm font-bold uppercase text-rose-900">Policy violations</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-rose-900">
            {policyViolations.map((v) => (
              <li key={v.code}>{v.message}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Review history</h2>
        <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
          {claim.history.map((h) => (
            <li key={h.timestamp + h.eventType}>
              {h.timestamp.slice(0, 19)} · {h.eventType} · {h.actor} · {h.notes}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-kelly-subtle">
          Briefs: {claim.sourceBriefIds.join(", ") || "—"} · Packets: {claim.sourceEvidencePacketIds.join(", ") || "—"}
        </p>
      </section>
    </div>
  );
}
