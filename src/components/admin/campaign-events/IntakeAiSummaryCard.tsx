"use client";

import type { WebsiteIntakeBridgeMeta } from "@/lib/campaign-events/intake/intake-meta";

export function IntakeAiSummaryCard({ meta }: { meta: WebsiteIntakeBridgeMeta }) {
  const { inferred } = meta;
  return (
    <section className="rounded-2xl border border-amber-600/25 bg-amber-50/80 p-4 font-body text-sm text-amber-950">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-700/30 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          Website intake
        </span>
        <span className="rounded-full border border-amber-700/30 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          Tentative
        </span>
        <span className="rounded-full border border-amber-700/30 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          Needs review
        </span>
        {meta.duplicateRisk ? (
          <span className="rounded-full border border-red-800/30 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900">
            Duplicate risk
          </span>
        ) : null}
        {meta.scheduleConflict ? (
          <span className="rounded-full border border-red-800/30 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900">
            Schedule conflict
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-semibold">{meta.intakeSummary}</p>
      <p className="mt-2 text-xs text-amber-900/80">
        <strong>Next:</strong> {meta.recommendedNextAction}
      </p>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-amber-900/70">
          AI inference (suggestions only)
        </summary>
        <ul className="mt-2 list-inside list-disc text-xs">
          <li>
            Location: {inferred.city ?? "city TBD"} · {inferred.county ?? "county TBD"}
            {inferred.zipCode ? ` · ZIP ${inferred.zipCode}` : ""}
          </li>
          <li>Event type: {inferred.eventTypeLabel}</li>
          <li>
            Travel: {inferred.likelyTravel ? inferred.travelReason ?? "likely" : "not flagged"} · Reimbursable:{" "}
            {inferred.likelyReimbursable ? "maybe" : "no"}
          </li>
          {inferred.likelyHost ? <li>Likely host: {inferred.likelyHost}</li> : null}
          {inferred.candidateSpeakingSlot ? <li>Kelly speaking slot requested</li> : null}
          {inferred.missingFields.length ? (
            <li className="text-red-900">Missing: {inferred.missingFields.join(", ")}</li>
          ) : null}
        </ul>
        {meta.duplicateReasons.length ? (
          <p className="mt-2 text-xs">
            <strong>Duplicate hints:</strong> {meta.duplicateReasons.join(" ")}
          </p>
        ) : null}
        {meta.conflictReasons.length ? (
          <p className="mt-2 text-xs">
            <strong>Conflict hints:</strong> {meta.conflictReasons.join(" ")}
          </p>
        ) : null}
      </details>
      <p className="mt-3 text-[10px] text-amber-900/60">
        Inference is deterministic + assistant flags — not authoritative. Operators confirm in fact card before official
        calendar promotion.
      </p>
    </section>
  );
}
