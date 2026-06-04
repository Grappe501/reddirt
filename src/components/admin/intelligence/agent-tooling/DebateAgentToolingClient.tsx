"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { DebateAgentToolingPageData } from "@/lib/intelligence/debateAgentToolingPackage";
import type { AiCopilotToolEntry } from "@/lib/intelligence/aiCopilotOrchestrator";

type CopilotSection = { heading: string; bullets: string[] };

type CopilotOutput = {
  title: string;
  sections: CopilotSection[];
  riskWarnings: string[];
  operatorNextAction: string;
  evidenceDependencies: string[];
};

const statusStyle = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warn: "border-amber-200 bg-amber-50 text-amber-950",
  action: "border-rose-200 bg-rose-50 text-rose-950",
};

export function DebateAgentToolingClient({ data }: { data: DebateAgentToolingPageData }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<CopilotOutput | null>(null);
  const [lastToolId, setLastToolId] = useState<string | null>(null);
  const [topic, setTopic] = useState("election integrity · counties · non-partisan SOS");

  const runTool = useCallback(async (toolId: string) => {
    setBusy(toolId);
    setError(null);
    setOutput(null);
    setLastToolId(toolId);
    try {
      const res = await fetch("/api/admin/intelligence/copilot-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId,
          topic,
          generatedForRoute: "/admin/intelligence/agent-tooling",
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        output?: CopilotOutput;
        llmDraftId?: string | null;
      };
      if (!res.ok || !json.ok || !json.output) {
        setError(json.error ?? "Tool run failed");
      } else {
        setOutput(json.output);
      }
    } catch {
      setError("Network error — retry on stable connection");
    } finally {
      setBusy(null);
    }
  }, [topic]);

  const runSequence = useCallback(
    async (sequenceId: string) => {
      const seq = data.sequences.find((s) => s.sequenceId === sequenceId);
      if (!seq?.steps[0]) return;
      await runTool(seq.steps[0].toolId);
    },
    [data.sequences, runTool],
  );

  return (
    <div className="space-y-8 text-xs">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.readinessSignals.map((sig) => (
          <div key={sig.id} className={`rounded-xl border-2 p-3 ${statusStyle[sig.status]}`}>
            <p className="font-bold uppercase tracking-wide">{sig.label}</p>
            <p className="mt-1 text-[11px] leading-snug">{sig.detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border-2 border-violet-300 bg-violet-50/40 p-4">
        <p className="text-[10px] font-bold uppercase text-violet-950">Run copilot tools</p>
        <p className="mt-1 text-kelly-muted">
          {data.registryToolCount} tools in registry · {data.debatePrepTools.length} debate_prep · outputs are
          INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED
        </p>

        <label className="mt-4 block">
          <span className="font-bold text-kelly-navy">Topic focus for timed tools</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-kelly-text/20 px-3 text-sm"
          />
        </label>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {data.quickTools.map((tool) => (
            <ToolRunButton key={tool.toolId} tool={tool} busy={busy} onRun={runTool} />
          ))}
        </div>

        {error ? <p className="mt-3 font-bold text-rose-900">{error}</p> : null}
        {output ? <CopilotOutputPanel output={output} toolId={lastToolId} /> : null}
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Operator sequences</h2>
        <p className="mt-1 text-kelly-muted">
          Pre-built debate-week passes — run step 1 here, then continue through the list manually.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {data.sequences.map((seq) => (
            <article key={seq.sequenceId} className="rounded-lg border border-kelly-text/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-kelly-navy">{seq.label}</p>
                  <p className="text-[10px] text-kelly-subtle">
                    {seq.phase} · {seq.audience} · ~{seq.estimatedMinutes} min
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => runSequence(seq.sequenceId)}
                  className="min-h-10 rounded-lg border-2 border-violet-300 bg-violet-50 px-3 py-1 font-bold text-violet-950 disabled:opacity-50"
                >
                  Run first step
                </button>
              </div>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-kelly-muted">
                {seq.steps.map((step, i) => (
                  <li key={step.toolId}>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => runTool(step.toolId)}
                      className="text-left font-semibold text-kelly-navy underline disabled:opacity-50"
                    >
                      {i + 1}. {step.label}
                    </button>
                    <span className="block text-[10px]">{step.why}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-navy">Recommended runs</h2>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {data.recommendedRuns.map((line) => (
              <li key={line.slice(0, 56)}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-navy">Linked prep surfaces</h2>
          <ul className="mt-2 space-y-1">
            {data.linkedSurfaces.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="font-bold text-kelly-navy underline">
                  {s.label}
                </Link>
                <span className="text-[10px] text-kelly-subtle"> · {s.role}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] text-kelly-subtle">
            SOS bank: {data.sosQuestionCount} questions ({data.sosHighProbabilityCount} HIGH) · Trap lanes:{" "}
            {data.trapLaneCount}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">All debate_prep tools</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {data.debatePrepTools.map((tool) => (
            <ToolRunButton key={tool.toolId} tool={tool} busy={busy} onRun={runTool} compact />
          ))}
        </div>
      </section>

      {data.recentAuditRuns.length > 0 ? (
        <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-navy">Recent daily agent runs</h2>
          <ul className="mt-2 space-y-1 text-kelly-muted">
            {data.recentAuditRuns.map((run) => (
              <li key={run.runId}>
                {run.runId} · {run.generatedAt.slice(0, 10)}
                {run.debateReadinessOverall != null ? ` · debate readiness ${run.debateReadinessOverall}%` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ToolRunButton({
  tool,
  busy,
  onRun,
  compact,
}: {
  tool: AiCopilotToolEntry;
  busy: string | null;
  onRun: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={busy !== null}
      onClick={() => onRun(tool.toolId)}
      className={`rounded-xl border-2 border-violet-200 bg-white text-left active:border-violet-600 disabled:opacity-50 ${compact ? "px-3 py-2" : "min-h-[52px] px-3 py-2"}`}
    >
      <span className="block font-bold text-kelly-navy">{tool.name}</span>
      {!compact ? <span className="mt-0.5 block text-[10px] text-kelly-muted">{tool.purpose.slice(0, 90)}…</span> : null}
      {busy === tool.toolId ? <span className="text-[10px] text-violet-900">Running…</span> : null}
    </button>
  );
}

function CopilotOutputPanel({ output, toolId }: { output: CopilotOutput; toolId: string | null }) {
  return (
    <article className="mt-4 rounded-xl border border-kelly-navy/15 bg-white p-4">
      <p className="font-bold text-kelly-navy">{output.title}</p>
      {toolId ? <p className="text-[10px] text-kelly-subtle">tool: {toolId}</p> : null}
      <p className="mt-1 text-[10px] font-bold uppercase text-amber-900">NON_PUBLISHABLE · HUMAN_REVIEW</p>
      {output.sections.map((sec) => (
        <div key={sec.heading} className="mt-3">
          <p className="font-bold text-violet-950">{sec.heading}</p>
          <ul className="mt-1 list-inside list-disc text-kelly-muted">
            {sec.bullets.map((b) => (
              <li key={b.slice(0, 48)}>{b}</li>
            ))}
          </ul>
        </div>
      ))}
      {output.riskWarnings.length > 0 ? (
        <ul className="mt-3 list-inside list-disc text-rose-950">
          {output.riskWarnings.map((w) => (
            <li key={w.slice(0, 40)}>{w}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-[10px] text-kelly-subtle">{output.operatorNextAction}</p>
      <Link href="/admin/intelligence/llm-review-queue" className="mt-2 inline-block font-bold text-kelly-navy underline">
        LLM review queue →
      </Link>
    </article>
  );
}
