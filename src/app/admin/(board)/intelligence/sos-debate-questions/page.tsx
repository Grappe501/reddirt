import Link from "next/link";
import {
  KELLY_FIELD_TESTED_THEMES,
  listSosDebateQuestionsByCategory,
  listSosDebateQuestionSummaries,
  loadSosDebateQuestionResearch,
  SOS_DEBATE_SPEAK_ORDER_RULE,
  KELLY_UNITY_SPINE,
} from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const card =
  "flex flex-col rounded-xl border-2 border-kelly-gold/25 bg-white p-4 shadow-sm transition active:border-kelly-navy/40 min-h-[100px]";

const probStyle = {
  HIGH: "bg-rose-100 text-rose-900",
  MEDIUM: "bg-amber-100 text-amber-900",
  LOW: "bg-slate-100 text-slate-800",
};

export default function SosDebateQuestionsIndexPage() {
  const research = loadSosDebateQuestionResearch();
  const summaries = listSosDebateQuestionSummaries();
  const byCategory = listSosDebateQuestionsByCategory();
  const highCount = summaries.filter((q) => q.probability === "HIGH").length;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Debate prep · expected questions"
        title="SOS debate question bank"
        description="23 researched questions — lean into field-tested unity themes (transparency, accountability, cross-aisle, non-partisan, public education, Civic Index). Each drill-down covers speak order 1st/2nd/3rd, agree-plus-fresh-add, rebuttal, and claims gate."
        guide={getSurfaceGuide("sos-debate-questions-index")}
      >
        <V4BackLinks />
        <Link href="/admin/intelligence/film-room" className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950">
          Film room
        </Link>
        <Link href="/admin/intelligence/trap-lanes" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
          Trap lanes
        </Link>
        <Link href="/admin/intelligence/debate-depth" className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950">
          Depth guides
        </Link>
      </V4PageHeader>

      {getSurfaceGuide("sos-debate-questions-index") ? (
        <div className="mb-6">
          <V4OperatorGuide guide={getSurfaceGuide("sos-debate-questions-index")!} />
        </div>
      ) : null}

      <article className="mb-6 rounded-xl border-2 border-sky-200 bg-sky-50/50 p-5 text-sm">
        <p className="font-bold uppercase text-sky-950">Field-tested themes — lean in tonight</p>
        <p className="mt-2 text-kelly-muted">{KELLY_UNITY_SPINE}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-kelly-text">
          {KELLY_FIELD_TESTED_THEMES.map((t) => (
            <li key={t.id} className="rounded-lg border border-sky-100 bg-white p-3">
              <span className="font-bold text-kelly-navy">{t.label}</span>
              <p className="mt-1 text-kelly-muted">{t.fieldNote}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-semibold text-amber-900">
          Full drill-down:{" "}
          <Link href="/admin/intelligence/sos-debate-questions/civic-education-unity-accountability" className="underline">
            Transparency · civic education · unity
          </Link>
        </p>
      </article>

      <article className="mb-6 rounded-xl border border-violet-200 bg-violet-50/40 p-5 text-sm">
        <p className="font-bold uppercase text-violet-950">Speak order discipline</p>
        <p className="mt-2 text-kelly-muted">{SOS_DEBATE_SPEAK_ORDER_RULE}</p>
        <p className="mt-3 text-xs text-violet-950">
          {highCount} HIGH-probability questions · {summaries.length} total drill-downs
        </p>
      </article>

      {research ? (
        <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
          <h2 className="font-bold uppercase text-kelly-navy">Research sources (staff)</h2>
          <p className="mt-2 text-kelly-muted">{research.governance}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="font-bold text-kelly-navy">Arkansas SOS office duties</p>
              <ul className="mt-2 list-inside list-disc text-kelly-muted">
                {research.sosOfficeDutiesArkansas.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold text-kelly-navy">2026 three-way notes</p>
              <ul className="mt-2 list-inside list-disc text-kelly-muted">
                {research.arkansas2026ThreeWayNotes.map((n) => (
                  <li key={n.slice(0, 48)}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 font-bold text-kelly-navy">External debate archives</p>
          <ul className="mt-2 space-y-1">
            {research.researchRefs.map((ref) => (
              <li key={ref.id}>
                <a href={ref.url} target="_blank" rel="noreferrer" className="font-semibold text-kelly-navy underline">
                  {ref.source}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {byCategory.map((cat) => (
        <section key={cat.category} className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-kelly-navy">{cat.categoryLabel}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {cat.questions.map((q) => (
              <Link key={q.questionId} href={`/admin/intelligence/sos-debate-questions/${q.questionId}`} className={card}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-violet-800">Q{q.questionNumber}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${probStyle[q.probability]}`}>
                    {q.probability}
                  </span>
                </div>
                <h3 className="mt-2 font-heading text-base font-bold text-kelly-navy">{q.title}</h3>
                <p className="mt-2 flex-1 text-xs text-kelly-muted line-clamp-3">{q.oneLinePrep}</p>
                <p className="mt-3 text-xs font-bold text-kelly-gold">Open drill-down →</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
