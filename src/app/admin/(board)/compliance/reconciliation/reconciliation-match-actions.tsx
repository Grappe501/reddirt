"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  approveReconciliationMatch,
  forceReconciliationMatch,
  ignoreBankTransactionMatch,
  lockReconciliationMatchAction,
  markTransferMatch,
  recordVarianceMatch,
  splitReconciliationMatch,
  unlockReconciliationMatchAction,
} from "../actions";

export function ReconciliationMatchActions({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const initials = () => window.prompt("Your initials (required):")?.trim();
  const note = () => window.prompt("Note (optional):") ?? undefined;
  const run = (fn: () => Promise<unknown>) => start(async () => {
    await fn();
    router.refresh();
  });
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={pending} className="rounded-full bg-kelly-text px-3 py-2 text-sm font-semibold text-white" onClick={() => { const actor = initials(); if (!actor) return; run(() => approveReconciliationMatch({ matchId, actorInitials: actor, note: note() })); }}>Approve</button>
      <button type="button" disabled={pending} className="rounded-full border px-3 py-2 text-sm font-semibold" onClick={() => { const actor = initials(); if (!actor) return; run(() => forceReconciliationMatch({ matchId, actorInitials: actor, note: note() })); }}>Force match</button>
      <button type="button" disabled={pending} className="rounded-full border px-3 py-2 text-sm font-semibold" onClick={() => { const actor = initials(); if (!actor) return; run(() => splitReconciliationMatch({ matchId, actorInitials: actor, note: note() })); }}>Split</button>
      <button type="button" disabled={pending} className="rounded-full border px-3 py-2 text-sm font-semibold" onClick={() => { const actor = initials(); if (!actor) return; run(() => ignoreBankTransactionMatch({ matchId, actorInitials: actor, note: note() })); }}>Ignore bank txn</button>
      <button type="button" disabled={pending} className="rounded-full border px-3 py-2 text-sm font-semibold" onClick={() => { const actor = initials(); if (!actor) return; run(() => markTransferMatch({ matchId, actorInitials: actor, note: note() })); }}>Mark transfer</button>
      <button type="button" disabled={pending} className="rounded-full border px-3 py-2 text-sm font-semibold" onClick={() => { const actor = initials(); if (!actor) return; const variance = Number(window.prompt("Variance amount (optional):") ?? ""); run(() => recordVarianceMatch({ matchId, actorInitials: actor, note: note(), varianceAmount: Number.isFinite(variance) ? variance : undefined })); }}>Record variance</button>
      <button type="button" disabled={pending} className="rounded-full bg-emerald-800 px-3 py-2 text-sm font-semibold text-white" onClick={() => { const actor = initials(); if (!actor) return; run(() => lockReconciliationMatchAction({ matchId, actorInitials: actor, note: note() })); }}>Lock</button>
      <button type="button" disabled={pending} className="rounded-full border border-red-700/40 px-3 py-2 text-sm font-semibold text-red-900" onClick={() => { const actor = initials(); if (!actor) return; const reason = window.prompt("Unlock reason (required):"); if (!reason?.trim()) return; run(() => unlockReconciliationMatchAction({ matchId, actorInitials: actor, unlockReason: reason })); }}>Unlock</button>
    </div>
  );
}
