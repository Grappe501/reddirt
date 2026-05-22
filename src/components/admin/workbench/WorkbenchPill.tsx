import type { ReactNode } from "react";

const styles: Record<"neutral" | "accent" | "warn" | "muted", string> = {
  neutral: "border-kelly-border bg-kelly-page text-kelly-subtle",
  accent: "border-kelly-navy/20 bg-kelly-mist text-kelly-navy",
  warn: "border-amber-300 bg-amber-50 text-amber-950",
  muted: "border-kelly-border bg-[var(--color-surface-elevated)] text-kelly-muted",
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
