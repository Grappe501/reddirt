"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateKimHammerRetrievalTaskAction } from "./task-actions";
import type {
  KimHammerRetrievalTaskStatus,
  KimHammerTaskPriority,
} from "@/lib/opposition/types/kimHammerEvidence";

export type KimHammerRetrievalTaskRow = {
  id: string;
  rank: number | null;
  title: string;
  taskStatus: KimHammerRetrievalTaskStatus;
  owner: string;
  priority: KimHammerTaskPriority;
  dueDate: string | null;
  completionNotes: string;
  reviewRequired: boolean;
  externalReadiness: string;
  allowedTransitions: KimHammerRetrievalTaskStatus[];
};

type KimHammerRetrievalTaskControlsProps = {
  task: KimHammerRetrievalTaskRow;
  compact?: boolean;
};

export function KimHammerRetrievalTaskControls({
  task,
  compact = false,
}: KimHammerRetrievalTaskControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextStatus, setNextStatus] = useState<KimHammerRetrievalTaskStatus>(
    task.allowedTransitions[0] ?? task.taskStatus,
  );
  const [operator, setOperator] = useState("");
  const [owner, setOwner] = useState(task.owner);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [completionNotes, setCompletionNotes] = useState(task.completionNotes);
  const [producedEvidenceLink, setProducedEvidenceLink] = useState("");
  const [reviewRequired, setReviewRequired] = useState(task.reviewRequired);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateKimHammerRetrievalTaskAction({
        taskId: task.id,
        operator,
        nextStatus: nextStatus !== task.taskStatus ? nextStatus : undefined,
        owner,
        priority,
        dueDate: dueDate.trim() ? dueDate : null,
        completionNotes,
        reviewRequired,
        producedEvidenceLink: producedEvidenceLink.trim() || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(
        `Task updated: ${result.previousStatus} → ${result.nextStatus}. Audit ${result.auditId}. Open tasks: ${result.retrievalTaskCount}.`,
      );
      router.refresh();
    });
  }

  const isOverdue =
    task.dueDate && task.taskStatus !== "COMPLETE" && task.taskStatus !== "ARCHIVED"
      ? task.dueDate < new Date().toISOString().slice(0, 10)
      : false;

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-lg border border-kelly-navy/15 bg-kelly-page/60 ${compact ? "mt-3 p-3" : "p-4"}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-navy">
        Task execution workflow
      </p>
      <p className="mt-1 text-[10px] text-kelly-muted">
        Current: {task.taskStatus.replaceAll("_", " ")} · {task.externalReadiness}
        {isOverdue ? " · overdue" : ""}
      </p>

      <div className={`mt-3 grid gap-3 ${compact ? "sm:grid-cols-2" : "lg:grid-cols-3"}`}>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Next status
          </span>
          <select
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value as KimHammerRetrievalTaskStatus)}
            disabled={isPending}
            className="mt-1 w-full rounded border border-kelly-text/20 bg-white px-2 py-2 text-xs"
          >
            <option value={task.taskStatus}>{task.taskStatus.replaceAll("_", " ")} (unchanged)</option>
            {task.allowedTransitions.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Operator
          </span>
          <input
            type="text"
            value={operator}
            onChange={(event) => setOperator(event.target.value)}
            required
            disabled={isPending}
            placeholder="Your name or role"
            className="mt-1 w-full rounded border border-kelly-text/20 bg-white px-2 py-2 text-xs"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Owner
          </span>
          <input
            type="text"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            disabled={isPending}
            className="mt-1 w-full rounded border border-kelly-text/20 bg-white px-2 py-2 text-xs"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Priority
          </span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as KimHammerTaskPriority)}
            disabled={isPending}
            className="mt-1 w-full rounded border border-kelly-text/20 bg-white px-2 py-2 text-xs"
          >
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Due date
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={isPending}
            className="mt-1 w-full rounded border border-kelly-text/20 bg-white px-2 py-2 text-xs"
          />
        </label>

        <label className="flex items-end gap-2 pb-2">
          <input
            type="checkbox"
            checked={reviewRequired}
            onChange={(event) => setReviewRequired(event.target.checked)}
            disabled={isPending}
            className="h-4 w-4"
          />
          <span className="text-[10px] text-kelly-muted">Review required before claim use</span>
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
          Completion notes
        </span>
        <textarea
          value={completionNotes}
          onChange={(event) => setCompletionNotes(event.target.value)}
          disabled={isPending}
          rows={compact ? 2 : 3}
          placeholder="Progress, blockers, or handoff notes"
          className="mt-1 w-full rounded border border-kelly-text/20 bg-white px-2 py-2 text-xs"
        />
      </label>

      <label className="mt-3 block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
          Produced evidence link (optional)
        </span>
        <input
          type="url"
          value={producedEvidenceLink}
          onChange={(event) => setProducedEvidenceLink(event.target.value)}
          disabled={isPending}
          placeholder="https:// or internal: reference"
          className="mt-1 w-full rounded border border-kelly-text/20 bg-white px-2 py-2 text-xs"
        />
      </label>

      {error ? (
        <p className="mt-2 rounded border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] text-rose-800">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-2 rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[10px] text-emerald-900">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !operator.trim()}
        className="mt-3 rounded bg-kelly-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Apply task update"}
      </button>
    </form>
  );
}

type EvidenceCommandTaskPanelProps = {
  tasks: KimHammerRetrievalTaskRow[];
};

export function EvidenceCommandTaskPanel({ tasks }: EvidenceCommandTaskPanelProps) {
  return (
    <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
      <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">
        KH-3B task execution
      </h2>
      <p className="mt-1 text-kelly-muted">
        Assign, progress, and close retrieval tasks. Every save creates a JSON backup and task audit entry.
        Promote produced evidence links into citation cards via the{" "}
        <a href="/admin/intelligence/kim-hammer/citation-locker" className="font-semibold text-kelly-navy underline">
          Citation Locker
        </a>
        .
      </p>

      <div className="mt-4 space-y-4">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-lg border border-kelly-text/10 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-kelly-navy">
                #{task.rank ?? "?"} {task.title.slice(0, 120)}
                {task.title.length > 120 ? "…" : ""}
              </h3>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                {task.id}
              </span>
            </div>
            <KimHammerRetrievalTaskControls task={task} compact />
          </article>
        ))}
      </div>
    </section>
  );
}
