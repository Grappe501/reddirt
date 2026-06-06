import Link from "next/link";
import type { DiligenceSubjectRunbook } from "@/lib/intelligence/v4/diligenceOperatorRunbook";

export function DiligenceRunbookPanel({ subjects }: { subjects: DiligenceSubjectRunbook[] }) {
  return (
    <section className="mb-8 rounded-xl border border-sky-300/80 bg-gradient-to-br from-sky-50/50 to-white p-6">
      <h2 className="font-heading text-xl font-bold text-kelly-navy">Five-search diligence operator runbook</h2>
      <p className="mt-2 text-sm text-kelly-muted">
        Counsel-safe operator steps — logs stay NOT_SEARCHED until staff executes searches. Incomplete pivots govern
        stage lines; never fabricate CLEAN status.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {subjects.map((subject) => (
          <article key={subject.subjectId} className="rounded-lg border border-kelly-navy/10 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-kelly-navy">{subject.displayName}</h3>
              <span className="text-[10px] font-bold uppercase text-kelly-subtle">{subject.completionPct}% logged</span>
            </div>
            <p className="mt-2 text-xs text-kelly-muted">{subject.incompletePivot}</p>
            <ol className="mt-3 list-inside list-decimal space-y-1 text-xs text-kelly-text">
              {subject.steps.map((step) => (
                <li key={step.order}>
                  <span className="font-semibold">{step.label}</span> — {step.detail}
                </li>
              ))}
            </ol>
            <Link
              href={subject.href}
              className="mt-3 inline-block text-[10px] font-bold uppercase text-sky-800 underline"
            >
              Open diligence log →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
