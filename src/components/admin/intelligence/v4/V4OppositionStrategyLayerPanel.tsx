"use client";

import Link from "next/link";
import { EvidenceHonestyBadgeFromText } from "@/components/admin/intelligence/EvidenceHonestyBadge";
import type { OppositionStrategyLayerPacket } from "@/lib/intelligence/v4/oppositionStrategyLayerTypes";
import type {
  Integrity2021PackageDepth,
  Petition2025ClusterDepth,
} from "@/lib/intelligence/v4/integrityPackageDepth";

function scoreTone(score: number): string {
  if (score >= 80) return "text-emerald-700";
  if (score >= 70) return "text-amber-700";
  return "text-rose-700";
}

type Props = {
  packet: OppositionStrategyLayerPacket;
  integrity2021: Integrity2021PackageDepth;
  petition2025: Petition2025ClusterDepth;
  variant?: "full" | "compact";
};

export function V4OppositionStrategyLayerPanel({
  packet,
  integrity2021,
  petition2025,
  variant = "full",
}: Props) {
  if (variant === "compact") {
    return (
      <section className="rounded-xl border-2 border-rose-800/20 bg-gradient-to-br from-rose-50/60 to-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-950">Opposition strategy v6.2</p>
            <p className={`mt-1 font-heading text-4xl font-bold ${scoreTone(packet.overallOffenseReadiness)}`}>
              {packet.overallOffenseReadiness}%
            </p>
            <p className="mt-1 text-xs text-kelly-muted">
              {packet.trapLanes.length} trap lanes · {packet.offensiveMoves.length} offensive moves ·{" "}
              {packet.curatedBillPct}% curated bills
            </p>
          </div>
          <Link
            href="/admin/intelligence/opposition-strategy"
            className="rounded-full bg-rose-900 px-4 py-2 text-xs font-bold text-white"
          >
            Open opposition strategy →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border-2 border-rose-900/25 bg-gradient-to-br from-rose-50/80 via-white to-kelly-page/30 p-6">
        <EvidenceHonestyBadgeFromText text={packet.governanceLabel} showMessage />
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-rose-950">{packet.governanceLabel}</p>
        <div className="mt-4 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-xs font-bold uppercase text-kelly-subtle">Offense readiness</p>
            <p className={`font-heading text-6xl font-bold ${scoreTone(packet.overallOffenseReadiness)}`}>
              {packet.overallOffenseReadiness}%
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-kelly-subtle">Curated bill playbooks</p>
            <p className="font-heading text-3xl font-bold text-kelly-navy">{packet.curatedBillPct}%</p>
          </div>
          <p className="pb-2 text-[10px] text-kelly-subtle">
            {packet.version} · {new Date(packet.generatedAt).toLocaleString()}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-violet-200 bg-violet-50/30 p-5 text-xs">
          <h2 className="text-sm font-bold uppercase text-violet-950">{integrity2021.headline}</h2>
          <p className="mt-2 text-kelly-muted">{integrity2021.plainEnglishSummary}</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-violet-950">
            {integrity2021.narrativeArc.slice(0, 4).map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {integrity2021.billAnchors.map((b) => (
              <Link
                key={b.billNumber}
                href={b.actProofHref}
                className="rounded-lg border border-kelly-text/10 bg-white p-2 hover:border-kelly-navy/30"
              >
                <p className="font-bold text-kelly-navy">
                  {b.billNumber} · Act {b.actNumber}
                </p>
                <p className="text-[10px] text-kelly-muted">{b.theme}</p>
              </Link>
            ))}
          </div>
          <p className="mt-3 font-bold text-emerald-900">Trap setup</p>
          <p className="mt-1 text-kelly-muted">{integrity2021.debateTrap.setupQuestion}</p>
          <p className="mt-2 font-bold text-kelly-navy">Kelly pivot: {integrity2021.debateTrap.kellyPivot}</p>
        </article>

        <article className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 text-xs">
          <h2 className="text-sm font-bold uppercase text-amber-950">{petition2025.headline}</h2>
          <p className="mt-2 text-kelly-muted">{petition2025.plainEnglishSummary}</p>
          <p className="mt-3 font-bold text-rose-900">Hammer frame (expect)</p>
          <p className="text-kelly-muted">{petition2025.hammerExpectedFrame}</p>
          <p className="mt-3 font-bold text-emerald-900">Kelly offensive lead</p>
          <p className="text-kelly-muted">{petition2025.kellyOffensiveLead}</p>
          <div className="mt-4 grid gap-2">
            {petition2025.billAnchors.map((b) => (
              <Link key={b.billNumber} href={b.actProofHref} className="rounded-lg border bg-white p-2 font-bold text-kelly-navy underline">
                {b.billNumber}
                {b.actNumber ? ` · Act ${b.actNumber}` : ""} — {b.theme}
              </Link>
            ))}
          </div>
          <Link href={petition2025.trapLaneHref} className="mt-3 inline-block font-bold text-kelly-navy underline">
            2021 vs 2025 pivot trap lane →
          </Link>
        </article>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Six trap lanes — offense map</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {packet.trapLanes.map((lane) => (
            <Link
              key={lane.id}
              href={lane.href}
              className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs hover:border-rose-800/30"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-kelly-navy">{lane.title}</p>
                <span className={`font-heading text-lg font-bold ${scoreTone(lane.stepCoveragePct)}`}>
                  {lane.stepCoveragePct}%
                </span>
              </div>
              <p className="mt-2 text-[10px] uppercase text-amber-900">Bait</p>
              <p className="text-kelly-muted">{lane.baitLine}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Six offensive moves — respond · rebut · lead</h2>
        <div className="mt-4 space-y-3">
          {packet.offensiveMoves.map((move) => (
            <article key={move.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
              <p className="font-bold text-kelly-navy">{move.name}</p>
              <p className="mt-1 text-[10px] uppercase text-kelly-subtle">When</p>
              <p className="text-kelly-muted">{move.whenToUse}</p>
              <p className="mt-2 text-[10px] uppercase text-emerald-900">Execution</p>
              <p className="text-kelly-muted">{move.execution}</p>
              <p className="mt-2 text-[10px] uppercase text-violet-900">Second round</p>
              <p className="text-kelly-muted">{move.secondRound}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-sky-200 bg-sky-50/30 p-5 text-xs">
          <h2 className="text-sm font-bold uppercase text-sky-950">Kelly defense vectors</h2>
          <ul className="mt-3 space-y-2">
            {packet.defenseVectors.map((v) => (
              <li key={v.id} className="rounded-lg border bg-white p-3">
                <p className="font-bold text-kelly-navy">{v.title}</p>
                <p className="mt-1 text-[10px] text-kelly-subtle">
                  {v.prepPriority} · {v.verificationStatus}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-teal-200 bg-teal-50/30 p-5 text-xs">
          <h2 className="text-sm font-bold uppercase text-teal-950">Cross-exam starters</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-kelly-muted">
            {packet.crossExamStarters.map((q) => (
              <li key={q.slice(0, 48)}>{q}</li>
            ))}
          </ul>
          <Link href="/admin/intelligence/film-room" className="mt-4 inline-block font-bold text-kelly-navy underline">
            Full cross-exam bank in film room →
          </Link>
        </article>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Debate-day offense sequence</h2>
        <div className="mt-4 space-y-4">
          {packet.debateDayOffenseSequence.map((seq) => (
            <article key={seq.phase} className="rounded-xl border bg-white p-4 text-xs">
              <p className="font-bold text-kelly-navy">
                {seq.phase} · ~{seq.minutes} min
              </p>
              <ol className="mt-2 space-y-2">
                {seq.steps.map((step) => (
                  <li key={step.href}>
                    <Link href={step.href} className="font-bold text-kelly-navy underline">
                      {step.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
