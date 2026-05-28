import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
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
    <KimHammerBriefingPageShell moduleId="debate-packet-export">
      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Download actions</h2>
        <p className="mt-1 text-kelly-muted">
          Record export events in the{" "}
          <a href="/admin/intelligence/kim-hammer/export-control-center" className="font-semibold text-kelly-navy underline">
            Export Control Center
          </a>{" "}
          after download for lineage traceability.
        </p>
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
    </KimHammerBriefingPageShell>
  );
}
