"use client";

import { useTransition } from "react";
import type { ReimbursementMonthStatusContext } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status-shared";
import type { ReimbursementMonthOperations, ReimbursementPipelineStatus } from "@/lib/campaign-events/finance/reimbursement-operations-types";
import { REIMBURSEMENT_PIPELINE_LABELS } from "@/lib/campaign-events/finance/reimbursement-operations-types";
import {
  generateReimbursementPacketAction,
  setReimbursementPipelineAction,
} from "@/app/admin/(board)/campaign-events/event-finance-actions";

const PIPELINE: ReimbursementPipelineStatus[] = [
  "draft",
  "pending_review",
  "awaiting_receipts",
  "ready_for_reimbursement",
  "reimbursed",
  "archived",
];

export function ReimbursementOperationsPanel({
  month,
  statusContext,
  operations,
}: {
  month: string;
  statusContext: ReimbursementMonthStatusContext;
  operations: ReimbursementMonthOperations | null;
}) {
  const [pending, startTransition] = useTransition();
  const pipeline = operations?.pipelineStatus ?? "draft";

  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-page p-5 print:hidden">
      <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-slate">Reimbursement operations (Sprint 8)</p>
      <p className="mt-2 font-body text-sm text-kelly-muted">
        Extended pipeline alongside legacy month status ({statusContext.effectiveStatus}). Packet builder groups travel, receipts, and audit notes.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border px-3 py-1 text-xs font-bold">Pipeline: {REIMBURSEMENT_PIPELINE_LABELS[pipeline]}</span>
        <select
          className="rounded-lg border px-2 py-1 text-xs"
          value={pipeline}
          disabled={pending}
          onChange={(e) =>
            startTransition(async () => {
              await setReimbursementPipelineAction(month, e.target.value as ReimbursementPipelineStatus);
            })
          }
        >
          {PIPELINE.map((s) => (
            <option key={s} value={s}>
              {REIMBURSEMENT_PIPELINE_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending}
          className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white"
          onClick={() =>
            startTransition(async () => {
              await generateReimbursementPacketAction(month);
            })
          }
        >
          Build audit packet
        </button>
      </div>
      {operations?.exceptions?.length ? (
        <ul className="mt-3 space-y-1 font-body text-xs text-amber-900">
          {operations.exceptions.slice(0, 5).map((ex) => (
            <li key={ex.code}>⚠ {ex.message}</li>
          ))}
        </ul>
      ) : null}
      {operations?.lastPacket ? (
        <p className="mt-2 font-body text-[11px] text-kelly-muted">
          Last packet: {operations.lastPacket.travelLineCount} travel lines · {operations.lastPacket.receiptCount} receipts ·{" "}
          {new Date(operations.lastPacket.generatedAt).toLocaleString()}
        </p>
      ) : null}
      {operations?.auditHistory?.length ? (
        <details className="mt-2 font-body text-[11px]">
          <summary className="cursor-pointer font-bold text-kelly-navy">Audit history</summary>
          <ul className="mt-1 max-h-32 overflow-y-auto">
            {operations.auditHistory.slice(0, 8).map((a, i) => (
              <li key={i}>
                {a.action} · {a.actor} · {new Date(a.at).toLocaleString()}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
