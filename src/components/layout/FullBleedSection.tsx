import { cn } from "@/lib/utils";

const variants = {
  /** Explicit ink so nested content never inherits a light-on-light or wrong tone from upstream. */
  default: "bg-cream-canvas text-deep-soil",
  soil: "bg-deep-soil text-cream-canvas",
  denim: "bg-washed-denim text-cream-canvas",
  green: "bg-field-green text-cream-canvas",
  "gold-band": "bg-sunlight-gold/35 text-deep-soil",
  "primary-band": "bg-red-dirt text-cream-canvas",
  subtle: "bg-deep-soil/[0.04] text-deep-soil",
  elevated: "bg-[var(--color-surface-elevated)] text-deep-soil",
  /** Premium homepage: deep civic field */
  "civic-midnight": "bg-civic-midnight text-civic-mist",
  "civic-fog": "bg-civic-fog text-civic-ink",
  "civic-blue": "bg-civic-blue text-civic-mist",
} as const;

export type FullBleedVariant = keyof typeof variants;

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
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "relative w-full",
        variants[variant],
        padY && "py-section-y lg:py-section-y-lg",
        className,
      )}
    >
      <div className={cn("w-full", innerClassName)}>{children}</div>
    </section>
  );
}
