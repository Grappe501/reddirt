import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { JoinMovementForm } from "@/components/forms/JoinMovementForm";
import { VolunteerForm } from "@/components/forms/VolunteerForm";
import { EditorialCampaignPhoto, EditorialPhotoPair } from "@/components/about/EditorialCampaignPhoto";
import { trailPhotosForSlot } from "@/content/media/campaign-trail-assignments";
import { RepresentLocalEventPanel } from "@/components/organizing/RepresentLocalEventPanel";
import {
  getInvolvedPathwaysHref,
  powerOf5OnboardingHref,
  representLocalEventVolunteerHref,
} from "@/config/navigation";
import { getInvolvedPathways } from "@/content/journey/get-involved-pathways";
import { GetInvolvedIntakeTransparencyNote, GetInvolvedPathwaySystem } from "@/components/journey/GetInvolvedPathwaySystem";
import { isValidResourceVolunteerSlug } from "@/content/resources/toolkit";
import { ContentImage } from "@/components/media/ContentImage";
import { media } from "@/content/media/registry";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Get involved — volunteer with the campaign",
  description:
    "Choose a lane: Power of 5 relational organizing, county teams, captains, stories, events, candidate support, petitions, and GOTV—each with clear next steps into the campaign’s existing forms.",
  path: "/get-involved",
  imageSrc: "/media/placeholders/og-default.svg",
});

function pickLane(sp: Record<string, string | string[] | undefined>): string | undefined {
  const v = sp.lane;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

function pickResource(sp: Record<string, string | string[] | undefined>): string | undefined {
  const v = sp.resource;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

function truthyParam(v: string | string[] | undefined): boolean {
  if (typeof v === "string") return v === "1" || v === "true";
  if (Array.isArray(v)) return v.some((x) => x === "1" || x === "true");
  return false;
}

function pickLeadership(sp: Record<string, string | string[] | undefined>): boolean {
  return truthyParam(sp.leadership);
}

export default async function GetInvolvedPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const laneParam = pickLane(sp);
  const resourceParam = pickResource(sp);
  const volunteerPrefillResource =
    resourceParam && isValidResourceVolunteerSlug(resourceParam) ? resourceParam : undefined;
  const volunteerPrefillLane =
    laneParam === "event_representation" ? ("event_representation" as const) : undefined;
  const volunteerPrefillLeadership = pickLeadership(sp);

  const pair = trailPhotosForSlot("getInvolved");
  const left = pair[0];
  const right = pair[1];

  return (
    <>
      <PageHero
        eyebrow="Act"
        title="Get involved"
        subtitle="No gatekeeping—choose a pathway below, or head straight to the forms if you already know how you want to help."
      >
        <Button href={getInvolvedPathwaysHref} variant="primary" className="w-full justify-center sm:w-auto">
          Pick your pathway
        </Button>
        <Button href="#join" variant="outline" className="w-full justify-center sm:w-auto">
          Stay connected
        </Button>
        <Button href="#volunteer" variant="outline" className="w-full justify-center sm:w-auto">
          Volunteer
        </Button>
        <Button href="#represent-event" variant="outline" className="w-full justify-center sm:w-auto">
          Represent at an event
        </Button>
      </PageHero>

      {left && right ? (
        <FullBleedSection variant="subtle" className="!pt-0" aria-label="Campaign trail photography">
          <ContentContainer wide className="py-10 md:py-14">
            <EditorialPhotoPair
              left={left}
              right={right}
              kicker="Field energy"
              caption="Same campaign, different counties—because Arkansas doesn’t fit in a single snapshot."
            />
          </ContentContainer>
        </FullBleedSection>
      ) : left ? (
        <FullBleedSection variant="subtle" className="!pt-0" aria-label="Campaign trail photography">
          <ContentContainer wide className="py-10 md:py-14">
            <EditorialCampaignPhoto variant="breakout" photo={left} kicker="Field energy" />
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <FullBleedSection variant="subtle" padY aria-label="Arkansas democracy and work">
        <ContentContainer wide>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center">
            <div className="relative min-h-[220px] overflow-hidden rounded-card border border-kelly-text/10 shadow-[var(--shadow-soft)] lg:min-h-[280px]">
              <ContentImage
                media={media.splitDemocracy}
                warmOverlay
                className="absolute inset-0 h-full w-full min-h-full object-cover"
              />
            </div>
            <div className="relative min-h-[220px] overflow-hidden rounded-card border border-kelly-text/10 shadow-[var(--shadow-soft)] lg:min-h-[280px]">
              <ContentImage
                media={media.splitLabor}
                warmOverlay
                className="absolute inset-0 h-full w-full min-h-full object-cover"
              />
            </div>
          </div>
          <p className="mt-6 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/65">
            Ballots and work boots both belong in a democracy that is honest about who gets heard—and this campaign
            shows up in every kind of room.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="pathways" aria-labelledby="pathway-heading">
        <ContentContainer wide>
          <SectionHeading
            id="pathway-heading"
            eyebrow="Choose your lane"
            title="Seven ways to plug in—each with a clear next step"
            subtitle="Every card links to an existing page or form. You are not signing up for spam; submissions create a staff queue row so a human can follow up."
          />
          <GetInvolvedPathwaySystem pathways={getInvolvedPathways} />
          <GetInvolvedIntakeTransparencyNote />
          <p className="mx-auto mt-8 max-w-3xl text-center font-body text-sm leading-relaxed text-kelly-text/75">
            Building from relationships first? You can also start with{" "}
            <Link className="font-semibold text-kelly-navy underline" href={powerOf5OnboardingHref}>
              Power of 5 onboarding
            </Link>{" "}
            — a guided flow with demo content in your browser (no signup on that page).
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="join" aria-labelledby="join-heading">
        <ContentContainer>
          <SectionHeading
            id="join-heading"
            eyebrow="Start here"
            title="Stay connected"
            subtitle="Share your contact info and optional context—especially if you’re inviting us to a local party or civic gathering. We route messages to real humans, not spam."
          />
          <div className="mt-10 max-w-3xl">
            <JoinMovementForm />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="represent-event" aria-labelledby="represent-event-heading">
        <ContentContainer>
          <SectionHeading
            id="represent-event-heading"
            eyebrow="Field"
            title="Show up for the campaign where you live"
            subtitle="Many volunteers want a clear assignment. If you can table, greet, or simply be a steady presence at something already on the community calendar, start here—we will match you with training and materials."
          />
          <RepresentLocalEventPanel className="mt-10 max-w-3xl" />
          <p className="mt-6 max-w-3xl font-body text-sm text-kelly-text/70">
            Ready to send the form?{" "}
            <Link className="font-semibold text-kelly-navy underline" href={representLocalEventVolunteerHref}>
              Open the volunteer signup with this lane tagged
            </Link>{" "}
            or scroll to the full form below.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" id="volunteer" aria-labelledby="volunteer-heading">
        <ContentContainer>
          <SectionHeading
            id="volunteer-heading"
            eyebrow="Volunteer"
            title="Help locally or digitally"
            subtitle="Tell us your availability and skills. If you can host county meetings or help with voter education, say so—we’ll follow up with concrete next steps."
          />
          <p className="mt-4 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
            <span className="font-semibold text-kelly-text/90">Postcards, calls, and texts: </span>
            start with the step-by-step guides, then use the form below (or check the matching boxes) so we can tag your
            signup—{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/resources/postcard-outreach">
              handwritten postcards
            </Link>
            ,{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/resources/phone-banking">
              phone banking (dialer coming)
            </Link>
            ,{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/resources/text-banking">
              peer-to-peer text banking
            </Link>
            .
          </p>
          {volunteerPrefillLeadership && volunteerPrefillLane !== "event_representation" ? (
            <div className="mt-6 max-w-3xl rounded-md border border-kelly-success/30 bg-kelly-success/10 p-4 font-body text-sm text-kelly-text/90">
              <p>
                <span className="font-semibold">Captain / leadership pathway:</span> you opened this page with leadership
                intent—please check <span className="font-semibold">“I’m open to leadership training”</span> on the form
                below and add your town, precinct, or turf in <span className="font-semibold">skills</span> so coordinators
                can place you accurately.
              </p>
            </div>
          ) : null}
          <div className="mt-10 max-w-3xl">
            <VolunteerForm prefillLane={volunteerPrefillLane} prefillResource={volunteerPrefillResource} />
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
