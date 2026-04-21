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
};

export function HeroBlock({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  align = "left",
  size = "home",
}: HeroBlockProps) {
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
        <p className="max-w-prose font-body text-xs font-bold uppercase tracking-[0.22em] text-red-dirt">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={cn(
          "font-heading font-bold tracking-tight text-deep-soil",
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
            "max-w-2xl font-body text-lg leading-relaxed text-deep-soil/85 lg:text-xl",
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
