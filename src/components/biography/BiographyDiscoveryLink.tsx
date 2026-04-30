import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "soft";

type Props = {
  tone?: Tone;
  href?: string;
  children: ReactNode;
  /** Screen reader / title context */
  label?: string;
};

const toneClass: Record<Tone, string> = {
  primary:
    "border-kelly-gold/55 bg-kelly-wash/80 text-kelly-navy shadow-[var(--shadow-soft)] hover:border-kelly-gold hover:bg-kelly-gold/10",
  secondary: "border-kelly-text/15 bg-[var(--color-surface-elevated)] text-kelly-navy hover:border-kelly-gold/40",
  soft: "border-transparent text-kelly-navy underline decoration-kelly-navy/25 underline-offset-4 hover:decoration-kelly-gold",
};

/**
 * Earned-path link into /biography — discovery tone, not megaphone promo.
 */
export function BiographyDiscoveryLink({
  tone = "soft",
  href = "/biography",
  children,
  label,
}: Props) {
  if (tone === "soft") {
    return (
      <p className="font-body text-sm text-kelly-text/85">
        <Link href={href} className={cn("font-semibold transition", toneClass.soft)} aria-label={label}>
          {children}
        </Link>
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-card border px-5 py-4 transition",
        tone === "primary" ? toneClass.primary : toneClass.secondary,
      )}
    >
      <Link href={href} className="group block font-body text-sm font-semibold leading-snug text-kelly-navy" aria-label={label}>
        <span className="group-hover:text-kelly-blue">{children}</span>
        <span className="mt-1 block text-xs font-normal text-kelly-text/75">Opens the full narrative reading experience.</span>
      </Link>
    </div>
  );
}
