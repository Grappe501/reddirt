"use client";

import type { LocationInferenceAssist } from "@/lib/campaign-events/month-readiness/location-inference-assist";
import type { MileageInferenceAssist } from "@/lib/campaign-events/month-readiness/mileage-inference-assist";
import type { MonthReviewFocus } from "@/lib/campaign-events/month-readiness/month-readiness-types";

export function MonthReviewLocationAssist({
  assist,
  focus,
  onAcceptCity,
  onAcceptCounty,
  pending,
}: {
  assist: LocationInferenceAssist;
  focus: MonthReviewFocus | null;
  onAcceptCity: () => void;
  onAcceptCounty: () => void;
  pending: boolean;
}) {
  const showCity = focus === "missing_city" || (!focus && assist.city && !assist.humanLockedCity);
  const showCounty = focus === "missing_county" || (!focus && assist.county && !assist.humanLockedCounty);

  if (!showCity && !showCounty && assist.hints.length === 0) return null;

  return (
    <section className="rounded-xl border border-kelly-navy/25 bg-kelly-navy/[0.06] p-4 font-body text-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-kelly-slate">Location inference (deterministic)</p>
      {assist.hints.map((h) => (
        <p key={h} className="mt-1 text-xs text-kelly-muted">
          {h}
        </p>
      ))}
      {showCity && assist.city ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-kelly-text/10 bg-kelly-page px-3 py-2">
          <div>
            <p className="font-semibold">City guess: {assist.city.value}</p>
            <p className="text-xs text-kelly-muted">
              {assist.city.confidence} confidence · {assist.city.source}
            </p>
          </div>
          {assist.humanLockedCity ? (
            <span className="text-xs text-kelly-subtle">Human value kept</span>
          ) : (
            <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-3 py-1.5 text-xs font-bold text-white" onClick={onAcceptCity}>
              Accept city guess
            </button>
          )}
        </div>
      ) : null}
      {showCounty && assist.county ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-kelly-text/10 bg-kelly-page px-3 py-2">
          <div>
            <p className="font-semibold">County guess: {assist.county.value}</p>
            <p className="text-xs text-kelly-muted">
              {assist.county.confidence} confidence · {assist.county.source}
            </p>
          </div>
          {assist.humanLockedCounty ? (
            <span className="text-xs text-kelly-subtle">Human value kept</span>
          ) : (
            <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-3 py-1.5 text-xs font-bold text-white" onClick={onAcceptCounty}>
              Accept county guess
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}

export function MonthReviewMileageAssist({
  assist,
  onAcceptEstimate,
  pending,
}: {
  assist: MileageInferenceAssist;
  onAcceptEstimate: () => void;
  pending: boolean;
}) {
  return (
    <section className="rounded-xl border border-amber-700/25 bg-amber-50 p-4 font-body text-sm text-amber-950">
      <p className="text-xs font-bold uppercase tracking-wider">Mileage estimate (deterministic)</p>
      <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs opacity-70">Origin</dt>
          <dd className="font-semibold">{assist.originLabel}</dd>
        </div>
        <div>
          <dt className="text-xs opacity-70">Destination</dt>
          <dd className="font-semibold">{assist.destinationCity || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs opacity-70">Rate</dt>
          <dd>${assist.rate.toFixed(2)}/mi</dd>
        </div>
        <div>
          <dt className="text-xs opacity-70">Estimate</dt>
          <dd>
            {assist.estimatedRoundTripMiles != null ? `${assist.estimatedRoundTripMiles} mi round trip` : "—"}
            {assist.estimatedReimbursement != null ? ` · $${assist.estimatedReimbursement.toFixed(2)}` : ""}
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs opacity-80">{assist.source}</p>
      <p className="mt-1 text-xs opacity-70">{assist.ruleNote}</p>
      <button
        type="button"
        disabled={pending || !assist.canEstimate}
        className="mt-3 rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
        onClick={onAcceptEstimate}
      >
        Accept mileage estimate &amp; recalculate
      </button>
    </section>
  );
}

export function MonthReviewReadinessPreview({
  scorePercent,
  bandLabel,
  remainingIssues,
  projectedDelta,
  projectedScore,
}: {
  scorePercent: number;
  bandLabel: string;
  remainingIssues: number;
  projectedDelta: number;
  projectedScore: number;
}) {
  return (
    <div className="rounded-xl border border-kelly-text/10 bg-kelly-wash px-4 py-3 font-body text-sm">
      <p className="text-xs font-bold uppercase text-kelly-slate">Month readiness</p>
      <p className="mt-1">
        <strong>{scorePercent}%</strong> · {bandLabel} · <strong>{remainingIssues}</strong> issue flags remaining
      </p>
      {projectedDelta > 0 ? (
        <p className="mt-1 text-xs text-emerald-800">
          If this event is completed: ~+{projectedDelta.toFixed(1)}% → ~{projectedScore}%
        </p>
      ) : null}
    </div>
  );
}
