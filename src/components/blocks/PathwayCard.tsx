"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { trackPathwaySelect } from "@/lib/analytics/track";

type PathwayCardProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
  className?: string;
};

export function PathwayCard({
  title,
  description,
  href,
  ctaLabel = "Learn more",
  className,
}: PathwayCardProps) {
  return (
    <Link
      href={href}
      onClick={() => trackPathwaySelect(title)}
      className={cn(
        "group flex h-full flex-col justify-between rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] transition duration-normal hover:-translate-y-1 hover:border-kelly-navy/35 hover:shadow-[var(--shadow-card)] md:p-8",
        className,
      )}
    >
      <div>
        <h3 className="font-heading text-xl font-bold text-kelly-text group-hover:text-kelly-navy lg:text-2xl">
          {title}
        </h3>
        <p className="mt-3 font-body text-base leading-relaxed text-kelly-text/75">{description}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-kelly-navy">
        {ctaLabel}
        <span aria-hidden className="transition group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
