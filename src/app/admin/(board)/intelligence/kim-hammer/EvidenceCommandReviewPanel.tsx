"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateKimHammerClaimReviewAction } from "./review-actions";
import type { KimHammerReviewStatus } from "@/lib/opposition/types/kimHammerEvidence";

export type KimHammerClaimReviewRow = {
  id: string;
  indexSource: string;
  title: string;
  text: string;
  reviewStatus: string;
  reviewer?: string;
  reviewNotes?: string;
  exportReady: boolean;
  allowedTransitions: KimHammerReviewStatus[];
};

type KimHammerClaimReviewControlsProps = {
  claim: KimHammerClaimReviewRow;
  compact?: boolean;
};

export function KimHammerClaimReviewControls({
  claim,
  compact = false,
}: KimHammerClaimReviewControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextStatus, setNextStatus] = useState<KimHammerReviewStatus>(
    claim.allowedTransitions[0] ?? "NEEDS_REVIEW",
  );
  const [reviewer, setReviewer] = useState(claim.reviewer ?? "");
  const [reviewNotes, setReviewNotes] = useState(claim.reviewNotes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateKimHammerClaimReviewAction({
        claimId: claim.id,
        nextStatus,
        reviewer,
        reviewNotes,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(
        `Review updated: ${result.previousStatus} → ${result.nextStatus}. Export-ready claims: ${result.exportReadyClaims}. Audit ${result.auditId}.`,
      );
      router.refresh();
    });
  }

  const exportPromotion =
    nextStatus === "APPROVED_FOR_EXTERNAL_USE" || nextStatus === "EXPORTED";

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-lg border border-kelly-navy/15 bg-kelly-page/60 ${compact ? "mt-3 p-3" : "p-4"}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-navy">
        Operator review workflow
      </p>
      <p className="mt-1 text-[10px] text-kelly-muted">
        Current: {claim.reviewStatus.replaceAll("_", " ")}
        {claim.exportReady ? " · export-ready" : " · not export-ready"}
      </p>

      <div className={`mt-3 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Next status
          </span>
          <select
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value as KimHammerReviewStatus)}
            disabled={isPending || claim.allowedTransitions.length === 0}
            className="mt-1 w-full rounded border border-kelly-text/20 bg-white px-2 py-2 text-xs"
          >
            {claim.allowedTransitions.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Reviewer / operator
          </span>
          <input
            type="text"
            value={reviewer}
            onChange={(event) => setReviewer(event.target.value)}
            required
            disabled={isPending}
            placeholder="Operator name or role"
            className="mt-1 w-full rounded border border-kelly-text/20 bg-white px-2 py-2 text-xs"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
          Review notes
        </span>
        <textarea
          value={reviewNotes}
          onChange={(event) => setReviewNotes(event.target.value)}
          disabled={isPending}
          rows={compact ? 2 : 3}
          placeholder="Rationale, citation checks, or block reason"
          className="mt-1 w-full rounded border border-kelly-text/20 bg-white px-2 py-2 text-xs"
        />
      </label>

      {exportPromotion && !claim.exportReady ? (
        <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] text-amber-900">
          Export promotion selected. Publication-safety gates still apply — Tier 1 + cited + low legal
          risk required before debate export includes this claim.
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 rounded border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] text-rose-800">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-2 rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[10px] text-emerald-900">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || claim.allowedTransitions.length === 0 || !reviewer.trim()}
        className="mt-3 rounded bg-kelly-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Apply review transition"}
      </button>
    </form>
  );
}

type EvidenceCommandReviewPanelProps = {
  claims: KimHammerClaimReviewRow[];
};

export function EvidenceCommandReviewPanel({ claims }: EvidenceCommandReviewPanelProps) {
  return (
    <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
      <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">
        Live review workflow
      </h2>
      <p className="mt-1 text-kelly-muted">
        Controlled operator transitions for public debate claims and KH-4 claim-graph claims. Every
        save creates a JSON backup and audit-log entry before write-back.
      </p>

      <div className="mt-4 space-y-4">
        {claims.map((claim) => (
          <article key={claim.id} className="rounded-lg border border-kelly-text/10 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-kelly-navy">{claim.title}</h3>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                {claim.indexSource}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                {claim.id}
              </span>
            </div>
            <p className="mt-1 text-kelly-muted">{claim.text}</p>
            <KimHammerClaimReviewControls claim={claim} compact />
          </article>
        ))}
      </div>
    </section>
  );
}
