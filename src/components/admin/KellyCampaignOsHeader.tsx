import Link from "next/link";
import type { ReactNode } from "react";
import { KELLY_CAMPAIGN_OS_TAGLINE } from "@/lib/campaign-tenancy/single-campaign-mode";

export function KellyCampaignOsHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="rounded-3xl border border-kelly-navy/15 bg-gradient-to-br from-kelly-navy/[0.05] to-kelly-page px-6 py-6 shadow-[var(--shadow-soft)]">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-slate">{KELLY_CAMPAIGN_OS_TAGLINE}</p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-navy md:text-3xl">{title}</h1>
      {description ? <p className="mt-3 max-w-3xl text-sm leading-relaxed text-kelly-text/75">{description}</p> : null}
      <nav className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <Link href="/admin/ai-command-center" className="rounded-full border border-kelly-navy/20 px-3 py-1 text-kelly-navy hover:bg-kelly-navy/5">
          Command center
        </Link>
        <Link href="/admin/campaign-manager-dashboard?month=2026-03" className="rounded-full border px-3 py-1 text-kelly-navy hover:bg-kelly-wash">
          CM dashboard
        </Link>
        <Link href="/admin/onboarding" className="rounded-full border px-3 py-1 text-kelly-navy hover:bg-kelly-wash">
          New here? Onboarding
        </Link>
        <Link href="/admin/ai-command-center/dashboard-builder" className="rounded-full border px-3 py-1 text-kelly-navy hover:bg-kelly-wash">
          Dashboard builder
        </Link>
      </nav>
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
