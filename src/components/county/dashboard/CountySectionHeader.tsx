import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  overline?: string;
  title: string;
  /** When set, associates the heading with a parent `section` via `aria-labelledby`. */
  titleId?: string;
  description?: ReactNode;
  className?: string;
};

/**
 * Consistent county dashboard section head: overline, title, optional description.
 */
export function CountySectionHeader({ overline, title, titleId, description, className }: Props) {
  return (
    <div className={cn("border-b border-kelly-navy/15 pb-2", className)}>
      {overline ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-slate/85">{overline}</p>
      ) : null}
      <h2 id={titleId} className="font-heading text-xl font-bold tracking-tight text-kelly-navy md:text-2xl">
        {title}
      </h2>
      {description ? <div className="mt-1.5 text-sm text-kelly-text/70">{description}</div> : null}
    </div>
  );
}
