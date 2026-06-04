import Link from "next/link";
import {
  listSosDebateQuestionsByCategory,
  listSosDebateQuestionSummaries,
} from "@/lib/intelligence/v4/sosDebateQuestionBank";
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
  const summaries = listSosDebateQuestionSummaries();
  const byCategory = listSosDebateQuestionsByCategory();
  const highCount = summaries.filter((q) => q.probability === "HIGH").length;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Expected questions · ACCA panel & debate"
        title={`SOS question bank — ${summaries.length} questions`}
        description="Each drill-down: the question as asked, what Hammer and Pakko will say, exchange handling, and Kelly's full script for speaking first, second, or third."
      >
        <V4BackLinks />
        <Link href="/admin/intelligence/county-clerk-week/acca-summer-conference" className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950">
          ACCA panel prep
        </Link>
        <Link href="/admin/intelligence/opponents/dossiers" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
          Opponent dossiers
        </Link>
      </V4PageHeader>

      <article className="mb-6 rounded-xl border-2 border-violet-200 bg-violet-50/40 p-5 text-sm">
        <p className="font-bold uppercase text-violet-950">How to use this bank</p>
        <p className="mt-2 text-kelly-muted">
          Open any question. Read what may be asked. Rehearse Kelly&apos;s full response for first, second, and third speak order.
          Use the Hammer/Pakko exchange blocks when opponents interrupt or rebut.
        </p>
        <p className="mt-3 text-xs font-semibold text-violet-950">
          {highCount} HIGH-probability · {summaries.length} total · includes CVSGF, VVSG, ACCA, and 2021 package questions
        </p>
      </article>

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
