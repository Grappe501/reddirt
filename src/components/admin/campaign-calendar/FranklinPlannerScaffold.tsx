"use client";

import { useEffect, useState } from "react";

const PANELS = [
  { id: "priorities", title: "Today's priorities", placeholder: "Top 3 outcomes for the candidate and field team." },
  { id: "candidate", title: "Candidate schedule", placeholder: "Arrivals, speaking, drive time, personal holds." },
  { id: "cm_notes", title: "Campaign manager notes", placeholder: "Decisions waiting, staffing, county follow-ups." },
  { id: "calls", title: "Calls / follow-ups", placeholder: "Hosts, vendors, volunteers to call today." },
  { id: "travel", title: "Travel windows", placeholder: "Depart / arrive blocks tied to events." },
  { id: "prep", title: "Prep checklist", placeholder: "Briefings, materials, signs, QR cards." },
  { id: "blocked", title: "Waiting on / blocked", placeholder: "Missing approvals, locations, hosts." },
  { id: "hotwash", title: "End-of-day hot wash", placeholder: "Quick lessons — fills after last event." },
  { id: "tomorrow", title: "Tomorrow prep", placeholder: "What to stage tonight for tomorrow's first stop." },
] as const;

function storageKey(ymd: string) {
  return `campaign-planner-${ymd}`;
}

export function FranklinPlannerScaffold({ focusYmd }: { focusYmd: string }) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"planner" | "calendar">("planner");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(focusYmd));
      if (raw) setNotes(JSON.parse(raw) as Record<string, string>);
      else setNotes({});
    } catch {
      setNotes({});
    }
  }, [focusYmd]);

  const save = (id: string, value: string) => {
    const next = { ...notes, [id]: value };
    setNotes(next);
    try {
      localStorage.setItem(storageKey(focusYmd), JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Franklin planner mode</p>
          <p className="font-body text-sm text-kelly-muted">
            Candidate + campaign manager workspace for <strong>{focusYmd}</strong> — local notes only (not synced).
          </p>
        </div>
        <div className="flex rounded-full border border-kelly-text/10 bg-kelly-page p-0.5">
          <button
            type="button"
            className={`rounded-full px-3 py-1 font-body text-xs font-bold ${mode === "planner" ? "bg-kelly-navy text-white" : ""}`}
            onClick={() => setMode("planner")}
          >
            Planner
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 font-body text-xs font-bold ${mode === "calendar" ? "bg-kelly-navy text-white" : ""}`}
            onClick={() => setMode("calendar")}
          >
            Events only
          </button>
        </div>
      </div>

      {mode === "planner" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PANELS.map((p) => (
            <label key={p.id} className="grid gap-1 rounded-xl border border-kelly-text/10 bg-kelly-page p-3 font-body text-sm">
              <span className="text-xs font-bold text-kelly-slate">{p.title}</span>
              <textarea
                className="min-h-[72px] resize-y rounded-lg border border-kelly-text/10 px-2 py-1.5 text-sm"
                placeholder={p.placeholder}
                value={notes[p.id] ?? ""}
                onChange={(e) => save(p.id, e.target.value)}
              />
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-3 font-body text-sm text-kelly-muted">Switch to Planner to see Franklin-style panels alongside the day schedule below.</p>
      )}
    </section>
  );
}
