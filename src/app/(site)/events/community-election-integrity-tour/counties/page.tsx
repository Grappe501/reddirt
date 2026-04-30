import type { Metadata } from "next";
import Link from "next/link";
import { EventsSupportPage } from "@/components/events/EventsSupportPage";
import { Button } from "@/components/ui/Button";
import { IntegrityTourStopTable } from "@/components/events/IntegrityTourStopTable";
import {
  communityElectionIntegrityTourContent,
  INTEGRITY_TOUR_PLACEHOLDER_ROWS,
} from "@/content/events/community-election-integrity-tour";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

const { meta, counties: C } = communityElectionIntegrityTourContent;

export const metadata: Metadata = pageMeta({
  title: meta.counties.title,
  description: meta.counties.description,
  path: meta.counties.path,
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function IntegrityTourCountiesPage() {
  return (
    <EventsSupportPage eyebrow={C.eyebrow} title={C.title} intro={C.intro}>
      {/*
        TODO: Replace placeholder rows with verified data from admin/DB when available — no synthetic counties or dates.
        TODO: Arkansas map SVG + accessible status colors (requested / pending / scheduled / completed / point team formed).
      */}
      <div className="space-y-12 font-body text-kelly-text/88">
        <p className="text-sm font-medium text-kelly-text/75">
          Slots 1–26 are planning capacity only. Status stays on &quot;Research needed&quot; until a real host, venue, and
          date are confirmed and approved for public listing.
        </p>

        <IntegrityTourStopTable rows={INTEGRITY_TOUR_PLACEHOLDER_ROWS} />

        <div
          className="rounded-card border-2 border-dashed border-kelly-text/20 bg-gradient-to-br from-kelly-fog/80 via-white to-kelly-wash/60 p-8 text-center md:p-10"
          role="img"
          aria-label="Placeholder for an Arkansas map showing Community Election Integrity Tour progress by county. No markers or colors until verified tour data exists."
        >
          <p className="font-heading text-base font-bold text-kelly-ink md:text-lg">Arkansas map — coming soon</p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-kelly-slate">{C.mapCaption}</p>
        </div>

        <section aria-labelledby="point-team-heading">
          <h2 id="point-team-heading" className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            {C.pointTeam.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed md:text-[1.05rem]">{C.pointTeam.intro}</p>
          <h3 className="mt-8 font-heading text-lg font-bold text-kelly-text">Point team roles</h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-base leading-relaxed">
            {C.pointTeam.roles.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <div className="rounded-xl border border-kelly-text/12 bg-white/90 p-6">
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-gold/90">Also explore</p>
          <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <li>
              <Link href="/events/request" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                Invite Kelly
              </Link>
            </li>
            <li>
              <Link href="/events" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                Campaign Calendar
              </Link>
            </li>
            <li>
              <Link href="/from-the-road" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                From the Road
              </Link>
            </li>
            <li>
              <Link href="/office/elections" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                Elections — the office
              </Link>
            </li>
            <li>
              <Link href="/about/why-kelly" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                Why Kelly
              </Link>
            </li>
            <li>
              <Link href="/listening-sessions" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                Listening sessions
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button href="/events/community-election-integrity-tour/request" variant="primary" className="min-h-[48px]">
            Invite a tour stop
          </Button>
          <Button href="/events/community-election-integrity-tour" variant="outline" className="min-h-[48px]">
            Tour overview
          </Button>
        </div>
      </div>
    </EventsSupportPage>
  );
}
