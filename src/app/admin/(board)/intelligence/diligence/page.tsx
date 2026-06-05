import Link from "next/link";
import { PhaseAUpgradePassPanel } from "@/components/admin/intelligence/PhaseAUpgradePassPanel";
import { OpponentDiligenceChecklistPanel } from "@/components/admin/intelligence/OpponentDiligenceChecklistPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { diligenceHubSummary } from "@/lib/intelligence/v4/kellyCourtDiligenceLog";
import { computePhaseAUpgradePass } from "@/lib/intelligence/v4/phaseAUpgradePass";
import {
  OPPONENT_DILIGENCE_SUBJECTS,
} from "@/lib/intelligence/v4/opponentDiligenceRegistry";
import { loadOpponentDiligenceLog } from "@/lib/intelligence/v4/opponentDiligenceLogStore";
import { getPackoContrastGateStatus } from "@/lib/intelligence/v4/packoContrastGate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function DiligenceHubPage() {
  const summary = diligenceHubSummary();
  const packoGate = getPackoContrastGateStatus();
  const phaseA = computePhaseAUpgradePass();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Phase A · safety & diligence"
        title="Court & financial diligence hub"
        description="Five-search checklist for Kelly (defense), Hammer (offense), and Pakko (contrast gate). Log outcomes with counsel review flags — no stage speculation."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/field-book/phase/phase-a"
          className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Field Book · Phase A
        </Link>
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Verify claims
        </Link>
      </V4PageHeader>

      <PhaseAUpgradePassPanel report={phaseA} compact />

      {packoGate.blocked ? (
        <div className="mb-6 rounded-xl border-2 border-rose-300 bg-rose-50/80 p-4 text-sm text-rose-950">
          <p className="font-bold">{packoGate.message}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((row) => {
          const subject = OPPONENT_DILIGENCE_SUBJECTS.find((s) => s.subjectId === row.subjectId)!;
          return (
            <Link
              key={row.subjectId}
              href={subject.href}
              className="rounded-xl border-2 border-kelly-navy/15 bg-white p-5 hover:border-kelly-navy/40"
            >
              <p className="text-[10px] font-bold uppercase text-kelly-subtle">{subject.eyebrow}</p>
              <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{row.displayName}</h2>
              <p className="mt-2 text-2xl font-bold text-amber-900">{row.pct}%</p>
              <p className="text-xs text-kelly-muted">
                {row.incomplete} searches remaining · Open checklist →
              </p>
            </Link>
          );
        })}
      </div>

      <section className="mt-8 rounded-xl border border-violet-200 bg-violet-50/30 p-5 text-xs">
        <p className="font-bold uppercase text-violet-950">Protocol order (all subjects)</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-kelly-muted">
          <li>Arkansas CourtConnect — civil</li>
          <li>Arkansas CourtConnect — criminal</li>
          <li>Arkansas SOS UCC filings</li>
          <li>Arkansas SOS business entity search</li>
          <li>County assessor — property tax (campaign-relevant parcels only)</li>
          <li>PACER — optional, counsel only (Hammer & Pakko modules)</li>
        </ol>
      </section>

      {OPPONENT_DILIGENCE_SUBJECTS.map((subject) => {
        const log = loadOpponentDiligenceLog(subject.subjectId);
        if (!log) return null;
        return (
          <div key={subject.subjectId} className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading text-xl font-bold text-kelly-navy">{subject.displayName}</h2>
              <Link href={subject.href} className="text-xs font-bold text-kelly-navy underline">
                Full page →
              </Link>
            </div>
            <OpponentDiligenceChecklistPanel log={log} />
          </div>
        );
      })}
    </div>
  );
}
