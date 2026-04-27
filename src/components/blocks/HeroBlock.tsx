import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type HeroBlockProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
  size?: "home" | "page";
  /** Navy / photo header context (e.g. “The Plan”) */
  variant?: "default" | "onDark";
};

export function HeroBlock({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  align = "left",
  size = "home",
  variant = "default",
}: HeroBlockProps) {
  const onDark = variant === "onDark";
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        size === "home" && "gap-8 lg:gap-10",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "max-w-prose font-body text-xs font-bold uppercase tracking-[0.22em]",
            onDark ? "text-kelly-gold" : "text-kelly-navy",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={cn(
          "font-heading font-bold tracking-tight",
          onDark ? "text-kelly-mist" : "text-kelly-text",
          size === "home" &&
            "max-w-[22ch] text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.05] lg:max-w-[18ch]",
          size === "page" &&
            "max-w-3xl text-[clamp(2rem,4.5vw,3.25rem)] leading-tight",
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <div
          className={cn(
            "max-w-2xl font-body text-lg leading-relaxed lg:text-xl",
            onDark ? "text-kelly-mist/88" : "text-kelly-text/85",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </div>
      ) : null}
      {children ? (
        <div
          className={cn(
            "flex flex-wrap gap-4",
            align === "center" && "justify-center",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
