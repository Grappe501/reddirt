import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { getArVoterRegistrationLookupUrl } from "@/lib/county/official-links";
import { cn } from "@/lib/utils";

const card =
  "rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 shadow-sm transition hover:border-kelly-navy/25 hover:shadow-elevated";

export function VoterRegistrationCenter() {
  const officialUrl = getArVoterRegistrationLookupUrl();

  return (
    <>
      <PageHero
        tone="plan"
        eyebrow="Voter access"
        title="Voter registration"
        subtitle="Check your registration on Arkansas VoterView — the official state lookup. If you need a paper form or a person to walk you through it, the campaign can help."
      >
        <Button href={officialUrl} variant="primary">
          Open VoterView
        </Button>
      </PageHero>

      <FullBleedSection padY className="border-b border-kelly-text/10 bg-kelly-page" aria-labelledby="paper-title">
        <ContentContainer>
          <h2 className="font-heading text-xl font-bold text-kelly-text" id="paper-title">
            Paper registration — that’s how it works here
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-kelly-text/85">
            <strong>Arkansas does not offer online voter registration.</strong> Most new voters use a paper application
            (or in-person paths the county clerk can explain). VoterView is where you confirm you are already
            registered. If you are not sure where to start, we will connect you with a volunteer.
          </p>
          <div className="mt-5">
            <Button href="/get-involved#join" variant="outline">
              Ask the campaign to reach out
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-kelly-wash" aria-labelledby="voter-ed-hub-title">
        <ContentContainer>
          <SectionHeading
            id="voter-ed-hub-title"
            align="left"
            eyebrow="The office"
            title="A voter education hub, not a scavenger hunt"
            subtitle="Kelly believes the Secretary of State should be proactive about voter education: clear dates, clear steps, plain-language ballot information, and explanations people can replay or share."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className={cn(card, "bg-white")}>
              <h3 className="font-heading text-base font-bold text-kelly-text">Key dates</h3>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                Registration deadlines, early voting windows, election day hours, and filing calendars should be easy to
                find in one place.
              </p>
            </div>
            <div className={cn(card, "bg-kelly-page")}>
              <h3 className="font-heading text-base font-bold text-kelly-text">What is on the ballot</h3>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                Voters deserve plain-language explanations of offices, measures, and what a vote can actually change.
              </p>
            </div>
            <div className={cn(card, "bg-white")}>
              <h3 className="font-heading text-base font-bold text-kelly-text">How voting works</h3>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                Early voting, absentee voting, ID questions, polling places, county clerk roles, and election commission
                roles should be explained before confusion spreads.
              </p>
            </div>
            <div className={cn(card, "bg-kelly-page")}>
              <h3 className="font-heading text-base font-bold text-kelly-text">Results and trust</h3>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                Public education should explain counting timelines, certification, safeguards, and audits in language
                people can understand.
              </p>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
