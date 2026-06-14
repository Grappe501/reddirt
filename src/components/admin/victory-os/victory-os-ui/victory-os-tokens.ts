/**
 * Victory OS 2026 — shared visual tokens (major style refresh).
 * Glass surfaces, copper accents, mesh hero — used across all Victory OS surfaces.
 */

export const vos = {
  /** Page backdrop with subtle mesh + grid */
  page: "relative min-h-[60vh] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(30,58,95,0.12),transparent)] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,rgba(30,58,95,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.03)_1px,transparent_1px)] after:bg-[size:48px_48px]",
  /** Primary hero — deep navy with copper shimmer */
  hero: "relative overflow-hidden rounded-[1.75rem] border border-kelly-navy/20 bg-gradient-to-br from-[#0c1929] via-kelly-navy to-[#162d4a] p-6 text-white shadow-[0_24px_80px_-12px_rgba(12,25,41,0.45)] md:p-8",
  heroGlow: "pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-kelly-copper/20 blur-3xl",
  heroGlowAlt: "pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-kelly-gold/10 blur-3xl",
  /** Glass card */
  glass: "rounded-2xl border border-white/60 bg-white/75 p-5 shadow-[0_8px_32px_-8px_rgba(12,25,41,0.12)] backdrop-blur-xl",
  glassDark: "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md",
  /** Elevated content card */
  card: "rounded-2xl border border-kelly-text/8 bg-white p-5 shadow-[0_4px_24px_-6px_rgba(12,25,41,0.08)] transition hover:border-kelly-navy/15 hover:shadow-[0_8px_32px_-8px_rgba(12,25,41,0.12)]",
  /** Section label */
  eyebrow: "font-body text-[10px] font-bold uppercase tracking-[0.32em] text-kelly-copper",
  eyebrowOnDark: "font-body text-[10px] font-bold uppercase tracking-[0.32em] text-kelly-copper-bright/90",
  /** Nav rail */
  navRail: "sticky top-0 z-30 flex gap-1 overflow-x-auto rounded-2xl border border-kelly-text/8 bg-white/90 p-1.5 shadow-[0_4px_24px_-8px_rgba(12,25,41,0.1)] backdrop-blur-xl",
  navPill: "shrink-0 rounded-xl px-4 py-2 font-body text-xs font-semibold text-kelly-muted transition hover:bg-kelly-page/80 hover:text-kelly-navy",
  navPillActive: "shrink-0 rounded-xl bg-kelly-navy px-4 py-2 font-body text-xs font-bold text-white shadow-sm",
  /** Buttons */
  btnPrimary: "rounded-full bg-gradient-to-r from-kelly-navy to-[#1e3a5f] px-5 py-2.5 font-body text-xs font-bold text-white shadow-md transition hover:shadow-lg hover:brightness-110 disabled:opacity-50",
  btnSecondary: "rounded-full border border-kelly-text/15 bg-white/90 px-5 py-2.5 font-body text-xs font-bold text-kelly-navy backdrop-blur-sm transition hover:border-kelly-navy/25 hover:bg-white disabled:opacity-50",
  btnCopper: "rounded-full bg-gradient-to-r from-kelly-copper to-kelly-copper-bright px-5 py-2.5 font-body text-xs font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-50",
  /** Metric chip on dark hero */
  metricOnDark: "rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 font-body text-xs backdrop-blur-sm",
  /** Draft badge */
  draftBadge: "rounded-full border border-kelly-copper/40 bg-kelly-copper/15 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-copper-bright",
  draftBadgeOnDark: "rounded-full border border-kelly-gold/40 bg-kelly-gold/15 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-gold-soft",
} as const;

export type VictoryOsNavId = "brief" | "board" | "daily" | "tactics" | "map" | "election-day";

export const VICTORY_OS_NAV: { id: VictoryOsNavId; href: string; label: string; seasonOnly?: boolean }[] = [
  { id: "brief", href: "/admin/mission-brief", label: "Path to Victory" },
  { id: "board", href: "/admin/victory-board", label: "Victory Board" },
  { id: "daily", href: "/admin/daily-brief", label: "Daily brief", seasonOnly: true },
  { id: "tactics", href: "/admin/mission-brief?view=tactics", label: "Tactics" },
  { id: "map", href: "/admin/mission-brief?view=map", label: "Victory Map" },
  { id: "election-day", href: "/admin/election-day", label: "Election Day" },
];
