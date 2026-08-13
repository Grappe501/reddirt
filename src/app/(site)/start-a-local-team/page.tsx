import type { Metadata } from "next";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { LocalTeamForm } from "@/components/forms/LocalTeamForm";
import { FAQAccordion } from "@/components/organizing/FAQAccordion";
import { representLocalEventVolunteerHref } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Start a local team",
  description:
    "County-level organizing: local trust wins elections. Start with 2–5 people—supporters, gatherings, fairs, Power of 5, voter info.",
};

const faq = [
  {
    q: "Do I need experience?",
    a: `No. You do not need a campaign résumé, a political title, or a public-speaking habit. Reliability and curiosity beat a stack of credentials. If you can show up twice in a row and tell the truth about what you can take on, you can learn the rest.

A starter team in your county is 2–5 neighbors who will text back. One person can wear two hats at first. We point you to approved talking points, voter-info basics, and simple jobs—hosting, inviting, tabling with integrity, or helping someone check their registration—not improvising the law or picking a fight.

Fill out the form on this page with your county and who is in your first circle. A real organizer will follow up with something proportionate to your life, not a binder of homework.`,
  },
  {
    q: "Is this a partisan club?",
    a: `This is a campaign team for Kelly Grappe for Arkansas Secretary of State—not a closed club, not a debate society, and not a loyalty test at the door.

We’re honest about values: restore trust in the systems people depend on, protect ballot access, and make this office work for all 75 counties. Local teams win when they welcome neighbors who don’t share every label. The work is civic—listening, explaining process in plain language, and showing up where people already gather.

If someone wants to argue national talking points, that’s not the job. If they want to help a neighbor understand registration, host a small gathering, or represent the campaign with vetted materials, they belong in the circle.`,
  },
  {
    q: "What if my county is mostly one party?",
    a: `So is much of Arkansas. A Secretary of State still serves every county—rural and urban, whichever way the last race went. The goal is lawful, respectful visibility: neighbor to neighbor, without surprise tricks or treating anyone as a prop.

You are not asked to “flip” a county overnight or pretend the local map isn’t what it is. You are asked to be present: a named team people can find, honest voter information, and a human who will take a question seriously.

Start small. Coffee with two people you trust beats a loud event nobody asked for. If the room is mixed or mostly one party, the same rules apply—listen first, don’t overclaim, and leave people with a way to stay in touch if they want it.`,
  },
  {
    q: "How much time is this?",
    a: `Most starter teams run on a light weekly touch and one monthly rhythm. We’ll help you right-size it to your life—school, shift work, farm hours, and caregiving all count.

A weekly touch can be 20–40 minutes: a check-in text, one invite, or updating who you still need to talk with. A monthly rhythm is often one real gathering, fair table, or listening room—not a second full-time job.

Say your real availability on the form. If you can only do one Saturday a month, we plan around that. If you want to be county lead, we’ll talk about what that actually means before anyone puts your name on it.`,
  },
];

const teamRoles: { title: string; blurb: string }[] = [
  { title: "County lead", blurb: "Holds the rhythm, convenes the team, and is the steady line back to campaign staff." },
  { title: "Events lead", blurb: "Owns RSVPs, room basics, and clear volunteer jobs on event days." },
  { title: "Outreach lead", blurb: "Keeps invitations going—relational follow-up, institutions, and neighbor-to-neighbor invites." },
  { title: "Voter education lead", blurb: "Makes registration, deadlines, and voting steps plain enough to share at a kitchen table." },
  { title: "Media / story lead", blurb: "Captures honest field notes, photos, or quotes so your county’s truth travels accurately." },
];

export default async function StartALocalTeamPage() {
  return (
    <>
      <MediaPageHero
        slotKey="local-team.hero"
        layout="split"
        eyebrow="County organizing"
        title="Start a local team"
        subtitle="Build county-level structure—neighbors who show up, host, and carry trust where statewide ads never will."
      >
        <Button href="#start-team-form" variant="primary">
          Start a local team
        </Button>
        <Button href="/get-involved/bring-5" variant="outlineOnDark">
          Bring 5 Friends
        </Button>
        <Button href="/events/request" variant="outlineOnDark">
          Invite Kelly
        </Button>
      </MediaPageHero>

      <FullBleedSection padY aria-labelledby="why-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="why-heading"
            align="left"
            eyebrow="Why"
            title="Local trust wins elections"
            subtitle="People believe people they see year-round—not a stranger who drops in once. A named team in your county makes the campaign believable where it matters."
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="how-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading id="how-heading" align="left" eyebrow="How" title="Start with 2–5 people" subtitle="Small is stable." />
          <p className="mt-6 font-body text-base leading-relaxed text-kelly-text/85">
            You do not need a crowd on day one—a few committed neighbors who will text back is enough to begin. Add
            rhythm and roles as you grow.
          </p>
          <p className="mt-4 font-body text-sm text-kelly-text/70">
            Want the relational frame first?{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/get-involved/bring-5">
              Bring 5 Friends
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="what-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="what-heading"
            align="left"
            eyebrow="What"
            title="What your team does"
            subtitle="Pick a lane to start—you can stack more as you find your feet."
          />
          <ul className="mt-8 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>Identify supporters</li>
            <li>Host gatherings</li>
            <li>Support fairs / events</li>
            <li>Build Power of 5</li>
            <li>Share voter info</li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="roles-heading">
        <ContentContainer>
          <SectionHeading
            id="roles-heading"
            align="left"
            eyebrow="Roles"
            title="Starter roles"
            subtitle="One person can wear two hats at first—names help the work feel real, not bureaucratic."
          />
          <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {teamRoles.map((r) => (
              <li
                key={r.title}
                className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-heading text-lg font-bold text-kelly-text">{r.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/75">{r.blurb}</p>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="start-team-form" padY aria-labelledby="form-heading" className="scroll-mt-24">
        <ContentContainer>
          <SectionHeading
            id="form-heading"
            align="left"
            eyebrow="Next step"
            title="Start a local team"
            subtitle="Tell us your county and who is in your first circle—we will follow up with something proportionate."
          />
          <div className="mt-8 max-w-3xl rounded-card border border-dashed border-kelly-navy/25 bg-kelly-page px-6 py-8 md:px-8">
            <p className="font-body text-base font-medium text-kelly-text/90">Form coming soon.</p>
            <p className="mt-3 font-body text-sm text-kelly-text/60">A streamlined signup is on the way.</p>
            <p className="mt-5 font-body text-sm text-kelly-text/75">
              Until the new intake ships, the form below still reaches our organizer queue.
            </p>
          </div>
          <div className="mt-10 max-w-3xl">
            <LocalTeamForm id="start-local-team-form" />
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href={representLocalEventVolunteerHref} variant="outline" className="min-h-[48px]">
              Represent at local events
            </Button>
            <Button href="/resources#toolkit" variant="outline" className="min-h-[48px]">
              Starter guides
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="faq-heading">
        <ContentContainer>
          <SectionHeading
            id="faq-heading"
            align="left"
            eyebrow="FAQ"
            title="Questions at the kitchen table"
            subtitle="Short answers—ask a human for the longer version anytime."
          />
          <FAQAccordion className="mt-10 max-w-3xl" items={faq} />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
