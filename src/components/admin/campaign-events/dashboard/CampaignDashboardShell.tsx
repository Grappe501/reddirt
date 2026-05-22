import Link from "next/link";
import type { ReactNode } from "react";

export function CampaignDashboardShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 pb-12">
      <section className="rounded-3xl border border-kelly-navy/12 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-kelly-slate">
          Kelly Campaign OS · {eyebrow}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-text">{title}</h1>
        <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">{description}</p>
        <nav className="mt-4 flex flex-wrap gap-2 font-body text-sm">
          <Link href="/admin/candidate-dashboard" className="rounded-full border px-3 py-1 font-semibold text-kelly-navy">
            Candidate
          </Link>
          <Link href="/admin/campaign-manager-dashboard" className="rounded-full border px-3 py-1 font-semibold text-kelly-navy">
            Campaign manager
          </Link>
          <Link href="/admin/campaign-events/workbench" className="underline">
            Events workbench
          </Link>
          <Link href="/admin/campaign-events/travel-report?month=2026-03" className="underline">
            Travel report
          </Link>
          <Link href="/admin/calendar-command-center/kelly" className="underline">
            Kelly cockpit
          </Link>
        </nav>
      </section>
      {children}
    </div>
  );
}

function StatCard({ label, value, href, hint }: { label: string; value: string | number; href?: string; hint?: string }) {
  const inner = (
    <>
      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-kelly-text">{value}</p>
      {hint ? <p className="mt-1 font-body text-xs text-kelly-text/55">{hint}</p> : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 transition hover:border-kelly-navy/30">
        {inner}
      </Link>
    );
  }
  return <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">{inner}</div>;
}

export function DashboardStatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

export { StatCard };

export function DashboardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
      <h2 className="font-heading text-base font-bold text-kelly-text">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
