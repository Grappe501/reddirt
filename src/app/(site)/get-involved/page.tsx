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
import { representLocalEventVolunteerHref } from "@/config/navigation";
import { isValidResourceVolunteerSlug } from "@/content/resources/toolkit";

export const metadata: Metadata = {
  title: "Get involved",
  description:
    "Volunteer, invite Kelly to your county or party meeting, and stay connected with the Arkansas Secretary of State campaign.",
};

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

  const pair = trailPhotosForSlot("getInvolved");
  const left = pair[0];
  const right = pair[1];

  return (
    <>
      <PageHero
        eyebrow="Act"
        title="Get involved"
        subtitle="No perfect resume required—whether you want to volunteer, host a conversation, or invite us to a Republican, Democratic, or civic meeting in your county."
      >
        <Button href="#join" variant="primary">
          Stay connected
        </Button>
        <Button href="#volunteer" variant="outline">
          Volunteer
        </Button>
        <Button href="#represent-event" variant="outline">
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

      <FullBleedSection aria-labelledby="pathway-heading">
        <ContentContainer>
          <SectionHeading
            id="pathway-heading"
            eyebrow="Civic pathways"
            title="Arkansans are not checked out. Too many have been checked out of the process."
            subtitle="This campaign starts from respect: people help neighbors, show up for community, and talk about what matters. Our job is to make the formal pathways clearer, more local, and easier to act on."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-kelly-text">Meet people where they are</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">
                County visits, listening sessions, church basements, school gyms, local festivals, and kitchen-table conversations all count. Civic engagement should not require insider access.
              </p>
            </div>
            <div className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-kelly-text">Make action simple</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">
                Registration forms, deadlines, voting steps, candidate filing, and ballot-measure rules should be explained plainly enough for one neighbor to help another.
              </p>
            </div>
            <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-kelly-text">Trust is local</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">
                People are more likely to participate when information comes through trusted relationships and when government explains itself clearly.
              </p>
            </div>
          </div>
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
            <a className="font-semibold text-kelly-navy underline" href={representLocalEventVolunteerHref}>
              Open the volunteer signup with this lane tagged
            </a>{" "}
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
          <div className="mt-10 max-w-3xl">
            <VolunteerForm prefillLane={volunteerPrefillLane} prefillResource={volunteerPrefillResource} />
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
