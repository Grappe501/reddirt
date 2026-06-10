"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { VICTORY_OS_NAV, vos, type VictoryOsNavId } from "./victory-os-tokens";

function resolveActiveNav(pathname: string, view: string | null): VictoryOsNavId {
  if (pathname.startsWith("/admin/election-day")) return "election-day";
  if (pathname.startsWith("/admin/victory-board")) return "board";
  if (pathname.startsWith("/admin/daily-brief")) return "daily";
  if (pathname.startsWith("/admin/mission-brief")) {
    if (view === "map") return "map";
    if (view === "tactics") return "tactics";
    return "brief";
  }
  return "brief";
}

function navHref(base: string, weekKey?: string): string {
  if (!weekKey) return base;
  if (base.includes("?")) return `${base}&week=${weekKey}`;
  if (base.includes("view=")) return `${base}&week=${weekKey}`;
  return `${base}?week=${weekKey}`;
}

export function VictoryOsShell({
  children,
  weekKey,
  showSeason5Daily = true,
  headline,
  subline,
}: {
  children: React.ReactNode;
  weekKey?: string;
  /** Hide daily nav when not in season 5 window */
  showSeason5Daily?: boolean;
  headline?: string;
  subline?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const active = resolveActiveNav(pathname, view);

  const navItems = VICTORY_OS_NAV.filter((n) => !n.seasonOnly || showSeason5Daily);

  return (
    <div className={vos.page}>
      <div className="relative space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={vos.eyebrow}>Kelly SOS · Campaign OS</p>
            {headline ? (
              <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-kelly-navy md:text-3xl">{headline}</h1>
            ) : (
              <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-kelly-navy md:text-3xl">Victory OS</h1>
            )}
            {subline ? <p className="mt-1 max-w-2xl font-body text-sm text-kelly-muted">{subline}</p> : null}
          </div>
          <span className={vos.draftBadge}>Internal draft</span>
        </header>

        <nav className={vos.navRail} aria-label="Victory OS">
          {navItems.map((item) => {
            const href = navHref(item.href, weekKey);
            const isActive = item.id === active;
            return (
              <Link key={item.id} href={href} className={isActive ? vos.navPillActive : vos.navPill}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}

export function VictoryOsHero({
  eyebrow,
  title,
  summary,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  summary?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className={vos.hero}>
      <div className={vos.heroGlow} />
      <div className={vos.heroGlowAlt} />
      <div className="relative">
        <p className={vos.eyebrowOnDark}>{eyebrow}</p>
        <h2 className="mt-2 font-heading text-2xl font-bold leading-tight tracking-tight md:text-4xl">{title}</h2>
        {summary ? <p className="mt-4 max-w-3xl font-body text-sm leading-relaxed text-white/85">{summary}</p> : null}
        {children}
        {footer ? <div className="mt-6 flex flex-wrap gap-2">{footer}</div> : null}
      </div>
    </section>
  );
}

export function VictoryOsMetric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span className={`${vos.metricOnDark} ${highlight ? "border-kelly-gold/50 bg-kelly-gold/20" : ""}`}>
      <span className="text-white/55">{label}: </span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

export function VictoryOsGlassCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${vos.glass} ${className}`}>
      {title ? <h3 className="font-heading text-sm font-bold text-kelly-navy">{title}</h3> : null}
      {subtitle ? <p className="mt-0.5 font-body text-[11px] text-kelly-muted">{subtitle}</p> : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </div>
  );
}
