"use client";

import Link from "next/link";
import { useState } from "react";
import type { ClaimLedgerEntry } from "@/lib/intelligence/claims/claimLedgerTypes";

export function ClaimsReviewWavePanel({
  needsReview,
  compact,
}: {
  needsReview: ClaimLedgerEntry[];
  compact?: boolean;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function review(claimId: string, action: "approve_internal" | "require_evidence") {
    setBusyId(claimId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/intelligence/claim-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          action,
          reviewer: "phase-6-review-wave",
          notes: action === "require_evidence" ? "Phase 6 wave — more evidence required before stage." : "Phase 6 wave — approved for internal rehearsal.",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setMessage(data.error ?? "Review failed");
      } else {
        setMessage(`Updated ${claimId}`);
      }
    } catch {
      setMessage("Network error — retry from claim detail page.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section
      className={`rounded-xl border-2 border-rose-300/70 bg-gradient-to-br from-rose-50/40 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-950">Claims review wave</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">NEEDS_REVIEW queue ({needsReview.length})</h2>
          {!compact ? (
            <p className="mt-2 text-sm text-kelly-muted">
              Phase 6 surfaces the debate-week firewall — approve for internal rehearsal or send back for evidence before
              Kelly rehearses the line on stage.
            </p>
          ) : null}
        </div>
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-rose-400 bg-white px-3 py-1 text-[10px] font-bold text-rose-950"
        >
          Full ledger →
        </Link>
      </div>

      {message ? <p className="mt-3 text-xs font-semibold text-kelly-navy">{message}</p> : null}

      <ul className="mt-4 space-y-3">
        {needsReview.length === 0 ? (
          <li className="text-sm text-kelly-muted">No claims in NEEDS_REVIEW — debate-week firewall clear for review tier.</li>
        ) : (
          needsReview.slice(0, 8).map((claim) => (
            <li key={claim.id} className="rounded-lg border border-amber-200/80 bg-white p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <Link href={`/admin/intelligence/claims/${encodeURIComponent(claim.id)}`} className="font-bold text-kelly-navy underline">
                  {claim.id}
                </Link>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-950">
                  {claim.classification}
                </span>
              </div>
              <p className="mt-2 leading-relaxed text-kelly-text">{claim.claimText.slice(0, 200)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === claim.id}
                  onClick={() => review(claim.id, "approve_internal")}
                  className="rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-950 disabled:opacity-50"
                >
                  Approve internal
                </button>
                <button
                  type="button"
                  disabled={busyId === claim.id}
                  onClick={() => review(claim.id, "require_evidence")}
                  className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-950 disabled:opacity-50"
                >
                  Require evidence
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
