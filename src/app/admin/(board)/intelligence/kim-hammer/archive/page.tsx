import { loadOppositionArchiveRollup } from "@/lib/opposition/oppositionBriefConfidence";
import { generateOppositionCitationCoverageReport } from "@/lib/opposition/oppositionCitationBinder";
import { loadOppositionRetrievalTasks } from "@/lib/opposition/oppositionArchiveStore";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerOppositionArchivePage() {
  const rollup = loadOppositionArchiveRollup();
  const citation = generateOppositionCitationCoverageReport();
  const tasks = loadOppositionRetrievalTasks();

  return (
    <KimHammerBriefingPageShell moduleId="archive">
      <section className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <strong>INTERNAL ONLY</strong> — NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED · KH-4 export controls apply.
        No publish, send, or export from this panel.
      </section>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Archive items", rollup.archiveItemCount],
          ["Sources", rollup.sourceCount],
          ["Direct clips", rollup.directClipCount],
          ["Writings", rollup.authoredWritingCount],
          ["Quotes (usable)", `${rollup.usableQuoteCount}/${rollup.directQuoteCount}`],
          ["Bill records", rollup.billRecordCount],
          ["Claim links", rollup.claimLedgerLinkedCount],
          ["Brief confidence", `${rollup.oppositionBriefConfidenceEstimate}/100`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-kelly-text/10 bg-white p-3 text-xs">
            <div className="text-kelly-muted">{label}</div>
            <div className="mt-1 text-lg font-semibold text-kelly-navy">{value}</div>
          </div>
        ))}
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Citation coverage</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          <li>Clips with source: {citation.clipsWithSource}/{citation.clipsTotal}</li>
          <li>Writings with source: {citation.writingsWithSource}/{citation.writingsTotal}</li>
          <li>Archive items with citation: {citation.archiveItemsWithCitation}</li>
          <li>Kim Hammer claims in ledger: {citation.kimHammerClaimsInLedger}</li>
        </ul>
        <p className="mt-2 text-kelly-muted">{rollup.confidenceBasis}</p>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Retrieval tasks ({rollup.retrievalTasksComplete}/{rollup.retrievalTasksTotal} closed, {rollup.retrievalTasksPartial} partial)</h2>
        <ul className="mt-2 space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="rounded border border-kelly-text/10 p-2">
              <div className="font-medium text-kelly-navy">
                [{t.priority}] {t.id} — {t.closureStatus}
              </div>
              <div className="text-kelly-muted">{t.description}</div>
              <div className="mt-1 text-kelly-muted">Blocker: {t.blocker}</div>
              <div className="text-kelly-muted">Next: {t.nextRetrievalStep}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="font-semibold text-kelly-navy">Top usable evidence</h2>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {rollup.topUsableEvidence.length ? rollup.topUsableEvidence.map((e: string) => <li key={e}>{e}</li>) : <li>None verified yet — run ingest</li>}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="font-semibold text-kelly-navy">Top unusable / unsafe claims</h2>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {rollup.topUnusableClaims.length ? rollup.topUnusableClaims.map((c: string) => <li key={c}>{c}</li>) : <li>No claim ledger entries yet</li>}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Next human retrieval actions</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {rollup.nextHumanRetrievalActions.map((a: string) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="mt-2 text-kelly-muted">{rollup.filmRoomGapNote}</p>
      </section>
    </KimHammerBriefingPageShell>
  );
}
