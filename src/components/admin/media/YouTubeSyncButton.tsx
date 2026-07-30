"use client";

import { useState } from "react";

export function YouTubeSyncButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/youtube/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxVideos: 25, downloadCaptions: true }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; result?: { downloaded?: number; needingReview?: number } };
      if (!res.ok || !json.ok) {
        setMsg(json.error ?? "Sync failed");
      } else {
        setMsg(`Synced. Downloaded ${json.result?.downloaded ?? 0}; ${json.result?.needingReview ?? 0} need review.`);
        window.location.reload();
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => void run()}
        className="rounded-md border border-kelly-text/20 bg-white px-4 py-2 font-body text-sm font-semibold text-kelly-text disabled:opacity-60"
      >
        {busy ? "Syncing…" : "Run video + caption sync"}
      </button>
      {msg ? <span className="font-body text-xs text-kelly-muted">{msg}</span> : null}
    </div>
  );
}
