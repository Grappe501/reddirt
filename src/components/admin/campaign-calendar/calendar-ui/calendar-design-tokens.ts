/**
 * Campaign Calendar — premium design tokens (2026 command-center refresh).
 * Billion-dollar interface: depth, glass, copper accents, cinematic navy heroes.
 */

export const cal = {
  /** Full-bleed calendar canvas */
  canvas:
    "relative before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(0,0,102,0.09),transparent)] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,rgba(0,0,102,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,102,0.025)_1px,transparent_1px)] after:bg-[size:56px_56px]",
  /** Cinematic hero */
  hero: "relative overflow-hidden rounded-[1.875rem] border border-kelly-navy/15 bg-gradient-to-br from-[#03034d] via-kelly-navy to-[#0a1466] p-6 text-white shadow-[0_32px_100px_-16px_rgba(0,0,80,0.55)] md:p-8 lg:p-10",
  heroGlowGold: "pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-kelly-gold/15 blur-3xl",
  heroGlowSky: "pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-kelly-sky/10 blur-3xl",
  /** Glass surfaces */
  glass: "rounded-2xl border border-white/70 bg-white/80 shadow-[0_12px_40px_-12px_rgba(0,0,102,0.12)] backdrop-blur-xl",
  glassInset: "rounded-2xl border border-kelly-text/6 bg-white/60 shadow-inner backdrop-blur-sm",
  /** View content panel */
  panel: "rounded-[1.5rem] border border-kelly-text/8 bg-white/90 p-4 shadow-[0_8px_32px_-10px_rgba(0,0,102,0.1)] backdrop-blur-md md:p-6",
  /** Navigation rail */
  viewRail:
    "sticky top-0 z-20 flex flex-wrap items-center gap-1 rounded-2xl border border-kelly-text/8 bg-white/92 p-1.5 shadow-[0_8px_32px_-12px_rgba(0,0,102,0.12)] backdrop-blur-xl",
  viewPill: "rounded-xl px-4 py-2.5 font-body text-xs font-semibold text-kelly-muted transition-all hover:bg-kelly-page/90 hover:text-kelly-navy",
  viewPillActive: "rounded-xl bg-gradient-to-r from-kelly-navy to-[#0a1466] px-4 py-2.5 font-body text-xs font-bold text-white shadow-md",
  /** KPI command bar */
  kpiBar: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
  kpiCard:
    "group relative overflow-hidden rounded-2xl border border-kelly-text/8 bg-gradient-to-br from-white to-kelly-page/50 p-4 shadow-[0_4px_20px_-6px_rgba(0,0,102,0.08)] transition hover:border-kelly-gold/30 hover:shadow-[0_8px_28px_-8px_rgba(0,0,102,0.14)]",
  kpiValue: "font-heading text-2xl font-bold tabular-nums tracking-tight text-kelly-navy",
  kpiLabel: "font-body text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-copper",
  /** Month grid */
  monthCell:
    "min-h-[112px] rounded-xl border p-1.5 transition-all md:min-h-[128px] md:p-2",
  monthCellIn: "border-kelly-text/8 bg-white/90 hover:border-kelly-navy/20 hover:shadow-sm",
  monthCellOut: "border-transparent bg-kelly-wash/40 opacity-45",
  monthCellToday: "ring-2 ring-kelly-gold/70 ring-offset-1",
  monthCellElection: "border-kelly-gold/50 bg-gradient-to-br from-kelly-gold/10 to-white",
  /** Timeline */
  timelineSpine: "relative border-l-[3px] border-transparent bg-gradient-to-b from-kelly-navy via-kelly-gold/60 to-kelly-navy bg-clip-padding pl-8",
  timelineDot: "absolute -left-[11px] mt-2 h-5 w-5 rounded-full border-[3px] border-white bg-gradient-to-br from-kelly-navy to-kelly-gold shadow-md",
  /** Buttons */
  btnPrimary:
    "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-kelly-gold to-kelly-copper-bright px-5 py-2.5 font-body text-xs font-bold text-kelly-navy shadow-md transition hover:brightness-105 hover:shadow-lg",
  btnSecondary:
    "inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-2.5 font-body text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20",
  btnGhost:
    "inline-flex items-center justify-center rounded-full border border-kelly-text/12 bg-white px-4 py-2 font-body text-xs font-bold text-kelly-navy transition hover:border-kelly-navy/25 hover:bg-kelly-page/80",
  btnNav: "flex h-9 w-9 items-center justify-center rounded-full border border-kelly-text/12 bg-white font-bold text-kelly-navy transition hover:border-kelly-navy/30 hover:bg-kelly-page",
  /** Typography */
  eyebrow: "font-body text-[10px] font-bold uppercase tracking-[0.34em] text-kelly-gold-soft",
  eyebrowDark: "font-body text-[10px] font-bold uppercase tracking-[0.34em] text-kelly-gold/90",
  /** Event chip accent colors — left border + subtle fill */
  eventType: {
    house_meet_greet: "border-l-violet-500 bg-gradient-to-r from-violet-50/90 to-white",
    campaign_event: "border-l-kelly-navy bg-gradient-to-r from-kelly-navy/[0.06] to-white",
    fair_festival: "border-l-kelly-gold bg-gradient-to-r from-amber-50/90 to-white",
    fundraiser: "border-l-emerald-600 bg-gradient-to-r from-emerald-50/90 to-white",
    travel: "border-l-slate-500 bg-gradient-to-r from-slate-50/90 to-white",
    default: "border-l-kelly-slate bg-gradient-to-r from-kelly-wash to-white",
  } as Record<string, string>,
} as const;

export const CALENDAR_VIEWS = [
  { id: "month", label: "Month", href: "/admin/campaign-calendar/month", desc: "Grid overview" },
  { id: "timeline", label: "Timeline", href: "/admin/campaign-calendar/timeline", desc: "Path to Election Day" },
  { id: "week", label: "Week", href: "/admin/campaign-calendar/week", desc: "7-day operations" },
  { id: "day", label: "Day", href: "/admin/campaign-calendar/day", desc: "Kelly's day" },
  { id: "agenda", label: "Agenda", href: "/admin/campaign-calendar/agenda", desc: "Sortable ledger" },
] as const;

export const CALENDAR_QUICK_LINKS = [
  { label: "Kelly cockpit", href: "/admin/calendar-command-center/kelly" },
  { label: "Monday brief", href: "/admin/mission-brief" },
  { label: "Sync dashboard", href: "/admin/campaign-events/calendar-sync" },
  { label: "Calendar HQ", href: "/admin/workbench/calendar" },
] as const;
