"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { RehearsalEncounterOption } from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import type {
  RehearsalCoachDrillPin,
  RehearsalCoachStateFile,
} from "@/lib/intelligence/v4/phase16P7RehearsalCoachState";
import type { StaffCoachPinOption } from "@/lib/intelligence/v4/phase16P7StaffCoach";

export function CandidateRehearsalCoachPanel({
  state,
  encounters,
  pinOptions,
  maxPins,
}: {
  state: RehearsalCoachStateFile;
  encounters: RehearsalEncounterOption[];
  pinOptions: StaffCoachPinOption[];
  maxPins: number;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function postCoach(body: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/intelligence/rehearsal-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean };
      setMessage(data.ok ? "Coach state updated." : "Could not update coach state.");
      if (data.ok) router.refresh();
    } catch {
      setMessage("Could not update coach state.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-violet-200 bg-violet-50/40 p-5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">Assigned scenario</h2>
          <button
            type="button"
            disabled={busy}
            onClick={() => postCoach({ action: "clear" })}
            className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-950 disabled:opacity-40"
          >
            Clear all
          </button>
        </div>
        {state.assignedEncounterId ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Active: <strong>{state.assignedEncounterId}</strong>
            {state.assignedAt ? ` · assigned ${state.assignedAt.slice(0, 19)}` : null}
          </p>
        ) : (
          <p className="mt-2 text-xs text-kelly-muted">No scenario assigned — pick one for Kelly tonight.</p>
        )}
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {encounters.map((enc) => (
            <li key={enc.encounterId} className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
              <p className="font-bold text-kelly-navy">{enc.title}</p>
              <p className="mt-1 text-kelly-muted">{enc.durationLabel} · {enc.kellyRule.slice(0, 80)}…</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => postCoach({ action: "assign-scenario", encounterId: enc.encounterId })}
                className="mt-2 rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-[10px] font-bold text-violet-950 disabled:opacity-40"
              >
                Assign to Kelly
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-lg font-bold text-kelly-navy">
          Pinned drills ({state.pinnedDrills.length}/{maxPins})
        </h2>
        <p className="mt-1 text-xs text-kelly-muted">Kelly must run these tonight — surfaced on command home.</p>
        {state.pinnedDrills.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {state.pinnedDrills.map((pin: RehearsalCoachDrillPin) => (
              <li key={pin.pinId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-kelly-text/10 bg-white p-3 text-xs">
                <div>
                  <p className="font-bold text-kelly-navy">{pin.label}</p>
                  <Link href={pin.href} className="mt-1 inline-block text-violet-800 underline">
                    Open drill →
                  </Link>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => postCoach({ action: "unpin-drill", pinId: pin.pinId })}
                  className="rounded-full border border-rose-200 px-2 py-1 text-[10px] font-bold text-rose-800 disabled:opacity-40"
                >
                  Unpin
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-kelly-muted">No drills pinned yet.</p>
        )}
        {state.pinnedDrills.length < maxPins ? (
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {pinOptions.map((opt) => (
              <li key={`${opt.queueId}-${opt.cardNumber}`} className="rounded-lg border border-dashed border-violet-200 bg-violet-50/20 p-3 text-xs">
                <p className="font-bold text-kelly-navy">{opt.label}</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    postCoach({
                      action: "pin-drill",
                      queueId: opt.queueId,
                      cardNumber: opt.cardNumber,
                    })
                  }
                  className="mt-2 rounded-full border border-violet-400 bg-white px-3 py-1 text-[10px] font-bold text-violet-950 disabled:opacity-40"
                >
                  Pin for tonight
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {message ? <p className="text-xs font-semibold text-kelly-navy">{message}</p> : null}
    </div>
  );
}
