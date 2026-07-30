"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { runEvidenceAiCommandAction } from "@/app/admin/evidence-workbench-actions";
import type { EvidenceCommandResult } from "@/lib/campaign-media/evidence-ai-command";

const STARTERS = [
  "What should I do next on the Evidence Workbench?",
  "Propose an event-night pack for the most recent Confirmed calendar row.",
  "Where are Unknown-county stills blocking Approve?",
  "Build a ship checklist — what still needs commit?",
  "Which speeches need county confirm before publish?",
];

/**
 * Magical freeform command bar — full tool surface, Prefer Unknown, confirm gates.
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
    <div className="mt-4 rounded-lg border-2 border-[#c9a227]/50 bg-gradient-to-br from-[#000066] to-[#12124a] p-4 text-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-heading text-sm font-bold tracking-wide text-[#f0d78c]">
            Evidence Command · magical AI
          </p>
          <p className="mt-1 max-w-2xl font-body text-xs text-white/75">
            Ask across calendar, photos, videos, intake, placement, and ship. Prefer Unknown. Never silent
            Approve / Confirm / encode / curate.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder="e.g. Prep tonight’s Benton Confirmed stop — link stills and speeches without inventing geography"
          className="min-h-[64px] flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 font-body text-sm text-white placeholder:text-white/40 focus:outline focus:outline-2 focus:outline-[#f0d78c]"
        />
        <button
          type="button"
          disabled={pending || !prompt.trim()}
          onClick={() => run(prompt)}
          className="min-h-[48px] rounded-md bg-[#f0d78c] px-4 py-2 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
        >
          {pending ? "Thinking…" : "Run command"}
        </button>
      </div>

      <ul className="mt-2 flex flex-wrap gap-1.5">
        {STARTERS.map((s) => (
          <li key={s}>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(s)}
              className="rounded-full border border-white/25 bg-white/5 px-2.5 py-1 font-body text-[11px] text-white/90 hover:border-[#f0d78c]/60 hover:bg-white/10 disabled:opacity-50"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>

      {message ? (
        <p className="mt-3 font-body text-xs text-[#f0d78c]/90">{message}</p>
      ) : null}

      {result ? (
        <div className="mt-3 space-y-3 rounded-md border border-white/15 bg-black/20 p-3">
          <p className="font-heading text-base font-bold text-white">{result.headline}</p>
          {result.plan.length ? (
            <ol className="list-decimal space-y-1 pl-5 font-body text-sm text-white/90">
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
                  className="rounded-md border border-[#f0d78c]/40 bg-[#f0d78c]/15 px-3 py-1.5 font-body text-xs font-semibold text-[#f0d78c] hover:bg-[#f0d78c]/25"
                >
                  {c.label} →
                </Link>
              ))}
            </div>
          ) : null}
          {result.toolsSummary ? (
            <p className="font-mono text-[10px] text-white/55">{result.toolsSummary}</p>
          ) : null}
          {result.warnings.length ? (
            <ul className="list-disc space-y-0.5 pl-4 font-body text-[11px] text-white/65">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
