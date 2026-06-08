"use client";

import type { ReactNode } from "react";
import type { ShowcaseSkin } from "@/lib/intelligence/v4/debatePrepProfessorShowcaseV6";
import { EVIDENCE_TIER_CHIPS, SHOWCASE_HERO_COPY } from "@/lib/intelligence/v4/debatePrepProfessorShowcaseV6";

export function ShowcaseHeroBanner({ compact }: { compact?: boolean }) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl bg-seminar-hall text-white shadow-xl ${compact ? "p-5" : "p-6 sm:p-8"}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(202,145,61,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-kelly-gold/10 blur-3xl animate-wow-drift-slow" />
      <p className="relative text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-gold">Professor showcase v6</p>
      <h2 className={`relative mt-2 font-heading font-bold text-white ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
        {SHOWCASE_HERO_COPY.headline}
      </h2>
      <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-kelly-inverse-soft">{SHOWCASE_HERO_COPY.subhead}</p>
      <div className="relative mt-4 h-px w-full max-w-md bg-seminar-gold-rule opacity-80" />
      {!compact ? (
        <ul className="relative mt-5 grid gap-3 sm:grid-cols-3">
          {SHOWCASE_HERO_COPY.pillars.map((p) => (
            <li key={p.title} className="rounded-xl border border-white/15 bg-white/5 p-3 backdrop-blur-sm">
              <p className="text-xs font-bold text-kelly-gold">{p.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/85">{p.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function EvidenceTierLegend({ compact }: { compact?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-2"}`}>
      {EVIDENCE_TIER_CHIPS.map((chip) => (
        <div
          key={chip.tier}
          className="group relative"
          title={chip.desc}
        >
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${chip.color}`}>
            {chip.label}
          </span>
          {!compact ? (
            <span className="absolute -bottom-6 left-0 hidden whitespace-nowrap rounded bg-kelly-navy px-2 py-0.5 text-[9px] text-white group-hover:block">
              {chip.desc}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ShowcaseGoldRule({ className = "" }: { className?: string }) {
  return <div className={`h-0.5 w-full bg-seminar-gold-rule ${className}`} aria-hidden />;
}

export function ShowcaseModeHero({
  skin,
  tagline,
  pickIf,
  children,
}: {
  skin: ShowcaseSkin;
  tagline: string;
  pickIf: string;
  children?: ReactNode;
}) {
  const isDark = skin.heroGradient.includes("seminar-hall");
  return (
    <header
      className={`relative overflow-hidden rounded-2xl border-2 ${skin.cardBorder} ${skin.heroGradient} p-5 shadow-lg animate-seminar-reveal`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${skin.badgeBg} ${skin.badgeText}`}>
            <span aria-hidden>{skin.icon}</span>
            {skin.label}
          </span>
          <p className={`mt-3 font-heading text-lg font-bold sm:text-xl ${isDark ? "text-white" : skin.accentText}`}>
            {tagline}
          </p>
          <p className={`mt-1 text-xs italic ${isDark ? "text-kelly-gold/90" : "text-kelly-muted"}`}>{skin.mood}</p>
        </div>
      </div>
      <ShowcaseGoldRule className="mt-4 opacity-70" />
      <p className={`mt-3 text-xs ${isDark ? "text-white/80" : "text-kelly-muted"}`}>
        <span className="font-bold">Pick if: </span>
        {pickIf}
      </p>
      {children}
    </header>
  );
}

export function ShowcaseSessionTimeline({
  steps,
  skin,
}: {
  steps: { step: number; label: string; instruction: string; why: string }[];
  skin: ShowcaseSkin;
}) {
  return (
    <section className={`rounded-2xl border-2 ${skin.cardBorder} ${skin.cardBg} p-5 shadow-md`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Your path tonight</p>
      <div className="relative mt-4 space-y-0">
        <div className="absolute bottom-2 left-[15px] top-2 w-0.5 bg-kelly-gold/40" aria-hidden />
        {steps.map((step, i) => (
          <div
            key={step.step}
            className="relative flex gap-4 pb-5 animate-seminar-reveal"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-kelly-gold bg-white font-heading text-sm font-bold text-kelly-navy shadow-sm">
              {step.step}
            </div>
            <div className="min-w-0 flex-1 rounded-xl border border-kelly-text/8 bg-white/80 p-3 backdrop-blur-sm">
              <p className="text-xs font-bold text-kelly-navy">{step.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-kelly-text">{step.instruction}</p>
              <p className="mt-2 text-[10px] italic text-kelly-subtle">Why: {step.why}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ShowcaseLecturePanel({
  title,
  thesis,
  sections,
  socratic,
  skin,
}: {
  title: string;
  thesis: string;
  sections: { heading: string; bullets: string[] }[];
  socratic: string[];
  skin: ShowcaseSkin;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border-2 ${skin.cardBorder} shadow-lg animate-seminar-glow`}>
      <div className={`border-b-2 ${skin.ruleColor} bg-kelly-navy/5 px-5 py-4`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-900">Professor lecture</p>
        <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{title}</h3>
        <EvidenceTierLegend compact />
      </div>
      <div className={`space-y-4 p-5 ${skin.cardBg}`}>
        <blockquote className="border-l-4 border-kelly-gold pl-4 text-sm font-medium leading-relaxed text-kelly-navy">
          {thesis}
        </blockquote>
        <div className="grid gap-3 lg:grid-cols-2">
          {sections.map((sec, i) => (
            <div
              key={sec.heading}
              className="rounded-xl border border-violet-200/60 bg-white/90 p-4 animate-seminar-reveal"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="font-heading text-xs font-bold uppercase tracking-wide text-violet-900">{sec.heading}</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-kelly-text">
                {sec.bullets.map((b) => (
                  <li key={b.slice(0, 40)} className="flex gap-2">
                    <span className="text-kelly-gold">▸</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {socratic.length > 0 ? (
          <div className="rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-800">Socratic warmup — answer out loud</p>
            <ul className="mt-2 space-y-2">
              {socratic.map((q) => (
                <li key={q.slice(0, 48)} className="flex gap-2 text-sm italic text-violet-950">
                  <span className="font-bold not-italic text-violet-600">?</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ShowcaseRubricPanel({
  overall,
  verdict,
  grades,
  mootChallenge,
  headline,
}: {
  overall: number;
  verdict: string;
  grades: { label: string; score: number; note: string }[];
  mootChallenge: string | null;
  headline: string;
}) {
  const gradeColor = overall >= 85 ? "text-emerald-600" : overall >= 70 ? "text-amber-600" : "text-rose-600";
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-fuchsia-400 bg-gradient-to-br from-fuchsia-50 via-white to-violet-50 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-fuchsia-200 bg-kelly-navy px-5 py-4 text-white">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-gold">Professor rubric</p>
          <p className="mt-1 text-sm font-medium">{verdict}</p>
        </div>
        <div className={`font-heading text-4xl font-bold ${gradeColor}`}>{overall}</div>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {grades.map((g) => (
          <div key={g.label} className="rounded-xl border border-violet-200 bg-white p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-bold text-kelly-navy">{g.label}</span>
              <span className="font-heading text-lg font-bold text-violet-700">{g.score}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-100">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${g.score}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-kelly-muted">{g.note}</p>
          </div>
        ))}
      </div>
      {mootChallenge ? (
        <div className="mx-4 mb-4 rounded-xl border-2 border-fuchsia-300 bg-fuchsia-100/50 p-4">
          <p className="text-[10px] font-bold uppercase text-fuchsia-900">⚖️ Moot cross-examination</p>
          <p className="mt-2 text-sm leading-relaxed text-fuchsia-950">{mootChallenge}</p>
        </div>
      ) : null}
      <p className="border-t border-violet-100 px-5 py-3 text-xs font-bold text-kelly-navy">{headline}</p>
    </article>
  );
}

export function ShowcaseModePickerCard({
  skin,
  label,
  tagline,
  pickIf,
  expanded,
  onToggle,
  onPick,
  loading,
  why,
  when,
  how,
  deliverables,
}: {
  skin: ShowcaseSkin;
  label: string;
  tagline: string;
  pickIf: string;
  expanded: boolean;
  onToggle: () => void;
  onPick: () => void;
  loading: boolean;
  why: string;
  when: string;
  how: string[];
  deliverables: string[];
}) {
  return (
    <div
      className={`group overflow-hidden rounded-2xl border-2 ${skin.cardBorder} ${skin.cardBg} shadow-md transition hover:shadow-xl hover:-translate-y-0.5`}
    >
      <button
        type="button"
        disabled={loading}
        onClick={onPick}
        className="w-full p-5 text-left disabled:opacity-50"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-kelly-gold/40 bg-white text-2xl shadow-inner">
            {skin.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-base font-bold text-kelly-navy">{label}</p>
            <p className="mt-1 text-sm text-kelly-muted">{tagline}</p>
            <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${skin.badgeBg} ${skin.badgeText}`}>
              {pickIf}
            </span>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="w-full border-t border-kelly-text/8 px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-violet-800 hover:bg-violet-50/50"
      >
        {expanded ? "▲ Hide seminar notes" : "▼ Why · when · how"}
      </button>
      {expanded ? (
        <div className="space-y-3 border-t border-kelly-text/8 px-5 pb-5 pt-3 text-xs leading-relaxed text-kelly-muted">
          <p><span className="font-bold text-kelly-navy">Why: </span>{why}</p>
          <p><span className="font-bold text-kelly-navy">When: </span>{when}</p>
          <ol className="list-inside list-decimal space-y-1">
            {how.map((h) => (
              <li key={h.slice(0, 40)}>{h}</li>
            ))}
          </ol>
          <p className="font-bold text-kelly-navy">You&apos;ll get:</p>
          <ul className="list-inside list-disc">
            {deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
