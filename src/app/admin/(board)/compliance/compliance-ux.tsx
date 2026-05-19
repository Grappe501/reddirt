import Link from "next/link";
import type { ReactNode } from "react";
import type { ComplianceStatusTone } from "./components";
import { ComplianceStatusBadge } from "./components";

export type LaunchStatusLabel = "not_ready" | "rehearsal_ready" | "launch_ready" | "filing_ready";

const STATUS_COPY: Record<LaunchStatusLabel, { label: string; meaning: string; tone: ComplianceStatusTone }> = {
  not_ready: {
    label: "Not ready to launch",
    meaning: "Critical sources or gates are missing. Safe to rehearse locally, not to file or go public.",
    tone: "red",
  },
  rehearsal_ready: {
    label: "Rehearsal ready",
    meaning: "Sources and tooling are in place for operator walkthrough. Filing may still be red.",
    tone: "yellow",
  },
  launch_ready: {
    label: "Launch ready",
    meaning: "Checklist passed for campaign operator launch. Treasurer sign-off may still be required for filing.",
    tone: "green",
  },
  filing_ready: {
    label: "Filing ready (system checks)",
    meaning: "Hard gates green in app — compliance officer must still review before any legal filing.",
    tone: "green",
  },
};

export function ComplianceStatusLanguage({
  status,
  score,
  whyNotReady,
}: {
  status: LaunchStatusLabel;
  score?: number;
  whyNotReady?: string[];
}) {
  const copy = STATUS_COPY[status];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <ComplianceStatusBadge label={copy.label} tone={copy.tone} />
        {score !== undefined ? <span className="text-sm font-semibold text-slate-600">Checklist {score}%</span> : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{copy.meaning}</p>
      {whyNotReady?.length ? (
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
          {whyNotReady.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function ComplianceWhatThisMeans({ title = "What this means", children }: { title?: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-slate-50 open:bg-white">
      <summary className="cursor-pointer list-none rounded-2xl px-4 py-3 font-heading text-sm font-bold text-[#0f2744] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="text-slate-400 transition group-open:rotate-90">
            ▸
          </span>
          {title}
        </span>
      </summary>
      <div className="border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </details>
  );
}

export function ComplianceDoThisNext({
  title,
  description,
  href,
  actionLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="rounded-2xl border-2 border-[#0f2744]/25 bg-[#0f2744] p-5 text-white shadow-md">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Do this next</p>
      <h2 className="mt-1 font-heading text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-100">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={href} className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0f2744] hover:bg-slate-100">
          {actionLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className="inline-flex rounded-full border border-white/40 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function CompliancePhaseIndicator({ currentPhase, totalPhases = 8 }: { currentPhase: number; totalPhases?: number }) {
  const labels = ["Sources", "Recon", "Rules", "Queue", "Filing", "Storage", "DB", "Launch"];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Completion plan phase {currentPhase} of {totalPhases}</p>
      <div className="mt-3 flex gap-1">
        {labels.map((label, i) => {
          const phase = i + 1;
          const active = phase === currentPhase;
          const done = phase < currentPhase;
          return (
            <div
              key={label}
              className={`flex-1 rounded-md px-1 py-2 text-center text-[10px] font-bold uppercase ${
                done ? "bg-emerald-100 text-emerald-900" : active ? "bg-[#0f2744] text-white" : "bg-slate-100 text-slate-500"
              }`}
              title={label}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ComplianceProgressByArea({
  areas,
}: {
  areas: { area: string; percentComplete: number; status: string }[];
}) {
  const top = [...areas].sort((a, b) => a.percentComplete - b.percentComplete).slice(0, 8);
  return (
    <ul className="space-y-2">
      {top.map((a) => (
        <li key={a.area}>
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>{a.area}</span>
            <span>{a.percentComplete}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${a.percentComplete >= 80 ? "bg-emerald-500" : a.percentComplete >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${a.percentComplete}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ComplianceRouteCardGrid({
  cards,
}: {
  cards: { href: string; title: string; description: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <Link key={c.href} href={c.href} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#0f2744]/30 hover:shadow-md">
          <p className="font-heading font-bold text-[#0f2744]">{c.title}</p>
          <p className="mt-1 text-xs text-slate-600">{c.description}</p>
        </Link>
      ))}
    </div>
  );
}
