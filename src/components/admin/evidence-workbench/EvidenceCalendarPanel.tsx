"use client";

import { useMemo, useState, useTransition } from "react";
import {
  exportCalendarMatrixAction,
  importCalendarSeedAction,
  saveCalendarRowsAction,
} from "@/app/admin/evidence-workbench-actions";
import type { CalendarPresenceRow, CalendarPresenceStatus } from "@/lib/campaign-media/evidence-types";
import { CALENDAR_STATUSES } from "@/lib/campaign-media/evidence-types";

type CountyOpt = { slug: string; displayName: string; shortName: string };

type Props = {
  initialRows: CalendarPresenceRow[];
  counties: CountyOpt[];
  sourceNote: string;
};

type Filter = "all" | "Needs confirm" | "Confirmed" | "Exclude" | "Unknown" | "physical";

export function EvidenceCalendarPanel({ initialRows, counties, sourceNote }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [filter, setFilter] = useState<Filter>("Needs confirm");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "all") return true;
      if (filter === "physical") return r.hasPhysicalLocation;
      return r.status === filter;
    });
  }, [rows, filter]);

  const counts = useMemo(() => {
    return {
      needs: rows.filter((r) => r.status === "Needs confirm").length,
      confirmed: rows.filter((r) => r.status === "Confirmed").length,
      exclude: rows.filter((r) => r.status === "Exclude").length,
      physical: rows.filter((r) => r.hasPhysicalLocation).length,
    };
  }, [rows]);

  function patch(id: string, patch: Partial<CalendarPresenceRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function saveVisible() {
    start(async () => {
      const fd = new FormData();
      fd.set("rowsJson", JSON.stringify(filtered));
      const res = await saveCalendarRowsAction(null, fd);
      setMessage(res.message);
      if (res.ok) {
        // keep local state
      }
    });
  }

  function saveAll() {
    start(async () => {
      const fd = new FormData();
      fd.set("rowsJson", JSON.stringify(rows));
      const res = await saveCalendarRowsAction(null, fd);
      setMessage(res.message);
    });
  }

  function exportMatrix() {
    start(async () => {
      const res = await exportCalendarMatrixAction();
      setMessage(res.message);
    });
  }

  function importSource(source: string) {
    start(async () => {
      const fd = new FormData();
      fd.set("source", source);
      if (source === "ics") fd.set("icsPath", "C:\\Users\\User\\Desktop\\basic.ics");
      const res = await importCalendarSeedAction(null, fd);
      setMessage(res.message);
      if (res.ok) window.location.reload();
    });
  }

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-kelly-text/70">{sourceNote}</p>
      <div className="flex flex-wrap gap-2 font-body text-xs">
        <span className="rounded bg-kelly-navy/8 px-2 py-1">Needs: {counts.needs}</span>
        <span className="rounded bg-kelly-navy/8 px-2 py-1">Confirmed: {counts.confirmed}</span>
        <span className="rounded bg-kelly-navy/8 px-2 py-1">Exclude: {counts.exclude}</span>
        <span className="rounded bg-kelly-navy/8 px-2 py-1">Physical LOCATION: {counts.physical}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["Needs confirm", "Needs confirm"],
            ["physical", "Physical LOCATION"],
            ["Confirmed", "Confirmed"],
            ["Exclude", "Exclude"],
            ["Unknown", "Unknown"],
            ["all", "All"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`rounded-md border px-3 py-1.5 font-body text-xs font-semibold ${
              filter === k ? "border-kelly-navy bg-kelly-navy text-white" : "border-kelly-text/15 bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={saveVisible}
          className="rounded-md bg-kelly-navy px-3 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
        >
          Save visible
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={saveAll}
          className="rounded-md border border-kelly-navy px-3 py-2 font-body text-sm font-bold text-kelly-navy disabled:opacity-50"
        >
          Save all
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={exportMatrix}
          className="rounded-md border border-kelly-text/20 px-3 py-2 font-body text-sm font-semibold disabled:opacity-50"
        >
          Export confirmed → Presence Matrix
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => importSource("csv")}
          className="rounded-md border border-kelly-text/20 px-3 py-2 font-body text-xs disabled:opacity-50"
        >
          Re-seed from CSV
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => importSource("ics")}
          className="rounded-md border border-kelly-text/20 px-3 py-2 font-body text-xs disabled:opacity-50"
        >
          Import Desktop basic.ics
        </button>
      </div>

      {message ? (
        <p className="rounded border border-kelly-text/10 bg-kelly-fog/60 px-3 py-2 font-body text-sm whitespace-pre-wrap">
          {message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-kelly-text/10 bg-white">
        <table className="min-w-full font-body text-sm">
          <thead className="bg-kelly-fog/80 text-left text-xs uppercase tracking-wide text-kelly-slate">
            <tr>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Summary</th>
              <th className="px-2 py-2">Location</th>
              <th className="px-2 py-2">City</th>
              <th className="px-2 py-2">County</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-kelly-text/8 align-top">
                <td className="px-2 py-2 whitespace-nowrap text-xs">{r.date}</td>
                <td className="px-2 py-2 max-w-[14rem]">{r.summary}</td>
                <td className="px-2 py-2 max-w-[12rem] text-xs text-kelly-slate">{r.location || "—"}</td>
                <td className="px-2 py-2">
                  <input
                    className="w-28 rounded border border-kelly-text/15 px-1.5 py-1 text-xs"
                    value={r.city}
                    onChange={(e) => patch(r.id, { city: e.target.value })}
                  />
                </td>
                <td className="px-2 py-2">
                  <select
                    className="max-w-[10rem] rounded border border-kelly-text/15 px-1.5 py-1 text-xs"
                    value={r.county}
                    onChange={(e) => patch(r.id, { county: e.target.value })}
                  >
                    <option value="">—</option>
                    {counties.map((c) => (
                      <option key={c.slug} value={c.shortName}>
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <select
                    className="rounded border border-kelly-text/15 px-1.5 py-1 text-xs"
                    value={r.status}
                    onChange={(e) =>
                      patch(r.id, { status: e.target.value as CalendarPresenceStatus })
                    }
                  >
                    {CALENDAR_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-body text-xs text-kelly-slate">Showing {filtered.length} of {rows.length} rows.</p>
    </div>
  );
}
