import type { Metadata } from "next";
import Link from "next/link";
import { EventsSupportPage } from "@/components/events/EventsSupportPage";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { getContactMailto } from "@/config/external-campaign";

export const metadata: Metadata = pageMeta({
  title: "Request Kelly",
  description:
    "Invite Kelly Grappe to your community — house parties, civic groups, county meetings, fairs, and listening sessions. Requests are reviewed and confirmed by the campaign team.",
  path: "/events/request",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

const requestTypes = [
  "House party",
  "Coffee meetup",
  "County party meeting",
  "Democratic, Republican, Libertarian, or nonpartisan civic group",
  "Church, synagogue, mosque, or community gathering",
  "County fair / festival",
  "Listening session",
  "Volunteer training",
  "Podcast / interview",
  "Campus or youth event",
  "Small business / nonprofit roundtable",
] as const;

export default function RequestKellyPage() {
  const mailto = getContactMailto();
  return (
    <EventsSupportPage
      eyebrow="Events · Invitations"
      title="Request Kelly"
      intro="Kelly is traveling Arkansas to listen, answer questions, and meet people where they gather. If you want Kelly to visit your community, host a conversation, or speak with your group, start here."
    >
      {/*
        TODO: Connect to workflow intake (e.g. WorkflowIntake) and pending-approval calendar — same review path as other public forms.
        TODO: Not a commitment calendar — staff review, follow-up, and confirmation before public listing.
      */}
      <section className="space-y-8 font-body text-kelly-text/85" aria-labelledby="why-request">
        <div>
          <h2 id="why-request" className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            Why we take requests
          </h2>
          <p className="mt-4 leading-relaxed">
            We want requests because this campaign is built on real conversations — not staged politics. Kelly wants to
            hear from people in every county, every kind of room, and every community.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">How it works</h2>
          <p className="mt-4 leading-relaxed">
            Submit a request. The campaign reviews details, follows up, confirms logistics, and only then can approved
            public events be added to the{" "}
            <Link href="/events" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              campaign calendar
            </Link>
            . Not every request fits the schedule or format — we will be straightforward when something cannot work.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">What you can request</h2>
          <ul className="mt-4 grid list-none gap-2 sm:grid-cols-2">
            {requestTypes.map((label) => (
              <li
                key={label}
                className="rounded-lg border border-kelly-text/10 bg-white/90 px-4 py-3 text-sm leading-snug text-kelly-text/90 shadow-sm"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card border border-dashed border-kelly-text/20 bg-kelly-wash/50 p-8 text-center">
          <p className="font-heading text-base font-bold text-kelly-ink">Request form coming soon</p>
          <p className="mt-3 text-sm leading-relaxed text-kelly-slate">
            Until the form is live, email the campaign with your county, proposed dates, venue type, and expected audience.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href={mailto} variant="primary" className="min-h-[48px]">
              Invite Kelly — email the campaign
            </Button>
            <Button href="/events" variant="outline" className="min-h-[48px]">
              View campaign calendar
            </Button>
          </div>
        </div>
      </section>
    </EventsSupportPage>
  );
}
