"use client";

import { useState, useTransition } from "react";
import {
  finalizeReimbursementMonthAction,
  markReimbursementMonthReadyAction,
  reopenReimbursementMonthDraftAction,
} from "@/app/admin/(board)/campaign-events/reimbursement-actions";
import type { ReimbursementMonthStatusContext } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status";
import { REIMBURSEMENT_STATUS_LABELS } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status";

const STATUS_STYLE: Record<string, string> = {
  draft: "border-amber-700/30 bg-amber-50 text-amber-950",
  needs_review: "border-orange-700/30 bg-orange-50 text-orange-950",
  ready: "border-emerald-700/30 bg-emerald-50 text-emerald-950",
  finalized: "border-kelly-navy/30 bg-kelly-navy/10 text-kelly-navy",
};

export function ReimbursementStatusPanel({ ctx }: { ctx: ReimbursementMonthStatusContext }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; blockers?: string[] }>) => {
    startTransition(async () => {
      setMessage(null);
      const res = await fn();
      if (!res.ok && res.blockers?.length) {
        setMessage(res.blockers.join(" · "));
      } else if (res.ok) {
        setMessage("Saved.");
      }
    });
  };

  const finalize = (force: boolean) => {
    if (!force && ctx.blockingFinalize.length > 0) {
      const ok = window.confirm(
        `Finalize anyway?\n\nStill outstanding:\n${ctx.blockingFinalize.join("\n")}`,
      );
      if (!ok) return;
      run(() => finalizeReimbursementMonthAction(ctx.month, true));
      return;
    }
    run(() => finalizeReimbursementMonthAction(ctx.month, force));
  };

  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-body text-xs font-bold uppercase text-kelly-slate">Month reimbursement status</p>
          <p className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded-full border px-3 py-1 text-sm font-bold uppercase ${STATUS_STYLE[ctx.effectiveStatus] ?? STATUS_STYLE.draft}`}
            >
              {REIMBURSEMENT_STATUS_LABELS[ctx.effectiveStatus]}
            </span>
            {ctx.computedStatus !== ctx.effectiveStatus ? (
              <span className="font-body text-xs text-kelly-text/50">
                Computed: {REIMBURSEMENT_STATUS_LABELS[ctx.computedStatus]}
              </span>
            ) : null}
          </p>
          {ctx.stored?.finalizedAt ? (
            <p className="mt-1 font-body text-xs text-kelly-text/55">
              Finalized {ctx.stored.finalizedAt.slice(0, 10)} by {ctx.stored.finalizedBy ?? "operator"}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {ctx.canMarkReady ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => markReimbursementMonthReadyAction(ctx.month))}
              className="rounded-full border border-emerald-700/40 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-950"
            >
              Mark ready
            </button>
          ) : null}
          {ctx.canFinalize ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => finalize(false)}
              className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white"
            >
              Finalize month
            </button>
          ) : null}
          {ctx.canReopen ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => reopenReimbursementMonthDraftAction(ctx.month))}
              className="rounded-full border px-4 py-2 text-xs font-bold"
            >
              Reopen draft
            </button>
          ) : null}
        </div>
      </div>
      {ctx.blockingFinalize.length > 0 && ctx.effectiveStatus !== "finalized" ? (
        <ul className="mt-3 list-inside list-disc font-body text-xs text-amber-900/90">
          {ctx.blockingFinalize.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}
      {message ? <p className="mt-2 font-body text-xs font-semibold text-kelly-navy">{message}</p> : null}
    </section>
  );
}
