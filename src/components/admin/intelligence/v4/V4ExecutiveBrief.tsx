import type { V4ExecutiveBrief, V4ReadinessDimension } from "@/lib/intelligence/v4/debateIntelligenceV4Types";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";

function scoreTone(score: number): string {
  if (score >= 80) return "text-emerald-800";
  if (score >= 65) return "text-amber-800";
  return "text-rose-800";
}

export function V4ExecutiveBriefPanel({
  brief,
  scorecard,
}: {
  brief: V4ExecutiveBrief;
  scorecard: V4ReadinessDimension[];
}) {
  const guide = getSurfaceGuide("executiveBrief");
  return (
    <section className="mb-6 rounded-xl border-2 border-violet-900/20 bg-gradient-to-br from-violet-50/80 to-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-900">Executive brief · v4</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{brief.headline}</h2>
      {guide ? <V4OperatorGuide guide={guide} /> : null}
      <p className="mt-2 text-xs font-semibold text-violet-950">{brief.confidenceLabel} · archive {brief.archiveConfidenceScore}/100</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-navy">Tonight focus</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {brief.tonightFocus.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
          <h3 className="mt-4 text-xs font-bold uppercase text-kelly-navy">Three moves</h3>
          <ol className="mt-2 list-inside list-decimal text-xs text-kelly-muted">
            {brief.threeMoves.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-navy">Readiness scorecard</h3>
          <ul className="mt-2 space-y-2">
            {scorecard.map((dim) => (
              <li key={dim.id} className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-kelly-navy">{dim.label}</span>
                  <span className={`font-heading text-lg font-bold ${scoreTone(dim.score)}`}>{dim.score}</span>
                </div>
                <p className="mt-1 text-kelly-muted">{dim.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
