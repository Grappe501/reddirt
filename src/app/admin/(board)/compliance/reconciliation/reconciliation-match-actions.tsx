"use client";

import { useTransition } from "react";
import {
  approveReconciliationMatchAction,
  forceReconciliationMatchAction,
  ignoreBankTransactionMatchAction,
  lockReconciliationMatchAction,
  recordVarianceMatchAction,
  splitReconciliationMatchAction,
  unlockReconciliationMatchAction,
} from "../actions";

export function ReconciliationMatchActions({ matchId, status }: { matchId: string; status: string }) {
  const [pending, start] = useTransition();

  const initials = () => {
    const value = window.prompt("Treasurer/operator initials (required):");
    return value?.trim().toUpperCase() ?? "";
  };

  const note = () => window.prompt("Note (optional):") ?? undefined;

  const run = (action: (input: { matchId: string; actorInitials: string; note?: string; unlockReason?: string }) => Promise<void>) => {
    const actorInitials = initials();
    if (!actorInitials) return;
    start(() => action({ matchId, actorInitials, note: note() }));
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <button type="button" disabled={pending} className="rounded-full bg-[#0f2744] px-4 py-2 text-sm font-bold text-white" onClick={() => run(approveReconciliationMatchAction)}>
        Approve match
      </button>
      <button type="button" disabled={pending} className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-bold text-white" onClick={() => run(lockReconciliationMatchAction)}>
        Lock match
      </button>
      <button
        type="button"
        disabled={pending}
        className="rounded-full border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-900"
        onClick={() => {
          const actorInitials = initials();
          if (!actorInitials) return;
          const unlockReason = window.prompt("Unlock reason (required):") ?? "";
          if (!unlockReason.trim()) return;
          start(() => unlockReconciliationMatchAction({ matchId, actorInitials, unlockReason }));
        }}
      >
        Unlock (reason required)
      </button>
      <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-sm font-semibold" onClick={() => run(recordVarianceMatchAction)}>
        Record variance note
      </button>
      <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-sm font-semibold" onClick={() => run(ignoreBankTransactionMatchAction)}>
        Ignore transaction
      </button>
      <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-sm font-semibold" onClick={() => run(splitReconciliationMatchAction)}>
        Split match
      </button>
      <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-sm font-semibold" onClick={() => run(forceReconciliationMatchAction)}>
        Force match
      </button>
      <p className="sm:col-span-2 text-xs text-slate-600">Current status: {status}. Locked matches block filing until treasurer confirms unlock.</p>
    </div>
  );
}
