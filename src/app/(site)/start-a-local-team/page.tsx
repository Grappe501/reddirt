import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { LocalTeamForm } from "@/components/forms/LocalTeamForm";
import { FAQAccordion } from "@/components/organizing/FAQAccordion";
import { ProcessSteps } from "@/components/blocks/ProcessSteps";
import { representLocalEventVolunteerHref } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Start a local team",
  description:
    "Lead a county volunteer team for the campaign—with mentor support, training hooks, and a dignified kickoff plan.",
};

const faq = [
  {
    q: "Do I need experience?",
    a: "No. We care more about reliability and curiosity than résumés. If you can show up twice in a row, you can learn the rest.",
  },
  {
    q: "Is this a partisan club?",
    a: "We’re honest about values—but teams win when they welcome neighbors who don’t share every label. The work is civic, not performative.",
  },
  {
    q: "What if my county is “red”?",
    a: "So is much of Arkansas. We organize for democracy and dignity anyway—patiently, publicly, and without surprise tricks.",
  },
  {
    q: "How much time is this?",
    a: "Most starter teams run on a weekly rhythm plus one bigger monthly gathering. We’ll help you right-size it to your life.",
  },
];

export default function StartALocalTeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Lead locally"
        title="Start a local team"
        subtitle="Teams are how promises become patterns: listening schedules, teach-ins, field days, and neighbor defense that doesn’t disappear after the news cycle."
      >
        <Button href="#start-team-form" variant="primary">
          Begin the form
        </Button>
        <Button href="/resources#toolkit" variant="outline">
          Read starter guides
        </Button>
        <Button href={representLocalEventVolunteerHref} variant="outline">
          Represent at local events
        </Button>
      </PageHero>

      <FullBleedSection padY aria-labelledby="what-is-heading">
        <ContentContainer>
          <SectionHeading
            id="what-is-heading"
            align="left"
            eyebrow="Definition"
            title="What a local team is"
            subtitle="Not a club for the loudest voices—a small public for your place."
          />
          <div className="mt-8 max-w-3xl space-y-4 font-body text-lg leading-relaxed text-kelly-text/85">
            <p>
              A local team is a named group of neighbors who commit to a rhythm: listen, teach what the state won’t
              explain, and act in ways people can see and join.
            </p>
            <p>
              It’s bigger than a group chat and smaller than a nonprofit board—usually 5–30 active people with clear
              roles and a culture of care.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="what-do-heading">
        <ContentContainer wide>
          <SectionHeading
            id="what-do-heading"
            eyebrow="Practice"
            title="What local teams do"
            subtitle="If you’re doing only one of these, you’re still building—teams deepen when they stack habits."
          />
          <ResponsiveGrid cols="3" className="mt-12">
            {[
              {
                t: "Listen on purpose",
                b: "Track themes from porches and breakrooms so policy isn’t guessed from headlines.",
              },
              {
                t: "Teach the mechanics",
                b: "Petitions, meetings, ballots—explain like family, not like lawyers (unless you are one).",
              },
              {
                t: "Show up visibly",
                b: "Hearings, solidarity actions, neighbor aid—public courage invites public membership.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-7 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-heading text-xl font-bold text-kelly-text">{x.t}</h3>
                <p className="mt-3 font-body text-base leading-relaxed text-kelly-text/75">{x.b}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="support-training-heading">
        <ContentContainer>
          <SectionHeading
            id="support-training-heading"
            align="left"
            eyebrow="Mentorship"
            title="Support and training you can expect"
            subtitle="We’re not dropping a PDF and vanishing—movement infrastructure means humans answering texts."
          />
          <ul className="mt-8 max-w-3xl space-y-3 font-body text-lg leading-relaxed text-kelly-text/85">
            <li>Field mentors who’ve hosted messy first meetings and lived to tell the story.</li>
            <li>Trainings on facilitation, safety planning, and digital hygiene for organizers.</li>
            <li>Pathways into statewide issue campaigns without dissolving local identity.</li>
          </ul>
          <p className="mt-6 max-w-3xl font-body text-sm text-kelly-text/60">
            {/* Future: training calendar sync + learning stubs */}
            Deeper LMS modules and certification flows are intentionally deferred.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="stages-heading">
        <ContentContainer wide>
          <SectionHeading
            id="stages-heading"
            eyebrow="Stages"
            title="How teams mature"
            subtitle="Not everyone moves at the same pace—that’s fine."
          />
          <ProcessSteps
            className="mt-12"
            steps={[
              { step: 1, title: "Spark", description: "A host, a date, and a room—honest invitation beats perfect branding." },
              { step: 2, title: "Circle", description: "Repeating gatherings with light roles: notes, hospitality, follow-up." },
              { step: 3, title: "Structure", description: "Simple agreements: how decisions happen, how people opt in/out." },
              { step: 4, title: "Campaign", description: "Public action with training—door knocks, hearings, ballot work." },
              { step: 5, title: "Anchor", description: "The team becomes a civic home that survives election seasons." },
            ]}
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="start-team-form" padY aria-labelledby="form-heading">
        <ContentContainer>
          <SectionHeading
            id="form-heading"
            align="left"
            eyebrow="Intake"
            title="Raise your hand as a team starter"
            subtitle="Same trusted form system as the rest of the site—your note lands in one pipeline organizers monitor."
          />
          <div className="mt-10 max-w-3xl">
            <LocalTeamForm id="start-local-team-form" />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="faq-heading">
        <ContentContainer>
          <SectionHeading
            id="faq-heading"
            align="left"
            eyebrow="FAQ"
            title="Questions organizers hear at the kitchen table"
            subtitle="Short answers—ask a human for the longer version anytime."
          />
          <FAQAccordion className="mt-10 max-w-3xl" items={faq} />
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="You’re not alone"
        title="Start small, stay public, keep kindness non-negotiable"
        description="We’ll meet you where you are—literally. That’s the point."
        variant="ink-band"
      >
        <Button href="#start-team-form" variant="primary" className="bg-kelly-page text-kelly-text hover:bg-kelly-page/90">
          Open the form
        </Button>
        <Button href="/events" variant="outline" className="border-kelly-page/40 text-kelly-page hover:bg-kelly-page/10">
          Trainings calendar
        </Button>
        <Button
          href={representLocalEventVolunteerHref}
          variant="outline"
          className="border-kelly-page/40 text-kelly-page hover:bg-kelly-page/10"
        >
          Represent locally
        </Button>
      </CTASection>
    </>
  );
}
