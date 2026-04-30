import type { Metadata } from "next";
import { EventsSupportPage } from "@/components/events/EventsSupportPage";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "County party meetings",
  description:
    "Kelly Grappe welcomes invitations from county committees and civic groups across the spectrum for serious conversations about the Secretary of State’s office.",
  path: "/events/county-party-meetings",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function CountyPartyMeetingsPage() {
  return (
    <EventsSupportPage
      eyebrow="Events · Every county"
      title="County Party Meetings"
      intro="Kelly is running to administer the office for all Arkansans. She welcomes invitations from Democratic, Republican, Libertarian, independent, and nonpartisan community groups that want a serious conversation about the Secretary of State’s office."
    >
      {/*
        TODO: Optional downloadable one-pager / speaker logistics (later) — not a substitute for staff review on /events/request.
        TODO: Google Calendar / admin approval queue for confirmed stops (later phase).
      */}
      <section className="space-y-10 font-body text-kelly-text/85" aria-labelledby="why-meetings">
        <div>
          <h2 id="why-meetings" className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            Why county meetings matter
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2">
            <li>Room for real questions — not only packaged talking points.</li>
            <li>Local concerns surface where trust is built or lost.</li>
            <li>Voter confidence grows when process is explained with patience.</li>
            <li>County-level administration affects neighbors directly — it deserves a serious hearing.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">Who can invite Kelly</h2>
          <ul className="mt-4 list-inside list-disc space-y-2">
            <li>Democratic county committees</li>
            <li>Republican county committees</li>
            <li>Libertarian county committees</li>
            <li>Civic clubs</li>
            <li>Local community groups</li>
            <li>Election-focused forums</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">What Kelly can discuss</h2>
          <ul className="mt-4 list-inside list-disc space-y-2">
            <li>What the Secretary of State does — and does not do</li>
            <li>Free and fair elections and lawful administration</li>
            <li>Voter access and voter privacy — held together</li>
            <li>Business filings and reliable public-facing service</li>
            <li>Public records and transparency within the office’s authority</li>
            <li>Capitol stewardship and professional public safety partnerships</li>
            <li>How the campaign is listening statewide</li>
          </ul>
        </div>

        <div className="rounded-card border border-kelly-text/12 bg-kelly-wash/40 p-6 text-center md:p-8">
          <p className="font-body text-sm leading-relaxed">
            Requests are reviewed and scheduled like any other host invitation — we confirm details before adding public
            calendar items.
          </p>
          <div className="mt-6 flex justify-center">
            <Button href="/events/request" variant="primary" className="min-h-[48px]">
              Invite Kelly
            </Button>
          </div>
        </div>
      </section>
    </EventsSupportPage>
  );
}
