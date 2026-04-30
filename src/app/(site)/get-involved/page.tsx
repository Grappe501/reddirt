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
  title: "Volunteer with Kelly",
  description:
    "Help one person, one room, or one county at a time—events, calls, doors, hosting, Power of 5, and more. No political resume required.",
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

/** Each pathway: compact copy; next step stays small (no “save democracy” energy). */
const volunteerPathways: {
  title: string;
  what: string;
  who: string;
  next: { label: string; href: string };
}[] = [
  {
    title: "Help at events",
    what: "Be the friendly face at a table, parade line, or community booth—hand out accurate info and greet people who wander over.",
    who: "Good for folks who like short shifts, clear directions, and being around people without giving a speech.",
    next: { label: "See event help", href: "#represent-event" },
  },
  {
    title: "Make calls / send texts",
    what: "Reach neighbors through approved scripts and peer-to-peer tools—introductions, reminders, and honest answers.",
    who: "Works if you’d rather use your voice or thumbs than knock cold, and you can handle a little repetition.",
    next: { label: "Open guides + signup", href: "/resources/phone-banking" },
  },
  {
    title: "Knock doors",
    what: "Short, respectful conversations where you live—listen first, share what’s true, leave literature when it fits.",
    who: "Fits people who know their streets, like walking, and don’t mind polite “not today” answers.",
    next: { label: "Raise your hand on the form", href: "#volunteer" },
  },
  {
    title: "Host a gathering",
    what: "Reserve a living room, break room, or civic space for neighbors to meet the campaign or talk issues.",
    who: "Good if you can send invites, pour coffee, and keep the room respectful—evenings or weekends welcome.",
    next: { label: "Host a gathering", href: "/host-a-gathering" },
  },
  {
    title: "Join Power of 5",
    what: "Commit to five people you’ll personally invite—into a conversation, an event, or one volunteer shift.",
    who: "Perfect when you already have relationships and want a simple structure that doesn’t feel like a megaphone.",
    next: { label: "Bring 5 Friends", href: "/get-involved/bring-5" },
  },
  {
    title: "County fair team",
    what: "Help plan, pack, or staff fair days where Arkansans expect to see people they know, not slick staging.",
    who: "Great for hands-on helpers who like checklists, early mornings, and teamwork.",
    next: { label: "County Fairs hub", href: "/events/county-fairs" },
  },
  {
    title: "Election Integrity Tour support",
    what: "Support civic-education stops—logistics, local invites, or set-up so communities can ask plain questions.",
    who: "For people who like calm rooms, voter questions, and leaving politics at the door of the facts.",
    next: { label: "Tour overview", href: "/events/community-election-integrity-tour" },
  },
  {
    title: "Story / media helper",
    what: "Capture photos, short clips, or firsthand notes from the field so Kelly’s story spreads accurately.",
    who: "Good if you notice moments others miss and can follow simple media guidelines.",
    next: { label: "From the Road", href: "/from-the-road" },
  },
  {
    title: "County point team",
    what: "Be a dependable local contact—connect volunteers, share verified updates, and help one county stay organized.",
    who: "For steady organizers who answer texts and don’t need the spotlight.",
    next: { label: "Tour counties tracker", href: "/events/community-election-integrity-tour/counties" },
  },
  {
    title: "Data / logistics support",
    what: "Lists, scheduling, driving supplies, light data checks—the glue that keeps field plans from wobbling.",
    who: "Ideal if spreadsheets, maps, or “I’ll grab the keys” is how you show up.",
    next: { label: "Note it on the form", href: "#volunteer" },
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
      <PageHero
        eyebrow="Volunteer"
        title="Volunteer with Kelly"
        subtitle="You do not need political experience. You need a willingness to help one person, one room, one county at a time."
      >
        <Button href="#volunteer-team" variant="primary">
          Join the volunteer team
        </Button>
        <Button href="/get-involved/bring-5" variant="outline">
          Bring 5 Friends
        </Button>
        <Button href="/events/request" variant="outline">
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

      <FullBleedSection id="pathways" aria-labelledby="pathways-heading">
        <ContentContainer>
          <SectionHeading
            id="pathways-heading"
            eyebrow="Pick a lane"
            title="Volunteer pathways"
            subtitle="Every campaign needs a lot of small jobs. Choose what sounds doable today—you can always add another lane later."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
            {volunteerPathways.map((p, i) => (
              <article
                key={p.title}
                className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]"
              >
                <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-navy/85">
                  Pathway {i + 1}
                </p>
                <h3 className="mt-2 font-heading text-lg font-bold text-kelly-text">{p.title}</h3>
                <div className="mt-3 space-y-2 font-body text-sm leading-relaxed text-kelly-text/80">
                  <p>
                    <span className="font-semibold text-kelly-text/90">What it is: </span>
                    {p.what}
                  </p>
                  <p>
                    <span className="font-semibold text-kelly-text/90">Who it fits: </span>
                    {p.who}
                  </p>
                </div>
                <p className="mt-4 font-body text-sm">
                  <span className="font-semibold text-kelly-text/90">Next step: </span>
                  <Link
                    href={p.next.href}
                    className="font-semibold text-kelly-navy underline underline-offset-2 hover:text-kelly-text"
                  >
                    {p.next.label}
                  </Link>
                </p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/70">
            Not listed here?{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/voter-registration">
              Register to vote
            </Link>
            ,{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/listening-sessions">
              join a listening session
            </Link>
            , or browse{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/local-organizing">
              local organizing
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" id="not-sure" aria-labelledby="not-sure-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="not-sure-heading"
            eyebrow="No pressure"
            title="Not sure where you fit?"
            subtitle="Tell us what you like doing, what county you are in, and how much time you have. A real person will help match you—no quiz bowl, no shaming if you need to start small."
          />
          <div className="mt-8 scroll-mt-24 rounded-card border border-kelly-navy/15 bg-kelly-page px-6 py-8 md:px-8">
            <p className="font-body text-base leading-relaxed text-kelly-text/85">Volunteer intake coming soon.</p>
            <p className="mt-3 font-body text-sm text-kelly-text/60">TODO: connect to WorkflowIntake / CRM.</p>
            <p className="mt-6 font-body text-sm text-kelly-text/75">
              Until then, use{" "}
              <Link href="#join" className="font-semibold text-kelly-navy underline">
                Stay connected
              </Link>{" "}
              or the{" "}
              <Link href="#volunteer" className="font-semibold text-kelly-navy underline">
                volunteer signup
              </Link>{" "}
              below—we read every message.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="volunteer-team" aria-labelledby="volunteer-pillar-heading" className="scroll-mt-20">
        <ContentContainer>
          <SectionHeading
            id="volunteer-pillar-heading"
            eyebrow="Raise your hand"
            title="Join the volunteer team"
            subtitle="Share how you want to help and where you live. We’ll route you to something proportionate—an hour here, a fair day there—not a lifetime contract."
          />
          <div id="join" className="mt-12 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Stay connected</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Drop your contact info and a sentence or two about what sounds fun. If you’re inviting us to a local room,
              say so—we route to humans, not spam folders.
            </p>
            <div className="mt-8 max-w-3xl">
              <JoinMovementForm />
            </div>
          </div>

          <div id="represent-event" className="mt-14 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Help at events (clear assignment)</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Tabling, greeting, or simply being a steady presence counts. We’ll match you with training and materials—we
              won’t assume you already know the whole playbook.
            </p>
            <RepresentLocalEventPanel className="mt-8 max-w-3xl" />
            <p className="mt-6 max-w-3xl font-body text-sm text-kelly-text/70">
              Ready to send?{" "}
              <Link className="font-semibold text-kelly-navy underline" href={representLocalEventVolunteerHref}>
                Open signup with this lane tagged
              </Link>{" "}
              or use the full form below.
            </p>
          </div>

          <div id="volunteer" className="mt-14 scroll-mt-24">
            <h3 className="font-heading text-base font-bold text-kelly-text md:text-lg">Volunteer signup (skills & availability)</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Check the boxes that sound like you—even one is enough to start. If you can host county meetings or pitch in
              on voter education, say so; we’ll follow up with something concrete.
            </p>
            <p className="mt-4 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              <span className="font-semibold text-kelly-text/90">Postcards, calls, texts: </span>
              peek at the guides, then use the form so we can tag your signup—{" "}
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

      <FullBleedSection variant="subtle" id="bring-5" aria-labelledby="bring-5-heading">
        <ContentContainer>
          <SectionHeading
            id="bring-5-heading"
            eyebrow="Relational"
            title="Bring 5 Friends"
            subtitle="Small circles beat loud lectures. Commit to five people you’ll personally invite."
          />
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button href="/get-involved/bring-5" variant="primary" className="min-h-[48px]">
              How Bring 5 works
            </Button>
            <Button href={powerOf5OnboardingHref} variant="outline" className="min-h-[48px]">
              Walkthrough (demo)
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="local-team" aria-labelledby="local-team-heading">
        <ContentContainer>
          <SectionHeading
            id="local-team-heading"
            eyebrow="County rhythm"
            title="Start a Local Team"
            subtitle="Name a rhythm for your county: listening, teach-ins, and field days that don’t vanish after the news cycle."
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

      <FullBleedSection variant="subtle" id="host-invite" aria-labelledby="host-invite-heading">
        <ContentContainer>
          <SectionHeading
            id="host-invite-heading"
            eyebrow="On the calendar"
            title="Host / Invite Kelly"
            subtitle="Put your civic room on the map—we’ll align on expectations before anything is public."
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

      <FullBleedSection id="support-give" aria-labelledby="donate-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="donate-heading"
            eyebrow="If you can"
            title="Donate"
            subtitle="Time and introductions matter most here. If a contribution fits your budget, it helps keep programs within reach."
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
