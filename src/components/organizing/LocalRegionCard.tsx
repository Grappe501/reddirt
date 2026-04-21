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
        "group flex h-full flex-col justify-between rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] transition duration-normal hover:-translate-y-1 hover:border-red-dirt/35 hover:shadow-[var(--shadow-card)] md:p-7",
        className,
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-xl font-bold text-deep-soil group-hover:text-red-dirt lg:text-2xl">
            {region.name}
          </h3>
          <StatusBadge status={region.status} />
        </div>
        <p className="mt-1 font-body text-xs font-semibold uppercase tracking-wider text-deep-soil/50">
          {region.region}
        </p>
        <p className="mt-4 font-body text-base leading-relaxed text-deep-soil/75">{region.summary}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-red-dirt">
        {isPlaceholder ? "Preview the page" : "Open local hub"}
        <span aria-hidden className="transition group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
