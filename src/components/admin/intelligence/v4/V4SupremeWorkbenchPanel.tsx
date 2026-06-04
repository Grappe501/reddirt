"use client";

import Link from "next/link";
import type { SupremeWorkbenchPacket } from "@/lib/intelligence/v4/supremeWorkbenchTypes";

function scoreTone(score: number): string {
  if (score >= 80) return "text-emerald-700";
  if (score >= 70) return "text-amber-700";
  return "text-rose-700";
}

function urgencyBadge(urgency: SupremeWorkbenchPacket["priorityActions"][0]["urgency"]): string {
  if (urgency === "critical") return "bg-rose-600 text-white";
  if (urgency === "high") return "bg-amber-500 text-white";
  return "bg-slate-500 text-white";
}

type Props = {
  packet: SupremeWorkbenchPacket;
  variant?: "full" | "compact";
};

export function V4SupremeWorkbenchPanel({ packet, variant = "full" }: Props) {
  const coreDimensions = packet.dimensions.filter((d) => d.id !== "overall");
  const overall = packet.dimensions.find((d) => d.id === "overall");

  if (variant === "compact") {
    return (
      <section className="rounded-xl border-2 border-kelly-navy/25 bg-gradient-to-br from-kelly-navy/5 to-kelly-gold/10 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-navy">Supreme workbench v6</p>
            <p className={`mt-1 font-heading text-4xl font-bold ${scoreTone(packet.overallReadiness)}`}>
              {packet.overallReadiness}%
            </p>
            <p className="mt-1 text-xs text-kelly-muted">Live debate readiness · build {packet.buildProgressPct}%</p>
          </div>
          <Link
            href="/admin/intelligence/supreme-workbench"
            className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white"
          >
            Open supreme workbench →
          </Link>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {coreDimensions.slice(0, 4).map((d) => (
            <Link
              key={d.id}
              href={d.href}
              className="rounded-lg border border-kelly-text/10 bg-white p-2 text-xs hover:border-kelly-navy/30"
            >
              <p className="font-bold text-kelly-navy">{d.label}</p>
              <p className={`font-heading text-lg font-bold ${scoreTone(d.score)}`}>{d.score}</p>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border-2 border-kelly-navy/30 bg-gradient-to-br from-kelly-navy/8 via-white to-violet-50/40 p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-navy">{packet.governanceLabel}</p>
        <div className="mt-4 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-xs font-bold uppercase text-kelly-subtle">Overall debate readiness</p>
            <p className={`font-heading text-6xl font-bold ${scoreTone(packet.overallReadiness)}`}>
              {packet.overallReadiness}%
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-kelly-subtle">Intelligence stack build</p>
            <p className="font-heading text-3xl font-bold text-violet-900">{packet.buildProgressPct}%</p>
          </div>
          <p className="pb-2 text-[10px] text-kelly-subtle">
            {packet.version} · {new Date(packet.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-kelly-navy to-kelly-gold"
            style={{ width: `${packet.overallReadiness}%` }}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Live readiness dimensions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {coreDimensions.map((d) => (
            <Link
              key={d.id}
              href={d.href}
              className="rounded-xl border border-kelly-text/10 bg-white p-4 transition hover:border-kelly-navy/40"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-bold uppercase text-kelly-subtle">{d.label}</p>
                <span className="text-[10px] text-kelly-subtle">{d.trend === "up" ? "↑" : d.trend === "down" ? "↓" : "→"}</span>
              </div>
              <p className={`mt-1 font-heading text-2xl font-bold ${scoreTone(d.score)}`}>{d.score}</p>
              <p className="mt-2 text-[10px] text-kelly-muted">{d.raiseToday}</p>
              {d.weakAreas.length > 0 ? (
                <p className="mt-2 line-clamp-2 text-[10px] text-amber-900">{d.weakAreas[0]}</p>
              ) : null}
            </Link>
          ))}
        </div>
        {overall ? (
          <p className="mt-3 text-xs text-kelly-muted">
            Composite overall: <span className={`font-bold ${scoreTone(overall.score)}`}>{overall.score}/100</span>
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-rose-200 bg-rose-50/30 p-5">
          <h2 className="text-sm font-bold uppercase text-rose-950">Priority actions — fix lowest first</h2>
          <ol className="mt-4 space-y-3">
            {packet.priorityActions.map((a) => (
              <li key={`${a.rank}-${a.title}`} className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${urgencyBadge(a.urgency)}`}>
                    {a.urgency}
                  </span>
                  <span className="font-bold text-kelly-navy">#{a.rank}</span>
                </div>
                <Link href={a.href} className="mt-1 block font-bold text-kelly-navy underline">
                  {a.title}
                </Link>
                <p className="mt-1 text-kelly-muted">{a.detail}</p>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-xl border border-violet-200 bg-violet-50/30 p-5">
          <h2 className="text-sm font-bold uppercase text-violet-950">Tonight&apos;s focus</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-xs text-violet-950">
            {packet.tonightFocus.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
          <h3 className="mt-4 text-xs font-bold uppercase text-rose-900">Do not say</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-rose-900">
            {packet.doNotSay.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </article>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Operator sequences — debate day timeline</h2>
        <div className="mt-4 space-y-4">
          {packet.operatorSequences.map((seq) => (
            <article key={seq.sequenceId} className="rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-kelly-navy px-3 py-1 text-[10px] font-bold uppercase text-white">
                  {seq.phase}
                </span>
                <span className="font-bold text-kelly-navy">{seq.label}</span>
                <span className="text-[10px] text-kelly-subtle">~{seq.estimatedMinutes} min</span>
              </div>
              <ol className="mt-4 space-y-2">
                {seq.steps.map((step, i) => (
                  <li key={step.href} className="flex gap-3 rounded-lg border border-kelly-text/5 bg-kelly-page/30 p-3">
                    <span className="font-bold text-kelly-navy">{i + 1}.</span>
                    <div>
                      <Link href={step.href} className="font-bold text-kelly-navy underline">
                        {step.label}
                      </Link>
                      <p className="mt-1 text-kelly-muted">{step.why}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Opposition strategy — trap lanes</h2>
        <p className="mt-1 text-xs text-kelly-muted">
          Six trap lanes with full drill-downs. Walk Hammer into implementation gaps — not personal attacks.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {packet.oppositionLanes.map((lane) => (
            <Link
              key={lane.id}
              href={lane.href}
              className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs hover:border-kelly-navy/30"
            >
              <p className="font-bold text-kelly-navy">{lane.label}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase text-amber-900">Bait</p>
              <p className="mt-1 text-kelly-muted">{lane.baitLine}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase text-emerald-900">Kelly pivot</p>
              <p className="mt-1 text-kelly-muted">{lane.kellyPivot}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/admin/intelligence/kim-hammer/debate-prep" className="rounded-full border border-kelly-navy/30 px-4 py-2 text-xs font-bold text-kelly-navy">
          Debate prep →
        </Link>
        <Link href="/admin/intelligence/debate-command" className="rounded-full border border-kelly-navy/30 px-4 py-2 text-xs font-bold text-kelly-navy">
          Debate command →
        </Link>
        <Link href="/admin/intelligence/build-progress" className="rounded-full border border-kelly-navy/30 px-4 py-2 text-xs font-bold text-kelly-navy">
          Build progress →
        </Link>
        <Link href="/admin/intelligence/kelly-debate-coaching" className="rounded-full border border-kelly-navy/30 px-4 py-2 text-xs font-bold text-kelly-navy">
          Kelly coaching →
        </Link>
        <Link href="/admin/intelligence/agent-tooling" className="rounded-full border border-violet-800/30 px-4 py-2 text-xs font-bold text-violet-950">
          Agent tooling →
        </Link>
      </section>
    </div>
  );
}
