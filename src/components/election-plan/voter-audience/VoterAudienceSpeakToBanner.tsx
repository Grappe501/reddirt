import Link from "next/link";

import { VoterAudienceBadge } from "@/components/election-plan/voter-audience/VoterAudienceBadge";
import { EP_VOTER_AUDIENCES_HREF } from "@/lib/election-plan/debate-prep-links";
import type { VoterAudienceProfile } from "@/lib/election-plan/voter-audience-models/types";

export function VoterAudienceSpeakToBanner({
  profiles,
  compact = false,
  label = "Speak to",
}: {
  profiles: VoterAudienceProfile[];
  compact?: boolean;
  label?: string;
}) {
  if (!profiles.length) return null;

  return (
    <div
      className={`rounded-lg border border-violet-200 bg-violet-50/50 ${compact ? "p-3" : "p-4"} text-sm`}
      role="note"
      aria-label={`${label}: ${profiles.map((p) => p.displayName).join(", ")}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-violet-900">
          {label} — picture one person in the room
        </p>
        {!compact ? (
          <Link href={EP_VOTER_AUDIENCES_HREF} className="text-[10px] font-bold text-violet-900 underline">
            All audiences →
          </Link>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {profiles.map((p) => (
          <VoterAudienceBadge key={p.id} profile={p} size={compact ? "sm" : "md"} />
        ))}
      </div>
      {!compact && profiles[0] ? (
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Primary: <span className="font-semibold text-[var(--ep-navy)]">{profiles[0].displayName}</span> —{" "}
          {profiles[0].tagline}
        </p>
      ) : null}
    </div>
  );
}
