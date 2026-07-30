import type { Metadata } from "next";
import { EventsSupportPage } from "@/components/events/EventsSupportPage";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "County fairs",
  description:
    "Kelly Grappe meets Arkansans at county fairs — families, farmers, teachers, and neighbors where summer gathers.",
  path: "/events/county-fairs",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function CountyFairsPage() {
  return (
    <EventsSupportPage
      eyebrow="Events"
      title="County Fairs"
      intro="County fairs are where Arkansas shows up as itself — families, farmers, teachers, small businesses, students, churches, volunteers, and neighbors. Kelly wants to meet Arkansans there, county by county."
    >
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
          <h2 className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">Across Arkansas</h2>
          <p className="mt-4 font-body leading-relaxed text-kelly-text/85">
            The campaign’s aim is to coordinate visits to as many county fairs as possible — with respect for hosts,
            schedules, and safety. Fair dates and visit announcements appear here when they are ready to share.
          </p>
        </div>

        <div className="rounded-card border border-kelly-text/12 bg-white/95 p-6 text-center shadow-sm md:p-8">
          <h2 className="font-heading text-lg font-bold text-kelly-ink md:text-xl">Help us find your fair</h2>
          <p className="mx-auto mt-3 max-w-lg font-body text-sm leading-relaxed text-kelly-text/80">
            Know your county fair dates or want Kelly to visit? Send details and the team will follow up.
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
