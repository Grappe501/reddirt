import type { Metadata } from "next";
import { EventsSupportPage } from "@/components/events/EventsSupportPage";
import { CountyFairResearchTable } from "@/components/events/CountyFairResearchTable";
import { Button } from "@/components/ui/Button";
import { COUNTY_FAIR_RESEARCH_PLACEHOLDER_ROWS } from "@/content/events/county-fair-research-placeholder";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "County fairs",
  description:
    "County fair strategy for the Kelly Grappe campaign — meeting Arkansans where summer gathers, county by county, with honest research and no invented dates.",
  path: "/events/county-fairs",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function CountyFairsPage() {
  return (
    <EventsSupportPage
      eyebrow="Events · Field strategy"
      title="County Fairs"
      intro="County fairs are where Arkansas shows up as itself — families, farmers, teachers, small businesses, students, churches, volunteers, and neighbors. Kelly wants to meet Arkansans there, county by county."
    >
      {/*
        TODO: Verified 2026 county fair research (names, dates, cities, official sources).
        TODO: County map SVG — color by scheduled / visited; completion reveal art when milestones are met (no fake markers until data exists).
        TODO: Optional Google Calendar segment for fair-day logistics (separate from public approved feed).
      */}
      <section className="space-y-10" aria-labelledby="why-fairs">
        <div>
          <h2 id="why-fairs" className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            Why county fairs matter
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2 font-body text-kelly-text/85">
            <li>Real conversations—not only the rooms where politics usually shows up.</li>
            <li>Rural and small-town access where neighbors already plan to be.</li>
            <li>Agriculture and community culture on display — a natural place to listen.</li>
            <li>Meeting people outside campaign-only spaces builds trust.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">75-county fair goal</h2>
          <p className="mt-4 font-body leading-relaxed text-kelly-text/85">
            The campaign’s aim is to coordinate visits to as many county fairs as possible — ideally all 75 counties
            over time — with respect for hosts, schedules, and safety.{" "}
            <strong className="text-kelly-text">We are not publishing fair dates on this page until they are verified</strong>{" "}
            from official sources; the tracker below starts every county in “Research needed.”
          </p>
        </div>

        <div>
          <h2 className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">Fair research tracker</h2>
          <p className="mt-3 font-body text-sm text-kelly-text/75">
            Placeholder grid for all Arkansas counties. Add fair names, 2026 dates, cities, and source links only after
            verification.
          </p>
          <div className="mt-6">
            <CountyFairResearchTable rows={COUNTY_FAIR_RESEARCH_PLACEHOLDER_ROWS} />
          </div>
        </div>

        <div
          className="rounded-card border-2 border-dashed border-kelly-text/20 bg-gradient-to-br from-kelly-fog/80 via-white to-kelly-wash/60 p-8 text-center md:p-10"
          role="img"
          aria-label="Placeholder for an Arkansas county map. Counties will show schedule or visit status when verified data is available. There are no map markers yet."
        >
          <p className="font-heading text-base font-bold text-kelly-ink md:text-lg">Arkansas county map — coming soon</p>
          <p className="mt-2 font-body text-sm text-kelly-slate">
            Future: counties fill in when a fair visit is scheduled; visited counties can show completion status.
            TODO: SVG basemap + data binding — no decorative pins until real coordinates/aggregates are approved.
          </p>
        </div>

        <div className="rounded-card border border-kelly-text/12 bg-white/95 p-6 text-center shadow-sm md:p-8">
          <h2 className="font-heading text-lg font-bold text-kelly-ink md:text-xl">Help us find your fair</h2>
          <p className="mx-auto mt-3 max-w-lg font-body text-sm leading-relaxed text-kelly-text/80">
            Know your county fair dates or official links? Send details — the team will research, verify, and follow up.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href="/events/request" variant="primary" className="min-h-[48px]">
              Invite Kelly / send details
            </Button>
            <Button href="/events" variant="outline" className="min-h-[48px]">
              Campaign calendar
            </Button>
          </div>
        </div>
      </section>
    </EventsSupportPage>
  );
}
