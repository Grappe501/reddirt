"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ResolveResult = {
  ok?: boolean;
  action?: string;
  youtubeVideoId?: string | null;
  message?: string;
  media?: { id: string; title: string; youtubeVideoId: string; publicationStatus: string } | null;
};

/**
 * Paste any YouTube URL/id → open existing registry record or report not found.
 * Never creates a duplicate asset.
 */
export function CampaignMediaImportLookup() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResolveResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/media/resolve-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const json = (await res.json()) as ResolveResult;
      setResult(json);
      if (json.action === "OPEN_EXISTING" && json.youtubeVideoId) {
        router.push(`/admin/media/youtube/${json.youtubeVideoId}`);
      }
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
      <h2 className="font-heading text-xl font-bold text-kelly-text">Import / duplicate check</h2>
      <p className="mt-2 font-body text-sm text-kelly-text/75">
        Paste a YouTube URL or video id. If it already exists in the campaign media registry, we open that record —
        we never create a second asset for the same video.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://youtu.be/72oKVAwfzZw or video id"
          className="w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-md bg-kelly-text px-4 py-2 font-body text-sm font-semibold text-kelly-page disabled:opacity-60"
        >
          {busy ? "Checking…" : "Resolve"}
        </button>
      </form>
      {result?.message ? (
        <p
          className={`mt-3 font-body text-sm ${
            result.action === "OPEN_EXISTING"
              ? "text-amber-900"
              : result.action === "CREATE_NEW_CANDIDATE"
                ? "text-emerald-900"
                : "text-red-900"
          }`}
        >
          {result.message}
          {result.action === "CREATE_NEW_CANDIDATE" && result.youtubeVideoId ? (
            <span className="mt-1 block text-kelly-muted">
              Canonical id <code className="font-mono text-xs">{result.youtubeVideoId}</code> is not in the typed
              registry yet — add it once via the registry/doctrine slice, then attach transcripts to that record.
            </span>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}
