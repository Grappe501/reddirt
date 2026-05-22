"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { EventReviewBundle } from "@/lib/campaign-events/persistence/review-bundle";
import type { EventReviewFormState } from "@/lib/campaign-events/review-form";
import { buildApprovalSummary } from "@/lib/campaign-events/month-review/approval-summary-builder";
import type { WorkbenchEventRow } from "@/lib/campaign-events/merge-persisted-row";
import type { CampaignEventDecision } from "@/lib/campaign-events/review-meta";
import {
  applyMonthReviewDecisionAction,
  getMonthReviewBundleAction,
  loadMonthReadinessPreviewAction,
  saveMonthReviewFormAction,
} from "@/app/admin/(board)/campaign-events/month-review-actions";
import { CountyWorkbenchLink } from "@/components/admin/CountyWorkbenchLink";
import { buildLocationInferenceAssist } from "@/lib/campaign-events/month-readiness/location-inference-assist";
import { buildMileageInferenceAssist } from "@/lib/campaign-events/month-readiness/mileage-inference-assist";
import {
  previewReadinessForEvent,
  type RowFixKind,
} from "@/lib/campaign-events/month-readiness/month-readiness-score-delta";
import type { MonthReviewFocus } from "@/lib/campaign-events/month-readiness/month-readiness-types";
import {
  MonthReviewLocationAssist,
  MonthReviewMileageAssist,
  MonthReviewReadinessPreview,
} from "./MonthReviewAssistPanels";

function Field({
  label,
  value,
  onChange,
  multiline,
  highlight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  highlight?: boolean;
}) {
  const cls = `mt-1 w-full rounded-lg border bg-kelly-page px-3 py-2 font-body text-sm ${
    highlight ? "border-kelly-navy/40 ring-1 ring-kelly-navy/20" : "border-kelly-text/15"
  }`;
  return (
    <label className="grid gap-0.5 font-body text-sm">
      <span className="text-xs font-semibold text-kelly-muted">{label}</span>
      {multiline ? (
        <textarea className={cls} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

const RECOMMENDATION_STYLE = {
  likely_approve: "bg-emerald-50 text-emerald-900 border-emerald-600/30",
  needs_info: "bg-amber-50 text-amber-950 border-amber-600/30",
  hold: "bg-kelly-wash text-kelly-navy border-kelly-navy/25",
  likely_deny: "bg-red-50 text-red-900 border-red-800/25",
};

function primaryFixForRow(row: WorkbenchEventRow, focus: MonthReviewFocus | null): RowFixKind | null {
  if (focus === "missing_city") return "city";
  if (focus === "missing_county") return "county";
  if (focus === "missing_zip") return "zip";
  if (focus === "missing_mileage") return "mileage";
  if (!row.rawDecision) return "decision";
  if (row.hasConflictWarning) return "conflict_clear";
  if (row.hasWorkHoursWarning) return "work_hours_clear";
  if (!row.likelyCity?.trim()) return "city";
  if (!row.county?.trim()) return "county";
  return null;
}

export function MonthReviewEventWorkbench({
  row,
  positionLabel,
  decisionNote,
  onDecisionNoteChange,
  onDecisionComplete,
  reviewFocus,
  speedMode,
  period,
  allRows,
  travelReimbursement,
}: {
  row: WorkbenchEventRow;
  positionLabel: string;
  decisionNote: string;
  onDecisionNoteChange: (v: string) => void;
  onDecisionComplete: () => void;
  reviewFocus?: MonthReviewFocus | null;
  speedMode?: boolean;
  period?: string;
  allRows?: WorkbenchEventRow[];
  travelReimbursement?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [bundle, setBundle] = useState<EventReviewBundle | null>(null);
  const [form, setForm] = useState<EventReviewFormState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readiness, setReadiness] = useState({
    scorePercent: 0,
    bandLabel: "",
    remainingIssues: 0,
  });

  const load = useCallback(() => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await getMonthReviewBundleAction(row.recordId);
        setBundle(data);
        setForm(data.form);
        if (period) {
          const prev = await loadMonthReadinessPreviewAction(period);
          setReadiness({
            scorePercent: prev.scorePercent,
            bandLabel: prev.bandLabel,
            remainingIssues: prev.remainingIssues,
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load event.");
      }
    });
  }, [row.recordId, period]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (key: keyof EventReviewFormState, value: string) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  };

  const saveForm = (mode: "recalculate" | "draft", nextForm?: EventReviewFormState) => {
    const payload = nextForm ?? form;
    if (!payload) return;
    startTransition(async () => {
      try {
        await saveMonthReviewFormAction(row.recordId, payload, mode);
        setMessage(mode === "recalculate" ? "Saved and recalculated travel." : "Draft saved.");
        load();
        onDecisionComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed.");
      }
    });
  };

  const save = (mode: "recalculate" | "draft") => saveForm(mode);

  const decide = (decision: CampaignEventDecision) => {
    startTransition(async () => {
      try {
        await applyMonthReviewDecisionAction(row.recordId, decision, decisionNote || undefined);
        setMessage(`Decision saved: ${decision}.`);
        onDecisionComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Decision failed.");
      }
    });
  };

  const locationAssist = useMemo(() => {
    if (!bundle || !form) return null;
    return buildLocationInferenceAssist(row, bundle.inference, bundle.calendar, {
      humanLockedCity: bundle.humanLocks.city,
      humanLockedCounty: bundle.humanLocks.county,
      peerRows: allRows,
    });
  }, [bundle, form, row, allRows]);

  const mileageAssist = useMemo(() => {
    if (!bundle || !form) return null;
    const calendars = allRows?.length ? allRows.map((r) => r.calendar) : [bundle.calendar];
    return buildMileageInferenceAssist(bundle.calendar, calendars, form);
  }, [bundle, form, allRows]);

  const scorePreview = useMemo(() => {
    if (!allRows?.length) return null;
    const fix = primaryFixForRow(row, reviewFocus ?? null);
    return previewReadinessForEvent(allRows, row, fix);
  }, [allRows, row, reviewFocus]);

  useEffect(() => {
    if (!speedMode || pending || !form) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const k = e.key.toLowerCase();
      if (k === "a") {
        e.preventDefault();
        void applyMonthReviewDecisionAction(row.recordId, "approved", decisionNote || undefined).then(() => onDecisionComplete());
      } else if (k === "h") {
        e.preventDefault();
        void applyMonthReviewDecisionAction(row.recordId, "hold", decisionNote || undefined).then(() => onDecisionComplete());
      } else if (k === "d") {
        e.preventDefault();
        void applyMonthReviewDecisionAction(row.recordId, "denied", decisionNote || undefined).then(() => onDecisionComplete());
      } else if (k === "s") {
        e.preventDefault();
        void saveMonthReviewFormAction(row.recordId, form, "recalculate").then(() => onDecisionComplete());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [speedMode, pending, form, row.recordId, decisionNote, onDecisionComplete]);

  if (!bundle || !form) {
    return <p className="font-body text-sm text-kelly-muted">{error ?? "Loading event for review…"}</p>;
  }

  const summary = buildApprovalSummary(row, bundle.inference);
  const showMileageAssist =
    reviewFocus === "missing_mileage" || (speedMode && !form.roundTripMiles?.trim() && mileageAssist?.canEstimate);
  const showLocationAssist =
    reviewFocus === "missing_city" ||
    reviewFocus === "missing_county" ||
    reviewFocus === "missing_zip" ||
    (speedMode && (!form.city.trim() || !form.county.trim()));

  const acceptCity = () => {
    if (!locationAssist?.city?.value) return;
    const next = {
      ...form,
      city: locationAssist.city.value,
      destinationCity: locationAssist.city.value,
    };
    setForm(next);
    saveForm("recalculate", next);
  };

  const acceptCounty = () => {
    if (!locationAssist?.county?.value) return;
    const next = { ...form, county: locationAssist.county.value };
    setForm(next);
    saveForm("recalculate", next);
  };

  const acceptMileage = () => {
    if (!mileageAssist?.canEstimate) return;
    const next = {
      ...form,
      originCity: mileageAssist.originCity,
      destinationCity: mileageAssist.destinationCity,
      destinationOverrideCity: mileageAssist.destinationCity,
      roundTripMiles: String(mileageAssist.estimatedRoundTripMiles ?? ""),
      reimbursementAmount: String(mileageAssist.estimatedReimbursement ?? ""),
      reimbursementRate: String(mileageAssist.rate),
      travelTimeMinutes:
        mileageAssist.driveMinutesOneWay != null ? String(mileageAssist.driveMinutesOneWay) : form.travelTimeMinutes,
    };
    setForm(next);
    saveForm("recalculate", next);
  };

  const stickyActions = (
    <div
      className={`flex flex-wrap gap-2 ${speedMode ? "sticky bottom-0 z-10 -mx-1 border-t border-kelly-text/10 bg-kelly-page/95 px-1 py-3 backdrop-blur-sm" : ""}`}
    >
      <button type="button" disabled={pending} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white" onClick={() => decide("approved")}>
        {travelReimbursement ? "Approve travel" : "Approve"}
        {speedMode ? " (A)" : ""}
      </button>
      <button type="button" disabled={pending} className="rounded-full bg-red-800 px-4 py-2 text-sm font-bold text-white" onClick={() => decide("denied")}>
        {travelReimbursement ? "Deny travel" : "Deny"}
        {speedMode ? " (D)" : ""}
      </button>
      <button type="button" disabled={pending} className="rounded-full border border-amber-600/40 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-950" onClick={() => decide("hold")}>
        Hold
        {speedMode ? " (H)" : ""}
      </button>
      <button
        type="button"
        disabled={pending}
        className="rounded-full border border-kelly-navy/30 px-4 py-2 text-sm font-bold text-kelly-navy"
        onClick={() => decide("request_confirmation")}
      >
        Send for more information
      </button>
      <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-sm font-bold text-white" onClick={() => save("recalculate")}>
        Save &amp; recalculate{speedMode ? " (S)" : ""}
      </button>
    </div>
  );

  return (
    <div className={`flex flex-col gap-6 ${speedMode ? "pb-24" : ""}`}>
      {scorePreview && period ? (
        <MonthReviewReadinessPreview
          scorePercent={readiness.scorePercent || scorePreview.currentScore}
          bandLabel={readiness.bandLabel}
          remainingIssues={readiness.remainingIssues}
          projectedDelta={scorePreview.delta}
          projectedScore={scorePreview.projectedScore}
        />
      ) : null}

      {showLocationAssist && locationAssist ? (
        <MonthReviewLocationAssist
          assist={locationAssist}
          focus={reviewFocus ?? null}
          pending={pending}
          onAcceptCity={acceptCity}
          onAcceptCounty={acceptCounty}
        />
      ) : null}

      {showMileageAssist && mileageAssist ? (
        <MonthReviewMileageAssist assist={mileageAssist} pending={pending} onAcceptEstimate={acceptMileage} />
      ) : null}

      <header className="rounded-2xl border border-kelly-navy/25 bg-kelly-navy/[0.05] p-5">
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">{positionLabel}</p>
        <h2 className="mt-1 font-heading text-2xl font-bold text-kelly-text">{row.calendar.title}</h2>
        <p className="mt-1 font-body text-sm text-kelly-muted">
          {row.dateYmd} · {row.timeLabel} · {row.classificationLabel}
          {row.county ? (
            <>
              {" "}
              · <CountyWorkbenchLink countyLabel={row.county} />
            </>
          ) : null}
        </p>

        {travelReimbursement ? (
          <dl className="mt-4 grid gap-2 rounded-xl border border-kelly-text/10 bg-white/80 p-3 font-body text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold text-kelly-slate">City / county / ZIP</dt>
              <dd>
                {form.city || "—"} · {form.county || "—"} · {form.zipCode || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-kelly-slate">Origin → destination</dt>
              <dd>
                {form.originCity || "—"} → {form.destinationCity || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-kelly-slate">Miles / reimbursement</dt>
              <dd>
                {form.roundTripMiles || "—"} mi · ${form.reimbursementAmount || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-kelly-slate">Decision</dt>
              <dd>{row.decisionLabel ?? "Needs approval"}</dd>
            </div>
          </dl>
        ) : null}

        {!speedMode ? (
          <div className={`mt-4 rounded-xl border px-4 py-3 ${RECOMMENDATION_STYLE[summary.recommendation]}`}>
            <p className="font-body text-xs font-bold uppercase tracking-wider">AI travel summary</p>
            <p className="mt-2 font-body text-sm leading-relaxed">{summary.plainSummary}</p>
            <p className="mt-2 text-xs">
              <strong>{summary.recommendation.replaceAll("_", " ")}</strong> — {summary.recommendationReason}
            </p>
            {summary.blockers.length ? (
              <p className="mt-1 text-xs text-red-900">{summary.blockers.join(" · ")}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-kelly-muted">
            {summary.recommendation.replaceAll("_", " ")} — {summary.travelSummary}
          </p>
        )}

        {!speedMode ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={pending} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white" onClick={() => decide("approved")}>
                {travelReimbursement ? "Approve travel" : "Approve"}
              </button>
              <button type="button" disabled={pending} className="rounded-full bg-red-800 px-4 py-2 text-sm font-bold text-white" onClick={() => decide("denied")}>
                {travelReimbursement ? "Deny travel" : "Deny"}
              </button>
              <button type="button" disabled={pending} className="rounded-full border border-amber-600/40 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-950" onClick={() => decide("hold")}>
                Hold
              </button>
              <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-sm font-bold" onClick={() => decide("request_confirmation")}>
                Send for more information
              </button>
            </div>
            <label className="mt-3 block font-body text-sm">
              <span className="text-xs font-semibold text-kelly-muted">Decision note</span>
              <input className="mt-1 w-full rounded-lg border border-kelly-text/15 px-3 py-2" value={decisionNote} onChange={(e) => onDecisionNoteChange(e.target.value)} />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-sm font-bold text-white" onClick={() => save("recalculate")}>
                Save &amp; recalculate
              </button>
              <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-sm font-bold" onClick={() => save("draft")}>
                Save draft
              </button>
              <Link href={`/admin/campaign-events/${row.recordId}`} className="rounded-full border px-4 py-2 text-sm font-bold underline">
                Drilldown
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 font-body text-xs text-kelly-muted">Speed mode · shortcuts A/H/D/S · auto-advance on</p>
            {stickyActions}
          </>
        )}
        {message ? (
          <p className="mt-2 font-body text-sm text-emerald-800">
            {message}
            {message.includes("Saved") ? (
              <span className="block text-xs text-kelly-muted">
                Internal campaign record updated. Google Calendar sync not enabled yet.
              </span>
            ) : null}
          </p>
        ) : null}
        {error ? <p className="mt-2 font-body text-sm text-red-800">{error}</p> : null}
      </header>

      <div className="space-y-6 rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <Section title="Location · city · county · ZIP" first>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="City" value={form.city} onChange={(v) => patch("city", v)} highlight={speedMode || reviewFocus === "missing_city"} />
            <Field label="County" value={form.county} onChange={(v) => patch("county", v)} highlight={speedMode || reviewFocus === "missing_county"} />
            <Field label="ZIP code" value={form.zipCode} onChange={(v) => patch("zipCode", v)} highlight={reviewFocus === "missing_zip"} />
            {!speedMode ? (
              <>
                <Field label="Venue" value={form.venueName} onChange={(v) => patch("venueName", v)} />
                <Field label="Address" value={form.address} onChange={(v) => patch("address", v)} multiline />
              </>
            ) : null}
          </div>
        </Section>

        <Section title="Travel / mileage">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Origin" value={form.originCity} onChange={(v) => patch("originCity", v)} />
            <Field label="Destination" value={form.destinationCity} onChange={(v) => patch("destinationCity", v)} highlight={reviewFocus === "missing_mileage"} />
            <Field label="Round-trip miles" value={form.roundTripMiles} onChange={(v) => patch("roundTripMiles", v)} highlight={reviewFocus === "missing_mileage"} />
            <Field label="Reimbursement $" value={form.reimbursementAmount} onChange={(v) => patch("reimbursementAmount", v)} />
          </div>
        </Section>

        {!speedMode ? (
          <>
            <Section title="Conflicts / work hours">
              <p className="font-body text-sm">{summary.conflictSummary}</p>
              {summary.workHoursSummary ? <p className="mt-1 text-sm text-amber-950">{summary.workHoursSummary}</p> : null}
            </Section>
            <Section title="Source calendar">
              <p className="text-sm">{bundle.snapshot.originalLocation || "—"}</p>
            </Section>
          </>
        ) : null}
      </div>

      {speedMode ? stickyActions : null}
    </div>
  );
}

function Section({
  title,
  children,
  first,
}: {
  title: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section className={`border-t border-kelly-text/10 pt-4 ${first ? "border-t-0 pt-0" : ""}`}>
      <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
