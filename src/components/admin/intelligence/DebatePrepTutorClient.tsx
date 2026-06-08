"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { DebatePrepTutorMode } from "@/lib/intelligence/v4/debatePrepTutorPackage";
import type { TutorCritiqueResult, TutorSession } from "@/lib/intelligence/v4/debatePrepTutorOrchestrator";

type CopilotOutput = {
  title: string;
  sections: { heading: string; bullets: string[] }[];
  riskWarnings: string[];
};

const MODE_STYLES: Record<DebatePrepTutorMode, string> = {
  "panic-5": "border-rose-400 bg-rose-50",
  "tonight-15": "border-indigo-400 bg-indigo-50",
  "deep-30": "border-violet-400 bg-violet-50",
  "check-my-record": "border-amber-400 bg-amber-50",
  "three-way-panel": "border-cyan-400 bg-cyan-50",
};

export function DebatePrepTutorClient({ embedded }: { embedded?: boolean }) {
  const [mode, setMode] = useState<DebatePrepTutorMode | null>(null);
  const [session, setSession] = useState<TutorSession | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [critique, setCritique] = useState<TutorCritiqueResult | null>(null);
  const [toolOutput, setToolOutput] = useState<CopilotOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cmrBeats, setCmrBeats] = useState<
    { step: number; label: string; sayThis: string; doNot: string[] }[] | null
  >(null);

  const startSession = useCallback(async (selected: DebatePrepTutorMode) => {
    setLoading(true);
    setError(null);
    setCritique(null);
    setToolOutput(null);
    setPracticeAnswer("");
    setCardIndex(0);
    setTurnIndex(0);
    try {
      const res = await fetch("/api/admin/intelligence/debate-prep-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start-session", mode: selected }),
      });
      const data = (await res.json()) as { ok?: boolean; session?: TutorSession; error?: string };
      if (!res.ok || !data.ok || !data.session) {
        setError(data.error ?? "Failed to start tutor session");
        return;
      }
      setMode(selected);
      setSession(data.session);
      if (selected === "check-my-record") {
        const cmrRes = await fetch("/api/admin/intelligence/debate-prep-tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check-my-record-content" }),
        });
        const cmrData = (await cmrRes.json()) as {
          content?: { playbook?: { deliveryWalkthrough: typeof cmrBeats } };
        };
        setCmrBeats(cmrData.content?.playbook?.deliveryWalkthrough ?? null);
      }
    } catch {
      setError("Network error — check connection");
    } finally {
      setLoading(false);
    }
  }, []);

  async function requestCritique() {
    if (!session || !practiceAnswer.trim()) return;
    const card = session.cards[cardIndex]?.card;
    if (!card) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/intelligence/debate-prep-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "critique-answer",
          cardId: card.cardId,
          queueId: session.config.queueId,
          practiceAnswer,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; critique?: TutorCritiqueResult; error?: string };
      if (!res.ok || !data.ok || !data.critique) {
        setError(data.error ?? "Critique failed");
        return;
      }
      setCritique(data.critique);
    } catch {
      setError("Critique network error");
    } finally {
      setLoading(false);
    }
  }

  async function runTool(toolId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/intelligence/debate-prep-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run-tool",
          toolId,
          topic: session?.cards[cardIndex]?.card.title ?? "debate prep",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; output?: CopilotOutput; error?: string };
      if (!res.ok || !data.ok || !data.output) {
        setError(data.error ?? "Tool failed");
        return;
      }
      setToolOutput(data.output);
    } catch {
      setError("Tool network error");
    } finally {
      setLoading(false);
    }
  }

  const currentCard = session?.cards[cardIndex];
  const currentTurn = currentCard?.coachTurns[turnIndex];

  if (!session) {
    return (
      <section className={embedded ? "text-sm" : "rounded-xl border-2 border-emerald-300 bg-emerald-50/20 p-5"}>
        {!embedded ? (
          <header className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900">AI debate prep tutor</p>
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Pick your time — the coach handles the rest</h2>
            <p className="mt-1 text-sm text-kelly-muted">
              Political debate coaching with trap lanes, SOS speak-order, and Check My Record — one card at a time. No browsing twenty pages.
            </p>
          </header>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["panic-5", "5 min panic reset", "One card · one line · go"],
              ["tonight-15", "15 min pre-stage", "Recommended before stage"],
              ["deep-30", "30 min rehearsal", "Full queue + critique"],
              ["check-my-record", "Check My Record", "Six-beat walkthrough"],
              ["three-way-panel", "Three-way panel", "Hammer + Packo dynamics"],
            ] as const
          ).map(([id, label, sub]) => (
            <button
              key={id}
              type="button"
              disabled={loading}
              onClick={() => void startSession(id)}
              className={`min-h-[72px] rounded-xl border-2 p-4 text-left transition active:scale-[0.99] disabled:opacity-50 ${MODE_STYLES[id]}`}
            >
              <span className="block text-sm font-bold text-kelly-navy">{label}</span>
              <span className="mt-1 block text-[10px] text-kelly-subtle">{sub}</span>
            </button>
          ))}
        </div>
        {error ? <p className="mt-3 font-bold text-rose-900">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="space-y-4 text-sm" data-debate-prep-tutor="v1">
      <div className={`rounded-xl border-2 p-4 ${MODE_STYLES[session.mode]}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase text-kelly-subtle">{session.config.label}</p>
            <h2 className="font-heading text-lg font-bold text-kelly-navy">{session.config.headline}</h2>
            <p className="mt-2 text-kelly-muted">{session.openingCoachMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSession(null);
              setMode(null);
            }}
            className="min-h-10 rounded-lg border px-3 text-xs font-bold"
          >
            Change mode
          </button>
        </div>
        {session.panicReminder ? (
          <p className="mt-3 rounded-lg border border-rose-300 bg-white p-3 text-xs font-semibold text-rose-950">
            {session.panicReminder}
          </p>
        ) : null}
      </div>

      {session.sequenceSteps.length > 0 ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
          <p className="text-[10px] font-bold uppercase text-violet-900">Pre-stage tool sequence</p>
          <ol className="mt-2 space-y-2">
            {session.sequenceSteps.map((step) => (
              <li key={step.toolId} className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-kelly-navy">{step.label}</span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void runTool(step.toolId)}
                  className="min-h-9 rounded-lg bg-violet-700 px-3 text-[10px] font-bold text-white disabled:opacity-50"
                >
                  Run
                </button>
                <span className="text-[10px] text-kelly-subtle">{step.why}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {cmrBeats ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-[10px] font-bold uppercase text-amber-950">Check My Record — six beats</p>
          <ol className="mt-2 space-y-3">
            {cmrBeats.map((beat) => (
              <li key={beat.step} className="rounded-lg border border-amber-100 bg-white p-3">
                <p className="font-bold text-kelly-navy">
                  {beat.step}. {beat.label}
                </p>
                <p className="mt-1 text-xs text-kelly-muted">{beat.sayThis}</p>
                {beat.doNot.length > 0 ? (
                  <p className="mt-1 text-[10px] text-rose-800">Do not: {beat.doNot.join(" · ")}</p>
                ) : null}
              </li>
            ))}
          </ol>
          <button
            type="button"
            disabled={loading}
            onClick={() => void runTool("check-my-record-responder")}
            className="mt-3 min-h-10 rounded-lg bg-amber-700 px-4 text-xs font-bold text-white disabled:opacity-50"
          >
            Run full CMR tool
          </button>
        </div>
      ) : null}

      {currentCard ? (
        <article className="rounded-xl border-2 border-kelly-navy/15 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase text-kelly-subtle">
              Card {cardIndex + 1} of {session.cards.length} · {currentCard.card.durationLabel}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={cardIndex === 0}
                onClick={() => {
                  setCardIndex((i) => i - 1);
                  setTurnIndex(0);
                  setCritique(null);
                }}
                className="min-h-9 rounded border px-2 text-xs font-bold disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={cardIndex >= session.cards.length - 1}
                onClick={() => {
                  setCardIndex((i) => i + 1);
                  setTurnIndex(0);
                  setCritique(null);
                }}
                className="min-h-9 rounded border px-2 text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{currentCard.card.title}</h3>
          <p className="mt-1 text-xs text-kelly-muted">{currentCard.card.prompt}</p>

          {currentTurn ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-[10px] font-bold uppercase text-emerald-900">Coach · turn {turnIndex + 1}</p>
              <p className="mt-2 leading-relaxed text-emerald-950">{currentTurn.coachMessage}</p>
              {currentTurn.socraticQuestion ? (
                <p className="mt-2 text-xs font-semibold italic text-emerald-800">? {currentTurn.socraticQuestion}</p>
              ) : null}
              <p className="mt-2 text-[10px] font-bold text-emerald-900">Do this: {currentTurn.doThisNext}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={turnIndex <= 0}
                  onClick={() => setTurnIndex((i) => i - 1)}
                  className="min-h-9 rounded border px-2 text-xs font-bold disabled:opacity-40"
                >
                  Earlier tip
                </button>
                <button
                  type="button"
                  disabled={turnIndex >= currentCard.coachTurns.length - 1}
                  onClick={() => setTurnIndex((i) => i + 1)}
                  className="min-h-9 rounded border px-2 text-xs font-bold disabled:opacity-40"
                >
                  Next tip
                </button>
              </div>
            </div>
          ) : null}

          {currentCard.safeLine ? (
            <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-[10px] font-bold uppercase text-indigo-900">Stage-safe line</p>
              <p className="mt-1 text-sm font-medium text-indigo-950">{currentCard.safeLine}</p>
            </div>
          ) : null}

          <ul className="mt-3 space-y-1 text-[10px] text-rose-800">
            {currentCard.doNotSay.map((d) => (
              <li key={d.slice(0, 32)}>Do not: {d}</li>
            ))}
          </ul>

          <Link href={currentCard.href} className="mt-3 inline-flex text-xs font-bold text-kelly-navy underline">
            Full drill-down →
          </Link>

          {(session.mode === "deep-30" || session.mode === "tonight-15") && (
            <div className="mt-4 border-t border-kelly-text/10 pt-4">
              <label className="block">
                <span className="font-bold text-kelly-navy">Practice your answer</span>
                <textarea
                  value={practiceAnswer}
                  onChange={(e) => setPracticeAnswer(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-kelly-text/20 p-3 text-base"
                  placeholder="Type or paste what you would say on stage…"
                />
              </label>
              <button
                type="button"
                disabled={loading || !practiceAnswer.trim()}
                onClick={() => void requestCritique()}
                className="mt-2 min-h-11 w-full rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                {loading ? "Coach reviewing…" : "Get coach feedback"}
              </button>
            </div>
          )}
        </article>
      ) : null}

      {critique ? (
        <article
          className={`rounded-xl border-2 p-4 ${
            critique.overall === "blocked"
              ? "border-rose-400 bg-rose-50"
              : critique.overall === "strong"
                ? "border-emerald-400 bg-emerald-50"
                : "border-amber-400 bg-amber-50"
          }`}
        >
          <p className="text-[10px] font-bold uppercase">Coach verdict · {critique.overall}</p>
          <p className="mt-1 font-bold text-kelly-navy">{critique.headline}</p>
          {critique.strengths.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-xs text-emerald-900">
              {critique.strengths.map((s) => (
                <li key={s.slice(0, 40)}>{s}</li>
              ))}
            </ul>
          ) : null}
          {critique.fixes.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-xs text-amber-950">
              {critique.fixes.map((f) => (
                <li key={f.slice(0, 40)}>{f}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2 text-xs italic text-kelly-muted">{critique.politicalDebateNote}</p>
        </article>
      ) : null}

      {toolOutput ? (
        <article className="rounded-xl border border-violet-200 bg-white p-4">
          <p className="font-bold text-kelly-navy">{toolOutput.title}</p>
          <p className="text-[10px] font-bold uppercase text-amber-900">NON_PUBLISHABLE · HUMAN_REVIEW</p>
          {toolOutput.sections.map((sec) => (
            <div key={sec.heading} className="mt-3">
              <p className="font-bold text-violet-950">{sec.heading}</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                {sec.bullets.map((b) => (
                  <li key={b.slice(0, 48)}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </article>
      ) : null}

      <div className="rounded-xl border border-kelly-text/10 bg-kelly-page/40 p-4">
        <p className="text-[10px] font-bold uppercase text-kelly-subtle">Political debate principles</p>
        <ul className="mt-2 space-y-2">
          {session.frameworkPrinciples.map((p) => (
            <li key={p.id} className="text-xs">
              <span className="font-bold text-kelly-navy">{p.title}</span>
              <span className="text-kelly-muted"> — {p.rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void runTool("packo-lane-advisor")}
          className="min-h-10 rounded-lg border border-cyan-300 bg-cyan-50 px-3 text-[10px] font-bold"
        >
          Packo advisor
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void runTool("direct-democracy-explainer")}
          className="min-h-10 rounded-lg border border-amber-300 bg-amber-50 px-3 text-[10px] font-bold"
        >
          Direct democracy
        </button>
        <Link
          href="/admin/intelligence/drill-queue"
          className="inline-flex min-h-10 items-center rounded-lg border px-3 text-[10px] font-bold text-kelly-navy"
        >
          Full drill queue →
        </Link>
      </div>

      {error ? <p className="font-bold text-rose-900">{error}</p> : null}
      <p className="text-[10px] text-amber-900 font-bold uppercase">NON_PUBLISHABLE · verify claims before stage</p>
    </section>
  );
}
