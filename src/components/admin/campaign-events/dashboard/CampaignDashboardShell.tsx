import Link from "next/link";
import type { ReactNode } from "react";

export function CampaignDashboardShell({
  eyebrow,
  title,
  description,
  children,
  variant = "default",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  variant?: "default" | "candidate-calm";
}) {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 pb-12">
      <section className="os-hero">
        <p className="os-eyebrow">Kelly Campaign OS · {eyebrow}</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-text">{title}</h1>
        <p className="mt-3 max-w-3xl os-body-muted">{description}</p>
        {variant === "candidate-calm" ? (
          <p className="mt-3 font-body text-xs text-kelly-muted">
            Staff operations:{" "}
            <Link href="/admin/campaign-manager-dashboard" className="font-semibold text-kelly-slate underline">
              Campaign manager board
            </Link>
          </p>
        ) : (
          <nav className="mt-4 flex flex-wrap gap-2 font-body text-sm" aria-label="Dashboard shortcuts">
            <Link href="/admin/candidate-dashboard" className="os-chip">
              Candidate
            </Link>
            <Link href="/admin/campaign-manager-dashboard" className="os-chip">
              Campaign manager
            </Link>
            <Link href="/admin/campaign-events/workbench" className="os-link text-sm">
              Events workbench
            </Link>
            <Link href="/admin/campaign-events/travel-report?month=2026-03" className="os-link text-sm">
              Travel report
            </Link>
            <Link href="/admin/calendar-command-center/kelly" className="os-link text-sm">
              Kelly cockpit
            </Link>
          </nav>
        )}
      </section>
      {children}
    </div>
  );
}

function StatCard({ label, value, href, hint }: { label: string; value: string | number; href?: string; hint?: string }) {
  const inner = (
    <>
      <p className="os-stat-label">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-kelly-text">{value}</p>
      {hint ? <p className="mt-1 os-stat-hint">{hint}</p> : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="os-card block p-4 transition hover:border-kelly-navy/30">
        {inner}
      </Link>
    );
  }
  return <div className="os-card p-4">{inner}</div>;
}

export function DashboardStatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

export { StatCard };

export function DashboardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="os-card p-5">
      <h2 className="font-heading text-base font-bold text-kelly-text">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
