import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SlideFrame({
  eyebrow,
  title,
  speaker,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  speaker?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("kickoff-slide space-y-8", className)}>
      <header className="space-y-3">
        {eyebrow ? (
          <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[var(--kelly-official-gold)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-4xl font-heading text-3xl font-bold leading-[1.1] tracking-tight text-[var(--kelly-official-navy)] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {speaker ? (
          <p className="font-body text-sm text-[var(--color-secondary)]">
            Speaker: <span className="font-semibold text-[var(--color-text-primary)]">{speaker}</span>
          </p>
        ) : null}
      </header>
      <div className="space-y-6 font-body text-base leading-relaxed text-[var(--color-secondary)] sm:text-lg">
        {children}
      </div>
    </article>
  );
}

export function KickoffCard({
  title,
  children,
  className,
  accent,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-premium)] border border-[var(--color-border-subtle)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6",
        accent && "border-[var(--kelly-official-gold)]/50 ring-1 ring-[var(--kelly-official-gold)]/30",
        className,
      )}
    >
      {title ? (
        <h2 className="font-heading text-lg font-bold text-[var(--kelly-official-navy)] sm:text-xl">{title}</h2>
      ) : null}
      <div
        className={cn(
          "space-y-2 text-[0.95rem] leading-relaxed text-[var(--color-secondary)]",
          title && "mt-3",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function KickoffCtaLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
}) {
  const styles =
    variant === "primary"
      ? "bg-[var(--kelly-official-gold)] text-[var(--kelly-official-navy)] shadow-[var(--shadow-gold-cta)]"
      : variant === "secondary"
        ? "bg-[var(--kelly-official-navy)] text-white"
        : "border-2 border-[var(--kelly-official-navy)]/25 bg-transparent text-[var(--kelly-official-navy)]";
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-btn px-5 py-3 text-sm font-bold transition hover:brightness-105",
        styles,
      )}
    >
      {children}
    </Link>
  );
}
