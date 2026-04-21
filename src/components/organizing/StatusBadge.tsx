import type { RegionStatus } from "@/content/types";
import { cn } from "@/lib/utils";

const copy: Record<RegionStatus, string> = {
  active: "Active",
  building: "Building",
  coming_soon: "Coming soon",
};

const styles: Record<RegionStatus, string> = {
  active: "border-field-green/40 bg-field-green/15 text-deep-soil",
  building: "border-sunlight-gold/45 bg-sunlight-gold/15 text-deep-soil",
  coming_soon: "border-deep-soil/20 bg-deep-soil/[0.06] text-deep-soil/80",
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
