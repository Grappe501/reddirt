import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  children: ReactNode;
  badge?: string;
  className?: string;
};

export function PowerOf5StepCard({ title, children, badge = "Demo / preview", className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-kelly-text/10 bg-kelly-page/95 p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">{title}</h3>
        <span className="shrink-0 rounded-full border border-kelly-gold/40 bg-kelly-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-kelly-navy/90">
          {badge}
        </span>
      </div>
      <div className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">{children}</div>
    </div>
  );
}
