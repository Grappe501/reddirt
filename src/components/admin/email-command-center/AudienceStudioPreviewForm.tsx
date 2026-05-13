"use client";

import { useFormState, useFormStatus } from "react-dom";
import { previewEmailAudienceAction } from "@/app/admin/email-audience-actions";
import {
  initialPreviewState,
  type PreviewEmailAudienceState,
} from "@/lib/email-command-center/audience-preview-form-state";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-kelly-forest/40 bg-kelly-fog/70 px-3 py-1 text-[11px] font-bold text-kelly-navy disabled:opacity-50"
    >
      {pending ? "Running preview…" : "Run preview"}
    </button>
  );
}

export function AudienceStudioPreviewForm() {
  const [state, formAction] = useFormState(previewEmailAudienceAction, initialPreviewState);

  return (
    <div id="audience-preview" className="space-y-2 rounded-lg border border-kelly-text/12 bg-white/90 p-3">
      <h2 className="font-heading text-sm font-bold text-kelly-navy">Draft audience preview</h2>
      <p className="text-[10px] text-kelly-text/70">
        Filters AND together. Default universe uses <strong>ACTIVE</strong> approved profile facts only. No send; preview
        rows are masked. A preview audit row is written to <code className="text-[9px]">EmailAudiencePreviewRun</code>.
      </p>
      <form action={formAction} className="grid gap-2 sm:grid-cols-2">
        <label className="text-[10px] text-kelly-text/80">
          factKey
          <input name="factKeyEquals" className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" />
        </label>
        <label className="text-[10px] text-kelly-text/80">
          factValue (contains match via equals)
          <input name="factValueEquals" className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" />
        </label>
        <label className="text-[10px] text-kelly-text/80">
          factType
          <input name="factTypeEquals" className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" />
        </label>
        <label className="text-[10px] text-kelly-text/80">
          audience hint label (APPROVED hints by default in explain copy; filter uses hint rows)
          <input name="audienceHintLabel" className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" />
        </label>
        <label className="text-[10px] text-kelly-text/80">
          county
          <input name="county" className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" />
        </label>
        <label className="text-[10px] text-kelly-text/80">
          city
          <input name="city" className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" />
        </label>
        <label className="text-[10px] text-kelly-text/80">
          workflow source type (e.g. INBOUND_EMAIL, MANUAL)
          <input name="workflowSourceType" className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" />
        </label>
        <label className="text-[10px] text-kelly-text/80">
          min confidence
          <input name="minConfidence" type="number" step="0.05" className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" />
        </label>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
          <SubmitButton />
        </div>
      </form>

      {state.status === "error" ? (
        <p className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-900">{state.error}</p>
      ) : null}
      {state.status === "success" ? (
        <div className="space-y-2 rounded border border-emerald-200/60 bg-emerald-50/50 px-2 py-2 text-[11px] text-emerald-950">
          <p>
            <span className="font-bold">Match count:</span> {state.matchCount}
          </p>
          <div>
            <p className="font-bold">Governance / criteria explanation</p>
            <ul className="list-inside list-disc text-[10px]">
              {state.limitations.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          {state.samples.length ? (
            <div>
              <p className="font-bold">Sample profiles (masked)</p>
              <ul className="mt-1 space-y-1 font-mono text-[10px]">
                {state.samples.map((s) => (
                  <li key={String(s.profileId)}>
                    {String(s.profileId).slice(0, 8)}… · county {String(s.county ?? "—")} · city {String(s.city ?? "—")}{" "}
                    · facts {String(s.activeFactCount)} · domain {String(s.emailDomainHint ?? "—")}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[10px]">No sample rows (empty match or DB).</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
