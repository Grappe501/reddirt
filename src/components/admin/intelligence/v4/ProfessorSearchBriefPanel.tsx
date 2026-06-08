"use client";

import Link from "next/link";
import type { IntelProfessorBrief } from "@/lib/intelligence/intelligenceProfessorBrief";
import {
  EvidenceTierLegend,
  ShowcaseGoldRule,
} from "@/components/admin/intelligence/v4/ProfessorSeminarShowcase";

type ProfessorLens = {
  academicFrame: string;
  debateDiscipline: string;
  recommendedDepth: "survey" | "seminar" | "moot";
};

const DEPTH_LABELS = {
  survey: { label: "Survey", color: "bg-sky-600" },
  seminar: { label: "Seminar", color: "bg-violet-600" },
  moot: { label: "Moot court", color: "bg-fuchsia-600" },
} as const;

export function ProfessorSearchBriefPanel({
  brief,
  lens,
  tutorHref,
  onNavigate,
}: {
  brief: IntelProfessorBrief;
  lens: ProfessorLens | null;
  tutorHref: string | null;
  onNavigate?: () => void;
}) {
  const depth = lens ? DEPTH_LABELS[lens.recommendedDepth] : null;

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-kelly-gold/50 shadow-xl animate-seminar-glow">
      <header className="relative bg-seminar-hall px-5 py-5 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(202,145,61,0.2),transparent_50%)]" />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-gold">Professor brief · showcase v6</p>
        <p className="relative mt-3 font-heading text-lg font-bold leading-snug">{brief.thesis}</p>
        {lens ? (
          <div className="relative mt-4 space-y-2 text-xs text-white/90">
            <p>{lens.academicFrame}</p>
            <p className="italic text-kelly-gold/90">{lens.debateDiscipline}</p>
            {depth ? (
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${depth.color}`}>
                Recommended depth: {depth.label}
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="bg-gradient-to-b from-violet-50/80 to-white p-5">
        <EvidenceTierLegend />
        {brief.evidenceTiers.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {brief.evidenceTiers.map((tier) => (
              <div key={tier.tier} className="rounded-xl border border-violet-200 bg-white p-3">
                <p className="text-[9px] font-bold uppercase text-violet-800">{tier.label}</p>
                <ul className="mt-1 space-y-0.5 text-[10px] text-kelly-muted">
                  {tier.items.map((item) => (
                    <li key={item.slice(0, 32)}>▸ {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        <ShowcaseGoldRule className="my-5 opacity-60" />

        <div className="space-y-4">
          {brief.lectureOutline.map((sec, i) => (
            <div
              key={sec.section}
              className="rounded-xl border border-indigo-200/70 bg-white p-4 animate-seminar-reveal"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <p className="font-heading text-xs font-bold uppercase tracking-wide text-indigo-950">{sec.section}</p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-kelly-text">
                {sec.points.map((pt) => (
                  <li key={pt.slice(0, 40)} className="flex gap-2">
                    <span className="text-kelly-gold">▸</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {brief.socraticQuestions.length > 0 ? (
          <div className="mt-4 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/60 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Socratic warmup</p>
            <ul className="mt-2 space-y-2">
              {brief.socraticQuestions.map((q) => (
                <li key={q.slice(0, 48)} className="text-sm italic text-violet-950">
                  <span className="mr-1 font-bold not-italic text-violet-600">?</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {brief.seminarReadingList.length > 0 ? (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-navy">Assigned reading</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {brief.seminarReadingList.map((item, i) => (
                <Link
                  key={`${item.href}-${i}`}
                  href={item.href}
                  onClick={onNavigate}
                  className="group rounded-xl border-l-4 border-kelly-gold bg-white p-3 shadow-sm transition hover:border-kelly-navy hover:shadow-md"
                >
                  <p className="text-sm font-bold text-kelly-navy group-hover:text-violet-900">{item.title}</p>
                  <p className="mt-1 text-[10px] text-kelly-muted">{item.professorNote}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs leading-relaxed text-emerald-950">
          <span className="font-bold">Stage application: </span>
          {brief.stageApplication}
        </p>

        {tutorHref ? (
          <Link
            href={`${tutorHref}?showcase=v6`}
            onClick={onNavigate}
            className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-kelly-navy px-4 text-sm font-bold text-white shadow-lg transition hover:bg-kelly-navy/90"
          >
            <span aria-hidden>📚</span>
            Enter the seminar room →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
