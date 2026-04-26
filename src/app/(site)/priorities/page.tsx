import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { PillarGrid } from "@/components/blocks/PillarGrid";
import { QuoteBand } from "@/components/blocks/QuoteBand";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import { getPageBlockPayload, type HeroBlockPayload } from "@/lib/content/page-blocks";
import { getHostOrVisitRequestHref } from "@/lib/county/official-links";
import { EditorialCampaignPhoto } from "@/components/about/EditorialCampaignPhoto";
import { trailPhotosForSlot } from "@/content/media/campaign-trail-assignments";

export const metadata: Metadata = pageMeta({
  title: "Priorities for the office",
  description:
    "Fair elections, transparent administration, and reliable service for all 75 counties—what the Arkansas Secretary of State actually does.",
  path: "/priorities",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

const pillars = [
  {
    title: "Protect the vote",
    body: "Fair, secure elections administered consistently—free from political pressure or favoritism. Voters should see one standard, clearly explained.",
  },
  {
    title: "Serve all 75 counties",
    body: "Clear guidance, dependable systems, and responsive support for county clerks and local election officials—rural and urban alike.",
  },
  {
    title: "Lead with transparency",
    body: "Plain-language information, open processes, and accountability in every function of the office—not selective openness.",
  },
  {
    title: "Business & nonprofit confidence",
    body: "Filings, registrations, and UCC tools should be predictable. When the rules are clear, Arkansas employers and civic organizations spend less time navigating confusion.",
  },
  {
    title: "Open the candidate doorway",
    body: "Running for office should not feel like insider knowledge. Filing instructions, deadlines, forms, and compliance basics should be easier for first-time candidates to understand.",
  },
  {
    title: "Accountability over insider shortcuts",
    body: "Voters and county clerks should see how decisions are made—not surprise rule changes, opaque rollouts, or favors for narrow interests. The Secretary of State should answer to the public, with clear standards and honest timelines.",
  },
  {
    title: "Back voters, not dark money",
    body: "Kelly will do everything the law and this office allow—and use her platform as Secretary of State—to fight secret spending and make money in politics easier to see. Overturning Citizens United is national and constitutional work; she will work alongside everyone pushing for that change, while she pushes just as hard on transparency and public integrity in Arkansas. She supports citizens using the ballot initiative and referendum to strengthen state campaign-finance law, and the same democratic tools for collective bargaining and other reforms when communities lead those measures. The job is a fair, understandable process and neutral administration—not picking winners on the issues.",
  },
  {
    title: "Support the people who run elections",
    body: "Election workers and local officials carry high-stakes responsibilities. They deserve clear guidance, practical training, reliable tools, and public respect.",
  },
] as const;

export default async function PrioritiesPage() {
  const hero = await getPageBlockPayload<HeroBlockPayload>("priorities", "hero");
  const presence = trailPhotosForSlot("priorities")[0];

  return (
    <>
      <PageHero
        tone="plan"
        eyebrow={hero?.eyebrow ?? "The work of the office"}
        title={hero?.title ?? "What the Secretary of State actually touches"}
        subtitle={
          hero?.subtitle ??
            "This campaign stays focused on administration Arkansans rely on: elections, public records, and the business services that keep our economy legible. If it isn’t part of this job, you won’t find it used as a prop here."
        }
      >
        <Button href="/get-involved" variant="primary">
          Get involved
        </Button>
        <Button href="/direct-democracy" variant="outlineOnDark">
          Ballot access & initiatives
        </Button>
      </PageHero>

      {presence ? (
        <FullBleedSection variant="subtle" className="!pt-[calc(var(--section-padding-y)*0.65)] !pb-0 lg:!pt-[calc(var(--section-padding-y-lg)*0.65)] lg:!pb-0">
          <ContentContainer wide className="py-6 md:py-10">
            <EditorialCampaignPhoto
              variant="breakout"
              photo={presence}
              kicker="Presence"
              caption="They say politics is getting down in the mud—in Arkansas, sometimes that means a literal meet-and-greet with the pigs."
            />
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <FullBleedSection variant="subtle" padY aria-labelledby="pillars-heading">
        <ContentContainer>
          <SectionHeading
            id="pillars-heading"
            eyebrow="Commitments"
            title="Priorities grounded in the office—not national noise"
            subtitle="The Secretary of State isn’t a legislature. The job is to administer the law faithfully, communicate clearly, and earn public trust every cycle."
          />
          <div className="mt-12">
            <PillarGrid items={[...pillars]} cols="2" />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <QuoteBand
        quote="Leadership in this role isn’t about headlines or ideology—it’s about steady, transparent administration and respect for the law."
        attribution="Kelly Grappe"
        variant="gold-band"
      />

      <FullBleedSection variant="subtle" padY aria-labelledby="election-workers-heading">
        <ContentContainer className="max-w-4xl">
          <SectionHeading
            id="election-workers-heading"
            align="left"
            eyebrow="Election administration"
            title="Support the people who make elections work"
            subtitle="Trustworthy elections depend on people as much as machines, forms, and statutes. The Secretary of State should help local officials and election workers do a hard job with clearer systems and stronger support."
            className="max-w-3xl"
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-card border border-deep-soil/10 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Training that travels</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                Counties should not have to reinvent the basics. Kelly will push for plain-language guidance, reusable training materials, and practical support that works in rural and urban election offices alike.
              </p>
            </div>
            <div className="rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Communication kits counties can use</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                Local offices should have ready-to-adapt voter education posts, public notice checklists, and crisis communication basics so accurate information can move faster than rumors.
              </p>
            </div>
            <div className="rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Systems, not blame</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                When workers are under-supported, the answer is not to point fingers at the people doing the work. The answer is to fix the system around them: staffing, communication, checklists, tools, and timelines.
              </p>
            </div>
            <div className="rounded-card border border-deep-soil/10 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Public confidence through clarity</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                Voters should understand how elections are administered, how safeguards work, and who is responsible for each step. Visibility builds trust before misinformation fills the gap.
              </p>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="transparency-heading">
        <ContentContainer className="max-w-4xl">
          <SectionHeading
            id="transparency-heading"
            align="left"
            eyebrow="Transparency"
            title="Make public records easier to find the first time"
            subtitle="A transparent office should not make Arkansans repeat the same request just because the answer is buried in a file cabinet, an inbox, or a hard-to-search archive."
            className="max-w-3xl"
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Publish the request trail</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                When the Secretary of State&apos;s office receives and fulfills a public-records request, the public should be able to see that a request was made, what records were released, and where to find them when disclosure is allowed by law.
              </p>
            </div>
            <div className="rounded-card border border-deep-soil/10 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Meeting records in one place</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                Public calendars should point people to agendas, minutes, recordings, and follow-up records whenever those materials can legally be shared.
              </p>
            </div>
            <div className="rounded-card border border-deep-soil/10 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Search before you ask again</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                Kelly wants a searchable public-records library for her office so Arkansans, reporters, researchers, and local officials can find prior FOIA responses without starting from zero.
              </p>
            </div>
            <div className="rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Build toward smarter access</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                The long-term vision is a plain-language, searchable tool that helps people understand what has already been requested and released, while protecting privacy, legal exemptions, and sensitive information.
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl font-body text-sm leading-relaxed text-deep-soil/70">
            The Secretary of State cannot unilaterally require every agency to use the same system, but the office can lead by example: start with its own records, prove the model works, and invite other public offices to make transparency easier for everyone.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="candidate-access-heading">
        <ContentContainer className="max-w-4xl">
          <SectionHeading
            id="candidate-access-heading"
            align="left"
            eyebrow="Candidate access"
            title="Running for office should not feel like insider knowledge"
            subtitle="The Secretary of State already touches the paperwork and calendars candidates rely on. Kelly wants that public information organized so everyday Arkansans can understand the path before they decide whether to run."
            className="max-w-3xl"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-card border border-deep-soil/10 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Plain-language filing paths</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                Office-specific instructions, deadlines, required forms, and campaign-finance basics should be easier to find and easier to follow.
              </p>
            </div>
            <div className="rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">First-time candidate checklists</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                Rural candidates, young leaders, working people, and first-time candidates should not need political connections to understand the paperwork sequence.
              </p>
            </div>
            <div className="rounded-card border border-deep-soil/10 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-lg font-bold text-deep-soil">Education before mistakes</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
                Short explainers, reminders, and workshops can reduce confusion while still respecting the law, campaign-finance rules, and the neutral role of the office.
              </p>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="trust-gap-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="trust-gap-heading"
            align="left"
            eyebrow="Why this race matters"
            title="Arkansas deserves a Secretary of State who works for voters—not for confusion"
            subtitle="When election rules, ballot access, or business filings move without plain explanation, families, small businesses, and local election officials pay the price. Kelly is running to put transparency, fair notice, and public trust back at the center of the office—especially where recent leadership has leaned toward partisan advantage, corporate favors, or closed-door decisions over accountability."
            className="max-w-3xl"
          />
          <ul className="mt-8 space-y-3 font-body text-base leading-relaxed text-deep-soil/85">
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              <span>
                <strong className="text-deep-soil">Record vs. rhetoric.</strong> Where public-record legislation or filings would narrow voter access, shield insider influence, or weaken accountability in how this office runs, Kelly will cite sources and explain the stakes in plain language—because voters should know who is steering the office.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              <span>
                <strong className="text-deep-soil">Above board, not soft.</strong> Hard truths belong in the daylight: if a policy helps powerful interests more than everyday Arkansans, Kelly will say so—and point to the public evidence.
              </span>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/civic-depth" variant="outline">
              Civic depth
            </Button>
            <Button href="/explainers" variant="outline">
              Explainers
            </Button>
            <Button href={getHostOrVisitRequestHref()} variant="primary">
              Request a visit
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="not-heading">
        <ContentContainer>
          <SectionHeading
            id="not-heading"
            align="left"
            eyebrow="Clarity"
            title="What you won’t see on this site"
            subtitle="Voters deserve honesty about jurisdiction. Healthcare, K–12 policy, and broad economic platforms belong in races where those decisions are made—not here."
            className="max-w-2xl"
          />
          <ul className="mt-10 max-w-3xl space-y-4 font-body text-base leading-relaxed text-deep-soil/80">
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              No pretend authority over issues outside the Secretary of State’s statutory role.
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              No confusing voters with national talking points that this office cannot fix.
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              Full respect for county officials and local election workers as partners—not punching bags.
            </li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="All parties welcome"
        title="Invite us to your meeting"
        description="Republican, Democratic, or civic—we want to talk with Arkansans where they already gather about how this office can serve you fairly."
        variant="primary-band"
      >
        <Button href={getHostOrVisitRequestHref()} variant="secondary">
          Request a visit
        </Button>
        <Button href="/about" variant="outline" className="border-cream-canvas/50 text-cream-canvas hover:bg-cream-canvas/10">
          About Kelly
        </Button>
      </CTASection>
    </>
  );
}
