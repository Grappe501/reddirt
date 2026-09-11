import type { Metadata } from "next";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { InviteKellyRequestForm } from "@/components/forms/InviteKellyRequestForm";

export const metadata: Metadata = {
  title: "Invite Kelly · Share an event",
  description:
    "Invite Kelly to your county or share a local fair, festival, civic club, church, chamber, or community gathering.",
};

export default async function ScheduleCampaignEventPage() {
  return (
    <>
      <MediaPageHero
        slotKey="schedule.hero"
        layout="split"
        eyebrow="Invite Kelly"
        title="Invite Kelly · Share local events"
        subtitle="Share a fair, festival, civic club, church, chamber, or community gathering. Our team will follow up."
      >
        <Button href="#schedule-form" variant="primary">
          Share an opportunity
        </Button>
        <Button href="/events/request" variant="outlineOnDark">
          Invite Kelly pathway
        </Button>
      </MediaPageHero>

      <FullBleedSection padY aria-labelledby="schedule-copy-heading">
        <ContentContainer wide className="max-w-3xl">
          <h2 id="schedule-copy-heading" className="font-heading text-xl font-bold text-kelly-text">
            What to include
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>Your county and the kind of gathering (fair, festival, club, faith community, chamber, backyard, etc.)</li>
            <li>Approximate date or window, expected audience size, and who is hosting</li>
            <li>Whether the event is public, invitation-only, or still being planned</li>
          </ul>
          <p className="mt-6 font-body text-sm text-kelly-muted">
            Prefer the step-by-step invite flow? Use{" "}
            <Link href="/events/request" className="font-semibold text-kelly-navy underline">
              Invite Kelly
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="schedule-form-heading">
        <ContentContainer wide>
          <h2 id="schedule-form-heading" className="sr-only">
            Public scheduling request form
          </h2>
          <InviteKellyRequestForm id="schedule-form" />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
