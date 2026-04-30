import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
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
    a: "No. Reliability and curiosity beat résumés. If you can show up twice in a row, you can learn the rest.",
  },
  {
    q: "Is this a partisan club?",
    a: "We’re honest about values—but teams win when they welcome neighbors who don’t share every label. The work is civic, not performative.",
  },
  {
    q: "What if my county is mostly one party?",
    a: "So is much of Arkansas. The goal is lawful, respectful visibility—neighbor to neighbor, without surprise tricks.",
  },
  {
    q: "How much time is this?",
    a: "Most starter teams run on a light weekly touch and one monthly rhythm. We’ll help you right-size it to your life.",
  },
];

const teamRoles: { title: string; blurb: string }[] = [
  { title: "County lead", blurb: "Holds the rhythm, convenes the team, and is the steady line back to campaign staff." },
  { title: "Events lead", blurb: "Owns RSVPs, room basics, and clear volunteer jobs on event days." },
  { title: "Outreach lead", blurb: "Keeps invitations going—relational follow-up, institutions, and neighbor-to-neighbor invites." },
  { title: "Voter education lead", blurb: "Makes registration, deadlines, and voting steps plain enough to share at a kitchen table." },
  { title: "Media / story lead", blurb: "Captures honest field notes, photos, or quotes so your county’s truth travels accurately." },
];

const crossLinks: { label: string; href: string }[] = [
  { label: "Bring 5 Friends", href: "/get-involved/bring-5" },
  { label: "Invite Kelly", href: "/events/request" },
  { label: "County Fairs", href: "/events/county-fairs" },
  { label: "Community Election Integrity Tour", href: "/events/community-election-integrity-tour" },
  { label: "From the Road", href: "/from-the-road" },
];

export default function StartALocalTeamPage() {
  return (
    <>
      <PageHero
        eyebrow="County organizing"
        title="Start a local team"
        subtitle="Build county-level structure—neighbors who show up, host, and carry trust where statewide ads never will."
      >
        <Button href="#start-team-form" variant="primary">
          Start a local team
        </Button>
        <Button href="/get-involved/bring-5" variant="outline">
          Bring 5 Friends
        </Button>
        <Button href="/events/request" variant="outline">
          Invite Kelly
        </Button>
      </PageHero>

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
            <p className="mt-3 font-body text-sm text-kelly-text/60">TODO: CRM / workflow intake.</p>
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

      <FullBleedSection variant="subtle" padY aria-labelledby="crosslinks-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="crosslinks-heading"
            align="left"
            eyebrow="Plug in"
            title="Field plan links"
            subtitle="Local teams connect to fairs, tour stops, and relational invites."
          />
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {crossLinks.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="font-body text-sm font-semibold text-kelly-navy underline underline-offset-2 hover:text-kelly-text"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
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
