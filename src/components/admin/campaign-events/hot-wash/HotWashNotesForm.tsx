"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveHotWashNotesAction } from "@/app/admin/(board)/campaign-events/media-actions";
import { HOT_WASH_NOTE_FIELDS, type HotWashNotes } from "@/lib/campaign-events/hot-wash-notes";

export function HotWashNotesForm({ recordId, initial }: { recordId: string; initial: HotWashNotes }) {
  const router = useRouter();
  const [notes, setNotes] = useState<HotWashNotes>(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = () => {
    startTransition(async () => {
      await saveHotWashNotesAction(recordId, notes);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
      <h2 className="font-heading text-base font-bold">Hot Wash notes</h2>
      <p className="mt-1 font-body text-xs text-kelly-muted">Saved on the event ledger (`_hotWash` on fact card). Distinct from media files.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {HOT_WASH_NOTE_FIELDS.map((f) => (
          <label key={f.key} className={`grid gap-1 font-body text-sm ${f.rows && f.rows > 2 ? "sm:col-span-2" : ""}`}>
            <span className="text-xs font-bold text-kelly-slate">{f.label}</span>
            {f.rows && f.rows > 1 ? (
              <textarea
                className="rounded-lg border px-3 py-2 text-sm"
                rows={f.rows}
                value={notes[f.key] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [f.key]: e.target.value }))}
              />
            ) : (
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                value={notes[f.key] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [f.key]: e.target.value }))}
              />
            )}
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" disabled={pending} onClick={save} className="rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white">
          Save Hot Wash notes
        </button>
        {saved ? <span className="text-xs font-bold text-emerald-800">Saved</span> : null}
      </div>
    </section>
  );
}
