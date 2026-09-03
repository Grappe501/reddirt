import { CampaignJourneyMap } from "@/components/organizing/events-map/CampaignJourneyMap";
import type { CountyMapFeature } from "@/components/organizing/events-map/county-map-types";
import { formatCampaignStopAsOfDate, getCampaignStopMilestone } from "@/content/events/campaign-stop-milestone";

export function EventsProofSection({
  features,
}: {
  features: CountyMapFeature[];
}) {
  const milestone = getCampaignStopMilestone();
  const asOfDate = formatCampaignStopAsOfDate();

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-kelly-navy/15 bg-kelly-navy/[0.04] px-5 py-6">
          <p className="font-heading text-4xl font-bold text-kelly-navy md:text-5xl">{milestone.count}</p>
          <p className="mt-2 font-body text-sm font-semibold text-kelly-text">Scheduled campaign stops</p>
          <p className="mt-1 font-body text-sm text-kelly-text/70">As of {asOfDate} through Election Day.</p>
        </div>
        <div className="rounded-card border border-kelly-navy/15 bg-kelly-navy/[0.04] px-5 py-6">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="font-heading text-4xl font-bold text-kelly-navy md:text-5xl">{milestone.completedCount}</p>
              <p className="mt-2 font-body text-sm font-semibold text-kelly-text">Stops completed</p>
            </div>
            <div>
              <p className="font-heading text-4xl font-bold text-kelly-navy md:text-5xl">{milestone.upcomingCount}</p>
              <p className="mt-2 font-body text-sm font-semibold text-kelly-text">Stops remaining</p>
            </div>
          </div>
          <p className="mt-3 font-body text-sm text-kelly-text/70">Through Election Day.</p>
        </div>
      </div>
    </section>
  );
}
