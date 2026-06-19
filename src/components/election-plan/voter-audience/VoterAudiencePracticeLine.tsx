import { VoterAudienceBadge } from "@/components/election-plan/voter-audience/VoterAudienceBadge";
import type { VoterAudienceProfile } from "@/lib/election-plan/voter-audience-models/types";

export function VoterAudiencePracticeLine({
  text,
  audiences,
  label,
}: {
  text: string;
  audiences: VoterAudienceProfile[];
  label?: string;
}) {
  return (
    <li className="rounded-lg border border-[var(--ep-border)] bg-white/60 p-4">
      {label ? <p className="mb-2 text-xs font-bold uppercase text-emerald-900">{label}</p> : null}
      {audiences.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {audiences.map((p) => (
            <VoterAudienceBadge key={p.id} profile={p} size="sm" />
          ))}
        </div>
      ) : null}
      <p className="italic leading-relaxed text-[var(--ep-navy-muted)]">&ldquo;{text}&rdquo;</p>
    </li>
  );
}
