"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  approveCalendarItem,
  askStaffAboutCalendarItem,
  holdCalendarItem,
  promoteKellyItemToConfirmedGoogleWorkflow,
  pullKellyGoogleCampaignCalendars,
  pushKellyCampaignGoogleForItem,
  rejectCalendarItem,
  requestCalendarItemModification,
  requestLocalCoverage,
  resolveKellyGoogleConflictForItem,
  sendKellyItemBackToTentativeWorkflow,
} from "@/app/admin/calendar-command-center/cockpit-actions";
import type { KellyGoogleCockpitOverlay } from "@/lib/calendar/kelly-cockpit-types";
import type { KellySurrogateTypePref } from "@prisma/client";

const HOLD_REASONS = [
  ["waiting_on_dpa", "Waiting on DPA confirmation"],
  ["waiting_on_county", "Waiting on county contact"],
  ["travel_too_hard", "Travel too hard"],
  ["work_conflict", "Work conflict"],
  ["family_conflict", "Family / personal conflict"],
  ["low_priority", "Low priority"],
  ["duplicate", "Duplicate opportunity"],
] as const;

const SURROGATES: { v: KellySurrogateTypePref; label: string }[] = [
  { v: "COUNTY_CHAIR", label: "County chair" },
  { v: "COUNTY_PARTY_CONTACT", label: "County party contact" },
  { v: "TRUSTED_LOCAL", label: "Trusted local surrogate" },
  { v: "VOLUNTEER", label: "Volunteer" },
  { v: "LOCAL_ELECTED", label: "Local elected official" },
  { v: "STAFF_CHOOSE", label: "Staff choose someone" },
];

export function CockpitEventActions({
  calendarItemId,
  kellyGoogle,
  laneMeta,
}: {
  calendarItemId: string;
  kellyGoogle?: KellyGoogleCockpitOverlay;
  laneMeta?: { tentativeSourceId: string | null; confirmedSourceId: string | null };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [showModify, setShowModify] = useState(false);
  const [showLocal, setShowLocal] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [holdReason, setHoldReason] = useState<string>(HOLD_REASONS[0]![0]);
  const [surType, setSurType] = useState<KellySurrogateTypePref>("STAFF_CHOOSE");
  const [surId, setSurId] = useState("");

  function run(fn: () => Promise<unknown>) {
    setMsg(null);
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  return (
    <section className="mt-8 rounded-lg border border-kelly-text/12 bg-white px-4 py-4">
      <p className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-text/50">Kelly actions</p>
      {msg ? <p className="mt-2 font-body text-xs text-rose-700">{msg}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className="rounded-lg bg-emerald-700 px-4 py-3 font-body text-sm font-bold text-white disabled:opacity-50"
          onClick={() => run(() => approveCalendarItem(calendarItemId, notes || undefined))}
        >
          Approve
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-lg bg-amber-500 px-4 py-3 font-body text-sm font-bold text-black disabled:opacity-50"
          onClick={() => setShowModify((s) => !s)}
        >
          Modify
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-lg bg-violet-700 px-4 py-3 font-body text-sm font-bold text-white disabled:opacity-50"
          onClick={() => setShowLocal((s) => !s)}
        >
          Send local
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-lg bg-slate-600 px-4 py-3 font-body text-sm font-bold text-white disabled:opacity-50"
          onClick={() =>
            run(() => holdCalendarItem(calendarItemId, holdReason, notes || undefined))
          }
        >
          Hold
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-lg bg-rose-700 px-4 py-3 font-body text-sm font-bold text-white disabled:opacity-50"
          onClick={() => {
            if (!rejectReason.trim()) {
              setMsg("Add a reject reason first (below).");
              return;
            }
            run(() => rejectCalendarItem(calendarItemId, rejectReason));
          }}
        >
          Reject
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-lg bg-sky-700 px-4 py-3 font-body text-sm font-bold text-white disabled:opacity-50"
          onClick={() => {
            if (!notes.trim()) {
              setMsg("Add a note for staff in the box below.");
              return;
            }
            run(() => askStaffAboutCalendarItem(calendarItemId, notes));
          }}
        >
          Ask staff
        </button>
      </div>

      <label className="mt-4 block font-body text-xs font-semibold text-kelly-text/70">
        Notes (also used for Ask staff)
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-kelly-text/20 px-2 py-1 font-body text-sm"
        />
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="font-body text-xs font-semibold text-kelly-text/70">
          Hold reason
          <select
            value={holdReason}
            onChange={(e) => setHoldReason(e.target.value)}
            className="mt-1 w-full rounded border border-kelly-text/20 px-2 py-1 font-body text-sm"
          >
            {HOLD_REASONS.map(([k, lab]) => (
              <option key={k} value={k}>
                {lab}
              </option>
            ))}
          </select>
        </label>
        <label className="font-body text-xs font-semibold text-kelly-text/70">
          Reject reason (required)
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="mt-1 w-full rounded border border-kelly-text/20 px-2 py-1 font-body text-sm"
          />
        </label>
      </div>

      {showModify ? (
        <div className="mt-4 rounded border border-kelly-text/15 bg-kelly-wash/40 p-3">
          <p className="font-body text-xs font-bold text-kelly-text">Quick modify request</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="font-body text-[11px] text-kelly-text/70">
              New date (optional)
              <input type="date" id="mod-date" className="mt-1 w-full rounded border px-2 py-1 text-sm" />
            </label>
            <label className="font-body text-[11px] text-kelly-text/70">
              Time note
              <input id="mod-time" placeholder="e.g. move 1h earlier" className="mt-1 w-full rounded border px-2 py-1 text-sm" />
            </label>
          </div>
          <button
            type="button"
            disabled={pending}
            className="mt-3 rounded bg-kelly-text px-3 py-2 font-body text-xs font-bold text-kelly-page"
            onClick={() => {
              const d = (document.getElementById("mod-date") as HTMLInputElement | null)?.value;
              const t = (document.getElementById("mod-time") as HTMLInputElement | null)?.value;
              run(() =>
                requestCalendarItemModification({
                  calendarItemId,
                  notes,
                  requestedDateChange: d || null,
                  requestedTimeChange: t || null,
                  partialAttendance: true,
                }),
              );
            }}
          >
            Submit modify request
          </button>
        </div>
      ) : null}

      {showLocal ? (
        <div className="mt-4 rounded border border-violet-300/50 bg-violet-50/80 p-3">
          <p className="font-body text-xs font-bold text-violet-950">Send local coverage</p>
          <p className="mt-1 font-body text-[11px] text-violet-900/80">
            Staff will confirm a person — no volunteer database is shown here.
          </p>
          <label className="mt-2 block font-body text-[11px] font-semibold text-violet-950">
            Surrogate type
            <select
              value={surType}
              onChange={(e) => setSurType(e.target.value as KellySurrogateTypePref)}
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
            >
              {SURROGATES.map((s) => (
                <option key={s.v} value={s.v}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-2 block font-body text-[11px] font-semibold text-violet-950">
            Opaque ref (optional)
            <input value={surId} onChange={(e) => setSurId(e.target.value)} className="mt-1 w-full rounded border px-2 py-1 text-sm" />
          </label>
          <button
            type="button"
            disabled={pending}
            className="mt-3 rounded bg-violet-800 px-3 py-2 font-body text-xs font-bold text-white"
            onClick={() =>
              run(() =>
                requestLocalCoverage({
                  calendarItemId,
                  surrogateType: surType,
                  requestedSurrogateId: surId || null,
                  notes,
                }),
              )
            }
          >
            Request coverage
          </button>
        </div>
      ) : null}

      <p className="mt-4 font-body text-[10px] text-kelly-text/50">
        SMS, email digests, and push are gated until env + opt-in are configured — in-app alerts first.
      </p>

      <div className="mt-8 border-t border-kelly-text/10 pt-5">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-text/50">Kelly Google lanes (staff)</p>
        {laneMeta ? (
          <dl className="mt-2 grid gap-1 font-body text-[11px] text-kelly-text/75">
            <div>
              <dt className="font-bold text-kelly-text/50">Tentative source id</dt>
              <dd className="break-all font-mono text-[10px]">{laneMeta.tentativeSourceId ?? "— (run calendar:google:ensure)"}</dd>
            </div>
            <div>
              <dt className="font-bold text-kelly-text/50">Confirmed source id</dt>
              <dd className="break-all font-mono text-[10px]">{laneMeta.confirmedSourceId ?? "—"}</dd>
            </div>
          </dl>
        ) : null}
        {kellyGoogle ? (
          <dl className="mt-3 grid gap-1 font-body text-[11px] text-kelly-text/75">
            <div>
              <dt className="font-bold text-kelly-text/50">Lane</dt>
              <dd className="uppercase">{kellyGoogle.lane}</dd>
            </div>
            <div>
              <dt className="font-bold text-kelly-text/50">Google event id</dt>
              <dd className="break-all font-mono text-[10px]">{kellyGoogle.googleEventId ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-bold text-kelly-text/50">iCalUID</dt>
              <dd className="break-all font-mono text-[10px]">{kellyGoogle.iCalUID ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-bold text-kelly-text/50">Staff sync status</dt>
              <dd>{kellyGoogle.staffExactStatus}</dd>
            </div>
            <div>
              <dt className="font-bold text-kelly-text/50">Campaign event</dt>
              <dd className="break-all font-mono text-[10px]">{kellyGoogle.campaignEventId}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 font-body text-[11px] text-kelly-text/55">Promote to CampaignEvent to see Google ids here.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            className="rounded-lg bg-slate-800 px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
            onClick={() => run(() => pushKellyCampaignGoogleForItem(calendarItemId))}
          >
            Push to Google
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-lg bg-slate-800 px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
            onClick={() => run(() => pullKellyGoogleCampaignCalendars())}
          >
            Pull latest from Google
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-lg bg-emerald-800 px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
            onClick={() => run(() => promoteKellyItemToConfirmedGoogleWorkflow(calendarItemId))}
          >
            Promote to Confirmed
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-lg bg-amber-700 px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
            onClick={() => run(() => sendKellyItemBackToTentativeWorkflow(calendarItemId))}
          >
            Send back to Tentative
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-lg bg-rose-800 px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
            onClick={() => run(() => resolveKellyGoogleConflictForItem(calendarItemId))}
          >
            Resolve conflict
          </button>
          {kellyGoogle?.openInGoogleUrl ? (
            <a
              href={kellyGoogle.openInGoogleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-kelly-text/25 bg-white px-3 py-2 font-body text-xs font-bold text-kelly-text"
            >
              Open in Google Calendar
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
