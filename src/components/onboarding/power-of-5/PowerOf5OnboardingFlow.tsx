"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { WhatToSayPanel } from "@/components/message-engine";
import { Button } from "@/components/ui/Button";
import {
  CONVERSATION_STARTERS,
  DASHBOARD_PREVIEWS,
  GAMIFICATION_PREVIEW_ITEMS,
  PIPELINE_CARDS,
  PRIVACY_PROMISES,
  REFLECTION_CATEGORIES,
  REFLECTION_PROMPTS,
  TRAINING_GUIDELINES,
} from "@/lib/power-of-5/onboarding-demo";
import { PowerOf5FirstActionDemo } from "./PowerOf5FirstActionDemo";
import { PowerOf5ImpactPanel } from "./PowerOf5ImpactPanel";
import { PowerOf5NetworkPreview } from "./PowerOf5NetworkPreview";
import { MessageHubLinkCard } from "@/components/integrations/MessageHubLinkCard";
import { PowerOf5StepCard } from "./PowerOf5StepCard";
import { cn, focusRing } from "@/lib/utils";

const STEP_LABELS = [
  "Welcome",
  "Power of 5 network",
  "Who are your five?",
  "First action",
  "Conversation training",
  "Impact ladder",
  "Gamification preview",
  "Pipeline preview",
  "Dashboard preview",
  "Privacy promise",
  "Start",
] as const;

const TOTAL = STEP_LABELS.length;

/**
 * Eleven-screen mobile-first onboarding wizard. No persistence, no PII fields.
 */
export function PowerOf5OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [demoCount, setDemoCount] = useState(0);

  const goNext = useCallback(() => setStep((s) => Math.min(TOTAL - 1, s + 1)), []);
  const goBack = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const pct = Math.round(((step + 1) / TOTAL) * 100);

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col pb-24 sm:pb-28">
      <div className="sticky top-0 z-20 border-b border-kelly-text/10 bg-kelly-page/95 backdrop-blur-sm">
        <ContentContainer className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-navy/70">
              Power of 5 · prototype
            </p>
            <p className="text-xs font-semibold text-kelly-text/70" aria-live="polite">
              Screen {step + 1} of {TOTAL}
            </p>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-kelly-text/10"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={TOTAL}
            aria-label="Onboarding progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-kelly-gold to-kelly-navy/70 transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-kelly-text/60">{STEP_LABELS[step]}</p>
        </ContentContainer>
      </div>

      <ContentContainer wide className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-2xl">
          {step === 0 ? (
            <section aria-labelledby="p5-welcome-title" className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 1 · Vision</p>
              <h1 id="p5-welcome-title" className="font-heading text-2xl font-bold leading-tight text-kelly-navy sm:text-3xl">
                People talk to people
              </h1>
              <p className="font-body text-base leading-relaxed text-kelly-text/90">
                This movement grows <strong>eyeball-to-eyeball</strong>, neighbor-to-neighbor, family-to-family, coworker-to-coworker.
              </p>
              <p className="rounded-xl border border-kelly-gold/35 bg-kelly-gold/10 px-4 py-3 font-body text-sm font-semibold leading-relaxed text-kelly-navy">
                Build your five. Move your precinct. Grow the county.
              </p>
              <p className="font-body text-sm leading-relaxed text-kelly-text/80">
                <strong className="text-kelly-text">What you should feel:</strong> “I know why I matter, who I should talk to, and what to do
                next.”
              </p>
              <p className="text-xs leading-relaxed text-kelly-text/65">
                Onboarding should not feel like joining software. It should feel like joining a <strong>living network</strong> of trusted
                relationships — where you can see how one action moves a precinct, county, region, and state. Everything here is labeled{" "}
                <strong>demo / preview</strong>; we are not collecting names or voter data on this flow.
              </p>
              <div className="mt-6">
                <Button type="button" variant="primary" onClick={goNext} className="w-full sm:w-auto">
                  Start building your five
                </Button>
              </div>
            </section>
          ) : null}

          {step === 1 ? (
            <section aria-labelledby="p5-network-title" className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 2 · The model</p>
              <h2 id="p5-network-title" className="font-heading text-xl font-bold text-kelly-navy sm:text-2xl">
                The Power of 5, visually
              </h2>
              <p className="font-body text-sm leading-relaxed text-kelly-text/85">
                You → five people → their five → neighborhood → precinct → city → county → region → state.
              </p>
              <p className="font-body text-sm font-medium leading-relaxed text-kelly-text/90">
                You are not starting with strangers. You are starting with people who already know and trust you.
              </p>
              <PowerOf5NetworkPreview />
            </section>
          ) : null}

          {step === 2 ? (
            <section aria-labelledby="p5-who-title" className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 3 · Reflection</p>
              <h2 id="p5-who-title" className="font-heading text-xl font-bold text-kelly-navy sm:text-2xl">
                Who are your five?
              </h2>
              <p className="font-body text-sm leading-relaxed text-kelly-text/85">
                Think in categories — <strong>no real names required</strong> in this prototype. When you are ready in the live product, you will
                add people with consent and care.
              </p>
              <ul className="flex flex-wrap gap-2">
                {REFLECTION_CATEGORIES.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-kelly-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-kelly-text"
                  >
                    {c}
                  </li>
                ))}
              </ul>
              <div className="grid gap-2 sm:grid-cols-2">
                {REFLECTION_PROMPTS.map((q) => (
                  <div
                    key={q}
                    className="rounded-xl border border-kelly-text/10 bg-kelly-page/90 p-3 text-sm font-medium leading-snug text-kelly-text"
                  >
                    {q}
                  </div>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex min-h-[88px] flex-col justify-center rounded-xl border-2 border-dashed border-kelly-text/20 bg-white/60 p-3 text-center"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-kelly-text/45">Slot {i + 1}</p>
                    <p className="mt-1 text-[11px] text-kelly-text/55">Name later — not stored here.</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section aria-labelledby="p5-action-title" className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 4 · Momentum</p>
              <h2 id="p5-action-title" className="font-heading text-xl font-bold text-kelly-navy sm:text-2xl">
                First action (simulation)
              </h2>
              <p className="font-body text-sm leading-relaxed text-kelly-text/85">
                Tap once to feel immediate progress — from <strong>0/5</strong> to <strong>1/5</strong> — and the “20% started” message. This
                builds emotional momentum before any real data entry ships.
              </p>
              <PowerOf5FirstActionDemo
                count={demoCount}
                onAdd={() => setDemoCount((c) => Math.min(5, c + 1))}
                onReset={() => setDemoCount(0)}
              />
            </section>
          ) : null}

          {step === 4 ? (
            <section aria-labelledby="p5-train-title" className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 5 · Eyeball to eyeball</p>
              <h2 id="p5-train-title" className="font-heading text-xl font-bold text-kelly-navy sm:text-2xl">
                Micro-training: listen first
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <PowerOf5StepCard title="Ground rules" badge="Training">
                  <ul className="list-disc space-y-2 pl-4">
                    {TRAINING_GUIDELINES.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </PowerOf5StepCard>
                <PowerOf5StepCard title="Sample prompts" badge="Examples">
                  <ul className="space-y-2">
                    {CONVERSATION_STARTERS.map((s) => (
                      <li
                        key={s}
                        className="rounded-lg border border-kelly-text/10 bg-white/80 px-3 py-2 text-kelly-text/90 italic"
                      >
                        “{s}”
                      </li>
                    ))}
                  </ul>
                </PowerOf5StepCard>
              </div>
              <div className="mt-6">
                <WhatToSayPanel compact />
              </div>
            </section>
          ) : null}

          {step === 5 ? (
            <section aria-labelledby="p5-impact-title">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 6 · Geography</p>
              <span id="p5-impact-title" className="sr-only">
                Impact ladder
              </span>
              <PowerOf5ImpactPanel />
            </section>
          ) : null}

          {step === 6 ? (
            <section aria-labelledby="p5-game-title" className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 7 · Preview only</p>
              <h2 id="p5-game-title" className="font-heading text-xl font-bold text-kelly-navy sm:text-2xl">
                Gamification — cooperative, not cruel
              </h2>
              <p className="font-body text-sm leading-relaxed text-kelly-text/85">
                Future mechanics sketched for morale: streaks, badges, and shared goals.{" "}
                <strong>No shame-based rankings.</strong> No public exposure of private voter data.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {GAMIFICATION_PREVIEW_ITEMS.map((item) => (
                  <PowerOf5StepCard key={item.title} title={item.title} badge="Future idea">
                    <p>{item.description}</p>
                  </PowerOf5StepCard>
                ))}
              </div>
            </section>
          ) : null}

          {step === 7 ? (
            <section aria-labelledby="p5-pipe-title" className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 8 · Pipelines</p>
              <h2 id="p5-pipe-title" className="font-heading text-xl font-bold text-kelly-navy sm:text-2xl">
                How your five fill the work
              </h2>
              <p className="font-body text-sm leading-relaxed text-kelly-text/85">
                Every pipeline below answers: <strong>what it is</strong>, <strong>why it matters</strong>, and{" "}
                <strong>how one person helps fill it</strong>.
              </p>
              <div className="max-h-[min(420px,55vh)] space-y-3 overflow-y-auto pr-1 sm:max-h-[min(520px,50vh)]">
                {PIPELINE_CARDS.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page/95 p-4 shadow-sm">
                    <p className="font-heading text-base font-bold text-kelly-navy">{p.title}</p>
                    <dl className="mt-2 space-y-1.5 text-sm text-kelly-text/85">
                      <div>
                        <dt className="font-bold text-kelly-text/90">What it is</dt>
                        <dd className="mt-0.5">{p.what}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-kelly-text/90">Why it matters</dt>
                        <dd className="mt-0.5">{p.why}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-kelly-text/90">How one person helps</dt>
                        <dd className="mt-0.5">{p.howP5}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {step === 8 ? (
            <section aria-labelledby="p5-dash-title" className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 9 · Where this goes</p>
              <h2 id="p5-dash-title" className="font-heading text-xl font-bold text-kelly-navy sm:text-2xl">
                Dashboard preview
              </h2>
              <p className="font-body text-sm leading-relaxed text-kelly-text/85">
                You are entering a <strong>system</strong>, not filling out a dead form. Routes mix live placeholders and future URL patterns —
                read the labels before you click.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {DASHBOARD_PREVIEWS.map((d) => (
                  <div key={d.route} className="rounded-2xl border border-kelly-navy/15 bg-white p-4 shadow-sm">
                    <p className="font-heading text-sm font-bold text-kelly-navy">{d.label}</p>
                    <p className="mt-1.5 text-sm text-kelly-text/80">{d.description}</p>
                    <p className="mt-2 font-mono text-[10px] text-kelly-text/55 break-all">{d.route}</p>
                    {d.isFuture ? (
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-amber-800/90">Future route</p>
                    ) : d.route.startsWith("/dashboard") ? (
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-kelly-navy/70">Placeholder page</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {step === 9 ? (
            <section aria-labelledby="p5-privacy-title" className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 10 · Trust</p>
              <h2 id="p5-privacy-title" className="font-heading text-xl font-bold text-kelly-navy sm:text-2xl">
                Privacy and trust promise
              </h2>
              <p className="font-body text-sm leading-relaxed text-kelly-text/85">
                Visible commitments for anyone stepping into relational organizing through this stack.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-kelly-text/85">
                {PRIVACY_PROMISES.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {step === 10 ? (
            <section aria-labelledby="p5-final-title" className="space-y-5 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy/65">Screen 11 · Next step</p>
              <h2 id="p5-final-title" className="font-heading text-2xl font-bold text-kelly-navy sm:text-3xl">
                Build your five. Move your precinct. Grow the county.
              </h2>
              <p className="mx-auto max-w-md font-body text-sm italic leading-relaxed text-kelly-text/75">
                The best onboarding does not explain the whole system. It makes someone want to take the first step.
              </p>
              <MessageHubLinkCard
                className="mx-auto mt-2 max-w-md text-left"
                title="What to Say — message hub"
                description={
                  <>
                    Pick up the <strong>weekly line</strong>, <strong>share packets</strong>, and county-colored prompts in one place. Matches the
                    listening-first scripts you previewed in training — still <strong>demo / seed</strong> until approvals wire through.
                  </>
                }
              />
              <div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                <Button type="button" variant="primary" className="w-full sm:w-auto" onClick={() => setStep(2)}>
                  Start Power of 5
                </Button>
                <Button href="/county-briefings/pope/v2" variant="secondary" className="w-full sm:w-auto">
                  View Pope County sample dashboard
                </Button>
                <Button href="/organizing-intelligence" variant="outline" className="w-full sm:w-auto">
                  Organizing intelligence
                </Button>
              </div>
              <p className="text-sm text-kelly-text/75">
                Volunteer paths:{" "}
                <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/get-involved">
                  Get involved
                </Link>
                .
              </p>
            </section>
          ) : null}
        </div>
      </ContentContainer>

      <nav
        id="p5-flow-nav"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-kelly-text/10 bg-kelly-page/98 px-3 pt-3 backdrop-blur-md sm:px-4"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
        aria-label="Onboarding steps"
      >
        <ContentContainer wide className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-12 min-w-[6.5rem] shrink-0 px-4 sm:min-h-0 sm:min-w-[5.5rem]"
            onClick={goBack}
            disabled={step === 0}
          >
            Back
          </Button>
          <p className="hidden min-w-0 flex-1 truncate text-center text-xs text-kelly-text/65 sm:block">
            {STEP_LABELS[step]} · demo / preview
          </p>
          {step < TOTAL - 1 ? (
            <Button
              type="button"
              variant="primary"
              className="min-h-12 min-w-[6.5rem] shrink-0 px-4 sm:min-h-0 sm:min-w-[5.5rem]"
              onClick={goNext}
            >
              Next
            </Button>
          ) : (
            <Button href="/get-involved" variant="primary" className="min-h-12 min-w-[6.5rem] shrink-0 px-4 sm:min-h-0 sm:min-w-[5.5rem]">
              Done
            </Button>
          )}
        </ContentContainer>
      </nav>
    </div>
  );
}
