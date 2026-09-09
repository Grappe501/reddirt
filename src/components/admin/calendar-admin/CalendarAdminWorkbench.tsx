"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  commitCalendarAdminProposals,
  extractCalendarAdminIngest,
  updateCalendarAdminStop,
} from "@/app/admin/calendar-admin-actions";
import type { VisitStatus } from "@/data/kelly-county-visits";
import type {
  CalendarAdminDesk,
  CalendarAdminStop,
  CalendarConflict,
  ProposedStop,
} from "@/lib/calendar-admin/types";

type Props = {
  stops: CalendarAdminStop[];
  conflicts: CalendarConflict[];
  labels: Record<string, string>;
  counties: string[];
  weekStart: string;
  initialDesk: CalendarAdminDesk;
  editId?: string;
  openaiReady: boolean;
};

const DESKS: { id: CalendarAdminDesk; label: string; hint: string }[] = [
  { id: "inbox", label: "Inbox", hint: "Paste an email or drop a screenshot — OpenAI drafts the stop" },
  { id: "week", label: "This week", hint: "Every ledger row on the week, public and private" },
  { id: "conflicts", label: "Conflicts", hint: "Same-day stacks, missing counties, possible duplicates" },
  { id: "queue", label: "Needs a county", hint: "Public rows that cannot paint a county yet" },
  { id: "edit", label: "Edit a stop", hint: "Change title, city, county, public/private" },
];

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function weekday(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(`${iso}T12:00:00`));
}

export function CalendarAdminWorkbench({
  stops,
  conflicts,
  labels,
  counties,
  weekStart,
  initialDesk,
  editId,
  openaiReady,
}: Props) {
  const [desk, setDesk] = useState<CalendarAdminDesk>(initialDesk);
  const [week, setWeek] = useState(weekStart);
  const [paste, setPaste] = useState("");
  const [images, setImages] = useState<Array<{ mime: string; base64: string; name: string }>>([]);
  const [proposals, setProposals] = useState<ProposedStop[]>([]);
  const [ignored, setIgnored] = useState<Array<{ title: string; reason: string }>>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(editId || "");
  const [pending, start] = useTransition();
  const router = useRouter();

  const weekStops = useMemo(
    () =>
      stops
        .filter((s) => s.date >= week && s.date <= addDays(week, 6))
        .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)),
    [stops, week],
  );
  const queueStops = stops.filter((s) => s.includeOnPublicPage && s.counties.length === 0);
  const selected = stops.find((s) => s.id === selectedId) ?? null;
  const hard = conflicts.filter((c) => c.severity === "hard");
  const review = conflicts.filter((c) => c.severity === "review");

  function onFiles(files: FileList | null) {
    if (!files) return;
    void Promise.all(
      [...files].slice(0, 6).map(
        (file) =>
          new Promise<{ mime: string; base64: string; name: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const url = String(reader.result || "");
              const base64 = url.includes(",") ? url.split(",")[1] : url;
              resolve({ mime: file.type || "image/png", base64, name: file.name });
            };
            reader.onerror = () => reject(new Error("Could not read file"));
            reader.readAsDataURL(file);
          }),
      ),
    ).then(setImages, (err) => setMessage(err instanceof Error ? err.message : String(err)));
  }

  function extract() {
    setMessage(null);
    start(async () => {
      const result = await extractCalendarAdminIngest({
        text: paste,
        images: images.map(({ mime, base64 }) => ({ mime, base64 })),
      });
      if (result.warning) setMessage(result.warning);
      else setMessage(`Extracted ${result.items.length} draft${result.items.length === 1 ? "" : "s"} with ${result.model}. Review before adding.`);
      setProposals(result.items);
      setIgnored(result.ignored);
    });
  }

  function commit() {
    setMessage(null);
    start(async () => {
      const result = await commitCalendarAdminProposals(proposals);
      if (!result.ok) setMessage(result.error);
      else {
        setMessage(`Added ${result.ids.length} stop${result.ids.length === 1 ? "" : "s"} to the campaign ledger.`);
        setProposals((rows) => rows.map((r) => ({ ...r, selected: false })));
        router.refresh();
      }
    });
  }

  function saveEdit(form: FormData) {
    if (!selected) return;
    const countiesRaw = String(form.get("counties") || "");
    const countyList = countiesRaw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    setMessage(null);
    start(async () => {
      const result = await updateCalendarAdminStop(selected.id, {
        title: String(form.get("title") || selected.title),
        publicTitle: String(form.get("publicTitle") || "") || null,
        date: String(form.get("date") || selected.date),
        city: String(form.get("city") || "") || null,
        counties: countyList,
        status: String(form.get("status") || selected.status) as VisitStatus,
        includeOnPublicPage: form.get("public") === "on",
        notes: String(form.get("notes") || "") || null,
      });
      setMessage(result.ok ? "Saved to the ledger." : result.error);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <nav className="flex flex-wrap gap-2" aria-label="Calendar admin desks">
        {DESKS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDesk(d.id)}
            className={`rounded-full border px-3 py-1.5 font-body text-xs font-bold ${
              desk === d.id
                ? "border-kelly-navy bg-kelly-navy text-white"
                : "border-kelly-navy/20 bg-white text-kelly-navy hover:border-kelly-navy/40"
            }`}
          >
            {d.label}
            {d.id === "conflicts" ? ` (${hard.length})` : ""}
            {d.id === "queue" ? ` (${queueStops.length})` : ""}
          </button>
        ))}
      </nav>
      <p className="font-body text-sm text-kelly-text/75">{DESKS.find((d) => d.id === desk)?.hint}</p>
      {message ? (
        <p className="rounded-lg border border-kelly-navy/20 bg-kelly-navy/[0.05] px-3 py-2 font-body text-sm" role="status">
          {message}
        </p>
      ) : null}

      {desk === "inbox" ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-kelly-navy/15 bg-white p-4">
            <h2 className="font-heading text-lg font-bold">1. Drop the source</h2>
            <p className="font-body text-xs text-kelly-muted">
              Same workflow as Cursor: screenshot of Google Calendar, a flyer photo, or the email paste. OpenAI reads it.
              Nothing hits the public site until you select and add.
            </p>
            <textarea
              className="min-h-[160px] w-full rounded-lg border border-kelly-navy/20 px-3 py-2 font-body text-sm"
              placeholder="Paste the email or calendar notes here…"
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onFiles(e.target.files)}
              className="font-body text-sm"
            />
            {images.length > 0 ? (
              <p className="font-body text-xs text-kelly-muted">{images.length} image{images.length === 1 ? "" : "s"} ready: {images.map((i) => i.name).join(", ")}</p>
            ) : null}
            <button
              type="button"
              disabled={pending || !openaiReady || (!paste.trim() && images.length === 0)}
              onClick={extract}
              className="rounded-md bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-40"
            >
              {pending ? "Reading…" : "Extract with OpenAI"}
            </button>
            {!openaiReady ? (
              <p className="font-body text-xs text-amber-800">Add OPENAI_API_KEY to RedDirt `.env.local` and restart.</p>
            ) : null}
          </div>
          <div className="space-y-3 rounded-xl border border-kelly-navy/15 bg-white p-4">
            <h2 className="font-heading text-lg font-bold">2. Review, then add</h2>
            {ignored.length > 0 ? (
              <ul className="font-body text-xs text-kelly-muted">
                {ignored.map((row) => (
                  <li key={`${row.title}-${row.reason}`}>
                    Skipped {row.title}: {row.reason}
                  </li>
                ))}
              </ul>
            ) : null}
            {proposals.length === 0 ? (
              <p className="font-body text-sm text-kelly-muted">Drafts appear here after extract.</p>
            ) : (
              <ul className="space-y-3">
                {proposals.map((p, i) => (
                  <li key={`${p.date}-${p.title}-${i}`} className="rounded-lg border border-kelly-navy/10 px-3 py-2">
                    <label className="flex items-start gap-2 font-body text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={p.selected}
                        onChange={(e) =>
                          setProposals((rows) =>
                            rows.map((r, j) => (j === i ? { ...r, selected: e.target.checked } : r)),
                          )
                        }
                      />
                      <span>
                        <strong>{p.publicTitle || p.title}</strong>
                        <span className="block text-xs text-kelly-muted">
                          {p.date}
                          {p.startTime ? ` ${p.startTime}` : ""}
                          {p.city ? ` · ${p.city}` : ""}
                          {p.counties.length ? ` · ${p.counties.join(", ")}` : " · county TBA"}
                          {p.skipAsPublic ? " · keep private" : p.includeOnPublicPage ? " · public" : " · hidden"}
                          {p.matchExistingId ? ` · already on ledger (${p.matchExistingId})` : ""}
                        </span>
                        {p.conflictNotes.length > 0 ? (
                          <span className="mt-1 block text-xs font-semibold text-amber-800">
                            {p.conflictNotes.join(" · ")}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              disabled={pending || proposals.every((p) => !p.selected)}
              onClick={commit}
              className="rounded-md bg-kelly-gold px-4 py-2 font-body text-sm font-bold text-kelly-navy disabled:opacity-40"
            >
              Add selected to the campaign ledger
            </button>
          </div>
        </section>
      ) : null}

      {desk === "week" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => setWeek(addDays(week, -7))}>
              ← Previous
            </button>
            <p className="font-heading font-bold">
              {weekday(week)} – {weekday(addDays(week, 6))}
            </p>
            <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => setWeek(addDays(week, 7))}>
              Next →
            </button>
          </div>
          <ul className="divide-y divide-kelly-navy/10 rounded-xl border border-kelly-navy/15 bg-white">
            {weekStops.length === 0 ? (
              <li className="px-4 py-6 font-body text-sm text-kelly-muted">Nothing on the ledger this week.</li>
            ) : (
              weekStops.map((s) => (
                <li key={s.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-muted">{weekday(s.date)}</p>
                    <p className="font-heading font-bold">{s.publicTitle || s.title}</p>
                    <p className="font-body text-xs text-kelly-muted">
                      {s.city || "City TBA"} · {s.counties.join(", ") || "county TBA"} · {s.status}
                      {s.includeOnPublicPage ? " · public" : " · hidden"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-bold text-kelly-navy underline"
                    onClick={() => {
                      setSelectedId(s.id);
                      setDesk("edit");
                    }}
                  >
                    Edit
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {desk === "conflicts" ? (
        <section className="space-y-4">
          <p className="font-body text-sm text-kelly-text/80">
            Hard = two public stops in different cities or counties the same day. Review = missing county or possible
            duplicate. Info = private/travel on a public day (not a neighbor-facing problem).
          </p>
          {[...hard, ...review, ...conflicts.filter((c) => c.severity === "info")].map((c) => (
            <article
              key={c.id}
              className={`rounded-xl border px-4 py-3 ${
                c.severity === "hard"
                  ? "border-amber-700/40 bg-amber-50"
                  : c.severity === "review"
                    ? "border-kelly-navy/20 bg-white"
                    : "border-kelly-navy/10 bg-kelly-navy/[0.03]"
              }`}
            >
              <p className="font-body text-[11px] font-bold uppercase tracking-wide text-kelly-muted">
                {c.severity} · {c.date} · {c.kind}
              </p>
              <h3 className="mt-1 font-heading font-bold">{c.title}</h3>
              <p className="mt-1 font-body text-sm text-kelly-text/80">{c.detail}</p>
              <p className="mt-2 font-body text-xs text-kelly-muted">
                {c.stopIds.map((id) => labels[id] || id).join(" · ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.stopIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="text-xs font-bold text-kelly-navy underline"
                    onClick={() => {
                      setSelectedId(id);
                      setDesk("edit");
                    }}
                  >
                    Edit {labels[id] || id}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {desk === "queue" ? (
        <section>
          <ul className="divide-y divide-kelly-navy/10 rounded-xl border border-kelly-navy/15 bg-white">
            {queueStops.length === 0 ? (
              <li className="px-4 py-6 font-body text-sm text-kelly-muted">Every public stop has a county.</li>
            ) : (
              queueStops.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-heading font-bold">{s.publicTitle || s.title}</p>
                    <p className="font-body text-xs text-kelly-muted">
                      {s.date} · {s.city || "city TBA"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-bold text-kelly-navy underline"
                    onClick={() => {
                      setSelectedId(s.id);
                      setDesk("edit");
                    }}
                  >
                    Assign county
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {desk === "edit" ? (
        <section className="max-w-xl space-y-4 rounded-xl border border-kelly-navy/15 bg-white p-4">
          <label className="block font-body text-sm">
            Stop
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Choose a stop…</option>
              {stops
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 400)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} — {s.publicTitle || s.title}
                  </option>
                ))}
            </select>
          </label>
          {selected ? (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit(new FormData(e.currentTarget));
              }}
            >
              <Field name="title" label="Internal title" defaultValue={selected.title} />
              <Field name="publicTitle" label="Public title" defaultValue={selected.publicTitle || ""} />
              <Field name="date" label="Date" defaultValue={selected.date} />
              <Field name="city" label="City" defaultValue={selected.city || ""} />
              <label className="block font-body text-sm">
                Counties (comma-separated; exact names)
                <input
                  name="counties"
                  defaultValue={selected.counties.join(", ")}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  list="admin-counties"
                />
              </label>
              <datalist id="admin-counties">
                {counties.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <label className="block font-body text-sm">
                Status
                <select name="status" defaultValue={selected.status} className="mt-1 w-full rounded-lg border px-3 py-2">
                  {(["scheduled", "completed", "needs-review", "private", "canceled", "declined", "virtual", "duplicate"] as VisitStatus[]).map(
                    (st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="checkbox" name="public" defaultChecked={selected.includeOnPublicPage} />
                Show on the public campaign calendar
              </label>
              <label className="block font-body text-sm">
                Operator notes (not shown on event pages)
                <textarea name="notes" defaultValue={selected.notes || ""} className="mt-1 min-h-[80px] w-full rounded-lg border px-3 py-2" />
              </label>
              <p className="font-body text-xs text-kelly-muted">
                Do not invent a street. Do not put emails or phones in the title or city. Uncheck public for lodging, travel,
                and staff meetings.
              </p>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-40"
              >
                {pending ? "Saving…" : "Save to ledger"}
              </button>
            </form>
          ) : (
            <p className="font-body text-sm text-kelly-muted">Pick a stop from the week or conflict list, or choose one above.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="block font-body text-sm">
      {label}
      <input name={name} defaultValue={defaultValue} className="mt-1 w-full rounded-lg border px-3 py-2" />
    </label>
  );
}
