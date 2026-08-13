import type { CountyVisitLedger } from "@/lib/events/county-visit-ledger";

export function CountyVisitLedgerNotice({ ledger }: { ledger: CountyVisitLedger }) {
  const conflicts = ledger.disagreements.filter((d) => d.severity === "conflict");
  const gaps = ledger.disagreements.filter((d) => d.severity === "gap");

  if (conflicts.length === 0 && gaps.length === 0) {
    return (
      <p className="mt-4 font-body text-xs text-kelly-subtle">
        County visit ledger: {ledger.visited.length} of {ledger.totalCounties} public (as of {ledger.asOfYmd} Central).
        No seed/event disagreements.
      </p>
    );
  }

  return (
    <section className="mt-5 space-y-3 rounded-md border border-amber-200 bg-amber-50/80 px-4 py-3 font-body text-sm text-amber-950">
      <p className="font-semibold">County visit ledger (internal)</p>
      <p>
        Public count is {ledger.visited.length} of {ledger.totalCounties} as of {ledger.asOfYmd} Central. Historical
        seed is never silently rewritten.
      </p>
      {conflicts.length ? (
        <div>
          <p className="font-semibold">{conflicts.length} conflict{conflicts.length === 1 ? "" : "s"}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {conflicts.map((d) => (
              <li key={`${d.countyName}-${d.eventIds.join(",")}`}>{d.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {gaps.length ? (
        <p className="text-amber-900/90">
          {gaps.length} seed-visited {gaps.length === 1 ? "county has" : "counties have"} no qualifying CampaignOS
          appearance yet (expected until August ingest).
        </p>
      ) : null}
    </section>
  );
}
