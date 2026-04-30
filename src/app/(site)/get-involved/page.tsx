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
import { powerOf5OnboardingHref, representLocalEventVolunteerHref } from "@/config/navigation";
import { isValidResourceVolunteerSlug } from "@/content/resources/toolkit";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "This campaign grows through people who bring people—volunteer, Bring 5, start a local team, invite Kelly, or donate if you can.",
};

const sectionLinks: { label: string; href: string }[] = [
  { label: "Volunteer", href: "#volunteer-team" },
  { label: "Bring 5", href: "#bring-5" },
  { label: "Start a Local Team", href: "#local-team" },
  { label: "Invite Kelly", href: "#invite-kelly" },
  { label: "Donate", href: "#donate-section" },
];

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
      <PageHero eyebrow="Join in" title="Get Involved" subtitle="This campaign grows through people who bring people.">
        <Button href="#volunteer-team" variant="primary">
          Volunteer
        </Button>
        <Button href="#bring-5" variant="outline">
          Bring 5
        </Button>
        <Button href="#invite-kelly" variant="outline">
          Invite Kelly
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

      <FullBleedSection aria-labelledby="on-this-page-heading">
        <ContentContainer>
          <h2 id="on-this-page-heading" className="font-heading text-lg font-bold text-kelly-text md:text-xl">
            On this page
          </h2>
          <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/75">
            Pick what fits today—you can always come back for another lane. No perfect resume required.
          </p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {sectionLinks.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="inline-flex rounded-full border border-kelly-navy/20 bg-white px-4 py-2 font-body text-sm font-semibold text-kelly-navy transition hover:border-kelly-navy/40"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl font-body text-sm text-kelly-text/65">
            <Link className="font-semibold text-kelly-navy underline" href="/voter-registration">
              Register to vote
            </Link>
            {" · "}
            <Link className="font-semibold text-kelly-navy underline" href="/listening-sessions">
              Listening sessions
            </Link>
            {" · "}
            <Link className="font-semibold text-kelly-navy underline" href="/local-organizing">
              Local organizing
            </Link>
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" id="volunteer-team" aria-labelledby="volunteer-heading" className="scroll-mt-20">
        <ContentContainer>
          <SectionHeading
            id="volunteer-heading"
            eyebrow="Hands-on"
            title="Volunteer"
            subtitle="Help at an event, make calls, send texts, or share a skill—tell us what sounds doable and we will meet you there."
          />
          <div id="join" className="mt-10 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Stay connected</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Drop a note and how to reach you. If you are inviting us somewhere local, mention it—we read what you send.
            </p>
            <div className="mt-8 max-w-3xl">
              <JoinMovementForm />
            </div>
          </div>

          <div id="represent-event" className="mt-14 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Help at events</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Tabling, greeting, or a steady presence counts. We will line up materials and a clear ask—no need to already
              know every detail.
            </p>
            <RepresentLocalEventPanel className="mt-8 max-w-3xl" />
            <p className="mt-6 max-w-3xl font-body text-sm text-kelly-text/70">
              <Link className="font-semibold text-kelly-navy underline" href={representLocalEventVolunteerHref}>
                Open signup with event lane tagged
              </Link>{" "}
              or use the form below.
            </p>
          </div>

          <div id="volunteer" className="mt-14 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Volunteer signup</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Check what fits—even one box is a start. Optional: peek at{" "}
              <Link className="font-semibold text-kelly-navy underline" href="/resources/postcard-outreach">
                postcards
              </Link>
              ,{" "}
              <Link className="font-semibold text-kelly-navy underline" href="/resources/phone-banking">
                phone
              </Link>
              ,{" "}
              <Link className="font-semibold text-kelly-navy underline" href="/resources/text-banking">
                texts
              </Link>{" "}
              before you send.
            </p>
            <div className="mt-8 max-w-3xl">
              <VolunteerForm prefillLane={volunteerPrefillLane} prefillResource={volunteerPrefillResource} />
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="bring-5" aria-labelledby="bring-5-heading" className="scroll-mt-20">
        <ContentContainer>
          <SectionHeading
            id="bring-5-heading"
            eyebrow="Relational"
            title="Bring 5"
            subtitle="Invite five people you know into one conversation, event, or shift—small circles are how trust spreads."
          />
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button href="/get-involved/bring-5" variant="primary" className="min-h-[48px]">
              Bring 5 Friends
            </Button>
            <Button href={powerOf5OnboardingHref} variant="outline" className="min-h-[48px]">
              Walkthrough (demo)
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" id="local-team" aria-labelledby="local-team-heading" className="scroll-mt-20">
        <ContentContainer>
          <SectionHeading
            id="local-team-heading"
            eyebrow="County"
            title="Start a Local Team"
            subtitle="Build a steady rhythm where you live—neighbors, a calendar you can keep, and support from the campaign when you want it."
          />
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button href="/start-a-local-team" variant="primary" className="min-h-[48px]">
              Start a local team
            </Button>
            <Button href="/county-briefings" variant="outline" className="min-h-[48px]">
              County briefings
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="invite-kelly" aria-labelledby="invite-kelly-heading" className="scroll-mt-20">
        <ContentContainer>
          <SectionHeading
            id="invite-kelly-heading"
            eyebrow="Your table"
            title="Invite Kelly"
            subtitle="Put a room on the calendar—coffee, backyard, civic club, or county meeting. We align on expectations before anything is public."
          />
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button href="/events/request" variant="primary" className="min-h-[48px]">
              Invite Kelly
            </Button>
            <Button href="/host-a-gathering" variant="outline" className="min-h-[48px]">
              Host a gathering
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" id="donate-section" aria-labelledby="donate-heading" className="scroll-mt-20">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="donate-heading"
            eyebrow="If it works for you"
            title="Donate"
            subtitle="People-power is the center. If you can chip in, it helps travel, materials, and organizing across all 75 counties—no guilt if now is not the time."
          />
          <div className="mt-8">
            <Button href="/donate" variant="outline" className="min-h-[48px]">
              Donate
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
