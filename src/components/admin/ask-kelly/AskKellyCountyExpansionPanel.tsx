import Link from "next/link";
import { ASK_KELLY_COUNTY_EXPANSION_PANEL } from "@/content/ask-kelly-candidate-onboarding-copy";

export function AskKellyCountyExpansionPanel() {
  const p = ASK_KELLY_COUNTY_EXPANSION_PANEL;

  return (
    <section
      aria-labelledby="county-expansion-heading"
      className="rounded-xl border border-kelly-navy/16 bg-gradient-to-b from-kelly-blue/[0.05] to-[var(--color-surface-elevated)] p-5 sm:p-6"
    >
      <h2 id="county-expansion-heading" className="font-heading text-lg font-bold text-kelly-navy sm:text-xl">
        {p.sectionTitle}
      </h2>
      <p className="mt-2 font-body text-xs leading-relaxed text-kelly-text/78 sm:text-sm">{p.sectionLead}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-lg border border-emerald-200/60 bg-kelly-fog/30 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded px-1.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-emerald-950 ring-1 ring-emerald-200/80 bg-emerald-100/90">
              {p.pilotBadge}
            </span>
            <h3 className="font-heading text-base font-bold text-kelly-navy">{p.pilotTitle}</h3>
          </div>
          <p className="mt-2 font-body text-xs leading-relaxed text-kelly-text/82">{p.pilotBody}</p>
          <ul className="mt-4 space-y-2">
            {p.pilotLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-[40px] items-center font-body text-xs font-semibold text-kelly-slate underline-offset-2 hover:underline sm:min-h-0"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-kelly-text/14 border-dashed bg-kelly-text/[0.02] p-4">
          <h3 className="font-heading text-sm font-bold text-kelly-navy">{p.buildQueueTitle}</h3>
          <p className="mt-1.5 font-body text-[11px] leading-relaxed text-kelly-text/72">{p.buildQueueLead}</p>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 xs:grid-cols-2 sm:grid-cols-2">
            {p.counties.map((name) => (
              <li
                key={name}
                className="flex items-center justify-between gap-2 rounded-md border border-kelly-text/10 bg-[var(--color-surface-elevated)] px-2.5 py-1.5"
              >
                <span className="font-body text-xs font-semibold text-kelly-text">{name}</span>
                <span className="shrink-0 rounded bg-kelly-text/8 px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-wide text-kelly-text/65">
                  Planned
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 font-body text-[11px] leading-relaxed text-kelly-text/65">{p.staffNote}</p>
      <p className="mt-3">
        <Link
          href={p.adminIntelLink.href}
          className="inline-flex min-h-[44px] items-center font-body text-xs font-semibold text-kelly-slate underline-offset-2 hover:underline sm:min-h-0"
        >
          {p.adminIntelLink.label}
        </Link>
      </p>
    </section>
  );
}
