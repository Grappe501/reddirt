"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ELECTION_PLAN_SEARCH_SUGGESTIONS,
  type ElectionPlanSearchHit,
} from "@/lib/election-plan/load-election-plan-search";

function confidenceClass(c: ElectionPlanSearchHit["confidence"]): string {
  if (c === "high") return "bg-emerald-100 text-emerald-900";
  if (c === "medium") return "bg-amber-100 text-amber-900";
  return "bg-slate-100 text-slate-700";
}

function typeClass(type: string): string {
  if (type === "Executive Book") return "bg-[var(--ep-navy)] text-white";
  if (type === "Doctrine") return "bg-violet-800 text-white";
  if (type === "County") return "bg-emerald-700 text-white";
  if (type === "City") return "bg-teal-700 text-white";
  if (type === "Campus") return "bg-indigo-700 text-white";
  if (type === "Calendar") return "bg-orange-700 text-white";
  if (type === "Budget") return "bg-amber-700 text-white";
  if (type === "Message") return "bg-sky-700 text-white";
  if (type === "Academy") return "bg-rose-700 text-white";
  if (type === "County Party") return "bg-blue-700 text-white";
  if (type === "Community Workbench") return "bg-[var(--ep-gold)] text-[var(--ep-navy)]";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy)]";
}

export function ElectionPlanSearchPanel() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  const [results, setResults] = useState<ElectionPlanSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ entryCount: number; generatedAt: string } | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<string>("keyword-local");
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    if (!q) {
      setResults([]);
      setError(null);
      setAiAnswer(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/election-plan/search?q=${encodeURIComponent(q)}&ai=1`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Search failed (${res.status})`);
        }
        return res.json() as Promise<{
          query: string;
          results: ElectionPlanSearchHit[];
          meta: { entryCount: number; generatedAt: string };
          mode?: string;
          aiAnswer?: string | null;
          aiEnabled?: boolean;
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        setResults(data.results);
        setMeta(data.meta);
        setAiAnswer(data.aiAnswer ?? null);
        setSearchMode(data.mode ?? "keyword-local");
        setAiEnabled(Boolean(data.aiEnabled));
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7H · Executive Search</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Election Plan Search</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Local-only index · election plan · executive book · strategic docs · public website · no admin or private data
      </p>

      {!q ? (
        <div className="mt-8">
          <p className="text-sm font-semibold text-[var(--ep-navy)]">Try asking:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ELECTION_PLAN_SEARCH_SUGGESTIONS.map((s) => (
              <Link
                key={s.query}
                href={`/election-plan/search?q=${encodeURIComponent(s.query)}`}
                className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1.5 text-sm font-medium hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm text-[var(--ep-navy-muted)]">
            Results for <strong className="text-[var(--ep-navy)]">&ldquo;{q}&rdquo;</strong>
            {meta ? (
              <span className="ml-2 text-xs">
                · {meta.entryCount.toLocaleString()} indexed · {new Date(meta.generatedAt).toLocaleDateString()}
              </span>
            ) : null}
          </p>

          {loading ? <p className="mt-4 text-sm italic">Searching…</p> : null}
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

          {!loading && !error && aiAnswer ? (
            <div className="mt-4 rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">
                {searchMode === "keyword-local+ai" ? "AI summary · local sources only" : "Summary"}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--ep-navy)]">{aiAnswer}</p>
              <p className="mt-2 text-[10px] text-[var(--ep-navy-muted)]">
                Citations must match result cards below. Uncertain meeting dates require human verification.
              </p>
            </div>
          ) : null}

          {!loading && !error && q && !aiAnswer && aiEnabled === false ? (
            <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
              Keyword search only · set OPENAI_API_KEY for optional AI summary from local hits.
            </p>
          ) : null}

          {!loading && !error && results.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ep-navy-muted)]">No matches. Try a county name, topic, or chapter title.</p>
          ) : null}

          <ul className="mt-4 space-y-3">
            {results.map((hit) => (
              <li key={hit.id}>
                <Link
                  href={hit.href}
                  className="ep-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-heading font-bold text-[var(--ep-navy)]">{hit.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${typeClass(hit.type)}`}>
                        {hit.type}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${confidenceClass(hit.confidence)}`}>
                        {hit.confidence}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{hit.excerpt}</p>
                  <p className="mt-2 text-[10px] text-[var(--ep-navy-muted)]">
                    Source: {hit.sourcePath}
                    {hit.sourcePublicUrl ? (
                      <>
                        {" · "}
                        <a href={hit.sourcePublicUrl} target="_blank" rel="noopener noreferrer" className="underline">
                          public source ↗
                        </a>
                      </>
                    ) : null}
                    {" · "}relevance {Math.round(hit.score * 100)}%
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
