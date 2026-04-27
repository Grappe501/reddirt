import Link from "next/link";
import type { RegionPage } from "@/content/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/organizing/StatusBadge";

export function LocalRegionCard({ region, className }: { region: RegionPage; className?: string }) {
  const href = `/local-organizing/${region.slug}`;
  const isPlaceholder = region.status === "coming_soon";

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col justify-between rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] transition duration-normal hover:-translate-y-1 hover:border-kelly-navy/35 hover:shadow-[var(--shadow-card)] md:p-7",
        className,
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-xl font-bold text-kelly-text group-hover:text-kelly-navy lg:text-2xl">
            {region.name}
          </h3>
          <StatusBadge status={region.status} />
        </div>
        <p className="mt-1 font-body text-xs font-semibold uppercase tracking-wider text-kelly-text/50">
          {region.region}
        </p>
        <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/75">{region.summary}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-kelly-navy">
        {isPlaceholder ? "Preview the page" : "Open local hub"}
        <span aria-hidden className="transition group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
