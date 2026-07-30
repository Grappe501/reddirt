"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { runEvidenceAiCommandAction } from "@/app/admin/evidence-workbench-actions";
import type { EvidenceCommandResult } from "@/lib/campaign-media/evidence-ai-command";
import { ewBtnPrimaryClass } from "@/components/admin/evidence-workbench/evidenceWorkbenchChrome";

const STARTERS = [
  "What should I do next on the Evidence Workbench?",
  "Propose an event-night pack for the most recent Confirmed calendar row.",
  "Where are Unknown-county stills blocking Approve?",
  "Build a ship checklist — what still needs commit?",
  "Which speeches need county confirm before publish?",
];

/**
 * Magical freeform command bar — Fortune-50 console surface.
 */
export function EvidenceAiCommandCenter() {
  const [prompt, setPrompt] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<EvidenceCommandResult | null>(null);
  const [pending, start] = useTransition();

  function run(text: string) {
    const q = text.trim();
    if (!q) return;
    setPrompt(q);
    start(async () => {
      setMessage("Command running…");
      setResult(null);
      const res = await runEvidenceAiCommandAction(q);
      setMessage(res.message);
      if (res.ok && res.result) setResult(res.result);
    });
  }

  return (
    <div className="ew-command mt-5">
      <div className="relative z-[1]">
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.28em] text-kelly-gold-soft">
          Evidence Command
        </p>
        <p className="mt-2 max-w-2xl font-heading text-xl font-bold tracking-tight text-white md:text-2xl">
          Ask the workbench anything
        </p>
        <p className="mt-2 max-w-2xl font-body text-sm text-white/75">
          Calendar · photos · videos · intake · placement · ship. Prefer Unknown. Never silent Approve /
          Confirm / encode / curate.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            placeholder="e.g. Prep tonight’s Confirmed Benton stop — link stills and speeches without inventing geography"
            className="min-h-[72px] flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-body text-sm text-white placeholder:text-white/40 backdrop-blur-sm focus:border-kelly-gold/50 focus:outline-none focus:ring-2 focus:ring-kelly-gold/40"
          />
          <button
            type="button"
            disabled={pending || !prompt.trim()}
            onClick={() => run(prompt)}
            className={`${ewBtnPrimaryClass} sm:self-stretch sm:px-6`}
          >
            {pending ? "Thinking…" : "Run command"}
          </button>
        </div>

        <ul className="mt-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <li key={s}>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(s)}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 font-body text-[11px] text-white/85 transition hover:border-kelly-gold/50 hover:bg-white/10 disabled:opacity-50"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>

        {message ? <p className="mt-4 font-body text-xs text-kelly-gold-soft">{message}</p> : null}

        {result ? (
          <div className="mt-4 space-y-3 rounded-xl border border-white/15 bg-black/25 p-4 backdrop-blur-sm">
            <p className="font-heading text-lg font-bold text-white">{result.headline}</p>
            {result.plan.length ? (
              <ol className="list-decimal space-y-1.5 pl-5 font-body text-sm text-white/90">
                {result.plan.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : null}
            {result.nextClicks.length ? (
              <div className="flex flex-wrap gap-2">
                {result.nextClicks.map((c) => (
                  <Link
                    key={`${c.label}-${c.href}`}
                    href={c.href}
                    className="rounded-full border border-kelly-gold/40 bg-kelly-gold/15 px-3 py-1.5 font-body text-xs font-semibold text-kelly-gold-soft transition hover:bg-kelly-gold/25"
                  >
                    {c.label} →
                  </Link>
                ))}
              </div>
            ) : null}
            {result.toolsSummary ? (
              <p className="font-mono text-[10px] text-white/50">{result.toolsSummary}</p>
            ) : null}
            {result.warnings.length ? (
              <ul className="list-disc space-y-0.5 pl-4 font-body text-[11px] text-white/60">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
