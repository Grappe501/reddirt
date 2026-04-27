import { cn } from "@/lib/utils";

const variants = {
  /** Default page wash */
  default: "bg-kelly-page text-kelly-text",
  /** Dark text color as background band (footer-style blocks) */
  "ink-band": "bg-kelly-text text-kelly-page",
  /** Muted slate band */
  "muted-band": "bg-kelly-muted text-kelly-page",
  /** Success / positive band */
  "success-band": "bg-kelly-success text-kelly-page",
  "gold-band": "bg-kelly-gold/35 text-kelly-text",
  "primary-band": "bg-kelly-navy text-kelly-white",
  subtle: "bg-kelly-text/[0.04] text-kelly-text",
  elevated: "bg-[var(--color-surface-elevated)] text-kelly-text",
  "band-navy": "bg-kelly-navy text-kelly-mist",
  "band-fog": "bg-kelly-fog text-kelly-ink",
  "band-blue": "bg-kelly-blue text-kelly-mist",
} as const;

export type FullBleedVariant = keyof typeof variants;

/** Light bands get a soft gold/blue mesh so pages feel less flat. */
const MESH_VARIANTS = new Set<FullBleedVariant>(["default", "subtle", "elevated", "gold-band", "band-fog", "band-blue"]);

type FullBleedSectionProps = {
  variant?: FullBleedVariant;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
  /** When false, children are not wrapped in extra padding (you manage spacing). */
  padY?: boolean;
  id?: string;
  "aria-labelledby"?: string;
};

export function FullBleedSection({
  variant = "default",
  padY = true,
  className,
  innerClassName,
  children,
  id,
  "aria-labelledby": ariaLabelledBy,
}: FullBleedSectionProps) {
  const showMesh = MESH_VARIANTS.has(variant);
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "relative w-full overflow-hidden",
        variants[variant],
        padY && "py-section-y lg:py-section-y-lg",
        className,
      )}
    >
      {showMesh ? <div className="wow-section-mesh" aria-hidden /> : null}
      <div className={cn("relative z-[1] w-full", innerClassName)}>{children}</div>
    </section>
  );
}
