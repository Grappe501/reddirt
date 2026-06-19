import Link from "next/link";

import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { VoterAudienceAvatar } from "@/components/election-plan/voter-audience/VoterAudienceAvatar";
import { VoterAudienceBadge } from "@/components/election-plan/voter-audience/VoterAudienceBadge";
import { EP_VOTER_AUDIENCES_HREF } from "@/lib/election-plan/debate-prep-links";
import type { VoterAudienceProfile } from "@/lib/election-plan/voter-audience-models/types";
import { getCityAudienceOverlay, getCountyAudienceOverlay } from "@/lib/election-plan/voter-audience-models/load";
import { resolveAudiencesForLocation } from "@/lib/election-plan/voter-audience-models/resolve-audiences";

export function VoterAudienceProfilePanel({ profile }: { profile: VoterAudienceProfile }) {
  const homeCountyOverlays = profile.homeCounties
    .map((slug) => getCountyAudienceOverlay(slug))
    .filter(Boolean);
  const homeCityOverlays = profile.homeCities
    .map((slug) => getCityAudienceOverlay(slug))
    .filter(Boolean);

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start gap-4">
        <VoterAudienceAvatar profile={profile} size="lg" />
        <div>
          <p className="text-xs font-bold uppercase text-violet-900">{profile.segmentLabel}</p>
          <h1 className="font-heading text-3xl font-bold text-[var(--ep-navy)]">{profile.displayName}</h1>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{profile.tagline}</p>
        </div>
      </header>

      <KellyPageSummary
        summary={`When Kelly speaks to ${profile.displayName}, she uses ${profile.kellyTone.toLowerCase()}. Picture one person — not a crowd.`}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="ep-card p-5 text-sm">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Who they are (planning est.)</p>
          <p className="mt-2 text-[var(--ep-navy)]">{profile.demographicSketch}</p>
          <p className="mt-3 text-[var(--ep-navy-muted)]">{profile.geographySketch}</p>
          <p className="mt-3 text-xs font-semibold text-[var(--ep-navy)]">{profile.estimatedShareNote}</p>
        </article>
        <article className="ep-card border-emerald-200 bg-emerald-50/40 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-emerald-900">Kelly&apos;s tone</p>
          <p className="mt-2 text-[var(--ep-navy)]">{profile.kellyTone}</p>
        </article>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="ep-card border-rose-200 bg-rose-50/40 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-rose-900">What they fear</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {profile.whatTheyFear.map((f) => (
              <li key={f.slice(0, 40)}>{f}</li>
            ))}
          </ul>
        </article>
        <article className="ep-card border-sky-200 bg-sky-50/40 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-sky-900">What they need to hear</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {profile.whatTheyNeedToHear.map((h) => (
              <li key={h.slice(0, 40)}>{h}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="ep-card mb-6 border-amber-200 bg-amber-50/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-amber-900">Avoid on stage</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {profile.doNotSay.map((d) => (
            <li key={d.slice(0, 40)}>{d}</li>
          ))}
        </ul>
      </article>

      {homeCountyOverlays.length > 0 ? (
        <article className="ep-card mb-6 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Strongest in these counties</p>
          <ul className="mt-3 space-y-3">
            {homeCountyOverlays.map((o) => (
              <li key={o!.slug} className="rounded-lg border border-[var(--ep-border)] p-3">
                <p className="font-semibold text-[var(--ep-navy)]">{o!.name} County</p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{o!.makeupNote}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {resolveAudiencesForLocation(o!.profileIds).map((p) => (
                    <VoterAudienceBadge key={p.id} profile={p} linked={p.id !== profile.id} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {homeCityOverlays.length > 0 ? (
        <article className="ep-card mb-6 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Strongest in these cities</p>
          <ul className="mt-3 space-y-3">
            {homeCityOverlays.slice(0, 8).map((o) => (
              <li key={o!.slug} className="rounded-lg border border-[var(--ep-border)] p-3">
                <p className="font-semibold text-[var(--ep-navy)]">
                  {o!.name}
                  {o!.populationNote ? (
                    <span className="ml-2 text-xs font-normal text-[var(--ep-navy-muted)]">{o!.populationNote}</span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{o!.makeupNote}</p>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <Link href={EP_VOTER_AUDIENCES_HREF} className="text-xs font-bold text-[var(--ep-navy)] underline">
        ← All voter audiences
      </Link>
    </>
  );
}
