"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  exportCalendarMatrixAction,
  importCalendarSeedAction,
  proposeEventNightPackAction,
  saveCalendarRowsAction,
  suggestCalendarPresenceAiAction,
} from "@/app/admin/evidence-workbench-actions";
import type {
  CalendarPresencePlace,
  CalendarPresenceRow,
  CalendarPresenceStatus,
} from "@/lib/campaign-media/evidence-types";
import type { CalendarPresenceSuggestion } from "@/lib/campaign-media/evidence-calendar-ai";
import type { EventNightPack } from "@/lib/campaign-media/evidence-event-night-pack";
import { CALENDAR_STATUSES } from "@/lib/campaign-media/evidence-types";
import { EVIDENCE_FIELD_COMPACT_CLASS } from "@/components/admin/evidence-workbench/field-styles";
import { isEditableKeyboardTarget } from "@/components/admin/evidence-workbench/keyboard";
import Link from "next/link";

type CountyOpt = { slug: string; displayName: string; shortName: string };

type Props = {
  initialRows: CalendarPresenceRow[];
  counties: CountyOpt[];
  sourceNote: string;
  sinceDate?: string;
};

type Filter = "queue" | "Needs confirm" | "Confirmed" | "Exclude" | "Unknown" | "physical" | "all";

function placesOf(row: CalendarPresenceRow): CalendarPresencePlace[] {
  if (Array.isArray(row.places) && row.places.length) return row.places;
  if (row.city || row.county) return [{ city: row.city || "", county: row.county || "" }];
  return [{ city: "", county: "" }];
}

function withPlaces(row: CalendarPresenceRow, places: CalendarPresencePlace[]): CalendarPresenceRow {
  const cleaned = places
    .map((p) => ({
      city: String(p.city || "").trim(),
      county: String(p.county || "").trim(),
      venue: p.venue?.trim() || undefined,
      note: p.note?.trim() || undefined,
    }))
    .filter((p) => p.city || p.county || p.venue);
  const primary = cleaned[0];
  return {
    ...row,
    places: cleaned.length ? cleaned : undefined,
    city: primary?.city || "",
    county: primary?.county || "",
  };
}

export function EvidenceCalendarPanel({ initialRows, counties, sourceNote, sinceDate }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [filter, setFilter] = useState<Filter>("queue");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [icsPath, setIcsPath] = useState(
    "H:\\SOSWebsite\\.local\\temp\\kelly-calendar\\basic-2026-07-29-2225.ics",
  );
  const [queueIndex, setQueueIndex] = useState(0);
  const [view, setView] = useState<"queue" | "table">("queue");
  const [aiSuggestion, setAiSuggestion] = useState<CalendarPresenceSuggestion | null>(null);
  const [eventPack, setEventPack] = useState<EventNightPack | null>(null);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "all") return true;
      if (filter === "physical") return r.hasPhysicalLocation;
      if (filter === "queue") return r.status === "Needs confirm" || r.status === "Unknown";
      return r.status === filter;
    });
  }, [rows, filter]);

  useEffect(() => {
    setQueueIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const active = filtered[queueIndex] ?? null;

  const counts = useMemo(() => {
    return {
      total: rows.length,
      queue: rows.filter((r) => r.status === "Needs confirm" || r.status === "Unknown").length,
      needs: rows.filter((r) => r.status === "Needs confirm").length,
      confirmed: rows.filter((r) => r.status === "Confirmed").length,
      exclude: rows.filter((r) => r.status === "Exclude").length,
      physical: rows.filter((r) => r.hasPhysicalLocation).length,
      multi: rows.filter((r) => (r.places?.length ?? 0) > 1).length,
    };
  }, [rows]);

  function patch(id: string, patch: Partial<CalendarPresenceRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function patchPlaces(id: string, places: CalendarPresencePlace[]) {
    setRows((prev) => prev.map((r) => (r.id === id ? withPlaces(r, places) : r)));
  }

  function saveRow(row: CalendarPresenceRow) {
    start(async () => {
      const fd = new FormData();
      fd.set("rowsJson", JSON.stringify([row]));
      const res = await saveCalendarRowsAction(null, fd);
      setMessage(res.message);
    });
  }

  function saveVisible() {
    start(async () => {
      const fd = new FormData();
      fd.set("rowsJson", JSON.stringify(filtered));
      const res = await saveCalendarRowsAction(null, fd);
      setMessage(res.message);
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
      if (source === "ics") {
        if (!icsPath.trim()) {
          setMessage("Enter a local ICS path first.");
          return;
        }
        fd.set("icsPath", icsPath.trim());
        fd.set("mode", "full");
        fd.set("since", "2025-11-01");
      }
      const res = await importCalendarSeedAction(null, fd);
      setMessage(res.message);
      if (res.ok) window.location.reload();
    });
  }

  function confirmAndNext() {
    if (!active) return;
    const nextRow = withPlaces(active, placesOf(active));
    const confirmed: CalendarPresenceRow = {
      ...nextRow,
      status: nextRow.city || nextRow.county || (nextRow.places?.length ?? 0) > 0 ? "Confirmed" : "Unknown",
    };
    patch(active.id, confirmed);
    start(async () => {
      const fd = new FormData();
      fd.set("rowsJson", JSON.stringify([confirmed]));
      const res = await saveCalendarRowsAction(null, fd);
      setMessage(res.message);
      setQueueIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
    });
  }

  function excludeAndNext() {
    if (!active) return;
    const excluded = { ...active, status: "Exclude" as const };
    patch(active.id, excluded);
    start(async () => {
      const fd = new FormData();
      fd.set("rowsJson", JSON.stringify([excluded]));
      const res = await saveCalendarRowsAction(null, fd);
      setMessage(res.message);
      setQueueIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
    });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (view !== "queue") return;
      if (isEditableKeyboardTarget(e.target)) return;
      if (e.key === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        setQueueIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === "ArrowRight" || e.key === "k") {
        e.preventDefault();
        setQueueIndex((i) => Math.min(filtered.length - 1, i + 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, filtered.length]);

  const activePlaces = active ? placesOf(active) : [];

  return (
    <div className="space-y-4 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-4">
        <p className="font-heading text-sm font-bold text-[#000066]">
          Calendar location queue{sinceDate ? ` · since ${sinceDate}` : ""}
        </p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          Go through every event and set where Kelly was. Multi-stop trips: add one place per city/county.
          Unknown stays Unknown. Zoom/personal can be Exclude.
        </p>
        <p className="mt-2 font-body text-xs text-[#364272]">{sourceNote}</p>
      </div>

      <div className="flex flex-wrap gap-2 font-body text-xs">
        <span className="rounded bg-[#000066]/10 px-2 py-1">Total: {counts.total}</span>
        <span className="rounded bg-[#ca913d]/20 px-2 py-1">Queue: {counts.queue}</span>
        <span className="rounded bg-[#000066]/10 px-2 py-1">Confirmed: {counts.confirmed}</span>
        <span className="rounded bg-[#000066]/10 px-2 py-1">Exclude: {counts.exclude}</span>
        <span className="rounded bg-[#000066]/10 px-2 py-1">Physical LOCATION: {counts.physical}</span>
        <span className="rounded bg-[#000066]/10 px-2 py-1">Multi-place: {counts.multi}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView("queue")}
          className={`rounded-md border px-3 py-1.5 font-body text-xs font-semibold ${
            view === "queue" ? "border-[#000066] bg-[#000066] text-white" : "border-[#8eb6dc] bg-white"
          }`}
        >
          Review queue
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={`rounded-md border px-3 py-1.5 font-body text-xs font-semibold ${
            view === "table" ? "border-[#000066] bg-[#000066] text-white" : "border-[#8eb6dc] bg-white"
          }`}
        >
          Table
        </button>
        {(
          [
            ["queue", "Needs / Unknown"],
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
            onClick={() => {
              setFilter(k);
              setQueueIndex(0);
            }}
            className={`rounded-md border px-3 py-1.5 font-body text-xs font-semibold ${
              filter === k
                ? "border-[#000066] bg-[#000066] text-white"
                : "border-[#8eb6dc] bg-white text-[#12124a]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={saveVisible}
          className="rounded-md bg-[#000066] px-3 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
        >
          Save visible
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={saveAll}
          className="rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
        >
          Save all
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={exportMatrix}
          className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-2 font-body text-sm font-semibold disabled:opacity-50"
        >
          Export confirmed → Presence Matrix
        </button>
        <label className="min-w-[16rem] flex-1 font-body text-xs font-semibold">
          ICS path
          <input
            className={EVIDENCE_FIELD_COMPACT_CLASS + " mt-1 w-full px-2 py-1.5 text-sm"}
            value={icsPath}
            onChange={(e) => setIcsPath(e.target.value)}
            placeholder="H:\path\to\calendar.ics"
          />
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={() => importSource("ics")}
          className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-2 font-body text-xs font-semibold disabled:opacity-50"
        >
          Rebuild full queue from ICS
        </button>
      </div>

      {message ? (
        <p className="whitespace-pre-wrap rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] px-3 py-2 font-body text-sm">
          {message}
        </p>
      ) : null}

      {view === "queue" ? (
        <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-4">
          {!active ? (
            <p className="font-body text-sm text-[#364272]">
              Queue clear for this filter — switch to All or Exclude if you still need to review.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                  Event {queueIndex + 1} of {filtered.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={queueIndex <= 0}
                    onClick={() => setQueueIndex((i) => Math.max(0, i - 1))}
                    className="rounded border border-[#8eb6dc] px-2 py-1 font-body text-xs font-semibold disabled:opacity-40"
                  >
                    Prev (J)
                  </button>
                  <button
                    type="button"
                    disabled={queueIndex >= filtered.length - 1}
                    onClick={() => setQueueIndex((i) => Math.min(filtered.length - 1, i + 1))}
                    className="rounded border border-[#8eb6dc] px-2 py-1 font-body text-xs font-semibold disabled:opacity-40"
                  >
                    Next (K)
                  </button>
                </div>
              </div>

              <div>
                <p className="font-mono text-xs text-[#364272]">{active.date}</p>
                <p className="mt-1 font-heading text-lg font-bold text-[#000066]">{active.summary}</p>
                <p className="mt-1 font-body text-xs text-[#364272]">
                  ICS location: {active.location || "—"}
                  {active.icsStatus ? ` · ${active.icsStatus}` : ""}
                  {active.hasPhysicalLocation ? " · physical LOCATION present" : ""}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">
                  Places visited (add one per stop)
                </p>
                {activePlaces.map((p, idx) => (
                  <div
                    key={`${active.id}-place-${idx}`}
                    className="grid gap-2 rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2 lg:grid-cols-4"
                  >
                    <label className="font-body text-[11px]">
                      City
                      <input
                        className={`${EVIDENCE_FIELD_COMPACT_CLASS} mt-0.5 w-full`}
                        value={p.city}
                        onChange={(e) => {
                          const next = [...activePlaces];
                          next[idx] = { ...p, city: e.target.value };
                          patchPlaces(active.id, next);
                        }}
                      />
                    </label>
                    <label className="font-body text-[11px]">
                      County
                      <select
                        className={`${EVIDENCE_FIELD_COMPACT_CLASS} mt-0.5 w-full`}
                        value={p.county}
                        onChange={(e) => {
                          const next = [...activePlaces];
                          next[idx] = { ...p, county: e.target.value };
                          patchPlaces(active.id, next);
                        }}
                      >
                        <option value="">—</option>
                        {counties.map((c) => (
                          <option key={c.slug} value={c.shortName}>
                            {c.displayName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="font-body text-[11px]">
                      Venue (optional)
                      <input
                        className={`${EVIDENCE_FIELD_COMPACT_CLASS} mt-0.5 w-full`}
                        value={p.venue || ""}
                        onChange={(e) => {
                          const next = [...activePlaces];
                          next[idx] = { ...p, venue: e.target.value };
                          patchPlaces(active.id, next);
                        }}
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          const next = activePlaces.filter((_, i) => i !== idx);
                          patchPlaces(active.id, next.length ? next : [{ city: "", county: "" }]);
                        }}
                        className="rounded border border-[#8eb6dc] bg-white px-2 py-1 font-body text-[11px] font-semibold"
                      >
                        Remove stop
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => patchPlaces(active.id, [...activePlaces, { city: "", county: "" }])}
                  className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold"
                >
                  + Add place
                </button>
              </div>

              <label className="block font-body text-[11px]">
                Notes
                <textarea
                  className={`${EVIDENCE_FIELD_COMPACT_CLASS} mt-0.5 w-full`}
                  rows={2}
                  value={active.notes || ""}
                  onChange={(e) => patch(active.id, { notes: e.target.value })}
                  placeholder="Route notes, who joined, etc."
                />
              </label>

              <label className="block font-body text-[11px]">
                Status
                <select
                  className={`${EVIDENCE_FIELD_COMPACT_CLASS} mt-0.5`}
                  value={active.status}
                  onChange={(e) =>
                    patch(active.id, { status: e.target.value as CalendarPresenceStatus })
                  }
                >
                  {CALENDAR_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    const row = rows.find((r) => r.id === active.id);
                    if (row) saveRow(row);
                  }}
                  className="rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
                >
                  Save this event
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    start(async () => {
                      setAiSuggestion(null);
                      const res = await suggestCalendarPresenceAiAction(active.id);
                      setMessage(res.message);
                      if (res.ok && res.suggestion) setAiSuggestion(res.suggestion);
                    });
                  }}
                  className="rounded-md border-2 border-[#c9a227] bg-[#fff8e6] px-3 py-2 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
                >
                  Suggest places (AI)
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    start(async () => {
                      setEventPack(null);
                      const res = await proposeEventNightPackAction(active.id);
                      setMessage(res.message);
                      if (res.ok && res.pack) setEventPack(res.pack);
                    });
                  }}
                  className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-2 font-body text-sm font-semibold text-[#000066] disabled:opacity-50"
                >
                  Event-night pack
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={confirmAndNext}
                  className="rounded-md bg-[#000066] px-3 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
                >
                  Confirm places → next
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={excludeAndNext}
                  className="rounded-md border-2 border-[#8eb6dc] bg-[#f4f7fc] px-3 py-2 font-body text-sm font-semibold disabled:opacity-50"
                >
                  Exclude → next
                </button>
              </div>

              {aiSuggestion ? (
                <div className="rounded-md border border-[#c9a227]/40 bg-[#fff8e6] p-3 font-body text-xs text-[#12124a]">
                  <p className="font-heading text-xs font-bold text-[#000066]">
                    AI place proposal ({aiSuggestion.confidence}) — review before Confirm
                  </p>
                  <p className="mt-1">{aiSuggestion.rationale}</p>
                  {aiSuggestion.places.length ? (
                    <ul className="mt-2 list-disc pl-4">
                      {aiSuggestion.places.map((p, i) => (
                        <li key={`${p.city}-${p.county}-${i}`}>
                          {p.city || "Unknown city"} · {p.county || "Unknown county"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2">No places inferred — leave Unknown.</p>
                  )}
                  {aiSuggestion.warnings.length ? (
                    <ul className="mt-2 list-disc pl-4 text-[#364272]">
                      {aiSuggestion.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={pending || !aiSuggestion.places.length}
                      onClick={() => {
                        if (!aiSuggestion.places.length) return;
                        const nextPlaces = aiSuggestion.places;
                        patchPlaces(active.id, nextPlaces);
                        patch(active.id, {
                          status: aiSuggestion.proposedStatus ?? "Needs confirm",
                          hasPhysicalLocation:
                            aiSuggestion.hasPhysicalLocation ??
                            nextPlaces.some((p) => Boolean(p.city)),
                          notes: [active.notes, aiSuggestion.notesAppend].filter(Boolean).join("\n"),
                        });
                        setMessage("Applied AI proposal into the form — Save or Confirm when ready.");
                      }}
                      className="rounded border border-[#000066] bg-white px-2.5 py-1 font-semibold text-[#000066] disabled:opacity-50"
                    >
                      Apply to form (not Confirm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiSuggestion(null)}
                      className="rounded border border-[#8eb6dc] px-2.5 py-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : null}

              {eventPack ? (
                <div className="rounded-md border border-[#8eb6dc]/60 bg-[#f4f7fc] p-3 font-body text-xs text-[#12124a]">
                  <p className="font-heading text-xs font-bold text-[#000066]">
                    Event-night pack · {eventPack.matchQuality} · {eventPack.date}
                  </p>
                  <p className="mt-1">
                    {eventPack.photos.length} photo cue(s) · {eventPack.speeches.length} speech cue(s)
                  </p>
                  {eventPack.warnings.length ? (
                    <ul className="mt-2 list-disc pl-4 text-[#364272]">
                      {eventPack.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  ) : null}
                  {eventPack.photos.slice(0, 5).map((p) => (
                    <p key={p.id} className="mt-1 font-mono text-[10px]">
                      photo {p.id} · score {p.score} · {p.why.slice(0, 2).join("; ")}
                    </p>
                  ))}
                  {eventPack.speeches.slice(0, 4).map((s) => (
                    <p key={s.id} className="mt-1 font-mono text-[10px]">
                      speech {s.id} · score {s.score}
                    </p>
                  ))}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {eventPack.recommendedClicks.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="font-semibold text-[#000066] underline"
                      >
                        {c.label}
                      </Link>
                    ))}
                    <button type="button" onClick={() => setEventPack(null)} className="underline">
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-kelly-text/10 bg-white">
            <table className="min-w-full font-body text-sm">
              <thead className="bg-kelly-fog/80 text-left text-xs uppercase tracking-wide text-kelly-slate">
                <tr>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Summary</th>
                  <th className="px-2 py-2">Location</th>
                  <th className="px-2 py-2">Places</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-kelly-text/8 align-top">
                    <td className="px-2 py-2 whitespace-nowrap text-xs">{r.date}</td>
                    <td className="px-2 py-2 max-w-[14rem]">{r.summary}</td>
                    <td className="px-2 py-2 max-w-[12rem] text-xs text-kelly-slate">
                      {r.location || "—"}
                    </td>
                    <td className="px-2 py-2 text-xs">
                      {placesOf(r)
                        .filter((p) => p.city || p.county)
                        .map((p) => `${p.city || "—"}${p.county ? ` / ${p.county}` : ""}`)
                        .join("; ") || "—"}
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className={EVIDENCE_FIELD_COMPACT_CLASS}
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
          <p className="font-body text-xs text-kelly-slate">
            Showing {filtered.length} of {rows.length} rows — use Review queue to edit multi-place
            locations.
          </p>
        </>
      )}
    </div>
  );
}
