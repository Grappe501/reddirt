"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createKimHammerCitationAction,
  linkKimHammerCitationAction,
  updateKimHammerCitationAction,
} from "./citation-actions";
import {
  claimLinksForCitation,
  filterCitationCards,
} from "@/lib/opposition/kimHammerClientFilters";
import type { KimHammerCitationLockerSummary } from "@/lib/opposition/types/kimHammerCitationLocker";
import type {
  KimHammerCitationCard,
  KimHammerCitationLockerFile,
  KimHammerCitationReviewStatus,
  KimHammerSourceHealthStatus,
} from "@/lib/opposition/types/kimHammerCitationLocker";
import { KIM_HAMMER_CITATION_REVIEW_STATUSES } from "@/lib/opposition/types/kimHammerCitationLocker";

type KimHammerCitationLockerBrowserProps = {
  locker: KimHammerCitationLockerFile;
  summary: KimHammerCitationLockerSummary;
  narrativeSignals: Array<{
    narrativeId: string;
    linkedCitationCount: number;
    staleCount: number;
    needsReviewCount: number;
    healthyCount: number;
    signal: string;
  }>;
};

const reviewBadge: Record<KimHammerCitationReviewStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-800",
  NEEDS_REVIEW: "bg-amber-100 text-amber-900",
  VERIFIED: "bg-emerald-100 text-emerald-900",
  STALE: "bg-orange-100 text-orange-900",
  ARCHIVED: "bg-zinc-100 text-zinc-700",
};

const healthBadge: Record<KimHammerSourceHealthStatus, string> = {
  HEALTHY: "bg-emerald-50 text-emerald-800",
  NEEDS_REVALIDATION: "bg-amber-50 text-amber-800",
  STALE: "bg-orange-50 text-orange-800",
  ARCHIVE_MISSING: "bg-rose-50 text-rose-800",
  BROKEN: "bg-red-100 text-red-900",
};

function CitationCardPanel({ card, claimLinks }: { card: KimHammerCitationCard; claimLinks: ReturnType<typeof claimLinksForCitation> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [operator, setOperator] = useState("");
  const [reviewStatus, setReviewStatus] = useState(card.reviewStatus);
  const [operatorNotes, setOperatorNotes] = useState(card.operatorNotes ?? "");
  const [claimId, setClaimId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateKimHammerCitationAction({
        citationId: card.id,
        operator,
        reviewStatus: reviewStatus !== card.reviewStatus ? reviewStatus : undefined,
        operatorNotes,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(`Updated ${card.id}. Audit ${result.auditId}.`);
      router.refresh();
    });
  }

  function handleRevalidate() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateKimHammerCitationAction({
        citationId: card.id,
        operator,
        revalidate: true,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(`Revalidated ${card.id}. Audit ${result.auditId}.`);
      router.refresh();
    });
  }

  function handleLinkClaim(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await linkKimHammerCitationAction({
        citationId: card.id,
        claimId,
        operator,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(`Linked ${card.id} → ${claimId}. Audit ${result.auditId}.`);
      setClaimId("");
      router.refresh();
    });
  }

  return (
    <article className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-kelly-navy">{card.id}</span>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${reviewBadge[card.reviewStatus]}`}>
          {card.reviewStatus.replaceAll("_", " ")}
        </span>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${healthBadge[card.sourceHealth]}`}>
          {card.sourceHealth.replaceAll("_", " ")}
        </span>
        <span className="text-[10px] text-kelly-subtle">{card.sourceClass.replaceAll("_", " ")}</span>
      </div>

      <p className="mt-2 text-kelly-muted">{card.summary}</p>
      <p className="mt-1 break-all text-[10px] text-kelly-subtle">{card.sourceUrl}</p>

      {card.linkedClaimIds.length > 0 ? (
        <p className="mt-2 text-[10px] text-kelly-muted">
          <strong>Claims:</strong> {card.linkedClaimIds.join(", ")}
        </p>
      ) : null}

      {card.originTaskId ? (
        <p className="mt-1 text-[10px] text-kelly-muted">
          <strong>Origin task:</strong> {card.originTaskId}
        </p>
      ) : null}

      {claimLinks.length > 0 ? (
        <ul className="mt-2 list-inside list-disc text-[10px] text-kelly-subtle">
          {claimLinks.map((link) => (
            <li key={`${link.claimId}-${link.polarity}`}>
              {link.claimId} · {link.polarity}
            </li>
          ))}
        </ul>
      ) : null}

      <details className="mt-3">
        <summary className="cursor-pointer font-semibold text-kelly-navy">Operator controls</summary>
        <form onSubmit={handleUpdate} className="mt-2 space-y-2">
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Review status</span>
            <select
              value={reviewStatus}
              onChange={(event) => setReviewStatus(event.target.value as KimHammerCitationReviewStatus)}
              disabled={isPending}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              {KIM_HAMMER_CITATION_REVIEW_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
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
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isPending || !operator.trim()}
              className="rounded bg-kelly-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-50"
            >
              Save citation
            </button>
            <button
              type="button"
              onClick={handleRevalidate}
              disabled={isPending || !operator.trim()}
              className="rounded border border-kelly-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-kelly-navy disabled:opacity-50"
            >
              Mark revalidated
            </button>
          </div>
        </form>

        <form onSubmit={handleLinkClaim} className="mt-3 flex flex-wrap items-end gap-2">
          <label className="block flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Link to claim ID</span>
            <input
              type="text"
              value={claimId}
              onChange={(event) => setClaimId(event.target.value)}
              placeholder="pdeb-001-election-integrity-record"
              disabled={isPending}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <button
            type="submit"
            disabled={isPending || !operator.trim() || !claimId.trim()}
            className="rounded bg-kelly-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-50"
          >
            Link claim
          </button>
        </form>

        {error ? (
          <p className="mt-2 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] text-rose-800">{error}</p>
        ) : null}
        {message ? (
          <p className="mt-2 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-900">
            {message}
          </p>
        ) : null}
      </details>
    </article>
  );
}

export function KimHammerCitationLockerBrowser({
  locker,
  summary,
  narrativeSignals,
}: KimHammerCitationLockerBrowserProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reviewFilter, setReviewFilter] = useState<KimHammerCitationReviewStatus | "ALL">("ALL");
  const [healthFilter, setHealthFilter] = useState<KimHammerSourceHealthStatus | "ALL">("ALL");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [claimQuery, setClaimQuery] = useState("");
  const [createOperator, setCreateOperator] = useState("");
  const [createUrl, setCreateUrl] = useState("");
  const [createSummary, setCreateSummary] = useState("");
  const [createTaskId, setCreateTaskId] = useState("");
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filterCitationCards(locker, {
        reviewStatus: reviewFilter,
        sourceHealth: healthFilter,
        subjectQuery,
        claimQuery,
      }),
    [locker, reviewFilter, healthFilter, subjectQuery, claimQuery],
  );

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreateMessage(null);
    setCreateError(null);

    startTransition(async () => {
      const result = await createKimHammerCitationAction({
        operator: createOperator,
        sourceUrl: createUrl,
        summary: createSummary,
        originTaskId: createTaskId.trim() || undefined,
      });

      if (!result.ok) {
        setCreateError(result.error);
        return;
      }

      setCreateMessage(`Created ${result.citationId}. Audit ${result.auditId}.`);
      setCreateUrl("");
      setCreateSummary("");
      router.refresh();
    });
  }

  return (
    <div>
      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Citation cards</p>
          <p className="mt-1 text-xl font-bold">{summary.totalCitations}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Claim links</p>
          <p className="mt-1 text-xl font-bold">{summary.totalClaimLinks}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Needs attention</p>
          <p className="mt-1 text-xl font-bold">{summary.staleOrBlockedCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Filtered results</p>
          <p className="mt-1 text-xl font-bold">{filtered.length}</p>
        </div>
      </section>

      {narrativeSignals.length > 0 ? (
        <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">
            Narrative source health (preview)
          </h2>
          <ul className="mt-3 space-y-2">
            {narrativeSignals.map((row) => (
              <li key={row.narrativeId} className="rounded border border-kelly-text/10 bg-kelly-page/40 p-2">
                <p className="font-semibold text-kelly-navy">{row.narrativeId}</p>
                <p className="mt-1 text-kelly-muted">{row.signal}</p>
                <p className="mt-1 text-[10px] text-kelly-subtle">
                  {row.linkedCitationCount} linked · {row.healthyCount} healthy · {row.staleCount} stale ·{" "}
                  {row.needsReviewCount} needs review
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Filters</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-4">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Review status</span>
            <select
              value={reviewFilter}
              onChange={(event) => setReviewFilter(event.target.value as KimHammerCitationReviewStatus | "ALL")}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value="ALL">All</option>
              {KIM_HAMMER_CITATION_REVIEW_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Source health</span>
            <select
              value={healthFilter}
              onChange={(event) => setHealthFilter(event.target.value as KimHammerSourceHealthStatus | "ALL")}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value="ALL">All</option>
              <option value="HEALTHY">Healthy</option>
              <option value="NEEDS_REVALIDATION">Needs revalidation</option>
              <option value="STALE">Stale</option>
              <option value="ARCHIVE_MISSING">Archive missing</option>
              <option value="BROKEN">Broken</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Search</span>
            <input
              type="search"
              value={subjectQuery}
              onChange={(event) => setSubjectQuery(event.target.value)}
              placeholder="ID, URL, narrative, task"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Claim ID</span>
            <input
              type="search"
              value={claimQuery}
              onChange={(event) => setClaimQuery(event.target.value)}
              placeholder="pdeb-001…"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Register new citation</h2>
        <p className="mt-1 text-kelly-muted">
          Promote produced retrieval evidence or new sources into durable citation cards. Every save creates backup +
          audit entry.
        </p>
        <form onSubmit={handleCreate} className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Operator</span>
            <input
              type="text"
              value={createOperator}
              onChange={(event) => setCreateOperator(event.target.value)}
              required
              disabled={isPending}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Origin task (optional)</span>
            <input
              type="text"
              value={createTaskId}
              onChange={(event) => setCreateTaskId(event.target.value)}
              disabled={isPending}
              placeholder="kh3b-wayback-campaign-page-capture"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Source URL</span>
            <input
              type="url"
              value={createUrl}
              onChange={(event) => setCreateUrl(event.target.value)}
              required
              disabled={isPending}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Summary</span>
            <textarea
              value={createSummary}
              onChange={(event) => setCreateSummary(event.target.value)}
              required
              disabled={isPending}
              rows={2}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          {createError ? (
            <p className="lg:col-span-2 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] text-rose-800">
              {createError}
            </p>
          ) : null}
          {createMessage ? (
            <p className="lg:col-span-2 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-900">
              {createMessage}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isPending || !createOperator.trim()}
            className="rounded bg-kelly-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-50 lg:col-span-2 lg:w-fit"
          >
            Create citation card
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {filtered.map((card) => (
          <CitationCardPanel
            key={card.id}
            card={card}
            claimLinks={claimLinksForCitation(card.id, locker.claimLinks)}
          />
        ))}
      </section>
    </div>
  );
}
