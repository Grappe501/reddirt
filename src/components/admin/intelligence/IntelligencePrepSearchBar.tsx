"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { CandidateIntelSearchKind, CandidateIntelSearchResult, IntelStageSafe } from "@/lib/intelligence/candidateIntelligenceSearch";
import type { IntelSearchSmartBrief } from "@/lib/intelligence/intelligenceSmartSearch";
import { highlightIntelMatches, tokenizeIntelQuery } from "@/lib/intelligence/intelligenceSearchCore";
import { openIntelPrepSearch, subscribeIntelPrepSearchOpen } from "@/lib/intelligence/intelligencePrepSearchOpen";

const KIND_LABELS: Record<CandidateIntelSearchKind, string> = {
  nav: "Prep page",
  field_book: "Field Book",
  claim: "Claim",
  chunk: "Indexed intel",
  trap_lane: "Trap lane",
  sos_question: "SOS question",
  glossary: "Glossary",
  hammer_module: "Hammer module",
  diligence: "Diligence",
  citation: "Citation",
  debate_depth: "Debate depth",
  offensive_move: "Offensive move",
};

type TonightStackItem = {
  href: string;
  title: string;
  why: string;
  stageSafe: IntelStageSafe;
};

const KIND_COLORS: Record<CandidateIntelSearchKind, string> = {
  nav: "bg-indigo-100 text-indigo-950",
  field_book: "bg-sky-100 text-sky-950",
  claim: "bg-amber-100 text-amber-950",
  chunk: "bg-slate-100 text-slate-800",
  trap_lane: "bg-rose-100 text-rose-950",
  sos_question: "bg-emerald-100 text-emerald-950",
  glossary: "bg-violet-100 text-violet-950",
  hammer_module: "bg-orange-100 text-orange-950",
  diligence: "bg-teal-100 text-teal-950",
  citation: "bg-yellow-100 text-yellow-950",
  debate_depth: "bg-fuchsia-100 text-fuchsia-950",
  offensive_move: "bg-red-100 text-red-950",
};

const STAGE_SAFE_STYLES: Record<IntelStageSafe, string> = {
  clear: "bg-emerald-100 text-emerald-900",
  verify: "bg-amber-100 text-amber-950",
  blocked: "bg-rose-200 text-rose-950",
  research: "bg-slate-100 text-slate-700",
};

const GROUP_ORDER: { key: string; label: string; kinds: CandidateIntelSearchKind[] }[] = [
  { key: "stage", label: "Stage prep", kinds: ["trap_lane", "sos_question", "offensive_move", "debate_depth"] },
  { key: "depth", label: "Depth guides", kinds: ["debate_depth", "field_book", "glossary"] },
  { key: "pages", label: "Pages", kinds: ["nav", "hammer_module"] },
  { key: "evidence", label: "Evidence", kinds: ["claim", "citation", "diligence"] },
  { key: "indexed", label: "Indexed library", kinds: ["chunk"] },
];

function StageSafeBadge({ level }: { level: IntelStageSafe }) {
  const label =
    level === "clear" ? "Stage clear" : level === "verify" ? "Verify first" : level === "blocked" ? "Blocked" : "Research";
  return (
    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${STAGE_SAFE_STYLES[level]}`}>
      {label}
    </span>
  );
}

const RECENT_KEY = "intel-prep-search-recent-v1";

type IndexStatus = {
  corpusTotal: number;
  trapLanes: number;
  sosQuestions: number;
  claims: number;
  searchChunks: number;
  openai: boolean;
};

function HighlightedText({ text, query }: { text: string; query: string }) {
  const terms = tokenizeIntelQuery(query);
  const marked = highlightIntelMatches(text, terms, query);
  const parts = marked.split(/(⟨[^⟩]+⟩)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("⟨") && part.endsWith("⟩")) {
          return (
            <mark key={i} className="rounded bg-amber-200/80 px-0.5 font-semibold text-amber-950">
              {part.slice(1, -1)}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function groupResults(results: CandidateIntelSearchResult[]) {
  const groups: { key: string; label: string; items: CandidateIntelSearchResult[] }[] = [];
  const used = new Set<string>();
  for (const g of GROUP_ORDER) {
    const items = results.filter((r) => g.kinds.includes(r.kind) && !used.has(`${r.kind}-${r.href}`));
    for (const item of items) used.add(`${item.kind}-${item.href}`);
    if (items.length) groups.push({ key: g.key, label: g.label, items });
  }
  const rest = results.filter((r) => !used.has(`${r.kind}-${r.href}`));
  if (rest.length) groups.push({ key: "other", label: "More", items: rest });
  return groups;
}

type IntelligencePrepSearchBarProps = {
  variant?: "sticky" | "bottom-nav" | "sidebar" | "ipad-header" | "trigger-only";
  /** When true, responds to header buttons and Ctrl+K open requests. */
  listenOnOpen?: boolean;
};

export function IntelligencePrepSearchBar({
  variant = "sticky",
  listenOnOpen = variant === "sidebar" || variant === "ipad-header" || variant === "sticky",
}: IntelligencePrepSearchBarProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CandidateIntelSearchResult[]>([]);
  const [smart, setSmart] = useState<IntelSearchSmartBrief | null>(null);
  const [searched, setSearched] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [indexStatus, setIndexStatus] = useState<IndexStatus | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [tonightStack, setTonightStack] = useState<TonightStackItem[]>([]);
  const [didYouMean, setDidYouMean] = useState<string[]>([]);

  const grouped = useMemo(() => groupResults(results), [results]);
  const displayOrder = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/intelligence/search");
        if (!res.ok) return;
        const json = (await res.json()) as {
          corpus?: {
            corpusTotal?: number;
            trapLanes?: number;
            sosQuestions?: number;
            claims?: number;
            searchChunks?: number;
          };
          chunkCount?: number;
          openai?: boolean;
          suggestions?: string[];
          tonightStack?: TonightStackItem[];
        };
        if (cancelled) return;
        setTonightStack(json.tonightStack ?? []);
        setIndexStatus({
          corpusTotal: json.corpus?.corpusTotal ?? 0,
          trapLanes: json.corpus?.trapLanes ?? 0,
          sosQuestions: json.corpus?.sosQuestions ?? 0,
          claims: json.corpus?.claims ?? 0,
          searchChunks: json.chunkCount ?? json.corpus?.searchChunks ?? 0,
          openai: Boolean(json.openai),
        });
        setSuggestions(json.suggestions ?? []);
      } catch {
        if (!cancelled) setIndexStatus(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveRecent = useCallback((q: string) => {
    setRecent((prev) => {
      const next = [q, ...prev.filter((x) => x !== q)].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const runSearch = useCallback(
    async (q: string, withGuide: boolean) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      if (withGuide) {
        setLoadingGuide(true);
        saveRecent(trimmed);
      } else {
        setLoading(true);
      }
      setError(null);
      if (withGuide) {
        setSmart(null);
        setDidYouMean([]);
      }
      setSearched(true);
      setActiveIdx(0);
      try {
        const res = await fetch("/api/admin/intelligence/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            includeBrief: withGuide,
            mode: "smart",
            profile: "CANDIDATE",
          }),
        });
        const json = (await res.json()) as {
          ok?: boolean;
          results?: CandidateIntelSearchResult[];
          smart?: IntelSearchSmartBrief | null;
          didYouMean?: string[];
          message?: string;
          error?: string;
        };
        if (!res.ok) {
          setError(json.message || json.error || "Search failed.");
          if (!withGuide) setResults([]);
          return;
        }
        setResults(json.results ?? []);
        if (withGuide) {
          setSmart(json.smart ?? null);
          setDidYouMean(json.didYouMean ?? []);
        }
      } catch {
        setError("Network error — check connection and try again.");
        if (!withGuide) setResults([]);
      } finally {
        setLoading(false);
        setLoadingGuide(false);
      }
    },
    [saveRecent],
  );

  useEffect(() => {
    if (!query.trim() || !expanded) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(query, false);
    }, 320);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, expanded, runSearch]);

  const focusSearch = useCallback(() => {
    setExpanded(true);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    if (!listenOnOpen) return;
    return subscribeIntelPrepSearchOpen(focusSearch);
  }, [listenOnOpen, focusSearch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        focusSearch();
      }
      if (!expanded) return;
      if (e.key === "Escape") {
        setExpanded(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, Math.max(0, displayOrder.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && displayOrder[activeIdx] && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.location.href = displayOrder[activeIdx]!.href;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, displayOrder, activeIdx, focusSearch]);

  useEffect(() => {
    if (!expanded) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [expanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runSearch(query, true);
    setExpanded(true);
  };

  const pickSuggestion = (s: string) => {
    setQuery(s);
    setExpanded(true);
    void runSearch(s, true);
  };

  const placeholder =
    variant === "sidebar"
      ? "Trap lanes · Hammer · SOS · claims…"
      : "Trap lanes · Hammer · SOS questions · claims · philosophy…";

  const formShell =
    variant === "trigger-only" ? (
      <button
        type="button"
        onClick={() => openIntelPrepSearch()}
        className="flex w-full min-h-11 items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-indigo-900 active:bg-indigo-50"
        aria-label="Open debate prep search"
      >
        <span aria-hidden>🔍</span>
        Search debate prep
        <span className="font-normal text-kelly-subtle">· Ctrl+K</span>
      </button>
    ) : variant === "ipad-header" ? (
      <div
        className="border-b border-indigo-200 bg-gradient-to-b from-indigo-50 to-white px-4 py-3"
        data-intel-search="3.2"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor={inputId} className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-900">
            Debate prep search
          </label>
          <div className="flex gap-2">
            <input
              id={inputId}
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder="Trap lanes · Hammer · SOS questions · claims · philosophy…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setExpanded(true)}
              className="min-h-12 flex-1 rounded-xl border-2 border-indigo-300 bg-white px-3 text-base text-kelly-text shadow-sm placeholder:text-kelly-subtle focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="submit"
              disabled={loadingGuide || !query.trim()}
              className="min-h-12 shrink-0 rounded-xl bg-indigo-700 px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              {loadingGuide ? "…" : "Go"}
            </button>
          </div>
          <p className="text-[10px] text-indigo-800/80">
            Ctrl+K anywhere · live hits as you type · Enter for AI reading order
            {indexStatus?.openai ? " · semantic on" : ""}
          </p>
        </form>
      </div>
    ) : variant === "sidebar" ? (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
          🔍 Debate prep search
        </label>
        <div className="flex gap-1.5">
          <input
            id={inputId}
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setExpanded(true)}
            className="min-h-10 flex-1 rounded-md border-2 border-emerald-400/70 bg-kelly-page/15 px-2.5 text-sm text-kelly-page placeholder:text-kelly-inverse-muted focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
          />
          <button
            type="submit"
            disabled={loadingGuide || !query.trim()}
            className="min-h-10 shrink-0 rounded-md bg-emerald-500 px-3 text-[10px] font-bold text-white disabled:opacity-40"
          >
            {loadingGuide ? "…" : "Go"}
          </button>
        </div>
        <p className="text-[9px] font-semibold text-emerald-200/90">Ctrl+K · live results · Enter for prep guide</p>
      </form>
    ) : variant === "bottom-nav" ? (
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-2 py-2">
        <label htmlFor={inputId} className="sr-only">
          Debate prep search
        </label>
        <span className="pl-1 text-sm text-kelly-subtle" aria-hidden>
          🔍
        </span>
        <input
          id={inputId}
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Trap lanes · Hammer · claims…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setExpanded(true)}
          className="min-h-10 flex-1 rounded-lg border border-kelly-text/15 bg-kelly-page/60 px-3 text-sm text-kelly-text placeholder:text-kelly-subtle focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={loadingGuide || !query.trim()}
          className="min-h-10 shrink-0 rounded-lg bg-indigo-700 px-3 text-xs font-bold text-white disabled:opacity-40"
        >
          {loadingGuide ? "…" : "Go"}
        </button>
      </form>
    ) : (
      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-kelly-text/10 bg-kelly-page/95 px-4 py-3 backdrop-blur-sm lg:-mx-8 lg:px-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <label htmlFor={inputId} className="text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-subtle">
              Debate prep search
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id={inputId}
                ref={inputRef}
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setExpanded(true)}
                className="min-h-11 flex-1 rounded-lg border border-kelly-text/15 bg-white px-3 text-sm text-kelly-text shadow-sm placeholder:text-kelly-subtle focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="submit"
                disabled={loadingGuide || !query.trim()}
                className="min-h-11 shrink-0 rounded-lg bg-indigo-700 px-4 text-sm font-bold text-white disabled:opacity-40"
              >
                {loadingGuide ? "Guide…" : "Search"}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-kelly-subtle sm:max-w-[14rem] sm:pt-5">
            Ctrl+K · type for live hits · Enter for AI reading order
            {indexStatus?.openai ? " · semantic on" : ""}
          </p>
        </form>
      </div>
    );

  const resultIndexByKey = useMemo(() => {
    const map = new Map<string, number>();
    displayOrder.forEach((r, i) => map.set(`${r.kind}-${r.href}`, i));
    return map;
  }, [displayOrder]);

  const resultsPanel = expanded ? (
    <div
      className={`fixed inset-0 z-[60] flex bg-black/45 ${
        variant === "bottom-nav" ? "flex-col justify-end" : "items-start justify-center p-4 pt-[6vh] sm:items-center"
      }`}
      role="dialog"
      aria-label="Debate prep search"
      onClick={() => setExpanded(false)}
    >
      <div
        className={`flex w-full flex-col overflow-hidden bg-white shadow-2xl ${
          variant === "bottom-nav"
            ? "mx-auto max-h-[82dvh] max-w-[820px] rounded-t-2xl"
            : "max-h-[min(86vh,760px)] max-w-3xl rounded-2xl border border-kelly-text/10"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-kelly-text/10 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-kelly-navy">Smart prep search</p>
            <p className="text-[10px] text-kelly-subtle">
              {indexStatus
                ? `${indexStatus.corpusTotal.toLocaleString()} docs · AI multi-query · stage-safe briefs`
                : "Admin intelligence only"}
              {indexStatus?.openai ? " · GPT on" : " · keyword only"}
            </p>
            {smart ? (
              <div className="mt-1 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-950">
                  {smart.intentLabel}
                </span>
                {smart.urgency === "stage_now" ? (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-950">
                    Stage now
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="min-h-10 min-w-10 rounded-lg border px-3 text-sm font-bold"
          >
            Esc
          </button>
        </div>

        <div className="border-b border-kelly-text/8 px-4 py-2">
          <input
            aria-label="Search query"
            className="w-full rounded-lg border border-kelly-text/15 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void runSearch(query, true);
              }
            }}
          />
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {!query.trim() && !searched ? (
            <div className="space-y-3">
              {tonightStack.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Tonight&apos;s stack</p>
                  <p className="mt-0.5 text-[10px] text-kelly-subtle">No search needed — open these first.</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {tonightStack.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setExpanded(false)}
                          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/50 p-2.5 hover:bg-rose-50"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-sm font-bold text-rose-950">{item.title}</p>
                              <StageSafeBadge level={item.stageSafe} />
                            </div>
                            <p className="text-xs text-rose-900/80">{item.why}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {recent.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Recent</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {recent.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => pickSuggestion(s)}
                        className="rounded-full border border-kelly-text/15 bg-kelly-page/50 px-2.5 py-1 text-xs font-semibold text-kelly-text hover:border-indigo-300"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Try these</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => pickSuggestion(s)}
                      className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-950 hover:bg-indigo-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {loading ? (
            <p className="text-sm text-kelly-subtle" role="status">
              Scanning trap lanes, SOS bank, Hammer modules, claims, Field Book…
            </p>
          ) : null}
          {loadingGuide ? (
            <p className="text-xs text-indigo-700" role="status">
              AI rewriting query · fusing trap lanes + SOS + claims · drafting reading order…
            </p>
          ) : null}
          {smart?.openFirstHref && smart.openFirstTitle && !loadingGuide ? (
            <Link
              href={smart.openFirstHref}
              onClick={() => setExpanded(false)}
              className="block rounded-2xl border-2 border-indigo-400 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700">Open first</p>
              <p className="mt-1 text-lg font-bold text-indigo-950">{smart.openFirstTitle}</p>
              <p className="mt-2 text-xs text-indigo-800">Tap to drill down — AI ranked this #1 for your search.</p>
            </Link>
          ) : null}
          {smart?.stageWarning ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              <strong>Stage gate: </strong>
              {smart.stageWarning}
            </div>
          ) : null}
          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-950" role="alert">
              {error}
            </p>
          ) : null}
          {smart?.brief && !loadingGuide ? (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">Prep copilot</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-indigo-950">{smart.brief}</p>
            </div>
          ) : null}
          {smart?.safeLine ? (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3">
              <p className="text-[10px] font-bold uppercase text-emerald-800">Safe line (if verified)</p>
              <p className="mt-1 text-sm font-medium text-emerald-950">{smart.safeLine}</p>
            </div>
          ) : null}
          {smart?.doNotSay ? (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3">
              <p className="text-[10px] font-bold uppercase text-rose-800">Do not say yet</p>
              <p className="mt-1 text-sm font-medium text-rose-950">{smart.doNotSay}</p>
            </div>
          ) : null}
          {smart && smart.readingOrder.length > 1 && !loadingGuide ? (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Reading order</p>
              <ol className="space-y-1.5">
                {smart.readingOrder.map((item, i) => (
                  <li key={`${item.href}-${i}`}>
                    <Link
                      href={item.href}
                      onClick={() => setExpanded(false)}
                      className="flex gap-2 rounded-lg border border-kelly-text/10 bg-white p-2.5 hover:border-indigo-200"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-950">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-bold text-kelly-navy">{item.title}</p>
                          <StageSafeBadge level={item.stageSafe} />
                        </div>
                        <p className="text-xs text-kelly-subtle">{item.why}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {smart && smart.followUps.length > 0 && !loadingGuide ? (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Ask next</p>
              <div className="flex flex-wrap gap-1.5">
                {smart.followUps.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => pickSuggestion(f)}
                    className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-950 hover:bg-violet-100"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {searched && !loading && results.length === 0 && !error ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-dashed border-kelly-text/20 px-4 py-6 text-center">
                <p className="text-sm font-medium text-kelly-text">No matches.</p>
                <p className="mt-2 text-xs text-kelly-subtle">
                  Try a trap lane name, &quot;Hammer 2021&quot;, an SOS topic, or a claim domain.
                </p>
              </div>
              {didYouMean.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Did you mean</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {didYouMean.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => pickSuggestion(s)}
                        className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-950"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {grouped.map((group) => {
            const groupEl = (
              <div key={group.key}>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-kelly-subtle">{group.label}</p>
                <ul className="space-y-1.5">
                  {group.items.map((r) => {
                    const idx = resultIndexByKey.get(`${r.kind}-${r.href}`) ?? 0;
                    const active = idx === activeIdx;
                    return (
                      <li key={`${r.kind}-${r.href}-${r.title.slice(0, 20)}`}>
                        <Link
                          href={r.href}
                          onClick={() => setExpanded(false)}
                          className={`block rounded-xl border p-3 transition ${
                            active
                              ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200"
                              : "border-kelly-text/10 bg-kelly-page/40 hover:border-indigo-200 hover:bg-indigo-50/40"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${KIND_COLORS[r.kind]}`}
                            >
                              {KIND_LABELS[r.kind]}
                            </span>
                          {r.badge ? (
                            <span className="text-[10px] font-semibold text-kelly-subtle">{r.badge}</span>
                          ) : null}
                          {r.stageSafe ? <StageSafeBadge level={r.stageSafe} /> : null}
                          {r.semanticScore && r.semanticScore > 0.25 ? (
                              <span className="text-[9px] text-indigo-600">semantic match</span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm font-bold text-kelly-navy">
                            <HighlightedText text={r.title} query={query} />
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-kelly-subtle">
                            <HighlightedText text={r.snippet} query={query} />
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
            return groupEl;
          })}

          {displayOrder.length > 0 ? (
            <p className="pt-1 text-[10px] text-kelly-subtle">
              ↑↓ navigate · Enter = prep guide · Ctrl+Enter = open highlighted result
            </p>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;

  const showResultsPortal = listenOnOpen && expanded;

  return (
    <>
      {variant === "bottom-nav" || variant === "trigger-only" ? (
        <div className="border-b border-kelly-text/10 bg-white/98">{formShell}</div>
      ) : (
        formShell
      )}
      {typeof document !== "undefined" && showResultsPortal && resultsPanel
        ? createPortal(resultsPanel, document.body)
        : null}
    </>
  );
}
