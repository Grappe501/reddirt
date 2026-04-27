import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import {
  getArVoterRegistrationLookupUrl,
  getReferForRegistrationHelpHref,
  getVolunteerInCountyHref,
} from "@/lib/county/official-links";
import { getCampaignRegistrationBaselineDisplayCentral } from "@/config/campaign-registration-baseline";
import { getJoinCampaignHref } from "@/config/external-campaign";
import type { County, VoterFileSnapshot } from "@prisma/client";
import type { StatewideVoterRollup } from "@/lib/voter-file/queries";
import { cn } from "@/lib/utils";

const card =
  "rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 shadow-sm transition hover:border-kelly-navy/25 hover:shadow-elevated";

type Props = {
  counties: Pick<County, "id" | "slug" | "displayName" | "regionLabel" | "leadName" | "leadTitle">[];
  focusCounty: Pick<County, "slug" | "displayName" | "regionLabel" | "leadName" | "leadTitle"> | null;
  latestSnapshot: VoterFileSnapshot | null;
  /** Rolled up from the same snapshot the county command pages use */
  statewide: StatewideVoterRollup | null;
  /**
   * When the database is unreachable, we still render this hub but skip Prisma-backed lists/metrics.
   * Explains the situation so copy is not mistaken for “no counties” / “no snapshot yet”.
   */
  liveMetricsUnavailableMessage?: string | null;
};

export function VoterRegistrationCenter({
  counties,
  focusCounty,
  latestSnapshot,
  statewide,
  liveMetricsUnavailableMessage = null,
}: Props) {
  const officialUrl = getArVoterRegistrationLookupUrl();
  const baselineLabel = getCampaignRegistrationBaselineDisplayCentral();

  return (
    <>
      <PageHero
        eyebrow="Voter access"
        title="Voter registration center"
        subtitle="Kelly’s team built this hub so Arkansans aren’t alone in a maze of forms and deadlines. We’ll show you how we count new registrations, where your county stands, and how to reach a real person when you need paper-and-ink help—because Arkansas still doesn’t offer full online registration. Official confirmation stays with the state; we make the path human."
      >
        {liveMetricsUnavailableMessage ? (
          <p className="max-w-2xl rounded-xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950/90">
            <strong className="font-bold">Live metrics temporarily unavailable.</strong> {liveMetricsUnavailableMessage}
          </p>
        ) : null}
        {focusCounty ? (
          <p className="max-w-2xl rounded-xl border border-kelly-navy/20 bg-kelly-navy/5 px-4 py-3 text-sm text-kelly-text/90">
            <span className="font-bold text-kelly-navy">Local focus: {focusCounty.displayName}</span>
            {focusCounty.regionLabel ? <span className="text-kelly-text/70"> · {focusCounty.regionLabel}</span> : null}
            {focusCounty.leadName ? (
              <span className="mt-1 block">County lead: {focusCounty.leadName}{focusCounty.leadTitle ? ` — ${focusCounty.leadTitle}` : ""}</span>
            ) : null}
            <span className="mt-1 block text-xs text-kelly-text/65">
              County progress: see{" "}
              <Link className="font-semibold text-kelly-navy underline-offset-2 hover:underline" href={`/counties/${focusCounty.slug}`}>
                county command
              </Link>{" "}
              for field metrics.
            </span>
          </p>
        ) : null}
        <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" id="as-of">
          <Button href={officialUrl} variant="primary" className="w-full min-[400px]:w-auto">
            Open VoterView (new tab)
          </Button>
          <Button href="#asof-explain" variant="outline" className="w-full min-[400px]:w-auto">
            How we count new registrations
          </Button>
        </div>
      </PageHero>

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
          <div className="mt-5 flex max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/get-involved#join" variant="primary" className="w-full min-[400px]:w-auto">
              Ask the campaign to reach out
            </Button>
            <Button href={getJoinCampaignHref()} variant="outline" className="w-full min-[400px]:w-auto">
              Open the public campaign site
            </Button>
          </div>
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

      <FullBleedSection padY className="bg-kelly-wash" aria-labelledby="asof-explain">
        <ContentContainer>
          <h2 className="font-heading text-lg font-bold text-kelly-text" id="asof-explain">
            Baseline and “as of” dates
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-kelly-text/80">
            The campaign measures <strong>new registrations</strong> using Secretary of State voter file data, with a
            baseline of <strong>{baselineLabel}</strong> (Central Time). Each monthly (then weekly) import produces an{" "}
            <strong>as-of</strong> date for that file. County totals on this site are rolled up from those files and are{" "}
            <strong>campaign metrics</strong>—useful for organizing—not a replacement for the state’s official voter
            lookup.
          </p>
          {latestSnapshot ? (
            <>
              <p className="mt-2 text-sm text-kelly-text/65">
                Latest processed file in our system: <strong>{latestSnapshot.fileAsOfDate.toLocaleDateString()}</strong>{" "}
                (imported {latestSnapshot.importedAt.toLocaleDateString()})
              </p>
              {statewide ? (
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-kelly-text/80">
                  <span className="text-kelly-text/70">Statewide (from the warehouse, all counties, same file):</span>{" "}
                  <strong>{statewide.newRegistrationsSinceBaseline.toLocaleString()}</strong> new registrations since
                  the campaign baseline; since the prior snapshot,{" "}
                  <strong>+{statewide.newRegistrationsSincePreviousSnapshot.toLocaleString()}</strong> in-file gains /{" "}
                  <strong>−{statewide.droppedSincePreviousSnapshot.toLocaleString()}</strong> no longer in file (net{" "}
                  {statewide.netChangeSincePreviousSnapshot >= 0 ? "+" : ""}
                  {statewide.netChangeSincePreviousSnapshot.toLocaleString()}) on{" "}
                  <strong>{statewide.snapshot.fileAsOfDate.toLocaleDateString()}</strong>
                  {statewide.totalRegisteredCount > 0 ? (
                    <>
                      . Registered voters in file (sum of counties):{" "}
                      <strong>{statewide.totalRegisteredCount.toLocaleString()}</strong>.
                    </>
                  ) : null}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-sm text-amber-900/80">
              {liveMetricsUnavailableMessage
                ? "Could not load voter file dates or statewide rollups—see the notice at the top of the page."
                : "A completed voter file snapshot is not in the database yet—county numbers will show “pending” until the first import runs."}
            </p>
          )}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-kelly-wash" aria-labelledby="county-rollup-title">
        <ContentContainer>
          <SectionHeading
            id="county-rollup-title"
            align="left"
            eyebrow="Field program"
            title="County registration progress"
            subtitle="Open a county to see its command page—goals, field metrics, and local ways to help."
          />
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {counties.length === 0 ? (
              <li className="text-sm text-kelly-text/70">
                {liveMetricsUnavailableMessage
                  ? "County list could not be loaded. When the database is available again, published counties will appear here."
                  : "No published counties yet."}
              </li>
            ) : (
              counties.map((c) => (
                <li key={c.id}>
                  <div
                    className={cn(
                      card,
                      "flex h-full flex-col gap-2",
                      focusCounty?.slug === c.slug && "ring-2 ring-kelly-navy/30",
                    )}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/90">
                      {c.regionLabel ?? "Arkansas"}
                    </p>
                    <p className="font-heading text-lg font-bold text-kelly-text">{c.displayName}</p>
                    <div className="mt-auto">
                      <Button href={`/counties/${c.slug}`} variant="primary" className="w-full sm:w-auto">
                        County Command
                      </Button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
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
            <p className="w-full min-[400px]:w-auto self-center text-xs text-kelly-text/55">
              A dedicated county SMS/email inbox can be added when CRM integration ships.
            </p>
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
            <Button
              href={focusCounty ? getVolunteerInCountyHref(focusCounty.slug) : "/get-involved#volunteer"}
              variant="primary"
            >
              Volunteer
            </Button>
            <Button href="/get-involved" variant="outline">
              Get involved (all paths)
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY id="ai-assist" aria-labelledby="ai-title">
        <ContentContainer>
          <SectionHeading
            id="ai-title"
            align="left"
            eyebrow="Guidance (future)"
            title="Helper & guided flows"
            subtitle="A future release can use AI to explain steps, plain-language Q&A, and routes—without ever storing or inferring your official registration status. OpenAI is not the source of truth."
          />
          <div className={cn(card, "mt-4 max-w-2xl")}>
            <p className="text-sm text-kelly-text/80">
              Placeholder for a guided assistant. It will be labeled as <strong>non-official</strong> and will always defer
              confirmation to VoterView or, when available, clearly labeled <strong>campaign file assistance</strong> (see
              compliance copy below).
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="campaign-data-title" className="bg-kelly-text text-kelly-page">
        <ContentContainer>
          <h2 className="font-heading text-lg font-bold" id="campaign-data-title">
            Campaign voter file (not the Secretary of State website)
          </h2>
          <div className="mt-3 max-w-3xl space-y-2 text-sm leading-relaxed text-kelly-page/86">
            <p>
              When you use <strong>campaign tools</strong> that search the voter file we import, results reflect our copy of
              the data, processed for organizing and follow-up. They are <strong>not</strong> the same as typing your
              information into the state’s VoterView in real time. Records can lag the Secretary of State’s systems;
              boundaries and status codes are only as accurate as our last file.
            </p>
            <p>
              <strong>Always</strong> use the official Arkansas registration lookup to confirm you are registered for an
              election if that is the legal standard you need. We surface campaign metrics (like “new since baseline”)
              under the same “as of” and review rules as the rest of the field dashboard.
            </p>
            <p className="text-xs text-kelly-page/60">
              This text is for voter education—not legal advice. The campaign can adjust wording with counsel for mailers
              and paid media.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
