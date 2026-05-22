"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EventReviewBundle } from "@/lib/campaign-events/persistence/review-bundle";
import type { EventReviewFormState } from "@/lib/campaign-events/review-form";
import type { KellyAttendanceModeValue } from "@/lib/campaign-events/fact-card-data";
import type { CampaignEventDecision } from "@/lib/campaign-events/review-meta";
import { AUTOMATION_NEEDS_FUTURE } from "@/lib/campaign-events/review-meta";
import {
  applyEventReviewDecisionAction,
  getEventReviewBundleAction,
  resetEventReviewToAiAction,
  saveEventReviewAction,
} from "@/app/admin/(board)/campaign-events/actions";
import { EmailDraftScaffoldModal } from "./EmailDraftScaffoldModal";
import { IntakeAiSummaryCard } from "./IntakeAiSummaryCard";

function Field({
  label,
  value,
  onChange,
  helper,
  inferred,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
  inferred?: boolean;
}) {
  return (
    <label className="grid gap-1 font-body text-sm">
      <span className="flex items-center gap-2 text-xs font-semibold text-kelly-muted">
        {label}
        {inferred ? (
          <span className="rounded bg-kelly-navy/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-kelly-navy">AI guess</span>
        ) : null}
      </span>
      <input
        className="rounded-lg border border-kelly-text/15 bg-kelly-page px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {helper ? <span className="text-xs text-kelly-subtle">{helper}</span> : null}
    </label>
  );
}

export function EventReviewModal({ recordId, onClose }: { recordId: string; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [bundle, setBundle] = useState<EventReviewBundle | null>(null);
  const [form, setForm] = useState<EventReviewFormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [openSection, setOpenSection] = useState<string>("assumptions");

  const load = useCallback(() => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await getEventReviewBundleAction(recordId);
        setBundle(data);
        setForm(data.form);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load review.");
      }
    });
  }, [recordId]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (key: keyof EventReviewFormState, value: string) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  };

  const save = (mode: "recalculate" | "draft") => {
    if (!form) return;
    setMessage(null);
    startTransition(async () => {
      try {
        await saveEventReviewAction(recordId, form, mode);
        setMessage(mode === "draft" ? "Draft saved." : "Saved and recalculated.");
        router.refresh();
        load();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Save failed.");
      }
    });
  };

  const decide = (decision: CampaignEventDecision) => {
    if (!form) return;
    startTransition(async () => {
      await saveEventReviewAction(recordId, form, "recalculate");
      await applyEventReviewDecisionAction(recordId, decision, form.operatorNotes);
      router.refresh();
      onClose();
    });
  };

  if (!bundle || !form) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-kelly-text/40 p-4">
        <div className="rounded-2xl bg-kelly-page px-8 py-6 font-body text-sm">
          {error ?? "Loading event review…"}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-kelly-text/45 p-2 sm:items-center sm:p-4" role="dialog" aria-modal="true">
        <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-kelly-text/10 bg-kelly-page shadow-2xl">
          <header className="border-b border-kelly-text/10 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">One event · independent review</p>
                <h2 className="font-heading text-2xl font-bold text-kelly-text">{bundle.snapshot.originalTitle}</h2>
                <p className="mt-1 font-body text-sm text-kelly-muted">
                  {bundle.snapshot.startAt}
                  {bundle.snapshot.endAt ? ` – ${bundle.snapshot.endAt}` : ""}
                  {bundle.snapshot.allDay ? " · All day" : ""}
                </p>
              </div>
              <button type="button" className="rounded-full border border-kelly-text/15 px-3 py-1 font-body text-sm font-bold" onClick={onClose}>
                Close
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {bundle.websiteIntake ? <IntakeAiSummaryCard meta={bundle.websiteIntake} /> : null}
            <section className="mt-4 rounded-2xl border border-kelly-text/10 bg-kelly-wash p-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Source calendar snapshot</h3>
              <dl className="mt-3 grid gap-2 font-body text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-kelly-subtle">Location</dt>
                  <dd>{bundle.snapshot.originalLocation || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-kelly-subtle">Notes</dt>
                  <dd>{bundle.snapshot.originalNotes || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-kelly-subtle">Calendar ID</dt>
                  <dd className="break-all text-xs">{bundle.snapshot.calendarSourceId}</dd>
                </div>
                <div>
                  <dt className="text-xs text-kelly-subtle">Google event ID</dt>
                  <dd className="break-all text-xs">{bundle.snapshot.googleEventId || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-kelly-subtle">Status</dt>
                  <dd>
                    {bundle.snapshot.eventStatus} · {bundle.snapshot.reviewStatus}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-kelly-subtle">Missing fields (core)</dt>
                  <dd>{bundle.inference.missingRequired.length} flagged</dd>
                </div>
              </dl>
            </section>

            <SectionToggle id="assumptions" title="AI assumptions (deterministic)" open={openSection} setOpen={setOpenSection}>
              <p className="mb-3 font-body text-xs text-kelly-muted">
                Inferred from this entry only — not bulk. Accept into fields with Reset to AI Guess or edit manually below.
              </p>
              <ul className="grid gap-2">
                {bundle.inference.assumptions.map((a) => (
                  <li key={a.field} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm">
                    <span>
                      <strong>{a.label}:</strong> {a.value}
                    </span>
                    <span className="text-xs text-kelly-subtle">
                      {a.confidence} · {a.source}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-body text-xs text-kelly-muted">
                Nature: <strong>{bundle.inference.eventNature}</strong> — {bundle.inference.eventNatureReason}
              </p>
              {bundle.inference.workHoursWarning.show ? (
                <p className="mt-2 rounded-lg border border-amber-600/25 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  {bundle.inference.workHoursWarning.badge}: {bundle.inference.workHoursWarning.detail}
                </p>
              ) : null}
              {bundle.inference.conflicts.map((c) => (
                <p key={c.label} className="mt-2 rounded-lg border border-red-800/20 bg-red-50 px-3 py-2 text-sm text-red-900">
                  {c.label}: {c.detail}
                </p>
              ))}
              {bundle.inference.missingRequired.length ? (
                <ul className="mt-3 list-disc pl-5 font-body text-xs text-kelly-muted">
                  {bundle.inference.missingRequired.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : null}
              {bundle.inference.intelligenceNotes.length ? (
                <ul className="mt-3 list-disc pl-5 font-body text-xs text-kelly-navy/80">
                  {bundle.inference.intelligenceNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              ) : null}
              {bundle.inference.houseMeetGreet ? (
                <div className="mt-4 rounded-xl border border-kelly-navy/20 bg-kelly-navy/[0.05] p-4">
                  <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">House Meet &amp; Greet intelligence</p>
                  {bundle.inference.houseMeetGreet.crossAisleOutreach ? (
                    <p className="mt-2 rounded-lg border border-emerald-700/25 bg-emerald-50 px-3 py-2 font-body text-sm font-semibold text-emerald-900">
                      Cross-aisle outreach opportunity
                    </p>
                  ) : null}
                  <ul className="mt-2 grid gap-1 font-body text-sm text-kelly-text/75">
                    <li>{bundle.inference.houseMeetGreet.relaxedSetup}</li>
                    <li>{bundle.inference.houseMeetGreet.softHostGuidance}</li>
                    <li>{bundle.inference.houseMeetGreet.relationshipPriority}</li>
                    {bundle.inference.houseMeetGreet.zoomOptional ? <li>Zoom attendance optional for remote guests</li> : null}
                    {bundle.inference.houseMeetGreet.recurringPotential ? <li>Recurring series potential — track host for follow-ups</li> : null}
                  </ul>
                </div>
              ) : null}
            </SectionToggle>

            <SectionToggle id="local" title="Known local context" open={openSection} setOpen={setOpenSection}>
              <p className="font-body text-sm text-kelly-muted">
                {bundle.localContext.city || bundle.localContext.county
                  ? `Area: ${[bundle.localContext.city, bundle.localContext.county].filter(Boolean).join(", ")}`
                  : "No city/county on file yet."}
              </p>
              <p className="mt-2 rounded-lg border border-dashed border-kelly-text/20 px-3 py-4 text-center font-body text-sm text-kelly-subtle">
                No local contacts connected yet.
              </p>
            </SectionToggle>

            <SectionToggle id="fields" title="Edit fact card" open={openSection} setOpen={setOpenSection}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Event type" value={form.eventType} onChange={(v) => patch("eventType", v)} inferred />
                <Field label="City" value={form.city} onChange={(v) => patch("city", v)} inferred />
                <Field label="County" value={form.county} onChange={(v) => patch("county", v)} inferred />
                <Field label="Venue" value={form.venueName} onChange={(v) => patch("venueName", v)} inferred />
                <Field label="Host" value={form.hostName} onChange={(v) => patch("hostName", v)} />
                <Field label="Host organization" value={form.hostOrganization} onChange={(v) => patch("hostOrganization", v)} inferred />
                <Field label="Campaign purpose" value={form.campaignPurpose} onChange={(v) => patch("campaignPurpose", v)} />
                <Field label="Candidate role" value={form.candidateRole} onChange={(v) => patch("candidateRole", v)} />
                <label className="grid gap-1 font-body text-sm">
                  <span className="text-xs font-semibold text-kelly-muted">Kelly attendance</span>
                  <select
                    className="rounded-lg border border-kelly-text/15 px-3 py-2"
                    value={form.kellyAttendanceMode}
                    onChange={(e) => patch("kellyAttendanceMode", e.target.value as KellyAttendanceModeValue)}
                  >
                    {["in_person", "zoom", "not_attending", "unknown"].map((v) => (
                      <option key={v} value={v}>
                        {v.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <Field label="Speaking slot" value={form.speakingSlot} onChange={(v) => patch("speakingSlot", v)} inferred />
                <Field label="Marketing table" value={form.marketingTable} onChange={(v) => patch("marketingTable", v)} inferred />
                <Field label="Volunteers needed" value={form.volunteersNeeded} onChange={(v) => patch("volunteersNeeded", v)} inferred />
                <Field label="Volunteer count" value={form.volunteerCount} onChange={(v) => patch("volunteerCount", v)} />
                <Field label="Campaign point person" value={form.campaignPointPerson} onChange={(v) => patch("campaignPointPerson", v)} />
                <Field label="Travel origin city" value={form.originCity} onChange={(v) => patch("originCity", v)} inferred />
                <Field label="Travel destination city" value={form.destinationCity} onChange={(v) => patch("destinationCity", v)} inferred />
                <Field label="Origin override" value={form.originOverrideCity} onChange={(v) => patch("originOverrideCity", v)} helper="Tue/Fri LR rule can be overridden here." />
                <Field label="Destination override" value={form.destinationOverrideCity} onChange={(v) => patch("destinationOverrideCity", v)} />
                <Field label="Travel time (min)" value={form.travelTimeMinutes} onChange={(v) => patch("travelTimeMinutes", v)} />
                <Field label="Round trip miles" value={form.roundTripMiles} onChange={(v) => patch("roundTripMiles", v)} />
                <Field label="Reimbursement rate" value={form.reimbursementRate} onChange={(v) => patch("reimbursementRate", v)} helper="TODO: align with policy 0.725 when approved." />
                <Field label="Reimbursement amount" value={form.reimbursementAmount} onChange={(v) => patch("reimbursementAmount", v)} />
              </div>
              <label className="mt-3 grid gap-1 font-body text-sm">
                <span className="text-xs font-semibold text-kelly-muted">Operator notes</span>
                <textarea
                  className="min-h-[80px] rounded-lg border border-kelly-text/15 px-3 py-2"
                  value={form.operatorNotes}
                  onChange={(e) => patch("operatorNotes", e.target.value)}
                />
              </label>
            </SectionToggle>

            <details className="mt-4 rounded-xl border border-kelly-text/10 bg-kelly-wash px-3 py-2">
              <summary className="cursor-pointer font-body text-xs font-semibold text-kelly-muted">Future automation needs (not built)</summary>
              <ul className="mt-2 list-disc pl-5 font-body text-xs text-kelly-muted">
                {AUTOMATION_NEEDS_FUTURE.map((item) => (
                  <li key={item}>{item.replaceAll("_", " ")}</li>
                ))}
              </ul>
            </details>
          </div>

          <footer className="border-t border-kelly-text/10 px-5 py-4">
            {message ? <p className="mb-2 font-body text-sm text-kelly-navy">{message}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                className="rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
                onClick={() => save("recalculate")}
              >
                Save & Recalculate
              </button>
              <button
                type="button"
                disabled={pending}
                className="rounded-full border border-kelly-navy/30 px-4 py-2 font-body text-sm font-bold text-kelly-navy disabled:opacity-50"
                onClick={() => save("draft")}
              >
                Save Draft
              </button>
              <button
                type="button"
                disabled={pending}
                className="rounded-full border border-kelly-text/15 px-4 py-2 font-body text-sm font-bold disabled:opacity-50"
                onClick={() => {
                  startTransition(async () => {
                    const result = await resetEventReviewToAiAction(recordId);
                    if (result.form) setForm(result.form);
                    router.refresh();
                  });
                }}
              >
                Reset to AI Guess
              </button>
              <button
                type="button"
                className="rounded-full border border-kelly-text/15 px-4 py-2 font-body text-sm font-bold"
                onClick={() => setShowEmail(true)}
              >
                Request info (email draft)
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-kelly-text/10 pt-3">
              <DecisionButton label="Approve" onClick={() => decide("approved")} tone="green" disabled={pending} />
              <DecisionButton label="Deny" onClick={() => decide("denied")} tone="red" disabled={pending} />
              <DecisionButton label="Hold" onClick={() => decide("hold")} tone="amber" disabled={pending} />
              <DecisionButton label="Request confirmation" onClick={() => decide("request_confirmation")} disabled={pending} />
              <DecisionButton label="Personal / non-campaign" onClick={() => decide("personal")} disabled={pending} />
              <DecisionButton label="Duplicate" onClick={() => decide("duplicate")} disabled={pending} />
            </div>
          </footer>
        </div>
      </div>
      {showEmail ? <EmailDraftScaffoldModal recordId={recordId} form={form} onClose={() => setShowEmail(false)} /> : null}
    </>
  );
}

function SectionToggle({
  id,
  title,
  open,
  setOpen,
  children,
}: {
  id: string;
  title: string;
  open: string;
  setOpen: (id: string) => void;
  children: React.ReactNode;
}) {
  const isOpen = open === id;
  return (
    <section className="mt-4 rounded-2xl border border-kelly-text/10">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(isOpen ? "" : id)}
      >
        <h3 className="font-heading text-base font-bold text-kelly-text">{title}</h3>
        <span className="text-xs font-bold text-kelly-navy">{isOpen ? "Hide" : "Show"}</span>
      </button>
      {isOpen ? <div className="border-t border-kelly-text/10 px-4 pb-4 pt-2">{children}</div> : null}
    </section>
  );
}

function DecisionButton({
  label,
  onClick,
  disabled,
  tone = "neutral",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "green" | "red" | "amber" | "neutral";
}) {
  const cls =
    tone === "green"
      ? "border-emerald-700/30 bg-emerald-50 text-emerald-900"
      : tone === "red"
        ? "border-red-800/30 bg-red-50 text-red-900"
        : tone === "amber"
          ? "border-amber-600/30 bg-amber-50 text-amber-950"
          : "border-kelly-text/15 bg-kelly-page text-kelly-text";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 font-body text-xs font-bold disabled:opacity-50 ${cls}`}
    >
      {label}
    </button>
  );
}
