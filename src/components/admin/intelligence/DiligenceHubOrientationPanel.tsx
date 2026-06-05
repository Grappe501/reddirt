import Link from "next/link";
import { computePhase2SurfacesDepthProgress } from "@/lib/intelligence/v4/phase2SurfacesDepth";

export function DiligenceHubOrientationPanel() {
  const phase2 = computePhase2SurfacesDepthProgress();

  return (
    <section className="mb-8 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-white to-rose-50/40 p-6 text-sm leading-relaxed">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-950">Operator briefing</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">Run diligence like a briefing book, not a blank form</h2>
      <p className="mt-3 max-w-3xl text-kelly-muted">
        Each search row below ships with step-by-step operator prose — where to click, what to log, and the counsel
        trigger — even when the status is still NOT_SEARCHED. Staff completes searches in protocol order; the candidate
        never speculates on air.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-kelly-navy/10 bg-white p-4 text-xs">
          <p className="font-bold text-kelly-navy">1 · Defense (Kelly)</p>
          <p className="mt-1 text-kelly-muted">
            Complete before Hammer pivots to personal attack. Incomplete frame: service and SOS implementation — not
            denial.
          </p>
          <Link href="/admin/intelligence/diligence/kelly-grappe" className="mt-2 inline-block font-bold text-kelly-navy underline">
            Kelly checklist →
          </Link>
        </div>
        <div className="rounded-lg border border-kelly-navy/10 bg-white p-4 text-xs">
          <p className="font-bold text-kelly-navy">2 · Offense (Hammer)</p>
          <p className="mt-1 text-kelly-muted">
            Mirror the five-search protocol on the incumbent. Findings feed trap lanes and dossier — not ad-lib stage
            attacks. Optional PACER when civil hits suggest federal litigation.
          </p>
          <Link href="/admin/intelligence/diligence/kim-hammer" className="mt-2 inline-block font-bold text-kelly-navy underline">
            Hammer checklist →
          </Link>
        </div>
        <div className="rounded-lg border border-kelly-navy/10 bg-white p-4 text-xs">
          <p className="font-bold text-kelly-navy">3 · Contrast (Pakko)</p>
          <p className="mt-1 text-kelly-muted">
            Same five searches plus PACKO-01/02 gates. Contrast UI stays locked until finance and quote ledger reach
            PARTIAL minimum.
          </p>
          <Link href="/admin/intelligence/diligence/michael-packo" className="mt-2 inline-block font-bold text-kelly-navy underline">
            Pakko checklist →
          </Link>
        </div>
      </div>
      <p className="mt-4 text-xs text-kelly-subtle">
        Phase 2 surfaces depth: {phase2.diligenceGuidePct}% operator guides · {phase2.fieldBookPhaseAPct}% Field Book
        Phase A articles at briefing bar ({phase2.fieldBookArticlesAtBar}/{phase2.fieldBookPhaseATotal}).
        <Link href="/admin/intelligence/field-book/phase/phase-a" className="ml-2 font-bold text-kelly-navy underline">
          Field Book Phase A →
        </Link>
      </p>
    </section>
  );
}
