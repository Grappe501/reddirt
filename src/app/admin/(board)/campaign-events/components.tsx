import Link from "next/link";
import type { ReactNode } from "react";

export const campaignEventsBasePath = "/admin/campaign-events";

export function CampaignEventsPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
      <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-kelly-slate">{eyebrow}</p>
      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-kelly-text">{title}</h1>
          <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

export function CampaignEventsNav() {
  const links = [
    ["Campaign calendar", "/admin/campaign-calendar/timeline"],
    ["AI tool package", `${campaignEventsBasePath}/ai-tools`],
    ["Travel reimbursement", `${campaignEventsBasePath}/reimbursement?month=2026-04`],
    ["Tentative travel log", `${campaignEventsBasePath}/travel-log?month=2026-04`],
    ["Media approval", `${campaignEventsBasePath}/media-approval`],
    ["Travel report", `${campaignEventsBasePath}/travel-report?month=2026-03`],
    ["Candidate dashboard", "/admin/candidate-dashboard"],
    ["CM dashboard", "/admin/campaign-manager-dashboard"],
    ["Month readiness", `${campaignEventsBasePath}/month-readiness?month=2026-04`],
    ["Month review", `${campaignEventsBasePath}/review?month=2026-03&mode=chronological`],
    ["Calendar sync", `${campaignEventsBasePath}/calendar-sync`],
    ["Workbench", `${campaignEventsBasePath}/workbench`],
    ["March 2026 ledger", `${campaignEventsBasePath}/march-2026`],
    ["Travel ledger (mileage)", "/admin/travel-ledger"],
    ["Calendar command center", "/admin/calendar-command-center"],
  ] as const;
  return (
    <nav className="flex flex-wrap gap-2 rounded-2xl border border-kelly-text/10 bg-kelly-wash p-3" aria-label="Campaign events">
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className="rounded-full border border-kelly-text/10 bg-kelly-page px-3 py-1.5 font-body text-xs font-semibold text-kelly-text/75 transition hover:border-kelly-navy/30 hover:text-kelly-navy"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function InfoBanner({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "amber" }) {
  const cls =
    tone === "amber"
      ? "border-amber-700/20 bg-amber-50 text-amber-950"
      : "border-kelly-navy/20 bg-kelly-navy/[0.06] text-kelly-text/80";
  return <div className={`rounded-2xl border px-4 py-3 font-body text-sm leading-relaxed ${cls}`}>{children}</div>;
}
