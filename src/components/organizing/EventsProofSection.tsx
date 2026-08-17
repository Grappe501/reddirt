import { Button } from "@/components/ui/Button";
import { CampaignJourneyMap } from "@/components/organizing/events-map/CampaignJourneyMap";
import type { CountyMapFeature } from "@/components/organizing/events-map/county-map-types";
import type { CountyVisitLedger } from "@/lib/events/county-visit-ledger";

export function EventsProofSection({
  ledger,
  features,
}: {
  ledger: CountyVisitLedger;
  features: CountyMapFeature[];
}) {
  const n = ledger.visited.length;

  return (
    <section aria-labelledby="events-proof-heading" className="space-y-8">
      <div>
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Proof</p>
        <h2 id="events-proof-heading" className="mt-1 font-heading text-2xl font-bold text-kelly-text md:text-3xl">
          Showing up matters.
        </h2>
        <p className="mt-2 max-w-2xl font-body text-kelly-text/75">
          Kelly has traveled Arkansas listening to the people who actually live here.
        </p>
      </div>

      <CampaignJourneyMap features={features} />
      <p className="font-body text-xs text-kelly-text/65">Blue counties are places Kelly has already been.</p>

      <div className="rounded-card border border-kelly-navy/15 bg-kelly-navy/[0.04] px-5 py-6">
        <p className="font-heading text-4xl font-bold text-kelly-navy md:text-5xl">
          {n} of {ledger.totalCounties}
        </p>
        <p className="mt-2 font-body text-sm font-semibold text-kelly-text">Arkansas counties visited</p>
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold text-kelly-text">Counties visited</h3>
        <ul className="mt-4 columns-2 gap-x-8 sm:columns-3 md:columns-4" aria-label="Visited Arkansas counties">
          {ledger.visited.map((row) => (
            <li key={row.countyName} className="break-inside-avoid py-1 font-body text-sm text-kelly-text">
              {row.countyName}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button href="/events/request" variant="primary">
          Invite Kelly
        </Button>
        <Button href="/events" variant="outline">
          Campaign calendar
        </Button>
      </div>
    </section>
  );
}
