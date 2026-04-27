import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ProcessSteps } from "@/components/blocks/ProcessSteps";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Arkansas ballot initiative process",
  description:
    "How citizen measures get a ballot title, signatures, and filing deadlines in Arkansas—Attorney General, Secretary of State, and what voters should know.",
  path: "/direct-democracy/ballot-initiative-process",
});

const officialProcessSteps = [
  {
    step: 1,
    title: "Ballot title and popular name (Attorney General)",
    description:
      "Sponsors file proposed language with the Arkansas Attorney General, who reviews the popular name and ballot title for clarity and compliance. The Attorney General may request changes; when a title is certified, sponsors may print petitions with that language.",
  },
  {
    step: 2,
    title: "Petition and circulation",
    description:
      "After certification, committees circulate official petitions. Circulators should follow all rules for who may sign, witness requirements, and honest representation of the measure. This page is education, not legal advice.",
  },
  {
    step: 3,
    title: "Valid signatures (thresholds for 2026)",
    description:
      "Targets are set as a percentage of votes for Governor in the last gubernatorial election. For 2026, widely published figures are about 90,704 for an initiated constitutional amendment, about 72,563 for an initiated state statute, and about 54,422 for a veto referendum. Confirm the exact numbers each cycle with the Secretary of State.",
  },
  {
    step: 4,
    title: "File with the Secretary of State",
    description:
      "Completed petitions are filed with the Arkansas Secretary of State for verification. For a November general election, citizen initiatives are typically due several months before Election Day (often around early July for a November race—verify the official calendar for the year you are filing).",
  },
  {
    step: 5,
    title: "Ballot placement and the vote",
    description:
      "If enough valid signatures are verified, the measure is placed on the ballot for a statewide vote. Legislatively referred measures from the General Assembly skip signature gathering but still appear on the same ballot—see the trackers below.",
  },
] as const;

export default function BallotInitiativeProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="Civic how-to · Arkansas"
        title="How initiatives and referenda reach the ballot"
        subtitle="A plain-language path through the state’s process: the Attorney General certifies what voters read; the Secretary of State receives petitions and runs verification. This page is educational—not legal advice."
      >
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
            eyebrow="State roles"
            title="Two big offices, two different jobs"
            subtitle="Voters see one ballot—the process behind it is split between review of language and administration of signatures."
            className="max-w-3xl"
          />
          <div className="mt-10 max-w-3xl space-y-4 font-body text-base leading-relaxed text-kelly-text/82 md:text-lg">
            <p>
              <strong>Attorney General</strong> certifies the ballot title and popular name so voters are not misled.
              That step must succeed before most committees circulate petitions at scale.
            </p>
            <p>
              <strong>Secretary of State</strong> receives filed petitions, applies counting and verification rules, and
              operates the election infrastructure that lists qualified measures for voters.
            </p>
            <p className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 text-sm text-kelly-text/75 shadow-[var(--shadow-soft)]">
              Treat signature gathering as a responsibility: one honest signature at a time, with no shortcuts around
              witness rules or eligibility.
            </p>
            <p className="mt-4 rounded-card border border-kelly-navy/20 bg-kelly-page p-5 text-sm leading-relaxed text-kelly-text/85 shadow-[var(--shadow-soft)]">
              <span className="font-heading font-bold text-kelly-text">Campaign position. </span>
              We believe the ballot initiative process should use <strong>volunteers only</strong> to collect
              signatures—committees can raise and spend for marketing, training, and materials, but not to pay canvassers
              by the signature or the hour. In our view, paid canvassing is the same class of problem as dark money: it
              lets cash substitute for real consent. What statute allows today is for the General Assembly and voters to
              decide; this is the standard we will advocate for in public and support in law.
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
          <ProcessSteps className="mt-12" steps={[...officialProcessSteps]} id="ar-ballot-official" />
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
              </a>{" "}
              (nonprofit tracker: potential citizen measures, legislatively referred items, and context)
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
          <SectionHeading
            id="related"
            align="left"
            eyebrow="On this site"
            title="Related pages"
            className="max-w-2xl"
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/direct-democracy" variant="primary">
              Ballot access &amp; initiatives
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
