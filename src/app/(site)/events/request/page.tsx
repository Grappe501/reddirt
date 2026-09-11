import type { Metadata } from "next";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { InviteKellyRequestForm } from "@/components/forms/InviteKellyRequestForm";
import { EventsSubpageFooter } from "@/components/events/EventsSubpageFooter";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "Invite Kelly",
  description:
    "Invite Kelly Grappe to your county — house party, civic club, fair, church, or community gathering. Share dates that work and we will follow up.",
  path: "/events/request",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function InviteKellyPage() {
  return (
    <>
      <MediaPageHero
        slotKey="events.request.hero"
        layout="split"
        eyebrow="Invite Kelly"
        title="Invite Kelly"
        subtitle="Tell us what you want to host, a few dates that could work, and what Kelly should do. We will check the calendar and follow up."
      >
        <Button href="#invite-form" variant="primary">
          Start the form
        </Button>
        <Button href="/events" variant="outlineOnDark">
          See the calendar
        </Button>
      </MediaPageHero>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <p className="font-body text-base leading-relaxed text-kelly-slate">
            This is the page to send anyone who wants Kelly at a gathering. More date options help us find a fit.
            Sending the form is an invitation — not a confirmation.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="invite-form-heading">
        <ContentContainer className="max-w-3xl">
          <h2 id="invite-form-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            Invitation form
          </h2>
          <p className="mt-2 font-body text-sm text-kelly-text/70">About five minutes. Dropdowns first, details if you have them.</p>
          <div className="mt-8 rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm md:p-8">
            <InviteKellyRequestForm id="invite-form" />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <EventsSubpageFooter />
    </>
  );
}
