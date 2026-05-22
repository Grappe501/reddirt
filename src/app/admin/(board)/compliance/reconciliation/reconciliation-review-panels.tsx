"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  createReconciliationDraftAction,
  resolveAmbiguousReconciliationAction,
} from "../actions";
import type { AmbiguousBankGroup, UnmatchedBankReviewRow } from "@/lib/compliance/reconciliation/build-reconciliation-review-board";
import type { ReconciliationMatchCandidate } from "@/lib/compliance/imports/bank-reconciliation-rehearsal";

function initials(): string {
  return window.prompt("Treasurer/operator initials (required):")?.trim().toUpperCase() ?? "";
}

function optionalNote(): string | undefined {
  const n = window.prompt("Note (optional):");
  return n?.trim() || undefined;
}

export function HighConfidenceReviewPanel({
  rows,
  savedMatchIds,
}: {
  rows: ReconciliationMatchCandidate[];
  savedMatchIds: string[];
}) {
  const [pending, start] = useTransition();
  const saved = new Set(savedMatchIds);

  if (!rows.length) {
    return <p className="text-sm text-slate-600">No high-confidence rehearsal matches right now.</p>;
  }

  return (
    <ul className="mt-3 space-y-3">
      {rows.map((row) => {
        const matchId = `recon-rehearsal-row-${row.bankRowNumber}-${row.payoutKey.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)}`;
        const drafted = saved.has(matchId) || savedMatchIds.some((id) => id.includes(`row-${row.bankRowNumber}`));
        return (
          <li key={`${row.bankRowNumber}-${row.payoutKey}`} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm">
            <p className="font-semibold text-[#0f2744]">
              ${row.bankAmount.toFixed(2)} · {row.bankDate} · row {row.bankRowNumber}
            </p>
            <p className="mt-1 text-slate-700">{row.bankMemo.slice(0, 120)}</p>
            <p className="mt-1 text-xs text-slate-600">Payout {row.payoutKey} · ledger ${row.ledgerAmount.toFixed(2)}</p>
            <p className="mt-1 text-xs text-emerald-900">{row.confidenceReason}</p>
            {drafted ? (
              <Link href={`/admin/compliance/reconciliation/${matchId}`} className="mt-2 inline-block font-bold text-[#0f2744] underline">
                Open saved draft → approve / lock
              </Link>
            ) : (
              <button
                type="button"
                disabled={pending}
                className="mt-3 rounded-full bg-[#0f2744] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                onClick={() => {
                  const actorInitials = initials();
                  if (!actorInitials) return;
                  start(() =>
                    createReconciliationDraftAction({
                      bankRowNumber: row.bankRowNumber,
                      payoutKey: row.payoutKey,
                      bankAmount: row.bankAmount,
                      ledgerAmount: row.ledgerAmount,
                      actorInitials,
                      note: optionalNote(),
                      resolutionKind: "high_confidence",
                    }),
                  );
                }}
              >
                Create draft for treasurer review (does not auto-approve)
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function AmbiguousReviewPanel({
  groups,
  savedMatchIds,
}: {
  groups: AmbiguousBankGroup[];
  savedMatchIds: string[];
}) {
  const [pending, start] = useTransition();
  const saved = new Set(savedMatchIds);

  if (!groups.length) {
    return <p className="text-sm text-slate-600">No ambiguous bank credits.</p>;
  }

  return (
    <ul className="mt-3 space-y-4">
      {groups.map((group) => {
        const drafted = saved.has(group.suggestedMatchId) || savedMatchIds.some((id) => id.includes(`row-${group.bankRowNumber}`));
        return (
          <li key={group.bankRowNumber} className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
            <p className="font-semibold text-[#0f2744]">
              Ambiguous · ${group.bankAmount.toFixed(2)} · {group.bankDate} · row {group.bankRowNumber}
            </p>
            <p className="mt-1 text-slate-700">{group.bankMemo.slice(0, 120)}</p>
            <p className="mt-2 text-xs font-bold uppercase text-amber-900">{group.candidates.length} payout batch(es) share this amount — pick one:</p>
            <ul className="mt-2 space-y-2">
              {group.candidates.map((c) => (
                <li key={c.payoutKey} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white p-2">
                  <span>
                    {c.payoutKey} · ${c.ledgerAmount.toFixed(2)}
                  </span>
                  {!drafted ? (
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded-full border border-[#0f2744] px-3 py-1 text-xs font-bold text-[#0f2744] disabled:opacity-50"
                      onClick={() => {
                        const actorInitials = initials();
                        if (!actorInitials) return;
                        const note = optionalNote();
                        if (
                          !window.confirm(
                            `Confirm payout ${c.payoutKey} for $${group.bankAmount.toFixed(2)}? This creates a draft only — you must still approve and lock.`,
                          )
                        ) {
                          return;
                        }
                        start(() =>
                          resolveAmbiguousReconciliationAction({
                            bankRowNumber: group.bankRowNumber,
                            payoutKey: c.payoutKey,
                            bankAmount: group.bankAmount,
                            ledgerAmount: c.ledgerAmount,
                            actorInitials,
                            note,
                          }),
                        );
                      }}
                    >
                      Pick this payout
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            {drafted ? (
              <p className="mt-2 text-xs font-semibold text-emerald-900">Draft exists — open Reconciliation saved matches below.</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function UnmatchedBankReviewPanel({
  rows,
  savedMatchIds,
}: {
  rows: UnmatchedBankReviewRow[];
  savedMatchIds: string[];
}) {
  const [pending, start] = useTransition();
  const saved = new Set(savedMatchIds);

  if (!rows.length) {
    return <p className="text-sm text-slate-600">No unmatched bank credits.</p>;
  }

  return (
    <ul className="mt-3 space-y-3">
      {rows.map((row) => {
        const drafted = saved.has(row.suggestedMatchId) || savedMatchIds.some((id) => id.includes(`row-${row.rowNumber}`));
        return (
          <li key={row.rowNumber} className="rounded-xl border border-red-200 bg-red-50/40 p-4 text-sm">
            <p className="font-semibold text-[#0f2744]">
              Unmatched · ${row.amount.toFixed(2)} · {row.date} · row {row.rowNumber}
            </p>
            <p className="mt-1 text-slate-700">{row.memo.slice(0, 120)}</p>
            <p className="mt-1 text-xs text-slate-600">No GoodChange payout batch matched this credit amount.</p>
            {drafted ? (
              <p className="mt-2 text-xs font-semibold text-emerald-900">Investigation draft created.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  className="rounded-full bg-[#0f2744] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                  onClick={() => {
                    const actorInitials = initials();
                    if (!actorInitials) return;
                    start(() =>
                      createReconciliationDraftAction({
                        bankRowNumber: row.rowNumber,
                        bankAmount: row.amount,
                        actorInitials,
                        note: optionalNote(),
                        resolutionKind: "unmatched_investigate",
                      }),
                    );
                  }}
                >
                  Create investigation draft
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
