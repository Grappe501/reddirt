import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ProcessSteps } from "@/components/blocks/ProcessSteps";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { ballotInitiativeProcessCopy as c } from "@/content/direct-democracy/ballot-initiative-process";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Arkansas ballot initiative process",
  description:
    "How the Attorney General’s title desk and the Secretary of State’s signature review decide whether Arkansans get to vote on citizen measures—process, last-decade examples, and why this office matters.",
  path: "/direct-democracy/ballot-initiative-process",
});

export default function BallotInitiativeProcessPage() {
  return (
    <>
      <PageHero eyebrow={c.hero.eyebrow} title={c.hero.title} subtitle={c.hero.subtitle}>
        <Button
          href="https://arkansasag.gov/resources/ballot-initiative-information/"
          variant="primary"
          className="inline-flex"
        >
          AG: ballot initiative information
        </Button>
        <Button href="https://www.sos.arkansas.gov/" variant="outline">
          Secretary of State
        </Button>
      </PageHero>

      <FullBleedSection padY variant="subtle" aria-labelledby="process-overview">
        <ContentContainer>
          <SectionHeading
            id="process-overview"
            align="left"
            eyebrow={c.roles.eyebrow}
            title={c.roles.title}
            subtitle={c.roles.subtitle}
            className="max-w-3xl"
          />
          <div className="mt-10 max-w-3xl space-y-8 font-body text-base leading-relaxed text-kelly-text/82 md:text-lg">
            <div>
              <h3 className="font-heading text-xl font-bold text-kelly-navy">{c.roles.ag.heading}</h3>
              {c.roles.ag.paragraphs.map((p) => (
                <p key={p.slice(0, 48)} className="mt-3">
                  {p}
                </p>
              ))}
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-kelly-navy">{c.roles.sos.heading}</h3>
              {c.roles.sos.paragraphs.map((p) => (
                <p key={p.slice(0, 48)} className="mt-3">
                  {p}
                </p>
              ))}
            </div>
            <p className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 text-sm text-kelly-text/75 shadow-[var(--shadow-soft)]">
              {c.roles.volunteerNote}
            </p>
            <p className="rounded-card border border-kelly-navy/20 bg-kelly-page p-5 text-sm leading-relaxed text-kelly-text/85 shadow-[var(--shadow-soft)]">
              <span className="font-heading font-bold text-kelly-text">Campaign position. </span>
              {c.roles.campaignPosition.replace(/^Campaign position\.\s*/, "")}
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="official-steps">
        <ContentContainer wide>
          <SectionHeading
            id="official-steps"
            eyebrow="Sequence"
            title="From title review to the statewide ballot"
            subtitle="Simplified. Sponsors and treasurers should work from current statutes, Attorney General guidance, and Secretary of State instructions."
          />
          <ProcessSteps className="mt-12" steps={[...c.steps]} id="ar-ballot-official" />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY variant="subtle" aria-labelledby="title-desk">
        <ContentContainer>
          <SectionHeading
            id="title-desk"
            align="left"
            eyebrow={c.titleDesk.eyebrow}
            title={c.titleDesk.title}
            subtitle={c.titleDesk.lead}
            className="max-w-3xl"
          />
          <ul className="mt-10 max-w-3xl space-y-8">
            {c.titleDesk.items.map((item) => (
              <li key={item.heading}>
                <h3 className="font-heading text-lg font-bold text-kelly-navy">{item.heading}</h3>
                <p className="mt-2 font-body text-base leading-relaxed text-kelly-text/82">{item.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl font-body text-base leading-relaxed text-kelly-text/82">{c.titleDesk.closer}</p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="signature-desk">
        <ContentContainer>
          <SectionHeading
            id="signature-desk"
            align="left"
            eyebrow={c.signatureDesk.eyebrow}
            title={c.signatureDesk.title}
            subtitle={c.signatureDesk.lead}
            className="max-w-3xl"
          />
          <ul className="mt-10 max-w-3xl space-y-8">
            {c.signatureDesk.items.map((item) => (
              <li key={item.heading}>
                <h3 className="font-heading text-lg font-bold text-kelly-navy">{item.heading}</h3>
                <p className="mt-2 font-body text-base leading-relaxed text-kelly-text/82">{item.body}</p>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY variant="subtle" aria-labelledby="courts">
        <ContentContainer>
          <SectionHeading
            id="courts"
            align="left"
            eyebrow={c.courts.eyebrow}
            title={c.courts.title}
            className="max-w-3xl"
          />
          <div className="mt-8 max-w-3xl space-y-4 font-body text-base leading-relaxed text-kelly-text/82 md:text-lg">
            {c.courts.paragraphs.map((p) => (
              <p key={p.slice(0, 56)}>{p}</p>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-kelly-navy text-kelly-page" aria-labelledby="why-sos">
        <ContentContainer>
          <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-kelly-gold">{c.whySos.eyebrow}</p>
          <h2 id="why-sos" className="mt-3 font-heading text-2xl font-bold md:text-3xl">
            {c.whySos.title}
          </h2>
          <div className="mt-6 max-w-3xl space-y-4 font-body text-base leading-relaxed text-kelly-page/88 md:text-lg">
            {c.whySos.paragraphs.map((p) => (
              <p key={p.slice(0, 56)}>{p}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/priorities#peoples-voice" variant="primary">
              The people’s constitutional voice
            </Button>
            <Button href="/office/why-this-race-matters" variant="outlineOnDark">
              Why this race matters
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY variant="elevated" aria-labelledby="trackers">
        <ContentContainer>
          <SectionHeading
            id="trackers"
            align="left"
            eyebrow="Trackers and search"
            title="Where to read more (outside this site)"
            subtitle="Independent encyclopedias and state search tools change often—bookmark the official pages first."
            className="max-w-3xl"
          />
          <ul className="mt-8 max-w-3xl list-disc space-y-3 pl-6 font-body text-base leading-relaxed text-kelly-text/82">
            <li>
              <a
                href="https://arkansasag.gov/resources/ballot-initiative-information/"
                className="font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
              >
                Arkansas Attorney General — ballot initiative information
              </a>
            </li>
            <li>
              <a
                href="https://arkansasag.gov/arkansass-lawyer/opinions-department/attorney-general-opinions-search/"
                className="font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
              >
                Attorney General opinion search
              </a>{" "}
              (ballot title decisions appear in published opinions)
            </li>
            <li>
              <a
                href="https://www.sos.arkansas.gov/"
                className="font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
              >
                Arkansas Secretary of State
              </a>{" "}
              — elections, filings, and verification
            </li>
            <li>
              <a
                href="https://ballotpedia.org/Arkansas_2026_ballot_measures"
                className="font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
              >
                Ballotpedia — Arkansas 2026 ballot measures
              </a>
            </li>
          </ul>
          <p className="mt-8 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/65">
            This campaign does not maintain a real-time list of every petition in the field. For which measures are actively
            circulating today, rely on sponsor announcements and the Attorney General’s published certifications for the
            election you care about.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="related">
        <ContentContainer>
          <SectionHeading id="related" align="left" eyebrow="On this site" title="Related pages" className="max-w-2xl" />
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/priorities#peoples-voice" variant="primary">
              The people’s constitutional voice
            </Button>
            <Button href="/resources" variant="outline">
              Resources hub
            </Button>
            <Button href="/explainers" variant="outline">
              Explainers
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
