"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runEmailWorkflowInterpretationAction } from "@/app/admin/email-workflow-actions";

export function RunEmailWorkflowInterpretationButton({ itemId }: { itemId: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      className="rounded border border-deep-soil/15 bg-white p-2"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await runEmailWorkflowInterpretationAction(fd);
          if (!r.ok) {
            setErr(r.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="itemId" value={itemId} />
      <p className="mb-1 font-body text-[10px] text-deep-soil/60">
        Runs deterministic E-2A heuristics (no AI). Fills empty summary fields by default. Optional overwrites
        require checking the boxes. Does not send mail or auto-approve.
      </p>
      {err ? <p className="mb-1 text-xs text-red-800">{err}</p> : null}
      <div className="mb-1 flex flex-wrap gap-3 text-[10px] text-deep-soil/75">
        <label className="inline-flex items-center gap-1">
          <input type="checkbox" name="forceSummaries" className="h-3 w-3" />
          Overwrite non-empty summary fields
        </label>
        <label className="inline-flex items-center gap-1">
          <input type="checkbox" name="forceSignals" className="h-3 w-3" />
          Refresh intent / tone / spam even if already set
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-washed-denim/30 bg-cream-canvas px-2 py-1 text-xs font-semibold text-civic-slate"
      >
        {pending ? "Running…" : "Run interpretation"}
      </button>
    </form>
  );
}
