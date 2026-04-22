"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { pathKindLabel, pathToHref } from "@/lib/search/paths";

type SearchResult = { path: string; title: string | null; snippet: string; score: number };

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId();
  const descId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [includeAnswer, setIncludeAnswer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [indexStatus, setIndexStatus] = useState<{
    chunkCount: number;
    openai: boolean;
    database: boolean;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/search");
        const json = (await res.json()) as {
          chunkCount?: number;
          openai?: boolean;
          database?: boolean;
        };
        if (cancelled) return;
        setIndexStatus({
          chunkCount: typeof json.chunkCount === "number" ? json.chunkCount : 0,
          openai: Boolean(json.openai),
          database: Boolean(json.database),
        });
      } catch {
        if (!cancelled) setIndexStatus(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const runSearch = async () => {
    setLoading(true);
    setError(null);
    setAnswer(null);
    setSearched(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, includeAnswer }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        results?: SearchResult[];
        answer?: string | null;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(json.message || json.error || "Search failed.");
        setResults([]);
        return;
      }
      setResults(json.results ?? []);
      setAnswer(json.answer ?? null);
    } catch {
      setError("Network error.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const node = (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-deep-soil/70 px-[var(--gutter-x)] py-10 backdrop-blur-sm md:items-center md:py-16">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative max-h-[min(92vh,880px)] w-full max-w-3xl overflow-hidden rounded-card border border-deep-soil/15 bg-cream-canvas shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-deep-soil/10 px-6 py-4 md:px-8">
          <div>
            <h2 id={titleId} className="font-heading text-xl font-bold text-deep-soil md:text-2xl">
              Search the movement
            </h2>
            <p id={descId} className="mt-1 font-body text-sm text-deep-soil/65">
              Keyword + semantic search over the ingested index. Grounded answers need OpenAI; matching pages still
              surface without it.
            </p>
            {indexStatus ? (
              <p className="mt-2 font-body text-xs text-deep-soil/50">
                Index:{" "}
                <strong className="text-deep-soil/70">
                  {indexStatus.chunkCount.toLocaleString()} excerpt{indexStatus.chunkCount === 1 ? "" : "s"}
                </strong>
                {indexStatus.database ? "" : " · Database offline in env"}
                {indexStatus.openai ? " · Embeddings on" : " · Embeddings off (keyword mode)"}
                {indexStatus.chunkCount === 0 && indexStatus.database ? (
                  <span className="mt-1 block text-amber-900/90">
                    With zero excerpts, search has nothing to read—run ingest once so this isn’t an empty library.
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Close search dialog">
            Close
          </Button>
        </div>
        <div className="max-h-[min(72vh,720px)] space-y-4 overflow-y-auto px-6 py-6 md:px-8">
          {indexStatus?.chunkCount === 0 && indexStatus.database ? (
            <div
              className="rounded-lg border border-amber-300/80 bg-amber-50 px-4 py-3 font-body text-sm leading-relaxed text-amber-950/95"
              role="status"
            >
              <strong className="font-bold">The index is empty.</strong> Answers and snippets come from ingested site
              pages—not from “smarts” alone. After you run{" "}
              <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">npm run ingest</code> with{" "}
              <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">DATABASE_URL</code>
              {indexStatus.openai ? (
                <>
                  {" "}
                  and <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">OPENAI_API_KEY</code>
                </>
              ) : null}
              , try again.
            </div>
          ) : null}
          <div className="flex flex-col gap-3 md:flex-row">
            <label htmlFor={`${titleId}-q`} className="sr-only">
              Search query
            </label>
            <input
              id={`${titleId}-q`}
              ref={inputRef}
              className="w-full flex-1 rounded-btn border border-deep-soil/20 bg-[var(--color-surface-elevated)] px-4 py-3 font-body text-deep-soil shadow-sm transition focus:border-red-dirt focus:outline-none focus:ring-2 focus:ring-red-dirt/25"
              placeholder="Ask a question or type keywords…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void runSearch();
              }}
            />
            <Button type="button" variant="primary" onClick={() => void runSearch()} disabled={loading || !query.trim()}>
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>
          <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-deep-soil/75">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-deep-soil/30 text-red-dirt focus:ring-red-dirt/30"
              checked={includeAnswer}
              onChange={(e) => setIncludeAnswer(e.target.checked)}
            />
            Include a short grounded answer (requires OpenAI + excerpts)
          </label>
          {loading ? (
            <p className="rounded-btn border border-deep-soil/10 bg-deep-soil/[0.04] px-4 py-3 font-body text-sm text-deep-soil/75" role="status" aria-live="polite">
              Searching the index…
            </p>
          ) : null}
          {error ? (
            <p className="rounded-btn border border-red-dirt/30 bg-red-dirt/10 px-4 py-3 font-body text-sm text-deep-soil" role="alert">
              {error}
            </p>
          ) : null}
          {answer ? (
            <div className="rounded-card border border-field-green/30 bg-field-green/10 p-5">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-field-green">Answer</p>
              <p className="mt-2 whitespace-pre-wrap font-body text-base leading-relaxed text-deep-soil">{answer}</p>
            </div>
          ) : null}
          <div className="space-y-3">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-deep-soil/50">Sources</p>
            {searched && !loading && results.length === 0 && !error ? (
              <div
                className="rounded-card border border-dashed border-deep-soil/20 bg-deep-soil/[0.03] px-4 py-6 text-center"
                role="status"
              >
                {indexStatus && indexStatus.chunkCount === 0 ? (
                  <>
                    <p className="font-body text-sm font-medium text-deep-soil">Nothing to search yet.</p>
                    <p className="mt-2 font-body text-sm text-deep-soil/65">
                      The assistant is fine—it needs indexed page excerpts first. From the project root, run{" "}
                      <code className="rounded bg-deep-soil/10 px-1.5 py-0.5 font-mono text-xs">npm run ingest</code> with{" "}
                      <code className="rounded bg-deep-soil/10 px-1.5 py-0.5 font-mono text-xs">DATABASE_URL</code>
                      {indexStatus.openai ? (
                        <>
                          {" "}
                          and <code className="rounded bg-deep-soil/10 px-1.5 py-0.5 font-mono text-xs">OPENAI_API_KEY</code>
                        </>
                      ) : null}{" "}
                      (embeddings optional for keyword-only), then search again.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-body text-sm font-medium text-deep-soil">No matching pages for that query.</p>
                    <p className="mt-2 font-body text-sm text-deep-soil/65">
                      Try different keywords, or use the nav—your index already has {indexStatus?.chunkCount ?? "some"}{" "}
                      excerpt{(indexStatus?.chunkCount ?? 0) === 1 ? "" : "s"}.
                    </p>
                  </>
                )}
              </div>
            ) : null}
            {!searched && !loading ? (
              <p className="font-body text-sm text-deep-soil/55">Run a search to see excerpts and links.</p>
            ) : null}
            <ul className="space-y-3">
              {results.map((r) => (
                <li
                  key={`${r.path}-${r.snippet.slice(0, 24)}`}
                  className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-4 shadow-[var(--shadow-soft)] transition hover:border-red-dirt/20"
                >
                  <Link
                    href={pathToHref(r.path)}
                    className="font-heading text-lg font-bold text-red-dirt hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-dirt/40"
                  >
                    {r.title || r.path}
                  </Link>
                  <p className="mt-2 font-body text-sm leading-relaxed text-deep-soil/75">{r.snippet}</p>
                  <p className="mt-2 font-mono text-xs text-deep-soil/45">
                    <span className="mr-2 rounded bg-deep-soil/10 px-1.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-deep-soil/60">
                      {pathKindLabel(r.path)}
                    </span>
                    {r.path}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
