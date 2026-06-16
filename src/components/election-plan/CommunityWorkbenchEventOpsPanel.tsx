"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";

import {
  COMMUNITY_EVENT_STATUSES,
  COMMUNITY_EVENT_VOLUNTEER_ROLES,
} from "@/lib/election-plan/community-workbench/constants";
import { countEventsByStatus } from "@/lib/election-plan/community-workbench/event-readiness";
import type {
  CommunityWorkbenchCommitteeRow,
  CommunityWorkbenchEventRow,
} from "@/lib/election-plan/community-workbench/types";
import { cn } from "@/lib/utils";

type Props = {
  workbenchSlug: string;
  events: CommunityWorkbenchEventRow[];
  committees: CommunityWorkbenchCommitteeRow[];
  operatorInitials: string | null;
};

function statusClass(status: string): string {
  if (status === "confirmed") return "bg-emerald-100 text-emerald-900";
  if (status === "executed" || status === "aar_complete") return "bg-blue-100 text-blue-900";
  if (status === "planned") return "bg-amber-100 text-amber-900";
  if (status === "cancelled") return "bg-slate-200 text-slate-600";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function EventEditor({
  workbenchSlug,
  event: initial,
  committees,
  operatorInitials,
  onSaved,
}: {
  workbenchSlug: string;
  event: CommunityWorkbenchEventRow;
  committees: CommunityWorkbenchCommitteeRow[];
  operatorInitials: string | null;
  onSaved: () => void;
}) {
  const [event, setEvent] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(initial.status === "idea" || initial.status === "planned");

  const save = useCallback(
    async (patch: Partial<CommunityWorkbenchEventRow>) => {
      if (!operatorInitials) {
        setError("Sign in with initials to edit events.");
        return;
      }
      setBusy(true);
      setError(null);
      const next = { ...event, ...patch };
      setEvent(next);
      try {
        const res = await fetch(
          `/api/election-plan/workbenches/${workbenchSlug}/events/${event.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: next.title,
              eventDate: next.eventDate,
              location: next.location,
              expectedAttendance: next.expectedAttendance,
              actualAttendance: next.actualAttendance,
              leadName: next.leadName,
              status: next.status,
              committeeId: next.committeeId,
              runOfShow: next.runOfShow,
              assignments: next.assignments,
              documents: next.documents,
              aarBody: next.aarBody,
            }),
          },
        );
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Save failed");
          return;
        }
        onSaved();
      } catch {
        setError("Network error");
      } finally {
        setBusy(false);
      }
    },
    [event, operatorInitials, onSaved, workbenchSlug],
  );

  const updateRunOfShow = (index: number, field: "time" | "label" | "owner", value: string) => {
    const runOfShow = [...event.runOfShow];
    runOfShow[index] = { ...runOfShow[index], [field]: value };
    void save({ runOfShow });
  };

  const addRunOfShowLine = () => {
    void save({ runOfShow: [...event.runOfShow, { time: "", label: "", owner: "" }] });
  };

  const removeRunOfShowLine = (index: number) => {
    void save({ runOfShow: event.runOfShow.filter((_, i) => i !== index) });
  };

  const updateAssignment = (index: number, field: "assignee" | "notes", value: string) => {
    const assignments = [...event.assignments];
    assignments[index] = { ...assignments[index], [field]: value };
    void save({ assignments });
  };

  const ensureDefaultAssignments = () => {
    if (event.assignments.length > 0) return;
    const assignments = COMMUNITY_EVENT_VOLUNTEER_ROLES.map((role) => ({
      role,
      assignee: "",
      notes: "",
    }));
    void save({ assignments });
  };

  return (
    <li className="rounded-lg border border-[var(--ep-border)] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div>
          <p className="font-heading font-bold text-[var(--ep-navy)]">{event.title}</p>
          <p className="text-xs text-[var(--ep-navy-muted)]">
            {event.operatorInitials ? `[${event.operatorInitials}] · ` : null}
            {event.leadName ? `Lead: ${event.leadName} · ` : null}
            {event.committeeName ? `${event.committeeName} · ` : null}
            {event.location ?? "Location TBD"}
          </p>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", statusClass(event.status))}>
          {COMMUNITY_EVENT_STATUSES.find((s) => s.value === event.status)?.label ?? event.status}
        </span>
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-[var(--ep-border)] px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Event title</span>
              <input
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                onBlur={() => save({ title: event.title })}
                className="mt-1 w-full rounded border px-2 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Date & time</span>
              <input
                type="datetime-local"
                value={toLocalInput(event.eventDate)}
                onChange={(e) => {
                  const iso = e.target.value ? new Date(e.target.value).toISOString() : null;
                  setEvent({ ...event, eventDate: iso });
                }}
                onBlur={() => save({ eventDate: event.eventDate })}
                className="mt-1 w-full rounded border px-2 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Status</span>
              <select
                value={event.status}
                onChange={(e) => save({ status: e.target.value })}
                className="mt-1 w-full rounded border px-2 py-2"
              >
                {COMMUNITY_EVENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Location</span>
              <input
                value={event.location ?? ""}
                onChange={(e) => setEvent({ ...event, location: e.target.value })}
                onBlur={() => save({ location: event.location })}
                className="mt-1 w-full rounded border px-2 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Event lead</span>
              <input
                value={event.leadName ?? ""}
                onChange={(e) => setEvent({ ...event, leadName: e.target.value })}
                onBlur={() => save({ leadName: event.leadName })}
                className="mt-1 w-full rounded border px-2 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Committee</span>
              <select
                value={event.committeeId ?? ""}
                onChange={(e) => {
                  const committeeId = e.target.value || null;
                  const committeeName =
                    committees.find((c) => c.id === committeeId)?.name ?? null;
                  save({ committeeId, committeeName });
                }}
                className="mt-1 w-full rounded border px-2 py-2"
              >
                <option value="">— None —</option>
                {committees.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Expected attendance</span>
              <input
                type="number"
                min={0}
                value={event.expectedAttendance ?? ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    expectedAttendance: e.target.value ? Number(e.target.value) : null,
                  })
                }
                onBlur={() => save({ expectedAttendance: event.expectedAttendance })}
                className="mt-1 w-full rounded border px-2 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Actual attendance</span>
              <input
                type="number"
                min={0}
                value={event.actualAttendance ?? ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    actualAttendance: e.target.value ? Number(e.target.value) : null,
                  })
                }
                onBlur={() => save({ actualAttendance: event.actualAttendance })}
                className="mt-1 w-full rounded border px-2 py-2"
              />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Run of show</h4>
              <button
                type="button"
                onClick={addRunOfShowLine}
                disabled={busy || !operatorInitials}
                className="text-xs font-semibold text-[var(--ep-navy)] underline disabled:opacity-50"
              >
                + Add line
              </button>
            </div>
            <ul className="mt-2 space-y-2">
              {event.runOfShow.length === 0 ? (
                <li className="text-xs italic text-[var(--ep-navy-muted)]">No run-of-show lines yet.</li>
              ) : (
                event.runOfShow.map((line, i) => (
                  <li key={i} className="grid gap-2 sm:grid-cols-[5rem_1fr_6rem_auto]">
                    <input
                      placeholder="5:00"
                      value={line.time}
                      onChange={(e) => {
                        const runOfShow = [...event.runOfShow];
                        runOfShow[i] = { ...runOfShow[i], time: e.target.value };
                        setEvent({ ...event, runOfShow });
                      }}
                      onBlur={() => updateRunOfShow(i, "time", event.runOfShow[i].time)}
                      className="rounded border px-2 py-1.5 font-mono text-xs"
                    />
                    <input
                      placeholder="Doors open, Kelly remarks…"
                      value={line.label}
                      onChange={(e) => {
                        const runOfShow = [...event.runOfShow];
                        runOfShow[i] = { ...runOfShow[i], label: e.target.value };
                        setEvent({ ...event, runOfShow });
                      }}
                      onBlur={() => updateRunOfShow(i, "label", event.runOfShow[i].label)}
                      className="rounded border px-2 py-1.5 text-sm"
                    />
                    <input
                      placeholder="Owner"
                      value={line.owner ?? ""}
                      onChange={(e) => {
                        const runOfShow = [...event.runOfShow];
                        runOfShow[i] = { ...runOfShow[i], owner: e.target.value };
                        setEvent({ ...event, runOfShow });
                      }}
                      onBlur={() => updateRunOfShow(i, "owner", event.runOfShow[i].owner ?? "")}
                      className="rounded border px-2 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeRunOfShowLine(i)}
                      className="text-xs text-red-700 underline"
                    >
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                Volunteer assignments
              </h4>
              {event.assignments.length === 0 ? (
                <button
                  type="button"
                  onClick={ensureDefaultAssignments}
                  className="text-xs font-semibold underline"
                >
                  Load default roles
                </button>
              ) : null}
            </div>
            <ul className="mt-2 space-y-2">
              {event.assignments.map((a, i) => (
                <li key={i} className="grid gap-2 sm:grid-cols-[8rem_1fr_1fr]">
                  <span className="py-1.5 text-xs font-semibold text-[var(--ep-navy)]">{a.role}</span>
                  <input
                    placeholder="Assignee name"
                    value={a.assignee}
                    onChange={(e) => {
                      const assignments = [...event.assignments];
                      assignments[i] = { ...assignments[i], assignee: e.target.value };
                      setEvent({ ...event, assignments });
                    }}
                    onBlur={() => updateAssignment(i, "assignee", event.assignments[i].assignee)}
                    className="rounded border px-2 py-1.5 text-sm"
                  />
                  <input
                    placeholder="Notes"
                    value={a.notes ?? ""}
                    onChange={(e) => {
                      const assignments = [...event.assignments];
                      assignments[i] = { ...assignments[i], notes: e.target.value };
                      setEvent({ ...event, assignments });
                    }}
                    onBlur={() => updateAssignment(i, "notes", event.assignments[i].notes ?? "")}
                    className="rounded border px-2 py-1.5 text-sm"
                  />
                </li>
              ))}
            </ul>
          </div>

          {(event.status === "executed" || event.status === "aar_complete") && (
            <label className="block text-sm">
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">
                After action report
              </span>
              <textarea
                rows={4}
                value={event.aarBody ?? ""}
                placeholder="What worked, what to fix, follow-ups…"
                onChange={(e) => setEvent({ ...event, aarBody: e.target.value })}
                onBlur={() => save({ aarBody: event.aarBody })}
                className="mt-1 w-full rounded border px-3 py-2"
              />
              {event.status === "executed" && event.aarBody?.trim() ? (
                <button
                  type="button"
                  onClick={() => save({ status: "aar_complete", aarBody: event.aarBody })}
                  className="mt-2 rounded bg-[var(--ep-navy)] px-3 py-1.5 text-xs font-bold text-white"
                >
                  Mark after-action complete
                </button>
              ) : null}
            </label>
          )}

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {busy ? <p className="text-xs text-[var(--ep-navy-muted)]">Saving…</p> : null}
        </div>
      ) : null}
    </li>
  );
}

export function CommunityWorkbenchEventOpsPanel({
  workbenchSlug,
  events,
  committees,
  operatorInitials,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const counts = countEventsByStatus(events);

  const createEvent = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!operatorInitials) return;
      setBusy(true);
      try {
        const res = await fetch(`/api/election-plan/workbenches/${workbenchSlug}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim() }),
        });
        if (res.ok) {
          setTitle("");
          router.refresh();
        }
      } finally {
        setBusy(false);
      }
    },
    [operatorInitials, router, title, workbenchSlug],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase">
        <span className="rounded bg-[var(--ep-cream)] px-2 py-1">Idea {counts.idea}</span>
        <span className="rounded bg-amber-100 px-2 py-1 text-amber-900">Planned {counts.planned}</span>
        <span className="rounded bg-emerald-100 px-2 py-1 text-emerald-900">Confirmed {counts.confirmed}</span>
        <span className="rounded bg-blue-100 px-2 py-1 text-blue-900">Executed {counts.executed}</span>
        <span className="rounded bg-blue-200 px-2 py-1 text-blue-950">AAR {counts.aar_complete}</span>
      </div>

      <form onSubmit={createEvent} className="mb-4 flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New event — e.g. Election Integrity Town Hall"
          className="min-w-[12rem] flex-1 rounded border px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          disabled={busy || !operatorInitials}
          className="rounded bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {operatorInitials ? "Create event" : "Sign in to create"}
        </button>
      </form>

      <ul className="space-y-4">
        {events.length === 0 ? (
          <li className="text-sm italic text-[var(--ep-navy-muted)]">No events — create your first field operation above.</li>
        ) : (
          events.map((ev) => (
            <EventEditor
              key={ev.id}
              workbenchSlug={workbenchSlug}
              event={ev}
              committees={committees}
              operatorInitials={operatorInitials}
              onSaved={() => router.refresh()}
            />
          ))
        )}
      </ul>
    </div>
  );
}
