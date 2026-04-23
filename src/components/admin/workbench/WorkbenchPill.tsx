import type { ReactNode } from "react";

const styles: Record<"neutral" | "accent" | "warn" | "muted", string> = {
  neutral: "border-deep-soil/20 bg-cream-canvas text-civic-slate",
  accent: "border-washed-denim/30 bg-washed-denim/10 text-civic-slate",
  warn: "border-amber-200/60 bg-amber-50/80 text-amber-950/90",
  muted: "border-deep-soil/10 bg-white/80 text-deep-soil/55",
};

/**
 * Small status chip used across workbench/queue UIs (Email Workflow, future queues).
 * Keeps a single class recipe instead of re-copying ad hoc spans.
 */
export function WorkbenchPill({
  children,
  variant = "neutral",
  className = "",
  caps = true,
}: {
  children: ReactNode;
  variant?: keyof typeof styles;
  className?: string;
  /** Default true (queue status chips); set false for sentence case labels. */
  caps?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${caps ? "uppercase" : ""} ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
