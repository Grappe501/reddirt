import type { RegionStatus } from "@/content/types";
import { cn } from "@/lib/utils";

const copy: Record<RegionStatus, string> = {
  active: "Active",
  building: "Building",
  coming_soon: "Coming soon",
};

const styles: Record<RegionStatus, string> = {
  active: "border-kelly-success/40 bg-kelly-success/15 text-kelly-text",
  building: "border-kelly-gold/45 bg-kelly-gold/15 text-kelly-text",
  coming_soon: "border-kelly-text/20 bg-kelly-text/[0.06] text-kelly-text/80",
};

export function StatusBadge({ status, className }: { status: RegionStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-body text-[11px] font-bold uppercase tracking-[0.18em]",
        styles[status],
        className,
      )}
    >
      {copy[status]}
    </span>
  );
}
