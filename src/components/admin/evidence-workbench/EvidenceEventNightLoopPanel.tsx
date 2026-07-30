"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  buildEvidenceShipReportAction,
  proposeEventNightPackAction,
  runEventNightLoopAction,
  runPublishQueueTurboAction,
} from "@/app/admin/evidence-workbench-actions";
import type { EventNightPack } from "@/lib/campaign-media/evidence-event-night-pack";
import type { EvidenceShipReport } from "@/lib/campaign-media/evidence-ship-report";

type CalRow = { id: string; date: string; summary: string; status: string };

type Props = {
  calendarRows: CalRow[];
};

/**
 * One-operator loop: calendar pack → turbo identify (confirm) → ship checklist.
 * Never silent Approve.
 */
export function EvidenceEventNightLoopPanel({ calendarRows }: Props) {
  const confirmed = useMemo(
    () => calendarRows.filter((r) => r.status === "Confirmed"),
    [calendarRows],
  );
  const [rowId, setRowId] = useState(confirmed[0]?.id ?? calendarRows[0]?.id ?? "");
  const [useAi, setUseAi] = useState(true);
  const [pack, setPack] = useState<EventNightPack | null>(null);
  const [ship, setShip] = useState<EvidenceShipReport | null>(null);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  function proposeOnly() {
    if (!rowId) {
      setMessage("Pick a calendar row first.");
      return;
    }
    start(async () => {
      const res = await proposeEventNightPackAction(rowId);
      setMessage(res.message);
      if (res.pack) setPack(res.pack);
    });
  }

  function runFullLoop() {
    if (!rowId) {
      setMessage("Pick a calendar row first.");
      return;
    }
    start(async () => {
      const res = await runEventNightLoopAction({
        calendarRowId: rowId,
        confirmTurbo: true,
        useAi,
        maxPhotos: 16,
      });
      setMessage(res.message);
      if (res.pack) setPack(res.pack);
      if (res.ship) setShip(res.ship);
    });
  }

  function turboQueueThenShip() {
    start(async () => {
      const turbo = await runPublishQueueTurboAction({ confirm: true, useAi, maxPhotos: 24 });
      const shipRes = await buildEvidenceShipReportAction({
        persist: true,
        includeDerivativeScan: true,
      });
      setMessage([turbo.message, shipRes.message].join(" · "));
      if (shipRes.report) setShip(shipRes.report);
    });
  }

  return (
    <div className="mb-6 space-y-3 rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-4 text-[#12124a]">
      <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
        Event-night loop
      </p>
      <p className="font-body text-xs text-[#364272]">
        Calendar → pack cues → turbo Identify proposals → Ship checklist. Operator still Saves /
        Approves. Prefer Unknown.
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <label className="font-body text-xs font-semibold text-[#000066]">
          Calendar row
          <select
            value={rowId}
            onChange={(e) => setRowId(e.target.value)}
            className="mt-1 block min-w-[16rem] rounded border-2 border-[#000066]/20 bg-white px-2 py-1.5 font-body text-sm"
          >
            {!calendarRows.length ? <option value="">No rows</option> : null}
            {calendarRows.map((r) => (
              <option key={r.id} value={r.id}>
                {r.date} · {r.status} · {r.summary.slice(0, 48)}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 font-body text-xs text-[#12124a]">
          <input
            type="checkbox"
            checked={useAi}
            onChange={(e) => setUseAi(e.target.checked)}
          />
          Use AI on turbo
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || !rowId}
          onClick={proposeOnly}
          className="rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-xs font-bold text-[#000066] disabled:opacity-50"
        >
          1 · Propose pack
        </button>
        <button
          type="button"
          disabled={pending || !rowId}
          onClick={runFullLoop}
          className="rounded-md bg-[#000066] px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          2 · Pack + turbo (confirm) + ship
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={turboQueueThenShip}
          className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-2 font-body text-xs font-semibold text-[#000066] disabled:opacity-50"
        >
          Queue turbo → ship
        </button>
        <Link
          href="/admin/evidence-workbench?tab=queue"
          className="rounded-md border-2 border-[#ca913d] bg-white px-3 py-2 font-body text-xs font-bold text-[#12124a]"
        >
          3 · Approve on Publish Queue
        </Link>
        <Link
          href="/admin/evidence-workbench?tab=ship"
          className="rounded-md border-2 border-[#ca913d] bg-white px-3 py-2 font-body text-xs font-bold text-[#12124a]"
        >
          4 · Ship
        </Link>
      </div>

      {message ? <p className="font-body text-xs text-[#364272]">{message}</p> : null}

      {pack ? (
        <div className="rounded border border-[#000066]/15 bg-white p-3 font-body text-xs">
          <p className="font-heading text-xs font-bold text-[#000066]">
            Pack · {pack.date} · {pack.matchQuality} · {pack.photos.length} photos ·{" "}
            {pack.speeches.length} speeches
          </p>
          {pack.warnings.length ? (
            <ul className="mt-1 list-disc pl-4 text-[#364272]">
              {pack.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
          <ul className="mt-2 flex flex-wrap gap-2">
            {pack.recommendedClicks.map((c) => (
              <li key={`${c.label}-${c.href}`}>
                <Link href={c.href} className="underline text-[#000066]">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {ship ? (
        <div className="rounded border border-[#000066]/15 bg-white p-3 font-body text-xs">
          <p className="font-heading text-xs font-bold text-[#000066]">
            Ship snapshot · overlays dirty {ship.totals.overlayJsonDirty} · promoted missing{" "}
            {ship.totals.promotedOverrideMissing} · ready={String(ship.checklistReady)}
          </p>
          <ul className="mt-1 list-disc pl-4 text-[#364272]">
            {ship.nextActions.slice(0, 4).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
