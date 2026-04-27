import { cn } from "@/lib/utils";

type StatelessFormCardProps = {
  title: string;
  description?: string;
  footnote?: string;
  children: React.ReactNode;
  className?: string;
};

export function StatelessFormCard({
  title,
  description,
  footnote,
  children,
  className,
}: StatelessFormCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-8",
        className,
      )}
    >
      <h2 className="font-heading text-2xl font-bold text-kelly-text">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-kelly-text/75">
          {description}
        </p>
      ) : null}
      <div className="mt-8">{children}</div>
      {footnote ? (
        <p className="mt-6 border-t border-kelly-text/10 pt-4 font-body text-sm leading-relaxed text-kelly-text/60">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}
