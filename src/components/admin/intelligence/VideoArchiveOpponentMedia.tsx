"use client";

import { useState } from "react";
import type { OpponentMediaRow } from "@/lib/legislature/videoArchiveRoom";
import { isYoutubeUrl } from "@/lib/intelligence/opponents/loadOpponentMediaCatalog";

export function VideoArchiveOpponentMedia({
  rows,
  opponentLabel,
  cutReadyFolderLabel,
}: {
  rows: OpponentMediaRow[];
  opponentLabel: string;
  cutReadyFolderLabel: string;
}) {
  const [snippetFor, setSnippetFor] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitSnippet(e: React.FormEvent<HTMLFormElement>, parentId: string) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/intelligence/video-archive/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "opponent_snippet",
          parentOpponentMediaId: parentId,
          title: String(fd.get("title")),
          externalUrl: String(fd.get("externalUrl") || "") || undefined,
          slotLabel: String(fd.get("slotLabel") || "Snippet 1"),
          notes: String(fd.get("notes") || "") || undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      setStatus(data.ok ? "Snippet registered in cut-and-ready — refresh page." : data.error ?? "Failed");
      if (data.ok) setSnippetFor(null);
    } catch {
      setStatus("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-kelly-muted">
        {rows.length} curated links for {opponentLabel}. Watch → download locally → cut → register snippet below (upload slot).
        Verify speaker before debate use.
      </p>
      {status ? <p className="text-xs font-bold text-amber-900">{status}</p> : null}
      {rows.map((entry) => (
        <article key={entry.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-bold text-kelly-navy">{entry.title}</p>
              <p className="mt-1 text-kelly-muted">
                {entry.publisher} · {entry.platform} · {entry.researchValue} · {entry.speakerVerification}
              </p>
              <p className="mt-2 text-kelly-text">{entry.summary}</p>
              <p className="mt-2 flex flex-wrap gap-1">
                {entry.topicTags.map((t) => (
                  <span key={t} className="rounded bg-kelly-page px-1.5 py-0.5 text-[10px]">
                    {t}
                  </span>
                ))}
              </p>
            </div>
            {isYoutubeUrl(entry.url) ? (
              <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900">YouTube</span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href={entry.watchUrl} target="_blank" rel="noreferrer" className="font-bold text-kelly-navy underline">
              Watch / open
            </a>
            <a href={entry.downloadUrl} className="font-bold text-kelly-navy underline">
              Download / source link
            </a>
            <button type="button" onClick={() => setSnippetFor(entry.id)} className="font-bold text-emerald-900 underline">
              + Upload snippet slot
            </button>
          </div>

          <div className="mt-3 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/20 p-3">
            <p className="font-bold uppercase text-emerald-900">{cutReadyFolderLabel} — snippets ({entry.snippets.length})</p>
            {entry.snippets.length === 0 ? (
              <p className="mt-1 text-kelly-muted">Empty — team adds cut after edit.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {entry.snippets.map((s) => (
                  <li key={s.id}>
                    <span className="font-semibold">{s.title}</span>
                    {s.externalUrl ? (
                      <a href={s.externalUrl} className="ml-2 underline" target="_blank" rel="noreferrer">
                        Play cut
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {entry.snippetSlots.filter((s) => s.status === "EMPTY").length > 0 ? (
              <p className="mt-2 text-[10px] text-amber-900">
                {entry.snippetSlots.filter((s) => s.status === "EMPTY").length} empty slot(s) reserved
              </p>
            ) : null}
          </div>

          {snippetFor === entry.id ? (
            <form onSubmit={(e) => submitSnippet(e, entry.id)} className="mt-3 rounded border border-kelly-navy/20 p-3">
              <p className="font-bold text-kelly-navy">Register usable clip</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <input name="title" required placeholder="Clip title (e.g. Hammer petition quote 0:42)" className="rounded border px-2 py-1 sm:col-span-2" />
                <input name="externalUrl" type="url" placeholder="Hosted file URL after export" className="rounded border px-2 py-1 sm:col-span-2" />
                <input name="slotLabel" placeholder="Slot label" defaultValue="Snippet 1" className="rounded border px-2 py-1" />
                <input name="notes" placeholder="In/out points, claims status" className="rounded border px-2 py-1" />
              </div>
              <div className="mt-2 flex gap-2">
                <button type="submit" disabled={busy} className="rounded bg-kelly-navy px-2 py-1 font-bold text-white">
                  Save snippet
                </button>
                <button type="button" onClick={() => setSnippetFor(null)} className="rounded border px-2 py-1">
                  Cancel
                </button>
              </div>
              <p className="mt-2 text-[10px] text-kelly-muted">Binary file upload to DB — phase 2. Paste Drive/Dropbox/media library URL for now.</p>
            </form>
          ) : null}
        </article>
      ))}
    </div>
  );
}
