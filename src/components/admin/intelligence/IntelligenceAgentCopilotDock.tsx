"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CANDIDATE_AI_PREP_V4_QUICK_TOOLS,
  listAiPrepQuickToolsForProfile,
  SEARCH_AI_PREP_HUB_HREF,
} from "@/lib/intelligence/intelligenceAiPrepV4Client";
import { openIntelPrepSearch } from "@/lib/intelligence/intelligencePrepSearchOpen";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import { resolveIntelligenceNavProfileClient } from "@/lib/intelligence/v4/roleBasedNavProfile";

type CopilotSection = { heading: string; bullets: string[] };

type CopilotOutput = {
  title: string;
  sections: CopilotSection[];
  riskWarnings: string[];
  operatorNextAction: string;
  evidenceDependencies: string[];
};

type DockTab = "tools" | "search" | "brief";

type SearchHit = {
  title: string;
  href: string;
  snippet: string;
  kind: string;
};

export function IntelligenceAgentCopilotDock({ embedded }: { embedded?: boolean }) {
  const [tab, setTab] = useState<DockTab>("tools");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<CopilotOutput | null>(null);
  const [topic, setTopic] = useState("check my record / direct democracy");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [briefLoading, setBriefLoading] = useState(false);
  const [governedBrief, setGovernedBrief] = useState<string | null>(null);

  const profile = resolveIntelligenceNavProfileClient(isCountyClerkPrimaryAudience());
  const quickTools = listAiPrepQuickToolsForProfile(profile);

  async function runTool(toolId: string) {
    setBusy(toolId);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/admin/intelligence/copilot-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId,
          topic,
          generatedForRoute: "/admin/intelligence/kelly-debate-coaching",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        output?: CopilotOutput;
      };
      if (!res.ok || !data.ok || !data.output) {
        setError(data.error ?? "Tool run failed");
      } else {
        setOutput(data.output);
        setTab("tools");
      }
    } catch {
      setError("Network error — check connection on iPad");
    } finally {
      setBusy(null);
    }
  }

  const runInlineSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/intelligence/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, includeBrief: false, mode: "smart", profile }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        results?: SearchHit[];
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Search failed");
        setSearchHits([]);
        return;
      }
      setSearchHits(
        (data.results ?? []).slice(0, 8).map((r) => ({
          title: r.title,
          href: r.href,
          snippet: r.snippet,
          kind: r.kind,
        })),
      );
    } catch {
      setError("Search network error");
      setSearchHits([]);
    } finally {
      setSearchLoading(false);
    }
  }, [profile]);

  async function runGovernedBrief() {
    setBriefLoading(true);
    setError(null);
    setGovernedBrief(null);
    try {
      const res = await fetch("/api/admin/intelligence/governed-llm-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefId: "debate-prep-v1",
          operatorTriggered: true,
          attemptLiveLlm: true,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        draftText?: string;
        draft?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.message ?? data.error ?? "Brief draft failed");
        return;
      }
      setGovernedBrief(
        data.draftText ?? data.draft ?? "Draft queued — check LLM review queue if OPENAI is configured.",
      );
      setTab("brief");
    } catch {
      setError("Brief network error");
    } finally {
      setBriefLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "search" && searchQuery.trim().length > 2) {
      const t = window.setTimeout(() => void runInlineSearch(searchQuery), 400);
      return () => window.clearTimeout(t);
    }
  }, [searchQuery, tab, runInlineSearch]);

  return (
    <section
      className={embedded ? "text-xs" : "mb-6 rounded-xl border-2 border-violet-300 bg-violet-50/30 p-4 text-xs"}
      data-ai-prep-v4="true"
    >
      {!embedded ? (
        <header className="mb-3">
          <p className="text-[10px] font-bold uppercase text-violet-950">AI prep v4 · search-integrated</p>
          <h2 className="font-heading text-lg font-bold text-kelly-navy">Prep assistant (internal draft only)</h2>
          <p className="mt-1 text-kelly-muted">
            {CANDIDATE_AI_PREP_V4_QUICK_TOOLS.length} quick tools · inline search · governed brief — never auto-publishes.
          </p>
        </header>
      ) : (
        <p className="mb-2 text-[10px] font-bold uppercase text-violet-950">AI prep v4</p>
      )}

      <div className="mb-3 flex gap-1 rounded-xl border border-violet-200 bg-white p-1">
        {(["tools", "search", "brief"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-10 flex-1 rounded-lg px-2 text-[10px] font-bold uppercase ${
              tab === id ? "bg-violet-700 text-white" : "text-violet-900"
            }`}
          >
            {id === "tools" ? "Tools" : id === "search" ? "Search" : "Brief"}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="font-bold text-kelly-navy">Tonight&apos;s topic focus</span>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1 min-h-12 w-full rounded-xl border border-kelly-text/20 px-3 text-base"
          placeholder="e.g. petition acts, check my record, trap lane pivot"
        />
      </label>

      {tab === "tools" ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {quickTools.map((tool) => (
            <button
              key={tool.toolId}
              type="button"
              disabled={busy !== null}
              onClick={() => runTool(tool.toolId)}
              className="min-h-[52px] rounded-xl border-2 border-violet-200 bg-white px-3 py-2 text-left active:border-violet-600 disabled:opacity-50"
            >
              <span className="block font-bold text-kelly-navy">{tool.label}</span>
              <span className="mt-0.5 block text-[10px] text-kelly-muted">{tool.description}</span>
              {busy === tool.toolId ? <span className="text-[10px] text-violet-900">Running…</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      {tab === "search" ? (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-11 flex-1 rounded-xl border border-indigo-200 px-3 text-sm"
              placeholder="Search trap lanes, Hammer, claims…"
            />
            <button
              type="button"
              onClick={() => openIntelPrepSearch()}
              className="min-h-11 shrink-0 rounded-xl border border-indigo-300 bg-indigo-50 px-3 text-[10px] font-bold text-indigo-950"
            >
              Full search
            </button>
          </div>
          {searchLoading ? <p className="text-[10px] text-kelly-subtle">Searching…</p> : null}
          <ul className="space-y-1.5">
            {searchHits.map((hit) => (
              <li key={`${hit.href}-${hit.title}`}>
                <Link href={hit.href} className="block rounded-lg border border-indigo-100 bg-white p-2.5">
                  <p className="font-bold text-kelly-navy">{hit.title}</p>
                  <p className="text-[10px] text-kelly-subtle">{hit.snippet.slice(0, 100)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "brief" ? (
        <div className="mt-4 space-y-3">
          <button
            type="button"
            disabled={briefLoading}
            onClick={() => void runGovernedBrief()}
            className="min-h-12 w-full rounded-xl bg-violet-700 px-4 text-sm font-bold text-white disabled:opacity-50"
          >
            {briefLoading ? "Drafting governed brief…" : "Generate governed LLM brief"}
          </button>
          <p className="text-[10px] text-amber-900 font-bold uppercase">NON_PUBLISHABLE · HUMAN_REVIEW · LLM queue</p>
          {governedBrief ? (
            <article className="rounded-xl border border-kelly-navy/15 bg-white p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-kelly-text">{governedBrief}</p>
            </article>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="mt-3 font-bold text-rose-900">{error}</p> : null}

      {output && tab === "tools" ? (
        <article className="mt-4 rounded-xl border border-kelly-navy/15 bg-white p-4">
          <p className="font-bold text-kelly-navy">{output.title}</p>
          <p className="mt-1 text-[10px] font-bold uppercase text-amber-900">NON_PUBLISHABLE · HUMAN_REVIEW</p>
          {output.sections.map((sec) => (
            <div key={sec.heading} className="mt-3">
              <p className="font-bold text-violet-950">{sec.heading}</p>
              <ul className="mt-1 list-inside list-disc text-kelly-muted">
                {sec.bullets.map((b) => (
                  <li key={b.slice(0, 48)}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
          {output.riskWarnings.length > 0 ? (
            <ul className="mt-3 list-inside list-disc text-rose-950">
              {output.riskWarnings.map((w) => (
                <li key={w.slice(0, 40)}>{w}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 text-[10px] text-kelly-subtle">{output.operatorNextAction}</p>
        </article>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={SEARCH_AI_PREP_HUB_HREF} className="inline-flex min-h-11 items-center font-bold text-kelly-navy underline">
          Search & AI prep hub →
        </Link>
        <Link
          href="/admin/intelligence/agent-tooling"
          className="inline-flex min-h-11 items-center font-bold text-kelly-navy underline"
        >
          Full agent tooling →
        </Link>
      </div>
    </section>
  );
}
