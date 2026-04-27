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
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-kelly-text/70 px-[var(--gutter-x)] py-10 backdrop-blur-sm md:items-center md:py-16">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative max-h-[min(92vh,880px)] w-full max-w-3xl overflow-hidden rounded-card border border-kelly-text/15 bg-kelly-page shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-kelly-text/10 px-6 py-4 md:px-8">
          <div>
            <h2 id={titleId} className="font-heading text-xl font-bold text-kelly-text md:text-2xl">
              Search the movement
            </h2>
            <p id={descId} className="mt-1 font-body text-sm text-kelly-text/65">
              Keyword + semantic search over the ingested index. Grounded answers need OpenAI; matching pages still
              surface without it.
            </p>
            {indexStatus ? (
              <p className="mt-2 font-body text-xs text-kelly-text/50">
                Index:{" "}
                <strong className="text-kelly-text/70">
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
              className="w-full flex-1 rounded-btn border border-kelly-text/20 bg-[var(--color-surface-elevated)] px-4 py-3 font-body text-kelly-text shadow-sm transition focus:border-kelly-navy focus:outline-none focus:ring-2 focus:ring-kelly-navy/25"
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
          <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-kelly-text/75">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-kelly-text/30 text-kelly-navy focus:ring-kelly-navy/30"
              checked={includeAnswer}
              onChange={(e) => setIncludeAnswer(e.target.checked)}
            />
            Include a conversational search guide (grounded in results; vote / team / donate friendly)
          </label>
          {loading ? (
            <p className="rounded-btn border border-kelly-text/10 bg-kelly-text/[0.04] px-4 py-3 font-body text-sm text-kelly-text/75" role="status" aria-live="polite">
              {includeAnswer ? "Searching the site and drafting your guide…" : "Searching the index…"}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-btn border border-kelly-navy/30 bg-kelly-navy/10 px-4 py-3 font-body text-sm text-kelly-text" role="alert">
              {error}
            </p>
          ) : null}
          {includeAnswer && searched && !loading && answer ? (
            <div
              className="rounded-card border border-kelly-blue/25 bg-gradient-to-b from-kelly-fog/90 to-white p-5 shadow-[var(--shadow-soft)]"
              role="region"
              aria-label="Search guide message"
            >
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-blue">Your search guide</p>
              <p className="mt-1 font-body text-xs text-kelly-text/55">
                One friendly read on what you searched—then dig into the sources underneath.
              </p>
              <p className="mt-4 whitespace-pre-wrap font-body text-base leading-relaxed text-kelly-text">{answer}</p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-kelly-text/10 pt-4">
                <Link
                  href="/get-involved"
                  className="rounded-full border border-kelly-navy/30 bg-kelly-navy/10 px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy hover:border-kelly-navy/50"
                >
                  Get involved
                </Link>
                <Link
                  href="/donate"
                  className="rounded-full border border-kelly-gold/40 bg-kelly-gold/20 px-3 py-1.5 font-body text-xs font-semibold text-kelly-text hover:bg-kelly-gold/35"
                >
                  Donate
                </Link>
                <a
                  href="mailto:kelly@kellygrappe.com"
                  className="rounded-full border border-kelly-text/15 bg-white px-3 py-1.5 font-body text-xs font-semibold text-kelly-text/85 hover:border-kelly-blue/30"
                >
                  Email Kelly
                </a>
              </div>
            </div>
          ) : null}
          {includeAnswer && searched && !loading && !answer && results.length > 0 ? (
            <div className="rounded-card border border-amber-200/80 bg-amber-50/90 p-4 font-body text-sm text-kelly-text">
              We found pages below but no summary came back—try opening a source, toggling the guide off and on, or email
              kelly@kellygrappe.com.
            </div>
          ) : null}
          <div className="space-y-3">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-text/50">Sources</p>
            {searched && !loading && results.length === 0 && !error ? (
              <div
                className="rounded-card border border-dashed border-kelly-text/20 bg-kelly-text/[0.03] px-4 py-6 text-center"
                role="status"
              >
                {indexStatus && indexStatus.chunkCount === 0 ? (
                  <>
                    <p className="font-body text-sm font-medium text-kelly-text">Nothing to search yet.</p>
                    <p className="mt-2 font-body text-sm text-kelly-text/65">
                      Site search isn&apos;t available on this build. Use the menu or check back later.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-body text-sm font-medium text-kelly-text">No matching pages for that query.</p>
                    <p className="mt-2 font-body text-sm text-kelly-text/65">
                      Try different keywords, or use the nav—your index already has {indexStatus?.chunkCount ?? "some"}{" "}
                      excerpt{(indexStatus?.chunkCount ?? 0) === 1 ? "" : "s"}.
                    </p>
                  </>
                )}
              </div>
            ) : null}
            {!searched && !loading ? (
              <p className="font-body text-sm text-kelly-text/55">Search to see matching pages and excerpts.</p>
            ) : null}
            <ul className="space-y-3">
              {results.map((r) => (
                <li
                  key={`${r.path}-${r.snippet.slice(0, 24)}`}
                  className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-4 shadow-[var(--shadow-soft)] transition hover:border-kelly-navy/20"
                >
                  <Link
                    href={pathToHref(r.path)}
                    className="font-heading text-lg font-bold text-kelly-navy hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-navy/40"
                  >
                    {r.title || r.path}
                  </Link>
                  <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/75">{r.snippet}</p>
                  <p className="mt-2 font-mono text-xs text-kelly-text/45">
                    <span className="mr-2 rounded bg-kelly-text/10 px-1.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-kelly-text/60">
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
