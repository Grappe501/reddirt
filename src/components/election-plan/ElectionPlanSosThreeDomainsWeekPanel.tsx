import Link from "next/link";

import {
  getSosWeekDayContext,
  isSosWeekPrepDay,
  SOS_THREE_DOMAINS_FRAME,
} from "@/lib/election-plan/debate-prep-sos-three-domains-week";
import type { IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

const DOMAIN_CHIP_CLASS: Record<string, string> = {
  elections: "border-sky-300/70 bg-sky-50/60 text-sky-950 hover:border-sky-500",
  "business-services": "border-amber-300/70 bg-amber-50/60 text-amber-950 hover:border-amber-500",
  "capitol-management": "border-indigo-300/70 bg-indigo-50/60 text-indigo-950 hover:border-indigo-500",
};

export function ElectionPlanSosThreeDomainsWeekPanel({
  dayId,
  variant = "panel",
}: {
  dayId: IntensiveDayId;
  variant?: "panel" | "compact" | "chips";
}) {
  if (!isSosWeekPrepDay(dayId)) return null;
  const ctx = getSosWeekDayContext(dayId)!;

  if (variant === "chips") {
    return (
      <nav aria-label="Three SOS domain shortcuts" className="mb-4 flex flex-wrap gap-2">
        {ctx.domainNav.map((nav) => (
          <Link
            key={nav.domainId}
            href={nav.href}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${DOMAIN_CHIP_CLASS[nav.domainId] ?? "border-[var(--ep-border)] bg-white"}`}
            title={`${nav.navLabel} · picture ${nav.personaHint}`}
          >
            {nav.shortLabel}
            {nav.spotlight ? " ★" : ""}
          </Link>
        ))}
      </nav>
    );
  }

  if (variant === "compact") {
    return (
      <details className="mb-4 rounded-lg border border-teal-300/50 bg-teal-50/30 p-3 text-sm">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-teal-900">
          Three SOS jobs · week balance
        </summary>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{ctx.frameNote}</p>
        <p className="mt-2 rounded-md border border-teal-200/80 bg-white/70 px-2 py-1.5 text-xs text-teal-950">
          {ctx.tonightTrick}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ctx.domainNav.map((nav) => (
            <Link
              key={nav.domainId}
              href={nav.href}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase transition ${DOMAIN_CHIP_CLASS[nav.domainId] ?? ""}`}
            >
              {nav.shortLabel} →
            </Link>
          ))}
        </div>
      </details>
    );
  }

  return (
    <section className="mb-6 rounded-xl border border-teal-300/50 bg-teal-50/25 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-teal-900">Three SOS jobs · week balance</p>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{SOS_THREE_DOMAINS_FRAME}</p>
      <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{ctx.frameNote}</p>
      <p className="mt-3 rounded-lg border border-teal-200 bg-white/70 px-3 py-2 text-xs font-semibold text-teal-950">
        {ctx.tonightTrick}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {ctx.domainNav.map((nav) => (
          <Link
            key={nav.domainId}
            href={nav.href}
            className={`ep-card ep-card-interactive block p-3 text-sm transition ${nav.spotlight ? "ring-2 ring-teal-500/60 ring-offset-1" : ""}`}
          >
            <p className="text-[10px] font-bold uppercase text-teal-900">
              {nav.shortLabel}
              {nav.spotlight ? " · spotlight tonight" : ""}
            </p>
            <p className="mt-1 font-bold text-[var(--ep-navy)]">{nav.navLabel}</p>
            <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Picture {nav.personaHint}</p>
          </Link>
        ))}
      </div>

      <Link
        href={ctx.day8PreviewHref}
        className="mt-4 inline-block text-xs font-bold text-[var(--ep-gold)] hover:underline"
      >
        {ctx.day8PreviewLabel} →
      </Link>
    </section>
  );
}
