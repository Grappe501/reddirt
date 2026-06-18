"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { DebatePrepTutorMode } from "@/lib/intelligence/v4/debatePrepTutorPackageClient";
import type { TutorCritiqueResult, TutorSession } from "@/lib/intelligence/v4/debatePrepTutorOrchestrator";
import type { DebatePrepProfessorMode } from "@/lib/intelligence/v4/debatePrepProfessorV5";
import type {
  ProfessorCritiqueResult,
  ProfessorTutorSession,
} from "@/lib/intelligence/v4/debatePrepProfessorOrchestrator";
import {
  COACH_MODE_GUIDES,
  PROFESSOR_MODE_GUIDES,
  TUTOR_ELEMENT_GUIDES,
  TUTOR_HUB_WELCOME,
  TUTOR_TOOL_GUIDES,
} from "@/lib/intelligence/v4/debatePrepTutorGuideV5";
import {
  COACH_SHOWCASE_SKIN,
  getProfessorSkin,
  PROFESSOR_SHOWCASE_SKINS,
} from "@/lib/intelligence/v4/debatePrepProfessorShowcaseV6";
import {
  ShowcaseHeroBanner,
  ShowcaseLecturePanel,
  ShowcaseModeHero,
  ShowcaseModePickerCard,
  ShowcaseRubricPanel,
  ShowcaseSessionTimeline,
} from "@/components/admin/intelligence/v4/ProfessorSeminarShowcase";

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

const PROFESSOR_STYLES: Record<DebatePrepProfessorMode, string> = {
  "office-hours-10": "border-violet-400 bg-violet-50",
  "seminar-25": "border-indigo-400 bg-indigo-50",
  "moot-court-45": "border-fuchsia-400 bg-fuchsia-50",
  "forensic-audit": "border-amber-400 bg-amber-50",
};

function isProfessorSession(s: TutorSession | ProfessorTutorSession): s is ProfessorTutorSession {
  return "professorMode" in s && "lecture" in s;
}

function ElementGuideCallout({ elementId }: { elementId: keyof typeof TUTOR_ELEMENT_GUIDES }) {
  const g = TUTOR_ELEMENT_GUIDES[elementId];
  if (!g) return null;
  return (
    <div className="mt-2 rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-3 text-xs">
      <p className="font-bold text-kelly-navy">{g.title} — why it matters</p>
      <p className="mt-1 text-kelly-muted">{g.whyItMatters}</p>
      <p className="mt-2 font-bold text-kelly-navy">How to use</p>
      <p className="mt-0.5 text-kelly-muted">{g.howToUse}</p>
      <p className="mt-2 italic text-emerald-900">Coach tip: {g.coachTip}</p>
    </div>
  );
}

export function DebatePrepTutorClient({
  embedded,
  apiBase = "/api/admin/intelligence/debate-prep-tutor",
}: {
  embedded?: boolean;
  apiBase?: string;
}) {
  const [mode, setMode] = useState<DebatePrepTutorMode | null>(null);
  const [session, setSession] = useState<TutorSession | ProfessorTutorSession | null>(null);
  const [professorMode, setProfessorMode] = useState<DebatePrepProfessorMode | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [critique, setCritique] = useState<TutorCritiqueResult | null>(null);
  const [professorCritique, setProfessorCritique] = useState<ProfessorCritiqueResult | null>(null);
  const [toolOutput, setToolOutput] = useState<CopilotOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cmrBeats, setCmrBeats] = useState<
    { step: number; label: string; sayThis: string; doNot: string[] }[] | null
  >(null);
  const [expandedMode, setExpandedMode] = useState<string | null>(null);
  const isExpanded = (id: string) => expandedMode === id;
  const toggleExpanded = (id: string) => setExpandedMode((prev) => (prev === id ? null : id));

  const startSession = useCallback(async (selected: DebatePrepTutorMode) => {
    setLoading(true);
    setError(null);
    setCritique(null);
    setProfessorCritique(null);
    setToolOutput(null);
    setProfessorMode(null);
    setPracticeAnswer("");
    setCardIndex(0);
    setTurnIndex(0);
    try {
      const res = await fetch(apiBase, {
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
        const cmrRes = await fetch(apiBase, {
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
  }, [apiBase]);

  const startProfessorSession = useCallback(async (selected: DebatePrepProfessorMode) => {
    setLoading(true);
    setError(null);
    setCritique(null);
    setProfessorCritique(null);
    setToolOutput(null);
    setPracticeAnswer("");
    setCardIndex(0);
    setTurnIndex(0);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start-professor-session", mode: selected }),
      });
      const data = (await res.json()) as { ok?: boolean; session?: ProfessorTutorSession; error?: string };
      if (!res.ok || !data.ok || !data.session) {
        setError(data.error ?? "Failed to start professor session");
        return;
      }
      setProfessorMode(selected);
      setMode(null);
      setSession(data.session);
    } catch {
      setError("Network error — check connection");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  async function requestCritique() {
    if (!session || !practiceAnswer.trim()) return;
    const card = session.cards[cardIndex]?.card;
    if (!card) return;
    setLoading(true);
    setError(null);
    setCritique(null);
    setProfessorCritique(null);
    try {
      const action = session && isProfessorSession(session) ? "critique-professor-answer" : "critique-answer";
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          cardId: card.cardId,
          queueId: session.config.queueId,
          practiceAnswer,
          moot: session && isProfessorSession(session) ? session.professorConfig.deliversMoot : undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        critique?: TutorCritiqueResult | ProfessorCritiqueResult;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.critique) {
        setError(data.error ?? "Critique failed");
        return;
      }
      if (session && isProfessorSession(session)) {
        setProfessorCritique(data.critique as ProfessorCritiqueResult);
      } else {
        setCritique(data.critique as TutorCritiqueResult);
      }
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
      const res = await fetch(apiBase, {
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
      <section className={embedded ? "space-y-5 text-sm" : "space-y-6 rounded-2xl border-2 border-kelly-gold/30 bg-gradient-to-b from-violet-50/30 to-white p-5 sm:p-6"}>
        <ShowcaseHeroBanner compact={embedded} />

        <div className="rounded-xl border border-violet-200 bg-white/80 p-4">
          <p className="text-sm leading-relaxed text-kelly-text">{TUTOR_HUB_WELCOME.intro}</p>
          <p className="mt-2 text-sm font-medium text-kelly-navy">{TUTOR_HUB_WELCOME.howToStart}</p>
        </div>

        <div>
          <p className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-kelly-navy">Professor seminar modes</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(PROFESSOR_MODE_GUIDES) as DebatePrepProfessorMode[]).map((id) => {
              const guide = PROFESSOR_MODE_GUIDES[id];
              const skin = PROFESSOR_SHOWCASE_SKINS[id];
              return (
                <ShowcaseModePickerCard
                  key={id}
                  skin={skin}
                  label={guide.label}
                  tagline={guide.tagline}
                  pickIf={guide.pickIf}
                  expanded={isExpanded(id)}
                  onToggle={() => toggleExpanded(id)}
                  onPick={() => void startProfessorSession(id)}
                  loading={loading}
                  why={guide.whyThisMode}
                  when={guide.whenToUse}
                  how={guide.howItWorks}
                  deliverables={guide.whatYouWillGet}
                />
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-emerald-900">Green room coach modes</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(COACH_MODE_GUIDES) as DebatePrepTutorMode[]).map((id) => {
              const guide = COACH_MODE_GUIDES[id];
              return (
                <ShowcaseModePickerCard
                  key={id}
                  skin={{ ...COACH_SHOWCASE_SKIN, cardBorder: MODE_STYLES[id].split(" ")[0] ?? COACH_SHOWCASE_SKIN.cardBorder }}
                  label={guide.label}
                  tagline={guide.tagline}
                  pickIf={guide.pickIf}
                  expanded={isExpanded(`coach-${id}`)}
                  onToggle={() => toggleExpanded(`coach-${id}`)}
                  onPick={() => void startSession(id)}
                  loading={loading}
                  why={guide.whyThisMode}
                  when={guide.whenToUse}
                  how={guide.howItWorks}
                  deliverables={guide.whatYouWillGet}
                />
              );
            })}
          </div>
        </div>
        {error ? <p className="font-bold text-rose-900">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="space-y-5 text-sm" data-debate-prep-tutor="v6-showcase">
      {(() => {
        const skin =
          isProfessorSession(session) && professorMode
            ? getProfessorSkin(professorMode)
            : COACH_SHOWCASE_SKIN;
        return (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <ShowcaseModeHero skin={skin} tagline={session.modeGuide.tagline} pickIf={session.modeGuide.pickIf}>
                  <p className="mt-4 text-sm leading-relaxed text-inherit opacity-90">{session.openingCoachMessage}</p>
                </ShowcaseModeHero>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSession(null);
                  setMode(null);
                  setProfessorMode(null);
                }}
                className="shrink-0 min-h-11 rounded-xl border-2 border-kelly-navy/20 bg-white px-4 text-xs font-bold text-kelly-navy shadow-sm hover:bg-kelly-page"
              >
                ← Change mode
              </button>
            </div>
            {session.panicReminder ? (
              <p className="animate-moot-pulse rounded-xl border-2 border-rose-400 bg-rose-50 p-4 text-sm font-semibold text-rose-950">
                {session.panicReminder}
              </p>
            ) : null}
            <ShowcaseSessionTimeline steps={session.sessionFlow} skin={skin} />
          </>
        );
      })()}

      {isProfessorSession(session) ? (
        <ShowcaseLecturePanel
          title={session.lecture.title}
          thesis={session.lecture.thesis}
          sections={session.lecture.sections}
          socratic={session.lecture.socraticWarmup}
          skin={getProfessorSkin(session.professorMode)}
        />
      ) : null}

      {session.sequenceSteps.length > 0 ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
          <p className="text-[10px] font-bold uppercase text-violet-900">Pre-stage tool sequence</p>
          <ElementGuideCallout elementId="tool-sequence" />
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
                  setProfessorCritique(null);
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
                  setProfessorCritique(null);
                }}
                className="min-h-9 rounded border px-2 text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{currentCard.card.title}</h3>
          <p className="mt-1 text-xs text-kelly-muted">{currentCard.card.prompt}</p>

          <ElementGuideCallout elementId="coach-turn" />

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
              <p className="mt-2 text-[10px] italic text-indigo-800">Coach tip: {TUTOR_ELEMENT_GUIDES["safe-line"].coachTip}</p>
            </div>
          ) : null}

          <ElementGuideCallout elementId="do-not-say" />
          <ul className="mt-3 space-y-1 text-[10px] text-rose-800">
            {currentCard.doNotSay.map((d) => (
              <li key={d.slice(0, 32)}>Do not: {d}</li>
            ))}
          </ul>

          <Link href={currentCard.href} className="mt-3 inline-flex text-xs font-bold text-kelly-navy underline">
            Full drill-down →
          </Link>

          {(session.mode === "deep-30" ||
            session.mode === "tonight-15" ||
            isProfessorSession(session)) && (
            <div className="mt-4 border-t border-kelly-text/10 pt-4">
              <ElementGuideCallout elementId="practice-box" />
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
                {loading
                  ? isProfessorSession(session)
                    ? "Professor grading…"
                    : "Coach reviewing…"
                  : isProfessorSession(session)
                    ? "Get professor rubric"
                    : "Get coach feedback"}
              </button>
            </div>
          )}
        </article>
      ) : null}

      {professorCritique ? (
        <ShowcaseRubricPanel
          overall={professorCritique.rubric.overall}
          verdict={professorCritique.rubric.professorVerdict}
          grades={professorCritique.rubric.grades.map((g) => ({ label: g.label, score: g.score, note: g.note }))}
          mootChallenge={professorCritique.mootChallenge}
          headline={professorCritique.tutorCritique.headline}
        />
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
        <p className="text-[10px] font-bold uppercase text-kelly-subtle">
          {isProfessorSession(session) ? "Professor pedagogy pillars" : "Political debate principles"}
        </p>
        <ul className="mt-2 space-y-2">
          {(isProfessorSession(session) ? session.pedagogyPillars : session.frameworkPrinciples).map((p) => (
            <li key={p.id} className="text-xs">
              <span className="font-bold text-kelly-navy">{p.title}</span>
              <span className="text-kelly-muted"> — {p.rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <p className="text-[10px] font-bold uppercase text-kelly-subtle">Quick tools — when and why</p>
        <ul className="mt-3 space-y-3">
          {TUTOR_TOOL_GUIDES.map((tool) => (
            <li key={tool.toolId} className="rounded-lg border border-kelly-text/10 p-3 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-bold text-kelly-navy">{tool.label}</p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void runTool(tool.toolId)}
                  className="min-h-9 shrink-0 rounded-lg bg-kelly-navy px-3 text-[10px] font-bold text-white disabled:opacity-50"
                >
                  Run
                </button>
              </div>
              <p className="mt-2 text-kelly-muted">
                <span className="font-bold text-kelly-text">Why: </span>
                {tool.whyRunIt}
              </p>
              <p className="mt-1 text-kelly-muted">
                <span className="font-bold text-kelly-text">When: </span>
                {tool.whenToRun}
              </p>
              <p className="mt-1 text-kelly-muted">
                <span className="font-bold text-kelly-text">After: </span>
                {tool.afterYouRun}
              </p>
            </li>
          ))}
        </ul>
        <Link
          href="/admin/intelligence/drill-queue"
          className="mt-3 inline-flex min-h-10 items-center rounded-lg border px-3 text-[10px] font-bold text-kelly-navy"
        >
          Full drill queue →
        </Link>
      </div>

      {error ? <p className="font-bold text-rose-900">{error}</p> : null}
      <p className="text-[10px] text-amber-900 font-bold uppercase">NON_PUBLISHABLE · verify claims before stage</p>
    </section>
  );
}
