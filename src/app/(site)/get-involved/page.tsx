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
    "Volunteer, bring five friends, start a local team, invite Kelly, or give what you can—neighbor to neighbor, no insider resume required.",
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

const pathwayCards: { title: string; blurb: string; href: string; hint?: string }[] = [
  {
    title: "Volunteer",
    blurb: "Calls, tables, digital help, and clear local assignments when you want them.",
    href: "#volunteer",
    hint: "On this page",
  },
  {
    title: "Bring 5 Friends",
    blurb: "Trust grows when people invite people. Start with a small circle and build from there.",
    href: "/get-involved/bring-5",
  },
  {
    title: "Start a Local Team",
    blurb: "Name a rhythm for your county—listen, teach, show up—with mentor support from the campaign.",
    href: "/start-a-local-team",
  },
  {
    title: "Host / Invite Kelly",
    blurb: "Put a civic room on the calendar—party meeting, civic club, or community conversation.",
    href: "/events/request",
  },
  {
    title: "Donate",
    blurb: "Chip in if you can. Money isn’t the only way to build this campaign—it’s one lane among many.",
    href: "/donate",
  },
];

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
        <Button href="#choose-role" variant="primary">
          Choose your role
        </Button>
        <Button href="#volunteer" variant="outline">
          Volunteer
        </Button>
        <Button href="/get-involved/bring-5" variant="outline">
          Bring 5 Friends
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

      <FullBleedSection id="choose-role" aria-labelledby="choose-role-heading">
        <ContentContainer>
          <SectionHeading
            id="choose-role-heading"
            eyebrow="Start here"
            title="Choose your role"
            subtitle="You do not have to be a political insider. If you can make a call, host a conversation, bring five people, help at an event, or tell Kelly’s story in your community, there is a place for you."
          />
          <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {pathwayCards.map((c) => (
              <li key={c.title}>
                <Link
                  href={c.href}
                  className="group flex h-full flex-col rounded-card border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)] transition hover:border-kelly-navy/25"
                >
                  <span className="font-heading text-lg font-bold text-kelly-text group-hover:text-kelly-navy">{c.title}</span>
                  <span className="mt-3 flex-1 font-body text-sm leading-relaxed text-kelly-text/75">{c.blurb}</span>
                  {c.hint ? (
                    <span className="mt-4 font-body text-xs font-semibold uppercase tracking-wide text-kelly-navy/80">
                      {c.hint}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/70">
            Looking for something else?{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/voter-registration">
              Register to vote
            </Link>
            ,{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/listening-sessions">
              join a listening session
            </Link>
            , or explore{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/local-organizing">
              local organizing
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" aria-labelledby="volunteer-pillar-heading">
        <ContentContainer>
          <SectionHeading
            id="volunteer-pillar-heading"
            eyebrow="Hands-on"
            title="Volunteer"
            subtitle="Tell us how you can help and where you live—we’ll route you to real next steps, not a black hole."
          />
          <div id="join" className="mt-12 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Stay connected</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Share your contact info and optional context—especially if you’re inviting us to a local party or civic
              gathering. We route messages to real humans, not spam.
            </p>
            <div className="mt-8 max-w-3xl">
              <JoinMovementForm />
            </div>
          </div>

          <div id="represent-event" className="mt-14 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Show up where you live</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Many volunteers want a clear assignment. If you can table, greet, or simply be a steady presence at something
              already on the community calendar, start here—we will match you with training and materials.
            </p>
            <RepresentLocalEventPanel className="mt-8 max-w-3xl" />
            <p className="mt-6 max-w-3xl font-body text-sm text-kelly-text/70">
              Ready to send the form?{" "}
              <Link className="font-semibold text-kelly-navy underline" href={representLocalEventVolunteerHref}>
                Open the volunteer signup with this lane tagged
              </Link>{" "}
              or use the full form below.
            </p>
          </div>

          <div id="volunteer" className="mt-14 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Volunteer signup</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Tell us your availability and skills. If you can host county meetings or help with voter education, say
              so—we’ll follow up with concrete next steps.
            </p>
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
            <div className="mt-8 max-w-3xl">
              <VolunteerForm prefillLane={volunteerPrefillLane} prefillResource={volunteerPrefillResource} />
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="bring-5" aria-labelledby="bring-5-heading">
        <ContentContainer>
          <SectionHeading
            id="bring-5-heading"
            eyebrow="Relational"
            title="Bring 5 Friends"
            subtitle="The Power of 5 is simple: you commit to bringing five people into the work—into a conversation, an event, or a volunteer shift. Small circles beat loud lectures."
          />
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button href="/get-involved/bring-5" variant="primary" className="min-h-[48px]">
              How Bring 5 works
            </Button>
            <Button href={powerOf5OnboardingHref} variant="outline" className="min-h-[48px]">
              Start Power of 5 onboarding
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" id="local-team" aria-labelledby="local-team-heading">
        <ContentContainer>
          <SectionHeading
            id="local-team-heading"
            eyebrow="County rhythm"
            title="Start a Local Team"
            subtitle="Teams are how promises become patterns: listening schedules, teach-ins, field days, and neighbor networks that don’t vanish after the news cycle."
          />
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button href="/start-a-local-team" variant="primary" className="min-h-[48px]">
              Start a local team
            </Button>
            <Button href="/county-briefings" variant="outline" className="min-h-[48px]">
              County planning briefings
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="host-invite" aria-labelledby="host-invite-heading">
        <ContentContainer>
          <SectionHeading
            id="host-invite-heading"
            eyebrow="On the calendar"
            title="Host / Invite Kelly"
            subtitle="Put your county or civic room on the map—Republican, Democratic, independent, or strictly nonpartisan. We’ll walk through expectations before anything is public."
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

      <FullBleedSection variant="subtle" id="support-give" aria-labelledby="donate-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="donate-heading"
            eyebrow="If you can"
            title="Donate"
            subtitle="Some folks can give money; many others give time. Both matter. If a contribution fits your budget, it helps keep field programs and voter education within reach."
          />
          <div className="mt-8">
            <Button href="/donate" variant="outline" className="min-h-[48px]">
              Give to the campaign
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
