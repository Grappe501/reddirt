/**
 * Shared trust-funnel CTA classes — Fortune-50 homepage system aligned with `<Button>`.
 */

export const trustFunnelCtaBase =
  "inline-flex min-h-[48px] items-center justify-center rounded-btn px-6 py-3 text-sm font-bold uppercase tracking-wider transition-[box-shadow,background-color,border-color,filter,transform] duration-normal ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export const trustFunnelCtaPrimary =
  `${trustFunnelCtaBase} bg-gradient-to-b from-kelly-gold to-[#b8872f] text-kelly-navy shadow-[var(--shadow-gold-cta)] ring-1 ring-kelly-gold/40 ring-inset hover:brightness-105 hover:shadow-[0_10px_32px_rgba(202,145,61,0.42)] focus-visible:outline-kelly-navy`;

export const trustFunnelCtaNavy =
  `${trustFunnelCtaBase} bg-kelly-navy text-white shadow-[var(--shadow-soft)] hover:bg-kelly-blue focus-visible:outline-kelly-gold`;

export const trustFunnelCtaOutline =
  `${trustFunnelCtaBase} border-2 border-kelly-navy/20 bg-white/90 text-kelly-navy backdrop-blur-sm hover:border-kelly-gold hover:shadow-[var(--shadow-soft)] focus-visible:outline-kelly-navy`;

export const trustFunnelCtaOutlineOnDark =
  `${trustFunnelCtaBase} border-2 border-white/70 bg-kelly-navy text-white hover:border-kelly-gold hover:bg-kelly-navy/90 focus-visible:outline-kelly-gold`;

/** Soft card chrome used across homepage evidence / pillar cards */
export const trustFunnelCardClass =
  "overflow-hidden rounded-card border border-kelly-ink/8 bg-white/95 shadow-[var(--shadow-premium)] transition-[box-shadow,transform] duration-normal hover:shadow-[var(--shadow-card)]";

export const trustFunnelCardMutedClass =
  "overflow-hidden rounded-card border border-kelly-ink/8 bg-kelly-fog/50 shadow-[var(--shadow-soft)] transition-[box-shadow] duration-normal hover:shadow-[var(--shadow-card)]";
