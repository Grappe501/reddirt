import Link from "next/link";

import { VoterAudienceBadge } from "@/components/election-plan/voter-audience/VoterAudienceBadge";
import { EP_VOTER_AUDIENCES_HREF, epVoterAudienceProfileHref } from "@/lib/election-plan/debate-prep-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import type { LocationAudienceOverlay } from "@/lib/election-plan/voter-audience-models/types";
import { getVoterAudienceProfile } from "@/lib/election-plan/voter-audience-models/load";
import { resolveAudiencesForLocation } from "@/lib/election-plan/voter-audience-models/resolve-audiences";

type Props = {
  overlay: LocationAudienceOverlay;
  voteTarget: number;
};

export function CityModelVotersPanel({ overlay, voteTarget }: Props) {
  const profiles = resolveAudiencesForLocation(overlay.profileIds);
  const estimates = overlay.profileEstimates ?? [];

  return (
    <section id="model-voters" className="mb-8 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-900">Model voters · who lives here</p>
          <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">{overlay.name} — speak-to cast</h2>
          <p className="mt-1 max-w-3xl text-sm text-[var(--ep-navy-muted)]">{overlay.makeupNote}</p>
          {overlay.populationNote ? (
            <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
              Population: {overlay.populationNote} · City vote target: {formatVotes(voteTarget)} (planning)
            </p>
          ) : null}
        </div>
        <Link href={EP_VOTER_AUDIENCES_HREF} className="text-xs font-semibold text-violet-900 underline">
          All personas →
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--ep-border)] bg-white">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
              <th className="px-4 py-3">Persona</th>
              <th className="px-4 py-3 text-right">Weight</th>
              <th className="px-4 py-3 text-right">SOS roll slice (plan)</th>
              <th className="px-4 py-3 text-right">Vote target slice</th>
              <th className="px-4 py-3">Segment</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              const est = estimates.find((e) => e.profileId === profile.id);
              return (
                <tr key={profile.id} className="border-b border-[var(--ep-border)] last:border-0">
                  <td className="px-4 py-3">
                    <Link href={epVoterAudienceProfileHref(profile.id)} className="inline-flex hover:opacity-90">
                      <VoterAudienceBadge profile={profile} linked={false} />
                    </Link>
                    <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{profile.tagline}</p>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    {est ? `${est.weightPct}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {est?.estimatedRegisteredPool ? formatVotes(est.estimatedRegisteredPool) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {est?.estimatedVoteTarget ? formatVotes(est.estimatedVoteTarget) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{profile.segmentLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-[var(--ep-navy-muted)]">
        Planning estimates only — fictional personas, not voter-file rows. SOS roll slices use active registration from
        voter-file rollups; vote-target slices use the city&apos;s 2026 planning target. Sources:{" "}
        {overlay.sources.join(" · ")}.
      </p>

      {profiles.length === 0 ? (
        <p className="mt-2 text-sm text-amber-800">
          No model voters mapped — run <code className="text-xs">npm run voter-audience-models:build</code>.
        </p>
      ) : null}

      {profiles.some((p) => !getVoterAudienceProfile(p.id)) ? null : (
        <div className="mt-4 flex flex-wrap gap-2">
          {profiles.map((p) => (
            <Link
              key={p.id}
              href={epVoterAudienceProfileHref(p.id)}
              className="text-xs font-semibold text-[var(--ep-navy)] underline"
            >
              {p.displayName} profile →
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
