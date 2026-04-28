import { cn } from "@/lib/utils";

/** How the heading pairs with its parent surface (see FullBleed variants, CTASection). */
export type SectionHeadingTone = "default" | "onNavy" | "onSaturatedBand";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
  className?: string;
  id?: string;
  /**
   * - `default`: light page body — navy gradient title, navy eyebrow.
   * - `onNavy`: `primary-band` / solid navy — white copy (ignores dark-mode token flips on the title).
   * - `onSaturatedBand`: ink / muted / success — `text-kelly-page` solids (tokens flip correctly in dark mode).
   */
  tone?: SectionHeadingTone;
};

const titleGradientDefault =
  "bg-gradient-to-r from-kelly-ink from-[8%] via-kelly-navy/95 to-kelly-slate bg-clip-text text-transparent";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  as: Comp = "h2",
  className,
  id,
  tone = "default",
}: SectionHeadingProps) {
  const eyebrowRowClass =
    tone === "default"
      ? "text-[0.7rem] text-kelly-navy/90 sm:text-xs sm:tracking-[0.22em]"
      : "text-[0.7rem] text-kelly-gold/95 sm:text-xs sm:tracking-[0.22em]";
  const eyebrowLabelClass = tone === "default" ? "text-kelly-navy" : "text-kelly-gold";
  const titleClass =
    tone === "default"
      ? titleGradientDefault
      : tone === "onNavy"
        ? "text-white [text-shadow:0_1px_2px_rgba(0,0,40,0.35)]"
        : "text-kelly-page";
  const subtitleClass =
    tone === "default"
      ? "text-kelly-text/80"
      : tone === "onNavy"
        ? "text-white/90"
        : "text-kelly-page/85";

  return (
    <header
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        align === "left" && "text-left",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 flex items-center gap-2.5 font-body font-bold uppercase tracking-[0.2em] sm:mb-4 sm:gap-3",
            eyebrowRowClass,
            align === "center" && "justify-center",
          )}
        >
          <span
            className="h-0.5 w-10 shrink-0 rounded-full bg-gradient-to-r from-kelly-gold to-kelly-gold/30"
            aria-hidden
          />
          <span className={eyebrowLabelClass}>{eyebrow}</span>
        </p>
      ) : null}
      <Comp
        id={id}
        className={cn(
          "font-heading text-2xl font-bold tracking-tight sm:text-3xl sm:tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.12] [text-wrap:balance]",
          titleClass,
        )}
      >
        {title}
      </Comp>
      {subtitle ? (
        <p
          className={cn(
            "mt-3 max-w-2xl font-body text-base leading-relaxed sm:mt-4 sm:text-lg lg:text-xl lg:leading-relaxed",
            subtitleClass,
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
