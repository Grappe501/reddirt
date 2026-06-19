import Link from "next/link";

import { VoterAudienceBadge } from "@/components/election-plan/voter-audience/VoterAudienceBadge";
import { EP_VOTER_AUDIENCES_HREF } from "@/lib/election-plan/debate-prep-links";
import type { LocationAudienceOverlay } from "@/lib/election-plan/voter-audience-models/types";
import { resolveAudiencesForLocation } from "@/lib/election-plan/voter-audience-models/resolve-audiences";

export function LocationAudienceStrip({ overlay }: { overlay: LocationAudienceOverlay }) {
  const profiles = resolveAudiencesForLocation(overlay.profileIds);
  if (!profiles.length) return null;

  return (
    <article className="ep-card mb-6 border-violet-200 bg-violet-50/30 p-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase text-violet-900">Who Kelly is talking to here</p>
        <Link href={EP_VOTER_AUDIENCES_HREF} className="text-[10px] font-bold text-violet-900 underline">
          All personas →
        </Link>
      </div>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{overlay.makeupNote}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {profiles.map((p) => (
          <VoterAudienceBadge key={p.id} profile={p} />
        ))}
      </div>
    </article>
  );
}
