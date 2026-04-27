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
        <p className="mb-3 font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/90">
          {eyebrow}
        </p>
      ) : null}
      <Comp
        id={id}
        className="font-heading text-3xl font-bold tracking-tight text-kelly-text sm:text-4xl lg:text-[2.75rem] lg:leading-tight"
      >
        {title}
      </Comp>
      {subtitle ? (
        <p className="mt-4 font-body text-lg leading-relaxed text-kelly-text/80 lg:text-xl">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
