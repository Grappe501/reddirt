type Props = {
  title: string;
  bestWhen: string;
  primaryJob: string;
  bestWhenLabel?: string;
  primaryJobLabel?: string;
};

export function TeamLevelCard({
  title,
  bestWhen,
  primaryJob,
  bestWhenLabel = "Best when",
  primaryJobLabel = "Primary job",
}: Props) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-kelly-navy/12 bg-white p-5 shadow-[var(--shadow-soft)] print:break-inside-avoid md:p-6">
      <h3 className="font-heading text-base font-bold text-kelly-navy md:text-lg">{title}</h3>
      <p className="mt-3 font-body text-xs font-bold uppercase tracking-wide text-kelly-text/50">{bestWhenLabel}</p>
      <p className="mt-1 font-body text-sm leading-relaxed text-kelly-text/85">{bestWhen}</p>
      <p className="mt-4 font-body text-xs font-bold uppercase tracking-wide text-kelly-text/50">{primaryJobLabel}</p>
      <p className="mt-1 font-body text-sm font-medium leading-relaxed text-kelly-deep">{primaryJob}</p>
    </div>
  );
}
