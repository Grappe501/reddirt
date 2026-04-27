import type { ReactNode } from "react";

type Props = {
  overline?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function NarrativeAdminSection({ overline, title, description, children, className }: Props) {
  return (
    <section className={className}>
      {overline ? (
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/45">{overline}</p>
      ) : null}
      <h2 className="font-heading mt-1 text-xl font-bold text-kelly-text">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm text-kelly-text/70">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
