"use client";

import { useState, useTransition } from "react";
import type { HumanActionQueueItem, HumanActionStatus } from "@/lib/intelligence/types/humanActionQueue";
import {
  addHumanActionNotesAction,
  archiveHumanActionAction,
  updateHumanActionStatusAction,
} from "./action-actions";

const STATUS_OPTIONS: HumanActionStatus[] = [
  "RECOMMENDED",
  "ACCEPTED",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "DISMISSED",
  "ARCHIVED",
];

type HumanActionQueueControlsProps = {
  action: HumanActionQueueItem;
};

export function HumanActionQueueControls({ action }: HumanActionQueueControlsProps) {
  const [pending, startTransition] = useTransition();
  const [operator, setOperator] = useState("operator");
  const [notes, setNotes] = useState(action.operatorNotes);
  const [message, setMessage] = useState("");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await fn();
      setMessage(result.ok ? "Saved." : result.error ?? "Update failed.");
    });
  }

  return (
    <div className="mt-3 border-t border-kelly-text/10 pt-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
        Recommendation only. Human action required.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          className="rounded border px-2 py-1 text-xs"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          placeholder="Operator id"
          aria-label="Operator id"
        />
        <select
          className="rounded border px-2 py-1 text-xs"
          defaultValue={action.status}
          onChange={(e) =>
            run(() =>
              updateHumanActionStatusAction({
                actionId: action.actionId,
                operator,
                nextStatus: e.target.value as HumanActionStatus,
                notes,
              }),
            )
          }
          disabled={pending}
          aria-label="Action status"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs font-semibold"
          disabled={pending}
          onClick={() =>
            run(() =>
              addHumanActionNotesAction({
                actionId: action.actionId,
                operator,
                notes,
              }),
            )
          }
        >
          Save notes
        </button>
        <button
          type="button"
          className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-900"
          disabled={pending}
          onClick={() =>
            run(() =>
              archiveHumanActionAction({
                actionId: action.actionId,
                operator,
                notes,
              }),
            )
          }
        >
          Archive
        </button>
      </div>
      <textarea
        className="mt-2 w-full rounded border px-2 py-1 text-xs"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Operator notes"
      />
      {message ? <p className="mt-1 text-[10px] text-kelly-muted">{message}</p> : null}
    </div>
  );
}
