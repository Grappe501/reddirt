import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import {
  getArVoterRegistrationLookupUrl,
  getReferForRegistrationHelpHref,
} from "@/lib/county/official-links";
import { EditorialCampaignPhoto } from "@/components/about/EditorialCampaignPhoto";
import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { cn } from "@/lib/utils";

const card =
  "rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 shadow-sm transition hover:border-kelly-navy/25 hover:shadow-elevated";

type Props = {
  /** Optional campaign still — assigned via `trailPhotosForSlot("voterRegistration")` */
  trailPhoto?: CampaignTrailPhoto | null;
};

export async function VoterRegistrationCenter({ trailPhoto = null }: Props) {
  const officialUrl = getArVoterRegistrationLookupUrl();

  return (
    <>
      <PageHero
        tone="plan"
        eyebrow="Voter access"
        title="Voter registration center"
        subtitle="Official confirmation stays with the state. We help neighbors find the path—and a real person when paper help is needed."
      >
        <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button href={officialUrl} variant="primary" className="w-full min-[400px]:w-auto">
            Open VoterView (new tab)
          </Button>
        </div>
      </PageHero>

      {trailPhoto ? (
        <FullBleedSection variant="subtle" className="!pt-0" aria-label="Campaign trail photography">
          <ContentContainer wide className="py-8 md:py-10">
            <EditorialCampaignPhoto
              variant="breakout"
              photo={trailPhoto}
              kicker="With Arkansans"
              caption="Every registration story is local—paper, patience, and people who help neighbors get across the line."
            />
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <FullBleedSection padY className="border-b border-kelly-text/10 bg-kelly-page" aria-labelledby="paper-title">
        <ContentContainer>
          <h2 className="font-heading text-xl font-bold text-kelly-text" id="paper-title">
            Paper registration — that’s how it works here
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-kelly-text/85">
            <strong>Arkansas does not offer online voter registration.</strong> Most new voters use a paper application
            (or in-person paths the county clerk can explain). If you are not sure where to start, we will connect you with
            the campaign so a volunteer can follow up—whether you need a form, a ride, or someone to double-check the
            basics before you file.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-kelly-wash" aria-labelledby="voter-ed-hub-title">
        <ContentContainer>
          <SectionHeading
            id="voter-ed-hub-title"
            align="left"
            eyebrow="Future service model"
            title="A voter education hub, not a scavenger hunt"
            subtitle="Kelly believes the Secretary of State should be proactive about voter education: clear dates, clear steps, plain-language ballot information, and explanations people can replay or share."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className={cn(card, "bg-white")}>
              <h3 className="font-heading text-base font-bold text-kelly-text">Key dates</h3>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                Registration deadlines, early voting windows, election day hours, and filing calendars should be easy to find in one place.
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
                Early voting, absentee voting, ID questions, polling places, county clerk roles, and election commission roles should be explained before confusion spreads.
              </p>
            </div>
            <div className={cn(card, "bg-kelly-page")}>
              <h3 className="font-heading text-base font-bold text-kelly-text">Results and trust</h3>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                Public education should explain counting timelines, certification, safeguards, and audits in language people can understand.
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-kelly-text/70">
            The goal is service, not spin: a modern office should help Arkansans understand how to use their vote and where official answers live.
          </p>
          <div className="mt-10 border-t border-kelly-text/10 pt-8">
            <h3 className="font-heading text-xl font-bold text-kelly-text">Did You Know Arkansas?</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-kelly-text/75">
              A future Secretary of State voter education series should answer one useful question at a time, send people
              to official sources, and make the process feel understandable before misinformation has room to grow.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={cn(card, "bg-white")}>
                <h4 className="font-heading text-base font-bold text-kelly-text">One clear action</h4>
                <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                  Registration checks, absentee deadlines, polling place lookup, and voter plans should each get their
                  own simple explainer.
                </p>
              </div>
              <div className={cn(card, "bg-kelly-page")}>
                <h4 className="font-heading text-base font-bold text-kelly-text">Official trust signals</h4>
                <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                  Every post, video, and flyer should train voters to use official links and local election offices for
                  final answers.
                </p>
              </div>
              <div className={cn(card, "bg-white")}>
                <h4 className="font-heading text-base font-bold text-kelly-text">Myth clarification</h4>
                <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                  Plain-language FAQs can explain audits, chain of custody, certification, voting machines, and what
                  happens after polls close.
                </p>
              </div>
              <div className={cn(card, "bg-kelly-page")}>
                <h4 className="font-heading text-base font-bold text-kelly-text">Election snapshots</h4>
                <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                  After elections, visual summaries can show how Arkansans participated, how reporting moved, and what
                  the numbers mean.
                </p>
              </div>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY id="help" aria-labelledby="help-title">
        <ContentContainer>
          <SectionHeading
            id="help-title"
            align="left"
            eyebrow="Help"
            title="Get registration help"
            subtitle="Staff and volunteers can walk you through deadlines, same-day options where applicable, and what to do if something looks wrong."
          />
          <div className="mt-4 flex max-w-lg flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/get-involved#join" variant="primary" className="w-full min-[400px]:w-auto">
              Request 1:1 help
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-kelly-wash" id="refer" aria-labelledby="refer-title">
        <ContentContainer>
          <SectionHeading
            id="refer-title"
            align="left"
            eyebrow="Neighbors"
            title="Refer someone for help"
            subtitle="If someone you know needs a hand, send them here—or walk through the official lookup together on a call."
          />
          <Button href={getReferForRegistrationHelpHref()} variant="primary">
            Referral path (get involved)
          </Button>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY id="volunteer" aria-labelledby="volunteer-title">
        <ContentContainer>
          <SectionHeading
            id="volunteer-title"
            align="left"
            eyebrow="Teams"
            title="Join a county registration team"
            subtitle="We pair volunteers with local leads—especially in the run-up to the registration deadline."
          />
          <div className="mt-4 flex max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/get-involved#volunteer" variant="primary">
              Volunteer
            </Button>
            <Button href="/get-involved" variant="outline">
              Get involved (all paths)
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
