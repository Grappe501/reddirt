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
    "Kelly is working all 75 counties—lasting trust is local. Start a county team: neighbors who show up, invite their five, and carry the campaign into rooms the field office can’t reach alone.",
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
  { title: "County lead", blurb: "Keeps the rhythm, convenes the team, and is the steady text back to the campaign." },
  { title: "Events lead", blurb: "Owns RSVPs, room basics, and making sure volunteers have clear jobs on the day." },
  { title: "Power of 5 lead", blurb: "Coaches five-at-a-time relational invites so growth doesn’t depend on one megaphone." },
  { title: "Voter registration lead", blurb: "Makes registration and deadline info neighbor-ready—paper, links, and patient follow-up." },
  { title: "Faith / community outreach lead", blurb: "Opens doors in churches, clubs, and civic tables where trust already lives." },
  { title: "County fair lead", blurb: "Coordinates fair presence—shifts, materials, and neighbor-friendly booth culture." },
  { title: "Story / media lead", blurb: "Captures photos, quotes, and honest field notes so local truth travels accurately." },
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
        subtitle="Kelly is working all 75 counties, but lasting trust has to be local. A local team helps carry the campaign into rooms the campaign cannot reach alone."
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
        <ContentContainer>
          <SectionHeading
            id="why-heading"
            align="left"
            eyebrow="Why"
            title="Make the campaign real where you live"
            subtitle="County teams turn a statewide race into something people can see and touch in their own community."
          />
          <p className="mt-6 max-w-3xl font-body text-base leading-relaxed text-kelly-text/85">
            People trust neighbors who show up consistently—not a one-off flyer or a stranger who disappears after the
            primary. A local team is how civic courage stops being a mood and becomes a habit.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="how-heading">
        <ContentContainer>
          <SectionHeading
            id="how-heading"
            align="left"
            eyebrow="How"
            title="Start small, stay steady"
            subtitle="You do not need thirty people on day one. You need a believable plan and a calendar you can keep."
          />
          <ul className="mt-8 max-w-3xl list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>2 to 5 people to begin</li>
            <li>One county or community focus</li>
            <li>One monthly rhythm (same week, same kind of touch)</li>
            <li>One contact list you actually use</li>
            <li>One event goal you can name out loud</li>
            <li>One Power of 5 circle so growth stays relational</li>
          </ul>
          <p className="mt-6 max-w-3xl font-body text-sm text-kelly-text/70">
            Need the relational frame first?{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/get-involved/bring-5">
              Bring 5 Friends
            </Link>{" "}
            walks the same philosophy step by step.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="what-heading">
        <ContentContainer>
          <SectionHeading
            id="what-heading"
            align="left"
            eyebrow="What"
            title="What local teams do"
            subtitle="Pick a few lanes to start; depth beats pretending you do everything at once."
          />
          <ul className="mt-8 max-w-3xl list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>Identify supporters and welcome skeptics without pressure</li>
            <li>Invite people to events—and make sure someone greets them at the door</li>
            <li>Recruit house parties and coffee meetups in ordinary rooms</li>
            <li>Help at county fairs and community booths</li>
            <li>Support Community Election Integrity Tour stops where your county is ready</li>
            <li>Share voter registration resources in plain language</li>
            <li>Collect local stories the campaign can lift up fairly</li>
            <li>Build county point teams so reliable info has a local address</li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="roles-heading">
        <ContentContainer>
          <SectionHeading
            id="roles-heading"
            align="left"
            eyebrow="Roles"
            title="Team roles (starter set)"
            subtitle="One person can wear two hats early on—clarity matters more than a big org chart."
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
            eyebrow="Raise your hand"
            title="Start a local team"
            subtitle="Tell us your county, your first small crew, and what kind of rhythm you can keep—we’ll help match training and backup."
          />
          <div className="mt-8 max-w-3xl rounded-card border border-kelly-navy/15 bg-kelly-page px-6 py-7 md:px-8">
            <p className="font-body text-base leading-relaxed text-kelly-text/85">Local team intake coming soon.</p>
            <p className="mt-3 font-body text-sm text-kelly-text/60">TODO: connect to CRM/workflow intake.</p>
            <p className="mt-5 font-body text-sm text-kelly-text/75">
              Until that pipeline is wired, the form below goes to the same organizer queue we monitor today.
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
            title="Work with the rest of the field plan"
            subtitle="Local teams don’t float alone—they tie into statewide tour stops, fairs, and the relational path."
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
