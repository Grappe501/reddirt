"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DixieVoicePortal } from "@/components/admin/ask-kelly/DixieVoicePortal";
import { AskKellyOnboardingPromptChips } from "@/components/admin/ask-kelly/AskKellyOnboardingPromptChips";
import { AskKellyReadAloudButton } from "@/components/admin/ask-kelly/AskKellyReadAloudButton";
import {
  ASK_KELLY_CANDIDATE_ONBOARDING_PROGRESS_KEY,
  ASK_KELLY_PORTAL,
  ASK_KELLY_PORTAL_GUIDE_PROMPTS,
  ASK_KELLY_PORTAL_STAGE6_READ_ALOUD,
  ASK_KELLY_PORTAL_WRITING_NAV_PROMPTS,
  ASK_KELLY_VOICE_ASSIST_ADMIN_NOTE,
  ASK_KELLY_VOICE_WRITING_PARTNER,
  ASK_KELLY_WHAT_CAN_I_ASK,
} from "@/content/ask-kelly-candidate-onboarding-copy";
import { cn } from "@/lib/utils";

type Progress = { completedStages: number[]; skipped: boolean };

function parseProgress(raw: string | null): Progress {
  const empty: Progress = { completedStages: [], skipped: false };
  if (raw == null) return empty;
  try {
    const p = JSON.parse(raw) as Partial<Progress>;
    const ids = Array.isArray(p.completedStages)
      ? p.completedStages.filter((n): n is number => typeof n === "number" && n >= 1 && n <= 7)
      : [];
    const unique = [...new Set(ids)].sort((a, b) => a - b);
    return { completedStages: unique, skipped: Boolean(p.skipped) };
  } catch {
    return empty;
  }
}

function canUnlockStage(stage: number, completed: number[]): boolean {
  if (stage <= 1) return true;
  for (let i = 1; i < stage; i++) {
    if (!completed.includes(i)) return false;
  }
  return true;
}

const STAGE_IDS = [1, 2, 3, 4, 5, 6, 7] as const;

export function AskKellyOnboardingExperience() {
  const [progress, setProgress] = useState<Progress>(() => ({
    completedStages: [],
    skipped: false,
  }));

  useEffect(() => {
    setProgress(parseProgress(localStorage.getItem(ASK_KELLY_CANDIDATE_ONBOARDING_PROGRESS_KEY)));
  }, []);

  const persist = useCallback((next: Progress) => {
    setProgress(next);
    try {
      localStorage.setItem(ASK_KELLY_CANDIDATE_ONBOARDING_PROGRESS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const { completedStages, skipped } = progress;

  const markComplete = useCallback(
    (stageId: number) => {
      if (!canUnlockStage(stageId, completedStages)) return;
      if (completedStages.includes(stageId)) return;
      persist({
        skipped: progress.skipped,
        completedStages: [...completedStages, stageId].sort((a, b) => a - b),
      });
    },
    [completedStages, persist, progress.skipped],
  );

  const restartWalkthrough = useCallback(() => {
    persist({ completedStages: [], skipped: false });
  }, [persist]);

  const skipForNow = useCallback(() => {
    persist({ ...progress, skipped: true });
  }, [persist, progress]);

  const resumeWalkthrough = useCallback(() => {
    persist({ ...progress, skipped: false });
  }, [persist, progress]);

  const continueOnboarding = useCallback(() => {
    setProgress((prev) => {
      const next = { completedStages: prev.completedStages, skipped: false };
      try {
        localStorage.setItem(ASK_KELLY_CANDIDATE_ONBOARDING_PROGRESS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      queueMicrotask(() => {
        const active = next.completedStages;
        const nextIncomplete = STAGE_IDS.find((id) => canUnlockStage(id, active) && !active.includes(id));
        const target = nextIncomplete ?? (active.length >= 7 ? 7 : 1);
        document.getElementById(`ask-kelly-onboarding-stage-${target}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return next;
    });
  }, []);

  const pct = useMemo(
    () => Math.round((completedStages.length / STAGE_IDS.length) * 100),
    [completedStages.length],
  );

  const StageShell = ({
    stageId,
    children,
    variant = "default",
  }: {
    stageId: number;
    children: ReactNode;
    variant?: "default" | "hero" | "ready";
  }) => {
    const unlocked = canUnlockStage(stageId, completedStages);
    const done = completedStages.includes(stageId);

    return (
      <section
        id={`ask-kelly-onboarding-stage-${stageId}`}
        className={cn(
          "scroll-mt-8 rounded-xl border transition-[opacity,box-shadow] duration-300",
          variant === "hero" &&
            "border-kelly-blue/25 bg-gradient-to-br from-[var(--color-surface-elevated)] via-kelly-page to-kelly-blue/[0.04] shadow-[var(--shadow-soft)]",
          variant === "ready" &&
            "border-kelly-navy/20 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)]",
          variant === "default" && "border-kelly-text/12 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)]",
          !unlocked && "opacity-55",
        )}
      >
        <div className={cn(variant === "hero" ? "p-8 sm:p-10" : "p-6 sm:p-7")}>{children}</div>
        {(unlocked || done) && (
          <div className="border-t border-kelly-text/10 px-6 py-2.5 sm:px-7">
            <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-kelly-text/55">
              {done ? (
                <>
                  Stage {stageId} — <span className="text-kelly-navy">Unlocked</span>
                </>
              ) : unlocked ? (
                <>Stage {stageId}</>
              ) : null}
            </p>
          </div>
        )}
      </section>
    );
  };

  const lockHint = (
    <p className="font-body text-sm text-kelly-text/55">Finish the previous step on this walkthrough to use actions here.</p>
  );

  const p = ASK_KELLY_PORTAL;

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-2xl border border-kelly-navy/15 bg-kelly-text/[0.02] px-6 py-8 shadow-[var(--shadow-soft)] sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-kelly-blue/14 via-transparent to-transparent"
        />
        <div className="relative space-y-5">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-navy/75">Guided onboarding</p>
          <p className="font-heading text-2xl font-bold tracking-tight text-kelly-navy sm:text-3xl">Walkthrough — at your pace</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-kelly-text/12">
            <div
              className="h-full rounded-full bg-kelly-navy/70 transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="font-body text-xs text-kelly-text/60">Walkthrough progress is stored only in this browser—not on the server.</p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              className="rounded-md border border-kelly-navy/25 bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white transition hover:bg-kelly-navy/90"
              onClick={continueOnboarding}
            >
              Continue onboarding
            </button>
            <button
              type="button"
              className="rounded-md border border-kelly-text/20 bg-kelly-fog/50 px-4 py-2 font-body text-sm font-semibold text-kelly-navy transition hover:border-kelly-gold/40"
              onClick={restartWalkthrough}
            >
              Restart walkthrough
            </button>
            <button
              type="button"
              className="rounded-md px-4 py-2 font-body text-sm font-semibold text-kelly-text/80 underline-offset-4 hover:text-kelly-navy hover:underline"
              onClick={skipForNow}
            >
              Skip for now
            </button>
          </div>

          {skipped ? (
            <div className="rounded-lg border border-kelly-gold/35 bg-kelly-gold/10 px-4 py-3 font-body text-sm text-kelly-ink">
              <span className="font-semibold text-kelly-navy">Skipping the guided sequence.</span> Sidebar links stay available anywhere in admin.
              <button
                type="button"
                className="ml-2 font-semibold text-kelly-navy underline-offset-4 hover:underline"
                onClick={resumeWalkthrough}
              >
                Resume walkthrough
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <section
        aria-labelledby="ask-kelly-voice-writing-heading"
        className="rounded-xl border border-kelly-navy/12 bg-gradient-to-br from-[var(--color-surface-elevated)] to-kelly-blue/[0.03] p-6 shadow-[var(--shadow-soft)] sm:p-7"
      >
        <h2 id="ask-kelly-voice-writing-heading" className="font-heading text-xl font-bold text-kelly-navy">
          {ASK_KELLY_VOICE_WRITING_PARTNER.title}
        </h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/90">{ASK_KELLY_VOICE_WRITING_PARTNER.intro}</p>
        <ul className="mt-5 space-y-3">
          {ASK_KELLY_VOICE_WRITING_PARTNER.points.map((line) => (
            <li key={line} className="font-body text-sm leading-relaxed text-kelly-text/88">
              {line}
            </li>
          ))}
        </ul>
        <DixieVoicePortal />
        <AskKellyOnboardingPromptChips
          className="mt-6 border-t border-kelly-text/10 pt-6"
          prompts={[...ASK_KELLY_PORTAL_WRITING_NAV_PROMPTS]}
          heading="Writing and navigation"
          intro="Paste into Ask Kelly on the public site (bottom-right). The guide does not replace the editor or publish for you."
        />
      </section>

      <AskKellyOnboardingPromptChips
        className="rounded-xl border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]"
        prompts={[...ASK_KELLY_PORTAL_GUIDE_PROMPTS]}
        heading="Questions for the site guide"
        intro={p.promptChipsIntro}
      />

      <div className="space-y-6">
        <StageShell stageId={1} variant="hero">
          <header className="space-y-3">
            <p className="font-body text-xs font-bold uppercase tracking-widest text-kelly-navy/70">{p.stage1.label}</p>
            <h2 className="font-heading text-2xl font-bold text-kelly-navy sm:text-[1.75rem]">{p.stage1.title}</h2>
            <p className="font-body text-base leading-relaxed text-kelly-text/90">{p.stage1.lead}</p>
          </header>
          <div className="mt-6 space-y-5">
            {p.stage1.body.map((line) => (
              <p key={line} className="font-body text-sm leading-relaxed text-kelly-text/88">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {canUnlockStage(1, completedStages) ? (
              <button
                type="button"
                disabled={completedStages.includes(1)}
                className={cn(
                  "rounded-md px-5 py-2.5 font-body text-sm font-bold transition",
                  completedStages.includes(1)
                    ? "cursor-default border border-kelly-forest/30 bg-kelly-fog text-kelly-forest"
                    : "bg-kelly-forest text-white hover:bg-kelly-forest/90",
                )}
                onClick={() => markComplete(1)}
              >
                {completedStages.includes(1) ? "Step complete" : "Continue"}
              </button>
            ) : (
              lockHint
            )}
          </div>
        </StageShell>

        <StageShell stageId={2}>
          <p className="font-body text-xs font-bold uppercase tracking-widest text-kelly-navy/65">{p.stage2.label}</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{p.stage2.title}</h2>
          <div className="mt-5 space-y-3">
            {p.stage2.body.map((line) => (
              <p key={line} className="font-body text-sm leading-relaxed text-kelly-text/88">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-7">
            {!canUnlockStage(2, completedStages) ? (
              lockHint
            ) : (
              <button
                type="button"
                disabled={completedStages.includes(2)}
                className={cn(
                  "rounded-md px-4 py-2.5 font-body text-sm font-bold transition",
                  completedStages.includes(2)
                    ? "cursor-default border border-kelly-text/15 bg-transparent text-kelly-text/60"
                    : "bg-kelly-navy text-white hover:bg-kelly-navy/90",
                )}
                onClick={() => markComplete(2)}
              >
                {completedStages.includes(2) ? "Step complete" : "Continue"}
              </button>
            )}
          </div>
        </StageShell>

        <StageShell stageId={3}>
          <p className="font-body text-xs font-bold uppercase tracking-widest text-kelly-navy/65">{p.stage3.label}</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{p.stage3.title}</h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-kelly-text/88">{p.stage3.why}</p>
          <p className="mt-4 font-body text-sm font-medium text-kelly-ink">{p.stage3.flowIntro}</p>
          <ol className="mt-3 list-decimal space-y-2 pl-6 font-body text-sm text-kelly-text/90">
            {p.stage3.flow.map((row) => (
              <li key={row.name}>
                <span className="font-semibold text-kelly-ink">{row.name}: </span>
                {row.detail}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            {!canUnlockStage(3, completedStages) ? (
              lockHint
            ) : (
              <>
                <Link
                  href="/admin/pages"
                  className={cn(
                    "inline-flex items-center rounded-md border px-4 py-2.5 font-body text-sm font-bold transition",
                    completedStages.includes(3)
                      ? "border-kelly-navy/25 bg-transparent text-kelly-navy hover:border-kelly-gold/35"
                      : "border-kelly-navy/30 bg-kelly-navy text-white hover:bg-kelly-navy/90",
                  )}
                >
                  {p.stage3.ctaOpen}
                </Link>
                <button
                  type="button"
                  disabled={completedStages.includes(3)}
                  className={cn(
                    "rounded-md border px-4 py-2.5 font-body text-sm font-semibold transition",
                    completedStages.includes(3)
                      ? "cursor-default border-kelly-text/12 text-kelly-text/50"
                      : "border-kelly-text/20 hover:border-kelly-gold/35",
                  )}
                  onClick={() => markComplete(3)}
                >
                  {completedStages.includes(3) ? "Unlocked" : p.stage3.ctaComplete}
                </button>
              </>
            )}
          </div>
        </StageShell>

        <StageShell stageId={4}>
          <p className="font-body text-xs font-bold uppercase tracking-widest text-kelly-navy/65">{p.stage4.label}</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{p.stage4.title}</h2>
          <div className="mt-4 space-y-3">
            {p.stage4.body.map((line) => (
              <p key={line} className="font-body text-sm leading-relaxed text-kelly-text/88">
                {line}
              </p>
            ))}
          </div>
            <div className="mt-8 flex flex-wrap gap-3">
            {!canUnlockStage(4, completedStages) ? (
              lockHint
            ) : (
              <>
                <Link
                  href="/admin/workbench/ask-kelly-beta"
                  className="inline-flex items-center rounded-md border border-kelly-navy/30 bg-kelly-navy px-4 py-2.5 font-body text-sm font-bold text-white transition hover:bg-kelly-navy/90"
                >
                  {p.stage4.ctaOpen}
                </Link>
                <button
                  type="button"
                  disabled={completedStages.includes(4)}
                  className={cn(
                    "rounded-md border px-4 py-2.5 font-body text-sm font-semibold transition",
                    completedStages.includes(4)
                      ? "cursor-default border-kelly-text/12 text-kelly-text/50"
                      : "border-kelly-text/20 hover:border-kelly-gold/35",
                  )}
                  onClick={() => markComplete(4)}
                >
                  {completedStages.includes(4) ? "Unlocked" : p.stage4.ctaComplete}
                </button>
              </>
            )}
          </div>
        </StageShell>

        <StageShell stageId={5}>
          <p className="font-body text-xs font-bold uppercase tracking-widest text-kelly-navy/65">{p.stage5.label}</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{p.stage5.title}</h2>
          <div className="mt-4 space-y-3">
            {p.stage5.body.map((line) => (
              <p key={line} className="font-body text-sm leading-relaxed text-kelly-text/88">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {!canUnlockStage(5, completedStages) ? (
              lockHint
            ) : (
              <>
                <Link
                  href="/admin/workbench"
                  className="inline-flex items-center rounded-md border border-kelly-navy/30 bg-kelly-navy px-4 py-2.5 font-body text-sm font-bold text-white transition hover:bg-kelly-navy/90"
                >
                  {p.stage5.ctaOpen}
                </Link>
                <button
                  type="button"
                  disabled={completedStages.includes(5)}
                  className={cn(
                    "rounded-md border px-4 py-2.5 font-body text-sm font-semibold transition",
                    completedStages.includes(5)
                      ? "cursor-default border-kelly-text/12 text-kelly-text/50"
                      : "border-kelly-text/20 hover:border-kelly-gold/35",
                  )}
                  onClick={() => markComplete(5)}
                >
                  {completedStages.includes(5) ? "Unlocked" : p.stage5.ctaComplete}
                </button>
              </>
            )}
          </div>
        </StageShell>

        <StageShell stageId={6}>
          <p className="font-body text-xs font-bold uppercase tracking-widest text-kelly-navy/65">{p.stage6.label}</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{p.stage6.title}</h2>
          <div className="mt-4 space-y-3">
            {p.stage6.body.map((line) => (
              <p key={line} className="font-body text-sm leading-relaxed text-kelly-text/88">
                {line}
              </p>
            ))}
          </div>
          <p className="mt-4 font-body text-xs text-kelly-text/65">{ASK_KELLY_VOICE_ASSIST_ADMIN_NOTE}</p>
          <div className="mt-6">
            <AskKellyReadAloudButton text={ASK_KELLY_PORTAL_STAGE6_READ_ALOUD} />
          </div>
          <div className="mt-8">
            {!canUnlockStage(6, completedStages) ? (
              lockHint
            ) : (
              <button
                type="button"
                disabled={completedStages.includes(6)}
                className={cn(
                  "rounded-md px-4 py-2.5 font-body text-sm font-bold transition",
                  completedStages.includes(6)
                    ? "cursor-default border border-kelly-text/15 bg-transparent text-kelly-text/60"
                    : "bg-kelly-navy text-white hover:bg-kelly-navy/90",
                )}
                onClick={() => markComplete(6)}
              >
                {completedStages.includes(6) ? "Step complete" : p.stage6.ctaComplete}
              </button>
            )}
          </div>
        </StageShell>

        <StageShell stageId={7} variant="ready">
          <p className="font-body text-xs font-bold uppercase tracking-widest text-kelly-navy/65">{p.stage7.label}</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">{p.stage7.title}</h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-kelly-text/88">{p.stage7.lead}</p>

          {!canUnlockStage(7, completedStages) ? (
            <div className="mt-8">{lockHint}</div>
          ) : (
            <>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/admin/pages"
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-kelly-navy/30 bg-kelly-navy px-4 py-3 text-center font-body text-sm font-bold text-white transition hover:bg-kelly-navy/90 sm:min-w-[12rem]"
                >
                  {p.stage7.ctaPages}
                </Link>
                <Link
                  href="/admin/workbench/ask-kelly-beta"
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-kelly-text/20 bg-kelly-fog/60 px-4 py-3 text-center font-body text-sm font-bold text-kelly-navy transition hover:border-kelly-gold/35"
                >
                  {p.stage7.ctaBeta}
                </Link>
                <Link
                  href="/"
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-kelly-text/15 bg-transparent px-4 py-3 text-center font-body text-sm font-bold text-kelly-navy transition hover:border-kelly-gold/30"
                  title="Use Ask Kelly from the bottom-right on the public site"
                >
                  {p.stage7.ctaGuide}
                </Link>
              </div>
              <p className="mt-4 font-body text-xs text-kelly-text/60">
                Open the public homepage, then open the site guide in the corner to ask where features live—in your own words.
              </p>
              <button
                type="button"
                disabled={completedStages.includes(7)}
                className={cn(
                  "mt-10 rounded-md border px-5 py-2.5 font-body text-sm font-semibold transition",
                  completedStages.includes(7)
                    ? "cursor-default border-kelly-forest/30 bg-kelly-fog text-kelly-forest"
                    : "border-kelly-forest/40 bg-kelly-forest/10 text-kelly-forest hover:bg-kelly-forest/20",
                )}
                onClick={() => markComplete(7)}
              >
                {completedStages.includes(7) ? "Walkthrough complete" : p.stage7.ctaDone}
              </button>
            </>
          )}
        </StageShell>
      </div>

      <section
        aria-labelledby="what-can-i-ask-portal-ref"
        className="rounded-xl border border-kelly-blue/15 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]"
      >
        <h2 id="what-can-i-ask-portal-ref" className="font-heading text-lg font-bold text-kelly-navy">
          {ASK_KELLY_WHAT_CAN_I_ASK.title}
        </h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">{ASK_KELLY_WHAT_CAN_I_ASK.intro}</p>
        <ul className="mt-5 space-y-5">
          {ASK_KELLY_WHAT_CAN_I_ASK.groups.map((g) => (
            <li key={g.heading}>
              <h3 className="font-heading text-sm font-semibold text-kelly-ink">{g.heading}</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 font-body text-sm leading-relaxed text-kelly-text/88">
                {g.examples.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}