import Link from "next/link";
import type { StageSafeContentDecision } from "@/lib/intelligence/v4/phase15StageSafeFilter";
import { STAGE_SAFE_FILTER_CLAIMS_HREF } from "@/lib/intelligence/v4/phase15StageSafeFilter";

export function StageSafeBlockedPanel({
  decision,
  compact,
}: {
  decision: StageSafeContentDecision;
  compact?: boolean;
}) {
  if (!decision.blocked) return null;

  return (
    <article
      className={`rounded-xl border-2 border-rose-300 bg-rose-50/60 ${compact ? "p-4 text-xs" : "p-5 text-sm"}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-950">
        Stage-safe filter · candidate profile
      </p>
      <h3 className="mt-2 font-heading text-base font-bold text-rose-950">{decision.fallback.headline}</h3>
      <p className="mt-2 leading-relaxed text-kelly-text">{decision.fallback.body}</p>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-[10px] font-bold text-amber-950">
        Claims gate: {decision.claimsGate}
      </p>
      <Link
        href={STAGE_SAFE_FILTER_CLAIMS_HREF}
        className="mt-3 inline-block text-xs font-bold text-kelly-navy underline"
      >
        Open claims ledger →
      </Link>
    </article>
  );
}
