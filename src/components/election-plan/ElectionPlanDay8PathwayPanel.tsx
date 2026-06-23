"use client";

import Link from "next/link";
import { useState } from "react";

import { ElectionPlanDay8PathwayProgressBar } from "@/components/election-plan/ElectionPlanDay8PathwayProgressBar";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import {
  buildDay8PathwaySteps,
  DAY8_DAY7_REVIEW,
  DAY8_EVENING_REVIEW,
  DAY8_MINIMUM_SECTION_IDS,
  DAY8_PM_HANDOFF,
  getFirstDay8PathwayStep,
  type Day8PathwayStep,
} from "@/lib/election-plan/day8-learning-pathway";
import {
  DAY8_ARKANSAS_PEOPLE_FRAME,
  DAY8_CLAIMS_GATE,
  DAY8_HUB_TONIGHT_SUMMARY,
  DAY8_SEVEN_DAY_DEEP_LINKS,
  DAY8_V3_KELLY_MINIMUM_SUMMARY,
} from "@/lib/election-plan/debate-prep-day8-crash-copy";
import { DAY8_SOS_THREE_DOMAINS_FRAME } from "@/lib/election-plan/debate-prep-day8-sos-three-domains";
import {
  DEBATE_PREP_DAY8_RELEASE_LABEL,
  DEBATE_PREP_DAY8_RELEASE_VERSION,
} from "@/lib/election-plan/debate-prep-day8-release";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY8_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

function stepIcon(kind: Day8PathwayStep["kind"]): string {
  if (kind === "section") return "Section";
  return "Close";
}

function isMinimumSection(stepId: string): boolean {
  return (DAY8_MINIMUM_SECTION_IDS as readonly string[]).includes(stepId);
}

export function ElectionPlanDay8StartCard() {
  const first = getFirstDay8PathwayStep();
  const plan = getDebateWeekIntensiveDay(DAY8_ID)!;

  return (
    <section className="ep-pathway-start mb-8">
      <p className="ep-pathway-start-eyebrow text-emerald-800">Day 8 · crash course · debate day AM</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{plan.title}</h2>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      <KellyPageSummary summary={DAY8_V3_KELLY_MINIMUM_SUMMARY} />
      <p className="mt-3 rounded-lg border border-emerald-300/60 bg-emerald-50/40 px-3 py-2 text-xs text-emerald-950">
        {DAY8_SOS_THREE_DOMAINS_FRAME}
      </p>
      <p className="mt-3 rounded-lg border border-emerald-300/60 bg-emerald-50/40 px-3 py-2 text-xs text-emerald-950">
        {DAY8_ARKANSAS_PEOPLE_FRAME}
      </p>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-950">
        {DAY8_CLAIMS_GATE[0]}
      </p>
      <div className="mt-4 rounded-lg border border-[var(--ep-border)] bg-white/80 px-3 py-3">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Deep study — Days 1–7</p>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          This crash course compresses your week. Reopen any day for the full block before you continue.
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {DAY8_SEVEN_DAY_DEEP_LINKS.map((link) => (
            <li key={link.dayId}>
              <Link
                href={link.href}
                className="inline-block rounded-md border border-emerald-200 bg-emerald-50/60 px-2 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Link href={first.href} className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-5">
        Start crash course · {first.sectionLabel ?? "§0"} ({first.minutes} min) →
      </Link>
      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Minimum path: {DAY8_MINIMUM_SECTION_IDS.join(", ")} — toggle full course below if you have time for run-through.
      </p>
      <p className="mt-2 text-[10px] font-mono text-[var(--ep-navy-muted)]">
        {DEBATE_PREP_DAY8_RELEASE_VERSION} · {DEBATE_PREP_DAY8_RELEASE_LABEL}
      </p>
    </section>
  );
}

export function ElectionPlanDay8PathwayHubCard() {
  const first = getFirstDay8PathwayStep();

  return (
    <section className="ep-card mb-8 border-2 border-emerald-300 bg-white p-6">
      <ElectionPlanDay8PathwayProgressBar compact />

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={first.href}
          className="inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
        >
          {first.label} →
        </Link>
        <Link
          href={epDebatePrepDayHref(DAY8_ID)}
          className="inline-block rounded-full border border-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-[var(--ep-navy)]"
        >
          Day 8 overview
        </Link>
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">{DAY8_HUB_TONIGHT_SUMMARY}</p>
    </section>
  );
}

export function ElectionPlanDay8PathwayPanel({
  activeStepId,
  showFullList = true,
  showDay7Review = true,
}: {
  activeStepId?: string;
  showFullList?: boolean;
  showDay7Review?: boolean;
}) {
  const [pathMode, setPathMode] = useState<"minimum" | "full">("minimum");
  const steps = buildDay8PathwaySteps();
  const sectionSteps = steps.filter((s) => s.kind === "section");
  const activeIdx = activeStepId ? steps.findIndex((s) => s.id === activeStepId) : -1;
  const visibleSections =
    pathMode === "minimum" ? sectionSteps.filter((s) => isMinimumSection(s.id)) : sectionSteps;

  return (
    <section className="ep-pathway-panel mb-8">
      <ElectionPlanDay8PathwayProgressBar activeStepId={activeStepId} />

      {activeStepId && activeIdx >= 0 ? (
        <p className="mb-3 text-xs font-bold uppercase text-[var(--ep-navy-muted)]">
          Section {activeIdx + 1} of {steps.length}
        </p>
      ) : null}

      <ElectionPlanDay8StartCard />

      {showDay7Review ? (
        <details className="mb-6 rounded-lg border border-[var(--ep-border)] bg-white/60 p-4">
          <summary className="cursor-pointer text-sm font-bold text-[var(--ep-navy)]">{DAY8_DAY7_REVIEW.title}</summary>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{DAY8_DAY7_REVIEW.body}</p>
          <Link href={DAY8_DAY7_REVIEW.href} className="mt-2 inline-block text-xs font-bold text-[var(--ep-gold)]">
            Review Day 7 →
          </Link>
        </details>
      ) : null}

      {showFullList ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPathMode("minimum")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                pathMode === "minimum"
                  ? "bg-emerald-800 text-white"
                  : "bg-white text-[var(--ep-navy-muted)] ring-1 ring-[var(--ep-border)]"
              }`}
            >
              Minimum path ({DAY8_MINIMUM_SECTION_IDS.length} sections)
            </button>
            <button
              type="button"
              onClick={() => setPathMode("full")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                pathMode === "full"
                  ? "bg-emerald-800 text-white"
                  : "bg-white text-[var(--ep-navy-muted)] ring-1 ring-[var(--ep-border)]"
              }`}
            >
              Full course ({sectionSteps.length} sections)
            </button>
          </div>

          <ol className="ep-pathway-list space-y-2">
            {visibleSections.map((step, index) => {
              const isActive = step.id === activeStepId;
              const stepIdx = steps.findIndex((s) => s.id === step.id);
              const isPast = activeIdx >= 0 && stepIdx < activeIdx;
              const optional = !isMinimumSection(step.id);
              return (
                <li key={step.id}>
                  <Link
                    href={step.href}
                    className={`ep-card ep-card-interactive flex items-center justify-between gap-3 p-4 text-sm ${
                      isActive ? "ring-2 ring-emerald-500 ring-offset-2" : isPast ? "opacity-70" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-emerald-900">
                        {stepIcon(step.kind)} · {step.sectionLabel ?? `Step ${index}`}
                        {optional && pathMode === "full" ? " · skip if tired" : ""}
                      </p>
                      <p className="font-bold text-[var(--ep-navy)]">{step.label}</p>
                      {!isActive ? (
                        <p className="mt-1 truncate text-xs text-[var(--ep-navy-muted)]">{step.teaser}</p>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-mono text-xs text-[var(--ep-navy-muted)]">{step.minutes}m →</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      ) : null}

      <div className="mt-8 rounded-lg border border-[var(--ep-border)] bg-slate-50/80 p-4">
        <p className="text-sm font-bold text-[var(--ep-navy)]">{DAY8_PM_HANDOFF.title}</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{DAY8_PM_HANDOFF.body}</p>
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Course complete check</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ep-navy-muted)]">
          {DAY8_EVENING_REVIEW.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
