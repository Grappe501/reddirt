import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { ProcessSteps } from "@/components/blocks/ProcessSteps";
import { QuoteBand } from "@/components/blocks/QuoteBand";
import { CTASection } from "@/components/blocks/CTASection";
import { DirectDemocracyCommitmentForm } from "@/components/forms/DirectDemocracyCommitmentForm";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { getPageBlockPayload, type HeroBlockPayload } from "@/lib/content/page-blocks";
import { CirculatingInitiativesSection } from "@/components/direct-democracy/CirculatingInitiativesSection";

export const metadata: Metadata = {
  title: "Ballot access & initiatives",
  description:
    "Direct democracy, campaign finance reform, and using Arkansas’s ballot tools—including initiatives on money in politics and collective bargaining when the law allows. The Secretary of State’s role is fair process and clarity.",
};

const pipelineSteps = [
  {
    step: 1,
    title: "Issue identification",
    description:
      "Neighbors name a problem with clarity: what happened, who it hurts, and what voters should decide.",
  },
  {
    step: 2,
    title: "Coalition building",
    description:
      "Trusted leaders align on language, scope, and responsibility—especially with communities most affected.",
  },
  {
    step: 3,
    title: "Education",
    description:
      "Plain-language briefings so voters know what they’re signing, what changes, and what doesn’t.",
  },
  {
    step: 4,
    title: "Signature collection",
    description:
      "Organized, respectful canvassing with legal guardrails—dignity for signers and volunteers alike.",
  },
  {
    step: 5,
    title: "Ballot placement",
    description:
      "If thresholds are met, the decision belongs to voters—not backroom deals.",
  },
] as const;

export default async function DirectDemocracyPage() {
  const hero = await getPageBlockPayload<HeroBlockPayload>("direct-democracy", "hero");

  return (
    <>
      <PageHero
        eyebrow={hero?.eyebrow ?? "Ballot access"}
        title={hero?.title ?? "Initiatives, referenda, and the Secretary of State’s role"}
        subtitle={
          hero?.subtitle ??
            "Elections matter—and so does the process that puts measures on the ballot. This page is about education, discipline, and protecting voter access without turning initiatives into confusion."
        }
      >
        <Button href="#commitment-network" variant="primary">
          Join the commitment network
        </Button>
        <Button href="/direct-democracy/ballot-initiative-process" variant="outline">
          Arkansas ballot process (state rules)
        </Button>
      </PageHero>

      <FullBleedSection aria-labelledby="why-dd-heading">
        <ContentContainer>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                id="why-dd-heading"
                eyebrow="Why it matters"
                title="Representation alone isn’t always enough"
                subtitle="When decisions happen over communities—fast, confusing, or closed off—people need a fair way to respond. Direct democracy is a safeguard, not a stunt."
                align="left"
                className="max-w-xl"
              />
            </div>
            <div className="space-y-6 font-body text-lg leading-relaxed text-deep-soil/80 lg:col-span-7">
              <p>
                Arkansas families shouldn’t need a law degree to understand what changed overnight. And voters
                shouldn’t be treated like spectators while power consolidates in back rooms.
              </p>
              <p>
                Used responsibly, ballot initiatives and referendums can restore negotiation power: when
                elected leaders know the public can act, they govern differently.
              </p>
              <p className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 font-heading text-xl font-bold text-deep-soil shadow-[var(--shadow-soft)]">
                If the people can act, power has to listen.
              </p>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" id="commitment-network" aria-labelledby="network-heading">
        <ContentContainer>
          <SectionHeading
            id="network-heading"
            eyebrow="Commitment"
            title="Referendum commitment network"
            subtitle="We’re building a large-scale network of Arkansans who pledge to sign referendum petitions when the legislature crosses clear lines on voter power—so issues can reach the ballot."
          />
          <div className="mt-10 max-w-3xl space-y-4">
            <div className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-8">
              <h3 className="font-heading text-2xl font-bold text-deep-soil">Raise your hand—responsibly</h3>
              <p className="mt-3 font-body text-base leading-relaxed text-deep-soil/75">
                This isn’t agreement on every issue. It’s a shared promise to protect the public’s right to decide
                when power tries to slip away.
              </p>
              <div className="mt-8">
                <DirectDemocracyCommitmentForm />
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed text-deep-soil/60">
              Legal thresholds, petition language, and compliance will be finalized with counsel before any
              signature collection begins.
            </p>
          </div>
          <p className="mt-8 max-w-3xl font-body text-sm leading-relaxed text-deep-soil/60">
            Target scale for organizing conversations: roughly <strong>65,000</strong> Arkansans committed to
            defend ballot access—large enough to signal seriousness and rebuild public leverage. Exact targets
            follow legal guidance.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection aria-labelledby="pipeline-heading">
        <ContentContainer wide>
          <SectionHeading
            id="pipeline-heading"
            eyebrow="How it moves"
            title="Ballot initiative pipeline"
            subtitle="Citizen-led initiatives should be disciplined: clear, coalition-backed, and understandable to neighbors—not rushed gimmicks."
          />
          <ProcessSteps className="mt-12" steps={[...pipelineSteps]} id="initiative-pipeline" />
        </ContentContainer>
      </FullBleedSection>

      <CirculatingInitiativesSection />

      <FullBleedSection variant="elevated" aria-labelledby="priority-heading">
        <ContentContainer>
          <SectionHeading
            id="priority-heading"
            eyebrow="Priorities"
            title="Where we start—not where we stop"
            subtitle="These are early coalition fronts. Each will require research, legal design, and community ownership."
          />
          <ResponsiveGrid cols="3" className="mt-12">
            <article className="rounded-card border border-deep-soil/10 bg-cream-canvas p-7 shadow-[var(--shadow-soft)] md:p-8">
              <h3 className="font-heading text-xl font-bold text-deep-soil">End dark money, confront Citizens United</h3>
              <p className="mt-3 font-body text-base leading-relaxed text-deep-soil/75">
                This campaign is committed to doing everything Kelly can, within the law, to get secret money out
                of our politics. <em>Citizens United</em> is a federal landmark—reversing it is bigger than one
                state office—Arkansas can still lead on disclosure, enforcement of state rules, and a Secretary of
                State who will not look away. We also back voters who use the ballot initiative to pass stronger
                state campaign-finance law when the process is clear and community-led.
              </p>
            </article>
            <article className="rounded-card border border-deep-soil/10 bg-cream-canvas p-7 shadow-[var(--shadow-soft)] md:p-8">
              <h3 className="font-heading text-xl font-bold text-deep-soil">Youth civic participation</h3>
              <p className="mt-3 font-body text-base leading-relaxed text-deep-soil/75">
                Explore responsible models—like school-board participation for older students—so young people
                learn democracy by practicing it where decisions hit home.
              </p>
            </article>
            <article className="rounded-card border border-deep-soil/10 bg-cream-canvas p-7 shadow-[var(--shadow-soft)] md:p-8">
              <h3 className="font-heading text-xl font-bold text-deep-soil">Civic tools for workers and communities</h3>
              <p className="mt-3 font-body text-base leading-relaxed text-deep-soil/75">
                The same initiative and referendum process that can strengthen finance law can also carry
                collective bargaining, worker power, and other issues Arkansans choose to run—if the law allows the
                measure on the ballot. This campaign supports citizens using those tools to write state policy, with
                legal design and local ownership. The Secretary of State’s role stays neutral: a fair, understandable
                process—forms, titles, and timelines—so voters know what they are signing and what can qualify.
              </p>
            </article>
          </ResponsiveGrid>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection aria-labelledby="youth-heading">
        <ContentContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <SectionHeading
                id="youth-heading"
                eyebrow="Youth"
                title="A participation pipeline—not a press hit"
                subtitle="Students live with school board decisions. When young people are included responsibly, civics stops being abstract."
                align="left"
                className="max-w-2xl"
              />
              <div className="mt-6 space-y-4 font-body text-base leading-relaxed text-deep-soil/78 lg:text-lg">
                <p>
                  We’re interested in models from other jurisdictions (for example, approaches discussed in states
                  like Maryland) as <strong>starting points for study</strong>—not promises of immediate
                  policy.
                </p>
                <p>
                  Any serious proposal must be legally vetted, educator-informed, and grounded in what parents and
                  students want for their communities.
                </p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <article className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]">
                  <h3 className="font-heading text-base font-bold text-deep-soil">Optional mock elections</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-deep-soil/70">
                    Schools that want to participate should have nonpartisan ballots, process guides, and
                    classroom-ready materials without a new mandate.
                  </p>
                </article>
                <article className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]">
                  <h3 className="font-heading text-base font-bold text-deep-soil">First-time voter tools</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-deep-soil/70">
                    Young Arkansans should be able to find clear, practical resources before their first ballot,
                    not after confusion sets in.
                  </p>
                </article>
                <article className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]">
                  <h3 className="font-heading text-base font-bold text-deep-soil">Youth service pathways</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-deep-soil/70">
                    Civic education can connect students with age-appropriate election service, mentorship, and
                    local learning opportunities.
                  </p>
                </article>
              </div>
            </div>
            <aside className="rounded-card border border-deep-soil/10 bg-deep-soil/[0.03] p-8 lg:col-span-5">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Responsible framing</h3>
              <ul className="mt-4 list-disc space-y-3 pl-5 font-body text-sm leading-relaxed text-deep-soil/70">
                <li>No legal specifics claimed on this page until counsel signs off.</li>
                <li>Educator partnership comes before any statewide program.</li>
                <li>Youth leadership should be mentorship-heavy and safety-conscious.</li>
                <li>Education comes before signature gathering—always.</li>
              </ul>
            </aside>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <QuoteBand
        quote="We’re not only asking for your vote—we’re building a system where your voice can’t be ignored."
        attribution="Direct democracy commitment"
        variant="gold-band"
      />

      <FullBleedSection variant="denim" aria-labelledby="civic-ed-heading">
        <ContentContainer>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <SectionHeading
                id="civic-ed-heading"
                eyebrow="Civic education"
                title="Participation works when people understand the process"
                subtitle="We’re investing in plain-language explainers, community briefings, and resources that turn confusing jargon into shared knowledge."
                align="left"
                className="max-w-2xl text-cream-canvas [&_h2]:text-cream-canvas [&_p]:text-cream-canvas/85 [&_p.mb-3]:text-sunlight-gold"
              />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-5 lg:items-start">
              <Button href="/resources" variant="secondary">
                Browse resources
              </Button>
              <Button
                href="/events"
                variant="outline"
                className="border-cream-canvas/45 text-cream-canvas hover:bg-cream-canvas/10"
              >
                Join a briefing
              </Button>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="Next step"
        title="Learn the process. Join the network. Stay ready."
        description={`${siteConfig.shortName} is committed to plain-language civic education and disciplined organizing around ballot access—grounded in what the Secretary of State’s office actually administers.`}
        variant="primary-band"
      >
        <Button href="#commitment-network" variant="secondary">
          Commitment network
        </Button>
        <Button href="/get-involved" variant="outline" className="border-cream-canvas/50 text-cream-canvas hover:bg-cream-canvas/10">
          Get involved
        </Button>
      </CTASection>
    </>
  );
}
