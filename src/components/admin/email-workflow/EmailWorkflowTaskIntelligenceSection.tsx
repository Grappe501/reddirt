"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateTaskRecommendationsForQueueItemAction } from "@/app/admin/email-task-intelligence-actions";
import {
  isStoredEmailTaskIntelligenceV1,
  type EmailTaskIntelligenceStoredV1,
  type EmailTaskIntelligenceTaskRow,
} from "@/lib/email-command-center/ai-task-intelligence";

function asMetaRecord(v: unknown): Record<string, unknown> {
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return {};
}

function slugLabel(slug: string): string {
  return slug.replace(/_/g, " ");
}

function TaskCard({ task }: { task: EmailTaskIntelligenceTaskRow }) {
  return (
    <li className="rounded border border-kelly-text/10 bg-white/90 px-2 py-1.5 text-[10px] text-kelly-text/90">
      <p className="font-bold text-kelly-navy">{task.taskTitle}</p>
      <p className="mt-0.5 text-[9px] text-kelly-text/75">
        <span className="font-semibold">Type:</span> {slugLabel(task.taskType)} ·<span className="font-semibold"> Urgency:</span>{" "}
        {task.urgency} ·<span className="font-semibold"> Owner role:</span> {task.ownerRole || "—"} ·
        <span className="font-semibold"> Due window:</span> {task.recommendedDueWindow}
      </p>
      <p className="mt-0.5 text-[9px] leading-snug text-kelly-text/85">{task.contextSummary}</p>
      {task.dependencies.length ? (
        <p className="mt-0.5 text-[9px] text-kelly-text/70">
          <span className="font-semibold">Dependencies:</span> {task.dependencies.join(" · ")}
        </p>
      ) : null}
      <p className="mt-0.5 text-[9px] text-kelly-text/70">
        <span className="font-semibold">Calendar relevance:</span> {task.calendarRelevance || "none"}{" "}
        <span className="text-kelly-text/55">(operator-only — no calendar API from RedDirt)</span>
      </p>
      <p className="mt-0.5 text-[9px] text-kelly-text/70">
        <span className="font-semibold">Flags:</span> draft {task.emailDraftNeeded ? "yes" : "no"} · profile update{" "}
        {task.profileUpdateSuggested ? "suggested" : "no"} · audience hint {task.audienceHintSuggested ? "yes" : "no"}
      </p>
      {task.riskFlags.length ? (
        <p className="mt-0.5 text-[9px] text-rose-900/90">
          <span className="font-semibold">Risk:</span> {task.riskFlags.join(" · ")}
        </p>
      ) : null}
    </li>
  );
}

export function EmailWorkflowTaskIntelligenceSection({
  itemId,
  rawMeta,
}: {
  itemId: string;
  rawMeta: unknown;
}) {
  const meta = asMetaRecord(rawMeta);
  const raw = meta.emailTaskIntelligence;
  const stored: EmailTaskIntelligenceStoredV1 | null = isStoredEmailTaskIntelligenceV1(raw) ? raw : null;
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const exportPayload = stored
    ? JSON.stringify({ itemId, emailTaskIntelligence: stored }, null, 2)
    : "";

  return (
    <div className="mt-2 space-y-2 rounded border border-teal-200/70 bg-teal-50/40 p-2">
      <h2 className="font-heading text-sm font-bold text-kelly-navy">AI Task Intelligence</h2>
      <p className="text-[10px] leading-snug text-kelly-text/75">
        <span className="font-semibold text-kelly-navy">EMAIL-AI-TASK-INTELLIGENCE-1.0</span> — structured campaign tasks
        and next actions from queue context. Stored under <code className="rounded bg-white/80 px-0.5 text-[9px]">metadataJson.emailTaskIntelligence</code> only.{" "}
        <strong>No</strong> automatic <code className="text-[9px]">CampaignTask</code> creation, <strong>no</strong> calendar writes,{" "}
        <strong>no</strong> sends.
      </p>

      <ul className="list-inside list-disc space-y-0.5 text-[10px] text-teal-950/90">
        <li>Advisory JSON — operators create real tasks in approved systems manually.</li>
        <li>Future calendar handoff: copy export into your calendaring tool; RedDirt does not call Google Calendar.</li>
      </ul>

      <form
        className="mt-1 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          setNotice(null);
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const r = await generateTaskRecommendationsForQueueItemAction(fd);
            if (!r.ok) {
              const missingKey =
                r.error.toLowerCase().includes("not configured") || r.error.includes("OPENAI_API_KEY missing");
              if (missingKey) {
                setNotice("OpenAI is not configured (OPENAI_API_KEY). Task intelligence requires the same key as queue AI.");
                router.refresh();
                return;
              }
              setErr(r.error);
              router.refresh();
              return;
            }
            router.refresh();
          });
        }}
      >
        <input type="hidden" name="itemId" value={itemId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded border-2 border-teal-600/50 bg-teal-700/90 px-3 py-1 text-[11px] font-bold text-white disabled:opacity-50"
        >
          {pending ? "Generating…" : stored?.output?.tasks?.length ? "Regenerate task recommendations" : "Generate task recommendations"}
        </button>
      </form>
      {stored?.generatedAt ? (
        <p className="text-[9px] text-kelly-text/55">
          Last run: <span className="font-semibold">{stored.generatedAt}</span>
          {stored.promptVersion ? (
            <>
              {" "}
              · <code className="text-[9px]">{stored.promptVersion}</code>
            </>
          ) : null}
        </p>
      ) : null}

      {notice ? <p className="text-[11px] text-amber-950/90">{notice}</p> : null}
      {err ? <p className="text-[11px] text-rose-900">{err}</p> : null}

      {stored?.lastErrorSafe && !stored.output?.tasks?.length ? (
        <p className="rounded border border-rose-200/70 bg-rose-50/80 px-2 py-1 text-[11px] text-rose-950">{stored.lastErrorSafe}</p>
      ) : null}

      {stored?.output?.packetSummary ? (
        <div className="rounded border border-indigo-200/70 bg-indigo-50/80 px-2 py-1.5 text-[10px] text-indigo-950">
          <p className="font-semibold text-indigo-950">Packet summary</p>
          <p className="mt-1 leading-snug">{stored.output.packetSummary}</p>
        </div>
      ) : null}

      {stored?.output?.tasks?.length ? (
        <div>
          <p className="text-[10px] font-bold uppercase text-teal-900">Recommended tasks</p>
          <ol className="mt-1 space-y-1.5">
            {stored.output.tasks.map((t, i) => (
              <TaskCard key={`${t.taskTitle}-${i}`} task={t} />
            ))}
          </ol>
        </div>
      ) : stored && !stored.lastErrorSafe ? (
        <p className="text-[11px] text-kelly-text/60">No tasks parsed — re-run generation or check model output shape.</p>
      ) : !stored ? (
        <p className="text-[11px] text-kelly-text/55">No task intelligence stored yet — generate when OpenAI is configured.</p>
      ) : null}

      {exportPayload ? (
        <div className="flex flex-wrap gap-2 border-t border-teal-200/50 pt-2">
          <button
            type="button"
            className="rounded border border-kelly-text/20 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-navy"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(exportPayload);
              } catch {
                /* ignore */
              }
            }}
          >
            Copy JSON export
          </button>
          <button
            type="button"
            className="rounded border border-kelly-text/20 bg-kelly-fog/60 px-2 py-1 text-[10px] font-semibold text-kelly-navy"
            onClick={() => {
              try {
                const blob = new Blob([exportPayload], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `email-task-intelligence-${itemId.slice(0, 8)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                /* ignore */
              }
            }}
          >
            Download JSON
          </button>
        </div>
      ) : null}
    </div>
  );
}
