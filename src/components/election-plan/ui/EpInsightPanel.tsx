import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "compact";
};

/** Enterprise insight / orientation panel — Kelly summaries, page briefs. */
export function EpInsightPanel({ label = "In one sentence", children, className, variant = "default" }: Props) {
  return (
    <article className={cn("ep-insight", variant === "compact" && "ep-insight-compact", className)}>
      <p className="ep-insight-label">{label}</p>
      <div className="ep-insight-body">{children}</div>
    </article>
  );
}
