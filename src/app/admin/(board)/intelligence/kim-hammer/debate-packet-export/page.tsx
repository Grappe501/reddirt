import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  canExportClaim,
  getExternalUseStatus,
  getLegalRiskLabel,
  getPublicationTier,
  getReviewStatusLabel,
  KIM_HAMMER_EXPORT_FILTER,
} from "@/lib/opposition/kimHammerPublicationSafety";
import { DebatePacketExportActions } from "./DebatePacketExportActions";

export default async function KimHammerDebatePacketExportPage() {
  const index = loadKimHammerEvidenceIndex();
  const exportReadyClaims = index.claims.filter(canExportClaim);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Debate Packet Export</p>
        <h1 className="font-heading text-2xl font-bold">Citation-ready, Low-risk Claims Only</h1>
        <p className="mt-2 text-xs text-kelly-muted">
          Runtime publication-safety gate: `{KIM_HAMMER_EXPORT_FILTER.externalUseStatus}` + `{KIM_HAMMER_EXPORT_FILTER.citationStatus}` + `{KIM_HAMMER_EXPORT_FILTER.confidenceTier}` + `{KIM_HAMMER_EXPORT_FILTER.legalRisk}` legal risk, plus review status `APPROVED_FOR_EXTERNAL_USE` or `EXPORTED`.
        </p>
      </header>

      <section className="mb-6">
        <DebatePacketExportActions exportCount={exportReadyClaims.length} />
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Export-ready preview</h2>
        {exportReadyClaims.length === 0 ? (
          <p className="mt-2 text-kelly-muted">No export-ready claims currently meet safety criteria.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-kelly-muted">
            {exportReadyClaims.map((claim) => (
              <li key={claim.id} className="rounded border border-kelly-text/10 bg-kelly-page p-2">
                <p className="font-semibold text-kelly-navy">{claim.topic ?? claim.id}</p>
                <p className="mt-1">{claim.text ?? claim.claim}</p>
                <p className="mt-1 text-[10px]">
                  {getPublicationTier(claim)} · {getExternalUseStatus(claim)} · Legal risk: {getLegalRiskLabel(claim)} · Review: {getReviewStatusLabel(claim)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
