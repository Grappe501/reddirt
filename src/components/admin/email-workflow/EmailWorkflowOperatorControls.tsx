"use client";

import type { EmailWorkflowStatus } from "@prisma/client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignEmailWorkflowItemToCurrentActorAction,
  clearEmailWorkflowItemAssignmentAction,
  transitionEmailWorkflowItemStatusAction,
} from "@/app/admin/email-workflow-actions";
import {
  EMAIL_WORKFLOW_OPERATOR_TRANSITION_PRESETS,
  EMAIL_WORKFLOW_STATUS_LABELS,
  getEmailWorkflowAllowedManualTransitions,
} from "@/lib/email-workflow/governance";

type Props = {
  itemId: string;
  status: EmailWorkflowStatus;
  isAssigned: boolean;
};

function StatusButton({
  status,
  onClick,
  pending,
}: {
  status: EmailWorkflowStatus;
  onClick: (status: EmailWorkflowStatus) => void;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => onClick(status)}
      className="rounded border border-kelly-text/20 bg-kelly-page px-2 py-1 text-[11px] font-semibold text-kelly-text hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {EMAIL_WORKFLOW_STATUS_LABELS[status]}
    </button>
  );
}

export function EmailWorkflowOperatorControls({ itemId, status, isAssigned }: Props) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const manualTransitions = useMemo(() => getEmailWorkflowAllowedManualTransitions(status), [status]);
  const quickTargets = useMemo(
    () => Object.values(EMAIL_WORKFLOW_OPERATOR_TRANSITION_PRESETS).filter((s) => manualTransitions.includes(s)),
    [manualTransitions]
  );
  const additionalTargets = useMemo(
    () => manualTransitions.filter((s) => !quickTargets.includes(s)),
    [manualTransitions, quickTargets]
  );

  async function runAssign() {
    setErr(null);
    const fd = new FormData();
    fd.set("itemId", itemId);
    const r = await assignEmailWorkflowItemToCurrentActorAction(fd);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    router.refresh();
  }

  async function runUnassign() {
    setErr(null);
    const fd = new FormData();
    fd.set("itemId", itemId);
    const r = await clearEmailWorkflowItemAssignmentAction(fd);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    router.refresh();
  }

  async function runTransition(toStatus: EmailWorkflowStatus) {
    setErr(null);
    const fd = new FormData();
    fd.set("itemId", itemId);
    fd.set("toStatus", toStatus);
    const r = await transitionEmailWorkflowItemStatusAction(fd);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2 rounded border border-kelly-text/10 bg-white/80 p-2">
      {err ? <p className="text-xs text-red-800">{err}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || isAssigned}
          onClick={() => start(runAssign)}
          className="rounded border border-kelly-text/20 bg-kelly-page px-2 py-1 text-[11px] font-semibold text-kelly-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          Assign to me
        </button>
        <button
          type="button"
          disabled={pending || !isAssigned}
          onClick={() => start(runUnassign)}
          className="rounded border border-kelly-text/20 bg-kelly-page px-2 py-1 text-[11px] font-semibold text-kelly-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark unassigned
        </button>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-bold uppercase text-kelly-text/50">Quick queue actions</p>
        <div className="flex flex-wrap gap-1.5">
          {quickTargets.length === 0 ? (
            <p className="text-xs text-kelly-text/55">No quick transitions available from this status.</p>
          ) : (
            quickTargets.map((s) => (
              <StatusButton key={s} status={s} pending={pending} onClick={(next) => start(() => runTransition(next))} />
            ))
          )}
        </div>
      </div>

      {additionalTargets.length > 0 ? (
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase text-kelly-text/50">Additional manual transitions</p>
          <div className="flex flex-wrap gap-1.5">
            {additionalTargets.map((s) => (
              <StatusButton key={s} status={s} pending={pending} onClick={(next) => start(() => runTransition(next))} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
