/**
 * Shared trust-funnel CTA classes — keep homepage buttons on one design system.
 * Prefer these (or `<Button>`) over one-off Link styles on the live homepage spine.
 */

export const trustFunnelCtaBase =
  "inline-flex min-h-[48px] items-center justify-center rounded-btn px-6 py-3 text-sm font-bold uppercase tracking-wider transition-[box-shadow,background-color,border-color,filter] duration-normal ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export const trustFunnelCtaPrimary =
  `${trustFunnelCtaBase} bg-kelly-gold text-kelly-navy shadow-[0_4px_16px_rgba(202,145,61,0.28)] hover:bg-kelly-gold-soft hover:shadow-[0_6px_18px_rgba(202,145,61,0.35)] focus-visible:outline-kelly-navy`;

export const trustFunnelCtaNavy =
  `${trustFunnelCtaBase} bg-kelly-navy text-white hover:bg-kelly-blue focus-visible:outline-kelly-gold`;

export const trustFunnelCtaOutline =
  `${trustFunnelCtaBase} border-2 border-kelly-navy/20 bg-white text-kelly-navy hover:border-kelly-gold hover:shadow-md focus-visible:outline-kelly-navy`;

export const trustFunnelCtaOutlineOnDark =
  `${trustFunnelCtaBase} border border-white/30 bg-transparent text-white hover:bg-white/10 focus-visible:outline-kelly-gold`;

/** Soft card chrome used across homepage evidence / pillar cards */
export const trustFunnelCardClass =
  "overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-[var(--shadow-soft)] transition-[box-shadow] duration-normal hover:shadow-[var(--shadow-card)]";

export const trustFunnelCardMutedClass =
  "overflow-hidden rounded-card border border-kelly-ink/10 bg-kelly-fog/40 shadow-[var(--shadow-soft)] transition-[box-shadow] duration-normal hover:shadow-[var(--shadow-card)]";
