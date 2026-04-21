import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import {
  getArVoterRegistrationLookupUrl,
  getReferForRegistrationHelpHref,
  getVoterRegistrationCenterHref,
  getVolunteerInCountyHref,
} from "@/lib/county/official-links";
import { getCampaignRegistrationBaselineDisplayCentral } from "@/config/campaign-registration-baseline";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { canEmbedOfficialArkansasVoterLookup, getVoterLookupUiMode } from "@/lib/voter-file/lookup-config";
import type { County, VoterFileSnapshot } from "@prisma/client";
import { cn } from "@/lib/utils";

const card =
  "rounded-2xl border border-deep-soil/10 bg-cream-canvas p-5 shadow-sm transition hover:border-red-dirt/25 hover:shadow-elevated";

type Props = {
  counties: Pick<County, "id" | "slug" | "displayName" | "regionLabel" | "leadName" | "leadTitle">[];
  focusCounty: Pick<County, "slug" | "displayName" | "regionLabel" | "leadName" | "leadTitle"> | null;
  latestSnapshot: VoterFileSnapshot | null;
};

export function VoterRegistrationCenter({ counties, focusCounty, latestSnapshot }: Props) {
  const officialUrl = getArVoterRegistrationLookupUrl();
  const mode = getVoterLookupUiMode();
  const embedFeasible = canEmbedOfficialArkansasVoterLookup();
  const baselineLabel = getCampaignRegistrationBaselineDisplayCentral();

  return (
    <>
      <PageHero
        eyebrow="Voter access"
        title="Voter registration center"
        subtitle="Kelly’s team built this hub so Arkansans aren’t alone in a maze of forms and deadlines. We’ll show you how we count new registrations, where your county stands, and how to reach a real person when you need paper-and-ink help—because Arkansas still doesn’t offer full online registration. Official confirmation stays with the state; we make the path human."
      >
        {focusCounty ? (
          <p className="max-w-2xl rounded-xl border border-red-dirt/20 bg-red-dirt/5 px-4 py-3 text-sm text-deep-soil/90">
            <span className="font-bold text-red-dirt">Local focus: {focusCounty.displayName}</span>
            {focusCounty.regionLabel ? <span className="text-deep-soil/70"> · {focusCounty.regionLabel}</span> : null}
            {focusCounty.leadName ? (
              <span className="mt-1 block">County lead: {focusCounty.leadName}{focusCounty.leadTitle ? ` — ${focusCounty.leadTitle}` : ""}</span>
            ) : null}
            <span className="mt-1 block text-xs text-deep-soil/65">
              County progress: see{" "}
              <Link className="font-semibold text-red-dirt underline-offset-2 hover:underline" href={`/counties/${focusCounty.slug}`}>
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

      <FullBleedSection padY className="border-b border-deep-soil/10 bg-cream-canvas" aria-labelledby="paper-title">
        <ContentContainer>
          <h2 className="font-heading text-xl font-bold text-deep-soil" id="paper-title">
            Paper registration — that’s how it works here
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-deep-soil/85">
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

      <FullBleedSection padY className="bg-washed-canvas" aria-labelledby="asof-explain">
        <ContentContainer>
          <h2 className="font-heading text-lg font-bold text-deep-soil" id="asof-explain">
            Baseline and “as of” dates
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-deep-soil/80">
            The campaign measures <strong>new registrations</strong> using Secretary of State voter file data, with a
            baseline of <strong>{baselineLabel}</strong> (Central Time). Each monthly (then weekly) import produces an{" "}
            <strong>as-of</strong> date for that file. County totals on this site are rolled up from those files and are{" "}
            <strong>campaign metrics</strong>—useful for organizing—not a replacement for the state’s official voter
            lookup.
          </p>
          {latestSnapshot ? (
            <p className="mt-2 text-sm text-deep-soil/65">
              Latest processed file in our system: <strong>{latestSnapshot.fileAsOfDate.toLocaleDateString()}</strong>{" "}
              (imported {latestSnapshot.importedAt.toLocaleDateString()})
            </p>
          ) : (
            <p className="mt-2 text-sm text-amber-900/80">
              A completed voter file snapshot is not in the database yet—county numbers will show “pending” until the first
              import runs.
            </p>
          )}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY id="official" aria-labelledby="official-title">
        <ContentContainer>
          <SectionHeading
            id="official-title"
            align="left"
            eyebrow="State confirmation"
            title="Arkansas official registration lookup"
            subtitle="We can’t frame the state’s tool inside this site—VoterView sends X-Frame-Options: SAMEORIGIN—so the experience stays native here and hands you off in a new tab to the real system."
          />
          <div className={cn(card, "mt-6 max-w-3xl")}>
            <p className="text-sm text-deep-soil/80">
              <strong>Embedding:</strong> {embedFeasible ? "Available" : "Not available"} (SAMEORIGIN blocks iframes on
              this domain). <strong>Recommended pattern:</strong> handoff in a new tab to the official tool.
            </p>
            {mode === "campaign_assist_only" ? (
              <p className="mt-2 text-sm text-deep-soil/75">
                This build is set to emphasize campaign assistance data first; the official link is still required for final
                confirmation.
              </p>
            ) : null}
            <p className="mt-4">
              <Button href={officialUrl} variant="primary">
                Open VoterView (official lookup)
              </Button>
            </p>
            <p className="mt-3 text-xs text-deep-soil/55">
              If the state moves this URL, we update{" "}
              <code className="rounded bg-deep-soil/5 px-1">NEXT_PUBLIC_AR_VOTER_LOOKUP_URL</code>.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-washed-canvas" aria-labelledby="county-rollup-title">
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
              <li className="text-sm text-deep-soil/70">No published counties yet.</li>
            ) : (
              counties.map((c) => (
                <li key={c.id}>
                  <div
                    className={cn(
                      card,
                      "flex h-full flex-col gap-2",
                      focusCounty?.slug === c.slug && "ring-2 ring-red-dirt/30",
                    )}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-dirt/90">
                      {c.regionLabel ?? "Arkansas"}
                    </p>
                    <p className="font-heading text-lg font-bold text-deep-soil">{c.displayName}</p>
                    <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <Button href={getVoterRegistrationCenterHref(c.slug)} variant="primary" className="w-full sm:w-auto">
                        Focus this county
                      </Button>
                      <Button href={`/counties/${c.slug}`} variant="outline" className="w-full sm:w-auto">
                        County command
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
            <p className="w-full min-[400px]:w-auto self-center text-xs text-deep-soil/55">
              A dedicated county SMS/email inbox can be added when CRM integration ships.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-washed-canvas" id="refer" aria-labelledby="refer-title">
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

      <FullBleedSection padY className="bg-washed-canvas" id="lookup-assist" aria-labelledby="assist-title">
        <ContentContainer>
          <SectionHeading
            id="assist-title"
            align="left"
            eyebrow="Campaign assistance (coming)"
            title="Person-level lookup — help, not a state seal"
          />
          <p className="mt-2 max-w-3xl text-sm text-deep-soil/80">
            We’re preparing a separate flow for volunteers to help voters using <strong>campaign-side</strong> voter file
            data—clearly labeled, always with a path to the official lookup. It will never claim to be live state
            confirmation.
          </p>
          <p className="mt-4">
            <Button href="/voter-registration/assistance" variant="outline">
              Campaign assistance lookup (preview)
            </Button>
          </p>
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
            <p className="text-sm text-deep-soil/80">
              Placeholder for a guided assistant. It will be labeled as <strong>non-official</strong> and will always defer
              confirmation to VoterView or, when available, clearly labeled <strong>campaign file assistance</strong> (see
              compliance copy below).
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="campaign-data-title" className="bg-deep-soil text-cream-canvas">
        <ContentContainer>
          <h2 className="font-heading text-lg font-bold" id="campaign-data-title">
            Campaign voter file (not the Secretary of State website)
          </h2>
          <div className="mt-3 max-w-3xl space-y-2 text-sm leading-relaxed text-cream-canvas/86">
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
            <p className="text-xs text-cream-canvas/60">
              This text is for voter education—not legal advice. The campaign can adjust wording with counsel for mailers
              and paid media.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
