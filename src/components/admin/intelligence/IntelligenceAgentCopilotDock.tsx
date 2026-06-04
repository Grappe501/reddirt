"use client";

import { useState } from "react";
import Link from "next/link";
import { CANDIDATE_IPAD_COPILOT_QUICK_TOOLS } from "@/lib/intelligence/candidateIpadMode";

type CopilotSection = { heading: string; bullets: string[] };

type CopilotOutput = {
  title: string;
  sections: CopilotSection[];
  riskWarnings: string[];
  operatorNextAction: string;
  evidenceDependencies: string[];
};

export function IntelligenceAgentCopilotDock({ embedded }: { embedded?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<CopilotOutput | null>(null);
  const [topic, setTopic] = useState("check my record / direct democracy");

  async function runTool(toolId: string) {
    setBusy(toolId);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/admin/intelligence/copilot-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId,
          topic,
          generatedForRoute: "/admin/intelligence/kelly-debate-coaching",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        output?: CopilotOutput;
      };
      if (!res.ok || !data.ok || !data.output) {
        setError(data.error ?? "Tool run failed");
      } else {
        setOutput(data.output);
      }
    } catch {
      setError("Network error — check connection on iPad");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className={embedded ? "text-xs" : "mb-6 rounded-xl border-2 border-violet-300 bg-violet-50/30 p-4 text-xs"}>
      {!embedded ? (
        <header className="mb-3">
          <p className="text-[10px] font-bold uppercase text-violet-950">AI agent · governed copilot</p>
          <h2 className="font-heading text-lg font-bold text-kelly-navy">Prep assistant (internal draft only)</h2>
          <p className="mt-1 text-kelly-muted">
            Runs registered copilot tools — same engine as Debate AI Workbench. Never auto-publishes; staff reviews
            outputs.
          </p>
        </header>
      ) : null}

      <label className="block">
        <span className="font-bold text-kelly-navy">Tonight&apos;s topic focus</span>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1 min-h-12 w-full rounded-xl border border-kelly-text/20 px-3 text-base"
          placeholder="e.g. petition acts, check my record"
        />
      </label>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CANDIDATE_IPAD_COPILOT_QUICK_TOOLS.map((tool) => (
          <button
            key={tool.toolId}
            type="button"
            disabled={busy !== null}
            onClick={() => runTool(tool.toolId)}
            className="min-h-[52px] rounded-xl border-2 border-violet-200 bg-white px-3 py-2 text-left active:border-violet-600 disabled:opacity-50"
          >
            <span className="block font-bold text-kelly-navy">{tool.label}</span>
            <span className="mt-0.5 block text-[10px] text-kelly-muted">{tool.description}</span>
            {busy === tool.toolId ? <span className="text-[10px] text-violet-900">Running…</span> : null}
          </button>
        ))}
      </div>

      {error ? <p className="mt-3 font-bold text-rose-900">{error}</p> : null}

      {output ? (
        <article className="mt-4 rounded-xl border border-kelly-navy/15 bg-white p-4">
          <p className="font-bold text-kelly-navy">{output.title}</p>
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
        </article>
      ) : null}

      <Link
        href="/admin/intelligence/kim-hammer/debate-ai-workbench"
        className="mt-4 inline-flex min-h-11 items-center font-bold text-kelly-navy underline"
      >
        Full AI workbench (all tools) →
      </Link>
    </section>
  );
}
