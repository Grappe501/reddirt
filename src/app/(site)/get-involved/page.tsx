import type { Metadata } from "next";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
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
  title: "Get Involved",
  description:
    "The Power of 5, volunteer, host Kelly, or donate — this campaign grows through relationships.",
};

const sectionLinks: { label: string; href: string }[] = [
  { label: "Power of 5", href: "#bring-5" },
  { label: "Volunteer", href: "#volunteer" },
  { label: "Host Kelly", href: "#invite-kelly" },
  { label: "Stay connected", href: "#join" },
  { label: "Start a Local Team", href: "#local-team" },
  { label: "Donate", href: "#donate-section" },
];

const volunteerLanes: {
  id: string;
  title: string;
  blurb: string;
  nextLabel: string;
  nextHref: string;
}[] = [
  {
    id: "event-help",
    title: "Event help",
    blurb: "Table, greet, pass out accurate info, or be a steady face at something already on the calendar.",
    nextLabel: "Help at events",
    nextHref: "#represent-event",
  },
  {
    id: "calls-texts",
    title: "Calls / texts",
    blurb: "Reach neighbors with approved scripts and simple follow-up—voice or thumbs, your pick.",
    nextLabel: "Open guides",
    nextHref: "/resources/phone-banking",
  },
  {
    id: "door-knocking",
    title: "Door knocking",
    blurb: "Short, respectful conversations where you live—listen first, no pressure if someone passes.",
    nextLabel: "Raise your hand",
    nextHref: "#volunteer",
  },
  {
    id: "hosting",
    title: "Hosting",
    blurb: "Living room, break room, or civic space—invite a small group and keep the tone friendly.",
    nextLabel: "Host a gathering",
    nextHref: "/host-a-gathering",
  },
  {
    id: "integrity-tour",
    title: "Election Integrity Tour support",
    blurb: "Help with calm, education-first tour stops—logistics, invites, or room setup for plain Q&A.",
    nextLabel: "Tour overview",
    nextHref: "/events/community-election-integrity-tour",
  },
  {
    id: "story-media",
    title: "Story / media help",
    blurb: "Photos, short notes, or clips from the field so the story stays accurate and human.",
    nextLabel: "From the Road",
    nextHref: "/from-the-road",
  },
  {
    id: "data-logistics",
    title: "Data / logistics",
    blurb: "Lists, rides, supplies, light scheduling—the backstage work that keeps teams from wobbling.",
    nextLabel: "Note it on the form",
    nextHref: "#volunteer",
  },
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
      <MediaPageHero
        slotKey="get-involved.hero"
        layout="split"
        eyebrow="Participation ladder"
        title="Get Involved"
        subtitle="Stay connected. Volunteer. Activate your Power of 5. Host Kelly. Donate when you are ready."
      >
        <Button href="/get-involved/bring-5" variant="primary">
          Activate Your Power of 5 →
        </Button>
        <Button href="#volunteer" variant="outlineOnDark">
          Volunteer
        </Button>
        <Button href="/events/request" variant="outlineOnDark">
          Host Kelly
        </Button>
      </MediaPageHero>

      <FullBleedSection variant="subtle" className="!py-8" aria-labelledby="participation-ladder-heading">
        <ContentContainer className="max-w-3xl">
          <h2 id="participation-ladder-heading" className="font-heading text-xl font-bold text-kelly-ink">
            One ladder — pick your step
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 font-body text-sm leading-relaxed text-kelly-slate">
            <li>
              <strong className="text-kelly-navy">Stay connected</strong> —{" "}
              <a href="#join" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
                updates and a hello
              </a>
              . Not a shift assignment.
            </li>
            <li>
              <strong className="text-kelly-navy">Volunteer</strong> —{" "}
              <a href="#volunteer" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
                tell us how you can help
              </a>
              . Events, calls, doors, hosting, logistics.
            </li>
            <li>
              <strong className="text-kelly-navy">Bring 5</strong> —{" "}
              <a href="#bring-5" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
                five people you already know
              </a>
              .
            </li>
            <li>
              <strong className="text-kelly-navy">Local team</strong> —{" "}
              <a href="#local-team" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
                start or join neighbors in your county
              </a>
              .
            </li>
            <li>
              <strong className="text-kelly-navy">Donate</strong> —{" "}
              <a href="#donate-section" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
                when you are ready
              </a>
              . Never required to participate.
            </li>
          </ol>
          <p className="mt-4 font-body text-xs text-kelly-muted">
            Field Team onboarding for captains lives at{" "}
            <Link href="/volunteer" className="font-semibold text-kelly-navy underline">
              /volunteer
            </Link>
            — only if you want that track.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" className="!py-8" aria-labelledby="participation-clarity-heading">
        <ContentContainer className="max-w-3xl">
          <h2 id="participation-clarity-heading" className="font-heading text-xl font-bold text-kelly-ink">
            What you are signing up for
          </h2>
          <ul className="mt-4 space-y-3 font-body text-sm leading-relaxed text-kelly-slate">
            <li>
              <strong className="text-kelly-navy">Stay connected</strong> ({` `}
              <a href="#join" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
                #join
              </a>
              ) — campaign updates and ways to help. This is a mailing-list style connection, not an automatic volunteer
              shift assignment.
            </li>
            <li>
              <strong className="text-kelly-navy">Volunteer</strong> ({` `}
              <a href="#volunteer" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
                #volunteer
              </a>
              ) — tell us how you can help (events, calls, doors, hosting, logistics, and more). Remote help is welcome
              when the lane fits. Staff review submissions; nothing auto-publishes you into outreach lists beyond what
              you choose here.
            </li>
            <li>
              <strong className="text-kelly-navy">After you submit</strong> — your form creates a campaign intake record
              for follow-up. You should see a clear success message on this page. We do not invent automatic text/email
              blasts from this pass.
            </li>
            <li>
              <strong className="text-kelly-navy">Privacy</strong> — see how we handle information in our{" "}
              <Link href="/privacy" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
                Privacy
              </Link>{" "}
              policy. Do not mix volunteer consent with unrelated story or donation consent on the same checkbox.
            </li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

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
            No essay questions—just choose what sounds like you. You can switch lanes anytime.
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
            <Link className="font-semibold text-kelly-navy underline" href="/start-a-local-team">
              Start a local team
            </Link>
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" id="volunteer-ways" aria-labelledby="volunteer-ways-heading" className="scroll-mt-20">
        <ContentContainer>
          <SectionHeading
            id="volunteer-ways-heading"
            eyebrow="Pick a lane"
            title="Ways to volunteer"
            subtitle="Eight common doors in—each one is real work, none of them require a political résumé."
          />
          <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2">
            {volunteerLanes.map((lane) => (
              <li
                key={lane.id}
                id={lane.id}
                className="scroll-mt-24 rounded-card border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-heading text-lg font-bold text-kelly-text">{lane.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">{lane.blurb}</p>
                <p className="mt-4 font-body text-sm">
                  <Link
                    href={lane.nextHref}
                    className="font-semibold text-kelly-navy underline underline-offset-2 hover:text-kelly-text"
                  >
                    {lane.nextLabel} →
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="not-sure" aria-labelledby="not-sure-heading" className="scroll-mt-20">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="not-sure-heading"
            eyebrow="All good"
            title="Not sure where you fit?"
            subtitle="Tell us what you enjoy."
          />
          <div className="mt-8 rounded-card border border-kelly-navy/20 bg-kelly-page px-6 py-8 md:px-8">
            <p className="font-body text-base font-medium text-kelly-text/90">
              Start with Stay connected, or raise your hand on the volunteer form below.
            </p>
            <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">
              Tell us what you like doing, your county, and roughly how much time you have—we will match you without a
              quiz.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="#join" variant="outline" className="min-h-[48px]">
                Stay connected
              </Button>
              <Button href="#volunteer" variant="primary" className="min-h-[48px]">
                Volunteer signup
              </Button>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" id="volunteer-team" aria-labelledby="volunteer-heading" className="scroll-mt-20">
        <ContentContainer>
          <SectionHeading
            id="volunteer-heading"
            eyebrow="Sign up"
            title="Raise your hand"
            subtitle="Use whichever box fits—Stay connected for a quick hello, events for a clear field shift, or the volunteer form for skills and availability."
          />
          <div id="join" className="mt-10 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Stay connected</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Name, best way to reach you, and a sentence about what sounds fun. If you are hosting or inviting us local,
              say so.
            </p>
            <div className="mt-8 max-w-3xl">
              <JoinMovementForm />
            </div>
          </div>

          <div id="represent-event" className="mt-14 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Event help</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Tabling, greeting, or showing up—we will get you materials and a clear job for the day.
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
              Check what fits—even one line helps. Tips:{" "}
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
              </Link>
              .
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
            eyebrow="Power of 5"
            title="Your power is closer than you think"
            subtitle="Start with five people. This is the campaign’s independent Power of 5 organizing approach — people are more likely to participate when someone they know invites them in."
          />
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button href="/get-involved/bring-5" variant="primary" className="min-h-[48px]">
              Activate Your Power of 5 →
            </Button>
            <Button href="#volunteer" variant="outline" className="min-h-[48px]">
              Volunteer
            </Button>
            <Button href="/events/request" variant="outline" className="min-h-[48px]">
              Host Kelly
            </Button>
            <Button href="/donate" variant="outline" className="min-h-[48px]">
              Donate
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
            subtitle="Rhythm where you live—neighbors and a calendar you can keep."
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
            subtitle="Coffee, backyard, barn, or county room—we align before anything is public."
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
            subtitle="Time and introductions matter most. Chip in only if it fits your budget."
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
