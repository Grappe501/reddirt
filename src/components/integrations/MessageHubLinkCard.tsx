"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title: string;
  description: ReactNode;
  href?: string;
  linkLabel?: string;
};

/**
 * Cross-links public surfaces to the message hub (`/messages`) — demo copy only, no I/O.
 */
export function MessageHubLinkCard({
  className,
  title,
  description,
  href = "/messages",
  linkLabel = "Open message hub (What to Say)",
}: Props) {
  return (
    <aside className={cn(countyDashboardCardClass, "border-l-4 border-l-kelly-gold/70 p-4 sm:p-5", className)}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-slate/70">Message hub</p>
      <h2 className="font-heading mt-1 text-lg font-bold text-kelly-navy">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-kelly-text/80">{description}</div>
      <p className="mt-4">
        <Link
          href={href}
          className="inline-flex rounded-lg bg-kelly-navy px-4 py-2 text-sm font-bold text-white hover:bg-kelly-navy/90"
        >
          {linkLabel}
        </Link>
      </p>
    </aside>
  );
}
