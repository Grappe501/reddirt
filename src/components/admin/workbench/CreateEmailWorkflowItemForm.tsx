"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEmailWorkflowItemManualAction } from "@/app/admin/email-workflow-actions";

const label = "text-[10px] font-bold uppercase text-kelly-text/45";
const field = "border border-kelly-text/15 bg-white px-1.5 py-0.5 font-body text-sm";

export function CreateEmailWorkflowItemForm() {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      className="grid max-w-2xl gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const r = await createEmailWorkflowItemManualAction(fd);
          if (!r.ok) {
            setErr(r.error);
            return;
          }
          form.reset();
          router.push(`/admin/workbench/email-queue/${r.id}`);
        });
      }}
    >
      {err ? <p className="text-xs text-red-800">{err}</p> : null}
      <p className="font-body text-xs text-kelly-text/60">
        New items require review; nothing is auto-approved or auto-sent (E-1).
      </p>
      <label className={label}>Title</label>
      <input
        name="title"
        required
        maxLength={500}
        className={field}
        placeholder="Short label for the queue"
        autoComplete="off"
      />
      <label className={label}>Queue reason (optional)</label>
      <input name="queueReason" maxLength={2000} className={field} placeholder="Why this is in the queue" />
      <label className={label}>Who</label>
      <textarea name="whoSummary" rows={2} className={field} placeholder="Involved people / orgs" />
      <label className={label}>What</label>
      <textarea name="whatSummary" rows={2} className={field} placeholder="What happened" />
      <label className={label}>When (optional)</label>
      <input name="whenSummary" className={field} placeholder="e.g. received Tuesday 9am" />
      <label className={label}>Where (optional)</label>
      <input name="whereSummary" className={field} placeholder="Inbox, thread, system" />
      <label className={label}>Why it matters (optional)</label>
      <textarea name="whySummary" rows={2} className={field} />
      <label className={label}>Campaign impact (optional)</label>
      <textarea name="impactSummary" rows={2} className={field} />
      <label className={label}>Recommended response (optional)</label>
      <textarea name="recommendedResponseSummary" rows={2} className={field} />
      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-fit rounded border border-kelly-text/25 bg-kelly-page px-2 py-1 text-xs font-semibold text-kelly-text"
      >
        {pending ? "Saving…" : "Create queue item"}
      </button>
    </form>
  );
}
