import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Max width + padding for region-level command dashboards. */
export function RegionDashboardShell({ children, className }: Props) {
  return (
    <div className={cn("mx-auto max-w-6xl px-[var(--gutter-x)] py-6 sm:py-8 text-kelly-text", className)}>{children}</div>
  );
}
