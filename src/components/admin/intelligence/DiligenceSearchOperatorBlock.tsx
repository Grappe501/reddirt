import Link from "next/link";
import type { DiligenceSearchOperatorGuide } from "@/lib/intelligence/v4/diligenceSearchOperatorDepth";

export function DiligenceSearchOperatorBlock({ guide }: { guide: DiligenceSearchOperatorGuide }) {
  return (
    <div className="mt-2 rounded-lg border border-sky-200 bg-sky-50/60 p-3 text-[11px] leading-relaxed text-sky-950">
      <p className="font-bold uppercase tracking-wide text-sky-900">How to run this search</p>
      <p className="mt-1 font-semibold text-kelly-navy">{guide.headline}</p>
      <ol className="mt-2 list-inside list-decimal space-y-1 text-kelly-muted">
        {guide.howToRun.map((step) => (
          <li key={step.slice(0, 40)}>{step}</li>
        ))}
      </ol>
      <dl className="mt-3 space-y-2 border-t border-sky-200/80 pt-2">
        <div>
          <dt className="font-bold text-sky-900">What to log</dt>
          <dd className="text-kelly-muted">{guide.whatToLog}</dd>
        </div>
        <div>
          <dt className="font-bold text-rose-900">Counsel trigger</dt>
          <dd className="text-rose-950/90">{guide.counselTrigger}</dd>
        </div>
        <div>
          <dt className="font-bold text-kelly-navy">If incomplete on debate night</dt>
          <dd className="italic text-kelly-text">&ldquo;{guide.incompletePivot}&rdquo;</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/admin/intelligence/field-book/${guide.fieldBookSlug}`}
          className="rounded-full border border-kelly-gold/50 bg-white px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
        >
          Read the canon →
        </Link>
        {guide.relatedRoute ? (
          <Link
            href={guide.relatedRoute.href}
            className="rounded-full border border-kelly-navy/20 bg-white px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
          >
            {guide.relatedRoute.label} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
