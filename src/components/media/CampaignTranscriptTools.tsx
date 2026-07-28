"use client";

import { useMemo, useState } from "react";
import type { TranscriptSegment } from "@/content/media/campaign-media-types";

type Props = {
  youtubeVideoId: string;
  plainText: string;
  segments: TranscriptSegment[];
};

/**
 * Progressive enhancement for published transcripts: in-page search, download, copy quote.
 * Does not fetch transcript text — it operates on server-rendered props.
 */
export function CampaignTranscriptTools({ youtubeVideoId, plainText, segments }: Props) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const matchCount = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    if (segments.length) {
      return segments.filter((s) => s.text.toLowerCase().includes(q)).length;
    }
    return plainText.toLowerCase().includes(q) ? 1 : 0;
  }, [query, plainText, segments]);

  function download() {
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kelly-transcript-${youtubeVideoId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    void fetch("/api/public/transcript-analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "TRANSCRIPT_DOWNLOAD", youtubeVideoId }),
    }).catch(() => undefined);
  }

  async function copyQuote() {
    const text = window.getSelection()?.toString().trim() || plainText.slice(0, 280);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void fetch("/api/public/transcript-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TRANSCRIPT_COPY_QUOTE", youtubeVideoId }),
      }).catch(() => undefined);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3 border-b border-kelly-ink/10 pb-4">
      <label className="block max-w-md font-body text-sm">
        <span className="font-semibold text-kelly-navy">Search transcript</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) {
              void fetch("/api/public/transcript-analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "TRANSCRIPT_SEARCH", youtubeVideoId }),
              }).catch(() => undefined);
            }
          }}
          placeholder="Find a word or phrase"
          className="mt-1 w-full rounded-md border border-kelly-ink/15 bg-white px-3 py-2"
        />
        {matchCount != null ? (
          <span className="mt-1 block text-xs text-kelly-slate">
            {matchCount} matching {matchCount === 1 ? "section" : "sections"}
          </span>
        ) : null}
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={download}
          className="font-body text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline"
        >
          Download transcript
        </button>
        <button
          type="button"
          onClick={() => void copyQuote()}
          className="font-body text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline"
        >
          {copied ? "Copied" : "Copy quote"}
        </button>
      </div>
      {query.trim() && segments.length ? (
        <div className="sr-only" aria-live="polite">
          Filtered highlight query: {query}
        </div>
      ) : null}
      {/* Keep query available for CSS highlight via data attribute on parent if needed */}
      <input type="hidden" data-transcript-query={query} value={query} readOnly aria-hidden />
    </div>
  );
}
