import type { ReactNode } from "react";

const styles: Record<"neutral" | "accent" | "warn" | "muted", string> = {
  neutral: "border-kelly-text/20 bg-kelly-page text-kelly-slate",
  accent: "border-kelly-muted/30 bg-kelly-muted/10 text-kelly-slate",
  warn: "border-amber-200/60 bg-amber-50/80 text-amber-950/90",
  muted: "border-kelly-text/10 bg-white/80 text-kelly-text/55",
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
