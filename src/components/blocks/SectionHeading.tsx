import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
  className?: string;
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  as: Comp = "h2",
  className,
  id,
}: SectionHeadingProps) {
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
            "mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3 font-body text-[0.7rem] font-bold uppercase tracking-[0.2em] text-kelly-navy/90 sm:text-xs sm:tracking-[0.22em]",
            align === "center" && "justify-center",
          )}
        >
          <span
            className="h-0.5 w-10 shrink-0 rounded-full bg-gradient-to-r from-kelly-gold to-kelly-gold/30"
            aria-hidden
          />
          <span className="text-kelly-navy">{eyebrow}</span>
        </p>
      ) : null}
      <Comp
        id={id}
        className="font-heading text-2xl font-bold tracking-tight sm:text-3xl sm:tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.12] [text-wrap:balance] bg-gradient-to-r from-kelly-ink from-[8%] via-kelly-navy/95 to-kelly-slate bg-clip-text text-transparent"
      >
        {title}
      </Comp>
      {subtitle ? (
        <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-kelly-text/80 sm:mt-4 sm:text-lg lg:text-xl lg:leading-relaxed">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
