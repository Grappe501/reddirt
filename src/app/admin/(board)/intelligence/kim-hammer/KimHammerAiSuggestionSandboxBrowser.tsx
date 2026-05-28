"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { updateKimHammerSuggestionDispositionAction } from "./suggestion-actions";
import {
  filterKimHammerSuggestions,
} from "@/lib/opposition/kimHammerClientFilters";
import type { KimHammerSuggestionDoctrineContextMap } from "@/lib/opposition/kimHammerClientFilters";
import type { CampaignAiSuggestionDoctrineContext } from "@/lib/intelligence/types/campaignStrategicAlignment";
import type { KimHammerSuggestionSandboxSummary } from "@/lib/opposition/types/kimHammerAiSuggestion";
import {
  getAllowedKimHammerSuggestionTransitions,
  KIM_HAMMER_SUGGESTION_STATUSES,
  KIM_HAMMER_SUGGESTION_TYPES,
} from "@/lib/opposition/types/kimHammerAiSuggestion";
import type {
  KimHammerAiSuggestion,
  KimHammerAiSuggestionSandboxFile,
  KimHammerSuggestionStatus,
  KimHammerSuggestionType,
} from "@/lib/opposition/types/kimHammerAiSuggestion";

type KimHammerAiSuggestionSandboxBrowserProps = {
  sandbox: KimHammerAiSuggestionSandboxFile;
  summary: KimHammerSuggestionSandboxSummary;
  liveCandidateCount: number;
  doctrineContexts: KimHammerSuggestionDoctrineContextMap;
};

const typeBadge: Record<KimHammerSuggestionType, string> = {
  RETRIEVAL_PRIORITY: "bg-sky-100 text-sky-900",
  CITATION_PROMOTION: "bg-violet-100 text-violet-900",
  CITATION_REVALIDATION: "bg-indigo-100 text-indigo-900",
  CONTRADICTION_FLAG: "bg-rose-100 text-rose-900",
  NARRATIVE_WEAKNESS: "bg-amber-100 text-amber-900",
  REVIEW_ROUTING: "bg-emerald-100 text-emerald-900",
  DEBATE_PREP: "bg-teal-100 text-teal-900",
};

const statusBadge: Record<KimHammerSuggestionStatus, string> = {
  PENDING: "bg-slate-100 text-slate-800",
  ACCEPTED: "bg-emerald-100 text-emerald-900",
  DISMISSED: "bg-zinc-100 text-zinc-700",
  DEFERRED: "bg-amber-50 text-amber-900",
};

function SuggestionCard({
  suggestion,
  doctrineContext,
}: {
  suggestion: KimHammerAiSuggestion;
  doctrineContext: CampaignAiSuggestionDoctrineContext;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [operator, setOperator] = useState("");
  const [nextStatus, setNextStatus] = useState<KimHammerSuggestionStatus>(
    getAllowedKimHammerSuggestionTransitions(suggestion.status)[0] ?? suggestion.status,
  );
  const [operatorNotes, setOperatorNotes] = useState(suggestion.operatorNotes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allowed = getAllowedKimHammerSuggestionTransitions(suggestion.status);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateKimHammerSuggestionDispositionAction({
        suggestionId: suggestion.id,
        operator,
        nextStatus,
        operatorNotes,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(
        `Disposition saved: ${result.previousStatus} → ${result.nextStatus}. Audit ${result.auditId}. Pending: ${result.pendingCount}.`,
      );
      router.refresh();
    });
  }

  return (
    <article className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${typeBadge[suggestion.suggestionType]}`}>
          {suggestion.suggestionType.replaceAll("_", " ")}
        </span>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${statusBadge[suggestion.status]}`}>
          {suggestion.status}
        </span>
        <span className="text-[10px] text-kelly-subtle">confidence {(suggestion.confidence * 100).toFixed(0)}%</span>
        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">Non-publishable</span>
      </div>

      <h3 className="mt-2 font-semibold text-kelly-navy">{suggestion.title}</h3>
      <p className="mt-1 text-kelly-muted">{suggestion.body}</p>

      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-kelly-subtle">
        {suggestion.relatedClaimIds?.map((id) => (
          <span key={id} className="rounded bg-kelly-page px-1.5 py-0.5">
            claim: {id}
          </span>
        ))}
        {suggestion.relatedCitationIds?.map((id) => (
          <span key={id} className="rounded bg-kelly-page px-1.5 py-0.5">
            citation: {id}
          </span>
        ))}
        {suggestion.relatedTaskIds?.map((id) => (
          <span key={id} className="rounded bg-kelly-page px-1.5 py-0.5">
            task: {id}
          </span>
        ))}
        {suggestion.relatedNarrativeIds?.map((id) => (
          <span key={id} className="rounded bg-kelly-page px-1.5 py-0.5">
            narrative: {id}
          </span>
        ))}
      </div>

      {doctrineContext.warnings.length > 0 ? (
        <div className="mt-2 rounded border border-purple-200/60 bg-purple-50/80 p-2 text-[10px] text-purple-950">
          <p className="font-bold uppercase tracking-wider">Doctrine alignment (non-authoritative)</p>
          <ul className="mt-1 list-inside list-disc">
            {doctrineContext.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {suggestion.suggestedRouteHref ? (
        <p className="mt-2">
          <Link href={suggestion.suggestedRouteHref} className="font-semibold text-kelly-navy underline">
            Route to {suggestion.suggestedRoute?.replaceAll("_", " ") ?? "target"}
          </Link>
        </p>
      ) : null}

      <details className="mt-3">
        <summary className="cursor-pointer font-semibold text-kelly-navy">Operator disposition</summary>
        <form onSubmit={handleSubmit} className="mt-2 space-y-2">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Operator</span>
            <input
              type="text"
              value={operator}
              onChange={(event) => setOperator(event.target.value)}
              required
              disabled={isPending}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Disposition</span>
            <select
              value={nextStatus}
              onChange={(event) => setNextStatus(event.target.value as KimHammerSuggestionStatus)}
              disabled={isPending || allowed.length === 0}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value={suggestion.status}>{suggestion.status} (current)</option>
              {allowed.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Notes</span>
            <textarea
              value={operatorNotes}
              onChange={(event) => setOperatorNotes(event.target.value)}
              disabled={isPending}
              rows={2}
              placeholder="Why accepted, dismissed, or deferred — no external publish authority"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          {error ? (
            <p className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] text-rose-800">{error}</p>
          ) : null}
          {message ? (
            <p className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-900">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isPending || !operator.trim() || allowed.length === 0}
            className="rounded bg-kelly-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-50"
          >
            Save disposition
          </button>
        </form>
      </details>
    </article>
  );
}

export function KimHammerAiSuggestionSandboxBrowser({
  sandbox,
  summary,
  liveCandidateCount,
  doctrineContexts,
}: KimHammerAiSuggestionSandboxBrowserProps) {
  const [statusFilter, setStatusFilter] = useState<KimHammerSuggestionStatus | "ALL">("PENDING");
  const [typeFilter, setTypeFilter] = useState<KimHammerSuggestionType | "ALL">("ALL");
  const [subjectQuery, setSubjectQuery] = useState("");

  const filtered = useMemo(
    () =>
      filterKimHammerSuggestions(sandbox, {
        status: statusFilter,
        suggestionType: typeFilter,
        subjectQuery,
      }),
    [sandbox, statusFilter, typeFilter, subjectQuery],
  );

  return (
    <div>
      <section className="mb-4 rounded-xl border border-amber-300/40 bg-amber-50 p-4 text-xs text-amber-950">
        <p className="font-bold uppercase tracking-wider">{sandbox.nonPublishableLabel}</p>
        <p className="mt-1">
          AI suggestions are analyst outputs only. Accepting a suggestion does not mutate claims, citations, tasks, or
          exports — operators execute routed work manually in governed systems.
        </p>
      </section>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Sandbox suggestions</p>
          <p className="mt-1 text-xl font-bold">{summary.totalSuggestions}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Pending disposition</p>
          <p className="mt-1 text-xl font-bold">{summary.pendingCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Accepted</p>
          <p className="mt-1 text-xl font-bold">{summary.acceptedCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Live corpus candidates</p>
          <p className="mt-1 text-xl font-bold">{liveCandidateCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Filtered results</p>
          <p className="mt-1 text-xl font-bold">{filtered.length}</p>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Filters</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as KimHammerSuggestionStatus | "ALL")}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value="ALL">All</option>
              {KIM_HAMMER_SUGGESTION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Type</span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as KimHammerSuggestionType | "ALL")}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value="ALL">All</option>
              {KIM_HAMMER_SUGGESTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Search</span>
            <input
              type="search"
              value={subjectQuery}
              onChange={(event) => setSubjectQuery(event.target.value)}
              placeholder="claim, citation, task, narrative"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-xl border border-kelly-text/10 bg-white p-6 text-xs text-kelly-muted">
          No suggestions match the current filters.
        </section>
      ) : (
        <section className="space-y-3">
          {filtered.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              doctrineContext={
                doctrineContexts[suggestion.id] ?? {
                  suggestionId: suggestion.id,
                  doctrineSignal: "NONE",
                  warnings: [],
                  matchedDoctrineIds: [],
                  nonAuthoritative: true,
                }
              }
            />
          ))}
        </section>
      )}
    </div>
  );
}
