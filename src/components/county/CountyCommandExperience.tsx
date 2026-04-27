import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { roadPostExcerpt, roadPostImageSrc } from "@/lib/content/content-hub-queries";
import type { CountyPageSnapshot } from "@/lib/county/get-county-command-data";
import {
  getArVoterRegistrationLookupUrl,
  getCountyRegistrationTeamHref,
  getHostOrVisitRequestHref,
  getLocalIssueSubmissionHref,
  getReferForRegistrationHelpHref,
  getRegistrationHelpHref,
  getVoterRegistrationCenterHref,
  getVolunteerInCountyHref,
} from "@/lib/county/official-links";
import { getCampaignRegistrationBaselineDisplayCentral } from "@/config/campaign-registration-baseline";
import { cn } from "@/lib/utils";
import { PublicCampaignEventCard } from "@/components/calendar/PublicCampaignEventCard";

const introFallback =
  "Kelly’s Arkansas campaign runs through all 75 counties—this page is your field sheet: who’s leading, what’s happening, and how we’re growing the electorate where you live.";

const card =
  "rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 shadow-sm transition hover:border-kelly-navy/25 hover:shadow-elevated";

const fmt = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? "—" : n.toLocaleString("en-US");

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
};

const fmtDateLong = (d: Date | string) => {
  const x = typeof d === "string" ? new Date(d) : d;
  return x.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

function formatDistanceAgo(d: Date) {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function CountyCommandExperience({ data }: { data: CountyPageSnapshot }) {
  const { county, latestVoterMetrics, latestVisitPost, latestStoryPost, mediaGallery, nextPublicCampaignEvent, upcomingPublicCampaignEvents } =
    data;
  const stats = county.campaignStats;
  const vm = latestVoterMetrics;
  const demo = county.demographics;
  const centralBaselineLabel = getCampaignRegistrationBaselineDisplayCentral();
  const regSinceLabel = `New registrations since ${centralBaselineLabel} (campaign baseline)`;
  const voterUrl = getArVoterRegistrationLookupUrl();
  const newSinceBaseline =
    vm?.newRegistrationsSinceBaseline ?? stats?.newRegistrationsSinceBaseline ?? null;
  const regGoal = vm?.countyGoal ?? stats?.registrationGoal ?? null;
  const progressPct = vm?.progressPercent ?? null;

  return (
    <>
      <PageHero
        eyebrow={county.heroEyebrow ?? county.regionLabel ?? "Arkansas county command"}
        title={county.displayName}
        subtitle={county.heroIntro?.trim() || introFallback}
      >
        {county.leadName ? (
          <p className="max-w-2xl text-base font-bold text-kelly-navy/95">
            County lead: {county.leadName}
            {county.leadTitle ? <span className="font-medium text-kelly-text/90"> — {county.leadTitle}</span> : null}
          </p>
        ) : null}
        <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <Button href={getVoterRegistrationCenterHref(county.slug)} variant="primary" className="w-full min-[480px]:w-auto">
            Voter registration center
          </Button>
          <Button href={voterUrl} variant="secondary" className="w-full min-[480px]:w-auto">
            State lookup (official)
          </Button>
          <Button href={getRegistrationHelpHref()} variant="outline" className="w-full min-[480px]:w-auto">
            Get registration help
          </Button>
          <Button href={getVolunteerInCountyHref(county.slug)} variant="outline" className="w-full min-[480px]:w-auto">
            Volunteer here
          </Button>
          <Button href={getHostOrVisitRequestHref()} variant="subtle" className="w-full min-[480px]:w-auto">
            Host a gathering / request a visit
          </Button>
        </div>
      </PageHero>

      <FullBleedSection padY className="bg-kelly-wash" aria-labelledby="scoreboard-title">
        <ContentContainer>
          <SectionHeading
            id="scoreboard-title"
            align="left"
            eyebrow="Field metrics"
            title="County scoreboard"
            subtitle="Numbers come from our voter file warehouse when a snapshot completes: baseline date is campaign-wide (see voter center). If a row is pending, the pipeline is still catching up."
          />
          <p className="mt-4 text-xs text-kelly-text/60">
            Campaign baseline (all counties): <strong>{centralBaselineLabel}</strong>
            {vm ? (
              <>
                {" "}
                · File as of: <strong>{fmtDateLong(vm.asOfDate)}</strong>
              </>
            ) : null}
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7" role="list">
            <ScoreItem label="Registration goal" value={fmt(regGoal)} />
            <ScoreItem
              label={regSinceLabel}
              value={newSinceBaseline == null ? "—" : fmt(newSinceBaseline)}
            />
            <ScoreItem
              label="Registered voters (last file)"
              value={vm?.totalRegisteredCount == null ? "—" : fmt(vm.totalRegisteredCount)}
              hint="From SOS-imported roll in warehouse"
            />
            <ScoreItem
              label="Progress to goal"
              value={progressPct == null ? "—" : `${Math.round(progressPct)}%`}
              hint={regGoal ? `Goal ${fmt(regGoal)}` : undefined}
            />
            <ScoreItem label="Campaign visits" value={fmt(stats?.campaignVisits)} />
            <ScoreItem
              label="Active volunteers (field)"
              value={stats?.volunteerCount == null ? "—" : fmt(stats.volunteerCount)}
              hint={stats?.volunteerTarget ? `Target ${fmt(stats.volunteerTarget)}` : undefined}
            />
            <ScoreItem
              label="Upcoming events"
              value={upcomingPublicCampaignEvents.length > 0 ? String(upcomingPublicCampaignEvents.length) : "0"}
            />
          </ul>
          {vm ? (
            <p className="mt-4 text-xs text-kelly-text/55">
              Voter file as of {fmtDateLong(vm.asOfDate)} · Last import: +{fmt(vm.newRegistrationsSincePreviousSnapshot)} new
              registrants / {fmt(vm.droppedSincePreviousSnapshot)} no longer in file vs previous snapshot · Net{" "}
              {vm.netChangeSincePreviousSnapshot >= 0 ? "+" : ""}
              {fmt(vm.netChangeSincePreviousSnapshot)}. Review: {vm.reviewStatus.toLowerCase().replace(/_/g, " ")}.
            </p>
          ) : stats?.dataPipelineSource ? (
            <p className="mt-4 text-xs text-kelly-text/55">
              Data pipeline: {stats.dataPipelineSource}
              {stats.pipelineLastSyncAt ? ` · Last attempt ${formatDistanceAgo(stats.pipelineLastSyncAt)}` : null}
            </p>
          ) : null}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="happenings-title">
        <ContentContainer>
          <SectionHeading
            id="happenings-title"
            align="left"
            eyebrow="Momentum"
            title="What’s happening here"
            subtitle="Latest field notes, story, and media in this county—plus the next time we’re on the ground together."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <HappenCard
              kicker="Latest campaign stop"
              post={latestVisitPost}
              empty="When we announce a visit or stop, it will show here (tag the county on road posts, or set kind to Road update)."
            />
            <HappenCard
              kicker="Latest road story"
              post={latestStoryPost}
              empty="Subscribe to field updates in this county—stories with this county’s tag will surface automatically."
            />
            <div className={cn(card, "lg:col-span-2")}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">Photo &amp; video</p>
              {mediaGallery.length > 0 ? (
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {mediaGallery.map((m) => (
                    <li key={m.id} className="relative aspect-square overflow-hidden rounded-xl border border-kelly-text/10">
                      {m.kind === "IMAGE" && m.publicUrl ? (
                        <Image src={m.publicUrl} alt={m.title ?? "County media"} fill className="object-cover" unoptimized={m.publicUrl.startsWith("http")} />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-kelly-text/5 p-2 text-center text-xs text-kelly-text/60">
                          {m.kind} · {m.title ?? "Media"}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-kelly-text/70">
                  The gallery will fill in as we publish approved, county-tagged media from the campaign library.
                </p>
              )}
            </div>
            <div className="lg:col-span-2">
              {nextPublicCampaignEvent ? (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">Next on the public calendar</p>
                  <p className="mt-0.5 text-xs text-kelly-text/55">
                    Pulled from CampaignOS—only events published for the public site in this county.
                  </p>
                  <div className="mt-2 max-w-2xl">
                    <PublicCampaignEventCard event={nextPublicCampaignEvent} />
                  </div>
                  {upcomingPublicCampaignEvents.length > 1 ? (
                    <p className="mt-2 text-sm text-kelly-text/70">
                      {upcomingPublicCampaignEvents.length - 1} more on the{" "}
                      <Link className="font-semibold text-kelly-navy hover:underline" href="/campaign-calendar">
                        campaign calendar
                      </Link>
                      .
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className={card}>
                  <p className="text-sm text-kelly-text/80">
                    No published public events in this county yet. Browse the full{" "}
                    <Link className="font-semibold text-kelly-navy underline-offset-2 hover:underline" href="/campaign-calendar">
                      campaign calendar
                    </Link>{" "}
                    for statewide stops, or ask field staff to publish when a date is set.
                  </p>
                </div>
              )}
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-kelly-wash" aria-labelledby="intel-title">
        <ContentContainer>
          <SectionHeading
            id="intel-title"
            align="left"
            eyebrow="Trusted context"
            title="What matters here"
            subtitle="Public, cited snapshots—so organizers understand scale and need. Replaced with verified Census/ACS or SOS pulls as the research queue clears."
          />
          {demo ? (
            <>
              <p className="text-xs text-kelly-text/55">
                Source: {demo.source}
                {demo.sourceDetail ? ` — ${demo.sourceDetail}` : ""}
                {demo.asOfYear ? ` · ${demo.asOfYear}` : ""} · Data review: {demo.reviewStatus.toLowerCase().replace(/_/g, " ")} ·
                {demo.fetchedAt ? ` Fetched ${fmtDate(demo.fetchedAt.toISOString())} ·` : " "}
                {demo.updatedAt && `Row updated ${fmtDateLong(demo.updatedAt)}`}
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
                <IntelCard label="Population" value={fmt(demo.population)} />
                <IntelCard label="Voting-age population" value={fmt(demo.votingAgePopulation)} />
                <IntelCard label="Median household income" value={demo.medianHouseholdIncome != null ? `$${fmt(demo.medianHouseholdIncome)}` : "—"} />
                <IntelCard
                  label="Poverty rate"
                  value={demo.povertyRatePercent == null ? "—" : `${demo.povertyRatePercent.toFixed(1)}%`}
                />
                <IntelCard
                  label="Bachelor’s+ (approx.)"
                  value={demo.bachelorsOrHigherPercent == null ? "—" : `${demo.bachelorsOrHigherPercent.toFixed(1)}%`}
                />
                <IntelCard
                  label="Labor & employment"
                  value={demo.laborEmploymentNote ? demo.laborEmploymentNote : "Add a short, cited snapshot when available."}
                  multiline
                />
              </ul>
            </>
          ) : (
            <p className="mt-4 text-sm text-kelly-text/70">Demographics for this county are not in the system yet.</p>
          )}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-kelly-text text-kelly-page" aria-labelledby="voteraction-title">
        <ContentContainer>
          <h2 className="font-heading text-2xl font-bold tracking-tight" id="voteraction-title">
            Voter action
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-kelly-page/80">
            Start from the campaign’s voter registration center for this county—then use the state’s official lookup to
            confirm. We help with questions and follow-up.
          </p>
          <ul className="mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap" role="list">
            <li>
              <Button href={getVoterRegistrationCenterHref(county.slug)} variant="primary" className="w-full min-[400px]:w-auto">
                Voter registration center
              </Button>
            </li>
            <li>
              <Button href={voterUrl} variant="secondary" className="w-full min-[400px]:w-auto">
                Official state lookup
              </Button>
            </li>
            <li>
              <Button href={getRegistrationHelpHref()} variant="outline" className="w-full min-[400px]:w-auto">
                Registration help
              </Button>
            </li>
            <li>
              <Button href={getReferForRegistrationHelpHref()} variant="outline" className="w-full min-[400px]:w-auto">
                Refer someone for help
              </Button>
            </li>
            <li>
              <Button
                href={getCountyRegistrationTeamHref(county.slug)}
                variant="subtle"
                className="border border-kelly-page/20 bg-kelly-page/5 text-kelly-page hover:bg-kelly-page/10"
              >
                Join the registration team
              </Button>
            </li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="org-title">
        <ContentContainer>
          <SectionHeading
            id="org-title"
            align="left"
            eyebrow="Build locally"
            title="Organize in this county"
            subtitle="Clear paths: lead contact, volunteers, small gatherings, and a channel for what you are seeing on the ground."
          />
          <ul className="mt-6 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2" role="list">
            <li>
              <Link
                className={cn(card, "block h-full no-underline hover:-translate-y-0.5")}
                href={getVoterRegistrationCenterHref(county.slug)}
              >
                <span className="text-sm font-bold text-kelly-navy">County lead & registration</span>
                <p className="mt-1 text-sm text-kelly-text/80">
                  {county.leadName
                    ? `${county.leadName}${county.leadTitle ? ` — ${county.leadTitle}` : ""} — see the voter center for this county.`
                    : "Lead assignment in progress. The voter center links you to help and the county volunteer path."}
                </p>
              </Link>
            </li>
            <li>
              <Button href={getVolunteerInCountyHref(county.slug)} variant="primary" className="h-full w-full justify-center py-6">
                Volunteer path
              </Button>
            </li>
            <li>
              <Button href="/start-a-local-team" variant="outline" className="h-full w-full justify-center py-6">
                Host a coffee meetup
              </Button>
            </li>
            <li>
              <Button href={getHostOrVisitRequestHref()} variant="outline" className="h-full w-full justify-center py-6">
                Request a local event / visit
              </Button>
            </li>
            <li className="sm:col-span-2">
              <Button href={getLocalIssueSubmissionHref()} variant="subtle" className="w-full justify-center py-4">
                Submit a local issue for the team
              </Button>
            </li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-kelly-wash" aria-labelledby="media-block-title">
        <ContentContainer>
          <SectionHeading
            id="media-block-title"
            align="left"
            eyebrow="Stories &amp; social proof"
            title="Media & story (coming in hot)"
            subtitle="Gallery, videos, and highlights will roll in as we connect county tags, supporter uploads, and social clips through review."
          />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={card}>
              <h3 className="font-heading text-lg font-bold text-kelly-text">Photo gallery</h3>
              <p className="mt-1 text-sm text-kelly-text/70">
                Stills from the trail and community hosts tied to this county.
              </p>
            </div>
            <div className={card}>
              <h3 className="font-heading text-lg font-bold text-kelly-text">Video</h3>
              <p className="mt-1 text-sm text-kelly-text/70">
                Short clips, testimonials, and event reels from visits and conversations in this area.
              </p>
            </div>
            <div className={card}>
              <h3 className="font-heading text-lg font-bold text-kelly-text">Key quotes &amp; transcripts</h3>
              <p className="mt-1 text-sm text-kelly-text/70">
                Lines and excerpts from town halls, press, and roundtables as they&apos;re added for this county.
              </p>
            </div>
            <div className={card}>
              <h3 className="font-heading text-lg font-bold text-kelly-text">Supporter uploads</h3>
              <p className="mt-1 text-sm text-kelly-text/70">
                A future home for neighbor-submitted photos and clips, moderated for quality and respect.
              </p>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}

function ScoreItem({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <li className={card}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-kelly-text">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-kelly-text/55">{hint}</p> : null}
    </li>
  );
}

function IntelCard({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <li className={card} role="listitem">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">{label}</p>
      <p className={cn("mt-1 font-heading text-lg font-bold text-kelly-text", multiline && "text-base font-medium leading-relaxed")}>
        {value}
      </p>
    </li>
  );
}

function HappenCard({
  kicker,
  post,
  empty,
}: {
  kicker: string;
  post: import("@/lib/content/content-hub-queries").RoadPostCard | null;
  empty: string;
}) {
  if (!post) {
    return (
      <div className={card}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">{kicker}</p>
        <p className="mt-2 text-sm text-kelly-text/70">{empty}</p>
      </div>
    );
  }
  const img = roadPostImageSrc(post);
  const excerpt = roadPostExcerpt(post);
  return (
    <article className={cn(card, "overflow-hidden p-0")}>
      {img ? (
        <div className="relative aspect-[16/9] w-full">
          <Image src={img} alt="" fill className="object-cover" unoptimized={img.startsWith("http")} />
        </div>
      ) : null}
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">{kicker}</p>
        <h3 className="mt-2 font-heading text-lg font-bold leading-snug text-kelly-text">
          <Link className="hover:text-kelly-navy" href={post.canonicalUrl} target="_blank" rel="noreferrer">
            {post.title}
          </Link>
        </h3>
        {post.publishedAt ? (
          <p className="mt-1 text-xs text-kelly-text/55">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-3 text-sm text-kelly-text/75">{excerpt}</p>
        <p className="mt-3">
          <a className="text-sm font-semibold text-kelly-navy" href={post.canonicalUrl} target="_blank" rel="noreferrer">
            Read on Substack
          </a>
        </p>
      </div>
    </article>
  );
}
